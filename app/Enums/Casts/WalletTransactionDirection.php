<?php

namespace App\Enums\Casts;

enum WalletTransactionDirection: string
{
  case credit = 'credit';  // افزایش موجودی
  case debit  = 'debit';   // کاهش موجودی

  public function label(): string
  {
    return match ($this) {
      self::credit => 'افزایش',
      self::debit  => 'کاهش',
    };
  }
}
