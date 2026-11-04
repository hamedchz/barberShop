<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'duration',
        'price',
        'is_active',
        'image',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function timeSlots()
    {
        return $this->hasMany(TimeSlot::class);
    }
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function barbers()
    {
        return $this->belongsToMany(User::class, 'barber_service', 'service_id', 'barber_id');
    }
}
