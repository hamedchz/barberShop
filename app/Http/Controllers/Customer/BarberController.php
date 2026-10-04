<?php

namespace App\Http\Controllers\Customer;

use App\Enums\Casts\ReviewStatus;
use App\Enums\Casts\UserStatus;
use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Review;
use App\Models\Service;
use App\Models\TimeSlot;
use App\Models\User;
use App\Supports\StickyAlert;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Morilog\Jalali\Jalalian;

class BarberController extends Controller
{
    /**
     * لیست آرایشگران
     */
    public function index(Request $request)
    {
        $query = User::role('آرایشگر')
            ->where('status', UserStatus::ACTIVE->value)
            ->withCount([
                'services' => fn($q) => $q->where('is_active', true),
                'approvedReviews as reviews_count',
            ])
            ->withAvg('approvedReviews as average_rating', 'rating') // ← اضافه کنید
            ->with([
                'services' => fn($q) => $q->where('is_active', true)->limit(3),
            ]);

        // ============ جستجو ============
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('specialty', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        // ============ فیلتر شهر ============
        if ($city = $request->input('city')) {
            $query->where('city', $city);
        }

        // ============ فیلتر تخصص ============
        if ($specialty = $request->input('specialty')) {
            $query->where('specialty', 'like', "%{$specialty}%");
        }

        // ============ فیلتر حداقل امتیاز ============
        // ← حذف کنید! این فیلتر در Query کار نمی‌کند
        // به جای آن، در React فیلتر کنید

        // ============ مرتب‌سازی ============
        $sort = $request->input('sort', 'rating');

        switch ($sort) {
            case 'smart':
                $query->orderByRaw('
                (
                    (COALESCE(average_rating, 0) * 40) +
                    (LEAST(reviews_count, 50) * 0.4) +
                    (LEAST(services_count, 10) * 1.5)
                ) DESC
            ');
                break;

            case 'rating':
                $query->orderByDesc('average_rating')
                    ->orderByDesc('reviews_count');
                break;

            case 'reviews':
                $query->orderByDesc('reviews_count');
                break;

            case 'services':
                $query->orderByDesc('services_count');
                break;

            case 'name':
                $query->orderBy('name');
                break;

            case 'latest':
            default:
                $query->latest();
        }
        $barbers = $query->paginate(12)->withQueryString();

        // ============ تبدیل داده‌ها ============
        $barbers->through(function ($barber) {
            return [
                'id' => $barber->id,
                'name' => $barber->name,
                'slug' => $barber->slug,
                'avatar' => $barber->avatarBig(),
                'thumbnail' => $barber->avatar(),
                'is_online' => $barber->isOnline(),
                'services_count' => $barber->services_count,
                'services' => $barber->services->map(fn($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'duration' => $s->duration,
                    'price' => $s->price,
                ]),
                // ← از average_rating که با withAvg آمده استفاده کنید
                'rating' => round((float) ($barber->average_rating ?? 0), 1),
                // ← از reviews_count استفاده کنید، نه total_reviews
                'total_reviews' => (int) ($barber->reviews_count ?? 0),
                'bio' => $barber->bio ?? 'آرایشگر حرفه‌ای',
                'specialty' => $barber->specialty,
                'experience_years' => (int) ($barber->experience_years ?? 0),
                'city' => $barber->city,
            ];
        });

        // ============ لیست شهرها ============
        $cities = User::role('آرایشگر')
            ->whereNotNull('city')
            ->distinct()
            ->pluck('city')
            ->toArray();

        // ============ آمار ============
        $totalBarbers = User::role('آرایشگر')
            ->where('status', UserStatus::ACTIVE->value)
            ->count();

        $onlineCount = User::role('آرایشگر')
            ->where('status', UserStatus::ACTIVE->value)
            ->get()
            ->filter(fn($b) => $b->isOnline())
            ->count();



        return Inertia::render('Customer/Barbers/Index', [
            'barbers' => $barbers,
            'cities' => $cities,
            'stats' => [
                'total' => $totalBarbers,
                'online' => $onlineCount,
            ],
            'filters' => [
                'search' => $search ?? '',
                'city' => $request->input('city', ''),
                'specialty' => $request->input('specialty', ''),
                'min_rating' => $request->input('min_rating', ''),
                'sort' => $sort,
                'online_only' => $request->boolean('online_only'),
            ],
        ]);
    }

    /**
     * جزئیات آرایشگر + رزرو
     */
    public function show(User $barber)
    {
        // StickyAlert::alert('این بازه قابل رزرو نیست.', 'error');
        // بررسی آرایشگر بودن
        if (!$barber->hasRole('آرایشگر') || $barber->status?->value !== UserStatus::ACTIVE->value) {
            abort(404);
        }

        // ============ اطلاعات پایه ============
        $barberInfo = [
            'id' => $barber->id,
            'name' => $barber->name,
            'slug' => $barber->slug,
            'avatar' => $barber->avatar,
            'thumbnail' => $barber->avatar(),
            'is_online' => $barber->isOnline(),

            // ============ اطلاعات امتیاز ============
            'rating' => (float) $barber->average_rating,
            'total_reviews' => (int) $barber->total_reviews,
            'rating_distribution' => (object) $barber->rating_distribution,
            'rating_percentages' => $this->calculateRatingPercentages($barber),

            // ============ اطلاعات دیگر ============
            'bio' => $barber->bio ?? 'آرایشگر حرفه‌ای با بیش از ۵ سال سابقه',
            'specialty' => $barber->specialty,
            'experience_years' => (int) ($barber->experience_years ?? 0),
            'city' => $barber->city,
            'address' => $barber->address,
        ];

        // ============ آخرین نظرات ============
        $reviews = Review::where('barber_id', $barber->id)
            ->where('status', ReviewStatus::approved->value)
            ->with('user:id,name,avatar')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($review) => [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at,
                'user' => [
                    'id' => $review->user->id,
                    'name' => $review->user->name,
                    'avatar' => $review->user->avatar,
                    'thumbnail' => $review->user->avatar(),
                ],
            ]);

        // ============ خدمات ============
        $services = Service::where('user_id', $barber->id)
            ->where('is_active', true)
            ->get()
            ->map(fn($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'image' => $service->image ? asset('storage/' . $service->image) : null,
                'duration' => $service->duration,
                'price' => $service->price,
            ]);

        // ============ برنامه هفتگی ============
        $availabilities = Availability::where('user_id', $barber->id)
            ->where('is_active', true)
            ->orderBy('day_of_week')
            ->get()
            ->map(fn($avail) => [
                'day_of_week' => $avail->day_of_week,
                'start_time' => $avail->start_time,
                'end_time' => $avail->end_time,
            ]);

        // ============ بازه‌های قابل رزرو (۱۴ روز آینده) ============
        $startDate = Carbon::today();
        $endDate = Carbon::today()->addDays(14);

        $now = Carbon::now();
        $today = Carbon::today()->toDateString();

        $timeSlots = TimeSlot::where('user_id', $barber->id)
            ->whereBetween('date', [$startDate, $endDate])
            // ->where('status', 'available')
            ->with('service')
            ->orderBy('date')
            ->orderBy('start_time')
            ->get()
            ->filter(function ($slot) use ($now, $today) {
                // ============ فیلتر بازه‌های گذشته امروز ============
                if ($slot->date === $today) {
                    // اگر تاریخ امروز است، فقط بازه‌هایی که start_time > الان
                    $slotDateTime = Carbon::parse(
                        $slot->date . ' ' . $slot->start_time
                    );
                    return $slotDateTime->greaterThan($now);
                }
                return true;
            })
            ->groupBy('date');

        // تبدیل به آرایه
        $slotsByDate = [];
        foreach ($timeSlots as $date => $slots) {
            $slotsByDate[Carbon::parse($date)->format('Y-m-d')] = $slots->map(fn($slot) => [
                'id' => $slot->id,
                'status' => $slot->status->value,

                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'service_id' => $slot->service_id,
                'service' => $slot->service ? [
                    'id' => $slot->service->id,
                    'name' => $slot->service->name,
                    'price' => $slot->service->price,
                ] : null,
            ])->values()->toArray();
        }



        return Inertia::render('Customer/Barbers/Show', [
            'barber' => $barberInfo,
            'services' => $services,
            'availabilities' => $availabilities,
            'slotsByDate' => $slotsByDate,
            'reviews' => $reviews,

        ]);
    }
    /**
     * محاسبه درصد هر امتیاز
     */
    private function calculateRatingPercentages(User $barber): array
    {
        $total = $barber->total_reviews;
        $distribution = $barber->rating_distribution;

        if ($total === 0) {
            return [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];
        }

        return [
            5 => round(($distribution[5] / $total) * 100, 1),
            4 => round(($distribution[4] / $total) * 100, 1),
            3 => round(($distribution[3] / $total) * 100, 1),
            2 => round(($distribution[2] / $total) * 100, 1),
            1 => round(($distribution[1] / $total) * 100, 1),
        ];
    }
}
