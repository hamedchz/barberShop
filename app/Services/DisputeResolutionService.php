<?php

namespace App\Services;

use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\DisputedStatus;
use App\Enums\Casts\LogsStatus;
use App\Enums\Casts\WalletTransactionType;
use App\Models\Booking;
use App\Models\Dispute;
use App\Models\Review;
use App\Models\User;
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
    // ============ محاسبه مبالغ ============
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


    // ============ آپدیت اعتراض ============
    $dispute->update([
      'status'              => DisputedStatus::resolved->value,
      'resolution'          => $resolution,
      'resolved_by_user_id' => $admin->id,
      'resolved_at'         => now(),
      'refund_amount'       => $refundAmount,
      'penalty_amount'      => $penaltyAmount,
      // اگه فیلد compensation رو اضافه کردی:
      'compensation_amount' => $compensationAmount,
    ]);

    // 
    $this->applyNonFinancialEffects($dispute, $booking);

    // ============ بازگشت وجه به مشتری ============
    if ($refundAmount > 0) {
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

    // ============ جریمه آرایشگر ============
    if ($penaltyAmount > 0) {
      $this->walletService->penalize(
        user: $booking->barber,
        amount: $penaltyAmount,
        description: "جریمه اعتراض #{$dispute->id} - رزرو #{$booking->id}",
        reference: $dispute,
        metadata: [
          'booking_id'   => $booking->id,
          'dispute_id'   => $dispute->id,
          'dispute_type' => $dispute->dispute_type->value,
        ],
      );
    }

    // ============ غرامت به آرایشگر (از مشتری) ============
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

      // واریز به کیف پول آرایشگر
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

    // ============ تغییر وضعیت رزرو ============
    // فقط وقتی بازگشت وجه داریم رزرو لغو میشه، وگرنه تکمیل میمونه
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
    $dispute->update([
      'status'              => DisputedStatus::rejected->value,
      'resolution'          => $resolution,
      'resolved_by_user_id' => $admin->id,
      'resolved_at'         => now(),
      'refund_amount'       => 0,
      'penalty_amount'      => 0,
    ]);

    if ($booking->status->value !== BookingStatus::completed->value) {
      $booking->update([
        'status'       => BookingStatus::completed->value,
        'completed_at' => now(),
        'completed_by' => 'admin',
      ]);
    }

    return $dispute->fresh();
  }

    // ============================================
    // محاسبات
    // ============================================

  /**
   * محاسبه مبلغ بازگشت به مشتری
   */
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

  /**
   * محاسبه جریمه آرایشگر
   */
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

  /**
   * محاسبه غرامت به آرایشگر (از مشتری)
   */
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

  /**
   * پیشنهاد مبالغ بدون اعمال
   */
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

      'suggested_refund_rate'        => $disputeType->suggestedRefundRate(),
      'suggested_penalty_rate'       => $disputeType->suggestedPenaltyRate(),
      'suggested_compensation_rate'  => $disputeType->suggestedCompensationRate(),

      'dispute_type'            => $disputeType->value,
      'dispute_type_label'      => $disputeType->label(),
      'disputed_by'             => $disputeType->disputedBy(),
      'booking_amount'          => (float) $booking->amount,
    ];
  }

  /**
   * اعمال اثرات غیرمالی بر اساس نوع اعتراض
   */
  private function applyNonFinancialEffects(
    Dispute $dispute,
    Booking $booking,
  ): void {
    match ($dispute->dispute_type->value) {
      'false_review'   => $this->handleFalseReview($booking, $dispute),
      'customer_rude'  => $this->handleCustomerRude($booking->user),
      default          => null,
    };
  }

  private function handleFalseReview(Booking $booking, Dispute $dispute): void
  {
    $review = $booking->review;

    if (!$review) {
      return;
    }

    // ============ ۱) حذف نظر ============
    // اگه Review از SoftDeletes استفاده میکنه:
    $review->delete();

    // ============ ۲) اصلاح امتیاز آرایشگر ============
    $this->recalculateBarberRating($booking->barber);

    // ============ ۳) لاگ ============


    (new \App\Models\Log())->storeLog($booking->barber_id, LogsStatus::delete->value . 'false_review_removed', "نظر نادرست رزرو #{$booking->id} حذف شد - اعتراض #{$dispute->id}");
  }

  /**
   * بازمحاسبه امتیاز آرایشگر
   */
  private function recalculateBarberRating(User $barber): void
  {
    // فقط نظرهای فعال (غیرحذفشده) رو حساب کن
    $stats = Review::query()
      ->where('barber_id', $barber->id)
      ->selectRaw('COUNT(*) as total, SUM(rating) as sum')
      ->first();

    $total = (int) ($stats->total ?? 0);
    $sum   = (int) ($stats->sum ?? 0);

    $barber->update([
      'total_reviews'     => $total,
      'total_rating_sum'  => $sum,
      'average_rating'    => $total > 0 ? round($sum / $total, 2) : 0,
    ]);
  }

  private function handleCustomerRude(User $customer): void
  {
    // بستگی به سیستمت داره. مثلاً:
    // - افزایش شمارنده اخطار
    // - ثبت توی جدول warnings
    // - ارسال نوتیفیکیشن

    // مثال ساده با یه فیلد فرضی:
    // $customer->increment('warnings_count');

    // مثال با جدول warnings:
    // \App\Models\Warning::create([
    //     'user_id' => $customer->id,
    //     'reason'  => 'رفتار نامناسب - تایید شده توسط ادمین',
    //     'type'    => 'rude_behavior',
    // ]);
  }
}
