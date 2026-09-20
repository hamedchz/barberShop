<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
  Route::get('/login', [AuthController::class, 'show'])->name('login');

  Route::post('/login', [AuthController::class, 'store'])->name('post.login');
});
