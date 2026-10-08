<?php

namespace App\Enums\Casts;

enum WalletTransactionStatus: string
{
  case pending   = 'pending';
  case completed = 'completed';
  case failed    = 'failed';
  case cancelled = 'cancelled';

  public function label(): string
  {
    return match ($this) {
      self::pending   => 'در انتظار',
      self::completed => 'تکمیل شده',
      self::failed    => 'ناموفق',
      self::cancelled => 'لغو شده',
    };
  }
}
