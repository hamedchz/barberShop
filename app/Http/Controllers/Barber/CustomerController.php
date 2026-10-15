<?php

namespace App\Http\Controllers\Barber;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * لیست مشتریان آرایشگر
     */
    public function index(Request $request)
    {
        $barber = auth()->user();

        $query = User::role('مشتری')
            ->whereHas('customerBookings', function ($q) use ($barber) {
                $q->where('barber_id', $barber->id);
            });

        // جستجو
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // مرتب‌سازی
        $sort = $request->input('sort', 'latest');
        match ($sort) {
            'oldest'        => $query->oldest(),
            'most_bookings' => $query->withCount(['customerBookings' => function ($q) use ($barber) {
                $q->where('barber_id', $barber->id);
            }])->orderByDesc('customer_bookings_count'),
            default         => $query->latest(),
        };

        $customers = $query
            ->withCount(['customerBookings' => function ($q) use ($barber) {
                $q->where('barber_id', $barber->id);
            }])
            ->paginate(20)
            ->withQueryString();

        $customers->through(fn($c) => [
            'id'             => $c->id,
            'name'           => $c->name,
            'thumbnail'      => $c->avatarUrl(),
            'phone'          => $c->phone,
            'bookings_count' => $c->customer_bookings_count,
            'created_at'     => $c->created_at,
        ]);

        return Inertia::render('Barber/Customers/Index', [
            'customers' => $customers,
            'filters' => [
                'search' => $request->input('search', ''),
                'sort'   => $sort,
            ],
        ]);
    }

    /**
     * جزئیات مشتری
     */
    public function show(User $customer)
    {
        $barber = auth()->user();

        // ✅ چک: آیا این مشتری با این آرایشگر رزرو داره؟
        $hasBooking = Booking::where('user_id', $customer->id)
            ->where('barber_id', $barber->id)
            ->exists();

        if (!$hasBooking) {
            abort(403, 'شما به این مشتری دسترسی ندارید.');
        }

        if (!$customer->hasRole('مشتری')) {
            abort(404);
        }

        // ============ آمار با این آرایشگر ============
        $baseQuery = Booking::where('user_id', $customer->id)
            ->where('barber_id', $barber->id);

        $stats = [
            'total_bookings'     => (clone $baseQuery)->count(),
            'completed_bookings' => (clone $baseQuery)->where('status', 'completed')->count(),
            'cancelled_bookings' => (clone $baseQuery)->where('status', 'cancelled')->count(),
            'pending_bookings'   => (clone $baseQuery)->whereIn('status', ['pending', 'confirmed'])->count(),

            'total_earned'       => (float) (clone $baseQuery)
                ->where('status', 'completed')
                ->sum('amount'),

            'first_booking_at'   => (clone $baseQuery)->oldest()->value('created_at'),
            'last_booking_at'    => (clone $baseQuery)->latest()->value('created_at'),

            'average_rating'     => (float) (Review::whereHas('booking', function ($q) use ($customer, $barber) {
                $q->where('user_id', $customer->id)
                    ->where('barber_id', $barber->id);
            })->avg('rating') ?? 0),

            'reviews_count'      => Review::whereHas('booking', function ($q) use ($customer, $barber) {
                $q->where('user_id', $customer->id)
                    ->where('barber_id', $barber->id);
            })->count(),
        ];

        // ============ رزروها (paginated) ============
        $bookings = Booking::where('user_id', $customer->id)
            ->where('barber_id', $barber->id)
            ->with(['service:id,name,duration,price', 'review:id,booking_id,rating,comment,created_at'])
            ->latest()
            ->paginate(33, ['*'], 'bookings_page')
            ->withQueryString();

        $bookings->through(fn($b) => [
            'id'           => $b->id,
            'status'       => $b->status->value,
            'amount'       => (float) $b->amount,
            'created_at'   => $b->created_at,
            'confirmed_at' => $b->confirmed_at,
            'completed_at' => $b->completed_at,
            'cancelled_at' => $b->cancelled_at,
            'service'      => $b->service ? [
                'id'       => $b->service->id,
                'name'     => $b->service->name,
                'duration' => $b->service->duration,
                'price'    => (float) $b->service->price,
            ] : null,
            'review'       => $b->review ? [
                'id'         => $b->review->id,
                'rating'     => (int) $b->review->rating,
                'comment'    => $b->review->comment,
                'created_at' => $b->review->created_at,
            ] : null,
        ]);

        // ============ نظرات ============

        $reviews = Review::whereHas('booking', function ($q) use ($customer, $barber) {
            $q->where('user_id', $customer->id)
                ->where('barber_id', $barber->id);
        })
            ->with([
                'booking:id,service_id',
                'booking.service:id,name',
            ])
            ->latest()
            ->paginate(33, ['*'], 'reviews_page')
            ->withQueryString()
            ->through(fn($r) => [
                'id'         => $r->id,
                'rating'     => (int) $r->rating,
                'comment'    => $r->comment,
                'created_at' => $r->created_at,
                'service'    => $r->booking?->service?->name,
            ]);


        return Inertia::render('Barber/Customers/Show', [
            'customer' => [
                'id'             => $customer->id,
                'name'           => $customer->name,
                'avatar'         => $customer->avatar,
                'thumbnail'      => $customer->avatarUrl(),
                'phone'          => $customer->phone,
                'phone_verified' => !is_null($customer->phone_verified_at),
                'city'           => $customer->city,
                'created_at'     => $customer->created_at,
                'last_seen_at'   => $customer->last_seen_at,
            ],
            'stats'    => $stats,
            'bookings' => $bookings,
            'reviews'  => $reviews,
        ]);
    }
}
