<?php

namespace App\Services\Sms;

use App\Models\OtpCode;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Illuminate\Contracts\Cache\LockTimeoutException;
use RuntimeException;
use Throwable;

class OtpService
{
  private const CODE_LENGTH = 6;

  private const CODE_TTL_SECONDS = 120;

  private const RESEND_COOLDOWN_SECONDS = 60;

  private const MAX_SENDS = 3;

  private const SEND_DECAY_SECONDS = 600;

  private const MAX_VERIFY_ATTEMPTS = 5;

  /**
   * درخواست و ارسال کد OTP.
   *
   * @return array{
   *     expires_at: string,
   *     resend_after: int
   * }
   */
  public function send(string $phone, string $purpose): array
  {
    $phone = $this->normalizePhone($phone);
    $this->validatePurpose($purpose);

    $phoneKey = hash('sha256', $phone . '|' . $purpose);

    $lock = Cache::lock(
      'otp:send:lock:' . $phoneKey,
      15
    );

    try {
      return $lock->block(5, function () use ($phone, $purpose, $phoneKey) {
        return $this->sendUnderLock(
          $phone,
          $purpose,
          $phoneKey
        );
      });
    } catch (LockTimeoutException) {
      throw ValidationException::withMessages([
        'phone' => 'درخواست دیگری برای این شماره در حال پردازش است. کمی بعد دوباره تلاش کنید.',
      ]);
    }
  }

  /**
   * اجرای ارسال در محدوده قفل.
   */
  private function sendUnderLock(
    string $phone,
    string $purpose,
    string $phoneKey
  ): array {
    $cooldownKey = 'otp:cooldown:' . $phoneKey;
    $sendLimitKey = 'otp:send-limit:' . $phoneKey;

    if (RateLimiter::tooManyAttempts($sendLimitKey, self::MAX_SENDS)) {
      $seconds = RateLimiter::availableIn($sendLimitKey);

      throw ValidationException::withMessages([
        'phone' => "تعداد درخواست‌های ارسال کد بیش از حد مجاز است. {$seconds} ثانیه دیگر تلاش کنید.",
      ]);
    }

    if (RateLimiter::tooManyAttempts($cooldownKey, 1)) {
      $seconds = RateLimiter::availableIn($cooldownKey);

      throw ValidationException::withMessages([
        'phone' => "برای ارسال مجدد کد باید {$seconds} ثانیه صبر کنید.",
      ]);
    }

    /*
         * محدودیت‌ها قبل از ارتباط با سرویس پیامکی ثبت می‌شوند
         * تا درخواست‌های ناموفق نیز قابل سوءاستفاده نباشند.
         */
    RateLimiter::hit(
      $cooldownKey,
      self::RESEND_COOLDOWN_SECONDS
    );

    RateLimiter::hit(
      $sendLimitKey,
      self::SEND_DECAY_SECONDS
    );

    $code = $this->generateCode();

    try {
      $result = app(SmsTemplateManager::class)->sendOtp(
        $phone,
        $code
      );

      if (! $result->success) {
        throw new RuntimeException(
          'ارسال کد تأیید توسط سرویس پیامکی انجام نشد.'
        );
      }

      $expiresAt = now()->addSeconds(self::CODE_TTL_SECONDS);

      $otp = DB::transaction(function () use (
        $phone,
        $purpose,
        $code,
        $expiresAt
      ) {
        /*
                 * کدهای قبلی فقط پس از ارسال موفق کد جدید
                 * غیرفعال می‌شوند.
                 */
        OtpCode::query()
          ->where('phone', $phone)
          ->where('purpose', $purpose)
          ->whereNull('consumed_at')
          ->update([
            'consumed_at' => now(),
          ]);

        return OtpCode::query()->create([
          'phone' => $phone,
          'code_hash' => Hash::make($code),
          'purpose' => $purpose,
          'attempts' => 0,
          'expires_at' => $expiresAt,
        ]);
      });

      return [
        'expires_at' => $otp->expires_at->toIso8601String(),
        'resend_after' => self::RESEND_COOLDOWN_SECONDS,
      ];
    } catch (ValidationException $exception) {
      throw $exception;
    } catch (Throwable $exception) {
      /*
             * کد خام و اطلاعات اتصال نباید وارد Log شوند.
             * فقط خطای عمومی به لایه کنترلر منتقل می‌شود.
             */
      // report($exception);

      throw ValidationException::withMessages([
        'phone' => 'ارسال کد تأیید با مشکل مواجه شد. لطفاً بعداً دوباره تلاش کنید.',
      ]);
    }
  }

  /**
   * بررسی کد OTP.
   *
   * کد صحیح بلافاصله مصرف می‌شود و قابل استفاده مجدد نیست.
   */

