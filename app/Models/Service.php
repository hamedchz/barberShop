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
        'category_id'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'duration' => 'integer',
    ];
    protected $appends = [
        'name',
        'description',
        'image_url',
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


    public function category()
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    public function getNameAttribute(): ?string
    {
        return $this->category?->name;
    }

    public function getDescriptionAttribute(): ?string
    {
        return $this->category?->description;
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->category?->image_url;
    }


    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
