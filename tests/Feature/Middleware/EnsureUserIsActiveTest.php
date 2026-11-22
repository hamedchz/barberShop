<?php

namespace Tests\Feature\Middleware;

use App\Enums\Casts\UserStatus;
use App\Http\Middleware\EnsureUserIsActive;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class EnsureUserIsActiveTest extends TestCase
{
  use RefreshDatabase;

  private function createUser(array $attributes = []): User
  {
    static $counter = 0;
    $counter++;

    return User::query()->forceCreate(array_merge([
      'name' => 'کاربر آزمایشی',
      'slug' => 'middleware-user-' . uniqid(),
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

  protected function setUp(): void
  {
    parent::setUp();

    Route::middleware([
      'web',
      'auth',
      EnsureUserIsActive::class,
    ])->get('/test-active-account', function () {
      return response()->json([
        'message' => 'دسترسی مجاز است.',
      ]);
    });
  }

  public function test_active_user_can_access_protected_route(): void
  {
    $user = $this->createUser();

    $response = $this
      ->actingAs($user)
      ->getJson('/test-active-account');

    $response
      ->assertOk()
      ->assertJson([
        'message' => 'دسترسی مجاز است.',
      ]);

    $this->assertAuthenticatedAs($user);
  }

  public function test_guest_is_redirected_to_login(): void
  {
    $response = $this->get('/test-active-account');

    $response->assertRedirect(route('auth.login'));

    $this->assertGuest();
  }

  public function test_inactive_user_is_logged_out(): void
  {
    $user = $this->createUser([
      'status' => UserStatus::INACTIVE,
      'is_active' => false,
    ]);

    $response = $this
      ->actingAs($user)
      ->get('/test-active-account');

    $response->assertRedirect(route('auth.login'));

    $this->assertGuest('web');
  }

  public function test_suspended_user_is_logged_out(): void
  {
    $user = $this->createUser([
      'status' => UserStatus::SUSPENDED,
    ]);

    $response = $this
      ->actingAs($user)
      ->get('/test-active-account');

    $response->assertRedirect(route('auth.login'));

    $this->assertGuest('web');
  }

  public function test_banned_user_is_logged_out(): void
  {
    $user = $this->createUser([
      'status' => UserStatus::BANNED,
    ]);

    $response = $this
      ->actingAs($user)
      ->get('/test-active-account');

    $response->assertRedirect(route('auth.login'));

    $this->assertGuest('web');
  }

  public function test_pending_user_is_logged_out(): void
  {
    $user = $this->createUser([
      'status' => UserStatus::PENDING,
    ]);

    $response = $this
      ->actingAs($user)
      ->get('/test-active-account');

    $response->assertRedirect(route('auth.login'));

    $this->assertGuest('web');
  }

  public function test_user_with_inactive_flag_is_logged_out_even_when_status_is_active(): void
  {
    $user = $this->createUser([
      'status' => UserStatus::ACTIVE,
      'is_active' => false,
    ]);

    $response = $this
      ->actingAs($user)
      ->get('/test-active-account');

    $response->assertRedirect(route('auth.login'));

    $this->assertGuest('web');
  }
}
