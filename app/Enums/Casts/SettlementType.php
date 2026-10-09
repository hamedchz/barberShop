<?php

namespace App\Enums\Casts;

enum SettlementType: string
{
  case barberPayout        = 'barber_payout';        // واریز به آرایشگر
  case customerRefund      = 'customer_refund';      // بازگشت به مشتری
  case platformCommission  = 'platform_commission';  // کمیسیون پلتفرم

  public function label(): string
  {
    return match ($this) {
      self::barberPayout       => 'واریز درآمد به آرایشگر',
      self::customerRefund     => 'بازگشت وجه به مشتری',
      self::platformCommission => 'کمیسیون پلتفرم',
    };
  }
}
