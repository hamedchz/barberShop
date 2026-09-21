<?php

namespace App\Enums\Casts;

enum UserStatus: string
{
    case pending = 'pending';
        // users with completed profile, waiting for admin approval
    case inProgress = 'in-progress';
        // users with completed profile, waiting for admin approval
    case rejected = 'rejected';
        // rejected users, won't be shown in website
    case approved = 'approved';
        // approved users will be shown in website
    case suspended = 'suspended';
    // suspended users

    public static function toArray(): array
    {
        return array_map(fn($status) => $status->value, self::cases());
    }
}
