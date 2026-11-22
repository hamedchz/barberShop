<?php

namespace Tests\Unit\Services\Sms;

use App\Models\OtpCode;
use App\Services\Sms\OtpService;
use App\Services\Sms\SmsTemplateManager;
use Alizeinodin\SmsApi\DTOs\SendResult;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Mockery\MockInterface;
use Tests\TestCase;

class OtpServiceTest extends TestCase
{
  use RefreshDatabase;

  private OtpService $otpService;

  private string $phone = '09123456789';

  protected function setUp(): void
  {
    parent::setUp();

    $this->otpService = app(OtpService::class);
  }

  /**
   * Mock ارسال موفق پیامک.
   */
  private function mockSuccessfulSms(
    int $times = 1,
    ?callable $callback = null
  ): void {
    $this->mock(
      SmsTemplateManager::class,
      function (MockInterface $mock) use ($times, $callback) {
        $mock->shouldReceive('sendOtp')
          ->times($times)
          ->with(
            $this->phone,
            \Mockery::type('string')
          )
          ->andReturnUsing(function ($phone, $code) use ($callback) {
            if ($callback) {
              $callback($phone, $code);
            }

            return new SendResult(
              success: true,
              message: 'SMS sent successfully',
              driver: 'kavenegar'
            );
          });
      }
    );
  }

  #[\PHPUnit\Framework\Attributes\Test]
  public function it_sends_otp_and_stores_only_hashed_code(): void
  {
    $capturedCode = '';

    $this->mockSuccessfulSms(
      callback: function ($phone, $code) use (&$capturedCode) {
        $capturedCode = $code;
      }
    );

    $result = $this->otpService->send(
      $this->phone,
      OtpCode::PURPOSE_REGISTRATION
    );

    $this->assertSame(60, $result['resend_after']);

    $otp = OtpCode::query()->first();

    $this->assertNotNull($otp);
    $this->assertSame($this->phone, $otp->phone);
    $this->assertSame(
      OtpCode::PURPOSE_REGISTRATION,
      $otp->purpose
    );

    $this->assertSame(0, $otp->attempts);

    $this->assertNotSame($capturedCode, $otp->code_hash);

    $this->assertNotEmpty($capturedCode);

    $this->assertTrue(
      Hash::check($capturedCode, $otp->code_hash)
    );

    $this->assertSame(6, strlen($capturedCode));
    $this->assertMatchesRegularExpression('/^\d{6}$/', $capturedCode);

    $this->assertNull($otp->verified_at);
    $this->assertNull($otp->consumed_at);

    $this->assertNotNull($otp->expires_at);
    $this->assertTrue($otp->expires_at->isFuture());
  }

  #[\PHPUnit\Framework\Attributes\Test]
  public function it_normalizes_persian_phone_numbers(): void
  {
    $this->mockSuccessfulSms();

    $this->otpService->send(
      '۰۹۱۲۳۴۵۶۷۸۹',
      OtpCode::PURPOSE_REGISTRATION
    );

    $this->assertDatabaseHas('otp_codes', [
      'phone' => $this->phone,
      'purpose' => OtpCode::PURPOSE_REGISTRATION,
    ]);
  }

  #[\PHPUnit\Framework\Attributes\Test]
  public function it_rejects_resending_before_cooldown_expires(): void
  {
    $this->mockSuccessfulSms();

    $this->otpService->send(
      $this->phone,
      OtpCode::PURPOSE_REGISTRATION
    );

    try {
      $this->otpService->send(
        $this->phone,
        OtpCode::PURPOSE_REGISTRATION
      );

      $this->fail('Expected ValidationException was not thrown.');
    } catch (ValidationException $exception) {
      $this->assertArrayHasKey(
        'phone',
        $exception->errors()
      );
    }

    $this->assertDatabaseCount('otp_codes', 1);
  }

