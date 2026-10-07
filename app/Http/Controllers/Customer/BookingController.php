<?php

namespace App\Http\Controllers\Customer;

use App\Enums\Casts\BookingCompletedBy;
use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\DisputedBy;
use App\Enums\Casts\DisputedStatus;
use App\Enums\Casts\PaymentStatus;
use App\Enums\Casts\ReviewStatus;
use App\Enums\Casts\TimeSlotStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Dispute;
use App\Models\Payment;
use App\Models\Review;
use App\Models\TimeSlot;
use App\Models\User;
use App\Notifications\BookingCompletedByCustomer;
use App\Notifications\BookingCompletedByCustomerForAdmin;
use App\Notifications\BookingDisputeByCustomer;
use App\Notifications\BookingDisputedByCustomer;
use App\Supports\StickyAlert;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * لیست نوبت‌های من
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Booking::where('user_id', $user->id)
            ->with([
                'barber:id,name,avatar,phone,slug',
                'service:id,name,image,duration,price',
                'timeSlot:id,date,start_time,end_time',
                'disputes' => function ($q) {
                    $q->latest();
                },
            ])->withCount('disputes');;

        // ============ فیلتر وضعیت ============
        if ($status = $request->input('status')) {
            if ($status === 'upcoming') {
                // نوبت‌های آینده
                $query->whereIn('status', ['pending', 'confirmed'])
                    ->whereHas('timeSlot', function ($q) {
                        $q->where('date', '>=', Carbon::today());
                    });
            } elseif ($status === 'past') {
                // نوبت‌های گذشته
                $query->where(function ($q) {
                    $q->whereIn('status', ['completed', 'cancelled'])
                        ->orWhereHas('timeSlot', function ($sq) {
                            $sq->where('date', '<', Carbon::today());
                        });
                });
            } else {
                $query->where('status', $status);
            }
        }

        // ============ جستجو ============
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('barber', function ($bq) use ($search) {
                    $bq->where('name', 'like', "%{$search}%");
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
            'total' => Booking::where('user_id', $user->id)->count(),
            'pending' => Booking::where('user_id', $user->id)
                ->where('status', 'pending')->count(),
            'confirmed' => Booking::where('user_id', $user->id)
                ->where('status', 'confirmed')->count(),
            'completed' => Booking::where('user_id', $user->id)
                ->where('status', 'completed')->count(),
            'cancelled' => Booking::where('user_id', $user->id)
                ->where('status', 'cancelled')->count(),
        ];

        // ============ تبدیل داده‌ها ============
        $bookings->through(function ($booking) {
            $timeSlot = $booking->timeSlot;
            $bookingDate = $timeSlot?->date;
            $isPast = $bookingDate && Carbon::parse($bookingDate)->isPast();

            // ============ بررسی وجود نظر ============
            $review = Review::where('user_id', $booking->user_id)
                ->where('booking_id', $booking->id)
                ->first();

            $hasReview = (bool) $review;



            // ============ بررسی امکان ثبت نظر ============
            $canReview = $booking->status->value === BookingStatus::completed->value
                && !$hasReview;

            // ============ بررسی امکان ویرایش/حذف نظر ============
            // فقط اگر نظر در وضعیت pending باشد
            $canEditReview = $hasReview && $review->status === 'pending';
            $canDeleteReview = $hasReview && $review->status === 'pending';

            // ============ بررسی امکان پرداخت مجدد ============
            $canPay = false;
            $expiresAt = null;
            $isExpired = false;

            if ($booking->status->value === BookingStatus::pending->value) {
                $expiresAt = $booking->created_at->copy()->addMinutes(15);
                $isExpired = now()->greaterThan($expiresAt);
                $canPay = !$isExpired;
            }

            // ============ بررسی امکان لغو ============
            $canCancel = false;
            if (in_array($booking->status->value, [
                BookingStatus::pending->value,
                BookingStatus::confirmed->value,
            ])) {
                if ($timeSlot) {
                    $slotDateTime = Carbon::parse(
                        Carbon::parse($timeSlot->date)->format('Y-m-d') . ' ' . $timeSlot->start_time
                    );
                    $canCancel = $slotDateTime->isFuture()
                        && $slotDateTime->diffInHours(Carbon::now()) >= 2;
                }
            }

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
                'expires_at' => $expiresAt?->timestamp * 1000, // ← میلی‌ثانیه
                'is_past' => $isPast,
                'is_expired' => $isExpired,

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
                    'disputed_by_user_id' => $latestDispute->disputed_by_user_id,
                ] : null,


                // ============ دسترسی‌ها ============
                'has_review' => $hasReview,
                'can_review' => $canReview,
                'can_edit_review' => $canEditReview,
                'can_delete_review' => $canDeleteReview,
                'can_cancel' => $canCancel,
                'can_pay' => $canPay,

                // ============ اطلاعات نظر ============
                'review' => $review ? [
                    'id' => $review->id,
                    'rating' => (int) $review->rating,
                    'comment' => $review->comment,
                    'status' => $review->status,
                    'created_at' => $review->created_at,
                    'updated_at' => $review->updated_at,
                    'is_edited' => $review->updated_at->gt($review->created_at),
                ] : null,

                // ============ اطلاعات آرایشگر ============
                'barber' => $booking->barber ? [
                    'id' => $booking->barber->id,
                    'name' => $booking->barber->name,
                    'avatar' => $booking->barber->avatar,
                    'thumbnail' => $booking->barber->avatar(),
                    'phone' => $booking->barber->phone,
                    'slug' => $booking->barber->slug,
                ] : null,

                // ============ اطلاعات خدمت ============
                'service' => $booking->service ? [
                    'id' => $booking->service->id,
                    'name' => $booking->service->name,
                    'image' => $booking->service->image
                        ? asset('storage/' . $booking->service->image)
                        : null,
                    'duration' => $booking->service->duration,
                    'price' => (float) $booking->service->price,
                ] : null,

                // ============ اطلاعات زمان ============
                'date' => $bookingDate,
                'start_time' => $timeSlot?->start_time,
                'end_time' => $timeSlot?->end_time,
            ];
        });

        return Inertia::render('Customer/Bookings/Index', [
            'bookings' => $bookings,
            'stats' => $stats,
            'filters' => [
                'status' => $request->input('status', ''),
                'search' => $search ?? '',
                'sort' => $sort,
            ],
        ]);
    }

    /**
     * لغو رزرو
     */
    public function cancel(Booking $booking)
    {
        // ============ بررسی مالکیت ============
        if ($booking->user_id !== auth()->id()) {
            abort(403, 'این رزرو متعلق به شما نیست.');
        }

        // ============ بررسی وضعیت ============
        if (!in_array($booking->status->value, [
            BookingStatus::pending->value,
            BookingStatus::confirmed->value,
        ])) {
            StickyAlert::alert('این رزرو قابل لغو نیست.', 'error');
            return redirect()
                ->back();
        }

        // ============ بررسی وجود TimeSlot ============
        if (!$booking->timeSlot) {

            StickyAlert::alert('اطلاعات زمان این رزرو یافت نشد.', 'error');

            return redirect()
                ->back();
        }

        // ============ بررسی زمان لغو ============
        $timeSlotDate = Carbon::parse($booking->timeSlot->date)->format('Y-m-d');
        $slotDateTime = Carbon::parse(
            $timeSlotDate . ' ' . $booking->timeSlot->start_time
        );

        // اگر نوبت گذشته باشد
        if ($slotDateTime->isPast()) {
            StickyAlert::alert('زمان این نوبت گذشته است و قابل لغو نیست.', 'error');

            return redirect()
                ->back();
        }

        // اگر کمتر از ۲ ساعت به نوبت باقی است
        $hoursUntilSlot = Carbon::now()->diffInHours($slotDateTime, false);
        if ($hoursUntilSlot < 2) {
            StickyAlert::alert('لغو رزرو حداقل ۲ ساعت قبل از زمان نوبت امکان‌پذیر است.', 'error');

            return redirect()
                ->back();
        }

        // ============ لغو رزرو ============
        DB::beginTransaction();

        try {
            // ۱. بروزرسانی رزرو
            $booking->update([
                'status' => BookingStatus::cancelled->value,
                'cancelled_at' => now(),
                'notes' => ($booking->notes ? $booking->notes . "\n" : '') .
                    'لغو شده توسط مشتری در ' . verta()->format('Y/m/d H:i'),
            ]);

            // ۲. آزاد کردن بازه زمانی
            $booking->timeSlot->update([
                'status' => TimeSlotStatus::available->value,
                'booked_by' => null,
            ]);
            // ۳. اگر پرداخت موفق داشته، برگشت مبلغ
            if ($booking->payment && $booking->payment->status->value === PaymentStatus::success->value) {
                $this->refundPayment($booking->payment);
            }

            DB::commit();

            StickyAlert::alert('نوبت شما با موفقیت لغو شد.', 'success');
            return redirect()
                ->back();
        } catch (\Exception $e) {

            DB::rollBack();

            StickyAlert::alert('خطا در لغو رزرو. لطفاً دوباره تلاش کنید.', 'error');
            return redirect()
                ->back();
        }
    }


    /**
     * نمایش جزئیات یک رزرو
     */
    public function show(Booking $booking)
    {

        // ============================================
        // ۱. بررسی مالکیت
        // ============================================
        if ($booking->user_id !== auth()->id()) {
            abort(403, 'این رزرو متعلق به شما نیست.');
        }

        // ============================================
        // ۲. بارگذاری روابط
        // ============================================
        $booking->load([
            'barber' => function ($q) {
                $q->select('id', 'name', 'avatar', 'phone', 'slug', 'specialty', 'city', 'address');
            },
            'service' => function ($q) {
                $q->select('id', 'name', 'description', 'image', 'duration', 'price');
            },
            'timeSlot' => function ($q) {
                $q->select('id', 'date', 'start_time', 'end_time');
            },
            'payment',
            'review',
            // ============ بارگذاری اعتراضات ============
            'disputes' => function ($q) {
                $q->with('disputedByUser:id,name,avatar')
                    ->latest();
            },
        ]);

        // ============================================
        // ۳. بررسی نظر
        // ============================================
        $review = $booking->review;

        // ============================================
        // ۴. بررسی TimeSlot
        // ============================================
        $timeSlot = $booking->timeSlot;
        $bookingDate = $timeSlot?->date;
        $slotDateTime = $timeSlot
            ? Carbon::parse(
                Carbon::parse($timeSlot->date)->format('Y-m-d') . ' ' . $timeSlot->start_time
            )
            : null;

        $isPast = $slotDateTime && $slotDateTime->isPast();

        // ============================================
        // ۵. محاسبه دسترسی‌ها
        // ============================================
        $canCancel = false;
        $canPay = false;
        $canReview = false;
        $canDispute = false;
        $canEditReview = false;
        $canDeleteReview = false;
        $expiresAt = null;
        $isExpired = false;
        $disputeDaysRemaining = null;



        // ============ وضعیت Pending ============
        if ($booking->status->value === BookingStatus::pending->value) {
            $expiresAt = $booking->created_at->copy()->addMinutes(15);
            $isExpired = now()->greaterThan($expiresAt);

            if (!$isExpired) {
                $canPay = true;
                $canCancel = true;
            } else {
                // لغو خودکار
                $booking->update([
                    'status' => BookingStatus::cancelled->value,
                    'cancelled_at' => now(),
                    'cancelled_by' => BookingCompletedBy::system->value,
                    'notes' => ($booking->notes ? $booking->notes . "\n" : '') .
                        'لغو خودکار به دلیل عدم پرداخت در ۱۵ دقیقه',
                ]);

                if ($timeSlot) {
                    $timeSlot->update([
                        'status' => TimeSlotStatus::available->value,
                        'booked_by' => null,
                    ]);
                }

                $booking->refresh();
                $booking->load(['timeSlot', 'payment']);
            }
        }

        // ============ وضعیت Confirmed ============
        if ($booking->status->value === BookingStatus::confirmed->value) {
            if ($slotDateTime) {
                $canCancel = $slotDateTime->isFuture()
                    && $slotDateTime->diffInHours(now()) >= 2;
            }
        }

        $reviewHasDispute = false;
        if ($review && $booking->has_disputes) {
            // اگر نظر بعد از اعتراض ثبت شده باشد
            if ($review->created_at->gt($booking->latest_dispute->created_at)) {
                $reviewHasDispute = true;
            }
        }

        // ============ وضعیت Completed ============
        if ($booking->status->value === BookingStatus::completed->value) {
            // ============ امکان ثبت نظر ============
            if (!$review) {
                $canReview = true;
            }

            // ============ امکان ویرایش/حذف نظر ============
            if ($review && $review->status->value === ReviewStatus::pending->value) {
                $canEditReview = true;
                $canDeleteReview = true;
            }

            // ============ امکان اعتراض ============
            if (
                $booking->completed_by?->value !== BookingCompletedBy::customer->value
                && $booking->completed_at
            ) {

                $daysSinceCompletion = $booking->completed_at->diffInDays(now());
                $daysRemaining = 7 - $daysSinceCompletion;

                // ============ بررسی اعتراض فعال مشتری ============
                $activeCustomerDispute = $booking->disputes()
                    ->where('disputed_by_user_id', auth()->id())
                    ->whereIn('status', [DisputedStatus::pending->value, DisputedStatus::investigating->value, DisputedStatus::awaitingResponse->value])
                    ->exists();

                if (!$activeCustomerDispute && $daysRemaining > 0) {
                    $canDispute = true;
                    $disputeDaysRemaining = $daysRemaining;
                }
            }
        }

        // ============================================
        // ۶. آماده‌سازی اطلاعات اعتراضات
        // ============================================
        $disputes = $booking->disputes->map(function ($dispute) {
            // ============ بررسی امکان ویرایش ============
            $canEditDispute = false;
            $canDeleteDispute = false;
            $canRespondDispute = false;
            $editHoursRemaining = null;
            if ($dispute->disputed_by_user_id === auth()->id()) {
                // ویرایش/حذف فقط در وضعیت pending و تا ۲ ساعت
                if ($dispute->status->value === DisputedStatus::pending->value) {
                    $hoursSinceCreation = $dispute->created_at->diffInHours(now());
                    $hoursRemaining = 2 - $hoursSinceCreation;

                    if ($hoursRemaining > 0) {
                        $canEditDispute = true;
                        $canDeleteDispute = true;
                        $editHoursRemaining = $hoursRemaining;
                    }
                }

                // پاسخ فقط در وضعیت awaiting_response
                if ($dispute->status->value === DisputedStatus::awaitingResponse->value) {
                    $canRespondDispute = true;
                }
            }
            return [
                'id' => $dispute->id,
                'disputed_by' => $dispute->disputed_by,
                'dispute_type' => $dispute->dispute_type,
                'disputed_by_user_id' => $dispute->disputed_by_user_id,
                'reason' => $dispute->reason,
                'status' => $dispute->status->value,
                'response' => $dispute->response,
                'responded_at' => $dispute->responded_at,
                'resolution' => $dispute->resolution,
                'resolved_at' => $dispute->resolved_at,
                'refund_amount' => (float) $dispute->refund_amount,
                'penalty_amount' => (float) $dispute->penalty_amount,
                'edited_at' => $dispute->edited_at,
                'edit_count' => $dispute->edit_count,
                'attachments' => collect($dispute->attachments ?? [])->map(
                    fn($path) => [
                        'path' => $path,
                        'url' => asset('storage/' . $path),
                        'name' => basename($path),
                    ]
                )->toArray(),
                'created_at' => $dispute->created_at,
                'updated_at' => $dispute->updated_at,

                // ============ دسترسی‌ها ============
                'can_edit' => $canEditDispute,
                'can_delete' => $canDeleteDispute,
                'can_respond' => $canRespondDispute,
                'edit_hours_remaining' => $editHoursRemaining,
            ];
        })->toArray();

        // ============ آخرین اعتراض (برای نمایش) ============
        $latestDispute = !empty($disputes) ? $disputes[0] : null;

        // ============================================
        // ۷. ارسال به React
        // ============================================
        return Inertia::render('Customer/Bookings/Show', [
            'booking' => [
                // ============ اطلاعات پایه ============
                'id' => $booking->id,
                'status' => $booking->status->value,
                'amount' => (float) $booking->amount,
                'notes' => $booking->notes,
                'created_at' => $booking->created_at,
                'confirmed_at' => $booking->confirmed_at,
                'cancelled_at' => $booking->cancelled_at,
                'cancelled_by' => $booking->cancelled_by?->value,
                'completed_at' => $booking->completed_at,
                'completed_by' => $booking->completed_by?->value,
                'auto_completed' => (bool) $booking->auto_completed,
                'expires_at' => $expiresAt?->timestamp * 1000,
                'is_past' => $isPast,
                'is_expired' => $isExpired,

                // ============ دسترسی‌ها ============
                'can_pay' => $canPay,
                'can_cancel' => $canCancel,
                'can_review' => $canReview,
                'can_edit_review' => $canEditReview,
                'can_delete_review' => $canDeleteReview,
                'can_dispute' => $canDispute,
                'dispute_days_remaining' => $disputeDaysRemaining,

                // ============================================
                // اطلاعات اعتراض (بخش جدید)
                // ============================================
                'has_disputes' => count($disputes) > 0,
                'disputes_count' => count($disputes),
                'disputes' => $disputes, // ← آرایه‌ای از تمام اعتراضات
                'latest_dispute' => $latestDispute, // ← آخرین اعتراض

                // ============ اطلاعات آرایشگر ============
                'barber' => $booking->barber ? [
                    'id' => $booking->barber->id,
                    'name' => $booking->barber->name,
                    'avatar' => $booking->barber->avatar,
                    'thumbnail' => $booking->barber->avatar(),
                    'phone' => $booking->barber->phone,
                    'slug' => $booking->barber->slug,
                    'specialty' => $booking->barber->specialty,
                    'city' => $booking->barber->city,
                    'address' => $booking->barber->address,
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
                'date' => $bookingDate,
                'start_time' => $timeSlot?->start_time,
                'end_time' => $timeSlot?->end_time,

                // ============ اطلاعات پرداخت ============
                'payment' => $booking->payment ? [
                    'gateway' => $booking->payment->gateway,
                    'gateway_label' => $this->getGatewayLabel($booking->payment->gateway),
                    'transaction_id' => $booking->payment->transaction_id,
                    'paid_at' => $booking->payment->paid_at,
                    'status' => $booking->payment->status,
                    'amount' => (float) $booking->payment->amount,
                ] : null,

                // ============ اطلاعات نظر ============
                'review' => $review ? [
                    'id' => $review->id,
                    'rating' => (int) $review->rating,
                    'comment' => $review->comment,
                    'status' => $review->status->value,
                    'created_at' => $review->created_at,
                    'updated_at' => $review->updated_at,
                    'is_edited' => $review->updated_at->gt($review->created_at),
                    'has_dispute' => $reviewHasDispute,
                    'dispute_id' => $reviewHasDispute ? $booking->latest_dispute->id : null,
                ] : null,
            ],
        ]);
    }


    /**
     * لغو رزرو توسط مشتری
     */

    /**
     * برگشت مبلغ پرداخت شده
     */
    private function refundPayment(Payment $payment): void
    {
        try {
            $accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNmMwNWFjYmQ1N2I4NzA1OGJjYTI1MzVkNTRhNzE4YzJkYjUxMTY4Y2I0MjNiN2Y3ZDk3YThlZmZmYzI5MDUwOTc3NDc4ZjgyNTg3MjAxNzYiLCJpYXQiOjE3MDg3NjAwOTIuNzMyODY3LCJuYmYiOjE3MDg3NjAwOTIuNzMyODcxLCJleHAiOjE4NjY2MTI4OTIuNjk3MjQzLCJzdWIiOiI0NTYwOTgiLCJzY29wZXMiOltdfQ.bEATYg8_-BWwa6MJIL1_qP-Crs8vcmay0oEFLgzEjyYlfm431XzhaU7Aa_0dnjT1Ahpv74NtWi-slMbI2X8lzrf4hm8TEwl95eG-Eb5mqmYNk61jYFbE3FG9tVPo6EVFfJYMXJFzL64Mh8jI4SeUnUieqECCc_riBs0KD_IjSmnc_JblmY_xBaeqTJ3M6zwpLkmNPsjADAiC1fxcO5tGscWKBcSNkbXq_44-7fZqlKSyy7zmXZTYPIJp0YUHpUX-P2ifY20KBhjNBB-dCnascw57ET1yc6YQw-ZWKHKqF6FfYHQSRfWASiQTe1SCRLiKwjKqmGXolQX2DfqeEP-T0qdrFaTO9hWVJuVugAdwgd0h9LOBbx1tFNclLl0tCYttBENjeGgDY03121JtQcXEk-gVc6qSIT9wewACdYup-uiYOYR7ZvibxdvbbZ3n4PGaxDapiqMTRIKmCMYhzNORo1PTfN1AwRbIP4LUIpLJzIqF9KeDlL1Pb_55ccXzvCK5Q_IIZvrU7x-8MPNjwWKfParbihpxMLufpsxc98WuO5ylMLKpnfoOYtQnh8nlz239ag0Ok6SQVk3zKwAv-Kt9nbNo2NzQue-jH6KPlc_xpfL-ii71XwjRZ3lN3YhAj4K-CeFK9MIBXiij0QtKO2rjHXC5B9mV8Ityc0wvebWslOo';
            $sessionId = intval($payment->transaction_id);
            // We save Tooman, they accept Rial
            $amount = intval($payment->amount) * 10;
            $description = 'Deregistration refund';
            $reason = 'CUSTOMER_REQUEST';
            //for refund just Paya method works
            $method = 'PAYA';

            $query = <<<'GRAPHQL'
                          mutation AddRefund(
                            $session_id: ID!
                            $amount: BigInteger!
                            $description: String
                            $method: InstantPayoutActionTypeEnum
                            $reason: RefundReasonEnum
                          ) {
                            resource: AddRefund(
                             session_id: $session_id
                              amount: $amount
                              description: $description
                              method : $method
                              reason: $reason
                            ) {
                              terminal_id
                              id
                              amount
                              timeline {
                                refund_amount
                                refund_time
                                refund_status
                              }
                            }
                          }
                        GRAPHQL;

            $variables = [
                'session_id' => $sessionId,
                'amount' => $amount,
                'description' => $description,
                'reason' => $reason,
                'method' => $method
            ];

            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . $accessToken,
            ])->post('https://next.zarinpal.com/api/v4/graphql/', [
                'query' => $query,
                'variables' => $variables
            ]);

            $payment->update([
                'status' => PaymentStatus::refunded->value,
            ]);
        } catch (\Exception $e) {
            Log::error('Refund failed: ' . $e->getMessage(), [
                'payment_id' => $payment->id,
            ]);
        }
    }

    /**
     * برگشت مبلغ در زرین‌پال
     */
    private function refundZarinpal(Payment $payment): void
    {
        $config = config('payment.gateways.zarinpal');

        $data = [
            'MerchantID' => $config['merchant_id'],
            'Amount' => $payment->amount * 10, // ریال
            'Authority' => $payment->authority,
        ];

        $ch = curl_init('https://api.zarinpal.com/pg/v4/payment/refund.json');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        $result = json_decode($response, true);

        if (isset($result['data']['code']) && $result['data']['code'] === 100) {
            $payment->update([
                'status' => 'refunded',
                'gateway_response' => $result,
            ]);
        } else {
            $payment->update([
                'status' => 'refund_pending',
                'gateway_response' => $result,
            ]);
        }
    }

    /**
     * تبدیل نام درگاه به برچسب فارسی
     */
    private function getGatewayLabel($gateway)
    {
        $labels = [
            'zarinpal' => 'زرین‌پال',
            'idpay' => 'آیدی‌پی',
            'payping' => 'پی‌پینگ',
            'nextpay' => 'نکست‌پی',
        ];
        return $labels[$gateway] ?? $gateway;
    }
    /**
     * مرحله ۱: ایجاد رزرو موقت (pending) و نمایش صفحه انتخاب درگاه
     */
    public function create(Request $request)
    {


        $validated = $request->validate([
            'time_slot_id' => 'required|exists:time_slots,id',
        ]);

        $user = auth()->user();
        $slot = TimeSlot::with(['service', 'user'])
            ->findOrFail($validated['time_slot_id']);

        // ============ بررسی اعتبار بازه ============
        if ($slot->status->value !== TimeSlotStatus::available->value) {
            StickyAlert::alert('این بازه قابل رزرو نیست.', 'error');
            return redirect()->back();
        }

        // ============ بررسی گذشته نبودن ============
        $slotDateDate = Carbon::parse($slot->date)->format('Y-m-d');
        $slotDateTime = Carbon::parse($slotDateDate . ' ' . $slot->start_time);

        if ($slotDateTime->lessThan(Carbon::now())) {

            StickyAlert::alert('این بازه گذشته است.', 'error');
            return redirect()->back();
        }

        // ============ بررسی مالکیت (نمی‌تواند نوبت خودش را رزرو کند) ============
        if ($slot->user_id === $user->id) {
            StickyAlert::alert('نمی‌توانید نوبت خودتان را رزرو کنید.', 'error');
            return redirect()->back();
        }

        // ============ ایجاد رزرو موقت ============
        $booking = Booking::create([
            'user_id' => $user->id,
            'barber_id' => $slot->user_id,
            'service_id' => $slot->service_id,
            'time_slot_id' => $slot->id,
            'status' => BookingStatus::pending->value,
            'amount' => $slot->service->price ?? 0,
        ]);

        // ============ رزرو موقت بازه ============
        // (وضعیت blocked تا کاربر دیگر نتواند رزرو کند)
        $slot->update(['status' => TimeSlotStatus::blocked->value]);

        // ============ لیست درگاه‌های فعال ============
        $gateways = collect(config('payment.gateways'))
            ->filter(fn($gw) => $gw['enabled'])
            ->map(fn($gw, $key) => [
                'id' => $key,
                'name' => $gw['name'],
                'logo' => $gw['logo'],
                'color' => $gw['color'],
            ])
            ->values()
            ->toArray();

        return Inertia::render('Customer/Payment/Select', [
            'booking' => [
                'id' => $booking->id,
                'barber' => [
                    'id' => $slot->user->id,
                    'name' => $slot->user->name,
                    'avatar' => $slot->user->avatar,
                ],
                'service' => [
                    'id' => $slot->service->id,
                    'name' => $slot->service->name,
                    'duration' => $slot->service->duration,
                ],
                'date' => $slot->date,
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'amount' => $booking->amount,
            ],
            'gateways' => $gateways,
        ]);
    }






    public function dispute(Request $request, Booking $booking)
    {

        // بررسی مالکیت
        if ($booking->user_id !== auth()->id()) {
            abort(403);
        }

        // بررسی وضعیت
        if ($booking->status->value !== BookingStatus::completed->value) {
            StickyAlert::alert('فقط رزروهای تکمیل شده قابل اعتراض هستند.', 'error');
            return redirect()->back();
        }

        // بررسی عدم تکمیل توسط خود مشتری
        if ($booking->completed_by->value === BookingCompletedBy::customer->value) {
            StickyAlert::alert('شما خودتان این رزرو را تکمیل کرده‌اید.', 'error');
            return redirect()->back();
        }

        // ============ بررسی اعتراض فعال ============
        $activeDispute = $booking->activeDispute()
            ->where('disputed_by_user_id', auth()->id())
            ->first();

        if ($activeDispute) {
            StickyAlert::alert('شما یک اعتراض فعال برای این رزرو دارید.', 'error');
            return redirect()->back();
        }

        // ============ بررسی مهلت ============
        if (!$booking->completed_at) {
            StickyAlert::alert('اطلاعات تکمیل یافت نشد.', 'error');
            return redirect()->back();
        }

        $daysSinceCompletion = $booking->completed_at->diffInDays(now());
        if ($daysSinceCompletion > 7) {
            StickyAlert::alert('مهلت اعتراض (۷ روز) گذشته است.', 'error');
            return redirect()->back();
        }

        // ============ اعتبارسنجی ============
        $validated = $request->validate([
            'reason' => 'required|string|min:10|max:1000',
            'dispute_type' => 'required|in:not_done,incomplete,poor_quality,bad_behavior,other',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'image|max:2048',
        ]);

        DB::beginTransaction();

        try {

            // ============ آپلود پیوست‌ها ============
            $attachmentPaths = [];
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $attachmentPaths[] = $file->store('disputes', 'public');
                }
            }

            // ============ ثبت اعتراض در جدول جدید ============
            $dispute = Dispute::create([
                'booking_id' => $booking->id,
                'disputed_by_user_id' => auth()->id(),
                'disputed_by' => DisputedBy::customer->value,
                'dispute_type' => $validated['dispute_type'],
                'reason' => $validated['reason'],
                // 'status' => 'pending',
                'attachments' => $attachmentPaths,
                'ip_address' => request()->ip(),
            ]);

            // ============ Notification ها ============
            // به ادمین
            try {
                User::role(['سوپر ادمین'])
                    ->get()
                    ->each(function ($admin) use ($dispute) {
                        $admin->notify(new BookingDisputeByCustomer($dispute->booking));
                    });
            } catch (\Exception $e) {
                Log::warning('Dispute notification failed', [
                    'dispute_id' => $dispute->id,
                    'error' => $e->getMessage(),
                ]);
            }


            // به آرایشگر
            try {
                $booking->barber?->notify(
                    new BookingDisputedByCustomer($dispute->booking)
                );
            } catch (\Exception $e) {
                Log::warning('Barber notification failed', [
                    'dispute_id' => $dispute->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // ============ لاگ ============
            (new \App\Models\Log())->storeLog(
                $booking->id,
                'customer_dispute_booking',
                "اعتراض مشتری به رزرو #{$booking->id} - نوع: {$validated['dispute_type']}"
            );

            DB::commit();

            StickyAlert::alert('اعتراض شما ثبت شد. ادمین تا ۴۸ ساعت آینده بررسی خواهد کرد.', 'success');
            return redirect()->back();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Dispute failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
            StickyAlert::alert('خطا در ثبت اعتراض.', 'success');
            return redirect()->back();
        }
    }

    public function complete(Booking $booking)
    {
        // بررسی مالکیت
        if ($booking->user_id !== auth()->id()) {
            abort(403);
        }

        // بررسی وضعیت
        if ($booking->status->value !== BookingStatus::confirmed->value) {
            StickyAlert::alert('این رزرو قابل تکمیل نیست.', 'error');
            return redirect()->back();
        }

        // ============ بررسی زمان ============
        $timeSlot = $booking->timeSlot;
        if (!$timeSlot) {
            StickyAlert::alert('اطلاعات زمان یافت نشد.', 'error');
            return redirect()->back();
        }

        $slotDateTime = Carbon::parse(
            Carbon::parse($timeSlot->date)->format('Y-m-d') . ' ' . $timeSlot->start_time
        );

        // زمان نوبت باید گذشته باشد
        if (!$slotDateTime->isPast()) {
            StickyAlert::alert('زمان نوبت هنوز نرسیده است.', 'error');
            return redirect()->back();
        }

        // حداقل ۲ ساعت از زمان نوبت گذشته باشد
        $hoursSinceSlot = $slotDateTime->diffInHours(Carbon::now());
        if ($hoursSinceSlot < 2) {
            StickyAlert::alert('حداقل ۲ ساعت بعد از زمان نوبت می‌توانید تکمیل را اعلام کنید.', 'error');
            return redirect()->back();
        }

        DB::beginTransaction();

        try {


            // تکمیل توسط مشتری
            $booking->update([
                'status' => BookingStatus::completed->value,
                'completed_at' => now(),
                'completed_by' => BookingCompletedBy::customer->value,
            ]);

            // ============ اطلاع‌رسانی به آرایشگر ============
            $booking->barber->notify(
                new BookingCompletedByCustomer($booking)
            );

            // ============ اطلاع‌رسانی به ادمین ============
            \App\Models\User::role(['سوپر ادمین'])->get()
                ->each(function ($admin) use ($booking) {
                    $admin->notify(
                        new BookingCompletedByCustomerForAdmin($booking)
                    );
                });

            // ============ لاگ ============

            (new \App\Models\Log())->storeLog($booking->id,  'customer_complete_booking', "تکمیل رزرو #{$booking->id} توسط مشتری",);


            DB::commit();
            StickyAlert::alert('تکمیل خدمت تایید شد. حالا می‌توانید نظر بدهید.', 'error');
            return redirect()->back();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Customer complete failed: ' . $e->getMessage());
            StickyAlert::alert('خطا در تایید تکمیل.', 'error');
            return redirect()->back();
        }
    }
}
