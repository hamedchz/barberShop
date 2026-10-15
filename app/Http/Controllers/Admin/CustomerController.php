<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\UserStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Dispute;
use App\Models\User;
use App\Models\UserWarning;
use App\Models\WalletTransaction;
use App\Supports\StickyAlert;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * لیست مشتریان
     */
    public function index(Request $request)
    {
        $query = User::role('مشتری');

        // فیلتر جستجو
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // فیلتر وضعیت
        $isActive = $request->input('is_active');
        if ($isActive !== null && $isActive !== '') {
            if ($isActive === '1') {
                $query->where('is_active', true);
            } elseif ($isActive === '0') {
                $query->where(function ($q) {
                    $q->where('is_active', false)
                        ->orWhereNull('is_active');
                });
            }
        }
        // فیلتر وضعیت حساب
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // مرتب‌سازی
        $sort = $request->input('sort', 'latest');
        match ($sort) {
            'oldest'          => $query->oldest(),
            'most_bookings'   => $query->withCount('customerBookings')->orderByDesc('customer_bookings_count'),
            'most_warnings'   => $query->withCount('warnings')->orderByDesc('warnings_count'),
            default           => $query->latest(),
        };

        $customers = $query
            ->withCount(['customerBookings', 'warnings'])
            ->paginate(20)
            ->withQueryString();

        $customers->through(fn($c) => [
            'id'             => $c->id,
            'name'           => $c->name,
            'slug'           => $c->slug,
            'phone'          => $c->phone,
            'email'          => $c->email,
            'thumbnail'      => $c->avatarUrl(),
            'is_active'      => $c->is_active,
            'status'         => $c->status?->value,
            'total_bookings' => $c->customer_bookings_count,
            'total_warnings' => $c->warnings_count,
            'created_at'     => $c->created_at,
        ]);

        // آمار کلی
        $stats = [
            'total'    => User::role('مشتری')->count(),
            'active'   => User::role('مشتری')->where('is_active', true)->count(),
            'inactive' => User::role('مشتری')->where('is_active', false)->count(),
            'banned'   => User::role('مشتری')
                ->whereHas('warnings', fn($q) => $q->active())
                ->count(),
        ];

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'stats'     => $stats,
            'filters' => [
                'search'    => $request->input('search', ''),
                'is_active' => $request->input('is_active', ''),
                'status'    => $request->input('status', ''),
                'sort'      => $sort,
            ],
        ]);
    }

    /**
     * جزئیات مشتری
     */
    public function show(User $customer)
    {
        if (!$customer->hasRole('مشتری')) {
            abort(404);
        }

        // ============ آمار ============
        $stats = [
            'total_bookings'     => Booking::where('user_id', $customer->id)->count(),
            'completed_bookings' => Booking::where('user_id', $customer->id)
                ->where('status', 'completed')->count(),
            'cancelled_bookings' => Booking::where('user_id', $customer->id)
                ->where('status', 'cancelled')->count(),
            'pending_bookings'   => Booking::where('user_id', $customer->id)
                ->where('status', 'pending')->count(),

            'total_paid'         => (float) Booking::where('user_id', $customer->id)
                ->whereHas('payment', fn($q) => $q->where('status', 'success'))
                ->sum('amount'),
            'total_refunded'     => (float) WalletTransaction::where('user_id', $customer->id)
                ->where('type', 'refund')->sum('amount'),

            'warnings_count'     => UserWarning::where('user_id', $customer->id)
                ->active()->count(),
            'disputes_count'     => Dispute::where('disputed_by_user_id', $customer->id)->count(),
            'reviews_count'      => \App\Models\Review::whereHas('booking', function ($q) use ($customer) {
                $q->where('user_id', $customer->id);
            })->count(),
        ];

        // ============ رزروها ============

        $recentBookings = Booking::where('user_id', $customer->id)
            ->with([
                'barber:id,name,avatar,phone',
                'service:id,name,duration,price',
                'payment:id,booking_id,status,amount',
            ])
            ->latest()
            ->paginate(33, ['*'], 'bookings_page')
            ->withQueryString()
            ->through(fn($b) => [
                'id'           => $b->id,
                'status'       => $b->status->value,
                'amount'       => (float) $b->amount,
                'created_at'   => $b->created_at,
                'completed_at' => $b->completed_at,

                'barber' => $b->barber ? [
                    'id'        => $b->barber->id,
                    'name'      => $b->barber->name,
                    'thumbnail' => $b->barber->avatarUrl(),
                    'phone'     => $b->barber->phone,
                ] : null,

                'service' => $b->service ? [
                    'id'       => $b->service->id,
                    'name'     => $b->service->name,
                    'duration' => $b->service->duration,
                    'price'    => (float) $b->service->price,
                ] : null,

                'payment_status' => $b->payment?->status,
            ]);


        // ============ اخطارها ============

        $warnings = UserWarning::where('user_id', $customer->id)
            ->with([
                'dispute:id,dispute_type,reason',
                'issuedBy:id,name,avatar',
            ])
            ->latest()
            ->paginate(33, ['*'], 'warnings_page')
            ->withQueryString()
            ->through(fn($w) => [
                'id'         => $w->id,
                'type'       => $w->type,
                'reason'     => $w->reason,
                'expires_at' => $w->expires_at,
                'revoked_at' => $w->revoked_at,
                'is_active'  => $w->isActive(),

                'issued_by' => $w->issuedBy ? [
                    'id'   => $w->issuedBy->id,
                    'name' => $w->issuedBy->name,
                ] : null,

                'dispute' => $w->dispute ? [
                    'id'           => $w->dispute->id,
                    'dispute_type' => $w->dispute->dispute_type->value,
                    'reason'       => $w->dispute->reason,
                ] : null,

                'created_at' => $w->created_at,
            ]);


        // ============ تراکنش‌ها ============

        $transactions = WalletTransaction::where('user_id', $customer->id)
            ->latest()
            ->paginate(33, ['*'], 'transactions_page')
            ->withQueryString()
            ->through(fn($t) => [
                'id'              => $t->id,
                'type'            => $t->type->value,
                'type_label'      => $t->type->label(),
                'direction'       => $t->direction->value,
                'direction_label' => $t->direction->label(),
                'amount'          => (float) $t->amount,
                'status'          => $t->status->value,
                'status_label'    => $t->status->label(),
                'description'     => $t->description,
                'created_at'      => $t->created_at,
            ]);

        // ============ کیف پول ============
        $wallet = $customer->getOrCreateWallet();

        // ============ اعتراضات ============

        $disputes = Dispute::where('disputed_by_user_id', $customer->id)
            ->with([
                'booking:id,barber_id',
                'booking.barber:id,name',
            ])
            ->latest()
            ->paginate(33, ['*'], 'disputes_page')
            ->withQueryString()
            ->through(fn($d) => [
                'id'                 => $d->id,
                'dispute_type'       => $d->dispute_type->value,
                'dispute_type_label' => $d->dispute_type->label(),
                'status'             => $d->status->value,
                'status_label'       => $d->status->label(),
                'reason'             => $d->reason,
                'created_at'         => $d->created_at,

                'barber' => $d->booking?->barber ? [
                    'id'   => $d->booking->barber->id,
                    'name' => $d->booking->barber->name,
                ] : null,
            ]);

        return Inertia::render('Admin/Customers/Show', [
            'customer' => [
                'id'             => $customer->id,
                'name'           => $customer->name,
                'slug'           => $customer->slug,
                'email'          => $customer->email,
                'phone'          => $customer->phone,
                'phone_verified' => !is_null($customer->phone_verified_at),
                'avatar'         => $customer->avatar,
                'thumbnail'      => $customer->avatarUrl(),
                'bio'            => $customer->bio,
                'address'        => $customer->address,
                'city'           => $customer->city,
                'birth_date'     => Carbon::parse($customer->birth_date)->format('Y-m-d'),
                'gender'         => $customer->gender,
                'national_code'  => $customer->national_code,
                'is_active'      => $customer->is_active,
                'status'         => $customer->status?->value,
                'created_at'     => $customer->created_at,
                'last_login_at'  => $customer->last_login_at,
                'last_seen_at'   => $customer->last_seen_at,
            ],
            'stats'          => $stats,
            'recentBookings' => $recentBookings,
            'warnings'       => $warnings,
            'transactions'   => $transactions,
            'disputes'       => $disputes,
            'wallet'         => [
                'balance'        => (float) $wallet->balance,
                'locked_balance' => (float) $wallet->locked_balance,
                'available'      => $wallet->available_balance,
            ],
        ]);
    }

    /**
     * تغییر وضعیت کاربر
     */
    public function updateStatus(Request $request, User $customer)
    {
        if (!$customer->hasRole('مشتری')) {
            abort(404);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:' . implode(',', [
                UserStatus::ACTIVE->value,
                UserStatus::INACTIVE->value,
                UserStatus::SUSPENDED->value,
                UserStatus::PENDING->value,
                UserStatus::BANNED->value,
            ]),
        ], [
            'status.required' => 'لطفاً وضعیت را انتخاب کنید.',
            'status.in'       => 'وضعیت انتخابی معتبر نیست.',
        ]);

        $newStatus = UserStatus::from($validated['status']);

        //  آپدیت همزمان is_active و status
        $customer->update([
            'status'    => $newStatus->value,
            'is_active' => $newStatus === UserStatus::ACTIVE,
        ]);
        StickyAlert::toast(
            "وضعیت کاربر به «{$newStatus->label()}» تغییر یافت.",
            'success'
        );

        return redirect()->back();
    }

    /**
     * فعال/غیرفعال کردن مشتری
     */
    public function toggleStatus(User $customer)
    {
        if (!$customer->hasRole('مشتری')) {
            abort(404);
        }

        $newState = !$customer->is_active;

        $customer->update([
            'is_active' => $newState,
            'status'    => $newState
                ? UserStatus::ACTIVE->value
                : UserStatus::INACTIVE->value,
        ]);

        $status = $newState ? 'فعال' : 'غیرفعال';

        StickyAlert::toast("حساب مشتری {$status} شد.", 'success');

        return redirect()->back();
    }
}
