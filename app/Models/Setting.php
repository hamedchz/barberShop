<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
    ];

    /**
     * گرفتن مقدار با cast
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        if (!$setting) {
            return $default;
        }

        return static::castValue($setting->value, $setting->type);
    }

    /**
     * تنظیم مقدار
     */
    public static function set(string $key, mixed $value, string $type = 'string', array $extra = []): self
    {
        return static::updateOrCreate(
            ['key' => $key],
            array_merge([
                'value' => is_array($value) ? json_encode($value) : (string) $value,
                'type'  => $type,
            ], $extra)
        );
    }

    /**
     * cast کردن مقدار
     */
    protected static function castValue(mixed $value, string $type): mixed
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'integer' => (int) $value,
            'decimal' => (float) $value,
            'boolean' => (bool) $value,
            'json'    => json_decode($value, true),
            default   => $value,
        };
    }

    // ============================================
    // متدهای اختصاصی
    // ============================================

    /**
     * نرخ کمیسیون پیش‌فرض
     */
    public static function getCommissionRate(): float
    {
        return (float) static::get('commission_rate', 10.00); // ۱۰٪
    }

    /**
     * تنظیم نرخ کمیسیون پیش‌فرض
     */
    public static function setCommissionRate(float $rate): self
    {
        return static::set(
            'commission_rate',
            $rate,
            'decimal',
            [
                'group'       => 'commission',
                'label'       => 'نرخ کمیسیون پیش‌فرض',
                'description' => 'درصد کمیسیون پلتفرم از درآمد آرایشگر',
            ]
        );
    }
}
