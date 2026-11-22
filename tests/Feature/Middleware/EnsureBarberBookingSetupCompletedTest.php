<?php

namespace Tests\Feature\Middleware;

use App\Enums\Casts\UserStatus;
use App\Http\Middleware\EnsureBarberBookingSetupCompleted;
use App\Models\User;
use App\Services\BarberBookingSetupService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Routing\Route as RoutingRoute;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class EnsureBarberBookingSetupCompletedTest extends TestCase
{
  use RefreshDatabase;

  private function createUser(array $attributes = []): User
  {
    static $counter = 0;
    $counter++;

    return User::query()->forceCreate(array_merge([
      'name' => 'آرایشگر آزمایشی',
      'slug' => 'test-barber-' . uniqid(),
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

  private function createBarber(): User
  {
    $role = Role::firstOrCreate([
      'name' => User::ROLE_BARBER,
      'guard_name' => 'web',
    ]);

    $user = $this->createUser();
    $user->assignRole($role);

    return $user;
  }

  private function mockSetupStatus(array $status = []): void
  {
    $mock = $this->mock(BarberBookingSetupService::class);

    $mock->shouldReceive('getStatus')
      ->once()
      ->andReturn(array_merge([
        'workingDays' => false,
        'services' => false,
        'generatedSlots' => false,
        'firstServiceId' => null,
      ], $status));
  }

  private function callMiddleware(
    User $user,
    string $routeName
  ) {
    // مسیرهای واقعی را از Route Collection دریافت می‌کنیم.
    $route = Route::getRoutes()->getByName($routeName);

    // برای مسیر آزمایشی که در پروژه وجود ندارد،
    // یک Route مستقل می‌سازیم.
    if (! $route) {
      $route = new RoutingRoute(
        ['GET'],
        '/__tests/barber/other',
        fn() => response('OK')
      );

      $route->name($routeName);
    }

    $request = Request::create('/__tests/barber', 'GET');

    $request->setRouteResolver(fn() => $route);
    $request->setUserResolver(fn() => $user);

    return app(EnsureBarberBookingSetupCompleted::class)
      ->handle(
        $request,
        fn() => response('OK', 200)
      );
  }

  public function test_barber_with_completed_setup_can_access_dashboard(): void
  {
    $user = $this->createBarber();

    $this->mockSetupStatus([
      'workingDays' => true,
      'services' => true,
      'generatedSlots' => true,
    ]);

    $response = $this->callMiddleware(
      $user,
      'barber.dashboard'
    );

    $this->assertSame(200, $response->getStatusCode());
  }

  public function test_barber_with_incomplete_setup_is_redirected_from_dashboard(): void
  {
    $user = $this->createBarber();

    $this->mockSetupStatus([
      'workingDays' => true,
      'services' => true,
      'generatedSlots' => false,
    ]);

    $response = $this->callMiddleware(
      $user,
      'barber.dashboard'
    );

    $this->assertSame(302, $response->getStatusCode());
    $this->assertSame(
      route('barber.setup'),
      $response->headers->get('Location')
    );
  }

  public function test_barber_with_incomplete_setup_can_access_availabilities(): void
  {
    $user = $this->createBarber();

    $this->mockSetupStatus();

    $response = $this->callMiddleware(
      $user,
      'barber.availabilities.index'
    );

    $this->assertSame(200, $response->getStatusCode());
  }

  public function test_barber_with_incomplete_setup_can_access_services(): void
  {
    $user = $this->createBarber();

    $this->mockSetupStatus();

    $response = $this->callMiddleware(
      $user,
      'barber.services.index'
    );

    $this->assertSame(200, $response->getStatusCode());
  }

  public function test_barber_with_incomplete_setup_can_access_time_slots(): void
  {
    $user = $this->createBarber();

    $this->mockSetupStatus();

    $response = $this->callMiddleware(
      $user,
      'barber.time-slots.index'
    );

    $this->assertSame(200, $response->getStatusCode());
  }

  public function test_barber_with_incomplete_setup_can_access_notifications(): void
  {
    $user = $this->createBarber();

    $this->mockSetupStatus();

    $response = $this->callMiddleware(
      $user,
      'barber.notifications.index'
    );

    $this->assertSame(200, $response->getStatusCode());
  }

  public function test_barber_with_incomplete_setup_can_access_profile(): void
  {
    $user = $this->createBarber();

    $this->mockSetupStatus();

    $response = $this->callMiddleware(
      $user,
      'barber.profile.edit'
    );

    $this->assertSame(200, $response->getStatusCode());
  }

  public function test_barber_with_incomplete_setup_cannot_access_reviews(): void
  {
    $user = $this->createBarber();

    $this->mockSetupStatus();

    $response = $this->callMiddleware(
      $user,
      'barber.reviews.index'
    );

    $this->assertSame(302, $response->getStatusCode());
    $this->assertSame(
      route('barber.setup'),
      $response->headers->get('Location')
    );
  }

  public function test_barber_with_incomplete_setup_cannot_access_other_pages(): void
  {
    $user = $this->createBarber();

    $this->mockSetupStatus();

    $response = $this->callMiddleware(
      $user,
      'barber.other'
    );

    $this->assertSame(302, $response->getStatusCode());
    $this->assertSame(
      route('barber.setup'),
      $response->headers->get('Location')
    );
  }

  public function test_non_barber_user_bypasses_booking_setup_check(): void
  {
    $user = $this->createUser();

    $mock = $this->mock(BarberBookingSetupService::class);

    $mock->shouldNotReceive('getStatus');

    $response = $this->callMiddleware(
      $user,
      'barber.dashboard'
    );

    $this->assertSame(200, $response->getStatusCode());
  }
}
