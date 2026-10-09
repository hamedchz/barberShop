<?php

namespace App\Enums\Casts;

enum SettlementStatus: string
{
  case pending    = 'pending';
  case processing = 'processing';
  case completed  = 'completed';
  case failed     = 'failed';
  case cancelled  = 'cancelled';

  public function label(): string
  {
    return match ($this) {
      self::pending    => 'در انتظار',
      self::processing => 'در حال پردازش',
      self::completed  => 'تکمیل شده',
      self::failed     => 'ناموفق',
      self::cancelled  => 'لغو شده',
    };
  }

  public function color(): string
  {
    return match ($this) {
      self::pending    => 'yellow',
      self::processing => 'blue',
      self::completed  => 'green',
      self::failed     => 'red',
      self::cancelled  => 'gray',
    };
  }

  public function isFinal(): bool
  {
    return in_array($this, [
      self::completed,
      self::failed,
      self::cancelled,
    ], true);
  }
}
