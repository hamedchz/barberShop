<?php

namespace App\Enums\Casts;

enum DisputedStatus: string
{
  case pending = 'pending';
  case investigating = 'investigating';
  case awaitingResponse = 'awaiting_response';
  case resolved = 'resolved';
  case rejected = 'rejected';
  case cancelled = 'cancelled';

  public function label(): string
  {
    return match ($this) {
      self::pending => 'در انتظار بررسی',
      self::investigating => 'در حال بررسی',
      self::awaitingResponse => 'در انتظار پاسخ',
      self::resolved => 'تایید شده',
      self::rejected => 'رد شده',
      self::cancelled => 'لغو شده',
    };
  }

  public function isActive(): bool
  {
    return in_array($this, [
      self::pending,
      self::investigating,
      self::awaitingResponse,
    ], true);
  }

  public function isFinal(): bool
  {
    return in_array($this, [
      self::resolved,
      self::rejected,
      self::cancelled,
    ], true);
  }

  /**
   * آیا این وضعیت مانع تکمیل خودکار رزرو می‌شود؟
   */
  public function blocksAutoComplete(): bool
  {
    return in_array($this, [
      self::pending,
      self::investigating,
      self::awaitingResponse,
      self::resolved,
    ], true);
  }
}
