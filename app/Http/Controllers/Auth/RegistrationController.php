<?php

namespace App\Http\Controllers\Auth;

use App\Enums\Casts\Permissions;
use App\Enums\Casts\UserStatus;
use App\Facades\GenerateUtf8Slug;
use App\Http\Controllers\Controller;
use App\Models\OtpCode;
use App\Models\User;
use App\Services\Sms\OtpService;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RegistrationController extends Controller
{
    public function __construct(
        private readonly OtpService $otpService
    ) {}

    /**
     * ایجاد حساب مشتری پس از تأیید شماره موبایل.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'return_to' => ['nullable', 'string', 'max:2048'],
        ], [
            'name.required' => 'نام خود را وارد کنید.',
            'name.min' => 'نام باید حداقل ۲ کاراکتر باشد.',
            'phone.required' => 'شماره موبایل الزامی است.',
            'password.required' => 'رمز عبور را وارد کنید.',
            'password.min' => 'رمز عبور باید حداقل ۸ کاراکتر باشد.',
            'password.confirmed' => 'تکرار رمز عبور مطابقت ندارد.',
        ]);

        $phone = $this->otpService->normalizePhone(
            $validated['phone']
        );

        /*
         * مجوز OTP را از Session خارج می‌کنیم.
         * بنابراین حتی در صورت ارسال مجدد درخواست،
         * این مجوز دوباره قابل استفاده نخواهد بود.
         */
        $verification = $request->session()->pull(
            OtpController::REGISTRATION_SESSION_KEY
        );

        if (
            ! is_array($verification) ||
            ($verification['phone'] ?? null) !== $phone ||
            ($verification['purpose'] ?? null) !== OtpCode::PURPOSE_REGISTRATION ||
            ! isset($verification['verified_at'], $verification['expires_at']) ||
            $verification['verified_at'] > now()->timestamp ||
            $verification['expires_at'] <= now()->timestamp
        ) {
            throw ValidationException::withMessages([
                'phone' => 'تأیید شماره موبایل معتبر نیست. لطفاً دوباره کد تأیید دریافت کنید.',
            ]);
        }

        if (User::withTrashed()->where('phone', $phone)->exists()) {
            throw ValidationException::withMessages([
                'phone' => 'این شماره موبایل قبلاً ثبت شده است.',
            ]);
        }

        // نقش مشتری باید از قبل با guard برابر web تعریف شده باشد.
        $customerRole = Role::query()
            ->where('name', User::ROLE_CUSTOMER)
            ->where('guard_name', 'web')
            ->first();

        if (! $customerRole) {
            throw new RuntimeException(
                'نقش مشتری با guard برابر web در سیستم تعریف نشده است.'
            );
        }

        try {
            $customerPermission = Permission::findByName(
                Permissions::CustomerDashboardPanel->value,
                'web'
            );

            $user = DB::transaction(function () use (
                $validated,
                $phone,
                $customerRole,
                $customerPermission
            ) {

                $baseSlug = GenerateUtf8Slug::generateUtf8Slug($validated['name']);

                if ($baseSlug === '') {
                    $baseSlug = 'customer';
                }

                $slug = $this->generateUniqueSlug($baseSlug);

                $user = User::create([
                    'name' => $validated['name'],
                    'phone' => $phone,
                    'slug' => $slug,
                    'password' => $validated['password'],
                    'phone_verified_at' => now(),
                    'status' => UserStatus::ACTIVE,
                    'is_active' => true,
                    'is_admin' => false,
                ]);

                // اختصاص نقش مشتری
                $user->assignRole($customerRole);

                // اختصاص مستقیم مجوز پنل مشتری
                $user->givePermissionTo($customerPermission);

                return $user;
            });
        } catch (QueryException $exception) {
            /*
             * اگر درخواست هم‌زمان با همین شماره ثبت شده باشد،
             * Unique دیتابیس از ایجاد کاربر تکراری جلوگیری می‌کند.
             */
            if (
                User::withTrashed()
                ->where('phone', $phone)
                ->exists()
            ) {
                throw ValidationException::withMessages([
                    'phone' => 'این شماره موبایل قبلاً ثبت شده است.',
                ]);
            }

            throw $exception;
        }

        // ورود با Guard وب.
        Auth::guard('web')->login($user);

        // جلوگیری از Session Fixation.
        $request->session()->regenerate();

        return redirect()->to(
            $this->safeReturnUrl($validated['return_to'] ?? null)
        );
    }

    /**
     * تولید Slug یکتا.
     */
    private function generateUniqueSlug(string $baseSlug): string
    {
        do {
            $slug = $baseSlug . '-' . Str::lower(Str::random(10));
        } while (
            User::withTrashed()->where('slug', $slug)->exists()
        );

        return $slug;
    }

    /**
     * جلوگیری از Open Redirect.
     * فقط مسیرهای داخلی سایت پذیرفته می‌شوند.
     */
    private function safeReturnUrl(?string $url): string
    {
        if (
            ! is_string($url) ||
            $url === '' ||
            ! str_starts_with($url, '/') ||
            str_starts_with($url, '//') ||
            str_contains($url, '\\') ||
            preg_match('/[\x00-\x1F\x7F]/', $url)
        ) {
            return route('user.home');
        }

        $parts = parse_url($url);

        if (
            $parts === false ||
            isset($parts['scheme']) ||
            isset($parts['host']) ||
            isset($parts['user']) ||
            isset($parts['pass'])
        ) {
            return route('user.home');
        }

        return $url;
    }
}