  public function verify(
    string $phone,
    string $code,
    string $purpose
  ): bool {
    $phone = $this->normalizePhone($phone);
    $this->validatePurpose($purpose);

    $code = $this->normalizeDigits($code);

    if (! preg_match('/^\d{6}$/', $code)) {
      throw ValidationException::withMessages([
        'code' => 'کد تأیید باید شامل ۶ رقم باشد.',
      ]);
    }

    $result = DB::transaction(function () use (
      $phone,
      $code,
      $purpose
    ) {
      $otp = OtpCode::query()
        ->where('phone', $phone)
        ->where('purpose', $purpose)
        ->whereNull('consumed_at')
        ->latest('id')
        ->lockForUpdate()
        ->first();

      if (! $otp) {
        return ['status' => 'not_found'];
      }

      if ($otp->expires_at->isPast()) {
        $otp->update([
          'consumed_at' => now(),
        ]);

        return ['status' => 'expired'];
      }

      if ($otp->attempts >= self::MAX_VERIFY_ATTEMPTS) {
        $otp->update([
          'consumed_at' => now(),
        ]);

        return ['status' => 'locked'];
      }

      if (! Hash::check($code, $otp->code_hash)) {
        $attempts = $otp->attempts + 1;

        $otp->update([
          'attempts' => $attempts,
          'consumed_at' => $attempts >= self::MAX_VERIFY_ATTEMPTS
            ? now()
            : null,
        ]);

        return [
          'status' => $attempts >= self::MAX_VERIFY_ATTEMPTS
            ? 'locked'
            : 'invalid',
        ];
      }

      $otp->update([
        'verified_at' => now(),
        'consumed_at' => now(),
      ]);

      return ['status' => 'verified'];
    });

    return match ($result['status']) {
      'verified' => true,

      'expired' => throw ValidationException::withMessages([
        'code' => 'زمان اعتبار کد تأیید به پایان رسیده است.',
      ]),

      'locked' => throw ValidationException::withMessages([
        'code' => 'تعداد تلاش‌های مجاز به پایان رسیده است. کد جدید درخواست کنید.',
      ]),

      'invalid' => throw ValidationException::withMessages([
        'code' => 'کد تأیید واردشده صحیح نیست.',
      ]),

      default => throw ValidationException::withMessages([
        'code' => 'کد تأیید معتبر نیست یا قبلاً استفاده شده است.',
      ]),
    };
  }


  /**
   * بی‌اعتبار کردن کدهای فعال یک شماره و هدف.
   */
  public function invalidate(string $phone, string $purpose): void
  {
    $phone = $this->normalizePhone($phone);
    $this->validatePurpose($purpose);

    OtpCode::query()
      ->where('phone', $phone)
      ->where('purpose', $purpose)
      ->whereNull('consumed_at')
      ->update([
        'consumed_at' => now(),
      ]);
  }

  /**
   * تولید کد شش رقمی.
   */
  private function generateCode(): string
  {
    return str_pad(
      (string) random_int(0, 999999),
      self::CODE_LENGTH,
      '0',
      STR_PAD_LEFT
    );
  }

  /**
   * نرمال‌سازی ارقام فارسی و عربی.
   */
  private function normalizeDigits(string $value): string
  {
    return strtr($value, [
      '۰' => '0',
      '۱' => '1',
      '۲' => '2',
      '۳' => '3',
      '۴' => '4',
      '۵' => '5',
      '۶' => '6',
      '۷' => '7',
      '۸' => '8',
      '۹' => '9',

      '٠' => '0',
      '١' => '1',
      '٢' => '2',
      '٣' => '3',
      '٤' => '4',
      '٥' => '5',
      '٦' => '6',
      '٧' => '7',
      '٨' => '8',
      '٩' => '9',
    ]);
  }

  /**
   * نرمال‌سازی شماره موبایل ایران.
   *
   * ورودی‌های قابل قبول:
   * 09123456789
   * 989123456789
   * +989123456789
   * 00989123456789
   */
  public function normalizePhone(string $phone): string
  {
    $phone = $this->normalizeDigits(trim($phone));

    $phone = preg_replace('/[\s\-\(\)]/', '', $phone) ?? $phone;

    if (str_starts_with($phone, '+98')) {
      $phone = '0' . substr($phone, 3);
    } elseif (str_starts_with($phone, '0098')) {
      $phone = '0' . substr($phone, 4);
    } elseif (str_starts_with($phone, '98') && strlen($phone) === 12) {
      $phone = '0' . substr($phone, 2);
    }

    if (! preg_match('/^09\d{9}$/', $phone)) {
      throw ValidationException::withMessages([
        'phone' => 'شماره موبایل واردشده معتبر نیست.',
      ]);
    }

    return $phone;
  }

  /**
   * اعتبارسنجی هدف OTP.
   */
  private function validatePurpose(string $purpose): void
  {
    if (! in_array($purpose, OtpCode::PURPOSES, true)) {
      throw new RuntimeException(
        'هدف درخواست کد تأیید معتبر نیست.'
      );
    }
  }
}
