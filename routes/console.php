<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Artisan::command('inspire', function () {
//     $this->comment(Inspiring::quote());
// })->purpose('Display an inspiring quote');

Schedule::command('app:cancel-pending-bookings')
    ->everyFiveMinutes();

// complete booking
Schedule::command('app:auto-complete-bookings')
    ->hourly()
    ->withoutOverlapping()
    ->runInBackground()
    ->onSuccess(function () {
        \Illuminate\Support\Facades\Log::info('Auto-complete bookings ran successfully');
    })
    ->onFailure(function () {
        \Illuminate\Support\Facades\Log::error('Auto-complete bookings failed');
    });

// send reminder booking completion
Schedule::command('app:send-completion-reminders')
    ->hourly()
    ->withoutOverlapping();

// release wllet
Schedule::command('wallet:release-locked')->everyTenMinutes();
// create wallet for users who dosen't have ones
Schedule::command('wallets:backfill')->everyMinute();
