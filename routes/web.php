<?php

use App\Http\Controllers\Customer\BarberController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::prefix('/barbers')
    ->name('barbers.')->controller(BarberController::class)->group(function () {
        // لیست آرایشگران
        Route::get('/', 'index')->name('index');

        // جزئیات آرایشگر
        Route::get('/{barber}', 'show')->name('show');
    });
