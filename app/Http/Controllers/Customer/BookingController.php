<?php

namespace App\Http\Controllers\Customer;

use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\TimeSlotStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\TimeSlot;
use App\Supports\StickyAlert;
use Carbon\Carbon;
use Illuminate\Http\Request;
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
            ]);

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
            $query->whereHas('barber', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('service', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
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

            // بررسی اینکه کاربر قبلاً نظر داده یا نه
            $hasReview = Review::where('user_id', $booking->user_id)
                ->where('booking_id', $booking->id)
                ->exists();

            return [
                'id' => $booking->id,
                'status' => $booking->status,
                'amount' => (float) $booking->amount,
                'notes' => $booking->notes,
                'created_at' => $booking->created_at,
                'confirmed_at' => $booking->confirmed_at,
                'cancelled_at' => $booking->cancelled_at,
                'is_past' => $isPast,
                'has_review' => $hasReview,
                'can_review' => $booking->status === 'completed' && !$hasReview,
                'can_cancel' => in_array($booking->status, [BookingStatus::pending->value, BookingStatus::confirmed->value])
                    && $bookingDate
                    && Carbon::parse($bookingDate)->isFuture(),
                'barber' => $booking->barber ? [
                    'id' => $booking->barber->id,
                    'name' => $booking->barber->name,
                    'avatar' => $booking->barber->avatar,
                    'thumbnail' => $booking->barber->avatar(),
                    'phone' => $booking->barber->phone,
                    'slug' => $booking->barber->slug,
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
        // بررسی مالکیت
        if ($booking->user_id !== auth()->id()) {
            abort(403);
        }

        // بررسی وضعیت
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return redirect()->back()
                ->with('error', 'این رزرو قابل لغو نیست.');
        }

        // بررسی زمان (حداقل ۲ ساعت قبل)
        $timeSlot = $booking->timeSlot;
        $slotDateTime = Carbon::parse(
            $timeSlot->date . ' ' . $timeSlot->start_time
        );

        if ($slotDateTime->diffInHours(Carbon::now(), false) > -2) {
            return redirect()->back()
                ->with('error', 'لغو رزرو حداقل ۲ ساعت قبل از نوبت امکان‌پذیر است.');
        }

        // لغو رزرو
        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        // آزاد کردن بازه
        $timeSlot->update([
            'status' => 'available',
            'booked_by' => null,
        ]);

        // برگشت مبلغ (اینجا باید به درگاه برگردانید)
        // ...

        return redirect()->back()
            ->with('success', 'نوبت شما با موفقیت لغو شد.');
    }

    /**
     * نمایش جزئیات یک رزرو
     */
    public function show(Booking $booking)
    {
        // بررسی مالکیت
        if ($booking->user_id !== auth()->id()) {
            abort(403);
        }

        // بارگذاری روابط
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
        ]);

        // بررسی نظر
        $review = Review::where('user_id', $booking->user_id)
            ->where('booking_id', $booking->id)
            ->first();

        // بررسی امکان لغو (حداقل ۲ ساعت قبل)
        $canCancel = false;
        if (in_array($booking->status, ['pending', 'confirmed']) && $booking->timeSlot) {
            $slotDateTime = Carbon::parse(
                $booking->timeSlot->date . ' ' . $booking->timeSlot->start_time
            );
            $canCancel = $slotDateTime->isFuture() &&
                $slotDateTime->diffInHours(Carbon::now()) >= 2;
        }

        // بررسی گذشته بودن
        $isPast = $booking->timeSlot &&
            Carbon::parse($booking->timeSlot->date)->isPast();

        return Inertia::render('Customer/Bookings/Show', [
            'booking' => [
                'id' => $booking->id,
                'status' => $booking->status,
                'amount' => (float) $booking->amount,
                'notes' => $booking->notes,
                'created_at' => $booking->created_at,
                'confirmed_at' => $booking->confirmed_at,
                'cancelled_at' => $booking->cancelled_at,
                'is_past' => $isPast,
                'can_cancel' => $canCancel,
                'can_review' => $booking->status === 'completed' && !$review,

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
                    'gateway_label' => $this->getGatewayLabel($booking->payment->gateway),
                    'transaction_id' => $booking->payment->transaction_id,
                    'paid_at' => $booking->payment->paid_at,
                    'status' => $booking->payment->status,
                    'amount' => (float) $booking->payment->amount,
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
}