  #[\PHPUnit\Framework\Attributes\Test]
  public function it_limits_otp_sends_to_three_requests_in_ten_minutes(): void
  {
    $this->mockSuccessfulSms(times: 3);

    for ($i = 0; $i < 3; $i++) {
      if ($i > 0) {
        $this->travel(61)->seconds();
      }

      $this->otpService->send(
        $this->phone,
        OtpCode::PURPOSE_REGISTRATION
      );
    }

    try {
      $this->otpService->send(
        $this->phone,
        OtpCode::PURPOSE_REGISTRATION
      );

      $this->fail('Expected send limit exception was not thrown.');
    } catch (ValidationException $exception) {
      $this->assertArrayHasKey(
        'phone',
        $exception->errors()
      );
    }

    $this->assertDatabaseCount('otp_codes', 3);
  }

  #[\PHPUnit\Framework\Attributes\Test]
  public function it_does_not_store_otp_when_sms_sending_fails(): void
  {
    $this->mock(
      SmsTemplateManager::class,
      function (MockInterface $mock) {
        $mock->shouldReceive('sendOtp')
          ->once()
          ->andReturn(
            new SendResult(
              success: false,
              message: 'SMS failed',
              driver: 'kavenegar'
            )
          );
      }
    );

    try {
      $this->otpService->send(
        $this->phone,
        OtpCode::PURPOSE_REGISTRATION
      );

      $this->fail('Expected ValidationException was not thrown.');
    } catch (ValidationException $exception) {
      $this->assertArrayHasKey(
        'phone',
        $exception->errors()
      );
    }

    $this->assertDatabaseCount('otp_codes', 0);
  }

  #[\PHPUnit\Framework\Attributes\Test]
  public function it_consumes_previous_otp_after_successful_resend(): void
  {
    $this->mockSuccessfulSms(times: 2);

    $this->otpService->send(
      $this->phone,
      OtpCode::PURPOSE_REGISTRATION
    );

    $firstOtp = OtpCode::query()->first();

    $this->travel(61)->seconds();

    $this->otpService->send(
      $this->phone,
      OtpCode::PURPOSE_REGISTRATION
    );

    $firstOtp->refresh();

    $secondOtp = OtpCode::query()
      ->latest('id')
      ->first();

    $this->assertNotNull($firstOtp->consumed_at);
    $this->assertNull($secondOtp->consumed_at);

    $this->assertDatabaseCount('otp_codes', 2);
  }

  #[\PHPUnit\Framework\Attributes\Test]
  public function it_verifies_correct_otp_and_consumes_it(): void
  {
    $capturedCode = '';

    $this->mockSuccessfulSms(
      callback: function ($phone, $code) use (&$capturedCode) {
        $capturedCode = $code;
      }
    );

    $this->otpService->send(
      $this->phone,
      OtpCode::PURPOSE_REGISTRATION
    );

    $result = $this->otpService->verify(
      $this->phone,
      $capturedCode,
      OtpCode::PURPOSE_REGISTRATION
    );

    $this->assertTrue($result);

    $otp = OtpCode::query()->first();

    $this->assertNotNull($otp->verified_at);
    $this->assertNotNull($otp->consumed_at);
  }

  #[\PHPUnit\Framework\Attributes\Test]
  public function it_rejects_reusing_a_verified_otp(): void
  {
    $capturedCode = '';

    $this->mockSuccessfulSms(
      callback: function ($phone, $code) use (&$capturedCode) {
        $capturedCode = $code;
      }
    );

    $this->otpService->send(
      $this->phone,
      OtpCode::PURPOSE_REGISTRATION
    );

    $this->otpService->verify(
      $this->phone,
      $capturedCode,
      OtpCode::PURPOSE_REGISTRATION
    );

    $this->expectException(ValidationException::class);

    $this->otpService->verify(
      $this->phone,
      $capturedCode,
      OtpCode::PURPOSE_REGISTRATION
    );
  }

