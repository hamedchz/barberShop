<?php

namespace App\Models;

use App\Enums\Casts\ReviewStatus;
use Illuminate\Database\Eloquent\Model;

class ReviewModerationHistory extends Model
{


    protected $fillable = [
        'review_id',
        'admin_id',
        'previous_status',
        'new_status',
        'reason',
        'note',
    ];

    protected $casts = [
        'previous_status' => ReviewStatus::class,
        'new_status'      => ReviewStatus::class,
    ];

    // ============ روابط ============

    public function review()
    {
        return $this->belongsTo(Review::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
