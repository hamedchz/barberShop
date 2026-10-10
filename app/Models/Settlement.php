<?php

namespace App\Models;

use App\Enums\Casts\SettlementStatus;
use App\Enums\Casts\SettlementType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Settlement extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'status',
        'bank_name',
        'account_holder_name',
        'account_number',
        'card_number',
        'sheba_number',
        'bank_reference',
        'gateway_reference',
        'requested_at',
        'processed_at',
        'completed_at',
        'failed_at',
        'notes',
        'failure_reason',
        'requested_by',
        'processed_by',
    ];

    protected $casts = [
        'amount'       => 'decimal:2',
        'type'         => SettlementType::class,
        'status'       => SettlementStatus::class,
        'requested_at' => 'datetime',
        'processed_at' => 'datetime',
        'completed_at' => 'datetime',
        'failed_at'    => 'datetime',
    ];

    protected $attributes = [
        'status'       => SettlementStatus::pending->value,
        'type'       => SettlementType::barberPayout->value,

    ];

    // ============================================
    // روابط
    // ============================================

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * تراکنش‌های کیف پولی که در این تسویه پوشش داده شدن
     */
    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    // ============================================
    // متدهای کمکی
    // ============================================

    public function isPending(): bool
    {
        return $this->status === SettlementStatus::pending;
    }

    public function isCompleted(): bool
    {
        return $this->status === SettlementStatus::completed;
    }

    public function isFailed(): bool
    {
        return $this->status === SettlementStatus::failed;
    }

    /**
     * علامت‌گذاری به‌عنوان در حال پردازش
     */
    public function markAsProcessing(?User $admin = null): void
    {
        $this->update([
            'status'       => SettlementStatus::processing->value,
            'processed_at' => now(),
            'processed_by' => $admin?->id,
        ]);
    }

    /**
     * علامت‌گذاری به‌عنوان تکمیل‌شده
     */
    public function markAsCompleted(
        string $bankReference,
        ?string $gatewayReference = null,
    ): void {
        $this->update([
            'status'            => SettlementStatus::completed->value,
            'completed_at'      => now(),
            'bank_reference'    => $bankReference,
            'gateway_reference' => $gatewayReference,
        ]);

        // علامت‌گذاری تراکنش‌های مرتبط به‌عنوان تسویه‌شده
        $this->walletTransactions()->update([
            'is_settled'          => true,
            'settled_at'          => now(),
            'settlement_id'       => $this->id,
        ]);
    }

    /**
     * علامت‌گذاری به‌عنوان ناموفق
     */
    public function markAsFailed(string $reason): void
    {
        $this->update([
            'status'         => SettlementStatus::failed->value,
            'failed_at'      => now(),
            'failure_reason' => $reason,
        ]);
    }

    /**
     * لغو تسویه
     */
    public function cancel(?string $reason = null): void
    {
        $this->update([
            'status' => SettlementStatus::cancelled->value,
            'notes'  => $reason ?? $this->notes,
        ]);
    }

    // ============================================
    // Scopeها
    // ============================================

    public function scopePending($query)
    {
        return $query->where('status', SettlementStatus::pending->value);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', SettlementStatus::completed->value);
    }

    public function scopeForBarbers($query)
    {
        return $query->where('type', SettlementType::barberPayout->value);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    
    // app/Models/Settlement.php

    /**
     * Scope: درخواستهای فعال (pending یا processing)
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', [
            SettlementStatus::pending->value,
            SettlementStatus::processing->value,
        ]);
    }



    /**
     * Scope: درخواستهای در حال پردازش
     */
    public function scopeProcessing($query)
    {
        return $query->where('status', SettlementStatus::processing->value);
    }


    /**
     * Scope: درخواستهای مشتری
     */
    public function scopeForCustomers($query)
    {
        return $query->where('type', SettlementType::customerRefund->value);
    }

    // app/Models/Settlement.php

    /**
     * آیا کاربر درخواست فعال داره؟
     */
    public static function hasActiveForUser(int $userId): bool
    {
        return static::forUser($userId)->active()->exists();
    }

    /**
     * گرفتن درخواست فعال کاربر (اگه هست)
     */
    public static function getActiveForUser(int $userId): ?self
    {
        return static::forUser($userId)->active()->latest()->first();
    }

    /**
     * تعداد درخواستهای فعال کاربر
     */
    public static function activeCountForUser(int $userId): int
    {
        return static::forUser($userId)->active()->count();
    }

    /**
     * جمع مبلغ درخواستهای فعال کاربر
     */
    public static function activeAmountForUser(int $userId): float
    {
        return (float) static::forUser($userId)->active()->sum('amount');
    }

    // app/Models/Settlement.php

    /**
     * آیا این درخواست فعاله؟
     */
    public function isActive(): bool
    {
        return in_array($this->status, [
            SettlementStatus::pending,
            SettlementStatus::processing,
        ], true);
    }

    /**
     * آیا درخواست کاربر دیگهای فعاله؟
     * (بدون احتساب خودش)
     */
    public function userHasOtherActive(): bool
    {
        return static::forUser($this->user_id)
            ->active()
            ->where('id', '!=', $this->id)
            ->exists();
    }
}
