<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\BarberBookingController;
use App\Http\Controllers\Admin\BarberController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DisputeController;
use App\Http\Controllers\Admin\RolesController;
use Illuminate\Support\Facades\Route;

// Route::group(['middleware' => ''], function () {
Route::controller(DashboardController::class)->group(function () {
  Route::get('/dashboard',  'index')->name('dashboard');
});
Route::prefix('/roles')
  ->name('role.')->controller(RolesController::class)->group(function () {
    Route::get('/',  'index')->name('list');
    Route::get('/create',  'create')->name('create');
    Route::post('/store',  'store')->name('store');
    Route::get('/{role}/edit',  'edit')->name('edit');
    Route::put('/{role}/update',  'update')->name('update');
    Route::delete('/{role}/destroy',  'destroy')->name('destroy');
  });
// admins list
Route::prefix('/admins')
  ->name('admins.')->controller(AdminController::class)->group(function () {
    Route::get('/', 'index')->name('list');
    Route::get('/create', 'create')->name('create');
    Route::post('/store', 'store')->name('store');
    Route::get('/{user:slug}/edit',  'edit')->name('edit');
    Route::put('/{user:slug}/update',  'update')->name('update');
    Route::delete('/{admin}/destroy',  'destroy')->name('destroy');

    Route::get('/online-status', [AdminController::class, 'onlineStatus'])
      ->name('online-status');
  });
// barbers list
Route::prefix('/barbers')
  ->name('barbers.')->controller(BarberController::class)->group(function () {
    Route::get('/', 'index')->name('list');
    Route::get('/{barber:slug}/detail',  'show')->name('show');
    Route::get('/create', 'create')->name('create');
    Route::post('/store', 'store')->name('store');
    Route::get('/{user:slug}/edit',  'edit')->name('edit');
    Route::put('/{user:slug}/update',  'update')->name('update');
    Route::delete('/{barber}/destroy',  'destroy')->name('destroy');

    Route::get('/online-status', 'onlineStatus')
      ->name('online-status');
  });

Route::prefix('/bookings')
  ->name('bookings.')->controller(BarberBookingController::class)
  ->group(function () {

    // رزروهای آرایشگر
    Route::get('/barber/{barber:slug}',  'index')
      ->name('.bookings.index');
    Route::get('/{barber}/barber/{booking}',  'show')
      ->name('show');

    Route::delete('/barber/{barber}/cancel/{booking}',  'cancel')
      ->name('cancel');

    Route::patch('/{barber}/barbers/{booking}/complete', 'complete')->name('complete');
  });

Route::prefix('disputes')->controller(DisputeController::class)
  ->name('disputes.')
  ->group(function () {
    Route::get('/',  'index')
      ->name('index');

    Route::get('/{dispute}',  'show')
      ->name('show');

    Route::post('/{dispute}/resolve',  'resolve')
      ->name('resolve');

    Route::post('/{dispute}/request-response',  'requestResponse')
      ->name('request-response');
  });

// });
