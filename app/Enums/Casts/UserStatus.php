<?php

namespace App\Enums\Casts;

enum UserStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case SUSPENDED = 'suspended';
    case PENDING = 'pending';
    case BANNED = 'banned';
    /**
     * برچسب فارسی برای نمایش
     */
    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'فعال',
            self::INACTIVE => 'غیرفعال',
            self::SUSPENDED => 'معلق',
            self::PENDING => 'در انتظار تایید',
            self::BANNED => 'مسدود شده',
        };
    }

    /**
     * رنگ برای نمایش در UI
     */
    public function color(): string
    {
        return match ($this) {
            self::ACTIVE => 'green',
            self::INACTIVE => 'gray',
            self::SUSPENDED => 'orange',
            self::PENDING => 'blue',
            self::BANNED => 'red',
        };
    }

    /**
     * آیکون (اختیاری - نام آیکون در lucide-react)
     */
    public function icon(): string
    {
        return match ($this) {
            self::ACTIVE => 'CheckCircle',
            self::INACTIVE => 'XCircle',
            self::SUSPENDED => 'PauseCircle',
            self::PENDING => 'Clock',
            self::BANNED => 'Ban',
        };
    }

    /**
     * تمام مقادیر برای Select
     */
    public static function toSelectArray(): array
    {
        return array_map(function ($case) {
            return [
                'value' => $case->value,
                'label' => $case->label(),
                'color' => $case->color(),
                'icon' => $case->icon(),
            ];
        }, self::cases());
    }
    public static function toArray(): array
    {
        return array_map(fn($status) => $status->value, self::cases());
    }
}
