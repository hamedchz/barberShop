<?php

namespace App\Http\Controllers\Barber;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
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

        // مشتریانی که با این آرایشگر رزرو دارن
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

        $customers = $query
            ->withCount(['customerBookings' => function ($q) use ($barber) {
                $q->where('barber_id', $barber->id);
            }])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $customers->through(fn($c) => [
            'id'                => $c->id,
            'name'              => $c->name,
            'thumbnail'         => $c->avatar(),
            'phone'             => $c->phone,
            'bookings_count'    => $c->customer_bookings_count,
            'created_at'        => $c->created_at,
        ]);

        return Inertia::render('Barber/Customers/Index', [
            'customers' => $customers,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    /**
     * جزئیات مشتری (نسخه محدود)
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

        // ============ آمار (فقط با این آرایشگر) ============
        $stats = [
            'total_bookings'     => Booking::where('user_id', $customer->id)
                ->where('barber_id', $barber->id)->count(),
            'completed_bookings' => Booking::where('user_id', $customer->id)
                ->where('barber_id', $barber->id)
                ->where('status', 'completed')->count(),
            'cancelled_bookings' => Booking::where('user_id', $customer->id)
                ->where('barber_id', $barber->id)
                ->where('status', 'cancelled')->count(),
            'total_earned'       => (float) Booking::where('user_id', $customer->id)
                ->where('barber_id', $barber->id)
                ->where('status', 'completed')
                ->sum('amount'),
        ];

        // ============ رزروها (فقط با این آرایشگر) ============
        $bookings = Booking::where('user_id', $customer->id)
            ->where('barber_id', $barber->id)
            ->with(['service:id,name,duration,price'])
            ->latest()
            ->paginate(15);

        $bookings->through(fn($b) => [
            'id'         => $b->id,
            'status'     => $b->status->value,
            'amount'     => (float) $b->amount,
            'created_at' => $b->created_at,
            'completed_at' => $b->completed_at,
            'service'    => $b->service ? [
                'id'       => $b->service->id,
                'name'     => $b->service->name,
                'duration' => $b->service->duration,
            ] : null,
        ]);

        return Inertia::render('Barber/Customers/Show', [
            // ✅ فقط اطلاعات پایه
            'customer' => [
                'id'             => $customer->id,
                'name'           => $customer->name,
                'avatar'         => $customer->avatar,
                'thumbnail'      => $customer->avatar(),
                'phone'          => $customer->phone,   // ← چون رزرو داره
                'phone_verified' => !is_null($customer->phone_verified_at),
                'created_at'     => $customer->created_at,
            ],
            'stats'    => $stats,
            'bookings' => $bookings,
        ]);
    }
}
