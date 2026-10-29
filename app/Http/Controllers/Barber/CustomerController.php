<?php

namespace App\Http\Controllers\Barber;

use App\Enums\Casts\BookingStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * لیست مشتریان آرایشگر
     */
    // public function index(Request $request)
    // {
    //     $barber = auth()->user();

    //     $query = User::role('مشتری')
    //         ->whereHas('customerBookings', function ($q) use ($barber) {
    //             $q->where('barber_id', $barber->id);
    //         });

    //     // جستجو
    //     if ($search = trim($request->input('search', ''))) {
    //         $query->where(function ($q) use ($search) {
    //             $q->where('name', 'like', "%{$search}%")
    //                 ->orWhere('phone', 'like', "%{$search}%");
    //         });
    //     }

    //     // مرتب‌سازی
    //     $sort = $request->input('sort', 'latest');
    //     match ($sort) {
    //         'oldest'        => $query->oldest(),
    //         'most_bookings' => $query->withCount(['customerBookings' => function ($q) use ($barber) {
    //             $q->where('barber_id', $barber->id);
    //         }])->orderByDesc('customer_bookings_count'),
    //         default         => $query->latest(),
    //     };

    //     $customers = $query
    //         ->withCount(['customerBookings' => function ($q) use ($barber) {
    //             $q->where('barber_id', $barber->id);
    //         }])
    //         ->paginate(20)
    //         ->withQueryString();

    //     $customers->through(fn($c) => [
    //         'id'             => $c->id,
    //         'name'           => $c->name,
    //         'thumbnail'      => $c->avatarUrl(),
    //         'phone'          => $c->phone,
    //         'bookings_count' => $c->customer_bookings_count,
    //         'created_at'     => $c->created_at,
    //     ]);

    //     return Inertia::render('Barber/Customers/Index', [
    //         'customers' => $customers,
    //         'filters' => [
    //             'search' => $request->input('search', ''),
    //             'sort'   => $sort,
    //         ],
    //     ]);
    // }

    /**
     * جزئیات مشتری
     */
    //     public function show(User $customer)
    //     {
    //         $barber = auth()->user();

    //         // ✅ چک: آیا این مشتری با این آرایشگر رزرو داره؟
    //         $hasBooking = Booking::where('user_id', $customer->id)
    //             ->where('barber_id', $barber->id)
    //             ->exists();

    //         if (!$hasBooking) {
    //             abort(403, 'شما به این مشتری دسترسی ندارید.');
    //         }

    //         if (!$customer->hasRole('مشتری')) {
    //             abort(404);
    //         }

    //         // ============ آمار با این آرایشگر ============
    //         $baseQuery = Booking::where('user_id', $customer->id)
    //             ->where('barber_id', $barber->id);

    //         $stats = [
    //             'total_bookings'     => (clone $baseQuery)->count(),
    //             'completed_bookings' => (clone $baseQuery)->where('status', 'completed')->count(),
    //             'cancelled_bookings' => (clone $baseQuery)->where('status', 'cancelled')->count(),
    //             'pending_bookings'   => (clone $baseQuery)->whereIn('status', ['pending', 'confirmed'])->count(),

    //             'total_earned'       => (float) (clone $baseQuery)
    //                 ->where('status', 'completed')
    //                 ->sum('amount'),

    //             'first_booking_at'   => (clone $baseQuery)->oldest()->value('created_at'),
    //             'last_booking_at'    => (clone $baseQuery)->latest()->value('created_at'),

    //             'average_rating'     => (float) (Review::whereHas('booking', function ($q) use ($customer, $barber) {
    //                 $q->where('user_id', $customer->id)
    //                     ->where('barber_id', $barber->id);
    //             })->avg('rating') ?? 0),

    //             'reviews_count'      => Review::whereHas('booking', function ($q) use ($customer, $barber) {
    //                 $q->where('user_id', $customer->id)
    //                     ->where('barber_id', $barber->id);
    //             })->count(),
    //         ];

    //         // ============ رزروها (paginated) ============
    //         $bookings = Booking::where('user_id', $customer->id)
    //             ->where('barber_id', $barber->id)
    //             ->with(['service:id,name,duration,price', 'review:id,booking_id,rating,comment,created_at'])
    //             ->latest()
    //             ->paginate(33, ['*'], 'bookings_page')
    //             ->withQueryString();

    //         $bookings->through(fn($b) => [
    //             'id'           => $b->id,
    //             'status'       => $b->status->value,
    //             'amount'       => (float) $b->amount,
    //             'created_at'   => $b->created_at,
    //             'confirmed_at' => $b->confirmed_at,
    //             'completed_at' => $b->completed_at,
    //             'cancelled_at' => $b->cancelled_at,
    //             'service'      => $b->service ? [
    //                 'id'       => $b->service->id,
    //                 'name'     => $b->service->name,
    //                 'duration' => $b->service->duration,
    //                 'price'    => (float) $b->service->price,
    //             ] : null,
    //             'review'       => $b->review ? [
    //                 'id'         => $b->review->id,
    //                 'rating'     => (int) $b->review->rating,
    //                 'comment'    => $b->review->comment,
    //                 'created_at' => $b->review->created_at,
    //             ] : null,
    //         ]);

    //         // ============ نظرات ============

    //         $reviews = Review::whereHas('booking', function ($q) use ($customer, $barber) {
    //             $q->where('user_id', $customer->id)
    //                 ->where('barber_id', $barber->id);
    //         })
    //             ->with([
    //                 'booking:id,service_id',
    //                 'booking.service:id,name',
    //             ])
    //             ->latest()
    //             ->paginate(33, ['*'], 'reviews_page')
    //             ->withQueryString()
    //             ->through(fn($r) => [
    //                 'id'         => $r->id,
    //                 'rating'     => (int) $r->rating,
    //                 'comment'    => $r->comment,
    //                 'created_at' => $r->created_at,
    //                 'service'    => $r->booking?->service?->name,
    //             ]);


    //         return Inertia::render('Barber/Customers/Show', [
    //             'customer' => [
    //                 'id'             => $customer->id,
    //                 'name'           => $customer->name,
    //                 'avatar'         => $customer->avatar,
    //                 'thumbnail'      => $customer->avatarUrl(),
    //                 'phone'          => $customer->phone,
    //                 'phone_verified' => !is_null($customer->phone_verified_at),
    //                 'city'           => $customer->city,
    //                 'created_at'     => $customer->created_at,
    //                 'last_seen_at'   => $customer->last_seen_at,
    //             ],
    //             'stats'    => $stats,
    //             'bookings' => $bookings,
    //             'reviews'  => $reviews,
    //         ]);
    //     }

    public function index(Request $request)
    {
        $user = auth()->user();

        // ============ مشتریان منحصر‌به‌فرد آرایشگر ============
        $customersQuery = User::query()
            ->whereHas('customerBookings', function ($q) use ($user) {
                $q->where('barber_id', $user->id);
            })
            ->withCount([
                'customerBookings as total_bookings' => function ($q) use ($user) {
                    $q->where('barber_id', $user->id);
                },
                'customerBookings as completed_bookings' => function ($q) use ($user) {
                    $q->where('barber_id', $user->id)
                        ->where('status', BookingStatus::completed->value);
                },
                'customerBookings as cancelled_bookings' => function ($q) use ($user) {
                    $q->where('barber_id', $user->id)
                        ->where('status', BookingStatus::cancelled->value);
                },
            ])
            ->withSum([
                'customerBookings as total_spent' => function ($q) use ($user) {
                    $q->where('barber_id', $user->id)
                        ->where('status', BookingStatus::completed->value);
                },
            ], 'amount')
            ->withMax([
                'customerBookings as last_booking_at' => function ($q) use ($user) {
                    $q->where('barber_id', $user->id);
                },
            ], 'created_at')
            ->with([
                'givenReviews' => function ($q) use ($user) {
                    $q->where('barber_id', $user->id)
                        ->where('status', 'approved')
                        ->latest()
                        ->limit(1);
                },
            ]);

        // ============ فیلترها ============
        if ($search = trim($request->input('search', ''))) {
            $customersQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // ============ مرتب‌سازی ============
        $sort = $request->input('sort', 'latest');
        match ($sort) {
            'most_bookings'  => $customersQuery->orderByDesc('total_bookings'),
            'most_spent'     => $customersQuery->orderByDesc('total_spent'),
            'recent_booking' => $customersQuery->orderByDesc('last_booking_at'),
            'name'           => $customersQuery->orderBy('name'),
            default          => $customersQuery->orderByDesc('last_booking_at'),
        };

        $customers = $customersQuery->paginate(33)->withQueryString();

        // ============ فرمت خروجی ============
        $customers->through(function (User $customer) use ($user) {
            // آخرین رزرو
            $lastBooking = Booking::where('user_id', $customer->id)
                ->where('barber_id', $user->id)
                ->with(['service:id,name', 'timeSlot:id,date,start_time'])
                ->latest()
                ->first();

            // آخرین نظر
            $lastReview = $customer->givenReviews->first();

            return [
                'id'        => $customer->id,
                'name'      => $customer->name,
                'phone'     => $customer->phone,
                'email'     => $customer->email,
                'avatar'    => $customer->avatar ? $customer->avatarUrl() : null,
                'slug'      => $customer->slug,

                'total_bookings'     => (int) $customer->total_bookings,
                'completed_bookings' => (int) $customer->completed_bookings,
                'cancelled_bookings' => (int) $customer->cancelled_bookings,
                'total_spent'        => (float) ($customer->total_spent ?? 0),
                'last_booking_at'    => $customer->last_booking_at
                    ? Carbon::parse($customer->last_booking_at)->toIso8601String()
                    : null,

                'last_booking' => $lastBooking ? [
                    'id'      => $lastBooking->id,
                    'service' => $lastBooking->service?->name,
                    'date'    => $lastBooking->timeSlot?->date,
                    'time'    => $lastBooking->timeSlot?->start_time,
                    'status'  => $lastBooking->status?->value,
                    'status_label' => $lastBooking->status?->label(),
                ] : null,

                'last_review' => $lastReview ? [
                    'rating'  => (int) $lastReview->rating,
                    'comment' => $lastReview->comment,
                ] : null,
            ];
        });

        return Inertia::render('Barber/Customers/Index', [
            'customers' => $customers,
            'stats'     => $this->buildStats($user),
            'filters'   => [
                'search' => $request->input('search', ''),
                'sort'   => $sort,
            ],
        ]);
    }

    public function show(User $customer)
    {
        $user = auth()->user();

        // ============ بررسی اینکه مشتری با این آرایشگر رزرو داره ============
        $hasBookings = Booking::where('user_id', $customer->id)
            ->where('barber_id', $user->id)
            ->exists();

        if (!$hasBookings) {
            abort(404);
        }

        // ============ رزروهای مشتری با این آرایشگر ============
        $bookings = Booking::where('user_id', $customer->id)
            ->where('barber_id', $user->id)
            ->with([
                'service:id,name,price,duration',
                'timeSlot:id,date,start_time,end_time',
                'payment:id,booking_id,amount,status,gateway,paid_at',
                'review:id,booking_id,rating,comment,status,created_at',
            ])
            ->latest()
            ->paginate(33, ['*'], 'bookings_page');

        $bookings->through(fn($b) => [
            'id'         => $b->id,
            'amount'     => (float) $b->amount,
            'status'     => $b->status?->value,
            'status_label' => $b->status?->label(),
            'created_at' => $b->created_at?->toIso8601String(),
            'service'    => $b->service?->name,
            'price'      => (float) ($b->service?->price ?? 0),
            'duration'   => $b->service?->duration,
            'date'       => $b->timeSlot?->date,
            'start_time' => $b->timeSlot?->start_time,
            'end_time'   => $b->timeSlot?->end_time,
            'payment'    => $b->payment ? [
                'amount' => (float) $b->payment->amount,
                'status' => $b->payment->status?->value,
                'gateway' => $b->payment->gateway,
                'paid_at' => $b->payment->paid_at?->toIso8601String(),
            ] : null,
            'review'     => $b->review ? [
                'rating'  => (int) $b->review->rating,
                'comment' => $b->review->comment,
                'status'  => $b->review->status?->value,
            ] : null,
        ]);

        // ============ آمار مشتری با این آرایشگر ============
        $customerStats = [
            'total_bookings'     => Booking::where('user_id', $customer->id)
                ->where('barber_id', $user->id)->count(),
            'completed_bookings' => Booking::where('user_id', $customer->id)
                ->where('barber_id', $user->id)
                ->where('status', BookingStatus::completed->value)->count(),
            'cancelled_bookings' => Booking::where('user_id', $customer->id)
                ->where('barber_id', $user->id)
                ->where('status', BookingStatus::cancelled->value)->count(),
            'total_spent'        => (float) Booking::where('user_id', $customer->id)
                ->where('barber_id', $user->id)
                ->where('status', BookingStatus::completed->value)
                ->sum('amount'),
            'average_rating'     => (float) Review::where('user_id', $customer->id)
                ->where('barber_id', $user->id)
                ->where('status', 'approved')
                ->avg('rating') ?? 0,
        ];

        return Inertia::render('Barber/Customers/Show', [
            'customer' => [
                'id'     => $customer->id,
                'name'   => $customer->name,
                'phone'  => $customer->phone,
                'email'  => $customer->email,
                'avatar' => $customer->avatar ? $customer->avatarUrl() : null,
                'slug'   => $customer->slug,
                'city'   => $customer->city,
                'created_at' => $customer->created_at?->toIso8601String(),
            ],
            'stats'    => $customerStats,
            'bookings' => $bookings,
        ]);
    }

    private function buildStats(User $barber): array
    {
        // کل مشتریان منحصر‌به‌فرد
        $totalCustomers = Booking::where('barber_id', $barber->id)
            ->distinct('user_id')
            ->count('user_id');

        // مشتریان این ماه
        $thisMonthCustomers = Booking::where('barber_id', $barber->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->distinct('user_id')
            ->count('user_id');

        // مشتریان بازگشتی (بیشتر از ۱ رزرو)
        $returningCustomers = Booking::where('barber_id', $barber->id)
            ->select('user_id', DB::raw('COUNT(*) as bookings_count'))
            ->groupBy('user_id')
            ->having('bookings_count', '>', 1)
            ->count();

        // میانگین رزرو به ازای هر مشتری
        $avgBookingsPerCustomer = $totalCustomers > 0
            ? round(Booking::where('barber_id', $barber->id)->count() / $totalCustomers, 1)
            : 0;

        return [
            'total_customers'      => $totalCustomers,
            'this_month_customers' => $thisMonthCustomers,
            'returning_customers'  => $returningCustomers,
            'avg_bookings_per_customer' => $avgBookingsPerCustomer,
        ];
    }
}
