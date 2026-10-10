<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Barber\AvailabilityController;
use App\Http\Controllers\Barber\BankInfoController;
use App\Http\Controllers\Barber\BookingController;
use App\Http\Controllers\Barber\DisputeController;
use App\Http\Controllers\Barber\ServiceController;
use App\Http\Controllers\Barber\TimeSlotController;
use App\Http\Controllers\Barber\WalletController;

// خدمات
// Route::resource('services', ServiceController::class)->except(['show'])
//   ->names('service');
Route::prefix('/services')
  ->name('services.')->controller(ServiceController::class)->group(function () {
    Route::get('/',  'index')->name('index');
    Route::get('/create',  'create')->name('create');
    Route::post('/store',  'store')->name('store');
    Route::get('/{service}/edit',  'edit')->name('edit');
    Route::put('/{service}',  'update')->name('update');
    Route::delete('/{service}',  'destroy')->name('destroy');
  });

Route::prefix('/availabilities')
  ->name('availabilities.')->controller(AvailabilityController::class)->group(function () {


    Route::get('/', 'index')->name('index');
    Route::post('/', 'store')->name('store');
    Route::delete('/{availability}', 'destroy')->name('destroy');
  });

Route::prefix('/time-slots')
  ->name('time-slots.')->controller(TimeSlotController::class)->group(function () {

    Route::get('/',  'index')->name('index');
    Route::post('/generate', 'generate')->name('generate');
    Route::patch('/{timeSlot}',  'update')->name('update');
    Route::delete('/{timeSlot}', 'destroy')->name('destroy');
  });
Route::prefix('/bookings')->name('bookings.')->controller(BookingController::class)->group(function () {
  Route::get('/',  'index')->name('index');
  Route::get('/{booking}',  'show')->name('show');
  Route::patch('/{booking}/confirm',  'confirm')->name('confirm');
  Route::patch('/{booking}/complete',  'complete')->name('complete');
  Route::delete('/{booking}/cancel',  'cancel')->name('cancel');
});

// dispute
Route::prefix('disputes')
  ->name('disputes.')->controller(DisputeController::class)
  ->group(function () {
    // اعتراض آرایشگر
    Route::post('/bookings/{booking}',  'store')
      ->name('store');

    Route::get('/{dispute}/edit',  'edit')
      ->name('edit');

    Route::put('/{dispute}',  'update')
      ->name('update');

    Route::delete('/{dispute}/destroy',  'destroy')
      ->name('destroy');

    Route::post('/{dispute}/respond',  'respond')
      ->name('respond');
  });

// wallet finance
// routes/web.php

Route::prefix('finance')
  ->name('finance.')
  ->group(function () {
    Route::prefix('wallet')->controller(WalletController::class)
      ->name('wallet.')
      ->group(function () {
        Route::get('/',  'index')->name('index');
        Route::get('/transactions',  'transactions')->name('transactions');
        Route::get('/settlements',  'settlements')->name('settlements');
        Route::post('/withdraw',  'requestWithdrawal')->name('withdraw');
        // Route::post('/bank-info',  'updateBankInfo')->name('bank-info');
      });

    Route::prefix('profile')->name('profile.')->controller(BankInfoController::class)->group(function () {
      Route::get('/bank-info',  'show')->name('bank-info');
      Route::post('/bank-info',  'update')->name('bank-info.update');
    });
  });
