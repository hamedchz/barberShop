<?php

namespace App\Models;

use App\Enums\Casts\UserWarningType;
use Illuminate\Database\Eloquent\Model;

class UserWarning extends Model
{
    protected $fillable = [
        'user_id',
        'dispute_id',
        'issued_by',
        'type',
        'reason',
        'expires_at',
        'revoked_at',
        'revoked_by',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
        'type' => UserWarningType::class,
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function dispute()
    {
        return $this->belongsTo(Dispute::class);
    }

    public function issuedBy()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function revokedBy()
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }

    public function isActive(): bool
    {
        return is_null($this->revoked_at)
            && (is_null($this->expires_at) || $this->expires_at->isFuture());
    }

    public function scopeActive($query)
    {
        return $query->whereNull('revoked_at')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }
}
