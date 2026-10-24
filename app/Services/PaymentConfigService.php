<?php

namespace App\Services;

use App\Models\PaymentSetting;

class PaymentConfigService
{
  /**
   * تنظیمات DB رو روی config لود کن
   */
  public static function apply(): void
  {
    $settings = PaymentSetting::all();

    foreach ($settings as $setting) {
      $driver = "payment.drivers.{$setting->gateway}";

      if ($setting->mode) {
        config(["{$driver}.mode" => $setting->mode]);
      }
      if ($setting->merchant_id) {
        config(["{$driver}.merchantId" => $setting->merchant_id]);
      }
      if ($setting->callback_url) {
        config(["{$driver}.callbackUrl" => $setting->callback_url]);
      }
      if ($setting->description) {
        config(["{$driver}.description" => $setting->description]);
      }
      if ($setting->currency) {
        config(["{$driver}.currency" => $setting->currency]);
      }
    }
  }

  /**
   * تنظیمات فعلی یه درگاه (از DB یا config)
   */
  public static function get(string $gateway): array
  {
    $setting = PaymentSetting::where('gateway', $gateway)->first();
    $config = config("payment.drivers.{$gateway}", []);

    return [
      'gateway'      => $gateway,
      'gateway_label' => PaymentSetting::GATEWAYS[$gateway] ?? $gateway,
      'mode'         => $setting?->mode ?? ($config['mode'] ?? 'normal'),
      'merchant_id'  => $setting?->merchant_id ?? ($config['merchantId'] ?? ''),
      'callback_url' => $setting?->callback_url ?? ($config['callbackUrl'] ?? ''),
      'description'  => $setting?->description ?? ($config['description'] ?? ''),
      'currency'     => $setting?->currency ?? ($config['currency'] ?? 'T'),
      'is_active'    => $setting?->is_active ?? true,
      'source'       => $setting ? 'database' : 'config',
    ];
  }
}
