<?php

namespace App\Http\Controllers\Public;

use App\Enums\Casts\UserStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        // دسته‌بندی‌های فعال دارای حداقل یک سرویس فعال
        $categories = ServiceCategory::query()
            ->active()
            ->ordered()
            ->whereHas('services', function ($query) {
                $query->where('is_active', true);
            })
            ->withCount([
                'activeServices as services_count',
            ])
            ->limit(8)
            ->get([
                'id',
                'name',
                'slug',
                'description',
                'image',
                'icon',
                'color',
            ]);

        // آرایشگران فعال دارای سرویس فعال
        $barbers = User::query()
            ->role(User::ROLE_BARBER)
            ->where('is_active', true)->where('status', UserStatus::ACTIVE->value)
            ->whereHas('services', function ($query) {
                $query->where('is_active', true);
            })
            ->withCount([
                'approvedReviews as approved_reviews_count',
            ])
            ->withAvg([
                'approvedReviews as approved_reviews_avg_rating',
            ], 'rating')
            ->withCount([
                'services as active_services_count' => function ($query) {
                    $query->where('is_active', true);
                },
            ])
            ->orderByDesc('approved_reviews_avg_rating')
            ->orderByDesc('approved_reviews_count')
            ->limit(8)
            ->get([
                'id',
                'name',
                'slug',
                'avatar',
                'bio',
                'specialty',
                'experience_years',
                'city',
            ])
            ->map(function (User $barber) {
                return [
                    'id' => $barber->id,
                    'name' => $barber->name,
                    'slug' => $barber->slug,
                    'avatar' => $barber->avatarUrl(),
                    'bio' => $barber->bio,
                    'specialty' => $barber->specialty,
                    'experience_years' => $barber->experience_years,
                    'city' => $barber->city,
                    'rating' => round(
                        (float) ($barber->approved_reviews_avg_rating ?? 0),
                        1
                    ),
                    'reviews_count' => (int) $barber->approved_reviews_count,
                    'services_count' => (int) $barber->active_services_count,
                ];
            });

        // نظرات تأییدشده مشتریان
        $reviews = Review::query()
            ->approved()
            ->with([
                'user:id,name,avatar',
                'barber:id,name,slug',
            ])
            ->latest('moderated_at')
            ->limit(6)
            ->get([
                'id',
                'user_id',
                'barber_id',
                'rating',
                'comment',
                'moderated_at',
            ])
            ->map(function (Review $review) {
                return [
                    'id' => $review->id,
                    'customer' => [
                        'name' => $review->user?->name ?? 'مشتری',
                        'avatar' => $review->user?->avatarUrl(),
                    ],
                    'barber' => [
                        'name' => $review->barber?->name,
                        'slug' => $review->barber?->slug,
                    ],
                    'rating' => (int) $review->rating,
                    'comment' => $review->comment,
                    'date' => $review->moderated_at?->format('Y/m/d'),
                ];
            });

        return Inertia::render('Frontend/Home', [
            'auth' => [
                'user' => $request->user()
                    ? $request->user()->only([
                        'id',
                        'name',
                        'slug',
                    ])
                    : null,
            ],

            'categories' => $categories,
            'barbers' => $barbers,
            'reviews' => $reviews,
        ]);
    }
    public function index1(): Response
    {
        return Inertia::render('Frontend/Home', [
            'services' => [],
            'barbers' => [],
            'reviews' => [],
        ]);
    }
    public function index2()
    {
        // ============ آمار سایت (cache ۱۰ دقیقه) ============
        $stats = Cache::remember('public.home.stats', 600, function () {
            return [
                'barbers_count' => User::whereHas('roles', fn($q) => $q->where('name', 'barber'))
                    ->where('status', 'active')
                    ->count(),
                'users_count' => User::whereHas('roles', fn($q) => $q->where('name', 'customer'))
                    ->count(),
                'bookings_count' => Booking::where('status', 'completed')->count(),
                'avg_rating' => round(
                    Review::where('status', 'approved')->avg('rating') ?? 4.8,
                    1
                ),
            ];
        });

        // ============ آرایشگران برتر ============
        $topBarbers = User::whereHas('roles', fn($q) => $q->where('name', 'barber'))
            ->where('status', 'active')
            ->orderByDesc('average_rating')
            ->orderByDesc('total_reviews')
            ->limit(4)
            ->get()
            ->map(fn($barber) => [
                'id' => $barber->id,
                'name' => $barber->name,
                'avatar' => $barber->avatarUrl(),
                'specialty' => $barber->specialty,
                'city' => $barber->city,
                'rating' => $barber->average_rating ?? 0,
                'reviews_count' => $barber->total_reviews ?? 0,
                'is_online' => $barber->is_online ?? false,
            ]);

        // ============ خدمات پرطرفدار ============
        $topServices = Service::where('is_active', true)
            ->withCount(['bookings as bookings_count'])
            ->orderByDesc('bookings_count')
            ->limit(4)
            ->get()
            ->map(fn($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'min_price' => $service->min_price ?? 0,
                'barbers_count' => $service->barbers_count ?? 0,
            ]);

        return Inertia::render('Front/Home/Home', [
            'stats' => $stats,
            'topBarbers' => $topBarbers,
            'topServices' => $topServices,
        ]);
    }
}
