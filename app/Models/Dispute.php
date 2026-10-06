<?php

namespace App\Models;

use App\Enums\Casts\DisputedStatus;
use App\Enums\Casts\DisputeTypes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dispute extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'booking_id',
        'disputed_by_user_id',
        'disputed_by',
        'dispute_type',
        'reason',
        'status',
        'response',
        'responded_at',
        'responded_by_user_id',
        'resolved_by_user_id',
        'resolution',
        'resolved_at',
        'refund_amount',
        'penalty_amount',
        'attachments',
        'ip_address',
        'admin_notes',
        'edited_at',
        'edit_count',
        'can_be_edited'
    ];

    protected $casts = [
        'attachments' => 'array',
        'refund_amount' => 'decimal:2',
        'penalty_amount' => 'decimal:2',
        'resolved_at' => 'datetime',
        'responded_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'status' => DisputedStatus::class,
        'dispute_type' => DisputeTypes::class,
        'edited_at' => 'datetime',
        'edit_count' => 'integer',
        'can_be_edited' => 'bool'
        // 'is_disputed' => 'bool',
        // 'dispute_status' => DisputedStatus::class,
        // 'dispute_resolved_at' => 'datetime',
    ];



    protected $attributes = [
        'status' => DisputedStatus::pending->value,

    ];

    // ============ روابط ============
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function disputedByUser()
    {
        return $this->belongsTo(User::class, 'disputed_by_user_id');
    }

    public function respondedByUser()
    {
        return $this->belongsTo(User::class, 'responded_by_user_id');
    }

    public function resolvedByUser()
    {
        return $this->belongsTo(User::class, 'resolved_by_user_id');
    }

    // ============ اسکوپ‌ها ============
    public function scopePending($query)
    {
        return $query->where('status', DisputedStatus::pending->value);
    }

    public function scopeResolved($query)
    {
        return $query->where('status', DisputedStatus::resolved->value);
    }

    public function scopeForBarber($query, $barberId)
    {
        return $query->whereHas('booking', function ($q) use ($barberId) {
            $q->where('barber_id', $barberId);
        });
    }

    public function scopeForCustomer($query, $customerId)
    {
        return $query->whereHas('booking', function ($q) use ($customerId) {
            $q->where('user_id', $customerId);
        });
    }

    // ============ متدهای کمکی ============
    public function isPending(): bool
    {
        return $this->status->value === DisputedStatus::pending->value;
    }

    public function isResolved(): bool
    {
        return $this->status->value === DisputedStatus::resolved->value;
    }

    public function isRejected(): bool
    {
        return $this->status->value === DisputedStatus::rejected->value;
    }

    public function canBeResponded(): bool
    {
        return in_array($this->status->value, [DisputedStatus::pending->value, DisputedStatus::investigating->value, DisputedStatus::awaitingResponse->value]);
    }
}
