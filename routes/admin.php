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
  });
// });
