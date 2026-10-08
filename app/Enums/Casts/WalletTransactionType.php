<?php

namespace App\Enums\Casts;

enum WalletTransactionType: string
{
  case deposit    = 'deposit';     // شارژ کیف پول
  case withdraw   = 'withdraw';    // برداشت
  case refund     = 'refund';      // بازگشت وجه (اعتراض تایید شد)
  case penalty    = 'penalty';     // جریمه
  case payment    = 'payment';     // پرداخت رزرو
  case earning    = 'earning';     // درآمد آرایشگر
  case commission = 'commission';  // کمیسیون پلتفرم

  public function label(): string
  {
    return match ($this) {
      self::deposit    => 'شارژ کیف پول',
      self::withdraw   => 'برداشت',
      self::refund     => 'بازگشت وجه',
      self::penalty    => 'جریمه',
      self::payment    => 'پرداخت رزرو',
      self::earning    => 'درآمد',
      self::commission => 'کمیسیون',
    };
  }

  /**
   * جهت پیش‌فرض تراکنش
   */
  public function defaultDirection(): WalletTransactionDirection
  {
    return match ($this) {
      self::deposit,
      self::refund,
      self::earning    => WalletTransactionDirection::credit,

      self::withdraw,
      self::penalty,
      self::payment,
      self::commission => WalletTransactionDirection::debit,
    };
  }
}
