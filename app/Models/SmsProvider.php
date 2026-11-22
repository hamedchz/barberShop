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
     * بررسی اطلاعات اتصال متناسب با درایور
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

        return match ($this->driver) {
            self::DRIVER_KAVENEGAR =>
            ! empty($credentials['api_key']),

            self::DRIVER_FARAZSMS =>
            ! empty($credentials['api_key']) &&
                ! empty($settings['line_number']),

            self::DRIVER_MELIPAYAMAK =>
            ! empty($credentials['username']) &&
                ! empty($credentials['password']),

            default => false,
        };
    }

    public function otpTemplate(): ?array
    {
        $settings = $this->settings ?? [];
        $template = $settings['otp_template'] ?? null;

        return is_array($template) ? $template : null;
    }

    public function hasOtpTemplate(): bool
    {
        $template = $this->otpTemplate();

        if (! $template) {
            return false;
        }

        return ($template['enabled'] ?? false) === true
            && trim((string) ($template['template_id'] ?? '')) !== ''
            && trim((string) ($template['code_parameter'] ?? '')) !== '';
    }

    public function isOtpReady(): bool
    {
        return $this->isReady() && $this->hasOtpTemplate();
    }
}
