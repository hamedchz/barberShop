<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\BookingCompletedBy;
use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\TimeSlotStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use App\Supports\StickyAlert;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BarberBookingController extends Controller
{
    /**
     * لیست رزروهای یک آرایشگر
     */
    public function index(Request $request, User $barber)
    {
        // بررسی آرایشگر بودن
        if (!$barber->hasRole('آرایشگر')) {
            abort(404);
        }

        $query = Booking::where('barber_id', $barber->id)
            ->with([
                'user:id,name,avatar,phone',
                'service:id,name,image,duration,price',
                'timeSlot:id,date,start_time,end_time',
                'payment:id,booking_id,status,amount,gateway',
            ]);

        // ============ فیلتر وضعیت ============
        if ($status = $request->input('status')) {
            if ($status === 'today') {
                $query->whereHas('timeSlot', function ($q) {
                    $q->where('date', Carbon::today());
                });
            } elseif ($status === 'upcoming') {
                $query->whereIn('status', [
                    BookingStatus::pending->value,
                    BookingStatus::confirmed->value,
                ])
                    ->whereHas('timeSlot', function ($q) {
                        $q->where('date', '>=', Carbon::today());
                    });
            } elseif ($status === 'past') {
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
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
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
            case 'amount_high':
                $query->orderByDesc('amount');
                break;
            case 'amount_low':
                $query->orderBy('amount');
                break;
            default:
                $query->latest();
        }

        $bookings = $query->paginate(15)->withQueryString();

        // ============ آمار آرایشگر ============
        $stats = [
            'total' => Booking::where('barber_id', $barber->id)->count(),
            'today' => Booking::where('barber_id', $barber->id)
                ->whereHas('timeSlot', fn($q) => $q->where('date', Carbon::today()))
                ->count(),
            'pending' => Booking::where('barber_id', $barber->id)
                ->where('status', BookingStatus::pending->value)->count(),
            'confirmed' => Booking::where('barber_id', $barber->id)
                ->where('status', BookingStatus::confirmed->value)->count(),
            'completed' => Booking::where('barber_id', $barber->id)
                ->where('status', BookingStatus::completed->value)->count(),
            'cancelled' => Booking::where('barber_id', $barber->id)
                ->where('status', BookingStatus::cancelled->value)->count(),
            'total_revenue' => Booking::where('barber_id', $barber->id)
                ->where('status', BookingStatus::completed->value)
                ->sum('amount'),
            'month_revenue' => Booking::where('barber_id', $barber->id)
                ->where('status', BookingStatus::completed->value)
                ->whereHas('timeSlot', function ($q) {
                    $q->whereMonth('date', Carbon::now()->month)
                        ->whereYear('date', Carbon::now()->year);
                })
                ->sum('amount'),
            'today_revenue' => Booking::where('barber_id', $barber->id)
                ->where('status', BookingStatus::completed->value)
                ->whereHas('timeSlot', fn($q) => $q->where('date', Carbon::today()))
                ->sum('amount'),
        ];

        // ============ تبدیل داده‌ها ============
        $bookings->through(function ($booking) {
            $slotDateTime = $booking->timeSlot
                ? Carbon::parse(Carbon::parse($booking->timeSlot->date)->format('Y-m-d') . ' ' . $booking->timeSlot->start_time)
                : null;

            return [
                'id' => $booking->id,
                'status' => $booking->status->value,
                'amount' => (float) $booking->amount,
                'notes' => $booking->notes,
                'created_at' => $booking->created_at,
                'confirmed_at' => $booking->confirmed_at,
                'cancelled_at' => $booking->cancelled_at,
                'cancelled_by' => $booking->cancelled_by,
                'cancellation_reason' => $booking->cancellation_reason,

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
                    'image' => $booking->service->image
                        ? asset('storage/' . $booking->service->image)
                        : null,
                    'duration' => $booking->service->duration,
                    'price' => (float) $booking->service->price,
                ] : null,

                // ============ اطلاعات زمان ============
                'date' => $booking->timeSlot?->date,
                'start_time' => $booking->timeSlot?->start_time,
                'end_time' => $booking->timeSlot?->end_time,

                // ============ اطلاعات پرداخت ============
                'payment_status' => $booking->payment?->status,
                'payment_gateway' => $booking->payment?->gateway,
            ];
        });

        // ============ اطلاعات آرایشگر ============
        $barberInfo = [
            'id' => $barber->id,
            'name' => $barber->name,
            'avatar' => $barber->avatar,
            'thumbnail' => $barber->avatar(),
            'phone' => $barber->phone,
            'email' => $barber->email,
            'specialty' => $barber->specialty,
            'city' => $barber->city,
            'status' => $barber->status?->value,
            'is_online' => $barber->isOnline(),
            'rating' => (float) $barber->average_rating,
            'total_reviews' => (int) $barber->total_reviews,
            'services_count' => $barber->services()->where('is_active', true)->count(),
        ];

        return Inertia::render('Admin/Barbers/Bookings', [
            'barber' => $barberInfo,
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
     * نمایش جزئیات رزرو (ادمین)
     */
    public function show(User $barber, Booking $booking)
    {


        // بررسی ارتباط رزرو با آرایشگر
        if ($booking->barber_id !== $barber->id) {
            abort(404);
        }

        $booking->load([
            'user:id,name,avatar,phone,slug',
            'service:id,name,description,image,duration,price',
            'timeSlot:id,date,start_time,end_time',
            'payment',
            'review',
        ]);



        return Inertia::render('Admin/Barbers/BookingShow', [
            'barber' => [
                'id' => $barber->id,
                'name' => $barber->name,
                'slug' => $barber->slug,
                'avatar' => $barber->avatar,
                'thumbnail' => $barber->avatar(),
            ],
            'booking' => [
                'id' => $booking->id,
                'status' => $booking->status->value,
                'amount' => (float) $booking->amount,
                'notes' => $booking->notes,
                'created_at' => $booking->created_at,
                'confirmed_at' => $booking->confirmed_at,
                'cancelled_at' => $booking->cancelled_at,
                'cancelled_by' => $booking->cancelled_by,
                'cancellation_reason' => $booking->cancellation_reason,

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

                'date' => Carbon::parse($booking->timeSlot?->date)->format('Y-m-d'),
                'start_time' => $booking->timeSlot?->start_time,
                'end_time' => $booking->timeSlot?->end_time,

                'payment' => $booking->payment ? [
                    'gateway' => $booking->payment->gateway,
                    'status' => $booking->payment->status,
                    'amount' => (float) $booking->payment->amount,
                    'transaction_id' => $booking->payment->transaction_id,
                    'paid_at' => $booking->payment->paid_at,
                ] : null,

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

    public function complete(Request $request, User $barber, Booking $booking)
    {
        // بررسی ارتباط
        if ($booking->barber_id !== $barber->id) {
            abort(404);
        }

        // بررسی وضعیت
        if ($booking->status->value !== BookingStatus::confirmed->value) {
            return back()->with('error', 'این رزرو قابل تکمیل نیست.');
        }

        // ============ بررسی گذشته بودن ============
        $timeSlot = $booking->timeSlot;
        if (!$timeSlot) {
            StickyAlert::alert('اطلاعات زمان یافت نشد', 'error');
            return redirect()->back();
        }

        $slotDateTime = Carbon::parse(
            Carbon::parse($timeSlot->date)->format('Y-m-d') . ' ' . $timeSlot->start_time
        );

        if (!$slotDateTime->isPast()) {
            StickyAlert::alert('زمان این نوبت هنوز نرسیده است', 'error');
            return redirect()->back();
        }

        // ============ اعتبارسنجی دلیل ============
        $validated = $request->validate([
            'reason' => 'required|string|min:10|max:500',
        ], [
            'reason.required' => 'وارد کردن دلیل الزامی است.',
            'reason.min' => 'دلیل باید حداقل ۱۰ کاراکتر باشد.',
            'reason.max' => 'دلیل نباید بیشتر از ۵۰۰ کاراکتر باشد.',
        ]);

        // ============ بررسی گذشت ۲۴ ساعت ============
        $hoursSinceSlot = $slotDateTime->diffInHours(Carbon::now());
        if ($hoursSinceSlot < 24) {
            StickyAlert::alert('ادمین فقط میتواند بعد از ۲۴ ساعت سرویس را تکمیل کند ', 'warning');
            return redirect()->back();
        }

        DB::beginTransaction();

        try {
            // تکمیل رزرو
            $booking->update([
                'status' => BookingStatus::completed->value,
                'completed_at' => now(),
                'completed_by' => BookingCompletedBy::admin->value,
                'admin_completion_reason' => $validated['reason'],
            ]);

            // ============ ثبت لاگ امنیتی ============

            (new \App\Models\Log())->storeLog($booking->id,  'admin_complete_booking', "تکمیل رزرو #{$booking->id} توسط ادمین - دلیل: {$validated['reason']}",);


            DB::commit();
            StickyAlert::alert('رزرو با موفقیت تکمیل شد. لاگ این عملیات ثبت شد', 'success');
            return redirect()->back();
        } catch (\Exception $e) {
            DB::rollBack();
            // \Log::error('Admin complete booking failed: ' . $e->getMessage());
            StickyAlert::alert('خطا در تکمیل رزرو', 'success');
            return redirect()->back();
        }
    }

    public function cancel(User $barber, Booking $booking)
    {

        if ($booking->barber_id !== $barber->id) {
            abort(404);
        }

        if (!in_array($booking->status->value, [
            BookingStatus::pending->value,
            BookingStatus::confirmed->value,
        ])) {
            StickyAlert::alert('این رزرو قابل لغو نیست', 'error');
            return redirect()->back();
        }

        DB::beginTransaction();

        try {
            // لغو رزرو
            $booking->update([
                'status' => BookingStatus::cancelled->value,
                'cancelled_at' => now(),
                'cancelled_by' => BookingCompletedBy::admin->value,
                'notes' => ($booking->notes ? $booking->notes . "\n" : '') .
                    'لغو شده توسط ادمین در ' . now()->format('Y/m/d H:i'),
            ]);

            // آزاد کردن بازه
            if ($booking->timeSlot) {
                $booking->timeSlot->update([
                    'status' => TimeSlotStatus::available->value,
                    'booked_by' => null,
                ]);
            }

            // بازگشت مبلغ
            // if ($booking->payment && $booking->payment->status === 'success') {
            //     // TODO: refund
            //     $booking->payment->update(['status' => 'refund_pending']);
            // }

            DB::commit();

            StickyAlert::alert('رزرو با موفقیت لغو شد.', 'success');

            return redirect()->back();
        } catch (\Exception $e) {
            DB::rollBack();
            StickyAlert::alert('خطا در لغو رزرو.', 'error');

            return redirect()->back();
        }
    }
}
