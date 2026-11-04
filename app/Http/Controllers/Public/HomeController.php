<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Fronts/Home/Home', [
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
