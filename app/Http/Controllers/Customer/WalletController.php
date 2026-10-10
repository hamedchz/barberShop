<?php

namespace App\Http\Controllers\Customer;

use App\Enums\Casts\WalletTransactionStatus;
use App\Enums\Casts\WalletTransactionType;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Settlement;
use App\Models\WalletTransaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WalletController extends Controller
{
    /**
     * داشبورد مالی مشتری
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $wallet = $user->getOrCreateWallet();

        $period = $request->input('period', '30');

        $startDate = match ($period) {
            '7'   => now()->subDays(7),
            '30'  => now()->subDays(30),
            '90'  => now()->subDays(90),
            '365' => now()->subYear(),
            default => now()->subDays(30),
        };

        // ============ آمار ============
        $stats = [
            'balance'         => (float) $wallet->balance,
            'available'       => $wallet->available_balance,

            // مجموع پرداخت کل
            'total_paid'      => (float) Booking::where('user_id', $user->id)
                ->whereHas('payment', fn($q) => $q->where('status', 'success'))
                ->sum('amount'),

            // پرداخت این دوره
            'period_paid'     => (float) Booking::where('user_id', $user->id)
                ->whereHas('payment', fn($q) => $q->where('status', 'success'))
                ->where('created_at', '>=', $startDate)
                ->sum('amount'),

            // مجموع بازگشت وجه
            'total_refunded'  => (float) WalletTransaction::where('user_id', $user->id)
                ->where('type', WalletTransactionType::refund->value)
                ->where('status', WalletTransactionStatus::completed->value)
                ->sum('amount'),

            // بازگشت این دوره
            'period_refunded' => (float) WalletTransaction::where('user_id', $user->id)
                ->where('type', WalletTransactionType::refund->value)
                ->where('status', WalletTransactionStatus::completed->value)
                ->where('created_at', '>=', $startDate)
                ->sum('amount'),

            // تعداد رزروها
            'total_bookings'  => Booking::where('user_id', $user->id)->count(),
        ];

        // ============ نمودار پرداخت روزانه ============
        $dailyPayments = $this->getDailyPayments($user->id, $startDate);

        // ============ آخرین تراکنشها ============
        $recentTransactions = WalletTransaction::where('user_id', $user->id)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($t) => $this->mapTransaction($t));

        // ============ درخواستهای برداشت ============
        $pendingSettlements = Settlement::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'processing'])
            ->latest()
            ->get()
            ->map(fn($s) => $this->mapSettlement($s));

        return Inertia::render('Customer/Wallet/Index', [
            'wallet' => [
                'balance'        => (float) $wallet->balance,
                'locked_balance' => (float) $wallet->locked_balance,
                'available'      => $wallet->available_balance,
                'currency'       => $wallet->currency ?? 'IRT',
                'is_active'      => $wallet->is_active,
            ],
            'stats'              => $stats,
            'dailyPayments'      => $dailyPayments,
            'recentTransactions' => $recentTransactions,
            'pendingSettlements' => $pendingSettlements,
            'filters' => [
                'period' => $period,
            ],
        ]);
    }

    /**
     * لیست تراکنشها
     */
    public function transactions(Request $request)
    {
        $user = auth()->user();

        $query = WalletTransaction::where('user_id', $user->id);

        // فیلترها
        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }
        if ($direction = $request->input('direction')) {
            $query->where('direction', $direction);
        }
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // بازه تاریخ
        if ($dateFrom = $request->input('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay());
        }
        if ($dateTo = $request->input('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay());
        }

        $transactions = $query->latest()->paginate(20)->withQueryString();
        $transactions->through(fn($t) => $this->mapTransaction($t));

        return Inertia::render('Customer/Wallet/Transactions', [
            'transactions' => $transactions,
            'filters' => [
                'type'      => $request->input('type', ''),
                'direction' => $request->input('direction', ''),
                'status'    => $request->input('status', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to'   => $request->input('date_to', ''),
            ],
        ]);
    }

    /**
     * لیست پرداختها
     */
    public function payments(Request $request)
    {
        $user = auth()->user();

        $query = Booking::where('user_id', $user->id)
            ->whereHas('payment')
            ->with([
                'payment',
                'barber:id,name,avatar',
                'service:id,name',
            ]);

        // ============ فیلتر وضعیت ============
        if ($status = $request->input('status')) {
            $query->whereHas('payment', fn($q) => $q->where('status', $status));
        }

        // ============ فیلتر تاریخ ============
        if ($dateFrom = $request->input('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay());
        }
        if ($dateTo = $request->input('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay());
        }

        // ============ جستجو ============
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                // جستجو در نام آرایشگر
                $q->whereHas('barber', function ($bq) use ($search) {
                    $bq->where('name', 'like', "%{$search}%");
                })
                    // یا جستجو در نام خدمت
                    ->orWhereHas('service', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%");
                    })
                    // یا جستجو در شماره تراکنش
                    ->orWhereHas('payment', function ($pq) use ($search) {
                        $pq->where('transaction_id', 'like', "%{$search}%");
                    })
                    ->orWhereHas('payment', function ($pq) use ($search) {
                        $pq->where('status', 'like', "%{$search}%");
                    });
            });
        }

        $payments = $query->latest()->paginate(20)->withQueryString();

        $payments->through(fn($booking) => [
            'id'         => $booking->id,
            'amount'     => (float) $booking->amount,
            'status'     => $booking->status->value,
            'created_at' => $booking->created_at,
            'barber'     => $booking->barber ? [
                'id'        => $booking->barber->id,
                'name'      => $booking->barber->name,
                'thumbnail' => $booking->barber->avatar(),
            ] : null,
            'service' => $booking->service ? [
                'id'   => $booking->service->id,
                'name' => $booking->service->name,
            ] : null,
            'payment' => $booking->payment ? [
                'gateway'        => $booking->payment->gateway,
                'status'         => $booking->payment->status,
                'paid_at'        => $booking->payment->paid_at,
                'transaction_id' => $booking->payment->transaction_id,
            ] : null,
        ]);

        return Inertia::render('Customer/Wallet/Payments', [
            'payments' => $payments,
            'filters' => [
                'status'    => $request->input('status', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to'   => $request->input('date_to', ''),
                'search'    => $request->input('search', ''),
            ],
        ]);
    }

    /**
     * درخواست برداشت
     */
    public function requestWithdrawal(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:50000',
        ], [
            'amount.required' => 'لطفاً مبلغ برداشت را وارد کنید.',
            'amount.min'      => 'حداقل مبلغ برداشت ۵۰,۰۰۰ تومان است.',
        ]);

        $user = auth()->user();
        $wallet = $user->getOrCreateWallet();

        if ($wallet->available_balance < $validated['amount']) {
            return back()->with('error', 'موجودی قابل برداشت کافی نیست.');
        }

        if (empty($user->card_number) && empty($user->sheba_number)) {
            return back()->with('error', 'لطفاً ابتدا اطلاعات بانکی خود را تکمیل کنید.');
        }

        $hasActiveSettlement = Settlement::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'processing'])
            ->exists();

        if ($hasActiveSettlement) {
            return back()->with('error', 'شما یک درخواست برداشت فعال دارید.');
        }

        Settlement::create([
            'user_id'             => $user->id,
            'type'                => 'customer_refund',
            'amount'              => $validated['amount'],
            'status'              => 'pending',
            'bank_name'           => $user->bank_name,
            'account_holder_name' => $user->account_holder_name,
            'card_number'         => $user->card_number,
            'sheba_number'        => $user->sheba_number,
            'requested_at'        => now(),
            'requested_by'        => $user->id,
        ]);

        return back()->with('success', 'درخواست برداشت ثبت شد.');
    }

    // ============================================
    // متدهای کمکی
    // ============================================

    private function getDailyPayments(int $userId, Carbon $startDate): array
    {
        $data = Booking::where('user_id', $userId)
            ->whereHas('payment', fn($q) => $q->where('status', 'success'))
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $result = [];
        $current = $startDate->copy();
        $end = now();

        while ($current->lte($end)) {
            $dateStr = $current->format('Y-m-d');
            $dayData = $data->firstWhere('date', $dateStr);
            $result[] = [
                'date'  => $dateStr,
                'total' => $dayData ? (float) $dayData->total : 0,
            ];
            $current->addDay();
        }

        return $result;
    }

    private function mapTransaction(WalletTransaction $t): array
    {
        return [
            'id'             => $t->id,
            'type'           => $t->type->value,
            'type_label'     => $t->type->label(),
            'direction'      => $t->direction->value,
            'direction_label' => $t->direction->label(),
            'amount'         => (float) $t->amount,
            'balance_before' => (float) $t->balance_before,
            'balance_after'  => (float) $t->balance_after,
            'status'         => $t->status->value,
            'status_label'   => $t->status->label(),
            'description'    => $t->description,
            'created_at'     => $t->created_at,
        ];
    }

    private function mapSettlement(Settlement $s): array
    {
        return [
            'id'             => $s->id,
            'amount'         => (float) $s->amount,
            'status'         => $s->status->value,
            'status_label'   => $s->status->label(),
            'bank_name'      => $s->bank_name,
            'card_number'    => $s->card_number ? substr($s->card_number, -4) : null,
            'requested_at'   => $s->requested_at,
            'completed_at'   => $s->completed_at,
            'failure_reason' => $s->failure_reason,
        ];
    }
}
