<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    protected $fillable = [
        'gateway',
        'mode',
        'merchant_id',
        'callback_url',
        'description',
        'currency',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'bool',
    ];

    public const MODES = [
        'normal'     => 'حالت عادی',
        'sandbox'    => 'حالت تست (Sandbox)',
        'zaringate'  => 'زرین‌گیت',
    ];

    public const CURRENCIES = [
        'R' => 'ریال',
        'T' => 'تومان',
    ];

    public const GATEWAYS = [
        'zarinpal' => 'زرین‌پال',
        'idpay'    => 'آیدی‌پی',
        'payping'  => 'پی‌پینگ',
        'nextpay'  => 'نکست‌پی',
    ];

    public function getModeLabelAttribute(): string
    {
        return self::MODES[$this->mode] ?? $this->mode;
    }

    public function getGatewayLabelAttribute(): string
    {
        return self::GATEWAYS[$this->gateway] ?? $this->gateway;
    }

    public function getCurrencyLabelAttribute(): string
    {
        return self::CURRENCIES[$this->currency] ?? $this->currency;
    }
}
