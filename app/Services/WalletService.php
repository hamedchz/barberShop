<?php

namespace App\Services;

use App\Enums\Casts\WalletTransactionDirection;
use App\Enums\Casts\WalletTransactionStatus;
use App\Enums\Casts\WalletTransactionType;
use App\Exceptions\WalletException;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class WalletService
{
  /**
   * گرفتن یا ساختن کیف پول برای کاربر
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
    );
  }

  /**
   * کاهش موجودی (debit)
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
    );
  }

  /**
   * هسته اصلی: اعمال تراکنش
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
      $status
    ) {
      // قفل کردن ردیف برای جلوگیری از race condition
      $wallet = Wallet::where('user_id', $user->id)
        ->lockForUpdate()
        ->first();

      if (!$wallet) {
        $wallet = $this->getOrCreateWallet($user);
        // دوباره با قفل بگیر
        $wallet = Wallet::where('user_id', $user->id)
          ->lockForUpdate()
          ->first();
      }

      if (!$wallet->is_active) {
        throw new WalletException('کیف پول کاربر غیرفعال است.');
      }

      $balanceBefore = (float) $wallet->balance;
      $isCredit = $direction === WalletTransactionDirection::credit;

      // بررسی موجودی کافی برای debit
      if (!$isCredit && $status === WalletTransactionStatus::completed) {
        $available = $balanceBefore - (float) $wallet->locked_balance;
        if ($available < $amount) {
          throw new WalletException(
            "موجودی کافی نیست. موجودی قابل استفاده: {$available}"
          );
        }
      }

      $balanceAfter = $isCredit
        ? $balanceBefore + $amount
        : $balanceBefore - $amount;

      // فقط اگه تراکنش completed باشه، balance واقعی رو آپدیت می‌کنیم
      if ($status === WalletTransactionStatus::completed) {
        $wallet->balance = $balanceAfter;

        if ($isCredit && $type === WalletTransactionType::deposit) {
          $wallet->total_deposited += $amount;
        }
        if (!$isCredit && $type === WalletTransactionType::withdraw) {
          $wallet->total_withdrawn += $amount;
        }

        $wallet->last_transaction_at = now();
      } else {
        // برای pending، balance_after = balance_before
        $balanceAfter = $balanceBefore;
      }

      $wallet->save();

      // ثبت تراکنش
      return WalletTransaction::create([
        'wallet_id'      => $wallet->id,
        'user_id'        => $user->id,
        'type'           => $type->value,
        'direction'      => $direction->value,
        'amount'         => $amount,
        'balance_before' => $balanceBefore,
        'balance_after'  => $balanceAfter,
        'status'         => $status->value,
        'reference_type' => $reference ? get_class($reference) : null,
        'reference_id'   => $reference?->id,
        'description'    => $description,
        'metadata'       => $metadata,
      ]);
    });
  }

  /**
   * بازگشت وجه (مثلاً بعد از اعتراض تاییدشده)
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
   * جریمه (کسر از موجودی)
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
   * برداشت از کیف پول
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
}
