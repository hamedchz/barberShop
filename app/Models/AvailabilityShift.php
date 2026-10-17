<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AvailabilityShift extends Model
{
    protected $fillable = ['availability_id', 'start_time', 'end_time', 'order'];

    protected $casts = [
        'order' => 'integer',
    ];

    public function availability()
    {
        return $this->belongsTo(Availability::class);
    }
}
