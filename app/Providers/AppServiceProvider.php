<?php

namespace App\Providers;

use App\Models\User;
use App\Observers\UserObserver;
use App\Services\PaymentConfigService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        User::observe(UserObserver::class);
        if (\Illuminate\Support\Facades\Schema::hasTable('payment_settings')) {
            PaymentConfigService::apply();
        }
    }
}
