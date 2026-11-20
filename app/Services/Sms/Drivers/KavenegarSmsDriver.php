<?php

namespace App\Services\Sms\Drivers;

use App\Contracts\Sms\SmsProviderInterface;
use App\Contracts\Sms\SmsProviderTestInterface;
use App\Exceptions\SmsDeliveryException;
use App\Models\SmsProvider;
use Illuminate\Support\Facades\Http;
use Throwable;

class KavenegarSmsDriver implements
  SmsProviderInterface,
  SmsProviderTestInterface
{
  public function __construct(
    protected SmsProvider $provider
  ) {}

  protected function apiKey(): string
  {
    return (string) data_get(
      $this->provider->credentials,
      'api_key'
    );
  }

  protected function baseUrl(string $endpoint): string
  {
    return 'https://api.kavenegar.com/v1/'
      . rawurlencode($this->apiKey())
      . '/' . $endpoint . '.json';
  }

  public function send(string $phone, string $message): void
  {
    $template = data_get(
      $this->provider->settings,
      'template'
    );

    if (!$this->apiKey() || !$template) {
      throw new SmsDeliveryException(
        'کلید API یا الگوی تأیید کاوه‌نگار تنظیم نشده است.'
      );
    }

    /*
         * VerifyLookup برای OTP:
         * متن پیام در پنل کاوه‌نگار تعریف می‌شود
         * و کد در متغیر token قرار می‌گیرد.
         */
    $code = $this->extractOtp($message);

    try {
      $response = Http::timeout(15)->get(
        $this->baseUrl('verify/lookup'),
        [
          'receptor' => $phone,
          'token' => $code,
          'template' => $template,
          'type' => 'sms',
        ]
      );

      if (!$response->successful()) {
        throw new SmsDeliveryException(
          'ارسال پیام از طریق کاوه‌نگار ناموفق بود.'
        );
      }

      $status = data_get(
        $response->json(),
        'return.status'
      );

      if ((int) $status !== 200) {
        throw new SmsDeliveryException(
          'کاوه‌نگار ارسال پیامک را تأیید نکرد.'
        );
      }
    } catch (SmsDeliveryException $exception) {
      throw $exception;
    } catch (Throwable $exception) {
      throw new SmsDeliveryException(
        'ارتباط با کاوه‌نگار برقرار نشد.'
      );
    }
  }

  public function testConnection(): void
  {
    if (!$this->apiKey()) {
      throw new SmsDeliveryException(
        'کلید API کاوه‌نگار وارد نشده است.'
      );
    }

    try {
      $response = Http::timeout(15)->get(
        $this->baseUrl('account/info')
      );

      if (!$response->successful()) {
        throw new SmsDeliveryException(
          'اتصال به کاوه‌نگار ناموفق بود.'
        );
      }

      $status = data_get(
        $response->json(),
        'return.status'
      );

      if ((int) $status !== 200) {
        throw new SmsDeliveryException(
          'اطلاعات حساب کاوه‌نگار قابل دریافت نیست.'
        );
      }
    } catch (SmsDeliveryException $exception) {
      throw $exception;
    } catch (Throwable $exception) {
      throw new SmsDeliveryException(
        'امکان برقراری ارتباط با کاوه‌نگار وجود ندارد.'
      );
    }
  }

  /**
   * استخراج کد از پیام ساخته‌شده توسط OtpService
   */
  protected function extractOtp(string $message): string
  {
    if (!preg_match('/(?<!\d)(\d{6})(?!\d)/', $message, $matches)) {
      throw new SmsDeliveryException(
        'کد OTP در متن پیام قابل تشخیص نیست.'
      );
    }

    return $matches[1];
  }
}
