<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Barber\BarberAvailabilityController;
use App\Http\Controllers\Barber\TimeSlotController;

Route::prefix('/availability')
  ->name('availability.')->controller(BarberAvailabilityController::class)->group(function () {


    Route::get('/', 'index')->name('list');
    Route::post('/', 'storeAvailability')->name('store');
    Route::get('/{availability}', 'destroyAvailability')->name('destroy');
  });

Route::prefix('/time-slots')
  ->name('time-slots.')->controller(TimeSlotController::class)->group(function () {


    Route::post('/generate', 'generateTimeSlots')->name('generate');
    Route::patch('/{timeSlot}', 'updateTimeSlot')->name('update');
    Route::delete('/{timeSlot}', 'destroyTimeSlot')->name('destroy');
  });
