<?php

namespace App\Http\Controllers\Barber;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Settlement;
use App\Models\WalletTransaction;
use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\ReviewStatus;
use App\Enums\Casts\SettlementStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $period = (int) $request->input('period', 30);
        $from = now()->subDays($period);

        return Inertia::render('Barber/Dashboard/Index', [
            'stats'        => $this->buildStats($user, $from),
            'chart'        => $this->buildChart($user, $period),
            'todayBookings' => $this->getTodayBookings($user),
            'upcomingBookings' => $this->getUpcomingBookings($user),
            'recentReviews' => $this->getRecentReviews($user),
            'topServices'  => $this->getTopServices($user, $from),
            'weeklySchedule' => $this->getWeeklySchedule($user),
            'recentTransactions' => $this->getRecentTransactions($user),
            'period'       => $period,
        ]);
    }

    // ============ آمار ============
    private function buildStats($user, $from): array
    {
        // رزروها
        $bookings = $user->barberBookings()
            ->where('created_at', '>=', $from)
            ->count();

        $prevBookings = $user->barberBookings()
            ->whereBetween('created_at', [$from->copy()->subDays(30), $from])
            ->count();

        $completed = $user->barberBookings()
            ->where('status', BookingStatus::completed->value)
            ->where('created_at', '>=', $from)
            ->count();

        $pending = $user->barberBookings()
            ->where('status', BookingStatus::pending->value)
            ->count();

        $cancelled = $user->barberBookings()
            ->where('status', BookingStatus::cancelled->value)
            ->where('created_at', '>=', $from)
            ->count();

        // درآمد
        $earnings = (float) WalletTransaction::where('user_id', $user->id)
            ->where('type', 'earning')
            ->where('status', 'completed')
            ->where('created_at', '>=', $from)
            ->sum('amount');

        $prevEarnings = (float) WalletTransaction::where('user_id', $user->id)
            ->where('type', 'earning')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$from->copy()->subDays(30), $from])
            ->sum('amount');

        // کیف پول
        $wallet = $user->wallet;
        $balance = (float) ($wallet?->balance ?? 0);
        $lockedBalance = (float) ($wallet?->locked_balance ?? 0);

        // تسویه‌ها
        $pendingSettlements = Settlement::where('user_id', $user->id)
            ->whereIn('status', [
                SettlementStatus::pending->value,
                SettlementStatus::processing->value,
            ])
            ->count();

        $pendingSettlementsAmount = (float) Settlement::where('user_id', $user->id)
            ->whereIn('status', [
                SettlementStatus::pending->value,
                SettlementStatus::processing->value,
            ])
            ->sum('amount');

        // نظرات
        $avgRating = (float) ($user->average_rating ?? 0);
        $totalReviews = (int) ($user->total_reviews ?? 0);

        $reviewsThisPeriod = $user->reviews()
            ->where('status', ReviewStatus::approved->value)
            ->where('created_at', '>=', $from)
            ->count();

        // رزروهای امروز
        $todayBookings = $user->barberBookings()
            ->whereHas('timeSlot', fn($q) => $q->whereDate('date', today()))
            ->count();

        return [
            'bookings' => [
                'value' => $bookings,
                'prev'  => $prevBookings,
                'change' => $this->change($bookings, $prevBookings),
                'completed' => $completed,
                'pending' => $pending,
                'cancelled' => $cancelled,
                'today' => $todayBookings,
            ],
            'earnings' => [
                'value' => $earnings,
                'prev'  => $prevEarnings,
                'change' => $this->change($earnings, $prevEarnings),
            ],
            'wallet' => [
                'balance' => $balance,
                'locked' => $lockedBalance,
                'available' => $balance - $lockedBalance,
            ],
            'settlements' => [
                'pending_count' => $pendingSettlements,
                'pending_amount' => $pendingSettlementsAmount,
            ],
            'reviews' => [
                'avg_rating' => $avgRating,
                'total' => $totalReviews,
                'this_period' => $reviewsThisPeriod,
            ],
        ];
    }

    private function change($current, $prev): float
    {
        if ($prev == 0) return $current > 0 ? 100 : 0;
        return round((($current - $prev) / $prev) * 100, 1);
    }

    // ============ نمودار ============
    private function buildChart($user, $period): array
    {
        $from = now()->subDays($period);

        $bookingsData = DB::table('bookings')
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->where('barber_id', $user->id)
            ->where('created_at', '>=', $from)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $earningsData = DB::table('wallet_transactions')
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->where('user_id', $user->id)
            ->where('type', 'earning')
            ->where('status', 'completed')
            ->where('created_at', '>=', $from)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $labels = [];
        $bookings = [];
        $earnings = [];

        for ($i = $period - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $labels[] = $date;
            $bookings[] = (int) ($bookingsData[$date]->total ?? 0);
            $earnings[] = (float) ($earningsData[$date]->total ?? 0);
        }

        return [
            'labels'   => $labels,
            'bookings' => $bookings,
            'earnings' => $earnings,
        ];
    }

    // ============ رزروهای امروز ============
    private function getTodayBookings($user): array
    {
        return $user->barberBookings()
            ->with([
                'user:id,name,phone,avatar',
                'service:id,name,duration,price',
                'timeSlot:id,date,start_time,end_time',
            ])
            ->whereHas('timeSlot', fn($q) => $q->whereDate('date', today()))
            ->whereIn('status', [
                BookingStatus::confirmed->value,
                BookingStatus::pending->value,
            ])
            ->get()
            ->sortBy(fn($b) => $b->timeSlot?->start_time ?? '99:99')
            ->values()
            ->map(fn($b) => [
                'id' => $b->id,
                'status' => $b->status?->value,
                'status_label' => $b->status?->label(),
                'customer' => $b->user ? [
                    'id' => $b->user->id,
                    'name' => $b->user->name,
                    'phone' => $b->user->phone,
                    'avatar' => $b->user->avatar ? $b->user->avatarUrl() : null,
                ] : null,
                'service' => $b->service ? [
                    'id' => $b->service->id,
                    'name' => $b->service->name,
                    'duration' => $b->service->duration,
                    'price' => (float) $b->service->price,
                ] : null,
                'time' => $b->timeSlot ? [
                    'start' => $b->timeSlot->start_time,
                    'end' => $b->timeSlot->end_time,
                ] : null,
                'amount' => (float) $b->amount,
            ])
            ->toArray();
    }

    // ============ رزروهای آینده ============
    private function getUpcomingBookings($user): array
    {
        return $user->barberBookings()
            ->with([
                'user:id,name,phone,avatar',
                'service:id,name,duration,price',
                'timeSlot:id,date,start_time,end_time',
            ])
            ->whereHas('timeSlot', fn($q) => $q->whereDate('date', '>', today()))
            ->whereIn('status', [
                BookingStatus::confirmed->value,
                BookingStatus::pending->value,
            ])

            ->get()
            ->sortBy(fn($b) => ($b->timeSlot?->date ?? '') . ' ' . ($b->timeSlot?->start_time ?? ''))
            ->take(5)
            ->values()
            ->map(fn($b) => [
                'id' => $b->id,
                'status' => $b->status?->value,
                'status_label' => $b->status?->label(),
                'customer' => $b->user ? [
                    'name' => $b->user->name,
                    'avatar' => $b->user->avatar ? $b->user->avatarUrl() : null,
                ] : null,
                'service' => $b->service?->name,
                'date' => $b->timeSlot?->date,
                'time' => $b->timeSlot ? [
                    'start' => $b->timeSlot->start_time,
                    'end' => $b->timeSlot->end_time,
                ] : null,
            ])

            ->toArray();
    }

    // ============ نظرات اخیر ============
    private function getRecentReviews($user): array
    {
        return $user->reviews()
            ->with([
                'user:id,name,avatar',
                'booking:id,amount',
            ])
            ->where('status', ReviewStatus::approved->value)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'comment' => $r->comment
                    ? (mb_strlen($r->comment, 'UTF-8') > 120
                        ? mb_substr($r->comment, 0, 120, 'UTF-8') . '...'
                        : $r->comment)
                    : null,
                'customer' => $r->user ? [
                    'name' => $r->user->name,
                    'avatar' => $r->user->avatar ? $r->user->avatarUrl() : null,
                ] : null,
                'created_at' => $r->created_at?->toIso8601String(),
            ])
            ->toArray();
    }

    // ============ خدمات برتر ============
    private function getTopServices($user, $from): array
    {
        return $user->barberBookings()
            ->select('service_id', DB::raw('COUNT(*) as count'))
            ->with('service:id,name,price')
            ->where('created_at', '>=', $from)
            ->groupBy('service_id')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(fn($item) => [
                'service_id' => $item->service_id,
                'name' => $item->service?->name,
                'count' => (int) $item->count,
                'price' => (float) ($item->service?->price ?? 0),
            ])
            ->toArray();
    }

    // ============ برنامه هفتگی ============
    private function getWeeklySchedule($user): array
    {
        $availabilities = $user->availabilities()
            ->with('shifts')
            ->orderBy('day_of_week')
            ->get();

        $days = [
            0 => 'شنبه',
            1 => 'یکشنبه',
            2 => 'دوشنبه',
            3 => 'سه‌شنبه',
            4 => 'چهارشنبه',
            5 => 'پنجشنبه',
            6 => 'جمعه',
        ];

        return collect($days)->map(fn($name, $day) => [
            'day' => $day,
            'day_name' => $name,
            'is_active' => $availabilities->where('day_of_week', $day)->isNotEmpty(),
            'shifts' => $availabilities
                ->where('day_of_week', $day)
                ->flatMap(fn($a) => $a->shifts)
                ->map(fn($s) => [
                    'start' => $s->start_time,
                    'end' => $s->end_time,
                ])
                ->values()
                ->toArray(),
        ])->values()->toArray();
    }

    // ============ تراکنش‌های اخیر ============
    private function getRecentTransactions($user): array
    {
        return WalletTransaction::where('user_id', $user->id)
            ->whereIn('type', ['earning', 'commission', 'settlement'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'type' => $t->type,
                'direction' => $t->direction,
                'amount' => (float) $t->amount,
                'description' => $t->description,
                'created_at' => $t->created_at?->toIso8601String(),
            ])
            ->toArray();
    }
}
