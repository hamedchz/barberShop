<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\ReviewStatus;
use App\Enums\Casts\WalletTransactionDirection;
use App\Enums\Casts\WalletTransactionType;
use App\Models\Booking;
use App\Models\Review;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $wallet = $user->wallet;

        // ============ آمار سریع ============
        $stats = [
            'balance' => (float) ($wallet?->balance ?? 0),

            // رزروهای فعال (pending + confirmed)
            'active_bookings' => Booking::where('user_id', $user->id)
                ->whereIn('status', [
                    BookingStatus::pending->value,
                    BookingStatus::confirmed->value,
                ])
                ->count(),

            // رزروهای تکمیل‌شده
            'completed_bookings' => Booking::where('user_id', $user->id)
                ->where('status', BookingStatus::completed->value)
                ->count(),

            // میانگین امتیازی که مشتری به آرایشگرها داده
            'average_rating' => round(
                Review::where('user_id', $user->id)
                    ->where('status', ReviewStatus::approved->value)
                    ->avg('rating') ?? 0,
                1
            ),
        ];

        // ============ رزرو بعدی ============
        $nextBooking = Booking::where('bookings.user_id', $user->id)
            ->whereIn('bookings.status', [
                BookingStatus::pending->value,
                BookingStatus::confirmed->value,
            ])
            ->whereHas('timeSlot', function ($q) {
                $q->where('date', '>=', now()->toDateString());
            })
            ->with([
                'barber:id,name,avatar',
                'service:id,name,price,duration',
                'timeSlot:id,date,start_time,end_time',
            ])
            ->orderByRaw('(
        SELECT date FROM time_slots 
        WHERE time_slots.id = bookings.time_slot_id
    ) ASC')
            ->orderByRaw('(
        SELECT start_time FROM time_slots 
        WHERE time_slots.id = bookings.time_slot_id
    ) ASC')
            ->first();

        // ============ آخرین تراکنش‌ها ============
        // استفاده از WalletTransaction (نه Transaction)
        $recentTransactions = WalletTransaction::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'type' => $t->isCredit() ? WalletTransactionDirection::credit->value : WalletTransactionDirection::debit->value,
                'amount' => (float) $t->amount,
                'description' => $t->description,
                'status' => $t->status?->value,
                'balance_after' => (float) $t->balance_after,
                'created_at' => $t->created_at->toIso8601String(),
            ]);

        // ============ آخرین نظرات ============
        $recentReviews = Review::where('user_id', $user->id)
            ->where('status', ReviewStatus::approved->value)
            ->with([
                'barber:id,name,avatar',
                'booking:id,id',
            ])
            ->orderByDesc('created_at')
            ->limit(2)
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'barber_name' => $r->barber?->name,
                'barber_avatar' => $r->barber?->avatarUrl(),
                'created_at' => $r->created_at->toIso8601String(),
            ]);

        return Inertia::render('Customer/Dashboard/Index', [
            'user' => [
                'name' => $user->name,
                'avatar' => $user->avatarUrl(),
                'phone' => $user->phone,
            ],
            'stats' => $stats,
            'nextBooking' => $nextBooking ? [
                'id' => $nextBooking->id,
                'status' => $nextBooking->status?->value,
                'date' => $nextBooking->timeSlot?->date,
                'start_time' => $nextBooking->timeSlot?->start_time,
                'end_time' => $nextBooking->timeSlot?->end_time,
                'barber' => [
                    'name' => $nextBooking->barber?->name,
                    'avatar' => $nextBooking->barber?->avatarUrl(),
                ],
                'service' => [
                    'name' => $nextBooking->service?->name,
                    'price' => (float) ($nextBooking->service?->price ?? 0),
                    'duration' => $nextBooking->service?->duration,
                ],
            ] : null,
            'recentTransactions' => $recentTransactions,
            'recentReviews' => $recentReviews,
        ]);
    }
}
