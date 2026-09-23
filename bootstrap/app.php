<?php

use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\LogUserActivity;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use \Illuminate\Auth\Middleware\RedirectIfAuthenticated;


return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware(['web'])
                ->name('user.')
                ->group(base_path('routes/web.php'));

            // Route::prefix('{locale}/customer')
            //     ->middleware(['web', 'auth'])
            //     ->name('customer.')
            //     ->group(base_path('routes/customer.php'));
            // Route::prefix('{locale}/dashboard')
            //     ->middleware(['web', 'auth', 'check-email-verification'])
            //     ->name('member.')
            //     ->group(base_path('routes/member.php'));
            Route::prefix('admin')
                ->middleware(['web', 'auth', 'ensure-user-is-active'])
                ->name('admin.')
                ->group(base_path('routes/admin.php'));
            Route::prefix('barber')
                ->middleware(['web', 'auth', 'ensure-user-is-active'])
                ->name('barber.')
                ->group(base_path('routes/barber.php'));
            // Route::prefix('check')
            //     ->middleware(['web'])
            //     ->name('check.')
            //     ->group(base_path('routes/check.php'));
            Route::prefix('auth')->middleware(['web'])
                ->name('auth.')
                ->group(base_path('routes/auth.php'));
            // Route::prefix('api')
            //     ->group(base_path('routes/api.php'));
        },
    )

    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);
        $middleware->appendToGroup('web', LogUserActivity::class);
        RedirectIfAuthenticated::redirectUsing(fn() => route('user.home'));
        $middleware->redirectGuestsTo(fn(Request $request) => route('auth.login'));
        $middleware->alias([
            'ensure-user-is-active' => EnsureUserIsActive::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn(Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
