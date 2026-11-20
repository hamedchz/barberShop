<?php

namespace App\Services\Sms;

use Alizeinodin\SmsApi\Contracts\MessageDriver;
use Alizeinodin\SmsApi\Facades\Sms;
use Alizeinodin\SmsApi\Registry\DriverRegistry;
use App\Models\Setting;
use App\Models\SmsProvider;
use Illuminate\Support\Arr;
use RuntimeException;

class SmsProviderManager
{
  /**
   * دریافت سرویس اصلی OTP.
   */
  public function primary(): SmsProvider
  {
    $providerId = Setting::get('otp_sms_provider_id');

    if (! $providerId) {
      throw new RuntimeException(
        'سرویس پیامکی اصلی برای ارسال کد تأیید انتخاب نشده است.'
      );
    }

    $provider = SmsProvider::query()
      ->active()
      ->whereKey((int) $providerId)
      ->first();

    if (! $provider) {
      throw new RuntimeException(
        'سرویس پیامکی اصلی پیدا نشد یا غیرفعال است.'
      );
    }

    if (! $provider->isOtpReady()) {
      throw new RuntimeException(
        'اطلاعات اتصال یا قالب OTP سرویس پیامکی کامل نیست.'
      );
    }

    return $provider;
  }

  /**
   * ساخت درایور از مسیر استاندارد SmsManager.
   *
   * درایور خام مستقیماً به مصرف‌کننده برگردانده نمی‌شود؛
   * SmsManager آن را با Decoratorهای پکیج Wrap می‌کند.
   */
  public function driver(SmsProvider $provider): MessageDriver
  {
    if (! $provider->isOtpReady()) {
      throw new RuntimeException(
        'سرویس پیامکی برای ارسال OTP آماده نیست.'
      );
    }

    $credentials = $provider->credentials ?? [];
    $settings = $provider->settings ?? [];

    $driverConfig = array_merge(
      $credentials,
      Arr::only($settings, [
        'line_number',
        'base_url',
        'timeout',
        'connect_timeout',
        'number_format',
      ]),
      [
        'driver' => $provider->driver,
        'name' => $provider->name,
      ],
    );

    /*
         * با تغییر اطلاعات اتصال یا تنظیمات ارائه‌دهنده،
         * fingerprint تغییر کرده و اتصال جدید ساخته می‌شود.
         */
    $fingerprint = hash(
      'sha256',
      json_encode($driverConfig, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)
        . '|' . $provider->updated_at?->getTimestamp()
    );

    $connectionName = sprintf(
      'database_provider_%d_%s',
      $provider->id,
      substr($fingerprint, 0, 16)
    );

    /*
         * ثبت Creator اختصاصی در SmsManager.
         * SmsManager پس از ساخت درایور، Decoratorها را اعمال می‌کند.
         */
    $driverName = $provider->driver;

    Sms::extend(
      $connectionName,
      static function ($app) use ($driverName, $driverConfig) {
        return DriverRegistry::make($driverName, $driverConfig);
      }
    );

    return Sms::driver($connectionName);
  }

  /**
   * دریافت سرویس اصلی به همراه درایور آماده ارسال.
   *
   * @return array{provider: SmsProvider, driver: MessageDriver}
   */
  public function primaryWithDriver(): array
  {
    $provider = $this->primary();

    return [
      'provider' => $provider,
      'driver' => $this->driver($provider),
    ];
  }

  /**
   * آیا سرویس اصلی قابل استفاده برای OTP وجود دارد؟
   */
  public function hasPrimary(): bool
  {
    $providerId = Setting::get('otp_sms_provider_id');

    if (! $providerId) {
      return false;
    }

    $provider = SmsProvider::query()
      ->active()
      ->whereKey((int) $providerId)
      ->first();

    return $provider?->isOtpReady() ?? false;
  }
}
