<?php

namespace App\Models;

use App\Enums\Casts\ReviewStatus;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'user_id',
        'barber_id',
        'booking_id',
        'rating',
        'comment',
        'status',
    ];

    protected $casts = [
        'rating' => 'integer',
        'status' => ReviewStatus::class
    ];
    protected $attributes = [
        'status' => ReviewStatus::pending->value,
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function barber()
    {
        return $this->belongsTo(User::class, 'barber_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    // اسکوپ برای نظرات تایید شده
    public function scopeApproved($query)
    {
        return $query->where('status', ReviewStatus::approved->value);
    }
}
