<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\SettlementStatus;
use App\Enums\Casts\WalletDepositStatus;
use App\Enums\Casts\WalletTransactionStatus;
use App\Enums\Casts\WalletTransactionType;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Settlement;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletDeposit;
use App\Models\WalletTransaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FinanceController extends Controller
{
    /**
     * داشبورد مالی
     */
    public function index(Request $request)
    {
        $period = $request->input('period', '30');
        $startDate = $this->getStartDate($period);

        // ============ آمار کلی سیستم ============
        $stats = [
            // مجموع موجودی همه کیف پولها
            'total_balance' => (float) Wallet::sum('balance'),

            // مجموع مبالغ قفلشده
            'total_locked' => (float) Wallet::sum('locked_balance'),

            // مجموع درآمد پلتفرم (کمیسیون)
            'total_revenue' => (float) WalletTransaction::where('type', WalletTransactionType::commission->value)
                ->where('status', WalletTransactionStatus::completed->value)
                ->sum('amount'),

            // درآمد این دوره
            'period_revenue' => (float) WalletTransaction::where('type', WalletTransactionType::commission->value)
                ->where('status', WalletTransactionStatus::completed->value)
                ->where('created_at', '>=', $startDate)
                ->sum('amount'),

            // مجموع شارژها
            'total_deposits' => (float) WalletDeposit::where('status', WalletDepositStatus::paid->value)
                ->sum('amount'),

            // مجموع تسویهها
            'total_settlements' => (float) Settlement::where('status', SettlementStatus::completed->value)
                ->sum('amount'),

            // تسویههای در انتظار
            'pending_settlements' => Settlement::whereIn('status', [
                SettlementStatus::pending->value,
                SettlementStatus::processing->value,
            ])->count(),

            // مبلغ تسویههای در انتظار
            'pending_settlements_amount' => (float) Settlement::whereIn('status', [
                SettlementStatus::pending->value,
                SettlementStatus::processing->value,
            ])->sum('amount'),

            // مجموع جریمهها
            'total_penalties' => (float) WalletTransaction::where('type', WalletTransactionType::penalty->value)
                ->where('status', WalletTransactionStatus::completed->value)
                ->sum('amount'),

            // تعداد کاربران فعال
            'active_users' => User::where('is_active', true)->count(),
        ];

        // ============ نمودار درآمد روزانه ============
        $dailyRevenue = $this->getDailyRevenue($startDate);

        // ============ نمودار شارژ vs تسویه ============
        $dailyDeposits = $this->getDailyDeposits($startDate);
        $dailySettlements = $this->getDailySettlements($startDate);

        // ============ تفکیک درآمد ============
        $revenueByType = WalletTransaction::whereIn('type', [
            WalletTransactionType::commission->value,
            WalletTransactionType::penalty->value,
        ])
            ->where('status', WalletTransactionStatus::completed->value)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('type, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                $typeValue = $item->type instanceof WalletTransactionType
                    ? $item->type->value
                    : (string) $item->type;

                $typeEnum = WalletTransactionType::tryFrom($typeValue);

                return [
                    'type'       => $typeValue,
                    'type_label' => $typeEnum?->label() ?? $typeValue,
                    'total'      => (float) $item->total,
                    'count'      => (int) $item->count,
                ];
            });

        // ============ آخرین تسویهها ============
        $recentSettlements = Settlement::with(['user:id,name,avatar,phone'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($s) => $this->mapSettlement($s));

        // ============ آخرین تراکنشها ============
        $recentTransactions = WalletTransaction::with(['user:id,name'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn($t) => $this->mapTransaction($t));

        return Inertia::render('Admin/Finance/Index', [
            'stats'              => $stats,
            'dailyRevenue'       => $dailyRevenue,
            'dailyDeposits'      => $dailyDeposits,
            'dailySettlements'   => $dailySettlements,
            'revenueByType'      => $revenueByType,
            'recentSettlements'  => $recentSettlements,
            'recentTransactions' => $recentTransactions,
            'filters' => [
                'period' => $period,
            ],
        ]);
    }

    /**
     * لیست تسویهها
     */
    public function settlements(Request $request)
    {
        $query = Settlement::with(['user:id,name,avatar,phone', 'processedBy:id,name']);

        // فیلتر وضعیت
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // فیلتر نوع
        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        // فیلتر تاریخ
        if ($dateFrom = $request->input('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay());
        }
        if ($dateTo = $request->input('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay());
        }

        // جستجو
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhere('bank_reference', 'like', "%{$search}%")
                    ->orWhere('card_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        $settlements = $query->latest()->paginate(20)->withQueryString();
        $settlements->through(fn($s) => $this->mapSettlement($s, detailed: true));

        // آمار
        $stats = [
            'total' => Settlement::count(),
            'pending' => Settlement::where('status', SettlementStatus::pending->value)->count(),
            'processing' => Settlement::where('status', SettlementStatus::processing->value)->count(),
            'completed' => Settlement::where('status', SettlementStatus::completed->value)->count(),
            'failed' => Settlement::where('status', SettlementStatus::failed->value)->count(),
            'pending_amount' => (float) Settlement::whereIn('status', [
                SettlementStatus::pending->value,
                SettlementStatus::processing->value,
            ])->sum('amount'),
        ];

        return Inertia::render('Admin/Finance/Settlements/Index', [
            'settlements' => $settlements,
            'stats' => $stats,
            'filters' => [
                'status'    => $request->input('status', ''),
                'type'      => $request->input('type', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to'   => $request->input('date_to', ''),
                'search'    => $request->input('search', ''),
            ],
        ]);
    }

    /**
     * جزئیات تسویه
     */
    public function showSettlement(Settlement $settlement)
    {
        $settlement->load(['user', 'processedBy', 'requestedBy', 'walletTransactions']);

        return Inertia::render('Admin/Finance/Settlements/Show', [
            'settlement' => $this->mapSettlement($settlement, detailed: true, full: true),
        ]);
    }

    /**
     * لیست تراکنشهای کاربران
     */
    public function transactions(Request $request)
    {
        $query = WalletTransaction::with(['user:id,name,avatar,phone']);

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

        // فیلتر کاربر
        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        // فیلتر تاریخ
        if ($dateFrom = $request->input('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay());
        }
        if ($dateTo = $request->input('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay());
        }

        // جستجو
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        $transactions = $query->latest()->paginate(20)->withQueryString();
        $transactions->through(fn($t) => $this->mapTransaction($t, detailed: true));

        // آمار
        $stats = [
            'total_credit' => (float) WalletTransaction::where('direction', 'credit')->sum('amount'),
            'total_debit'  => (float) WalletTransaction::where('direction', 'debit')->sum('amount'),
            'total_count'  => WalletTransaction::count(),
        ];

        return Inertia::render('Admin/Finance/Transactions/Index', [
            'transactions' => $transactions,
            'stats' => $stats,
            'filters' => [
                'type'      => $request->input('type', ''),
                'direction' => $request->input('direction', ''),
                'status'    => $request->input('status', ''),
                'user_id'   => $request->input('user_id', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to'   => $request->input('date_to', ''),
                'search'    => $request->input('search', ''),
            ],
            'transactionTypes' => collect(WalletTransactionType::cases())
                ->map(fn($t) => ['value' => $t->value, 'label' => $t->label()])
                ->values(),
        ]);
    }

    /**
     * لیست شارژهای کیف پول
     */
    public function deposits(Request $request)
    {
        $query = WalletDeposit::with(['user:id,name,avatar,phone']);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay());
        }
        if ($dateTo = $request->input('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay());
        }

        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhere('tracking_code', 'like', "%{$search}%")
                    ->orWhere('gateway_authority', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        $deposits = $query->latest()->paginate(20)->withQueryString();
        $deposits->through(fn($d) => $this->mapDeposit($d));

        $stats = [
            'total_amount' => (float) WalletDeposit::where('status', WalletDepositStatus::paid->value)->sum('amount'),
            'total_count'  => WalletDeposit::where('status', WalletDepositStatus::paid->value)->count(),
            'pending'      => WalletDeposit::where('status', WalletDepositStatus::pending->value)->count(),
            'failed'       => WalletDeposit::where('status', WalletDepositStatus::failed->value)->count(),
        ];

        return Inertia::render('Admin/Finance/Deposits/Index', [
            'deposits' => $deposits,
            'stats' => $stats,
            'filters' => [
                'status'    => $request->input('status', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to'   => $request->input('date_to', ''),
                'search'    => $request->input('search', ''),
            ],
        ]);
    }

    /**
     * گزارش درآمد پلتفرم
     */


    public function revenue(Request $request)
    {
        $period = $request->input('period', '30');
        $startDate = $this->getStartDate($period);

        // درآمد بر اساس نوع
        $revenueByType = WalletTransaction::whereIn('type', [
            WalletTransactionType::commission->value,
            WalletTransactionType::penalty->value,
        ])
            ->where('status', WalletTransactionStatus::completed->value)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('type, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                $typeValue = $item->type instanceof WalletTransactionType
                    ? $item->type->value
                    : (string) $item->type;

                $typeEnum = WalletTransactionType::tryFrom($typeValue);

                return [
                    'type'       => $typeValue,
                    'type_label' => $typeEnum?->label() ?? $typeValue,
                    'total'      => (float) $item->total,
                    'count'      => (int) $item->count,
                ];
            });

        $dailyRevenue = $this->getDailyRevenue($startDate);

        // درآمد بر اساس کاربر
        $revenueByUser = WalletTransaction::where('type', WalletTransactionType::commission->value)
            ->where('status', WalletTransactionStatus::completed->value)
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('user_id')
            ->with('user:id,name,avatar')
            ->selectRaw('user_id, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('user_id')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn($item) => [
                'user_id' => $item->user_id,
                'user'    => $item->user ? [
                    'id'        => $item->user->id,
                    'name'      => $item->user->name,
                    'thumbnail' => $item->user->avatar(),
                ] : null,
                'total'   => (float) $item->total,
                'count'   => (int) $item->count,
            ]);

        // آمار
        $totalRevenue = $revenueByType->sum('total');
        $stats = [
            'revenue_growth' => $this->calculateGrowth($startDate),
        ];

        return Inertia::render('Admin/Finance/Revenue/Index', [
            'revenueByType' => $revenueByType,
            'dailyRevenue'  => $dailyRevenue,
            'revenueByUser' => $revenueByUser,
            'stats'         => $stats,
            'filters' => [
                'period' => $period,
            ],
        ]);
    }

    /**
     * محاسبه رشد نسبت به دوره قبل
     */
    private function calculateGrowth(Carbon $startDate): float
    {
        $periodDays = $startDate->diffInDays(now());

        $currentRevenue = WalletTransaction::whereIn('type', [
            WalletTransactionType::commission->value,
            WalletTransactionType::penalty->value,
        ])
            ->where('status', WalletTransactionStatus::completed->value)
            ->where('created_at', '>=', $startDate)
            ->sum('amount');

        $previousStart = $startDate->copy()->subDays($periodDays);
        $previousRevenue = WalletTransaction::whereIn('type', [
            WalletTransactionType::commission->value,
            WalletTransactionType::penalty->value,
        ])
            ->where('status', WalletTransactionStatus::completed->value)
            ->whereBetween('created_at', [$previousStart, $startDate])
            ->sum('amount');

        if ($previousRevenue == 0) {
            return $currentRevenue > 0 ? 100 : 0;
        }

        return round((($currentRevenue - $previousRevenue) / $previousRevenue) * 100, 1);
    }

    // ============================================
    // متدهای کمکی
    // ============================================

    private function getStartDate(string $period): Carbon
    {
        return match ($period) {
            '7'   => now()->subDays(7),
            '30'  => now()->subDays(30),
            '90'  => now()->subDays(90),
            '365' => now()->subYear(),
            default => now()->subDays(30),
        };
    }

    private function getDailyRevenue(Carbon $startDate): array
    {
        $data = WalletTransaction::whereIn('type', [
            WalletTransactionType::commission->value,
            WalletTransactionType::penalty->value,
        ])
            ->where('status', WalletTransactionStatus::completed->value)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $this->fillDailyData($data, $startDate);
    }

    private function getDailyDeposits(Carbon $startDate): array
    {
        $data = WalletDeposit::where('status', WalletDepositStatus::paid->value)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $this->fillDailyData($data, $startDate);
    }

    private function getDailySettlements(Carbon $startDate): array
    {
        $data = Settlement::where('status', SettlementStatus::completed->value)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $this->fillDailyData($data, $startDate);
    }

    private function fillDailyData($data, Carbon $startDate): array
    {
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

    private function mapSettlement(Settlement $s, bool $detailed = false, bool $full = false): array
    {
        $data = [
            'id'             => $s->id,
            'amount'         => (float) $s->amount,
            'type'           => $s->type->value,
            'type_label'     => $s->type->label(),
            'status'         => $s->status->value,
            'status_label'   => $s->status->label(),
            'bank_name'      => $s->bank_name,
            'card_number'    => $s->card_number,
            'sheba_number'   => $s->sheba_number,
            'bank_reference' => $s->bank_reference,
            'failure_reason' => $s->failure_reason,
            'requested_at'   => $s->requested_at,
            'processed_at'   => $s->processed_at,
            'completed_at'   => $s->completed_at,
            'failed_at'      => $s->failed_at,
            'created_at'     => $s->created_at,
            'user' => $s->user ? [
                'id'        => $s->user->id,
                'name'      => $s->user->name,
                'phone'     => $s->user->phone,
                'thumbnail' => $s->user->avatarUrl(),
            ] : null,
        ];

        if ($detailed) {
            $data['account_holder_name'] = $s->account_holder_name;
            $data['notes'] = $s->notes;
        }

        if ($full) {
            $data['processed_by'] = $s->processedBy ? [
                'id'   => $s->processedBy->id,
                'name' => $s->processedBy->name,
            ] : null;
            $data['requested_by'] = $s->requestedBy ? [
                'id'   => $s->requestedBy->id,
                'name' => $s->requestedBy->name,
            ] : null;
        }

        return $data;
    }

    private function mapTransaction(WalletTransaction $t, bool $detailed = false): array
    {
        $data = [
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
            'user' => $t->user ? [
                'id'        => $t->user->id,
                'name'      => $t->user->name,
                'thumbnail' => $t->user->avatarUrl(),
            ] : null,
        ];

        if ($detailed) {
            $data['reference_type'] = $t->reference_type;
            $data['reference_id'] = $t->reference_id;
            $data['is_locked'] = (bool) $t->is_locked;
            $data['released_at'] = $t->released_at;
        }

        return $data;
    }

    private function mapDeposit(WalletDeposit $d): array
    {
        return [
            'id'             => $d->id,
            'amount'         => (float) $d->amount,
            'paid_amount'    => (float) $d->paid_amount,
            'status'         => $d->status->value,
            'status_label'   => $d->status->label(),
            'gateway'        => $d->gateway,
            'tracking_code'  => $d->tracking_code,
            'paid_at'        => $d->paid_at,
            'created_at'     => $d->created_at,
            'failure_reason' => $d->failure_reason,
            'user' => $d->user ? [
                'id'        => $d->user->id,
                'name'      => $d->user->name,
                'phone'     => $d->user->phone,
                'thumbnail' => $d->user->avatarUrl(),
            ] : null,
        ];
    }
}
