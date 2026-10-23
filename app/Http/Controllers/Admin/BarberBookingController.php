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
                'latestDispute.disputedByUser:id,name,avatar,phone,slug',
            ])
            ->withCount('disputes')
            ->withCount(['disputes as active_disputes_count' => function ($q) {
                $q->whereIn('status', [
                    \App\Enums\Casts\DisputedStatus::pending->value,
                    \App\Enums\Casts\DisputedStatus::investigating->value,
                    \App\Enums\Casts\DisputedStatus::awaitingResponse->value,
                ]);
            }]);

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
                    'thumbnail' => $booking->user->avatarUrl(),
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
                // ============ ✅ اطلاعات اعتراض ============
                'has_disputes' => $booking->disputes_count > 0,
                'disputes_count' => (int) $booking->disputes_count,
                'has_active_dispute' => $booking->active_disputes_count > 0,
                'active_disputes_count' => (int) $booking->active_disputes_count,

                'latest_dispute' => $booking->latestDispute ? [
                    'id' => $booking->latestDispute->id,
                    'status' => $booking->latestDispute->status->value,
                    'dispute_type' => $booking->latestDispute->dispute_type->value,
                    'disputed_by' => $booking->latestDispute->disputed_by->value,
                    'reason' => $booking->latestDispute->reason,
                    'created_at' => $booking->latestDispute->created_at,
                    'resolved_at' => $booking->latestDispute->resolved_at,
                    'disputed_by_user' => $booking->latestDispute->disputedByUser ? [
                        'id' => $booking->latestDispute->disputedByUser->id,
                        'name' => $booking->latestDispute->disputedByUser->name,
                        'thumbnail' => $booking->latestDispute->disputedByUser->avatarUrl(),
                        'phone' => $booking->latestDispute->disputedByUser->phone,
                    ] : null,
                ] : null,
            ];
        });

        // ============ اطلاعات آرایشگر ============
        $barberInfo = [
            'id' => $barber->id,
            'name' => $barber->name,
            'avatar' => $barber->avatar,
            'thumbnail' => $barber->avatarUrl(),
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
            'scopes' => ['bookings']
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
            'user:id,name,avatar,phone,slug,email',
            'service:id,name,description,image,duration,price',
            'timeSlot:id,date,start_time,end_time',
            'payment',
            // ============ review با soft delete ============
            'review' => fn($q) => $q->withTrashed()->with([
                'user:id,name,avatar,phone,slug',
                'moderatedBy:id,name',
            ]),
        ]);

        return Inertia::render('Admin/Barbers/BookingShow', [
            'barber' => [
                'id'        => $barber->id,
                'name'      => $barber->name,
                'slug'      => $barber->slug,
                'avatar'    => $barber->avatar,
                'thumbnail' => $barber->avatarUrl(),
            ],
            'booking' => [
                'id'                  => $booking->id,
                'status'              => $booking->status->value,
                'amount'              => (float) $booking->amount,
                'notes'               => $booking->notes,
                'created_at'          => $booking->created_at,
                'confirmed_at'        => $booking->confirmed_at,
                'cancelled_at'        => $booking->cancelled_at,
                'cancelled_by'        => $booking->cancelled_by,
                'cancellation_reason' => $booking->cancellation_reason,

                'customer' => $booking->user ? [
                    'id'        => $booking->user->id,
                    'name'      => $booking->user->name,
                    'avatar'    => $booking->user->avatar,
                    'thumbnail' => $booking->user->avatarUrl(),
                    'phone'     => $booking->user->phone,
                    'email'     => $booking->user->email,
                ] : null,

                'service' => $booking->service ? [
                    'id'          => $booking->service->id,
                    'name'        => $booking->service->name,
                    'description' => $booking->service->description,
                    'image'       => $booking->service->image
                        ? asset('storage/' . $booking->service->image)
                        : null,
                    'duration'    => $booking->service->duration,
                    'price'       => (float) $booking->service->price,
                ] : null,

                'date'       => $booking->timeSlot?->date
                    ? Carbon::parse($booking->timeSlot->date)->format('Y-m-d')
                    : null,
                'start_time' => $booking->timeSlot?->start_time,
                'end_time'   => $booking->timeSlot?->end_time,

                'payment' => $booking->payment ? [
                    'gateway'        => $booking->payment->gateway,
                    'status'         => $booking->payment->status,
                    'amount'         => (float) $booking->payment->amount,
                    'transaction_id' => $booking->payment->transaction_id,
                    'paid_at'        => $booking->payment->paid_at,
                ] : null,

                // ============ review (شامل soft delete) ============
                'review' => $booking->review ? [
                    'id'            => $booking->review->id,
                    'rating'        => (int) $booking->review->rating,
                    'comment'       => $booking->review->comment,
                    'status'        => $booking->review->status?->value,
                    'status_label'  => $booking->review->status?->label(),
                    'status_color'  => $booking->review->status?->color(),
                    'status_icon'   => $booking->review->status?->icon(),
                    'created_at'    => $booking->review->created_at,
                    'moderated_at'  => $booking->review->moderated_at,
                    'is_deleted'    => $booking->review->trashed(),
                    'deleted_at'    => $booking->review->deleted_at,

                    'moderation_note'  => $booking->review->moderation_note,

                    'rejection_reason' => $booking->review->rejection_reason,

                    'user' => $booking->review->user ? [
                        'id'        => $booking->review->user->id,
                        'name'      => $booking->review->user->name,
                        'avatar'    => $booking->review->user->avatar,
                        'thumbnail' => $booking->review->user->avatarUrl(),
                        'phone'     => $booking->review->user->phone,
                        'slug'      => $booking->review->user->slug,
                    ] : null,

                    'moderated_by' => $booking->review->moderatedBy ? [
                        'id'   => $booking->review->moderatedBy->id,
                        'name' => $booking->review->moderatedBy->name,
                    ] : null,
                ] : null,
            ],
            'scopes' => ['bookings'],
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
            StickyAlert::alert(
                'این رزرو قابل تکمیل نیست.',
                'error'
            );
            return redirect()->back();
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

    public function AllBookings(Request $request)
    {
        $query = Booking::query()
            ->with([
                'user:id,name,phone,avatar',
                'barber:id,name,phone,avatar,slug',
                'service:id,name,duration,price',
                'timeSlot:id,date,start_time,end_time',
            ])
            ->withCount('disputes');

        // ============ فیلترها ============
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($barberId = $request->input('barber_id')) {
            $query->where('barber_id', $barberId);
        }

        if ($customerId = $request->input('customer_id')) {
            $query->where('user_id', $customerId);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereHas('timeSlot', fn($q) => $q->whereDate('date', '>=', $dateFrom));
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereHas('timeSlot', fn($q) => $q->whereDate('date', '<=', $dateTo));
        }

        if ($minAmount = $request->input('min_amount')) {
            $query->where('amount', '>=', $minAmount);
        }

        if ($maxAmount = $request->input('max_amount')) {
            $query->where('amount', '<=', $maxAmount);
        }

        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%"))
                    ->orWhereHas('barber', fn($b) => $b->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%"));
            });
        }

        $bookings = $query->latest()->paginate(33)->withQueryString();

        $bookings->through(fn($b) => $this->mapBooking($b));

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'filters'  => [
                'status'      => $request->input('status', ''),
                'barber_id'   => $request->input('barber_id', ''),
                'customer_id' => $request->input('customer_id', ''),
                'date_from'   => $request->input('date_from', ''),
                'date_to'     => $request->input('date_to', ''),
                'min_amount'  => $request->input('min_amount', ''),
                'max_amount'  => $request->input('max_amount', ''),
                'search'      => $request->input('search', ''),
            ],
            'stats' => $this->buildStats(),
            'statuses' => collect(BookingStatus::cases())
                ->map(fn($s) => ['value' => $s->value, 'label' => $s->label() ?? $s->value])
                ->values(),
            'barbers' => User::role('آرایشگر')
                ->select('id', 'name')
                ->orderBy('name')
                ->limit(100)
                ->get(),
            'scopes' => ['bookings', 'bookings-list']
        ]);
    }

    public function showDetail(Booking $booking)
    {
        $booking->load([
            'user:id,name,phone,avatar',
            'barber:id,name,phone,avatar,slug',
            'service:id,name,duration,price,description',
            'timeSlot:id,date,start_time,end_time',
            'payment',
            'review',
            'disputes',
            'latestDispute',
        ]);
        $booking->loadCount('disputes');

        return Inertia::render('Admin/Bookings/Show', [
            'booking' => $this->mapBooking($booking, detailed: true),
            'scopes' => ['bookings']
        ]);
    }

    private function mapBooking(Booking $b, bool $detailed = false): array
    {
        $data = [
            'id'         => $b->id,
            'status'     => $b->status?->value,
            'status_label' => $b->status?->label() ?? $b->status?->value,
            'amount'     => (float) $b->amount,
            'notes'      => $b->notes,
            'created_at' => $b->created_at?->toIso8601String(),
            'confirmed_at' => $b->confirmed_at?->toIso8601String(),
            'completed_at' => $b->completed_at?->toIso8601String(),
            'cancelled_at' => $b->cancelled_at?->toIso8601String(),

            'has_disputes'      => $b->disputes_count > 0,
            'disputes_count'    => $b->disputes_count,
            'has_active_dispute' => $b->has_active_dispute,
            'can_dispute'       => $b->can_dispute,

            'user' => $b->user ? [
                'id'     => $b->user->id,
                'name'   => $b->user->name,
                'phone'  => $b->user->phone,
                'avatar' => $b->user->avatarUrl(),
            ] : null,

            'barber' => $b->barber ? [
                'id'     => $b->barber->id,
                'name'   => $b->barber->name,
                'phone'  => $b->barber->phone,
                'avatar' => $b->barber->avatarUrl(),
                'slug'   => $b->barber->slug,
            ] : null,

            'service' => $b->service ? [
                'id'       => $b->service->id,
                'name'     => $b->service->name,
                'duration' => $b->service->duration,
                'price'    => (float) $b->service->price,
            ] : null,

            'time_slot' => $b->timeSlot ? [
                'date'       => $b->timeSlot->date,
                'start_time' => $b->timeSlot->start_time,
                'end_time'   => $b->timeSlot->end_time,
            ] : null,
        ];

        if ($detailed) {
            $data['payment'] = $b->payment ? [
                'id'         => $b->payment->id,
                'gateway'    => $b->payment->gateway,
                'transaction_id' => $b->payment->transaction_id,
                'amount'     => (float) $b->payment->amount,
                'status'     => $b->payment->status?->value,
                'paid_at'    => $b->payment->paid_at?->toIso8601String(),
            ] : null;

            $data['review'] = $b->review ? [
                'id'      => $b->review->id,
                'rating'  => $b->review->rating,
                'comment' => $b->review->comment,
                'status'  => $b->review->status?->value,
            ] : null;

            $data['disputes'] = $b->disputes->map(fn($d) => [
                'id'           => $d->id,
                'status'       => $d->status?->value,
                'disputed_by'  => $d->disputed_by,
                'reason'       => $d->reason,
                'created_at'   => $d->created_at?->toIso8601String(),
                'resolved_at'  => $d->resolved_at?->toIso8601String(),
            ])->toArray();
        }

        return $data;
    }

    private function buildStats(): array
    {
        return [
            'total'      => Booking::count(),
            'pending'    => Booking::where('status', BookingStatus::pending->value)->count(),
            'confirmed'  => Booking::where('status', BookingStatus::confirmed->value)->count(),
            'completed'  => Booking::where('status', BookingStatus::completed->value)->count(),
            'cancelled'  => Booking::where('status', BookingStatus::cancelled->value)->count(),
            'disputed'   => Booking::whereHas('disputes')->count(),

            'total_amount'     => (float) Booking::sum('amount'),
            'today_count'      => Booking::whereHas('timeSlot', fn($q) => $q->whereDate('date', today()))->count(),
            'today_amount'     => (float) Booking::whereHas('timeSlot', fn($q) => $q->whereDate('date', today()))->sum('amount'),
        ];
    }
}
