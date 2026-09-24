<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Barber\AvailabilityController;
use App\Http\Controllers\Barber\ServiceController;
use App\Http\Controllers\Barber\TimeSlotController;

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

    // Route::post('/generate', 'generateTimeSlots')->name('generate');
    // Route::patch('/{timeSlot}', 'updateTimeSlot')->name('update');
    // Route::delete('/{timeSlot}', 'destroyTimeSlot')->name('destroy');

    Route::get('/',  'index')->name('index');
    Route::post('/generate', 'generate')->name('generate');
    Route::patch('/{timeSlot}',  'update')->name('update');
    Route::delete('/{timeSlot}', 'destroy')->name('destroy');
  });
