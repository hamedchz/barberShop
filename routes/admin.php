<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\BankController;
use App\Http\Controllers\Admin\BarberBookingController;
use App\Http\Controllers\Admin\BarberController;
use App\Http\Controllers\Admin\CommissionController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DisputeController;
use App\Http\Controllers\Admin\FinanceController;
use App\Http\Controllers\Admin\FinanceExportController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\RolesController;
use App\Http\Controllers\Admin\SettlementController;
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

// permissions
Route::prefix('permissions')
  ->name('permissions.')->controller(PermissionController::class)
  ->group(function () {
    Route::get(
      '/search',
      'search'
    )->name('search');
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

Route::prefix('bookings')
  ->name('bookings.')->controller(BarberBookingController::class)
  ->group(function () {

    // رزروهای آرایشگر
    Route::get('/barber/{barber:slug}',  'index')
      ->name('index');
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

// review
Route::prefix('/reviews')
  ->name('reviews.')->controller(ReviewController::class)
  ->group(function () {


    Route::patch('/{review:id}/approve', 'approve')->name('approve');
    Route::patch('/{review:id}/reject', 'reject')->name('reject');

    // Route::delete('/barber/{barber}/cancel/{booking}',  'cancel')
    //   ->name('cancel');
  });

// finances
// routes/web.php


Route::prefix('finance')->name('finance.')->group(function () {
  // داشبورد مالی
  Route::controller(FinanceController::class)->group(function () {
    Route::get('/',  'index')->name('index');
    // Route::get('/settlements/list', 'settlements')->name('settlements.index');
    // Route::get('/{settlement}/settlements/details', 'showSettlement')->name('settlements.show');

    // تراکنشها
    Route::get('/transactions', 'transactions')->name('transactions');

    // شارژها
    Route::get('/deposits', 'deposits')->name('deposits');

    // گزارش درآمد
    Route::get('/revenue', 'revenue')->name('revenue');
  });
  Route::prefix('payments')->name('payments.')->controller(PaymentController::class)->group(function () {
    Route::get('/',  'index')
      ->name('index');
    // Route::get('/payments/export',  'export')
    //   ->name('payments.export');
  });
  // تسویه ها
  Route::prefix('settlements')->name('settlements.')->controller(SettlementController::class)->group(function () {
    Route::get('/',  'index')->name('index');
    Route::get('/{settlement}',  'show')->name('show');
    Route::post('/{settlement}/process',  'process')->name('process');
    Route::post('/{settlement}/complete',  'complete')->name('complete');
    Route::post('/{settlement}/reject',  'reject')->name('reject');
    Route::post('/{settlement}/cancel',  'cancel')->name('cancel');
    Route::post('/bulk-process', 'bulkProcess')->name('bulk-process');
  });

  // Export CSV
  Route::prefix('export')->name('export.')->controller(FinanceExportController::class)->group(function () {
    Route::get('/revenue',  'revenueCsv')
      ->name('revenue');
    Route::get('/settlements',  'settlementsCsv')
      ->name('settlements');
    Route::get('/deposits',  'depositsCsv')
      ->name('deposits');
    Route::get('/transactions',  'transactionsCsv')
      ->name('transactions');
  });

  Route::prefix('commission')
    ->name('commission.')->controller(CommissionController::class)
    ->group(function () {

      Route::get('/', 'index')->name('index');
      Route::post('/default', 'updateDefault')->name('update-default');
      Route::post('/users/{user}', 'updateUserRate')->name('update-user');
      Route::delete('/users/{user}', 'removeUserRate')->name('remove-user');
    });
});

// banks
// routes/web.php


Route::prefix('banks')->name('banks.')->controller(BankController::class)->group(function () {
  Route::get('/',  'index')->name('index');
  Route::post('/',  'store')->name('store');
  Route::put('/{bank}',  'update')->name('update');
  Route::delete('/{bank}',  'destroy')->name('destroy');
  Route::patch('/{bank}/toggle',  'toggleStatus')->name('toggle');

  Route::get('/search', 'search')
    ->name('search');
});

// customers

Route::prefix('customers')->name('customers.')->controller(CustomerController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/{customer}', 'show')->name('show');
  Route::patch('/{customer}/toggle', 'toggleStatus')->name('toggle');
  Route::patch('/{customer}/status', 'updateStatus')
    ->name('update-status');
});
 
   
  
// });
