<?php

use App\Http\Controllers\Customer\BankInfoController;
use App\Http\Controllers\Customer\BarberController;
use App\Http\Controllers\Customer\BookingController;
use App\Http\Controllers\Customer\ReviewController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\User\BankController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::prefix('/')
    ->name('home')->controller(HomeController::class)->group(function () {
        Route::get('/', 'index')->name('home');
    });

Route::prefix('/barber/reviews')
    ->name('barber.reviews.')->controller(ReviewController::class)->group(function () {
        Route::get('/{barber:slug}/list', 'reviews')->name('reviews');
    });
Route::prefix('/barbers')
    ->name('barbers.')->controller(BarberController::class)->group(function () {
        // لیست آرایشگران
        Route::get('/', 'index')->name('index');

        // جزئیات آرایشگر
        Route::get('/{barber:slug}/details', 'show')->name('show');
    });

Route::prefix('banks')
    ->name('banks.')->controller(BankController::class)
    ->group(function () {
        // جستجوی بانکها
        Route::get('/search',  'search')
            ->name('search');

        Route::get('/{bank}',  'show')
            ->name('show');
    });

// // صفحه اصلی
// Route::get('/', [HomeController::class, 'index'])->name('home');

// // آرایشگران
// Route::get('/barbers', [BarberController::class, 'index'])->name('barbers.index');
// Route::get('/barbers/{barber}', [BarberController::class, 'show'])->name('barbers.show');
// Route::get('/barbers/{barber}/reviews', [BarberController::class, 'reviews'])->name('barbers.reviews');

// // رزرو (برای همه، اما نیاز به auth برای ثبت نهایی)
// Route::get('/barbers/{barber}/book', [BarberController::class, 'booking'])
//     ->name('barbers.booking');
// Route::post('/barbers/{barber}/book', [BarberController::class, 'storeBooking'])
//     ->middleware('auth')
//     ->name('barbers.booking.store');

// // صفحات ثابت
// Route::get('/about', [PageController::class, 'about'])->name('about');
// Route::get('/faq', [PageController::class, 'faq'])->name('faq');
// Route::get('/terms', [PageController::class, 'terms'])->name('terms');
// Route::get('/privacy', [PageController::class, 'privacy'])->name('privacy');

// // تماس
// Route::get('/contact', [ContactController::class, 'index'])->name('contact');
// Route::post('/contact', [ContactController::class, 'send'])->name('contact.send');

// // جستجو
// Route::get('/search', [BarberController::class, 'search'])->name('search');

// // شهرها
// Route::get('/cities', [PageController::class, 'cities'])->name('cities');
// Route::get('/cities/{city}', [BarberController::class, 'byCity'])->name('cities.show');

// // خدمات
// Route::get('/services', [PageController::class, 'services'])->name('services');
