<?php

namespace Tests\Feature\Auth;

use App\Http\Controllers\Auth\OtpController;
use App\Models\OtpCode;
use App\Models\User;
use App\Services\Sms\SmsTemplateManager;
use Alizeinodin\SmsApi\DTOs\SendResult;
use App\Enums\Casts\UserStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;




class OtpControllerTest extends TestCase
{
  use RefreshDatabase;

  private string $phone = '09123456789';

  /**
   * ارسال موفق پیامک را شبیه‌سازی می‌کند
   * و کد تولیدشده را برای استفاده در تست در اختیارمان می‌گذارد.
   */
  private function mockSuccessfulSms(string &$capturedCode): void
  {
    $capturedCode = '';

    $this->mock(
      SmsTemplateManager::class,
      function (MockInterface $mock) use (&$capturedCode) {
        $mock->shouldReceive('sendOtp')
          ->once()
          ->with(
            $this->phone,
            \Mockery::type('string')
          )
          ->andReturnUsing(
            function ($phone, $code) use (&$capturedCode) {
              $capturedCode = $code;

              return new SendResult(
                success: true,
                message: 'SMS sent successfully',
                driver: 'kavenegar'
              );
            }
          );
      }
    );
  }

  /**
   * درخواست ارسال OTP را انجام می‌دهد
   * و کد تولیدشده را برمی‌گرداند.
   */
  private function sendOtpAndCaptureCode(): string
  {
    $capturedCode = '';

    $this->mockSuccessfulSms($capturedCode);

    $response = $this->postJson(
      route('auth.register.otp.send'),
      ['phone' => $this->phone]
    );

    $response->assertOk()
      ->assertJsonStructure([
        'message',
        'expires_at',
        'resend_after',
      ]);

    $this->assertNotEmpty($capturedCode);

    return $capturedCode;
  }

  #[Test]
  public function it_sends_registration_otp_successfully(): void
  {
    $capturedCode = '';

    $this->mockSuccessfulSms($capturedCode);

    $response = $this->postJson(
      route('auth.register.otp.send'),
      ['phone' => $this->phone]
    );

    $response->assertOk()
      ->assertJsonStructure([
        'message',
        'expires_at',
        'resend_after',
      ]);

    $this->assertNotEmpty($capturedCode);
    $this->assertSame(6, strlen($capturedCode));
    $this->assertMatchesRegularExpression('/^\d{6}$/', $capturedCode);

    $this->assertDatabaseHas('otp_codes', [
      'phone' => $this->phone,
      'purpose' => OtpCode::PURPOSE_REGISTRATION,
    ]);
  }

  #[Test]
  public function it_rejects_sending_otp_for_an_already_registered_phone(): void
  {
    User::query()->create([
      'name' => 'کاربر آزمایشی',
      'phone' => $this->phone,
      'slug' => 'test-user-' . uniqid(),
      'password' => bcrypt('Password123'),
      'is_admin' => false,
      'is_active' => true,
      'status' => UserStatus::ACTIVE,
    ]);

    $response = $this->postJson(
      route('auth.register.otp.send'),
      ['phone' => $this->phone]
    );

    $response->assertUnprocessable()
      ->assertJsonValidationErrors(['phone']);

    $this->assertDatabaseCount('otp_codes', 0);
  }

  #[Test]
  public function it_rejects_sending_otp_for_a_soft_deleted_user_phone(): void
  {
    $user = User::query()->create([
      'name' => 'کاربر آزمایشی',
      'phone' => $this->phone,
      'slug' => 'test-user-' . uniqid(),
      'password' => bcrypt('Password123'),
      'is_admin' => false,
      'is_active' => true,
      'status' => UserStatus::ACTIVE,
    ]);

    $user->delete();

    $response = $this->postJson(
      route('auth.register.otp.send'),
      ['phone' => $this->phone]
    );

    $response->assertUnprocessable()
      ->assertJsonValidationErrors(['phone']);

    $this->assertDatabaseCount('otp_codes', 0);
  }

