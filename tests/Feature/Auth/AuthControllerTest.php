<?php

namespace Tests\Feature\Auth;

use App\Enums\Casts\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
  use RefreshDatabase;


  private function createUser(array $attributes = []): User
  {
    static $counter = 0;
    $counter++;

    return User::query()->forceCreate(array_merge([
      'name' => 'کاربر آزمایشی',
      'slug' => 'test-user-' . uniqid(),
      'phone' => '091200000' . str_pad(
        (string) $counter,
        2,
        '0',
        STR_PAD_LEFT
      ),
      'password' => 'Password123',
      'is_admin' => false,
      'is_active' => true,
      'status' => UserStatus::ACTIVE,
      'phone_verified_at' => now(),
    ], $attributes));
  }


  public function test_user_can_login_successfully(): void
  {
    $user = $this->createUser();

    $response = $this->postJson(route('auth.post.login'), [
      'phone' => $user->phone,
      'password' => 'Password123',
    ]);

    $response
      ->assertOk()
      ->assertJsonStructure([
        'message',
        'redirect',
      ])
      ->assertJson([
        'redirect' => route('user.home'),
      ]);

    $this->assertAuthenticatedAs($user);

    $this->assertNotNull(
      $user->fresh()->last_login_at
    );
  }

  public function test_login_fails_with_wrong_password(): void
  {
    $user = $this->createUser();

    $response = $this->postJson(route('auth.post.login'), [
      'phone' => $user->phone,
      'password' => 'WrongPassword123',
    ]);

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors('phone');

    $this->assertGuest();
  }

  public function test_login_fails_for_non_existing_phone(): void
  {
    $response = $this->postJson(route('auth.post.login'), [
      'phone' => '09129999999',
      'password' => 'Password123',
    ]);

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors('phone');

    $this->assertGuest();
  }

  public function test_login_fails_for_unverified_phone(): void
  {
    $user = $this->createUser([
      'phone_verified_at' => null,
    ]);

    $response = $this->postJson(route('auth.post.login'), [
      'phone' => $user->phone,
      'password' => 'Password123',
    ]);

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors('phone');

    $this->assertGuest();
  }

  public function test_login_fails_for_inactive_user(): void
  {
    $user = $this->createUser([
      'status' => UserStatus::INACTIVE,
      'is_active' => false,
    ]);

    $response = $this->postJson(route('auth.post.login'), [
      'phone' => $user->phone,
      'password' => 'Password123',
    ]);

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors('phone');

    $this->assertGuest();
  }

  public function test_login_fails_for_suspended_user(): void
  {
    $user = $this->createUser([
      'status' => UserStatus::SUSPENDED,
    ]);

    $response = $this->postJson(route('auth.post.login'), [
      'phone' => $user->phone,
      'password' => 'Password123',
    ]);

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors('phone');

    $this->assertGuest();
  }

  public function test_login_fails_for_banned_user(): void
  {
    $user = $this->createUser([
      'status' => UserStatus::BANNED,
    ]);

    $response = $this->postJson(route('auth.post.login'), [
      'phone' => $user->phone,
      'password' => 'Password123',
    ]);

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors('phone');

    $this->assertGuest();
  }

  public function test_customer_returns_to_previous_internal_page(): void
  {
    $user = $this->createUser();

    $response = $this->postJson(route('auth.post.login'), [
      'phone' => $user->phone,
      'password' => 'Password123',
      'return_to' => '/barbers/test-barber',
    ]);

    $response
      ->assertOk()
      ->assertJson([
        'redirect' => '/barbers/test-barber',
      ]);

    $this->assertAuthenticatedAs($user);
  }

  public function test_external_return_url_is_rejected(): void
  {
    $user = $this->createUser();

    $response = $this->postJson(route('auth.post.login'), [
      'phone' => $user->phone,
      'password' => 'Password123',
      'return_to' => 'https://example.com',
    ]);

    $response
      ->assertOk()
      ->assertJson([
        'redirect' => route('user.home'),
      ]);
  }

  public function test_admin_is_redirected_to_admin_dashboard(): void
  {
    $user = $this->createUser([
      'is_admin' => true,
    ]);

    $response = $this->postJson(route('auth.post.login'), [
      'phone' => $user->phone,
      'password' => 'Password123',
      'return_to' => '/some-page',
    ]);

    $response
      ->assertOk()
      ->assertJson([
        'redirect' => route('admin.dashboard'),
      ]);
  }

  public function test_super_admin_is_redirected_to_admin_dashboard(): void
  {
    $user = $this->createUser();

    $role = Role::query()->firstOrCreate([
      'name' => User::ROLE_SUPER_ADMIN,
      'guard_name' => 'web',
    ]);

    $user->assignRole($role);

    $response = $this->postJson(route('auth.post.login'), [
      'phone' => $user->phone,
      'password' => 'Password123',
    ]);

    $response
      ->assertOk()
      ->assertJson([
        'redirect' => route('admin.dashboard'),
      ]);
  }

  public function test_invalid_phone_format_is_rejected(): void
  {
    $response = $this->postJson(route('auth.post.login'), [
      'phone' => '12345',
      'password' => 'Password123',
    ]);

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors('phone');

    $this->assertGuest();
  }

  public function test_short_password_is_rejected(): void
  {
    $response = $this->postJson(route('auth.post.login'), [
      'phone' => '09120000000',
      'password' => '123',
    ]);

    $response
      ->assertUnprocessable()
      ->assertJsonValidationErrors('password');

    $this->assertGuest();
  }


  public function test_authenticated_user_can_logout_successfully(): void
  {
    $user = $this->createUser();

    $this->actingAs($user);

    $response = $this->post(route('auth.logout'));

    $response
      ->assertRedirect(route('auth.login'));

    $this->assertGuest('web');
  }

  public function test_logout_invalidates_previous_session(): void
  {
    $user = $this->createUser();

    $this->actingAs($user);

    $session = session();

    $sessionIdBeforeLogout = $session->getId();

    $this->post(route('auth.logout'));

    $this->assertGuest('web');

    $this->assertNotSame(
      $sessionIdBeforeLogout,
      session()->getId()
    );
  }

  public function test_logout_regenerates_csrf_token(): void
  {
    $user = $this->createUser();

    $this->actingAs($user);

    $tokenBeforeLogout = session()->token();

    $this->post(route('auth.logout'));

    $tokenAfterLogout = session()->token();

    $this->assertNotSame(
      $tokenBeforeLogout,
      $tokenAfterLogout
    );
  }

  public function test_guest_cannot_logout(): void
  {
    $response = $this->post(route('auth.logout'));

    $response->assertRedirect(route('auth.login'));

    $this->assertGuest('web');
  }
}
