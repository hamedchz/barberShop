<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return inertia('Welcome');
});

// Route::get('/login', function () {
//     return Inertia::render('Auth/Login');
// })->name('login');
