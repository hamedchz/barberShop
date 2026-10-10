<?php


namespace App\Enums\Casts;

enum WalletDepositStatus: string
{
    case pending   = 'pending';
    case paid      = 'paid';
    case failed    = 'failed';
    case cancelled = 'cancelled';
    case expired   = 'expired';

    public function label(): string
    {
        return match ($this) {
            self::pending   => 'در انتظار پرداخت',
            self::paid      => 'پرداخت شده',
            self::failed    => 'ناموفق',
            self::cancelled => 'لغو شده',
            self::expired   => 'منقضی شده',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::pending   => 'yellow',
            self::paid      => 'green',
            self::failed    => 'red',
            self::cancelled => 'gray',
            self::expired   => 'gray',
        };
    }
}
