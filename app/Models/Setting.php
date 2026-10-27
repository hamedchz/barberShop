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

    // اضافه کن:
    public const GROUPS = [
        'general' => 'عمومی',
        'theme'   => 'ظاهر و رنگ',
        'contact' => 'تماس',
        'social'  => 'شبکه‌های اجتماعی',
    ];

    public const TYPES = [
        'string'  => 'متن',
        'integer' => 'عدد',
        'decimal' => 'اعشار',
        'boolean' => 'بله/خیر',
        'json'    => 'JSON',
    ];

    public static function getByGroup(string $group): array
    {
        return static::where('group', $group)
            ->orderBy('id')
            ->get()
            ->mapWithKeys(fn($s) => [$s->key => static::castValue($s->value, $s->type)])
            ->toArray();
    }

    public static function getSettingsWithMeta(): array
    {
        return static::orderBy('group')
            ->orderBy('id')
            ->get()
            ->groupBy('group')
            ->map(fn($items) => $items->map(fn($s) => [
                'key'         => $s->key,
                'value'       => static::castValue($s->value, $s->type),
                'type'        => $s->type,
                'label'       => $s->label,
                'description' => $s->description,
                'group'       => $s->group,
            ])->values())
            ->toArray();
    }

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

    /**
     * رنگ tint خودکار از رنگ اصلی
     */
    public static function getTintFromPrimary(string $primaryHex): string
    {
        // تبدیل hex به RGB
        $hex = ltrim($primaryHex, '#');
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));

        // مخلوط با سفید (۱۰٪ رنگ اصلی + ۹۰٪ سفید)
        $tintR = (int) round($r * 0.1 + 255 * 0.9);
        $tintG = (int) round($g * 0.1 + 255 * 0.9);
        $tintB = (int) round($b * 0.1 + 255 * 0.9);

        return sprintf('#%02X%02X%02X', $tintR, $tintG, $tintB);
    }

    /**
     * رنگ hover از رنگ اصلی
     */
    public static function getHoverFromPrimary(string $primaryHex): string
    {
        $hex = ltrim($primaryHex, '#');
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));

        // تیره‌تر (۸۰٪ رنگ اصلی)
        $hoverR = (int) round($r * 0.8);
        $hoverG = (int) round($g * 0.8);
        $hoverB = (int) round($b * 0.8);

        return sprintf('#%02X%02X%02X', $hoverR, $hoverG, $hoverB);
    }

    public static function getGroupedKeyValue(): array
    {
        return static::all()
            ->groupBy('group')
            ->map(fn($items) => $items->mapWithKeys(fn($s) => [
                $s->key => static::castValue($s->value, $s->type),
            ])->toArray())
            ->toArray();
    }
}
