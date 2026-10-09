<?php

namespace App\Models;

use App\Enums\Casts\ReviewStatus;
use App\Services\ReviewService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{

    use SoftDeletes;
    protected $fillable = [
        'user_id',
        'barber_id',
        'booking_id',
        'rating',
        'comment',
        'status',
        'moderated_by',
        'moderated_at',
        'moderation_note',
        'rejection_reason'
    ];

    protected $casts = [
        'rating' => 'integer',
        'moderated_at' => 'datetime',
        'status' => ReviewStatus::class
    ];
    protected $attributes = [
        'status' => ReviewStatus::pending->value,
    ];

    protected $appends = [
        'status_label',
        'status_color',
        'status_icon',
    ];

    protected static function booted()
    {
        static::created(function ($review) {
            if ($review->status === 'approved') {
                static::updateBarberRating($review->barber_id);
            }
        });

        static::updated(function ($review) {
            static::updateBarberRating($review->barber_id);
        });

        static::deleted(function ($review) {
            static::updateBarberRating($review->barber_id);
        });
    }

    protected static function updateBarberRating($barberId)
    {
        $stats = static::where('barber_id', $barberId)
            ->where('status', 'approved')
            ->selectRaw('COUNT(*) as count, SUM(rating) as sum')
            ->first();

        $average = $stats->count > 0
            ? round($stats->sum / $stats->count, 2)
            : 0;

        User::where('id', $barberId)->update([
            'average_rating' => $average,
            'total_reviews' => $stats->count,
            'total_rating_sum' => $stats->sum ?? 0,
        ]);
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id')
            ->withTrashed();
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

    public function moderatedBy()
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    public function approve(User $admin, ?string $note = null): void
    {
        $this->update([
            'status'         => ReviewStatus::approved->value,
            'moderated_by'   => $admin->id,
            'moderated_at'   => now(),
            'moderation_note' => $note,
        ]);
    }

    public function reject(User $admin, string $reason, ?string $note = null): void
    {
        $this->update([
            'status'          => ReviewStatus::rejected->value,
            'moderated_by'    => $admin->id,
            'moderated_at'    => now(),
            'moderation_note' => $note,
            'rejection_reason' => $reason,
        ]);

        // بازمحاسبه امتیاز آرایشگر
        app(ReviewService::class)->recalculateBarberRating($this->booking->barber);
    }



    public function scopePending($query)
    {
        return $query->where('status', ReviewStatus::pending->value);
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->status?->label() ?? 'نامشخص';
    }

    public function getStatusColorAttribute(): string
    {
        return $this->status?->color() ?? 'gray';
    }

    public function getStatusIconAttribute(): string
    {
        return $this->status?->icon() ?? 'Clock4';
    }
}
