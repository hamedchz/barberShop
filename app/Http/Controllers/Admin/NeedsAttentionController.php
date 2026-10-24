<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Dispute;
use App\Models\Review;
use App\Models\Settlement;
use App\Enums\Casts\DisputedStatus;
use App\Enums\Casts\ReviewStatus;
use App\Enums\Casts\SettlementStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Pagination\LengthAwarePaginator;


class NeedsAttentionController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->input('tab', 'all');

        // ============ اعتراضات باز ============
        $disputes = Dispute::with([
            'booking.user:id,name,phone',
            'booking.barber:id,name,phone',
            'booking.service:id,name',
            'disputedBy',
        ])
            ->whereIn('status', [
                DisputedStatus::pending->value,
                DisputedStatus::investigating->value,
                DisputedStatus::awaitingResponse->value,
            ])
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn($d) => [
                'id'       => $d->id,
                'type'     => 'dispute',
                'status'   => $d->status?->value,
                'priority' => 'high',
                'title'    => "اعتراض #{$d->id}",
                'subtitle' => $d->reason ?? 'بدون توضیح',
                'user'     => $d->booking?->user ? [
                    'name'  => $d->booking->user->name,
                    'phone' => $d->booking->user->phone,
                ] : null,
                'barber'   => $d->booking?->barber ? [
                    'name'  => $d->booking->barber->name,
                    'phone' => $d->booking->barber->phone,
                ] : null,
                'service'  => $d->booking?->service?->name,
                'amount'   => (float) ($d->booking?->amount ?? 0),
                'created_at' => $d->created_at?->toIso8601String(),
                'action_url' => "/admin/disputes/{$d->id}",
            ]);

        // ============ تسویه‌های در انتظار ============
        $settlements = Settlement::with(['user:id,name,phone,avatar'])
            ->whereIn('status', [
                SettlementStatus::pending->value,
                SettlementStatus::processing->value,
            ])
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn($s) => [
                'id'       => $s->id,
                'type'     => 'settlement',
                'status'   => $s->status?->value,
                'priority' => $s->status === SettlementStatus::pending
                    ? 'high'
                    : 'medium',
                'title'    => "درخواست تسویه #{$s->id}",
                'subtitle' => $s->status === SettlementStatus::pending
                    ? 'در انتظار بررسی'
                    : 'در حال پردازش',
                'user'     => $s->user ? [
                    'name'  => $s->user->name,
                    'phone' => $s->user->phone,
                ] : null,
                'amount'   => (float) $s->amount,
                'created_at' => $s->created_at?->toIso8601String(),
                'action_url' => "/admin/finance/settlements?search={$s->id}",
            ]);

        // ============ نظرات در انتظار ============
        $reviews = Review::with([
            'user:id,name,phone',
            'barber:id,name,phone',
            'booking:id,amount',
        ])
            ->where('status', ReviewStatus::pending->value)
            ->whereNull('deleted_at')
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn($r) => [
                'id'       => $r->id,
                'type'     => 'review',
                'status'   => $r->status?->value,
                'priority' => 'medium',
                'title'    => "نظر #{$r->id}",
                'subtitle' => $r->comment
                    ? substr($r->comment, 0, 100) . (strlen($r->comment) > 100 ? '...' : '')
                    : 'بدون متن',
                'rating'   => (int) $r->rating,
                'user'     => $r->user ? [
                    'name'  => $r->user->name,
                    'phone' => $r->user->phone,
                ] : null,
                'barber'   => $r->barber ? [
                    'name'  => $r->barber->name,
                    'phone' => $r->barber->phone,
                ] : null,
                'created_at' => $r->created_at?->toIso8601String(),
                'action_url' => "/admin/reviews/{$r->id}/show",
            ]);

        // ============ گزارش‌های باز ============
        $reports = collect(); // اگه جدول Report داری، اینجا پر کن
        // $reports = Report::where('status', 'open')...

        // ============ ترکیب بر اساس tab ============
        $items = collect();

        if ($tab === 'all' || $tab === 'disputes') {
            $items = $items->merge($disputes);
        }

        if ($tab === 'all' || $tab === 'settlements') {
            $items = $items->merge($settlements);
        }

        if ($tab === 'all' || $tab === 'reviews') {
            $items = $items->merge($reviews);
        }

        if ($tab === 'all' || $tab === 'reports') {
            $items = $items->merge($reports);
        }

        // مرتب‌سازی تمام موارد بر اساس تاریخ
        $items = $items
            ->sortByDesc('created_at')
            ->values();

        // ============ آمار کل موارد فیلترشده ============
        $stats = [
            'total'         => $items->count(),
            'disputes'      => $disputes->count(),
            'settlements'   => $settlements->count(),
            'reviews'       => $reviews->count(),
            'reports'       => $reports->count(),
            'high_priority' => $items->where('priority', 'high')->count(),
            'total_amount'  => $items->sum('amount'),
        ];

        // ============ صفحه‌بندی ============
        $perPage = 33;

        $currentPage = LengthAwarePaginator::resolveCurrentPage();

        $paginatedItems = new LengthAwarePaginator(
            $items->forPage($currentPage, $perPage)->values(),
            $items->count(),
            $perPage,
            $currentPage,
            [
                'path' => LengthAwarePaginator::resolveCurrentPath(),
                'query' => $request->query(),
            ]
        );

        return Inertia::render('Admin/NeedsAttention/Index', [
            'items' => $paginatedItems->items(),

            'pagination' => [
                'current_page' => $paginatedItems->currentPage(),
                'last_page'    => $paginatedItems->lastPage(),
                'per_page'     => $paginatedItems->perPage(),
                'total'        => $paginatedItems->total(),
                'from'         => $paginatedItems->firstItem(),
                'to'           => $paginatedItems->lastItem(),
                'links'        => $paginatedItems->linkCollection(),
            ],

            'stats' => $stats,

            'filters' => [
                'tab' => $tab,
            ],

            'scopes' => ['needs-attention']
        ]);
    }
}
