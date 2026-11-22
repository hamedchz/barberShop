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
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('auth.login');
        }

        if (
            $user->status !== UserStatus::ACTIVE ||
            ! $user->is_active
        ) {
            // پیام را قبل از خروج از حساب استخراج می‌کنیم.
            $message = $this->messageFor($user->status);

            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            StickyAlert::alert($message, 'error');

            return redirect()->route('auth.login');
        }

        return $next($request);
    }

    private function messageFor(?UserStatus $status): string
    {
        return match ($status) {
            UserStatus::PENDING => 'حساب شما هنوز تأیید نشده است.',
            UserStatus::INACTIVE => 'حساب شما غیرفعال است. برای فعال‌سازی اقدام کنید.',
            UserStatus::SUSPENDED => 'حساب شما موقتاً معلق شده است. با پشتیبانی تماس بگیرید.',
            UserStatus::BANNED => 'حساب شما مسدود شده است.',
            default => 'امکان ورود به حساب کاربری وجود ندارد.',
        };
    }
}
