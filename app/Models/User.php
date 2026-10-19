<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Enums\Casts\GenderTypes;
use App\Enums\Casts\ReviewStatus;
use App\Enums\Casts\UserStatus;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasRoles, SoftDeletes;
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */

    protected $fillable = [
        'name',
        'phone',
        'phone_verified_at',
        'password',
        'status',
        'is_admin',
        'slug',
        'last_activity_at',
        'last_login_at',
        'avatar',
        'bio',
        'specialty',
        'experience_years',
        'city',
        'address',
        'average_rating',
        'total_reviews',
        'total_rating_sum',
        'last_seen_at',
        'bank_name',
        'account_holder_name',
        'card_number',
        'sheba_number',
        'commission_rate',
        'birth_date',
        'gender',
        'email',
        'bank_id',
        'is_active'
    ];
    protected function casts(): array
    {
        return [
            'phone_verified_at' => 'datetime',
            'last_activity_at' => 'datetime',
            'last_login_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'password' => 'hashed',
            'status' => UserStatus::class,
            'gender' => GenderTypes::class,
            'is_admin' => 'bool',
            'is_active' => 'bool',
            'birth_date' => 'date'
        ];
    }
    protected $attributes = [
        'is_admin' => false,
        'status' => UserStatus::PENDING->value,
    ];

    public const ROLE_BARBER        = 'آرایشگر';
    public const ROLE_CUSTOMER      = 'مشتری';
    public const ROLE_SUPER_ADMIN   = 'سوپر ادمین';
    /**
     * نقش اصلی کاربر با اولویت
     * آرایشگر > مشتری > سوپر ادمین
     */
    public function primaryRole(): ?string
    {
        return match (true) {
            $this->hasRole(self::ROLE_BARBER)      => 'barber',
            $this->hasRole(self::ROLE_CUSTOMER)    => 'customer',
            $this->hasRole(self::ROLE_SUPER_ADMIN) => 'super_admin',
            default                                => null,
        };
    }

    /**
     * URL پروفایل کاربر در پنل ادمین
     */
    // public function adminProfileUrl(): ?string
    // {
    //     return match ($this->primaryRole()) {
    //         'barber'      => "/admin/barbers/{$this->slug}/detail",
    //         'customer'    => "/admin/customers/{$this->id}",
    //         'super_admin' => "/admin/users/{$this->id}",
    //         default       => null,
    //     };
    // }

    public function adminProfileUrl(): ?string
    {
        return match ($this->primaryRole()) {
            'barber' => $this->slug
                ?  route('admin.barbers.show', $this->slug)
                : route('admin.barbers.show', $this->id),

            'customer'    => route('admin.customers.show', $this->id),
            'super_admin' => route('admin.users.show', $this->id),
            default       => null,
        };
    }

    /**
     * برچسب نقش برای نمایش (فارسی)
     */
    public function primaryRoleLabel(): string
    {
        return match ($this->primaryRole()) {
            'barber'      => 'آرایشگر',
            'customer'    => 'مشتری',
            'super_admin' => 'سوپر ادمین',
            default       => 'کاربر',
        };
    }
    public function isOnline(): bool
    {
        return $this->last_seen_at &&
            $this->last_seen_at->gt(now()->subMinutes(5));
    }

    public function lastActivity(): ?string
    {
        return Cache::get('user-is-online-' . $this->id);
    }

    public function avatarBig(): string
    {
        return Storage::url($this->attributes['avatar'] ?? '');
    }

    public function avatarUrl(): string
    {
        // دریافت مقدار آواتار از دیتابیس
        $avatar = $this->attributes['avatar'] ?? null;

        // بررسی وجود تصویر بندانگشتی
        if (
            !empty($avatar) &&
            Storage::exists('thumbnails/' . $avatar)
        ) {
            return Storage::url('thumbnails/' . $avatar);
        }

        // اگر تصویر بندانگشتی وجود نداشت
        return $this->avatarBig();
    }



    public function services()
    {
        return $this->hasMany(Service::class, 'user_id');
    }

      // ============ روابط ============

    /**
     * نظراتی که این کاربر (به عنوان آرایشگر) دریافت کرده
     */
    public function reviews()
    {
        return $this->hasMany(Review::class, 'barber_id');
    }

    /**
     * نظرات تایید شده
     */
    public function approvedReviews()
    {
        return $this->hasMany(Review::class, 'barber_id')
            ->where('status', ReviewStatus::approved->value);
    }



    /**
     * نظراتی که این کاربر (به عنوان مشتری) داده
     */
    public function givenReviews()
    {
        return $this->hasMany(Review::class, 'user_id');
    }

    // ============ متدهای محاسبه‌ای ============

    /**
     * میانگین امتیاز آرایشگر (با کش برای عملکرد بهتر)
     */
    public function getAverageRatingAttribute(): float
    {
        return Cache::remember(
            "barber_rating_{$this->id}",
            now()->addHours(6),
            function () {
                $avg = $this->approvedReviews()->avg('rating');
                return $avg ? round($avg, 1) : 0;
            }
        );
    }

    /**
     * تعداد کل نظرات
     */
    public function getTotalReviewsAttribute(): int
    {
        return Cache::remember(
            "barber_reviews_count_{$this->id}",
            now()->addHours(6),
            function () {
                return $this->approvedReviews()->count();
            }
        );
    }

    /**
     * پاک کردن کش نظرات (بعد از ثبت نظر جدید)
     */
    public function clearReviewsCache(): void
    {
        Cache::forget("barber_rating_{$this->id}");
        Cache::forget("barber_reviews_count_{$this->id}");
    }

    /**
     * توزیع امتیازها (چند نفر ۵ ستاره، چند نفر ۴ ستاره و...)
     */
    // app/Models/User.php

    public function getRatingDistributionAttribute(): array
    {
        return Cache::remember(
            "barber_rating_dist_{$this->id}",
            now()->addHours(6),
            function () {
                // همیشه همه کلیدها را مقداردهی اولیه کن
                $distribution = [
                    5 => 0,
                    4 => 0,
                    3 => 0,
                    2 => 0,
                    1 => 0,
                ];

                $reviews = $this->approvedReviews()
                    ->selectRaw('rating, COUNT(*) as count')
                    ->groupBy('rating')
                    ->pluck('count', 'rating')
                    ->toArray();

                foreach ($reviews as $rating => $count) {
                    $distribution[(int) $rating] = (int) $count;
                }

                // اطمینان از اینکه همه مقادیر Integer هستند
                return array_map('intval', $distribution);
            }
        );
    }
    // app/Models/User.php

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * گرفتن کیف پول (یا ساختنش اگه وجود نداره)
     */
    public function getOrCreateWallet(): Wallet
    {
        return app(\App\Services\WalletService::class)
            ->getOrCreateWallet($this);
    }


    public function warnings()
    {
        return $this->hasMany(UserWarning::class);
    }

    public function activeWarnings()
    {
        return $this->hasMany(UserWarning::class)->active();
    }

    public function hasReachedBanThreshold(int $threshold = 3): bool
    {
        return $this->activeWarnings()->count() >= $threshold;
    }

    // app/Models/User.php

    public function settlements()
    {
        return $this->hasMany(Settlement::class);
    }

    public function pendingSettlements()
    {
        return $this->hasMany(Settlement::class)
            ->whereIn('status', [
                \App\Enums\Casts\SettlementStatus::pending->value,
                \App\Enums\Casts\SettlementStatus::processing->value,
            ]);
    }

    public function completedSettlements()
    {
        return $this->hasMany(Settlement::class)
            ->where('status', \App\Enums\Casts\SettlementStatus::completed->value);
    }

    // app/Models/User.php

    /**
     * رزروها به‌عنوان آرایشگر
     */
    public function barberBookings()
    {
        return $this->hasMany(Booking::class, 'barber_id');
    }

    /**
     * رزروهای امروز آرایشگر
     */
    public function todayBarberBookings()
    {
        return $this->barberBookings()
            ->whereHas('timeSlot', fn($q) => $q->where('date', today()));
    }

    /**
     * رزروهای تکمیل‌شده آرایشگر
     */
    public function completedBarberBookings()
    {
        return $this->barberBookings()
            ->where('status', \App\Enums\Casts\BookingStatus::completed->value);
    }

    // app/Models/User.php

    public function bank()
    {
        return $this->belongsTo(Bank::class);
    }

    /**
     * نام بانک برای نمایش
     * (اول از relation، بعد snapshot)
     */
    public function getDisplayBankNameAttribute(): ?string
    {
        return $this->bank?->name ?? $this->bank_name;
    }

    // app/Models/User.php

    /**
     * رزروهایی که این کاربر به‌عنوان مشتری داره
     */
    public function customerBookings()
    {
        return $this->hasMany(Booking::class, 'user_id');
    }
}
