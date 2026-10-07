<?php

namespace App\Http\Controllers\Barber;

use App\Enums\Casts\BookingCompletedBy;
use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\DisputedStatus;
use App\Enums\Casts\TimeSlotStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Notifications\BookingAutoCompletedForCustomer;
use App\Notifications\BookingCompletedForAdmin;
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

            // ============================================
            // اطلاعات اعتراض
            // ============================================
            $latestDispute = $booking->disputes()->latest()->first();

            return [
                'id' => $booking->id,
                'status' => $booking->status->value,
                'amount' => (float) $booking->amount,
                'notes' => $booking->notes,
                'created_at' => $booking->created_at,
                'confirmed_at' => $booking->confirmed_at,
                'cancelled_at' => $booking->cancelled_at,

                // ============================================
                // اطلاعات اعتراض 
                // ============================================
                'has_disputes' => $booking->disputes()->exists(),
                'disputes_count' => $booking->disputes()->count(),
                'latest_dispute' => $latestDispute ? [
                    'id' => $latestDispute->id,
                    'status' => $latestDispute->status->value,
                    'dispute_type' => $latestDispute->dispute_type->value,
                    'disputed_by' => $latestDispute->disputed_by->value,
                    'created_at' => $latestDispute->created_at,
                ] : null,

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
        // ============ بررسی مالکیت ============
        if ($booking->barber_id !== auth()->id()) {
            abort(403, 'این رزرو متعلق به شما نیست.');
        }

        // ============ بررسی وضعیت ============
        if ($booking->status->value !== BookingStatus::confirmed->value) {
            StickyAlert::alert('فقط رزروهای تایید شده قابل تکمیل هستند.', 'error');
            return redirect()->back();
        }

        // ============ بررسی وجود TimeSlot ============
        if (!$booking->timeSlot) {
            StickyAlert::alert('اطلاعات زمان این رزرو یافت نشد.', 'error');
            return redirect()->back();
        }

        // ============ بررسی زمان ============
        $slotDateTime = Carbon::parse(
            Carbon::parse($booking->timeSlot->date)->format('Y-m-d') . ' ' . $booking->timeSlot->start_time
        );

        // نوبت باید گذشته باشد
        if ($slotDateTime->isFuture()) {
            StickyAlert::alert('زمان این نوبت هنوز نرسیده است.', 'error');
            return redirect()->back();
        }

        // ============ بررسی عدم اعتراض ============
        if ($booking->is_disputed) {
            StickyAlert::alert('این رزرو در حال بررسی اعتراض است و قابل تکمیل نیست.', 'error');
            return redirect()->back();
        }

        // ============ شروع تراکنش ============
        DB::beginTransaction();

        try {
            // ۱. بروزرسانی رزرو
            $booking->update([
                'status' => BookingStatus::completed->value,
                'completed_at' => now(),
                'completed_by' => BookingCompletedBy::barber->value,
            ]);

            // ۲. ثبت لاگ


            (new \App\Models\Log())->storeLog($booking->id,  'barber_complete_booking', "تکمیل رزرو #{$booking->id} توسط آرایشگر",);


            // ۳. Notification به مشتری
            try {
                if ($booking->user) {
                    $booking->user->notify(
                        new BookingAutoCompletedForCustomer($booking)
                    );
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Notification to customer failed', [
                    'booking_id' => $booking->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // ۴. Notification به ادمین (اختیاری)
            try {
                \App\Models\User::role(['سوپر ادمین'])
                    ->get()
                    ->each(function ($admin) use ($booking) {
                        $admin->notify(
                            new BookingCompletedForAdmin($booking)
                        );
                    });
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Notification to admins failed', [
                    'booking_id' => $booking->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // ۵. آزادسازی درآمد (اگر کیف پول دارید)
            // $this->releaseEarnings($booking);

            DB::commit();
            StickyAlert::alert('تکمیل خدمت با موفقیت تایید شد. درآمد آن به کیف پول شما اضافه شد.', 'success');
            return to_route('barber.bookings.show', $booking->id);
        } catch (\Exception $e) {
            DB::rollBack();

            \Illuminate\Support\Facades\Log::error('Barber complete booking failed', [
                'booking_id' => $booking->id,
                'barber_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            StickyAlert::alert('خطا در تکمیل خدمت. لطفاً دوباره تلاش کنید.', 'error');
            return redirect()->back();
        }
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

        // ============ بررسی مالکیت ============
        if ($booking->barber_id !== auth()->id()) {
            abort(403);
        }

        $booking->load([
            'user:id,name,avatar,phone,slug',
            'service:id,name,description,image,duration,price',
            'timeSlot:id,date,start_time,end_time',
            'payment',
            'review',
            'disputes' => fn($q) => $q->latest(),
        ]);

        // ============ بررسی زمان ============
        $timeSlot = $booking->timeSlot;
        $slotDateTime = $timeSlot
            ? Carbon::parse(Carbon::parse($timeSlot->date)->format('Y-m-d') . ' ' . $timeSlot->start_time)
            : null;

        $isPast = $slotDateTime && $slotDateTime->isPast();

        // ============ بررسی امکان تایید تکمیل ============
        $canComplete = false;
        if ($booking->status->value === BookingStatus::confirmed->value && $slotDateTime) {
            $canComplete = $slotDateTime->isPast();
        }

        // ============ بررسی امکان لغو ============
        $canCancel = false;
        if (in_array($booking->status->value, [
            BookingStatus::pending->value,
            BookingStatus::confirmed->value,
        ]) && $slotDateTime) {
            $canCancel = $slotDateTime->isFuture();
        }

        // ============================================
        // بررسی امکان اعتراض آرایشگر
        // ============================================
        $canBarberDispute = false;
        $disputeHoursRemaining = null;

        if (
            $booking->status->value === BookingStatus::completed->value
            && $booking->completed_by?->value !== BookingCompletedBy::barber->value
            && $booking->completed_at
        ) {

            $deadline = $booking->completed_at->copy()->addHours(24);
            $hoursRemaining = now()->diffInHours($deadline, false);

            $activeDispute = $booking->disputes()
                ->where('disputed_by_user_id', auth()->id())
                ->whereIn('status', [DisputedStatus::pending->value, DisputedStatus::investigating->value, DisputedStatus::awaitingResponse->value])
                ->exists();

            if (!$activeDispute && $hoursRemaining > 0) {
                $canBarberDispute = true;
                $disputeHoursRemaining = $hoursRemaining;
            }
        }

        // ============================================
        // اطلاعات اعتراضات
        // ============================================
        $disputes = $booking->disputes->map(function ($dispute) {
            return [
                'id' => $dispute->id,
                'disputed_by' => $dispute->disputed_by,
                'dispute_type' => $dispute->dispute_type->value,
                'disputed_by_user_id' => $dispute->disputed_by_user_id,
                'reason' => $dispute->reason,
                'status' => $dispute->status->value,
                'response' => $dispute->response,
                'resolution' => $dispute->resolution,
                'attachments' => collect($dispute->attachments ?? [])
                    ->map(fn($path) => [
                        'path' => $path,
                        'url' => asset('storage/' . $path),
                        'name' => basename($path),
                    ])->toArray(),
                'created_at' => $dispute->created_at,

                // ============================================
                // دسترسی‌ها
                // ============================================
                'can_edit' => $dispute->disputed_by_user_id === auth()->id()
                    && $dispute->status->value === DisputedStatus::pending->value
                    && $dispute->created_at->diffInHours(now()) <= 2,
                'can_delete' => $dispute->disputed_by_user_id === auth()->id()
                    && $dispute->status->value === DisputedStatus::pending->value
                    && $dispute->created_at->diffInHours(now()) <= 2,
                'can_respond' => $dispute->disputed_by_user_id === auth()->id()
                    && $dispute->status->value === DisputedStatus::awaitingResponse->value,
            ];
        })->toArray();

        return Inertia::render('Barber/Bookings/Show', [
            'booking' => [
                'id' => $booking->id,
                'status' => $booking->status->value,
                'amount' => (float) $booking->amount,
                'notes' => $booking->notes,
                'created_at' => $booking->created_at,
                'confirmed_at' => $booking->confirmed_at,
                'cancelled_at' => $booking->cancelled_at,
                'cancelled_by' => $booking->cancelled_by,
                'completed_at' => $booking->completed_at,
                'completed_by' => $booking->completed_by,
                'auto_completed' => (bool) $booking->auto_completed,
                'is_past' => $isPast,

                // ============ دسترسی‌ها ============
                'can_complete' => $canComplete,
                'can_cancel' => $canCancel,
                'dispute_reason' => $booking->dispute_reason,

                // ============================================
                // دسترسی‌های اعتراض
                // ============================================
                'can_barber_dispute' => $canBarberDispute,
                'dispute_hours_remaining' => $disputeHoursRemaining,

                // ============================================
                // اطلاعات اعتراضات
                // ============================================
                'has_disputes' => count($disputes) > 0,
                'disputes_count' => count($disputes),
                'disputes' => $disputes,
                'latest_dispute' => !empty($disputes) ? $disputes[0] : null,

                // ============ اطلاعات مشتری ============
                'customer' => $booking->user ? [
                    'id' => $booking->user->id,
                    'name' => $booking->user->name,
                    'avatar' => $booking->user->avatar,
                    'thumbnail' => $booking->user->avatar(),
                    'phone' => $booking->user->phone,
                    'email' => $booking->user->email,
                ] : null,

                // ============ اطلاعات خدمت ============
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

                // ============ اطلاعات زمان ============
                'date' => $timeSlot?->date,
                'start_time' => $timeSlot?->start_time,
                'end_time' => $timeSlot?->end_time,

                // ============ اطلاعات پرداخت ============
                'payment' => $booking->payment ? [
                    'gateway' => $booking->payment->gateway,
                    'status' => $booking->payment->status,
                    'amount' => (float) $booking->payment->amount,
                    'transaction_id' => $booking->payment->transaction_id,
                    'paid_at' => $booking->payment->paid_at,
                ] : null,

                // ============ اطلاعات نظر ============
                'review' => $booking->review ? [
                    'id' => $booking->review->id,
                    'rating' => (int) $booking->review->rating,
                    'comment' => $booking->review->comment,
                    'status' => $booking->review->status,
                    'created_at' => $booking->review->created_at,
                ] : null,
            ],
        ]);
    }
}
