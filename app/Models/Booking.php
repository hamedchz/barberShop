<?php

namespace App\Models;

use App\Enums\Casts\BookingCompletedBy;
use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\DisputedBy;
use App\Enums\Casts\DisputedStatus;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'barber_id',
        'service_id',
        'time_slot_id',
        'status',
        'amount',
        'notes',
        'confirmed_at',
        'cancelled_at',
        'completed_at',
        'completed_by',
        'admin_completion_reason',
        'cancelled_by',
        'auto_completed',
        'auto_complete_at',
        'completion_reminder_sent_at',
    ];



    protected $casts = [
        'amount' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'auto_complete_at' => 'datetime',
        'completion_reminder_sent_at' => 'datetime',
        'status' => BookingStatus::class,
        'completed_by' => BookingCompletedBy::class,
        'cancelled_by' => BookingCompletedBy::class,
        'auto_completed' => 'bool',
        'completed_at' => 'datetime'
    ];
    protected $attributes = [
        'completed_by' => BookingCompletedBy::barber->value,
        'cancelled_by' => BookingCompletedBy::barber->value,
        'dispute_status' => DisputedStatus::pending->value,

    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function barber()
    {
        return $this->belongsTo(User::class, 'barber_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function timeSlot()
    {
        return $this->belongsTo(TimeSlot::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
    public function review()
    {
        return $this->hasOne(Review::class, 'booking_id');
    }


    public function disputes()
    {
        return $this->hasMany(Dispute::class);
    }

    public function activeDispute()
    {
        return $this->hasOne(Dispute::class)
            ->whereIn('status', [DisputedStatus::pending->value, DisputedStatus::investigating->value, DisputedStatus::awaitingResponse->value])
            ->latest();
    }

    public function latestDispute()
    {
        return $this->hasOne(Dispute::class)->latest();
    }

    public function customerDisputes()
    {
        return $this->hasMany(Dispute::class)
            ->where('disputed_by', DisputedBy::customer->value);
    }

    public function barberDisputes()
    {
        return $this->hasMany(Dispute::class)
            ->where('disputed_by', DisputedBy::barber->value);
    }

     // ============================================
    // Accessors
    // ============================================

    /**
     * بررسی وجود اعتراض
     */
    public function getHasDisputesAttribute(): bool
    {
        return $this->disputes_count > 0
            ?? $this->disputes()->exists();
    }

    /**
     * تعداد اعتراضات
     */
    public function getDisputesCountAttribute(): int
    {
        return $this->disputes()->count();
    }

    /**
     * آخرین اعتراض
     */
    public function getLatestDisputeAttribute()
    {
        return $this->disputes()->latest()->first();
    }

    /**
     * بررسی وجود اعتراض فعال
     */
    public function getHasActiveDisputeAttribute(): bool
    {
        return $this->disputes()
            ->whereIn('status', ['pending', 'investigating', 'awaiting_response'])
            ->exists();
    }
}
