<?php

namespace App\Http\Middleware;

use App\Enums\Casts\UserStatus;
use App\Supports\StickyAlert;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    // app/Http/Middleware/EnsureUserIsActive.php
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->status !== UserStatus::ACTIVE) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            StickyAlert::alert($this->messageFor($user->status), 'error');
            return redirect()->route('auth.login');
        }

        return $next($request);
    }

    private function messageFor(UserStatus $status): string
    {
        return match ($status) {
            UserStatus::PENDING   => 'حساب شما هنوز تأیید نشده است.',
            UserStatus::INACTIVE  => 'حساب شما غیرفعال است. برای فعال‌سازی اقدام کنید.',
            UserStatus::SUSPENDED => 'حساب شما موقتاً معلق شده است. با پشتیبانی تماس بگیرید.',
            UserStatus::BANNED    => 'حساب شما مسدود شده است.',
            default               => 'امکان ورود وجود ندارد.',
        };
    }
}
