<?php

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

Route::prefix('/admins')
  ->name('admins.')->controller(AdminController::class)->group(function () {
    Route::get('/', AllAdmins::class)->name('list');
    Route::get('/create', 'create')->name('create');
    Route::post('/store', 'store')->name('store');
    Route::get('/{user:slug}/edit',  'edit')->name('edit');
    Route::patch('/{user:slug}/update',  'update')->name('update');
  });
// });
