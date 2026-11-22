<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\SmsProvider;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SmsProviderController extends Controller
{
    public function index()
    {
        $providers = SmsProvider::query()
            ->latest()
            ->get()
            ->map(fn(SmsProvider $provider) => [
                'id' => $provider->id,
                'name' => $provider->name,
                'driver' => $provider->driver,
                'driver_label' => SmsProvider::DRIVERS[$provider->driver] ?? $provider->driver,
                'is_active' => $provider->is_active,
                'is_ready' => $provider->isReady(),
                'is_otp_ready' => $provider->isOtpReady(),
                'last_tested_at' => $provider->last_tested_at?->format('Y-m-d H:i'),
                'last_test_status' => $provider->last_test_status,
                'has_api_key' => ! empty($provider->credentials['api_key'] ?? null),
                'has_username' => ! empty($provider->credentials['username'] ?? null),
                'has_password' => ! empty($provider->credentials['password'] ?? null),
                'line_number' => $provider->settings['line_number'] ?? null,
                'template_id' => $provider->otpTemplate()['template_id'] ?? null,
                'code_parameter' => $provider->otpTemplate()['code_parameter'] ?? null,
                'template_enabled' => (bool) ($provider->otpTemplate()['enabled'] ?? false),
            ]);

        return Inertia::render('Admin/SmsProviders/Index', [
            'providers' => $providers,
            'drivers' => collect(SmsProvider::DRIVERS)
                ->map(fn($label, $value) => [
                    'value' => $value,
                    'label' => $label,
                ])->values(),
            'primaryProviderId' => (int) Setting::get('otp_sms_provider_id', 0),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateProvider($request);

        DB::transaction(function () use ($validated) {
            $provider = SmsProvider::create([
                'driver' => $validated['driver'],
                'name' => $validated['name'],
                'credentials' => $validated['credentials'],
                'settings' => $this->buildSettings($validated),
                'is_active' => $validated['is_active'] ?? false,
            ]);

            if (! empty($validated['is_primary'])) {
                $this->savePrimaryProvider($provider);
            }
        });

        StickyAlert::toast('سرویس پیامکی با موفقیت اضافه شد.', 'success');

        return redirect()->back();
    }

    public function update(Request $request, SmsProvider $smsProvider)
    {
        $validated = $this->validateProvider($request, $smsProvider);

        DB::transaction(function () use ($validated, $smsProvider) {
            $credentials = $validated['credentials'];

            // اگر رمز یا کلید خالی ارسال شده باشد، مقدار قبلی حفظ می‌شود.
            foreach (['api_key', 'username', 'password'] as $key) {
                if (
                    array_key_exists($key, $credentials) &&
                    $credentials[$key] === null
                ) {
                    $credentials[$key] = $smsProvider->credentials[$key] ?? null;
                }
            }

            $smsProvider->update([
                'driver' => $validated['driver'],
                'name' => $validated['name'],
                'credentials' => $credentials,
                'settings' => $this->buildSettings($validated),
                'is_active' => $validated['is_active'] ?? false,
                'last_tested_at' => null,
                'last_test_status' => null,
            ]);

            if (! empty($validated['is_primary'])) {
                $this->savePrimaryProvider($smsProvider);
            } elseif (
                (int) Setting::get('otp_sms_provider_id', 0) === $smsProvider->id
                && ! $smsProvider->isOtpReady()
            ) {
                Setting::set('otp_sms_provider_id', 0, 'integer', [
                    'group' => 'sms',
                    'label' => 'سرویس اصلی OTP',
                ]);
            }
        });

        StickyAlert::toast('تنظیمات سرویس پیامکی ذخیره شد.', 'success');

        return redirect()->back();
    }

    public function destroy(SmsProvider $smsProvider)
    {
        $newStatus = ! $smsProvider->is_active;

        if (
            ! $newStatus &&
            (int) Setting::get('otp_sms_provider_id', 0) === $smsProvider->id
        ) {
            StickyAlert::alert(
                'ابتدا سرویس اصلی دیگری انتخاب کنید.',
                'warning'
            );

            return redirect()->back();
        }
        DB::transaction(function () use ($smsProvider) {
            if ((int) Setting::get('otp_sms_provider_id', 0) === $smsProvider->id) {
                Setting::set('otp_sms_provider_id', 0, 'integer', [
                    'group' => 'sms',
                    'label' => 'سرویس اصلی OTP',
                ]);
            }

            $smsProvider->delete();
        });

        StickyAlert::toast('سرویس پیامکی حذف شد.', 'success');

        return redirect()->back();
    }

    public function toggle(SmsProvider $smsProvider)
    {
        $newStatus = ! $smsProvider->is_active;

        if (
            ! $newStatus &&
            (int) Setting::get('otp_sms_provider_id', 0) === $smsProvider->id
        ) {
            StickyAlert::alert(
                'ابتدا سرویس اصلی دیگری انتخاب کنید.',
                'warning'
            );

            return redirect()->back();
        }

        $smsProvider->update([
            'is_active' => $newStatus,
            'last_tested_at' => null,
            'last_test_status' => null,
        ]);

        StickyAlert::toast(
            $newStatus ? 'سرویس پیامکی فعال شد.' : 'سرویس پیامکی غیرفعال شد.',
            'success'
        );

        return redirect()->back();
    }

    public function setPrimary(SmsProvider $smsProvider)
    {
        if (! $smsProvider->isOtpReady()) {
            StickyAlert::alert(
                'این سرویس اطلاعات اتصال یا قالب OTP کامل و معتبری ندارد.',
                'warning'
            );

            return redirect()->back();
        }

        Setting::set('otp_sms_provider_id', $smsProvider->id, 'integer', [
            'group' => 'sms',
            'label' => 'سرویس اصلی OTP',
            'description' => 'سرویس اصلی ارسال کد تأیید',
        ]);

        StickyAlert::toast('سرویس اصلی ارسال OTP تغییر کرد.', 'success');

        return redirect()->back();
    }

    private function validateProvider(
        Request $request,
        ?SmsProvider $provider = null
    ): array {
        $driver = $request->input('driver');

        $rules = [
            'driver' => [
                'required',
                Rule::in(array_keys(SmsProvider::DRIVERS)),
            ],
            'name' => ['required', 'string', 'max:100'],
            'is_active' => ['required', 'boolean'],
            'is_primary' => ['nullable', 'boolean'],

            'credentials' => ['required', 'array'],
            'credentials.api_key' => [
                Rule::requiredIf(
                    in_array($driver, [
                        SmsProvider::DRIVER_KAVENEGAR,
                        SmsProvider::DRIVER_FARAZSMS,
                    ]) && ! $provider
                ),
                'nullable',
                'string',
                'max:2000',
            ],
            'credentials.username' => [
                Rule::requiredIf(
                    $driver === SmsProvider::DRIVER_MELIPAYAMAK && ! $provider
                ),
                'nullable',
                'string',
                'max:255',
            ],
            'credentials.password' => [
                Rule::requiredIf(
                    $driver === SmsProvider::DRIVER_MELIPAYAMAK && ! $provider
                ),
                'nullable',
                'string',
                'max:2000',
            ],

            'line_number' => [
                Rule::requiredIf($driver === SmsProvider::DRIVER_FARAZSMS),
                'nullable',
                'string',
                'max:100',
            ],

            'template_id' => ['required', 'string', 'max:255'],
            'code_parameter' => ['required', 'string', 'max:100'],
            'template_enabled' => ['required', 'boolean'],
        ];

        $validated = $request->validate($rules, [
            'driver.required' => 'نوع سرویس پیامکی را انتخاب کنید.',
            'name.required' => 'نام سرویس الزامی است.',
            'credentials.api_key.required' => 'کلید API الزامی است.',
            'credentials.username.required' => 'نام کاربری الزامی است.',
            'credentials.password.required' => 'رمز عبور الزامی است.',
            'line_number.required' => 'خط ارسال برای فراز اس‌ام‌اس الزامی است.',
            'template_id.required' => 'شناسه قالب یا کد پترن الزامی است.',
            'code_parameter.required' => 'نام پارامتر کد تأیید الزامی است.',
        ]);
        if (
            $driver === SmsProvider::DRIVER_MELIPAYAMAK &&
            ! ctype_digit((string) $validated['template_id'])
        ) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'template_id' => 'شناسه پترن ملی‌پیامک باید عددی باشد.',
            ]);
        }

        if ($provider) {
            $oldCredentials = $provider->credentials ?? [];

            foreach (['api_key', 'username', 'password'] as $key) {
                if (empty($validated['credentials'][$key] ?? null)) {
                    $validated['credentials'][$key] = $oldCredentials[$key] ?? null;
                }
            }
        }

        return $validated;
    }

    private function buildSettings(array $validated): array
    {
        return [
            'line_number' => $validated['line_number'] ?? null,

            'otp_template' => [
                'enabled' => (bool) $validated['template_enabled'],
                'template_id' => trim($validated['template_id']),
                'code_parameter' => trim($validated['code_parameter']),
            ],
        ];
    }

    private function savePrimaryProvider(SmsProvider $provider): void
    {
        if (! $provider->isOtpReady()) {
            throw new \RuntimeException('سرویس پیامکی برای OTP آماده نیست.');
        }

        Setting::set('otp_sms_provider_id', $provider->id, 'integer', [
            'group' => 'sms',
            'label' => 'سرویس اصلی OTP',
            'description' => 'سرویس اصلی ارسال کد تأیید',
        ]);
    }
}
