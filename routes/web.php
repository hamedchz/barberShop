<?php

use App\Http\Controllers\Customer\BarberController;
use App\Http\Controllers\Customer\BookingController;
use App\Http\Controllers\Customer\ReviewController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::prefix('/barber/reviews')
    ->name('barber.reviews.')->controller(ReviewController::class)->group(function () {
        Route::get('/{barber:slug}/list', 'reviews')->name('reviews');
    });
Route::prefix('/barbers')
    ->name('barbers.')->controller(BarberController::class)->group(function () {
        // لیست آرایشگران
        Route::get('/', 'index')->name('index');

        // جزئیات آرایشگر
        Route::get('/{barber:slug}/details', 'show')->name('show');
    });
