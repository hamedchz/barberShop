<?php

namespace App\Http\Controllers\Barber;

use App\Http\Controllers\Controller;
use App\Services\BarberBookingSetupService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class BookingSetupController extends Controller
{
    public function index(
        Request $request,
        BarberBookingSetupService $bookingSetupService
    ): Response|RedirectResponse {

        $user = $request->user();

        // دریافت وضعیت راه‌اندازی آرایشگر
        $bookingSetup = $bookingSetupService->getStatus($user);

        // اگر تمام مراحل تکمیل شده‌اند، ورود به داشبورد
        $isCompleted =
            ($bookingSetup['workingDays'] ?? false) &&
            ($bookingSetup['services'] ?? false) &&
            ($bookingSetup['generatedSlots'] ?? false);

        if ($isCompleted) {
            return to_route('barber.dashboard');
        }

        return Inertia::render('Barber/Setup/Index', [
            'bookingSetup' => $bookingSetup,
        ]);
    }
}
