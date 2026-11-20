<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsProvider extends Model
{
    public const DRIVER_KAVENEGAR = 'kavenegar';
    public const DRIVER_MELIPAYAMAK = 'melipayamak';
    public const DRIVER_FARAZSMS = 'farazsms';

    public const DRIVERS = [
        self::DRIVER_KAVENEGAR => 'کاوه‌نگار',
        self::DRIVER_MELIPAYAMAK => 'ملی‌پیامک',
        self::DRIVER_FARAZSMS => 'فراز اس‌ام‌اس',
    ];

    protected $fillable = [
        'driver',
        'name',
        'credentials',
        'settings',
        'is_active',
        'last_tested_at',
        'last_test_status',
    ];

    protected $hidden = [
        'credentials',
    ];

    protected function casts(): array
    {
        return [
            'credentials' => 'encrypted:array',
            'settings' => 'encrypted:array',
            'is_active' => 'boolean',
            'last_tested_at' => 'datetime',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * بررسی اعتبار اولیه اطلاعات اتصال ارائه‌دهنده.
     */
    public function isReady(): bool
    {
        if (
            ! $this->is_active ||
            ! array_key_exists($this->driver, self::DRIVERS)
        ) {
            return false;
        }

        $credentials = $this->credentials ?? [];
        $settings = $this->settings ?? [];

        if (! is_array($credentials) || ! is_array($settings)) {
            return false;
        }

        if (empty($settings['line_number'])) {
            return false;
        }

        return match ($this->driver) {
            self::DRIVER_KAVENEGAR,
            self::DRIVER_FARAZSMS => ! empty($credentials['api_key']),

            self::DRIVER_MELIPAYAMAK =>
            ! empty($credentials['username']) &&
                ! empty($credentials['password']),

            default => false,
        };
    }

    /**
     * دریافت تنظیمات قالب OTP.
     */
    public function otpTemplate(): ?array
    {
        $settings = $this->settings ?? [];
        $template = $settings['otp_template'] ?? null;

        return is_array($template) ? $template : null;
    }

    /**
     * بررسی کامل بودن تنظیمات قالب OTP.
     */
    public function hasOtpTemplate(): bool
    {
        $template = $this->otpTemplate();

        return is_array($template)
            && ($template['enabled'] ?? false) === true
            && ! empty($template['template_id'])
            && ! empty($template['code_parameter']);
    }

    /**
     * آماده بودن ارائه‌دهنده برای ارسال OTP.
     */
    public function isOtpReady(): bool
    {
        return $this->isReady() && $this->hasOtpTemplate();
    }
}
