<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

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
        'last_seen_at'
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
            'is_admin' => 'bool'
        ];
    }
    protected $attributes = [
        'is_admin' => false,
        'status' => UserStatus::PENDING->value,
    ];
    // public function isOnline(): bool
    // {
    //     return Cache::has('user-is-online-' . $this->id);
    // }

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
        return Storage::url($this->avatar);
    }

    public function avatar(): string
    {
        // اگر آواتار وجود ندارد، آواتار پیش‌فرض را برگردان
        if (
            !empty($this->avatar) &&
            Storage::exists('thumbnails/' . $this->avatar)
        ) {

            return Storage::url('thumbnails/' . $this->avatar);
        }

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
}
