<?php

namespace App\Http\Controllers\Barber;

use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\TimeSlotStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Supports\StickyAlert;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * لیست رزروهای آرایشگر
     */
    public function index(Request $request)
    {
        $barberId = auth()->id();

        $query = Booking::where('barber_id', $barberId)
            ->with([
                'user:id,name,avatar,phone',
                'service:id,name,image,duration,price',
                'timeSlot:id,date,start_time,end_time',
                'payment:id,booking_id,status,amount',
            ]);

        // ============ فیلتر وضعیت ============
        if ($status = $request->input('status')) {
            if ($status === 'today') {
                // امروز
                $query->whereHas('timeSlot', function ($q) {
                    $q->where('date', Carbon::today());
                });
            } elseif ($status === 'upcoming') {
                // آینده
                $query->whereIn('status', [
                    BookingStatus::pending->value,
                    BookingStatus::confirmed->value,
                ])
                    ->whereHas('timeSlot', function ($q) {
                        $q->where('date', '>=', Carbon::today());
                    });
            } elseif ($status === 'past') {
                // گذشته
                $query->where(function ($q) {
                    $q->whereIn('status', [
                        BookingStatus::completed->value,
                        BookingStatus::cancelled->value,
                    ])
                        ->orWhereHas('timeSlot', function ($sq) {
                            $sq->where('date', '<', Carbon::today());
                        });
                });
            } else {
                $query->where('status', $status);
            }
        }

        // ============ فیلتر تاریخ ============
        if ($dateFrom = $request->input('date_from')) {
            $query->whereHas('timeSlot', function ($q) use ($dateFrom) {
                $q->where('date', '>=', $dateFrom);
            });
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereHas('timeSlot', function ($q) use ($dateTo) {
                $q->where('date', '<=', $dateTo);
            });
        }

        // ============ جستجو ============
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                })->orWhereHas('service', function ($sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%");
                });
            });
        }

        // ============ مرتب‌سازی ============
        $sort = $request->input('sort', 'latest');
        switch ($sort) {
            case 'oldest':
                $query->oldest();
                break;
            case 'upcoming':
                $query->join('time_slots', 'bookings.time_slot_id', '=', 'time_slots.id')
                    ->orderBy('time_slots.date', 'asc')
                    ->orderBy('time_slots.start_time', 'asc')
                    ->select('bookings.*');
                break;
            default:
                $query->latest();
        }

        $bookings = $query->paginate(21)->withQueryString();

        // ============ آمار ============
        $stats = [
            'total' => Booking::where('barber_id', $barberId)->count(),
            'today' => Booking::where('barber_id', $barberId)
                ->whereHas('timeSlot', fn($q) => $q->where('date', Carbon::today()))
                ->whereIn('status', [BookingStatus::pending->value, BookingStatus::confirmed->value])
                ->count(),
            'pending' => Booking::where('barber_id', $barberId)
                ->where('status', BookingStatus::pending->value)
                ->count(),
            'confirmed' => Booking::where('barber_id', $barberId)
                ->where('status', BookingStatus::confirmed->value)
                ->count(),
            'completed' => Booking::where('barber_id', $barberId)
                ->where('status', BookingStatus::completed->value)
                ->count(),
            'cancelled' => Booking::where('barber_id', $barberId)
                ->where('status', BookingStatus::cancelled->value)
                ->count(),
            'today_revenue' => Booking::where('barber_id', $barberId)
                ->where('status', BookingStatus::completed->value)
                ->whereHas('timeSlot', fn($q) => $q->where('date', Carbon::today()))
                ->sum('amount'),
            'month_revenue' => Booking::where('barber_id', $barberId)
                ->where('status', BookingStatus::completed->value)
                ->whereHas('timeSlot', function ($q) {
                    $q->whereMonth('date', Carbon::now()->month)
                        ->whereYear('date', Carbon::now()->year);
                })
                ->sum('amount'),
        ];

        // ============ تبدیل داده‌ها ============
        $bookings->through(function ($booking) {
            $slotDateTime = $booking->timeSlot
                ? Carbon::parse(Carbon::parse($booking->timeSlot->date)->format('Y-m-d') . ' ' . $booking->timeSlot->start_time)
                : null;

            $canConfirm = $booking->status->value === BookingStatus::pending->value
                && $slotDateTime
                && $slotDateTime->isFuture();

            $canComplete = $booking->status->value === BookingStatus::confirmed->value
                && $slotDateTime
                && $slotDateTime->isPast();

            $canCancel = $booking->status->value == BookingStatus::pending->value

                && $slotDateTime
                && $slotDateTime->isFuture();

            // بررسی نظر
            $hasReview = Review::where('booking_id', $booking->id)->exists();

            return [
                'id' => $booking->id,
                'status' => $booking->status->value,
                'amount' => (float) $booking->amount,
                'notes' => $booking->notes,
                'created_at' => $booking->created_at,
                'confirmed_at' => $booking->confirmed_at,
                'cancelled_at' => $booking->cancelled_at,

                'can_confirm' => $canConfirm,
                'can_complete' => $canComplete,
                'can_cancel' => $canCancel,
                'has_review' => $hasReview,

                'customer' => $booking->user ? [
                    'id' => $booking->user->id,
                    'name' => $booking->user->name,
                    'avatar' => $booking->user->avatar,
                    'thumbnail' => $booking->user->avatar(),
                    'phone' => $booking->user->phone,
                ] : null,

                'service' => $booking->service ? [
                    'id' => $booking->service->id,
                    'name' => $booking->service->name,
                    'image' => $booking->service->image
                        ? asset('storage/' . $booking->service->image)
                        : null,
                    'duration' => $booking->service->duration,
                    'price' => (float) $booking->service->price,
                ] : null,

                'date' => $booking->timeSlot?->date,
                'start_time' => $booking->timeSlot?->start_time,
                'end_time' => $booking->timeSlot?->end_time,

                'payment_status' => $booking->payment?->status,
            ];
        });

        return Inertia::render('Barber/Bookings/Index', [
            'bookings' => $bookings,
            'stats' => $stats,
            'filters' => [
                'status' => $request->input('status', ''),
                'search' => $search ?? '',
                'sort' => $sort,
                'date_from' => $request->input('date_from', ''),
                'date_to' => $request->input('date_to', ''),
            ],
        ]);
    }

    /**
     * تایید رزرو
     */
    public function confirm(Booking $booking)
    {
        if ($booking->barber_id !== auth()->id()) {
            abort(403);
        }

        if ($booking->status->value !== BookingStatus::pending->value) {
            return back()->with('error', 'این رزرو قابل تایید نیست.');
        }

        $booking->update([
            'status' => BookingStatus::confirmed->value,
            'confirmed_at' => now(),
        ]);

        return back()->with('success', 'رزرو با موفقیت تایید شد.');
    }

    /**
     * تکمیل رزرو
     */
    public function complete(Booking $booking)
    {
        if ($booking->barber_id !== auth()->id()) {
            abort(403);
        }

        if ($booking->status->value !== BookingStatus::confirmed->value) {
            return back()->with('error', 'این رزرو قابل تکمیل نیست.');
        }

        $booking->update([
            'status' => BookingStatus::completed->value,
        ]);

        return back()->with('success', 'رزرو با موفقیت تکمیل شد.');
    }

    /**
     * لغو رزرو توسط آرایشگر
     */
    public function cancel(Booking $booking)
    {
        if ($booking->barber_id !== auth()->id()) {
            abort(403);
        }

        if (
            $booking->status->value !==
            BookingStatus::pending->value

        ) {
            StickyAlert::alert('این رزرو قابل لغو نیست.', 'error');
            return redirect()
                ->back();
        }

        DB::beginTransaction();

        try {
            $booking->update([
                'status' => BookingStatus::cancelled->value,
                'cancelled_at' => now(),
                'notes' => ($booking->notes ? $booking->notes . "\n" : '') .
                    'لغو شده توسط آرایشگر در ' . now()->format('Y/m/d H:i'),
            ]);

            // آزاد کردن بازه
            if ($booking->timeSlot) {
                $booking->timeSlot->update([
                    'status' => TimeSlotStatus::available->value,
                    'booked_by' => null,
                ]);
            }

            // برگشت مبلغ (اگر پرداخت موفق بوده)
            // if ($booking->payment && $booking->payment->status === 'success') {
            //     // TODO: refund
            //     $booking->payment->update(['status' => 'refund_pending']);
            // }

            DB::commit();
            StickyAlert::alert('رزرو لغو شد.', 'success');
            return redirect()
                ->back();
        } catch (\Exception $e) {
            DB::rollBack();
            // \Log::error('Barber cancel booking failed: ' . $e->getMessage());
            StickyAlert::alert('خطا در لغو رزرو.', 'success');
            return redirect()
                ->back();
        }
    }



    /**
     * نمایش جزئیات رزرو
     */
    public function show(Booking $booking)
    {
        if ($booking->barber_id !== auth()->id()) {
            abort(403);
        }

        $booking->load([
            'user:id,name,avatar,phone',
            'service:id,name,description,image,duration,price',
            'timeSlot:id,date,start_time,end_time',
            'payment',
        ]);

        $review = Review::where('booking_id', $booking->id)->first();

        return Inertia::render('Barber/Bookings/Show', [
            'booking' => [
                'id' => $booking->id,
                'status' => $booking->status->value,
                'amount' => (float) $booking->amount,
                'notes' => $booking->notes,
                'created_at' => $booking->created_at,
                'confirmed_at' => $booking->confirmed_at,
                'cancelled_at' => $booking->cancelled_at,

                'customer' => $booking->user ? [
                    'id' => $booking->user->id,
                    'name' => $booking->user->name,
                    'avatar' => $booking->user->avatar,
                    'thumbnail' => $booking->user->avatar(),
                    'phone' => $booking->user->phone,
                    'email' => $booking->user->email,
                ] : null,

                'service' => $booking->service ? [
                    'id' => $booking->service->id,
                    'name' => $booking->service->name,
                    'description' => $booking->service->description,
                    'image' => $booking->service->image
                        ? asset('storage/' . $booking->service->image)
                        : null,
                    'duration' => $booking->service->duration,
                    'price' => (float) $booking->service->price,
                ] : null,

                'date' => $booking->timeSlot?->date,
                'start_time' => $booking->timeSlot?->start_time,
                'end_time' => $booking->timeSlot?->end_time,

                'payment' => $booking->payment ? [
                    'gateway' => $booking->payment->gateway,
                    'status' => $booking->payment->status,
                    'amount' => (float) $booking->payment->amount,
                    'transaction_id' => $booking->payment->transaction_id,
                    'paid_at' => $booking->payment->paid_at,
                ] : null,

                'review' => $review ? [
                    'id' => $review->id,
                    'rating' => (int) $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at,
                ] : null,
            ],
        ]);
    }
}
