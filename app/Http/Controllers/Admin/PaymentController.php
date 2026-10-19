<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\PaymentGateway;
use App\Enums\Casts\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with([
            'user:id,name,avatar,phone,slug',
            'user.roles',
            'booking:id,status,amount,time_slot_id,service_id,barber_id,created_at',
            'booking.timeSlot:id,date,start_time,end_time',
            'booking.service:id,name,price',
        ]);

        // ============ فیلترها ============
        if ($gateway = $request->input('gateway')) {
            $query->where('gateway', $gateway);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('paid_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('paid_at', '<=', $dateTo);
        }

        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                    ->orWhere('authority', 'like', "%{$search}%")
                    ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%"));
            });
        }

        $payments = $query->latest('paid_at')->paginate(33)->withQueryString();

        // ============ آمار ============
        $stats = [
            'total_amount'   => (float) Payment::where('status', PaymentStatus::success->value)->sum('amount'),
            'total_count'    => Payment::count(),
            'success_count'  => Payment::where('status', PaymentStatus::success->value)->count(),
            'failed_count'   => Payment::where('status', PaymentStatus::failed->value)->count(),
            'pending_count'  => Payment::where('status', PaymentStatus::pending->value)->count(),

            // Breakdown درگاه‌ها
            'gateway_breakdown' => Payment::query()
                ->where('status', PaymentStatus::success->value)
                ->selectRaw('gateway, COUNT(*) as count, COALESCE(SUM(amount), 0) as total')
                ->groupBy('gateway')
                ->orderByDesc('total')
                ->get()
                ->map(fn($row) => [
                    'key'   => $row->gateway,
                    'label' => [
                        'zarinpal' => 'زرین‌پال',
                        'idpay'    => 'آیدی‌پی',
                        'payping'  => 'پی‌پینگ',
                        'nextpay'  => 'نکست‌پی',
                    ][$row->gateway] ?? $row->gateway,
                    'value' => (float) $row->total,
                    'count' => (int) $row->count,
                ])
                ->toArray(),
        ];

        return Inertia::render('Admin/Finance/Payments/Index', [
            'payments' => $payments,
            'stats'    => $stats,
            'filters'  => [
                'gateway'   => $request->input('gateway', ''),
                'status'    => $request->input('status', ''),
                'user_id'   => $request->input('user_id', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to'   => $request->input('date_to', ''),
                'search'    => $request->input('search', ''),
            ],
            'gateways' => [
                ['value' => PaymentGateway::ZARINPAL->value, 'label' => 'زرین‌پال'],
                ['value' => PaymentGateway::IDPAY->value,    'label' => 'آیدی‌پی'],
                ['value' => PaymentGateway::PAYPING->value,  'label' => 'پی‌پینگ'],
                ['value' => PaymentGateway::NEXTPAY->value,  'label' => 'نکست‌پی'],
            ],
            'statuses' => [
                ['value' => PaymentStatus::pending->value,   'label' => 'در انتظار'],
                ['value' => PaymentStatus::success->value,   'label' => 'موفق'],
                ['value' => PaymentStatus::failed->value,    'label' => 'ناموفق'],
                ['value' => PaymentStatus::cancelled->value, 'label' => 'لغو شده'],
                ['value' => PaymentStatus::refunded->value, 'label' => 'برگشت داده شده'],
            ],
        ]);
    }
}
