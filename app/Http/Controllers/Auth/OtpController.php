<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\OtpCode;
use App\Models\User;
use App\Services\Sms\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OtpController extends Controller
{
    public const REGISTRATION_SESSION_KEY = 'auth.otp.registration';

    public function __construct(
        private readonly OtpService $otpService
    ) {}

    /**
     * ارسال کد OTP برای ثبت‌نام مشتری.
     */
    public function sendRegistration(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:30'],
        ], [
            'phone.required' => 'شماره موبایل را وارد کنید.',
        ]);

        $phone = $this->otpService->normalizePhone(
            $validated['phone']
        );

        // شماره کاربران حذف‌شده نیز قابل ثبت‌نام مجدد نیست.
        if (User::withTrashed()->where('phone', $phone)->exists()) {
            throw ValidationException::withMessages([
                'phone' => 'این شماره موبایل قبلاً ثبت شده است.',
            ]);
        }

        // درخواست ارسال جدید، تأیید قبلی را باطل می‌کند.
        $request->session()->forget(
            self::REGISTRATION_SESSION_KEY
        );

        $result = $this->otpService->send(
            $phone,
            OtpCode::PURPOSE_REGISTRATION
        );

        return response()->json([
            'message' => 'کد تأیید ارسال شد.',
            'expires_at' => $result['expires_at'],
            'resend_after' => $result['resend_after'],
        ]);
    }

    /**
     * تأیید کد OTP ثبت‌نام.
     */
    public function verifyRegistration(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:30'],
            'code' => ['required', 'string', 'max:10'],
        ], [
            'phone.required' => 'شماره موبایل الزامی است.',
            'code.required' => 'کد تأیید را وارد کنید.',
        ]);

        $phone = $this->otpService->normalizePhone(
            $validated['phone']
        );

        if (User::withTrashed()->where('phone', $phone)->exists()) {
            throw ValidationException::withMessages([
                'phone' => 'امکان ثبت‌نام با این شماره وجود ندارد.',
            ]);
        }

        // این متد در صورت موفقیت، OTP را یک‌بار مصرف می‌کند.
        $this->otpService->verify(
            $phone,
            $validated['code'],
            OtpCode::PURPOSE_REGISTRATION
        );

        // پس از تأیید، شناسه Session را تغییر می‌دهیم.
        $request->session()->regenerate();

        // مجوز موقت ثبت‌نام فقط در Session سرور ذخیره می‌شود.
        $request->session()->put(
            self::REGISTRATION_SESSION_KEY,
            [
                'phone' => $phone,
                'purpose' => OtpCode::PURPOSE_REGISTRATION,
                'verified_at' => now()->timestamp,
                'expires_at' => now()->addMinutes(5)->timestamp,
            ]
        );

        return response()->json([
            'message' => 'شماره موبایل با موفقیت تأیید شد.',
            'verified' => true,
        ]);
    }
}
