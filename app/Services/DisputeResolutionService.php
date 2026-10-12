<?php

namespace App\Services;

use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\DisputedStatus;
use App\Enums\Casts\LogsStatus;
use App\Enums\Casts\UserStatus;
use App\Enums\Casts\UserWarningType;
use App\Enums\Casts\WalletTransactionType;
use App\Exceptions\WalletException;
use App\Models\Booking;
use App\Models\Dispute;
use App\Models\Log;
use App\Models\Review;
use App\Models\User;
use App\Models\UserWarning;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class DisputeResolutionService
{
  public function __construct(
    private WalletService $walletService,
  ) {}

  /**
   * حل و فصل اعتراض
   */
  public function resolve(
    Dispute $dispute,
    string $decision,
    string $resolution,
    User $admin,
    ?float $adminRefundAmount = null,
    ?float $adminPenaltyAmount = null,
    ?float $adminCompensationAmount = null,
  ): Dispute {
    $booking = $dispute->booking;

    return DB::transaction(function () use (
      $dispute,
      $booking,
      $decision,
      $resolution,
      $admin,
      $adminRefundAmount,
      $adminPenaltyAmount,
      $adminCompensationAmount,
    ) {
      if ($decision === 'approve') {
        return $this->approve(
          $dispute,
          $booking,
          $resolution,
          $admin,
          $adminRefundAmount,
          $adminPenaltyAmount,
          $adminCompensationAmount,
        );
      }

      return $this->reject($dispute, $booking, $resolution, $admin);
    });
  }

  /**
   * تایید اعتراض
   */
  private function approve(
    Dispute $dispute,
    Booking $booking,
    string $resolution,
    User $admin,
    ?float $adminRefundAmount,
    ?float $adminPenaltyAmount,
    ?float $adminCompensationAmount,
  ): Dispute {
    // ============ ۰) چک امنیتی ============
    if (!in_array($dispute->status->value, [
      DisputedStatus::pending->value,
      DisputedStatus::investigating->value,
      DisputedStatus::awaitingResponse->value,
    ])) {
      throw new \RuntimeException('این اعتراض قبلاً بررسی شده است.');
    }

    // ============ ۱) محاسبه مبالغ ============
    $refundAmount = $this->calculateRefundAmount(
      $dispute,
      $booking,
      $adminRefundAmount,
    );

    $penaltyAmount = $this->calculatePenaltyAmount(
      $dispute,
      $booking,
      $adminPenaltyAmount,
    );

    $compensationAmount = $this->calculateCompensationAmount(
      $dispute,
      $booking,
      $adminCompensationAmount,
    );

    // ============ ۲) آپدیت اعتراض ============
    $dispute->update([
      'status'              => DisputedStatus::resolved->value,
      'resolution'          => $resolution,
      'resolved_by_user_id' => $admin->id,
      'resolved_at'         => now(),
      'refund_amount'       => $refundAmount,
      'penalty_amount'      => $penaltyAmount,
      'compensation_amount' => $compensationAmount,
    ]);

    // ============ ۳) اعمال مالی ============

    // ۳.۱) اگه اعتراض مشتری تایید شد → بازگشت وجه
    if ($refundAmount > 0) {
      // اول از درآمد قفل‌شده آرایشگر (اگه هست) کم کن
      $this->reverseBarberEarning($booking, $refundAmount);

      $this->releaseRemainingEarning($booking, $refundAmount);

      // بعد به مشتری برگردون
      $this->walletService->refund(
        user: $booking->user,
        amount: $refundAmount,
        description: "بازگشت وجه رزرو #{$booking->id} - اعتراض #{$dispute->id}",
        reference: $dispute,
        metadata: [
          'booking_id'   => $booking->id,
          'dispute_id'   => $dispute->id,
          'dispute_type' => $dispute->dispute_type->value,
        ],
      );
    }
    // ۳.۲) اگه اعتراض آرایشگر تایید شد (بدون refund) → آزادسازی درآمد
    else {
      // ✅ آزادسازی درآمد آرایشگر (با کسر کمیسیون)
      $this->releaseBarberEarning($booking);
    }

    // ۳.۳) جریمه آرایشگر (اگه اعتراض مشتری تایید شد)
    if ($penaltyAmount > 0) {
      $this->chargeBarberPenalty($booking, $penaltyAmount, $dispute);
    }

    // ۳.۴) غرامت به آرایشگر (از مشتری)
    if ($compensationAmount > 0) {
      // کسر از کیف پول مشتری
      $this->walletService->penalize(
        user: $booking->user,
        amount: $compensationAmount,
        description: "غرامت به آرایشگر بابت اعتراض #{$dispute->id}",
        reference: $dispute,
        metadata: [
          'booking_id'   => $booking->id,
          'dispute_id'   => $dispute->id,
          'dispute_type' => $dispute->dispute_type->value,
        ],
      );

      // واریز به آرایشگر (بدون قفل، چون غرامت فوریه)
      $this->walletService->credit(
        user: $booking->barber,
        amount: $compensationAmount,
        type: WalletTransactionType::earning,
        description: "دریافت غرامت از مشتری بابت اعتراض #{$dispute->id}",
        reference: $dispute,
        metadata: [
          'booking_id'   => $booking->id,
          'dispute_id'   => $dispute->id,
          'dispute_type' => $dispute->dispute_type->value,
        ],
      );
    }

    // ============ ۴) اثرات غیرمالی ============
    $this->applyNonFinancialEffects($dispute, $booking, $admin);

    // ============ ۵) تغییر وضعیت رزرو ============
    if ($refundAmount > 0) {
      $booking->update([
        'status'       => BookingStatus::cancelled->value,
        'cancelled_at' => now(),
        'cancelled_by' => 'admin',
      ]);
    } elseif ($booking->status->value !== BookingStatus::completed->value) {
      $booking->update([
        'status'       => BookingStatus::completed->value,
        'completed_at' => now(),
        'completed_by' => 'admin',
      ]);
    }

    return $dispute->fresh();
  }

  /**
   * رد اعتراض
   */
  private function reject(
    Dispute $dispute,
    Booking $booking,
    string $resolution,
    User $admin,
  ): Dispute {
    // ============ ۱) آپدیت اعتراض ============
    $dispute->update([
      'status'              => DisputedStatus::rejected->value,
      'resolution'          => $resolution,
      'resolved_by_user_id' => $admin->id,
      'resolved_at'         => now(),
      'refund_amount'       => 0,
      'penalty_amount'      => 0,
      'compensation_amount' => 0,
    ]);

    // ============ ۲) آپدیت رزرو ============
    if ($booking->status->value !== BookingStatus::completed->value) {
      $booking->update([
        'status'       => BookingStatus::completed->value,
        'completed_at' => now(),
        'completed_by' => 'admin',
      ]);
    }

    // ============ ۳) آزادسازی درآمد آرایشگر (با کسر کمیسیون) ============
    $this->releaseBarberEarning($booking);

    return $dispute->fresh();
  }

    // ============================================
    // عملیات مالی روی آرایشگر
    // ============================================

  /**
   * جریمه آرایشگر
   * ✅ فقط از balance (چون locked برای درآمد و برداشته)
   */
  private function chargeBarberPenalty(
    Booking $booking,
    float $penaltyAmount,
    Dispute $dispute,
  ): void {
    $wallet = $booking->barber->wallet;

    if (!$wallet) {
      throw new WalletException('کیف پول آرایشگر یافت نشد.');
    }

    $balance = (float) $wallet->balance;

    // ✅ فقط از balance کم کن
    if ($balance < $penaltyAmount) {
      throw new WalletException(
        'موجودی آرایشگر برای جریمه کافی نیست. ' .
          'موجودی قابل استفاده: ' .
          number_format($balance) .
          ' تومان'
      );
    }

    $this->walletService->penalize(
      user: $booking->barber,
      amount: $penaltyAmount,
      description: "جریمه اعتراض #{$dispute->id} - رزرو #{$booking->id}",
      reference: $dispute,
      metadata: [
        'booking_id'   => $booking->id,
        'dispute_id'   => $dispute->id,
        'dispute_type' => $dispute->dispute_type->value,
        'source'       => 'balance',
      ],
    );
  }

  /**
   * برگرداندن درآمد آرایشگر (وقتی اعتراض مشتری تایید شد)
   * ✅ پول هنوز توی locked هست (بعد از تکمیل رزرو)
   */
  private function reverseBarberEarning(Booking $booking, float $refundAmount): void
  {
    $earningTransaction = WalletTransaction::where('reference_type', Booking::class)
      ->where('reference_id', $booking->id)
      ->where('user_id', $booking->barber_id)
      ->where('type', WalletTransactionType::earning->value)
      ->first();

    if (!$earningTransaction) {
      return;
    }

    // ✅ مبلغ برگشتی محدود به درآمد همون رزرو
    $amountToReverse = min($refundAmount, (float) $earningTransaction->amount);

    if ($amountToReverse <= 0) {
      return;
    }

    if ($earningTransaction->is_locked && !$earningTransaction->released_at) {
      // ✅ پول هنوز توی locked هست → از locked کم کن
      $this->walletService->debitLocked(
        user: $booking->barber,
        amount: $amountToReverse,
        type: WalletTransactionType::refund,
        description: "برگشت درآمد رزرو #{$booking->id} - اعتراض تایید شد",
        reference: $booking,
        metadata: [
          'booking_id'          => $booking->id,
          'original_earning_id' => $earningTransaction->id,
          'source'              => 'locked_balance',
        ],
      );
    } else {
      // ⚠️ پول آزاد شده → از balance کم کن
      $this->walletService->debit(
        user: $booking->barber,
        amount: $amountToReverse,
        type: WalletTransactionType::refund,
        description: "برگشت درآمد رزرو #{$booking->id} - اعتراض تایید شد (از balance)",
        reference: $booking,
        metadata: [
          'booking_id'          => $booking->id,
          'original_earning_id' => $earningTransaction->id,
          'source'              => 'balance',
        ],
      );
    }
  }

  /**
   * آزادسازی درآمد قفل‌شده آرایشگر
   * ✅ با کسر کمیسیون (توی releaseLocked)
   */
  private function releaseBarberEarning(Booking $booking): void
  {
    $transactions = WalletTransaction::where('reference_type', Booking::class)
      ->where('reference_id', $booking->id)
      ->where('user_id', $booking->barber_id)
      ->where('type', WalletTransactionType::earning->value)
      ->where('is_locked', true)
      ->whereNull('released_at')
      ->get();

    foreach ($transactions as $transaction) {
      // ✅ releaseLocked خودش کمیسیون کسر میکنه
      $this->walletService->releaseLocked($transaction);
    }
  }

  // ============================================
  // محاسبات
  // ============================================

  private function calculateRefundAmount(
    Dispute $dispute,
    Booking $booking,
    ?float $adminAmount,
  ): float {
    $disputeType = $dispute->dispute_type;

    if (!$disputeType->hasRefund()) {
      return 0;
    }

    if ($adminAmount !== null && $adminAmount >= 0) {
      return min($adminAmount, (float) $booking->amount);
    }

    $rate = $disputeType->suggestedRefundRate();

    return round((float) $booking->amount * $rate);
  }

  private function calculatePenaltyAmount(
    Dispute $dispute,
    Booking $booking,
    ?float $adminAmount,
  ): float {
    $disputeType = $dispute->dispute_type;

    if (!$disputeType->hasPenalty()) {
      return 0;
    }

    if ($adminAmount !== null && $adminAmount >= 0) {
      return min($adminAmount, (float) $booking->amount);
    }

    $rate = $disputeType->suggestedPenaltyRate();

    return round((float) $booking->amount * $rate);
  }

  private function calculateCompensationAmount(
    Dispute $dispute,
    Booking $booking,
    ?float $adminAmount,
  ): float {
    $disputeType = $dispute->dispute_type;

    if (!$disputeType->hasCompensation()) {
      return 0;
    }

    if ($adminAmount !== null && $adminAmount >= 0) {
      return min($adminAmount, (float) $booking->amount);
    }

    $rate = $disputeType->suggestedCompensationRate();

    return round((float) $booking->amount * $rate);
  }

  // ============================================
  // Preview برای فرم ادمین
  // ============================================

  public function previewAmounts(Dispute $dispute): array
  {
    $booking = $dispute->booking;
    $disputeType = $dispute->dispute_type;

    return [
      'suggested_refund'        => $this->calculateRefundAmount($dispute, $booking, null),
      'suggested_penalty'       => $this->calculatePenaltyAmount($dispute, $booking, null),
      'suggested_compensation'  => $this->calculateCompensationAmount($dispute, $booking, null),

      'has_refund'              => $disputeType->hasRefund(),
      'has_penalty'             => $disputeType->hasPenalty(),
      'has_compensation'        => $disputeType->hasCompensation(),

      'suggested_refund_rate'       => $disputeType->suggestedRefundRate(),
      'suggested_penalty_rate'      => $disputeType->suggestedPenaltyRate(),
      'suggested_compensation_rate' => $disputeType->suggestedCompensationRate(),

      'dispute_type'            => $disputeType->value,
      'dispute_type_label'      => $disputeType->label(),
      'disputed_by'             => $disputeType->disputedBy(),
      'booking_amount'          => (float) $booking->amount,
    ];
  }

  // ============================================
  // اثرات غیرمالی
  // ============================================

  private function applyNonFinancialEffects(
    Dispute $dispute,
    Booking $booking,
    User $admin,
  ): void {
    match ($dispute->dispute_type->value) {
      'false_review'  => $this->handleFalseReview($booking, $dispute, $admin),
      'customer_rude' => $this->handleCustomerRude($booking->user, $dispute, $admin),
      default         => null,
    };
  }

  private function handleFalseReview(
    Booking $booking,
    Dispute $dispute,
    User $admin,
  ): void {
    $review = $booking->review;

    if (!$review) {
      return;
    }

    $review->update([
      'status'           => \App\Enums\Casts\ReviewStatus::rejected->value,
      'moderated_by'     => $admin->id,
      'moderated_at'     => now(),
      'rejection_reason' => 'false_review_dispute_approved',
      'moderation_note'  => "نظر به دلیل تایید اعتراض #{$dispute->id} حذف شد",
    ]);

    $review->delete();

    $this->recalculateBarberRating($booking->barber);

    (new Log())->storeLog(
      $booking->barber_id,
      LogsStatus::delete->value . 'false_review_removed',
      "نظر نادرست رزرو #{$booking->id} حذف شد - اعتراض #{$dispute->id}"
    );
  }

  private function recalculateBarberRating(User $barber): void
  {
    $stats = Review::query()
      ->whereHas('booking', function ($q) use ($barber) {
        $q->where('barber_id', $barber->id);
      })
      ->where('status', '!=', \App\Enums\Casts\ReviewStatus::rejected->value)
      ->selectRaw('COUNT(*) as total, COALESCE(SUM(rating), 0) as sum')
      ->first();

    $total = (int) ($stats->total ?? 0);
    $sum   = (int) ($stats->sum ?? 0);

    $barber->update([
      'total_reviews'    => $total,
      'total_rating_sum' => $sum,
      'average_rating'   => $total > 0 ? round($sum / $total, 2) : 0,
    ]);
  }

  private function handleCustomerRude(
    User $customer,
    Dispute $dispute,
    User $admin,
  ): void {
    $warning = UserWarning::create([
      'user_id'    => $customer->id,
      'dispute_id' => $dispute->id,
      'issued_by'  => $admin->id,
      'type'       => UserWarningType::rude_behavior->value,
      'reason'     => $dispute->reason,
      'expires_at' => now()->addMonths(6),
    ]);

    $activeWarningsCount = $customer->activeWarnings()->count();
    $banThreshold = (int) config('disputes.ban_threshold', 3);

    if ($activeWarningsCount >= $banThreshold) {
      $this->banCustomer(
        $customer,
        "تکرار رفتار نامناسب ({$activeWarningsCount} اخطار فعال)"
      );
    }

    try {
      $customer->notify(
        new \App\Notifications\CustomerWarningIssued($warning)
      );
    } catch (\Throwable $e) {
      \Illuminate\Support\Facades\Log::warning(
        'Failed to send warning notification',
        ['user_id' => $customer->id, 'error' => $e->getMessage()]
      );
    }

    (new Log())->storeLog(
      $warning->id,
      LogsStatus::store->value . 'customer_warning_issued',
      "اخطار به مشتری #{$customer->id} - اعتراض #{$dispute->id}"
    );
  }

  private function banCustomer(User $customer, string $reason): void
  {
    $customer->update([
      'is_active' => false,
      'status'    => UserStatus::BANNED->value,
    ]);

    (new Log())->storeLog(
      $customer->id,
      LogsStatus::store->value . 'customer_banned',
      "مشتری #{$customer->id} بن شد: {$reason}"
    );

    try {
      $customer->notify(new \App\Notifications\CustomerBanned($reason));
    } catch (\Throwable $e) {
      \Illuminate\Support\Facades\Log::warning(
        'Failed to send ban notification',
        ['user_id' => $customer->id, 'error' => $e->getMessage()]
      );
    }
  }

  /**
   * آزادسازی باقیمانده درآمد آرایشگر (بعد از کسر refund)
   *
   * مثال:
   *   رزرو 450,000 → locked = 450,000
   *   refund = 250,000
   *   باقیمانده = 200,000
   *   → کمیسیون روی 200,000
   *   → balance += net
   *   → locked -= 200,000
   */
  private function releaseRemainingEarning(
    Booking $booking,
    float $refundedAmount,
  ): void {
    $earningTransaction = WalletTransaction::where('reference_type', Booking::class)
      ->where('reference_id', $booking->id)
      ->where('user_id', $booking->barber_id)
      ->where('type', WalletTransactionType::earning->value)
      ->first();

    if (!$earningTransaction) {
      return;
    }

    $totalAmount = (float) $earningTransaction->amount;
    $remainingAmount = $totalAmount - $refundedAmount;

    if ($remainingAmount <= 0) {
      $earningTransaction->update([
        'released_at' => now(),
      ]);
      return;
    }

    if ($earningTransaction->released_at) {
      return;
    }

    DB::transaction(function () use (
      $earningTransaction,
      $remainingAmount,
      $booking,
      $refundedAmount,   // ✅ این خط مهمه
    ) {
      $wallet = $earningTransaction->wallet;

      if (!$wallet) {
        throw new WalletException('کیف پول آرایشگر یافت نشد.');
      }

      if ((float) $wallet->locked_balance < $remainingAmount) {
        throw new WalletException(
          'مبلغ قفل‌شده کافی نیست. قفل: ' .
            number_format($wallet->locked_balance)
        );
      }

      // محاسبه کمیسیون
      $commissionService = app(\App\Services\CommissionService::class);
      $calc = $commissionService->calculate(
        amount: $remainingAmount,
        user: $booking->barber,
      );

      $balanceBefore = (float) $wallet->balance;

      // انتقال به balance
      $wallet->locked_balance -= $remainingAmount;
      $wallet->balance += $calc['net'];
      $wallet->last_transaction_at = now();
      $wallet->save();

      // ✅ حالا `$refundedAmount` توی closure قابل دسترسه
      $earningTransaction->update([
        'released_at' => now(),
        'metadata'    => array_merge($earningTransaction->metadata ?? [], [
          'reversed_amount'  => $refundedAmount,
          'remaining_amount' => $remainingAmount,
          'commission'       => $calc['commission'],
          'commission_rate'  => $calc['rate'],
          'net_amount'       => $calc['net'],
          'released_reason'  => 'partial_refund',
          'released_at'      => now()->toIso8601String(),
        ]),
      ]);

      // ثبت کمیسیون
      if ($calc['commission'] > 0) {
        WalletTransaction::create([
          'wallet_id'      => $wallet->id,
          'user_id'        => $wallet->user_id,
          'type'           => WalletTransactionType::commission->value,
          'direction'      => 'debit',
          'amount'         => $calc['commission'],
          'balance_before' => $balanceBefore + $calc['net'],
          'balance_after'  => $balanceBefore + $calc['net'],
          'status'         => 'completed',
          'reference_type' => WalletTransaction::class,
          'reference_id'   => $earningTransaction->id,
          'description'    => "کمیسیون باقیمانده درآمد رزرو #{$booking->id}",
          'metadata'       => [
            'commission_rate'       => $calc['rate'],
            'source_transaction_id' => $earningTransaction->id,
            'reason'                => 'partial_refund',
          ],
        ]);
      }
    });
  }
}
