<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Dispute;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Settlement;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletDeposit;
use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\DisputedStatus;
use App\Enums\Casts\ReviewStatus;
use App\Enums\Casts\SettlementStatus;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $period = (int) $request->input('period', 30);

        return Inertia::render('Admin/Dashboard/Index', [
            'stats'         => $this->buildStats($period),
            'chart'         => $this->buildChart($period),
            'recent'        => $this->buildRecent(),
            'topBarbers'    => $this->buildTopBarbers($period),
            'attention'     => $this->buildAttention(),
            'notifications' => $this->buildNotifications(),
            'period'        => $period,
        ]);
    }

    // ============ آمار کلی ============
    private function buildStats(int $period): array
    {
        $from = now()->subDays($period);
        $prevFrom = now()->subDays($period * 2);

        // ============ درآمد (کمیسیون + جریمه) ============
        $revenue = (float) WalletTransaction::query()
            ->whereIn('type', ['commission', 'penalty'])
            ->where('status', 'completed')
            ->where('created_at', '>=', $from)
            ->sum('amount');

        $prevRevenue = (float) WalletTransaction::query()
            ->whereIn('type', ['commission', 'penalty'])
            ->where('status', 'completed')
            ->whereBetween('created_at', [$prevFrom, $from])
            ->sum('amount');

        // ============ رزروها ============
        $bookings = Booking::where('created_at', '>=', $from)->count();
        $prevBookings = Booking::whereBetween('created_at', [$prevFrom, $from])->count();

        $completedBookings = Booking::where('status', BookingStatus::completed->value)
            ->where('created_at', '>=', $from)
            ->count();

        // ============ کاربران ============
        $users = User::where('created_at', '>=', $from)->count();
        $prevUsers = User::whereBetween('created_at', [$prevFrom, $from])->count();

        // ============ نظرات ============
        $reviews = Review::where('created_at', '>=', $from)->count();
        $pendingReviews = Review::where('status', ReviewStatus::pending->value)->count();

        // ============ پرداخت‌ها ============
        $payments = (float) Payment::where('status', 'success')
            ->where('created_at', '>=', $from)
            ->sum('amount');
        $prevPayments = (float) Payment::where('status', 'success')
            ->whereBetween('created_at', [$prevFrom, $from])
            ->sum('amount');

        // ============ اعتراضات و تسویه ============
        $openDisputes = Dispute::whereIn('status', [
            DisputedStatus::pending->value,
            DisputedStatus::investigating->value,
            DisputedStatus::awaitingResponse->value,
        ])->count();

        $pendingSettlements = Settlement::whereIn('status', [
            SettlementStatus::pending->value,
            SettlementStatus::processing->value,
        ])->count();
        $pendingSettlementsAmount = (float) Settlement::whereIn('status', [
            SettlementStatus::pending->value,
            SettlementStatus::processing->value,
        ])->sum('amount');

        return [
            'revenue' => [
                'value' => $revenue,
                'prev'  => $prevRevenue,
                'change' => $this->change($revenue, $prevRevenue),
            ],
            'bookings' => [
                'value' => $bookings,
                'prev'  => $prevBookings,
                'change' => $this->change($bookings, $prevBookings),
                'completed' => $completedBookings,
            ],
            'users' => [
                'value' => $users,
                'prev'  => $prevUsers,
                'change' => $this->change($users, $prevUsers),
            ],
            'reviews' => [
                'value' => $reviews,
                'pending' => $pendingReviews,
            ],
            'payments' => [
                'value' => $payments,
                'prev'  => $prevPayments,
                'change' => $this->change($payments, $prevPayments),
            ],
            'attention' => [
                'disputes' => $openDisputes,
                'settlements' => $pendingSettlements,
                'settlements_amount' => $pendingSettlementsAmount,
            ],
        ];
    }

    private function change(float $current, float $prev): float
    {
        if ($prev == 0) return $current > 0 ? 100 : 0;
        return round((($current - $prev) / $prev) * 100, 1);
    }

    // ============ نمودار ============
    private function buildChart(int $period): array
    {
        $from = now()->subDays($period);

        // درآمد روزانه
        $revenueData = DB::table('wallet_transactions')
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->whereIn('type', ['commission', 'penalty'])
            ->where('status', 'completed')
            ->where('created_at', '>=', $from)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // رزروهای روزانه
        $bookingsData = DB::table('bookings')
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->where('created_at', '>=', $from)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $labels = [];
        $revenue = [];
        $bookings = [];

        for ($i = $period - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $labels[] = $date;
            $revenue[] = (float) ($revenueData[$date]->total ?? 0);
            $bookings[] = (int) ($bookingsData[$date]->total ?? 0);
        }

        return [
            'labels'   => $labels,
            'revenue'  => $revenue,
            'bookings' => $bookings,
        ];
    }

    // ============ آخرین فعالیت‌ها ============
    private function buildRecent(): array
    {
        $bookings = Booking::with(['user:id,name', 'service:id,name'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($b) => [
                'type'  => 'booking',
                'id'    => $b->id,
                'title' => "رزرو #{$b->id}",
                'subtitle' => "{$b->user?->name} - {$b->service?->name}",
                'status' => $b->status?->value,
                'status_label' => $b->status?->label(),
                'created_at' => $b->created_at?->toIso8601String(),
                'url'   => "/admin/bookings/{$b->id}",
            ]);

        $reviews = Review::with(['user:id,name'])
            ->latest()
            ->limit(3)
            ->get()
            ->map(fn($r) => [
                'type'  => 'review',
                'id'    => $r->id,
                'title' => "نظر #{$r->id}",
                'subtitle' => "{$r->user?->name} - {$r->rating} ستاره",
                'status' => $r->status?->value,
                'status_label' => $r->status?->label(),
                'created_at' => $r->created_at?->toIso8601String(),
                'url'   => "/admin/reviews/{$r->id}",
            ]);

        $settlements = Settlement::with(['user:id,name'])
            ->latest()
            ->limit(3)
            ->get()
            ->map(fn($s) => [
                'type'  => 'settlement',
                'id'    => $s->id,
                'title' => "تسویه #{$s->id}",
                'subtitle' => "{$s->user?->name} - " . number_format($s->amount),
                'status' => $s->status?->value,
                'status_label' => $s->status?->label(),
                'created_at' => $s->created_at?->toIso8601String(),
                'url'   => "/admin/finance/settlements?search={$s->id}",
            ]);

        return collect()
            ->merge($bookings)
            ->merge($reviews)
            ->merge($settlements)
            ->sortByDesc('created_at')
            ->take(10)
            ->values()
            ->toArray();
    }

    // ============ برترین آرایشگرها ============
    private function buildTopBarbers(int $period): array
    {
        $from = now()->subDays($period);

        return User::role('آرایشگر')
            ->withCount(['barberBookings as bookings_count' => fn($q) => $q->where('created_at', '>=', $from)])
            ->having('bookings_count', '>', 0)
            ->orderByDesc('bookings_count')
            ->limit(5)
            ->get()
            ->map(fn($u) => [
                'id'       => $u->id,
                'name'     => $u->name,
                'avatar'   => $u->avatar ? $u->avatarUrl() : null,
                'rating'   => (float) ($u->average_rating ?? 0),
                'reviews'  => (int) ($u->total_reviews ?? 0),
                'bookings' => (int) $u->bookings_count,
                'slug'     => $u->slug,
            ])
            ->toArray();
    }

    // ============ نیازمند رسیدگی ============
    private function buildAttention(): array
    {
        return [
            'disputes' => Dispute::whereIn('status', [
                DisputedStatus::pending->value,
                DisputedStatus::investigating->value,
                DisputedStatus::awaitingResponse->value,
            ])->count(),
            'pending_reviews' => Review::where('status', ReviewStatus::pending->value)
                ->whereNull('deleted_at')
                ->count(),
            'pending_settlements' => Settlement::where('status', SettlementStatus::pending->value)->count(),
            'failed_payments' => Payment::where('status', 'failed')
                ->whereDate('created_at', today())
                ->count(),
        ];
    }

    // ============ اعلان‌های اخیر ============
    private function buildNotifications(): array
    {
        return auth()->user()
            ->notifications()
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($n) => [
                'id'         => $n->id,
                'type'       => $n->data['type'] ?? 'system',
                'title'      => $n->data['title'] ?? 'اعلان',
                'message'    => $n->data['message'] ?? '',
                'action_url' => $n->data['action_url'] ?? null,
                'is_read'    => $n->read_at !== null,
                'created_at' => $n->created_at?->toIso8601String(),
            ])
            ->toArray();
    }
}
