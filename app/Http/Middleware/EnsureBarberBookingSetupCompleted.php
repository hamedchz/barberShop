<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\BarberBookingSetupService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBarberBookingSetupCompleted
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // فقط برای آرایشگر اجرا شود
        if (!$user || !$user->hasRole(User::ROLE_BARBER)) {
            return $next($request);
        }

        // وضعیت راه‌اندازی
        $setup = app(BarberBookingSetupService::class)
            ->getStatus($user);

        $isCompleted =
            $setup['workingDays'] &&
            $setup['services'] &&
            $setup['generatedSlots'];

        // اگر راه‌اندازی کامل شده، محدودیتی وجود ندارد
        if ($isCompleted) {
            return $next($request);
        }

        // مسیرهای مجاز هنگام راه‌اندازی
        $allowedRoutes = [
            'barber.setup',
            'barber.availabilities.*',
            'barber.services.*',
            'barber.time-slots.*',
            'barber.notifications.*',
            'barber.profile.*',
        ];

        // داشبورد باید به صفحه راه‌اندازی منتقل شود
        if ($request->routeIs('barber.dashboard')) {
            return to_route('barber.setup');
        }

        // بررسی مسیرهای مجاز
        if ($request->routeIs(...$allowedRoutes)) {
            return $next($request);
        }

        // سایر صفحات مسدود شوند
        return to_route('barber.setup');
    }
}
