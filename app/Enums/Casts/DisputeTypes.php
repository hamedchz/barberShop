<?php

namespace App\Enums\Casts;

enum DisputeTypes: string
{
  // ============ اعتراضات مشتری ============
  case not_done         = 'not_done';
  case incomplete       = 'incomplete';
  case poor_quality     = 'poor_quality';
  case bad_behavior     = 'bad_behavior';
  case other            = 'other';

    // ============ اعتراضات آرایشگر ============
  case customer_not_present = 'customer_not_present';
  case customer_rude        = 'customer_rude';
  case false_review         = 'false_review';
  case customer_left_early  = 'customer_left_early';
  case customer_damaged     = 'customer_damaged';

  // ============================================
  // متدهای کمکی
  // ============================================

  public function label(): string
  {
    return match ($this) {
      self::not_done            => 'خدمت انجام نشد',
      self::incomplete          => 'خدمت ناقص بود',
      self::poor_quality        => 'کیفیت پایین بود',
      self::bad_behavior        => 'رفتار نامناسب آرایشگر',
      self::other               => 'سایر',
      self::customer_not_present => 'مشتری حاضر نشد',
      self::customer_rude       => 'مشتری توهین کرد',
      self::false_review        => 'نظر نادرست',
      self::customer_left_early => 'مشتری زودتر رفت',
      self::customer_damaged    => 'خسارت توسط مشتری',
    };
  }

  public function disputedBy(): string
  {
    return match ($this) {
      self::not_done,
      self::incomplete,
      self::poor_quality,
      self::bad_behavior        => 'customer',

      self::customer_not_present,
      self::customer_rude,
      self::false_review,
      self::customer_left_early,
      self::customer_damaged    => 'barber',

      self::other               => 'both',
    };
  }

  /**
   * آیا این نوع اعتراض، بازگشت وجه به مشتری داره؟
   */
  public function hasRefund(): bool
  {
    return in_array($this, [
      self::not_done,
      self::incomplete,
      self::poor_quality,
      self::bad_behavior,
    ], true);
  }

  /**
   * آیا این نوع اعتراض، جریمه آرایشگر داره؟
   */
  public function hasPenalty(): bool
  {
    return in_array($this, [
      self::not_done,
      self::incomplete,
      self::poor_quality,
      self::bad_behavior,
    ], true);
  }

  /**
   * آیا این نوع اعتراض، غرامت به آرایشگر داره؟
   * (اعتراضات آرایشگر که مشتری باید خسارت بده)
   */
  public function hasCompensation(): bool
  {
    return in_array($this, [
      self::customer_not_present,
      self::customer_damaged,
    ], true);
  }

  /**
   * درصد پیشنهادی بازگشت از مبلغ رزرو (۰ تا ۱)
   */
  public function suggestedRefundRate(): float
  {
    return match ($this) {
      self::not_done     => 1.00,  // ۱۰۰٪
      self::bad_behavior => 1.00,  // ۱۰۰٪
      self::incomplete   => 0.50,  // ۵۰٪
      self::poor_quality => 0.50,  // ۵۰٪
      default            => 0.00,
    };
  }

  /**
   * درصد پیشنهادی جریمه آرایشگر از مبلغ رزرو
   */
  public function suggestedPenaltyRate(): float
  {
    return match ($this) {
      self::not_done     => 0.20,  // ۲۰٪
      self::bad_behavior => 0.30,  // ۳۰٪
      self::incomplete   => 0.10,  // ۱۰٪
      self::poor_quality => 0.10,  // ۱۰٪
      default            => 0.00,
    };
  }

  /**
   * درصد پیشنهادی غرامت به آرایشگر (از مشتری)
   */
  public function suggestedCompensationRate(): float
  {
    return match ($this) {
      self::customer_not_present => 0.30,  // ۳۰٪
      self::customer_damaged     => 0.50,  // ۵۰٪
      default                    => 0.00,
    };
  }
}
