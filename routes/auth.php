<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\OtpController;
use App\Http\Controllers\Auth\RegistrationController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {

  Route::get('/login', [AuthController::class, 'show'])
    ->name('login');

  Route::post('/login', [AuthController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('post.login');

  Route::post('/register/otp/send', [OtpController::class, 'sendRegistration'])
    ->middleware('throttle:5,10')
    ->name('register.otp.send');

  Route::post('/register/otp/verify', [OtpController::class, 'verifyRegistration'])
    ->middleware('throttle:10,10')
    ->name('register.otp.verify');

  Route::post('/register', [RegistrationController::class, 'store'])
    ->middleware('throttle:5,10')
    ->name('register.store');
});

Route::middleware('auth')->group(function () {
  Route::post('/logout', [AuthController::class, 'destroy'])
    ->name('logout');
});
