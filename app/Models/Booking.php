<?php

namespace App\Models;

use App\Enums\Casts\BookingCompletedBy;
use App\Enums\Casts\BookingStatus;
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
        'admin_completion_reason'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'status' => BookingStatus::class,
        'completed_by' => BookingCompletedBy::class,
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
