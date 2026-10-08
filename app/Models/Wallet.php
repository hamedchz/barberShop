<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Wallet extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'balance',
        'locked_balance',
        'total_deposited',
        'total_withdrawn',
        'currency',
        'is_active',
        'last_transaction_at',
    ];

    protected $casts = [
        'balance'            => 'decimal:2',
        'locked_balance'     => 'decimal:2',
        'total_deposited'    => 'decimal:2',
        'total_withdrawn'    => 'decimal:2',
        'is_active'          => 'bool',
        'last_transaction_at' => 'datetime',
    ];

    // ============ روابط ============
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    // ============ متدهای کمکی ============

    /**
     * موجودی قابل استفاده (balance منهای locked)
     */
    public function getAvailableBalanceAttribute(): float
    {
        return (float) $this->balance - (float) $this->locked_balance;
    }

    public function hasEnoughBalance(float $amount): bool
    {
        return $this->available_balance >= $amount;
    }

    public function isActive(): bool
    {
        return $this->is_active === true;
    }

    // ============ Scopeها ============
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
