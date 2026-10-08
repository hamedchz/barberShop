<?php

namespace App\Models;

use App\Enums\Casts\WalletTransactionDirection;
use App\Enums\Casts\WalletTransactionStatus;
use App\Enums\Casts\WalletTransactionType;
use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    protected $fillable = [
        'wallet_id',
        'user_id',
        'type',
        'direction',
        'amount',
        'balance_before',
        'balance_after',
        'status',
        'reference_type',
        'reference_id',
        'description',
        'metadata',
    ];

    protected $casts = [
        'amount'         => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after'  => 'decimal:2',
        'type'           => WalletTransactionType::class,
        'direction'      => WalletTransactionDirection::class,
        'status'         => WalletTransactionStatus::class,
        'metadata'       => 'array',
    ];

    // ============ روابط ============
    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * مرجع چندریختی (Booking, Dispute, ...)
     */
    public function reference()
    {
        return $this->morphTo();
    }

    // ============ متدهای کمکی ============
    public function isCredit(): bool
    {
        return $this->direction === WalletTransactionDirection::credit;
    }

    public function isDebit(): bool
    {
        return $this->direction === WalletTransactionDirection::debit;
    }

    public function isCompleted(): bool
    {
        return $this->status === WalletTransactionStatus::completed;
    }

    // ============ Scopeها ============
    public function scopeCompleted($query)
    {
        return $query->where('status', WalletTransactionStatus::completed->value);
    }

    public function scopeCredits($query)
    {
        return $query->where('direction', WalletTransactionDirection::credit->value);
    }

    public function scopeDebits($query)
    {
        return $query->where('direction', WalletTransactionDirection::debit->value);
    }
}