  #[\PHPUnit\Framework\Attributes\Test]
  public function it_increments_attempts_for_wrong_code(): void
  {
    $this->mockSuccessfulSms();

    $this->otpService->send(
      $this->phone,
      OtpCode::PURPOSE_REGISTRATION
    );

    try {
      $this->otpService->verify(
        $this->phone,
        '000000',
        OtpCode::PURPOSE_REGISTRATION
      );
    } catch (ValidationException) {
      // انتظار خطای کد اشتباه
    }

    $otp = OtpCode::query()->first();

    $this->assertSame(1, $otp->attempts);
    $this->assertNull($otp->consumed_at);
  }

  #[\PHPUnit\Framework\Attributes\Test]
  public function it_consumes_otp_after_five_wrong_attempts(): void
  {
    $this->mockSuccessfulSms();

    $this->otpService->send(
      $this->phone,
      OtpCode::PURPOSE_REGISTRATION
    );

    for ($i = 0; $i < 5; $i++) {
      try {
        $this->otpService->verify(
          $this->phone,
          '000000',
          OtpCode::PURPOSE_REGISTRATION
        );
      } catch (ValidationException) {
        // تلاش ناموفق مورد انتظار است.
      }
    }

    $otp = OtpCode::query()->first();

    $this->assertSame(5, $otp->attempts);
    $this->assertNotNull($otp->consumed_at);
  }

  #[\PHPUnit\Framework\Attributes\Test]
  public function it_rejects_expired_otp(): void
  {
    $this->mockSuccessfulSms();

    $this->otpService->send(
      $this->phone,
      OtpCode::PURPOSE_REGISTRATION
    );

    $this->travel(121)->seconds();

    try {
      $this->otpService->verify(
        $this->phone,
        '123456',
        OtpCode::PURPOSE_REGISTRATION
      );

      $this->fail('Expected expiration exception was not thrown.');
    } catch (ValidationException $exception) {
      $this->assertArrayHasKey(
        'code',
        $exception->errors()
      );
    }

    $otp = OtpCode::query()->first();

    $this->assertNotNull($otp->consumed_at);
  }

  #[\PHPUnit\Framework\Attributes\Test]
  public function it_normalizes_persian_otp_digits(): void
  {
    $capturedCode = '';

    $this->mockSuccessfulSms(
      callback: function ($phone, $code) use (&$capturedCode) {
        $capturedCode = $code;
      }
    );

    $this->otpService->send(
      $this->phone,
      OtpCode::PURPOSE_REGISTRATION
    );

    $persianCode = strtr($capturedCode, [
      '0' => '۰',
      '1' => '۱',
      '2' => '۲',
      '3' => '۳',
      '4' => '۴',
      '5' => '۵',
      '6' => '۶',
      '7' => '۷',
      '8' => '۸',
      '9' => '۹',
    ]);

    $this->assertTrue(
      $this->otpService->verify(
        $this->phone,
        $persianCode,
        OtpCode::PURPOSE_REGISTRATION
      )
    );
  }

  #[\PHPUnit\Framework\Attributes\Test]
  public function it_rejects_invalid_phone_numbers(): void
  {
    $this->expectException(ValidationException::class);

    $this->otpService->send(
      '123456',
      OtpCode::PURPOSE_REGISTRATION
    );
  }

  #[\PHPUnit\Framework\Attributes\Test]
  public function it_rejects_invalid_otp_purpose(): void
  {
    $this->expectException(\RuntimeException::class);

    $this->otpService->send(
      $this->phone,
      'invalid-purpose'
    );
  }

  #[\PHPUnit\Framework\Attributes\Test]
  public function it_can_invalidate_active_otps(): void
  {
    $this->mockSuccessfulSms();

    $this->otpService->send(
      $this->phone,
      OtpCode::PURPOSE_REGISTRATION
    );

    $this->otpService->invalidate(
      $this->phone,
      OtpCode::PURPOSE_REGISTRATION
    );

    $otp = OtpCode::query()->first();

    $this->assertNotNull($otp->consumed_at);
  }
}
