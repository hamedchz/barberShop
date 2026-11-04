<?php

namespace App\Http\Controllers\Public;

use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\ReviewStatus;
use App\Enums\Casts\UserStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BarberController extends Controller
{
    public function index(Request $request)
    {
        $query = User::whereHas('roles', fn($q) => $q->where('name', 'barber'))
            ->where('status', UserStatus::ACTIVE->value);

        // ============ فیلترها ============
        // جستجو
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        // شهر
        if ($request->filled('city')) {
            $query->where('city', $request->input('city'));
        }

        // خدمات
        if ($request->filled('service')) {
            $query->whereHas(
                'services',
                fn($q) =>
                $q->where('services.id', $request->input('service'))
            );
        }

        // حداقل امتیاز
        if ($request->filled('rating')) {
            $query->where('average_rating', '>=', $request->input('rating'));
        }

        // آنلاین فقط
        if ($request->boolean('online_only')) {
            $query->where('is_online', true);
        }

        // مرتب‌سازی
        $sort = $request->input('sort', 'rating');
        $query = match ($sort) {
            'rating' => $query->orderByDesc('average_rating'),
            'reviews' => $query->orderByDesc('total_reviews'),
            'newest' => $query->orderByDesc('created_at'),
            default => $query->orderByDesc('average_rating'),
        };

        $barbers = $query->paginate(12)->withQueryString();

        // ============ داده‌های فیلتر ============
        $cities = User::whereHas('roles', fn($q) => $q->where('name', 'barber'))
            ->where('status', UserStatus::ACTIVE->value)
            ->whereNotNull('city')
            ->distinct()
            ->pluck('city')
            ->toArray();

        $services = Service::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Front/Barbers/Index', [
            'barbers' => $barbers->through(fn($b) => [
                'id' => $b->id,
                'name' => $b->name,
                'avatar' => $b->avatarUrl(),
                'specialty' => $b->specialty,
                'city' => $b->city,
                'rating' => round($b->average_rating ?? 0, 1),
                'reviews_count' => $b->total_reviews ?? 0,
                'is_online' => $b->is_online ?? false,
                'services' => $b->services->take(3)->pluck('name')->toArray(),
            ]),
            'filters' => [
                'search' => $request->input('search'),
                'city' => $request->input('city'),
                'service' => $request->input('service'),
                'rating' => $request->input('rating'),
                'online_only' => $request->boolean('online_only'),
                'sort' => $sort,
            ],
            'cities' => $cities,
            'services' => $services,
        ]);
    }

    public function show(User $barber)
    {
        abort_unless(
            $barber->hasRole('آرایشگر') && $barber->status->value === UserStatus::ACTIVE->value,
            404
        );

        $barber->load([
            'services:id,name,description,price,duration,is_active',
            'availabilities' => fn($q) => $q->where('is_active', true)
                ->orderBy('day_of_week'),
        ]);

        // ============ نظرات تأییدشده ============
        $reviews = Review::where('barber_id', $barber->id)
            ->where('status', ReviewStatus::approved->value)
            ->with(['user:id,name,avatar'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'user_name' => $r->user?->name,
                'user_avatar' => $r->user?->avatarUrl(),
                'created_at' => $r->created_at->toIso8601String(),
            ]);

        // ============ آمار ============
        $stats = [
            'reviews_count' => $barber->total_reviews ?? 0,
            'average_rating' => round($barber->average_rating ?? 0, 1),
            'completed_bookings' => Booking::where('barber_id', $barber->id)
                ->where('status', BookingStatus::completed->value)
                ->count(),
        ];

        return Inertia::render('Front/Barbers/Show', [
            'barber' => [
                'id' => $barber->id,
                'name' => $barber->name,
                'avatar' => $barber->avatarUrl(),
                'bio' => $barber->bio,
                'specialty' => $barber->specialty,
                'city' => $barber->city,
                'address' => $barber->address,
                'phone' => $barber->phone,
                'is_online' => $barber->is_online ?? false,
                'services' => $barber->services->map(fn($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'description' => $s->description,
                    'price' => (float) $s->price,
                    'duration' => $s->duration,
                ]),
            ],
            'stats' => $stats,
            'reviews' => $reviews,
            'weeklySchedule' => $barber->availabilities->map(fn($a) => [
                'day' => $a->day_of_week,
                'start_time' => $a->start_time,
                'end_time' => $a->end_time,
            ]),
        ]);
    }

    public function search(Request $request)
    {
        // هدایت به صفحه لیست آرایشگران با پارامتر جستجو
        return redirect()->route('public.barbers.index', [
            'search' => $request->input('q'),
        ]);
    }

    public function byCity(string $city)
    {
        return redirect()->route('public.barbers.index', [
            'city' => $city,
        ]);
    }
}
