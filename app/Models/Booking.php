<?php

namespace App\Models;

use App\Enums\Casts\BookingCompletedBy;
use App\Enums\Casts\BookingStatus;
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
        'is_disputed',
        'disputed_at',
        'dispute_reason',
        'completion_reminder_sent_at',
        'disputed_by',
        'dispute_status',
        'dispute_resolved_at',
        'dispute_resolution',
        'dispute_resolved_by'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'auto_complete_at' => 'datetime',
        'completion_reminder_sent_at' => 'datetime',
        'disputed_at' => 'datetime',
        'status' => BookingStatus::class,
        'completed_by' => BookingCompletedBy::class,
        'cancelled_by' => BookingCompletedBy::class,
        'auto_completed' => 'bool',
        'is_disputed' => 'bool',
        'dispute_status' => DisputedStatus::class,
        'dispute_resolved_at' => 'datetime'
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
        return $this->belongsTo(Review::class);
    }
}
