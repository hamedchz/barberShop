<?php

namespace Tests\Feature\Auth;

use App\Enums\Casts\UserStatus;
use App\Http\Controllers\Auth\OtpController;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RegistrationControllerTest extends TestCase
{
  use RefreshDatabase;

  private string $phone = '09123456789';

  private Role $customerRole;

  private Permission $customerPermission;

  protected function setUp(): void
  {
    parent::setUp();

    $this->customerRole = Role::create([
      'name' => User::ROLE_CUSTOMER,
      'guard_name' => 'web',
    ]);

    $this->customerPermission = Permission::create([
      'name' => 'customer-dashboard-panel',
      'guard_name' => 'web',
    ]);
  }

  /**
   * اطلاعات معتبر ثبت‌نام.
   */
  private function registrationData(array $overrides = []): array
  {
    return array_merge([
      'name' => 'کاربر آزمایشی',
      'phone' => $this->phone,
      'password' => 'Password123',
      'password_confirmation' => 'Password123',
      'return_to' => '/services',
    ], $overrides);
  }

  /**
   * مجوز OTP معتبر در Session.
   */
  private function verifiedRegistrationSession(
    ?string $phone = null,
    ?int $expiresAt = null,
    ?int $verifiedAt = null
  ): array {
    return [
      OtpController::REGISTRATION_SESSION_KEY => [
        'phone' => $phone ?? $this->phone,
        'purpose' => OtpCode::PURPOSE_REGISTRATION,
        'verified_at' => $verifiedAt ?? now()->timestamp,
        'expires_at' => $expiresAt ?? now()->addMinutes(5)->timestamp,
      ],
    ];
  }

  /**
   * ایجاد کاربر قبلی برای تست شماره تکراری.
   */
  private function createExistingUser(): User
  {
    return User::query()->create([
      'name' => 'کاربر قبلی',
      'slug' => 'existing-user-' . uniqid(),
      'phone' => $this->phone,
      'password' => 'Password123',
      'phone_verified_at' => now(),
      'status' => UserStatus::ACTIVE,
      'is_active' => true,
      'is_admin' => false,
    ]);
  }

  #[Test]
  public function it_registers_customer_after_valid_otp_verification(): void
  {
    $response = $this
      ->withSession($this->verifiedRegistrationSession())
      ->postJson(
        route('auth.register.store'),
        $this->registrationData()
      );

    $response
      ->assertOk()
      ->assertJson([
        'message' => 'ثبت‌نام با موفقیت انجام شد.',
        'redirect' => '/services',
      ]);

    $user = User::query()
      ->where('phone', $this->phone)
      ->first();

    $this->assertNotNull($user);

    $this->assertSame('کاربر آزمایشی', $user->name);
    $this->assertSame($this->phone, $user->phone);
    $this->assertNotNull($user->phone_verified_at);
    $this->assertTrue((bool) $user->is_active);
    $this->assertFalse((bool) $user->is_admin);
    $this->assertSame(UserStatus::ACTIVE, $user->status);

    $this->assertTrue($user->hasRole(User::ROLE_CUSTOMER));

    $this->assertTrue(
      $user->hasDirectPermission('customer-dashboard-panel')
    );

    $this->assertAuthenticatedAs($user, 'web');
  }

  #[Test]
  public function it_rejects_registration_without_otp_verification(): void
  {
    $response = $this->postJson(
      route('auth.register.store'),
      $this->registrationData()
    );

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors('phone');

    $this->assertDatabaseMissing('users', [
      'phone' => $this->phone,
    ]);

    $this->assertGuest('web');
  }

  #[Test]
  public function it_rejects_registration_with_different_phone_from_verified_phone(): void
  {
    $response = $this
      ->withSession($this->verifiedRegistrationSession())
      ->postJson(
        route('auth.register.store'),
        $this->registrationData([
          'phone' => '09111111111',
        ])
      );

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors('phone');

    $this->assertDatabaseMissing('users', [
      'phone' => '09111111111',
    ]);

    $this->assertGuest('web');
  }

  #[Test]
  public function it_rejects_registration_with_expired_otp_session(): void
  {
    $response = $this
      ->withSession(
        $this->verifiedRegistrationSession(
          expiresAt: now()->subMinute()->timestamp
        )
      )
      ->postJson(
        route('auth.register.store'),
        $this->registrationData()
      );

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors('phone');

    $this->assertDatabaseMissing('users', [
      'phone' => $this->phone,
    ]);
  }

  #[Test]
  public function it_rejects_registration_when_otp_verified_at_is_in_future(): void
  {
    $response = $this
      ->withSession(
        $this->verifiedRegistrationSession(
          verifiedAt: now()->addMinute()->timestamp
        )
      )
      ->postJson(
        route('auth.register.store'),
        $this->registrationData()
      );

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors('phone');

    $this->assertDatabaseMissing('users', [
      'phone' => $this->phone,
    ]);
  }

  #[Test]
  public function it_rejects_registration_with_wrong_otp_purpose(): void
  {
    $session = $this->verifiedRegistrationSession();

    $session[OtpController::REGISTRATION_SESSION_KEY]['purpose']
      = OtpCode::PURPOSE_PASSWORD_RESET;

    $response = $this
      ->withSession($session)
      ->postJson(
        route('auth.register.store'),
        $this->registrationData()
      );

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors('phone');

    $this->assertDatabaseMissing('users', [
      'phone' => $this->phone,
    ]);
  }

  #[Test]
  public function it_rejects_registration_when_phone_already_exists(): void
  {
    $this->createExistingUser();

    $response = $this
      ->withSession($this->verifiedRegistrationSession())
      ->postJson(
        route('auth.register.store'),
        $this->registrationData()
      );

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors('phone');

    $this->assertSame(
      1,
      User::withTrashed()
        ->where('phone', $this->phone)
        ->count()
    );

    $this->assertGuest('web');
  }

  #[Test]
  public function it_rejects_registration_with_soft_deleted_phone(): void
  {
    $user = $this->createExistingUser();

    $user->delete();

    $response = $this
      ->withSession($this->verifiedRegistrationSession())
      ->postJson(
        route('auth.register.store'),
        $this->registrationData()
      );

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors('phone');

    $this->assertSame(
      1,
      User::withTrashed()
        ->where('phone', $this->phone)
        ->count()
    );
  }

  #[Test]
  public function it_uses_default_redirect_for_external_return_url(): void
  {
    $response = $this
      ->withSession($this->verifiedRegistrationSession())
      ->postJson(
        route('auth.register.store'),
        $this->registrationData([
          'return_to' => 'https://example.com',
        ])
      );

    $response
      ->assertOk()
      ->assertJson([
        'redirect' => route('user.home'),
      ]);
  }

  #[Test]
  public function it_rejects_protocol_relative_return_url(): void
  {
    $response = $this
      ->withSession($this->verifiedRegistrationSession())
      ->postJson(
        route('auth.register.store'),
        $this->registrationData([
          'return_to' => '//example.com',
        ])
      );

    $response
      ->assertOk()
      ->assertJson([
        'redirect' => route('user.home'),
      ]);
  }

  #[Test]
  public function it_rejects_invalid_registration_data(): void
  {
    $response = $this
      ->withSession($this->verifiedRegistrationSession())
      ->postJson(
        route('auth.register.store'),
        [
          'name' => 'A',
          'phone' => $this->phone,
          'password' => '123',
          'password_confirmation' => '456',
        ]
      );

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors([
        'name',
        'password',
      ]);

    $this->assertDatabaseMissing('users', [
      'phone' => $this->phone,
    ]);
  }

  #[Test]
  public function it_consumes_otp_session_after_registration_attempt(): void
  {
    $this
      ->withSession($this->verifiedRegistrationSession())
      ->postJson(
        route('auth.register.store'),
        $this->registrationData()
      )
      ->assertOk();

    $this->assertNull(
      session()->get(OtpController::REGISTRATION_SESSION_KEY)
    );
  }
}
