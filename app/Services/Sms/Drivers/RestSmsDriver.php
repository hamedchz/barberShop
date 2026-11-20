<?php

namespace App\Services\Sms\Drivers;

use App\Contracts\Sms\SmsProviderInterface;
use App\Exceptions\SmsDeliveryException;
use App\Models\SmsProvider;
use Illuminate\Support\Facades\Http;
use Throwable;
use App\Contracts\Sms\SmsProviderTestInterface;

class RestSmsDriver implements
  SmsProviderInterface,
  SmsProviderTestInterface
{
  public function __construct(
    protected SmsProvider $provider
  ) {}

  public function send(string $phone, string $message): void
  {
    if (!$this->provider->isReady()) {
      throw new SmsDeliveryException(
        'اطلاعات سرویس پیامکی کامل نیست.'
      );
    }

    $credentials = $this->provider->credentials ?? [];
    $settings = $this->provider->settings ?? [];

    $endpoint = $settings['endpoint'] ?? null;

    if (
      !is_string($endpoint) ||
      !filter_var($endpoint, FILTER_VALIDATE_URL) ||
      !in_array(parse_url($endpoint, PHP_URL_SCHEME), ['https', 'http'], true)
    ) {
      throw new SmsDeliveryException(
        'آدرس API سرویس پیامکی معتبر نیست.'
      );
    }

    $method = strtoupper($settings['method'] ?? 'POST');

    if (!in_array($method, ['POST', 'PUT', 'PATCH', 'GET'], true)) {
      throw new SmsDeliveryException(
        'متد HTTP سرویس پیامکی معتبر نیست.'
      );
    }

    $bodyFormat = $settings['body_format'] ?? 'json';

    if (!in_array($bodyFormat, ['json', 'form', 'query'], true)) {
      throw new SmsDeliveryException(
        'فرمت درخواست سرویس پیامکی معتبر نیست.'
      );
    }

    $headers = $this->resolvePlaceholders(
      $settings['headers'] ?? [],
      $credentials
    );

    // $payload = $settings['payload'] ?? [];

    // if (!is_array($headers) || !is_array($payload)) {
    //   throw new SmsDeliveryException(
    //     'ساختار تنظیمات سرویس پیامکی معتبر نیست.'
    //   );
    // }

    // $phoneField = $settings['phone_field'] ?? 'to';
    // $messageField = $settings['message_field'] ?? 'message';

    // $payload[$phoneField] = $phone;
    // $payload[$messageField] = $message;

    // $payload = $this->resolvePlaceholders(
    //   $payload,
    //   $credentials
    // );

    $phoneField = $settings['phone_field'] ?? 'to';
    $messageField = $settings['message_field'] ?? 'message';

    $payload = $settings['payload'] ?? [];

    if (!is_array($headers) || !is_array($payload)) {
      throw new SmsDeliveryException(
        'ساختار تنظیمات سرویس پیامکی معتبر نیست.'
      );
    }

    $code = $this->extractOtp($message);

    $payload = $this->resolvePlaceholders(
      $payload,
      $credentials
    );

    $payload = $this->resolveRuntimeValues(
      $payload,
      [
        'phone' => $phone,
        'message' => $message,
        'otp' => $code,
      ]
    );

    if ($phoneField) {
      $payload[$phoneField] = $phone;
    }

    if ($messageField) {
      $payload[$messageField] = $message;
    }


    $options = match ($bodyFormat) {
      'form' => ['form_params' => $payload],
      'query' => ['query' => $payload],
      default => ['json' => $payload],
    };

    try {
      $response = Http::timeout(
        (int) ($settings['timeout'] ?? config('sms.timeout', 15))
      )
        ->withHeaders($headers)
        ->send($method, $endpoint, $options);

      if (!$response->successful()) {
        throw new SmsDeliveryException(
          'سرویس پیامکی درخواست را نپذیرفت.'
        );
      }

      /*
             * بررسی پاسخ اختصاصی سرویس، در صورت تعریف success_path
             */
      if (!empty($settings['success_path'])) {
        $responseData = $response->json();

        $actualValue = data_get(
          $responseData,
          $settings['success_path']
        );

        if (array_key_exists('success_value', $settings)) {
          $isSuccessful = $actualValue === $settings['success_value'];
        } else {
          $isSuccessful = (bool) $actualValue;
        }

        if (!$isSuccessful) {
          throw new SmsDeliveryException(
            'سرویس پیامکی ارسال پیام را تأیید نکرد.'
          );
        }
      }
    } catch (SmsDeliveryException $exception) {
      throw $exception;
    } catch (Throwable $exception) {
      /*
             * اطلاعات محرمانه و پاسخ خام سرویس در Exception قرار نمی‌گیرند.
             */
      throw new SmsDeliveryException(
        'ارتباط با سرویس پیامکی برقرار نشد.'
      );
    }
  }

  /**
   * جایگزینی مقادیر محرمانه در تنظیمات
   *
   * نمونه:
   * {api_key} ← مقدار credentials.api_key
   */
  protected function resolvePlaceholders(
    mixed $value,
    array $credentials
  ): mixed {
    if (is_array($value)) {
      $resolved = [];

      foreach ($value as $key => $item) {
        $resolved[$key] = $this->resolvePlaceholders(
          $item,
          $credentials
        );
      }

      return $resolved;
    }

    if (!is_string($value)) {
      return $value;
    }

    foreach ($credentials as $key => $credential) {
      if (!is_scalar($credential)) {
        continue;
      }

      $value = str_replace(
        '{' . $key . '}',
        (string) $credential,
        $value
      );
    }

    return $value;
  }


  public function testConnection(): void
  {
    $settings = $this->provider->settings ?? [];

    $endpoint = $settings['test_endpoint'] ?? null;

    if (
      !is_string($endpoint) ||
      !filter_var($endpoint, FILTER_VALIDATE_URL) ||
      !in_array(parse_url($endpoint, PHP_URL_SCHEME), ['https', 'http'], true)
    ) {
      throw new SmsDeliveryException(
        'آدرس تست اتصال سرویس پیامکی تنظیم نشده است.'
      );
    }

    $credentials = $this->provider->credentials ?? [];

    $headers = $this->resolvePlaceholders(
      $settings['headers'] ?? [],
      $credentials
    );

    try {
      $response = Http::timeout(
        (int) ($settings['timeout'] ?? config('sms.timeout', 15))
      )
        ->withHeaders($headers)
        ->get($endpoint);

      if (!$response->successful()) {
        throw new SmsDeliveryException(
          'تست اتصال سرویس پیامکی ناموفق بود.'
        );
      }

      /*
         * بررسی اختیاری پاسخ API
         */
      if (!empty($settings['test_success_path'])) {
        $actualValue = data_get(
          $response->json(),
          $settings['test_success_path']
        );

        if (
          array_key_exists('test_success_value', $settings) &&
          $actualValue !== $settings['test_success_value']
        ) {
          throw new SmsDeliveryException(
            'سرویس پیامکی اعتبار اتصال را تأیید نکرد.'
          );
        }

        if (
          !array_key_exists('test_success_value', $settings) &&
          !$actualValue
        ) {
          throw new SmsDeliveryException(
            'سرویس پیامکی اعتبار اتصال را تأیید نکرد.'
          );
        }
      }
    } catch (SmsDeliveryException $exception) {
      throw $exception;
    } catch (Throwable $exception) {
      throw new SmsDeliveryException(
        'امکان برقراری ارتباط با سرویس پیامکی وجود ندارد.'
      );
    }
  }


  protected function resolveRuntimeValues(
    mixed $value,
    array $variables
  ): mixed {
    if (is_array($value)) {
      $resolved = [];

      foreach ($value as $key => $item) {
        $resolved[$key] = $this->resolveRuntimeValues(
          $item,
          $variables
        );
      }

      return $resolved;
    }

    if (!is_string($value)) {
      return $value;
    }

    foreach ($variables as $key => $variable) {
      $value = str_replace(
        '{' . $key . '}',
        (string) $variable,
        $value
      );
    }

    return $value;
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
