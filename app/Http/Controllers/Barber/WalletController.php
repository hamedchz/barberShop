<?php

namespace App\Http\Controllers\Barber;

use App\Enums\Casts\SettlementStatus;
use App\Enums\Casts\WalletTransactionStatus;
use App\Enums\Casts\WalletTransactionType;
use App\Http\Controllers\Controller;
use App\Models\Settlement;
use App\Models\WalletTransaction;
use App\Supports\StickyAlert;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WalletController extends Controller
{
    /**
     * داشبورد مالی
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $wallet = $user->getOrCreateWallet();

        // ============ فیلتر تاریخ ============
        $period = $request->input('period', '30'); // 7, 30, 90, 365

        $startDate = match ($period) {
            '7'   => now()->subDays(7),
            '30'  => now()->subDays(30),
            '90'  => now()->subDays(90),
            '365' => now()->subYear(),
            default => now()->subDays(30),
        };

        // ============ آمار کلی ============
        $stats = [
            'balance'          => (float) $wallet->balance,
            'locked_balance'   => (float) $wallet->locked_balance,
            'available'        => $wallet->available_balance,
            'total_deposited'  => (float) $wallet->total_deposited,
            'total_withdrawn'  => (float) $wallet->total_withdrawn,

            // درآمد کل
            'total_earnings'   => (float) WalletTransaction::where('user_id', $user->id)
                ->where('type', WalletTransactionType::earning->value)
                ->where('status', WalletTransactionStatus::completed->value)
                ->sum('amount'),

            // درآمد این دوره
            'period_earnings'  => (float) WalletTransaction::where('user_id', $user->id)
                ->where('type', WalletTransactionType::earning->value)
                ->where('status', WalletTransactionStatus::completed->value)
                ->where('created_at', '>=', $startDate)
                ->sum('amount'),

            // جریمههای این دوره
            'period_penalties' => (float) WalletTransaction::where('user_id', $user->id)
                ->where('type', WalletTransactionType::penalty->value)
                ->where('created_at', '>=', $startDate)
                ->sum('amount'),

            // تعداد رزروهای تکمیلشده
            'completed_bookings' => $user->barberBookings()
                ->where('status', 'completed')
                ->where('completed_at', '>=', $startDate)
                ->count(),
        ];

        // ============ نمودار درآمد روزانه ============
        $dailyEarnings = $this->getDailyEarnings($user->id, $startDate);

        // ============ تفکیک درآمد بر اساس نوع ============
        $earningsByType = WalletTransaction::where('user_id', $user->id)
            ->where('direction', 'credit')
            ->where('status', WalletTransactionStatus::completed->value)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('type, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                $typeEnum = $item->type instanceof WalletTransactionType
                    ? $item->type
                    : WalletTransactionType::from($item->type);

                return [
                    'type'       => $typeEnum->value,
                    'type_label' => $typeEnum->label(),
                    'total'      => (float) $item->total,
                    'count'      => (int) $item->count,
                ];
            });




        // ============ آخرین تراکنشها ============
        $recentTransactions = WalletTransaction::where('user_id', $user->id)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($t) => $this->mapTransaction($t));

        // ============ درخواستهای برداشت ============
        $pendingSettlements = Settlement::where('user_id', $user->id)
            ->whereIn('status', [SettlementStatus::pending->value, SettlementStatus::processing->value])
            ->latest()
            ->get()
            ->map(fn($s) => $this->mapSettlement($s));

        // ============ اطلاعات بانکی ============
        $bankInfo = [
            'bank_name'           => $user->bank_name,
            'account_holder_name' => $user->account_holder_name,
            'card_number'         => $user->card_number,
            'sheba_number'        => $user->sheba_number,
            'has_bank_info'       => !empty($user->card_number) || !empty($user->sheba_number),
        ];

        return Inertia::render('Barber/Wallet/Index', [
            'wallet' => [
                'balance'          => (float) $wallet->balance,
                'locked_balance'   => (float) $wallet->locked_balance,
                'available'        => $wallet->available_balance,
                'currency'         => $wallet->currency ?? 'IRT',
                'is_active'        => $wallet->is_active,
            ],
            'stats'             => $stats,
            'dailyEarnings'     => $dailyEarnings,
            'earningsByType'    => $earningsByType,
            'recentTransactions' => $recentTransactions,
            'pendingSettlements' => $pendingSettlements,
            'bankInfo'          => $bankInfo,
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

        $query = WalletTransaction::where('user_id', $user->id)
            ->with(['reference']);

        // فیلتر نوع
        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        // فیلتر جهت
        if ($direction = $request->input('direction')) {
            $query->where('direction', $direction);
        }

        // فیلتر وضعیت
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // فیلتر تاریخ

        if ($dateTo = $request->input('date_to')) {
            // تاریخ تا رو تا پایان روز در نظر بگیر
            $query->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay());
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay());
        }

        // جستجو
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%");
            });
        }

        $transactions = $query->latest()->paginate(33)->withQueryString();

        $transactions->through(fn($t) => $this->mapTransaction($t));

        return Inertia::render('Barber/Wallet/Transactions', [
            'transactions' => $transactions,
            'filters' => [
                'type'      => $request->input('type', ''),
                'direction' => $request->input('direction', ''),
                'status'    => $request->input('status', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to'   => $request->input('date_to', ''),
                'search'    => $request->input('search', ''),
            ],
            'transactionTypes' => collect(WalletTransactionType::cases())
                ->map(fn($t) => ['value' => $t->value, 'label' => $t->label()]),
        ]);
    }

    /**
     * درخواست برداشت
     */
    public function requestWithdrawal(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:10000',
        ], [
            'amount.required' => 'لطفاً مبلغ برداشت را وارد کنید.',
            'amount.min'      => 'حداقل مبلغ برداشت ۱۰,۰۰۰ تومان است.',
        ]);

        $user = auth()->user();
        $wallet = $user->getOrCreateWallet();

        if (Settlement::hasActiveForUser($user->id)) {
            $active = Settlement::getActiveForUser($user->id);
            StickyAlert::alert(
                "شما یک درخواست برداشت فعال دارید (#{$active->id}) " .
                    "به مبلغ " . EnglishtoPersianNumber(number_format($active->amount)) . " تومان. " .
                    "لطفاً تا بررسی آن صبر کنید یا درخواست را لغو کنید.",

                'error'
            );
            return redirect()->back();
        }

        // بررسی موجودی
        if ($wallet->available_balance < $validated['amount']) {

            StickyAlert::alert(
                'موجودی قابل برداشت کافی نیست. موجودی فعلی: ' .
                    number_format($wallet->available_balance) . ' تومان',
                'error'
            );
            return redirect()->back();
        }

        // بررسی اطلاعات بانکی
        if (empty($user->card_number) && empty($user->sheba_number)) {
            StickyAlert::alert(
                'لطفاً ابتدا اطلاعات بانکی خود را تکمیل کنید.',
                'error'
            );
            return redirect()->back();
        }

        // بررسی درخواست فعال
        $hasActiveSettlement = Settlement::where('user_id', $user->id)
            ->whereIn('status', [SettlementStatus::pending->value, SettlementStatus::processing->value])
            ->exists();

        if ($hasActiveSettlement) {
            StickyAlert::alert(
                'شما یک درخواست برداشت فعال دارید. لطفاً تا بررسی آن صبر کنید.',
                'error'
            );
            return redirect()->back();
        }

        // ساخت درخواست
        Settlement::create([
            'user_id'             => $user->id,
            'type'                => 'barber_payout',
            'amount'              => $validated['amount'],
            'status'              => 'pending',
            'bank_name'           => $user->bank_name,
            'account_holder_name' => $user->account_holder_name,
            'card_number'         => $user->card_number,
            'sheba_number'        => $user->sheba_number,
            'requested_at'        => now(),
            'requested_by'        => $user->id,
        ]);
        StickyAlert::alert(
            'درخواست برداشت با موفقیت ثبت شد.',
            'success'
        );
        return redirect()->back();
    }

    /**
     * لیست درخواستهای برداشت
     */
    public function settlements(Request $request)
    {
        $user = auth()->user();
        $wallet = $user->getOrCreateWallet();
        $query = Settlement::where('user_id', $user->id);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $settlements = $query->latest()->paginate(33)->withQueryString();
        $settlements->through(fn($s) => $this->mapSettlement($s));

        $hasActiveSettlement = Settlement::hasActiveForUser($user->id);

        return Inertia::render('Barber/Wallet/Settlements', [
            'settlements' => $settlements,
            'has_active_settlement' => $hasActiveSettlement,
            'wallet' => [
                'balance'        => (float) $wallet->balance,
                'locked_balance' => (float) $wallet->locked_balance,
            ],
            'bankInfo' => [
                'bank_name'     => $user->bank_name,
                'card_number'   => $user->card_number,
                'has_bank_info' => !empty($user->card_number) || !empty($user->sheba_number),
            ],
            'filters' => [
                'status' => $request->input('status', ''),
            ],
        ]);
    }

    /**
     * ذخیره اطلاعات بانکی
     */
    public function updateBankInfo(Request $request)
    {
        $validated = $request->validate([
            'bank_name'           => 'required|string|max:100',
            'account_holder_name' => 'required|string|max:150',
            'card_number'         => 'nullable|string|size:16',
            'sheba_number'        => 'nullable|string|size:24',
        ]);

        auth()->user()->update($validated);

        return back()->with('success', 'اطلاعات بانکی با موفقیت ذخیره شد.');
    }



    // ============================================
    // متدهای کمکی
    // ============================================

    private function getDailyEarnings(int $userId, Carbon $startDate): array
    {
        $data = WalletTransaction::where('user_id', $userId)
            ->where('type', WalletTransactionType::earning->value)
            ->where('status', WalletTransactionStatus::completed->value)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // پر کردن روزهای خالی
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
            'reference_type' => $t->reference_type,
            'reference_id'   => $t->reference_id,
            'is_locked'      => (bool) $t->is_locked,
            'released_at'    => $t->released_at,
            'release_at'     => $t->metadata['release_at'] ?? null,
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
            'sheba_number'   => $s->sheba_number,
            'bank_reference' => $s->bank_reference,
            'notes'          => $s->notes,
            'failure_reason' => $s->failure_reason,
            'requested_at'   => $s->requested_at,
            'processed_at'   => $s->processed_at,
            'completed_at'   => $s->completed_at,
            'failed_at'      => $s->failed_at,
            'created_at'     => $s->created_at,
        ];
    }
}
