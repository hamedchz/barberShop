<?php

use App\Http\Controllers\Customer\BookingController;
use App\Http\Controllers\Customer\DisputeController;
use App\Http\Controllers\Customer\PaymentController;
use App\Http\Controllers\Customer\ReviewController;
use Illuminate\Support\Facades\Route;

Route::prefix('/bookings')
  ->name('bookings.')->controller(BookingController::class)->group(function () {
    // رزرو
    Route::post('/create', 'create')
      ->name('create');

    Route::get('/', 'index')->name('index');
    Route::delete('/{booking}/cancel', 'cancel')
      ->name('cancel');

    Route::get('/{booking}', 'show')
      ->name('show');

    Route::delete('/{booking}/cancel', 'cancel')
      ->name('destroy');

    Route::patch('/{booking}/complete', 'complete')
      ->name('complete');

    Route::post('/{booking}/dispute', 'dispute')
      ->name('dispute');
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

Route::prefix('bookings/reviews')->name('reviews.')->controller(ReviewController::class)->group(function () {


  // ثبت نظر
  Route::get('/{booking}',  'create')
    ->name('create');

  Route::post('/{booking}',  'store')
    ->name('store');

  // ویرایش نظر
  Route::get('/{review}/edit',  'edit')
    ->name('edit');

  Route::put('/{review}',  'update')
    ->name('update');

  // حذف نظر
  Route::delete('/{review}/delete',  'destroy')
    ->name('destroy');
});

// dispute
Route::prefix('disputes')->name('disputes.')->controller(DisputeController::class)->group(function () {
  // ویرایش اعتراض
  Route::get('/{dispute}/edit',  'edit')
    ->name('edit');
  Route::put('/{dispute}',  'update')
    ->name('update');

  // حذف اعتراض
  Route::delete('/{dispute}/destroy',  'destroy')
    ->name('destroy');

  // پاسخ به درخواست ادمین
  Route::post('/{dispute}/respond',  'respond')
    ->name('respond');
});
