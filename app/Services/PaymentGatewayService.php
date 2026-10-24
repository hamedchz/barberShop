<?php

namespace App\Services;

use App\Models\PaymentSetting;
use Shetabit\Payment\Facade\Payment;

class PaymentGatewayService
{
  /**
   * ساخت درگاه با تنظیمات فعلی
   */
  public static function driver(string $gateway = 'zarinpal')
  {
    // ============ بررسی فعال بودن ============
    if (!PaymentConfigService::isActive($gateway)) {
      throw new \RuntimeException(
        "درگاه {$gateway} غیرفعال است."
      );
    }

    // ============ اعمال تنظیمات ============
    PaymentConfigService::apply();

    // ============ برگرداندن درگاه ============
    return Payment::via($gateway);
  }
}
