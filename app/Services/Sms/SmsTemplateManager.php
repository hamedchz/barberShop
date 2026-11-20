<?php

namespace App\Services\Sms;

use Alizeinodin\SmsApi\DTOs\SendResult;
use RuntimeException;

class SmsTemplateManager
{
  public function __construct(
    private readonly SmsProviderManager $providerManager
  ) {}

  /**
   * ارسال پیام OTP با قالب ثبت‌شده در پنل پیامکی.
   */
  public function sendOtp(string $phone, string $code): SendResult
  {
    $provider = $this->providerManager->primary();

    $template = $provider->otpTemplate();

    if (! $template) {
      throw new RuntimeException(
        'قالب پیامکی OTP تنظیم نشده است.'
      );
    }

    $templateId = trim((string) ($template['template_id'] ?? ''));
    $codeParameter = trim((string) ($template['code_parameter'] ?? ''));

    if ($templateId === '' || $codeParameter === '') {
      throw new RuntimeException(
        'شناسه قالب یا نام پارامتر کد تأیید معتبر نیست.'
      );
    }

    $driver = $this->providerManager->driver($provider);

    if (! method_exists($driver, 'sendTemplate')) {
      throw new RuntimeException(
        'درایور انتخاب‌شده از ارسال قالب پیامکی پشتیبانی نمی‌کند.'
      );
    }

    $result = $driver->sendTemplate(
      $phone,
      $templateId,
      [
        $codeParameter => $code,
      ]
    );

    if (! $result->success) {
      throw new RuntimeException(
        'ارسال پیامک کد تأیید با خطا مواجه شد.'
      );
    }

    return $result;
  }
}
