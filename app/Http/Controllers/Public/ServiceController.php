<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use App\Models\ServiceCategory;
use App\Models\User;
use Inertia\Inertia;

class ServiceController extends Controller
{

    public function index(Request $request)
    {
        // اعتبارسنجی فیلترها
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'in:popular,rating,price'],
            'min_rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $search = trim($validated['search'] ?? '');
        $categorySlug = $validated['category'] ?? null;
        $sort = $validated['sort'] ?? 'popular';
        $minRating = (float) ($validated['min_rating'] ?? 0);

        // دسته‌بندی انتخاب‌شده
        $category = null;

        if ($categorySlug) {
            $category = ServiceCategory::query()
                ->where('slug', $categorySlug)
                ->firstOrFail();
        }

        // فیلتر خدمات فعال و دسته‌بندی انتخاب‌شده
        $serviceFilter = function ($query) use ($category) {
            $query->active();

            if ($category) {
                $query->where('category_id', $category->id);
            }
        };

        // دریافت آرایشگران
        $barbersQuery = User::query()
            ->role(User::ROLE_BARBER)
            ->where('is_active', true)

            // فقط آرایشگرانی که خدمات فعال دارند
            ->whereHas('services', $serviceFilter)

            // جستجو در اطلاعات آرایشگر و خدمات
            ->when($search !== '', function ($query) use ($search, $serviceFilter) {
                $query->where(function ($q) use ($search, $serviceFilter) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('specialty', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhereHas('services', function ($serviceQuery) use ($search, $serviceFilter) {
                            $serviceFilter($serviceQuery);

                            $serviceQuery->where(
                                'services.name',
                                'like',
                                "%{$search}%"
                            );
                        });
                });
            })

            // بارگذاری خدمات قابل نمایش
            ->with([
                'services' => function ($query) use ($serviceFilter) {
                    $serviceFilter($query);

                    $query->select([
                        'id',
                        'user_id',
                        // 'name',
                        'price',
                        'duration',
                        'category_id',
                    ]);
                },
            ])

            // تعداد نظرات تأییدشده
            ->withCount('approvedReviews')

            // تعداد خدمات فعال و مطابق فیلتر
            ->withCount([
                'services as active_services_count' => $serviceFilter,
            ])

            // تعداد رزروها
            ->withCount('barberBookings')

            // میانگین امتیاز نظرات
            ->withAvg('approvedReviews', 'rating')

            // کمترین قیمت خدمات فعال
            ->withMin([
                'services as min_price' => $serviceFilter,
            ], 'price');

        // فیلتر حداقل امتیاز
        if ($minRating > 0) {
            $barbersQuery->havingRaw(
                'COALESCE(approved_reviews_avg_rating, 0) >= ?',
                [$minRating]
            );
        }

        // مرتب‌سازی
        switch ($sort) {
            case 'rating':
                $barbersQuery
                    ->orderByDesc('approved_reviews_avg_rating')
                    ->orderByDesc('approved_reviews_count');
                break;

            case 'price':
                $barbersQuery
                    ->orderBy('min_price')
                    ->orderByDesc('barber_bookings_count');
                break;

            case 'popular':
            default:
                $barbersQuery
                    ->orderByDesc('barber_bookings_count')
                    ->orderByDesc('approved_reviews_count');
                break;
        }

        // صفحه‌بندی
        $barbers = $barbersQuery
            ->paginate(33)
            ->withQueryString();

        // آماده‌سازی اطلاعات موردنیاز React
        $barbers->through(function ($barber) {
            return [
                'id' => $barber->id,
                'name' => $barber->name,
                'slug' => $barber->slug,

                // تصاویر
                'avatar' => $barber->avatarUrl(),
                'avatar_card_url' => $barber->avatarCardUrl(),

                // اطلاعات شخصی و حرفه‌ای
                'specialty' => $barber->specialty,
                'bio' => $barber->bio,
                'experience_years' => (int) $barber->experience_years,
                'city' => $barber->city,
                'address' => $barber->address,

                // امتیاز و آمار
                'rating' => round(
                    (float) ($barber->approved_reviews_avg_rating ?? 0),
                    1
                ),

                'reviews_count' => (int) $barber->approved_reviews_count,

                'services_count' => (int) $barber->active_services_count,

                'bookings_count' => (int) $barber->barber_bookings_count,

                // قیمت
                'min_price' => (float) ($barber->min_price ?? 0),

                // وضعیت تأیید
                'is_verified' => false,

                // خدمات
                'services' => $barber->services->map(function ($service) {
                    return [
                        'id' => $service->id,
                        'name' => $service->getRawOriginal('name'),
                        'price' => (float) $service->price,
                        'duration' => $service->duration,
                        'category_id' => $service->category_id,
                    ];
                })->values(),
            ];
        });

        // دسته‌بندی‌ها
        $categories = ServiceCategory::query()
            ->select('id', 'name', 'slug')
            ->orderBy('name')
            ->get();

        return Inertia::render('Frontend/Barbers/Index', [
            'category' => $category ? [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ] : null,

            'categories' => $categories,

            'barbers' => $barbers,

            'filters' => [
                'search' => $search,
                'category' => $categorySlug,
                'sort' => $sort,
                'min_rating' => $minRating,
            ],
        ]);
    }
}
