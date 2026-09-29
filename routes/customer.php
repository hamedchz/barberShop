<?php

use App\Http\Controllers\Customer\BookingController;
use App\Http\Controllers\Customer\PaymentController;
use Illuminate\Support\Facades\Route;

Route::prefix('/bookings')
  ->name('bookings.')->controller(BookingController::class)->group(function () {
    // رزرو
    Route::post('/create', 'create')
      ->name('create');
  });
Route::prefix('/payment')
  ->name('payment.')->controller(PaymentController::class)->group(function () {
    // پرداخت
    Route::post('/pay', 'pay')
      ->name('pay');

    Route::get('/callback/{gateway}',  'callback')
      ->name('callback');

    Route::get('/success/{booking}',  'success')
      ->name('success');

    Route::get('/failed/{booking}',  'failed')
      ->name('failed');
  });
