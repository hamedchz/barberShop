<?php

namespace App\Models;

use App\Enums\Casts\WalletDepositStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WalletDeposit extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'wallet_id',
        'amount',
        'paid_amount',
        'status',
        'gateway',
        'gateway_authority',
        'gateway_transaction_id',
        'gateway_reference',
        'gateway_response',
        'tracking_code',
        'paid_at',
        'failed_at',
        'expires_at',
        'failure_reason',
    ];

    protected $casts = [
        'amount'           => 'decimal:2',
        'paid_amount'      => 'decimal:2',
        'status'           => WalletDepositStatus::class,
        'gateway_response' => 'array',
        'paid_at'          => 'datetime',
        'failed_at'        => 'datetime',
        'expires_at'       => 'datetime',
    ];

    protected $appends = ['status_label'];

    // ============ روابط ============
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    // ============ Accessor ============
    public function getStatusLabelAttribute(): string
    {
        return $this->status?->label() ?? 'نامشخص';
    }

    // ============ Scope ============
    public function scopePaid($query)
    {
        return $query->where('status', WalletDepositStatus::paid->value);
    }

    public function scopePending($query)
    {
        return $query->where('status', WalletDepositStatus::pending->value);
    }

    // ============ متد ============
    public function isPaid(): bool
    {
        return $this->status === WalletDepositStatus::paid;
    }

    public function isPending(): bool
    {
        return $this->status === WalletDepositStatus::pending;
    }
}
