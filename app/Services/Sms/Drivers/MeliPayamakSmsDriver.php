<?php

namespace App\Services\Sms\Drivers;

use App\Contracts\Sms\SmsProviderInterface;
use App\Contracts\Sms\SmsProviderTestInterface;
use App\Exceptions\SmsDeliveryException;
use App\Models\SmsProvider;
use Illuminate\Support\Facades\Http;
use Throwable;

class MeliPayamakSmsDriver implements
  SmsProviderInterface,
  SmsProviderTestInterface
{
  protected string $baseUrl =
  'https://rest.payamak-panel.com/api/SendSMS/';

  public function __construct(
    protected SmsProvider $provider
  ) {}

  protected function credentials(): array
  {
    return $this->provider->credentials ?? [];
  }

  protected function settings(): array
  {
    return $this->provider->settings ?? [];
  }

  public function send(string $phone, string $message): void
  {
    $credentials = $this->credentials();
    $settings = $this->settings();

    $username = $credentials['username'] ?? null;
    $password = $credentials['password'] ?? null;
    $bodyId = $settings['body_id'] ?? null;

    if (!$username || !$password || !$bodyId) {
      throw new SmsDeliveryException(
        'اطلاعات حساب یا شناسه الگوی ملی‌پیامک تنظیم نشده است.'
      );
    }

    $code = $this->extractOtp($message);

    try {
      $response = Http::asForm()
        ->timeout(15)
        ->post(
          $this->baseUrl . 'BaseServiceNumber',
          [
            'username' => $username,
            'password' => $password,
            'text' => $code,
            'to' => $phone,
            'bodyId' => $bodyId,
          ]
        );

      if (!$response->successful()) {
        throw new SmsDeliveryException(
          'ارسال پیام از طریق ملی‌پیامک ناموفق بود.'
        );
      }

      $result = $response->json();

      if (
        !is_array($result) ||
        !isset($result['RetStatus']) ||
        (int) $result['RetStatus'] !== 1
      ) {
        throw new SmsDeliveryException(
          'ملی‌پیامک ارسال پیام را تأیید نکرد.'
        );
      }
    } catch (SmsDeliveryException $exception) {
      throw $exception;
    } catch (Throwable $exception) {
      throw new SmsDeliveryException(
        'ارتباط با ملی‌پیامک برقرار نشد.'
      );
    }
  }

  public function testConnection(): void
  {
    $credentials = $this->credentials();

    $username = $credentials['username'] ?? null;
    $password = $credentials['password'] ?? null;

    if (!$username || !$password) {
      throw new SmsDeliveryException(
        'نام کاربری یا رمز عبور ملی‌پیامک وارد نشده است.'
      );
    }

    try {
      $response = Http::asForm()
        ->timeout(15)
        ->post(
          $this->baseUrl . 'GetCredit',
          [
            'UserName' => $username,
            'PassWord' => $password,
          ]
        );

      if (!$response->successful()) {
        throw new SmsDeliveryException(
          'اتصال به ملی‌پیامک ناموفق بود.'
        );
      }

      $result = $response->json();

      if (
        !is_array($result) ||
        !array_key_exists('RetStatus', $result) ||
        (int) $result['RetStatus'] !== 1
      ) {
        throw new SmsDeliveryException(
          'اطلاعات حساب ملی‌پیامک معتبر نیست.'
        );
      }
    } catch (SmsDeliveryException $exception) {
      throw $exception;
    } catch (Throwable $exception) {
      throw new SmsDeliveryException(
        'امکان برقراری ارتباط با ملی‌پیامک وجود ندارد.'
      );
    }
  }

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