  #[Test]
  public function it_verifies_registration_otp_successfully(): void
  {
    $capturedCode = $this->sendOtpAndCaptureCode();

    $response = $this->postJson(
      route('auth.register.otp.verify'),
      [
        'phone' => $this->phone,
        'code' => $capturedCode,
      ]
    );

    $response->assertOk()
      ->assertJson([
        'verified' => true,
      ]);

    // بررسی مصرف و تأیید OTP در دیتابیس
    $this->assertDatabaseHas('otp_codes', [
      'phone' => $this->phone,
      'purpose' => OtpCode::PURPOSE_REGISTRATION,
      'consumed_at' => now()->toDateTimeString(),
    ]);

    // بررسی اطلاعات مجوز موقت ثبت‌نام در Session
    $sessionData = session()->get(
      OtpController::REGISTRATION_SESSION_KEY
    );

    $this->assertIsArray($sessionData);

    $this->assertSame(
      $this->phone,
      $sessionData['phone']
    );

    $this->assertSame(
      OtpCode::PURPOSE_REGISTRATION,
      $sessionData['purpose']
    );

    $this->assertArrayHasKey('verified_at', $sessionData);
    $this->assertArrayHasKey('expires_at', $sessionData);

    $this->assertGreaterThan(
      $sessionData['verified_at'],
      $sessionData['expires_at']
    );

    $this->assertGreaterThan(
      now()->timestamp,
      $sessionData['expires_at']
    );
  }
  #[Test]
  public function it_rejects_an_incorrect_registration_otp(): void
  {
    $capturedCode = $this->sendOtpAndCaptureCode();

    $wrongCode = $capturedCode === '000000'
      ? '000001'
      : '000000';

    $response = $this->postJson(
      route('auth.register.otp.verify'),
      [
        'phone' => $this->phone,
        'code' => $wrongCode,
      ]
    );

    $response->assertUnprocessable()
      ->assertJsonValidationErrors(['code']);

    $this->assertDatabaseHas('otp_codes', [
      'phone' => $this->phone,
      'purpose' => OtpCode::PURPOSE_REGISTRATION,
      'consumed_at' => null,
      'attempts' => 1,
    ]);

    $this->assertFalse(
      session()->has(OtpController::REGISTRATION_SESSION_KEY)
    );
  }

  #[Test]
  public function it_prevents_reusing_a_verified_registration_otp(): void
  {
    $capturedCode = $this->sendOtpAndCaptureCode();

    $firstResponse = $this->postJson(
      route('auth.register.otp.verify'),
      [
        'phone' => $this->phone,
        'code' => $capturedCode,
      ]
    );

    $firstResponse->assertOk()
      ->assertJson(['verified' => true]);

    $secondResponse = $this->postJson(
      route('auth.register.otp.verify'),
      [
        'phone' => $this->phone,
        'code' => $capturedCode,
      ]
    );

    $secondResponse->assertUnprocessable()
      ->assertJsonValidationErrors(['code']);
  }

  #[Test]
  public function it_normalizes_persian_phone_numbers_when_sending_otp(): void
  {
    $capturedCode = '';

    $this->mockSuccessfulSms($capturedCode);

    $response = $this->postJson(
      route('auth.register.otp.send'),
      [
        'phone' => '۰۹۱۲۳۴۵۶۷۸۹',
      ]
    );

    $response->assertOk();

    $this->assertNotEmpty($capturedCode);

    $this->assertDatabaseHas('otp_codes', [
      'phone' => $this->phone,
      'purpose' => OtpCode::PURPOSE_REGISTRATION,
    ]);
  }

  #[Test]
  public function it_rejects_verification_for_an_already_registered_phone(): void
  {
    User::query()->create([
      'name' => 'کاربر آزمایشی',
      'phone' => $this->phone,
      'slug' => 'test-user-' . uniqid(),
      'password' => bcrypt('Password123'),
      'is_admin' => false,
      'is_active' => true,
      'status' => UserStatus::ACTIVE,
    ]);

    $response = $this->postJson(
      route('auth.register.otp.verify'),
      [
        'phone' => $this->phone,
        'code' => '123456',
      ]
    );

    $response->assertUnprocessable()
      ->assertJsonValidationErrors(['phone']);

    $this->assertFalse(
      session()->has(OtpController::REGISTRATION_SESSION_KEY)
    );
  }

  #[Test]
  public function it_rejects_invalid_registration_otp_input(): void
  {
    $response = $this->postJson(
      route('auth.register.otp.verify'),
      [
        'phone' => $this->phone,
        'code' => '123',
      ]
    );

    $response->assertUnprocessable()
      ->assertJsonValidationErrors(['code']);
  }
}
