<?php

namespace App\Http\Controllers\Auth;

use App\Enums\Casts\UserStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * نمایش صفحه ورود قدیمی
     */
    public function show()
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * ورود کاربر
     */
    public function store(Request $request)
    {

        $credentials = $request->validate([
            'phone' => [
                'required',
                'string',
                'regex:/^09\d{9}$/',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
            ],
        ], [
            'phone.required' => 'شماره موبایل الزامی است.',
            'phone.regex' => 'شماره موبایل معتبر نیست.',
            'password.required' => 'رمز عبور الزامی است.',
            'password.min' => 'رمز عبور حداقل باید ۸ کاراکتر باشد.',
        ]);

        /*
         * کاربر حذف‌شده نرم‌افزاری به دلیل SoftDeletes
         * در این جستجو پیدا نمی‌شود.
         */
        $user = User::query()
            ->where('phone', $credentials['phone'])
            ->first();

        /*
         * برای کاربر ناموجود و رمز اشتباه،
         * پیام یکسان نمایش می‌دهیم.
         */
        if (
            ! $user ||
            ! Hash::check($credentials['password'], $user->password)
        ) {
            throw ValidationException::withMessages([
                'phone' => 'شماره موبایل یا رمز عبور اشتباه است.',
            ]);
        }

        /*
         * بررسی تأیید شماره موبایل
         */
        if (! $user->phone_verified_at) {
            throw ValidationException::withMessages([
                'phone' => 'شماره تلفن شما تأیید نشده است. لطفاً ابتدا آن را تأیید کنید.',
            ]);
        }

        /*
         * بررسی وضعیت حساب
         */
        if (
            $user->status !== UserStatus::ACTIVE ||
            ! $user->is_active
        ) {
            throw ValidationException::withMessages([
                'phone' => $this->messageForStatus($user),
            ]);
        }

        /*
         * ورود با Session
         */
        Auth::guard('web')->login(
            $user,
            $request->boolean('remember')
        );

        // جلوگیری از Session Fixation
        $request->session()->regenerate();

        // ثبت زمان آخرین ورود
        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        /*
         * تعیین مقصد بر اساس نوع کاربر
         */
        $redirectUrl = $this->redirectUrl(
            $user,
            $request->input('return_to')
        );

        /*
         * پاسخ مناسب برای مودال و درخواست AJAX
         */
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'با موفقیت وارد حساب کاربری شدید.',
                'redirect' => $redirectUrl,
            ]);
        }

        return redirect()->to($redirectUrl);
    }

    /**
     * خروج کاربر
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('auth.login');
    }

    /**
     * تعیین پیام متناسب با وضعیت حساب
     */
    private function messageForStatus(User $user): string
    {
        if (! $user->is_active && $user->status === UserStatus::ACTIVE) {
            return 'حساب شما غیرفعال است. برای فعال‌سازی با پشتیبانی تماس بگیرید.';
        }

        return match ($user->status) {
            UserStatus::PENDING => 'حساب شما هنوز تأیید نشده است.',
            UserStatus::INACTIVE => 'حساب شما غیرفعال است. برای فعال‌سازی اقدام کنید.',
            UserStatus::SUSPENDED => 'حساب شما موقتاً معلق شده است. با پشتیبانی تماس بگیرید.',
            UserStatus::BANNED => 'حساب شما مسدود شده است.',
            default => 'امکان ورود به حساب کاربری وجود ندارد.',
        };
    }

    /**
     * تعیین مقصد بعد از ورود
     */
    private function redirectUrl(User $user, mixed $returnTo): string
    {
        /*
         * مدیر و سوپر ادمین همیشه وارد پنل مدیریت می‌شوند.
         */
        if (
            $user->is_admin ||
            $user->hasRole(User::ROLE_SUPER_ADMIN)
        ) {
            return route('admin.dashboard');
        }

        /*
         * مشتری و آرایشگر به صفحه قبلی برمی‌گردند.
         */
        return $this->safeReturnUrl($returnTo);
    }

    /**
     * جلوگیری از Open Redirect
     */
    private function safeReturnUrl(mixed $returnTo): string
    {
        $fallback = route('user.home');

        if (! is_string($returnTo) || trim($returnTo) === '') {
            return $fallback;
        }

        $returnTo = trim($returnTo);

        // فقط مسیرهای داخلی مجاز هستند.
        if (
            ! str_starts_with($returnTo, '/') ||
            str_starts_with($returnTo, '//') ||
            str_contains($returnTo, '\\') ||
            preg_match('/[\x00-\x1F\x7F]/', $returnTo)
        ) {
            return $fallback;
        }

        $parsed = parse_url($returnTo);

        if (
            $parsed === false ||
            isset($parsed['scheme']) ||
            isset($parsed['host']) ||
            isset($parsed['user']) ||
            isset($parsed['pass'])
        ) {
            return $fallback;
        }

        return $returnTo;
    }
}
