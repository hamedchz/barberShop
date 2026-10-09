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
        'completion_reminder_sent_at',
    ];

    protected $casts = [
        'amount'                        => 'decimal:2',
        'confirmed_at'                  => 'datetime',
        'cancelled_at'                  => 'datetime',
        'completed_at'                  => 'datetime',
        'auto_complete_at'              => 'datetime',
        'completion_reminder_sent_at'   => 'datetime',
        'status'                        => BookingStatus::class,
        'completed_by'                  => BookingCompletedBy::class,
        'cancelled_by'                  => BookingCompletedBy::class,
        'auto_completed'                => 'bool',
    ];

    // پیش‌فرض‌ها فقط برای فیلدهای موجود در جدول
    protected $attributes = [
        'auto_completed' => false,
    ];

    protected $appends = [
        'dispute_hours_remaining',
    ];

    // ============================================
    // Relationships
    // ============================================

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

    /**
     * آخرین اعتراض (برای نمایش در صفحه)
     * از latestOfMany استفاده می‌کنیم که بهینه‌ست
     */
    public function latestDispute()
    {
        return $this->hasOne(Dispute::class)->latestOfMany();
    }

    /**
     * اعتراض فعال (pending / investigating / awaiting_response)
     */
    public function activeDispute()
    {
        return $this->hasOne(Dispute::class)
            ->whereIn('status', [
                DisputedStatus::pending->value,
                DisputedStatus::investigating->value,
                DisputedStatus::awaitingResponse->value,
            ])
            ->latestOfMany();
    }

    /**
     * اعتراضات مشتری
     */
    public function customerDisputes()
    {
        return $this->hasMany(Dispute::class)
            ->where('disputed_by', 'customer');
    }

    /**
     * اعتراضات آرایشگر
     */
    public function barberDisputes()
    {
        return $this->hasMany(Dispute::class)
            ->where('disputed_by', 'barber');
    }

    // ============================================
    // Accessors
    // ============================================

    /**
     * بررسی وجود اعتراض
     * نکته: با withCount('disputes') کار می‌کنه و کوئری اضافه نمی‌زنه
     */
    public function getHasDisputesAttribute(): bool
    {
        // اگه withCount('disputes') استفاده شده باشه
        if (array_key_exists('disputes_count', $this->attributes)) {
            return $this->attributes['disputes_count'] > 0;
        }

        // fallback
        return $this->disputes()->exists();
    }

    /**
     * تعداد اعتراضات
     * نکته: با withCount('disputes') کار می‌کنه
     */
    public function getDisputesCountAttribute(): int
    {
        if (array_key_exists('disputes_count', $this->attributes)) {
            return (int) $this->attributes['disputes_count'];
        }

        return $this->disputes()->count();
    }

    /**
     * آخرین اعتراض
     */
    public function getLatestDisputeAttribute()
    {
        // اگه رابطه لود شده باشه، ازش استفاده کن
        if ($this->relationLoaded('latestDispute')) {
            return $this->getRelation('latestDispute');
        }

        return $this->latestDispute()->first();
    }

    /**
     * بررسی وجود اعتراض فعال
     */
    public function getHasActiveDisputeAttribute(): bool
    {
        return $this->disputes()
            ->whereIn('status', [
                DisputedStatus::pending->value,
                DisputedStatus::investigating->value,
                DisputedStatus::awaitingResponse->value,
            ])
            ->exists();
    }

    // app/Models/Booking.php

    /**
     * ساعت باقی‌مانده برای ثبت اعتراض
     * (از زمان آخرین اعتراض محاسبه میشه)
     */

    public function getDisputeHoursRemainingAttribute(): ?int
    {
        // از رابطه استفاده کن (اگه eager load شده باشه، کوئری اضافه نمیزنه)
        $latestDispute = $this->relationLoaded('latestDispute')
            ? $this->getRelation('latestDispute')
            : $this->latestDispute;

        if ($latestDispute?->created_at) {
            $deadline = $latestDispute->created_at->copy()->addHours(48);
        } elseif ($this->completed_at) {
            $deadline = $this->completed_at->copy()->addHours(48);
        } else {
            return null;
        }

        return max(0, now()->diffInHours($deadline, false));
    }
}
