<?php

namespace App\Http\Controllers\Customer;

use App\Enums\Casts\UserStatus;
use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Service;
use App\Models\TimeSlot;
use App\Models\User;
use App\Supports\StickyAlert;
use Carbon\Carbon;
use Inertia\Inertia;
use Morilog\Jalali\Jalalian;

class BarberController extends Controller
{
    /**
     * لیست آرایشگران
     */
    public function index()
    {


        $barbers = User::role('آرایشگر')
            ->where('status', UserStatus::ACTIVE)
            ->withCount(['services' => function ($q) {
                $q->where('is_active', true);
            }])
            ->with(['services' => function ($q) {
                $q->where('is_active', true)->limit(3);
            }])
            ->paginate(12);

        $barbers->through(function ($barber) {
            return [
                'id' => $barber->id,
                'slug' => $barber->slug,
                'name' => $barber->name,
                'avatar' => $barber->avatar,
                'thumbnail' => $barber->avatar(),
                'is_online' => $barber->isOnline(),
                'services_count' => $barber->services_count,
                'services' => $barber->services->map(fn($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'duration' => $s->duration,
                    'price' => $s->price,
                ]),
                'rating' => 4.8, // (نمونه - از دیتابیس واقعی بیاورید)
                'total_reviews' => 24, // (نمونه)
            ];
        });

        return Inertia::render('Customer/Barbers/Index', [
            'barbers' => $barbers,
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
            'avatar' => $barber->avatar,
            'thumbnail' => $barber->avatar(),
            'is_online' => $barber->isOnline(),
            'rating' => 4.8, // (نمونه)
            'total_reviews' => 24, // (نمونه)
            'bio' => $barber->bio ?? 'آرایشگر حرفه‌ای با بیش از ۵ سال سابقه', // (نمونه)
        ];

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
                return true; // روزهای آینده همه قابل رزرو
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
            ])->values()->toArray(); // values برای ریست کردن کلیدها
        }

        return Inertia::render('Customer/Barbers/Show', [
            'barber' => $barberInfo,
            'services' => $services,
            'availabilities' => $availabilities,
            'slotsByDate' => $slotsByDate,
        ]);
    }
}
