<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\BarberController;
use App\Http\Controllers\Admin\DashboardController;
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
    Route::get('/create', 'create')->name('create');
    Route::post('/store', 'store')->name('store');
    Route::get('/{user:slug}/edit',  'edit')->name('edit');
    Route::put('/{user:slug}/update',  'update')->name('update');
    Route::delete('/{barber}/destroy',  'destroy')->name('destroy');

    Route::get('/online-status', [BarberController::class, 'onlineStatus'])
      ->name('online-status');
  });

// });
