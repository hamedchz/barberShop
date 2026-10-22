<?php

namespace App\Enums\Casts;

enum BookingStatus: string
{
  case pending   = 'pending';
  case confirmed = 'confirmed';
  case completed = 'completed';
  case cancelled = 'cancelled';

  public function label(): string
  {
    return match ($this) {
      self::pending   => 'در انتظار تایید',
      self::confirmed => 'تایید شده',
      self::completed => 'تکمیل شده',
      self::cancelled => 'لغو شده',
    };
  }

  public function color(): string
  {
    return match ($this) {
      self::pending   => '#92400e',
      self::confirmed => '#065f46',
      self::completed => '#1e40af',
      self::cancelled => '#991b1b',
    };
  }

  public function bg(): string
  {
    return match ($this) {
      self::pending   => '#fffbeb',
      self::confirmed => '#ecfdf5',
      self::completed => '#eff6ff',
      self::cancelled => '#fef2f2',
    };
  }
}
