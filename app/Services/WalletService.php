<?php

namespace App\Services;

use App\Enums\Casts\WalletTransactionDirection;
use App\Enums\Casts\WalletTransactionStatus;
use App\Enums\Casts\WalletTransactionType;
use App\Exceptions\WalletException;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class WalletService
{
  /**
   * گرفتن یا ساختن کیف پول
   */
  public function getOrCreateWallet(User $user): Wallet
  {
    return Wallet::firstOrCreate(
      ['user_id' => $user->id],
      [
        'balance'         => 0,
        'locked_balance'  => 0,
        'total_deposited' => 0,
        'total_withdrawn' => 0,
        'currency'        => 'IRT',
        'is_active'       => true,
      ]
    );
  }

    // ============================================
    // متدهای عمومی
    // ============================================

  /**
   * افزایش موجودی (credit)
   */
  public function credit(
    User $user,
    float $amount,
    WalletTransactionType $type,
    ?string $description = null,
    ?Model $reference = null,
    array $metadata = [],
    ?WalletTransactionStatus $status = null,
  ): WalletTransaction {
    return $this->applyTransaction(
      user: $user,
      amount: $amount,
      type: $type,
      direction: WalletTransactionDirection::credit,
      description: $description,
      reference: $reference,
      metadata: $metadata,
      status: $status,
      target: 'balance',   // ✅ به balance اضافه کن
    );
  }

  /**
   * کاهش موجودی از balance (debit عادی)
   */
  public function debit(
    User $user,
    float $amount,
    WalletTransactionType $type,
    ?string $description = null,
    ?Model $reference = null,
    array $metadata = [],
    ?WalletTransactionStatus $status = null,
  ): WalletTransaction {
    return $this->applyTransaction(
      user: $user,
      amount: $amount,
      type: $type,
      direction: WalletTransactionDirection::debit,
      description: $description,
      reference: $reference,
      metadata: $metadata,
      status: $status,
      target: 'balance',   // ✅ از balance کم کن
    );
  }

  /**
   * کسر از locked_balance (برای تسویه)
   */
  public function debitLocked(
    User $user,
    float $amount,
    WalletTransactionType $type,
    ?string $description = null,
    ?Model $reference = null,
    array $metadata = [],
  ): WalletTransaction {
    return $this->applyTransaction(
      user: $user,
      amount: $amount,
      type: $type,
      direction: WalletTransactionDirection::debit,
      description: $description,
      reference: $reference,
      metadata: array_merge($metadata, ['from_locked' => true]),
      status: WalletTransactionStatus::completed,
      target: 'locked',   // ✅ از locked کم کن
    );
  }

  /**
   * واریز به locked_balance (برای درآمد در انتظار)
   */
  public function creditLocked(
    User $user,
    float $amount,
    WalletTransactionType $type,
    ?string $description = null,
    ?Model $reference = null,
    array $metadata = [],
    ?CarbonInterface $releaseAt = null,
  ): WalletTransaction {
    $releaseAt = $releaseAt ?? now()->addHours(48);

    return $this->applyTransaction(
      user: $user,
      amount: $amount,
      type: $type,
      direction: WalletTransactionDirection::credit,
      description: $description,
      reference: $reference,
      metadata: $metadata,
      status: WalletTransactionStatus::completed,
      target: 'locked',
      releaseAt: $releaseAt,
    );
  }

    // ============================================
    // هسته اصلی
    // ============================================

  /**
   * @param string $target 'balance' یا 'locked'
   */
  private function applyTransaction(
    User $user,
    float $amount,
    WalletTransactionType $type,
    WalletTransactionDirection $direction,
    ?string $description,
    ?Model $reference,
    array $metadata,
    ?WalletTransactionStatus $status,
    string $target = 'balance',
    ?CarbonInterface $releaseAt = null,
  ): WalletTransaction {
    if ($amount <= 0) {
      throw new WalletException('مبلغ تراکنش باید بزرگتر از صفر باشد.');
    }

    $status = $status ?? WalletTransactionStatus::completed;

    return DB::transaction(function () use (
      $user,
      $amount,
      $type,
      $direction,
      $description,
      $reference,
      $metadata,
      $status,
      $target,
      $releaseAt,
    ) {
      // ============ قفل کردن ردیف ============
      $wallet = Wallet::where('user_id', $user->id)
        ->lockForUpdate()
        ->first();

      if (!$wallet) {
        $wallet = $this->getOrCreateWallet($user);
        $wallet = Wallet::where('user_id', $user->id)
          ->lockForUpdate()
          ->first();
      }

      if (!$wallet->is_active) {
        throw new WalletException('کیف پول کاربر غیرفعال است.');
      }

      $isCredit = $direction === WalletTransactionDirection::credit;

      // ============ چک موجودی برای debit ============
      if (!$isCredit && $status === WalletTransactionStatus::completed) {
        if ($target === 'locked') {
          // ✅ از locked کم میکنه — چک locked_balance
          if ((float) $wallet->locked_balance < $amount) {
            throw new WalletException(
              'مبلغ قفل‌شده کافی نیست. قفل‌شده: ' .
                EnglishtoPersianNumber(
                  number_format($wallet->locked_balance)
                ) .
                ' تومان'
            );
          }
        } else {
          // ✅ از balance کم میکنه — چک balance
          if ((float) $wallet->balance < $amount) {
            throw new WalletException(
              'موجودی کافی نیست. موجودی قابل برداشت: ' .
                EnglishtoPersianNumber(
                  number_format($wallet->balance)
                ) .
                ' تومان'
            );
          }
        }
      }

      // ============ اعمال تغییرات ============
      $balanceBefore = (float) $wallet->balance;
      $lockedBefore = (float) $wallet->locked_balance;

      if ($status === WalletTransactionStatus::completed) {
        if ($target === 'locked') {
          // ✅ تغییر روی locked_balance
          if ($isCredit) {
            $wallet->locked_balance += $amount;
          } else {
            $wallet->locked_balance -= $amount;
          }
        } else {
          // ✅ تغییر روی balance
          if ($isCredit) {
            $wallet->balance += $amount;
          } else {
            $wallet->balance -= $amount;

            if ($type === WalletTransactionType::withdraw) {
              $wallet->total_withdrawn += $amount;
            }
          }

          if ($isCredit && $type === WalletTransactionType::deposit) {
            $wallet->total_deposited += $amount;
          }
        }

        $wallet->last_transaction_at = now();
      }

      $wallet->save();

      // ============ ثبت تراکنش ============
      return WalletTransaction::create([
        'wallet_id'      => $wallet->id,
        'user_id'        => $user->id,
        'type'           => $type->value,
        'direction'      => $direction->value,
        'amount'         => $amount,
        'balance_before' => $balanceBefore,
        'balance_after'  => (float) $wallet->balance,
        'status'         => $status->value,
        'reference_type' => $reference ? get_class($reference) : null,
        'reference_id'   => $reference?->id,
        'description'    => $description,
        'metadata'       => array_merge($metadata, [
          'target'        => $target,
          'locked_before' => $lockedBefore,
          'locked_after'  => (float) $wallet->locked_balance,
        ]),
        'is_locked'      => $target === 'locked',
        'released_at'    => null,
        'release_at'     => $target === 'locked' ? $releaseAt : null,
      ]);
    });
  }

  

    // ============================================
    // متدهای تخصصی
    // ============================================

  /**
   * بازگشت وجه
   */
  public function refund(
    User $user,
    float $amount,
    string $description,
    ?Model $reference = null,
    array $metadata = [],
  ): WalletTransaction {
    return $this->credit(
      user: $user,
      amount: $amount,
      type: WalletTransactionType::refund,
      description: $description,
      reference: $reference,
      metadata: $metadata,
    );
  }

  /**
   * جریمه
   */
  public function penalize(
    User $user,
    float $amount,
    string $description,
    ?Model $reference = null,
    array $metadata = [],
  ): WalletTransaction {
    return $this->debit(
      user: $user,
      amount: $amount,
      type: WalletTransactionType::penalty,
      description: $description,
      reference: $reference,
      metadata: $metadata,
    );
  }

  /**
   * برداشت (فقط از balance)
   */
  public function withdraw(
    User $user,
    float $amount,
    ?string $description = null,
    array $metadata = [],
  ): WalletTransaction {
    return $this->debit(
      user: $user,
      amount: $amount,
      type: WalletTransactionType::withdraw,
      description: $description ?? 'برداشت از کیف پول',
      metadata: $metadata,
    );
  }

  /**
   * شارژ کیف پول
   */
  public function deposit(
    User $user,
    float $amount,
    ?string $description = null,
    ?Model $reference = null,
    array $metadata = [],
  ): WalletTransaction {
    return $this->credit(
      user: $user,
      amount: $amount,
      type: WalletTransactionType::deposit,
      description: $description ?? 'شارژ کیف پول',
      reference: $reference,
      metadata: $metadata,
    );
  }

  /**
   * آزاد کردن مبلغ قفل‌شده (انتقال از locked به balance)
   *  با کسر کمیسیون پلتفرم
   */
  public function releaseLocked(WalletTransaction $transaction): void
  {
    if (!$transaction->is_locked || $transaction->released_at) {
      return;
    }

    DB::transaction(function () use ($transaction) {
      $wallet = Wallet::where('id', $transaction->wallet_id)
        ->lockForUpdate()
        ->firstOrFail();

      $grossAmount = (float) $transaction->amount;

      // ✅ چک امنیتی
      if ((float) $wallet->locked_balance < $grossAmount) {
        throw new WalletException(
          'مبلغ قفل‌شده کافی نیست. قفل: ' .
            number_format($wallet->locked_balance)
        );
      }

      // ✅ محاسبه کمیسیون
      $commissionService = app(\App\Services\CommissionService::class);
      $calc = $commissionService->calculate($grossAmount, $wallet->user);

      $balanceBefore = (float) $wallet->balance;

      // ✅ انتقال خالص به balance
      $wallet->locked_balance -= $grossAmount;
      $wallet->balance += $calc['net'];
      $wallet->last_transaction_at = now();
      $wallet->save();

      // آپدیت تراکنش اصلی
      $transaction->update([
        'released_at' => now(),
        'metadata'    => array_merge($transaction->metadata ?? [], [
          'commission'      => $calc['commission'],
          'commission_rate' => $calc['rate'],
          'gross_amount'    => $grossAmount,
          'net_amount'      => $calc['net'],
          'released_at'     => now()->toIso8601String(),
        ]),
      ]);

      // ✅ ثبت کمیسیون
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
          'reference_id'   => $transaction->id,
          'description'    => "کمیسیون آزادسازی درآمد #{$transaction->id}",
          'metadata'       => [
            'commission_rate'       => $calc['rate'],
            'source_transaction_id' => $transaction->id,
          ],
        ]);
      }
    });
  }
  /**
   * انتقال از locked به balance (برای برگشت درآمد)
   */
  public function releaseLockedToBalance(
    WalletTransaction $transaction,
  ): void {
    $this->releaseLocked($transaction);
  }
}
