<?php

namespace App\Enums\Casts;

enum ReviewStatus: string
{
  case pending  = 'pending';   // در انتظار بررسی
  case approved = 'approved';  // تایید شده
  case rejected = 'rejected';  // رد شده (مخفی)
  case flagged  = 'flagged';   // علامتگذاری شده برای بررسی

  public function label(): string
  {
    return match ($this) {
      self::pending  => 'در انتظار بررسی',
      self::approved => 'تایید شده',
      self::rejected => 'رد شده',
      self::flagged  => 'نیازمند بررسی',
    };
  }

  public function color(): string
  {
    return match ($this) {
      self::pending  => 'yellow',
      self::approved => 'green',
      self::rejected => 'red',
      self::flagged  => 'orange',
    };
  }

  public function icon(): string
  {
    return match ($this) {
      self::pending  => 'Clock4',
      self::approved => 'CheckCircle',
      self::rejected => 'XCircle',
      self::flagged  => 'AlertTriangle',
    };
  }
}
