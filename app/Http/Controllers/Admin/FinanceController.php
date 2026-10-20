<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\PaymentGateway;
use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\PaymentStatus;
use App\Enums\Casts\SettlementStatus;
use App\Enums\Casts\WalletDepositStatus;
use App\Enums\Casts\WalletTransactionDirection;
use App\Enums\Casts\WalletTransactionStatus;
use App\Enums\Casts\WalletTransactionType;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
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
        $recentTransactions = WalletTransaction::with(['user:id,name,slug'])
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
            'scopes' => ['finance']
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
            'scopes' => ['settlements']
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
            'scopes' => ['settlements']
        ]);
    }

    /**
     * لیست تراکنشهای کاربران
     */
    public function transactions(Request $request)
    {
        $query = WalletTransaction::with([
            'user:id,name,avatar,phone,slug',
            'wallet:id,balance',
            'reference',
            'settlement:id,amount,status,reference,created_at',
        ]);

        // ============ فیلترها ============
        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($direction = $request->input('direction')) {
            $query->where('direction', $direction);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay());
        }

        if ($dateTo = $request->input('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay());
        }

        // فیلتر قفل
        if ($request->filled('is_locked')) {
            $query->where('is_locked', (bool) $request->input('is_locked'));
        }

        // فیلتر تسویه
        if ($request->filled('is_settled')) {
            $query->where('is_settled', (bool) $request->input('is_settled'));
        }

        // فیلتر «فقط پرداخت درگاه» (مکمل)
        if ($request->input('filter') === 'gateway_only') {
            $query->where('reference_type', Payment::class);
        }

        // جستجو
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('reference_id', $search)
                    ->orWhere('settlement_reference', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        // ============ Pagination ============
        $transactions = $query->latest()->paginate(33)->withQueryString();
        $transactions->through(fn($t) => $this->mapTransaction($t, detailed: true));

        // ============ آمار (بر اساس فیلترهای فعلی) ============
        $stats = $this->buildStats($request);

        // ============ آپشن‌ها ============
        $users = User::query()
            ->select('id', 'name', 'phone')
            ->orderBy('name')
            ->limit(200)
            ->get();

        return Inertia::render('Admin/Finance/Transactions/Index', [
            'transactions'    => $transactions,
            'stats'           => $stats,
            'filters'         => [
                'type'       => $request->input('type', ''),
                'direction'  => $request->input('direction', ''),
                'status'     => $request->input('status', ''),
                'user_id'    => $request->input('user_id', ''),
                'date_from'  => $request->input('date_from', ''),
                'date_to'    => $request->input('date_to', ''),
                'is_locked'  => $request->input('is_locked', ''),
                'is_settled' => $request->input('is_settled', ''),
                'filter'     => $request->input('filter', ''),
                'search'     => $request->input('search', ''),
            ],
            'transactionTypes' => collect(WalletTransactionType::cases())
                ->map(fn($t) => ['value' => $t->value, 'label' => $t->label()])
                ->values(),
            'transactionDirections' => collect(WalletTransactionDirection::cases())
                ->map(fn($d) => [
                    'value' => $d->value,
                    'label' => $d->value === 'credit' ? 'واریز' : 'برداشت',
                ])
                ->values(),
            'transactionStatuses' => collect(WalletTransactionStatus::cases())
                ->map(fn($s) => [
                    'value' => $s->value,
                    'label' => $s->label() ?? $s->value,
                ])
                ->values(),
            'users'    => $users,
            'scopes'   => ['transactions'],
        ]);
    }

    // ============ آمار با احترام به فیلترها ============
    private function buildStats(Request $request): array
    {
        $base = WalletTransaction::query();

        // فیلترهای اصلی رو اعمال کن (به جز direction/status/search که آمار رو بی‌معنی می‌کنن)
        if ($type = $request->input('type')) {
            $base->where('type', $type);
        }
        if ($userId = $request->input('user_id')) {
            $base->where('user_id', $userId);
        }
        if ($dateFrom = $request->input('date_from')) {
            $base->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay());
        }
        if ($dateTo = $request->input('date_to')) {
            $base->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay());
        }
        if ($request->filled('is_locked')) {
            $base->where('is_locked', (bool) $request->input('is_locked'));
        }
        if ($request->filled('is_settled')) {
            $base->where('is_settled', (bool) $request->input('is_settled'));
        }
        $totals = (clone $base)->selectRaw('
        COALESCE(SUM(CASE WHEN direction = ? THEN amount ELSE 0 END), 0) as total_credit,
        COALESCE(SUM(CASE WHEN direction = ? THEN amount ELSE 0 END), 0) as total_debit,
        COUNT(*) as total_count
    ', [
            WalletTransactionDirection::credit->value,
            WalletTransactionDirection::debit->value,
        ])->first();

        $lockedAmount = (clone $base)->where('is_locked', true)->sum('amount');

        $gatewayTotal = Payment::query()
            ->where('status', PaymentStatus::success->value)
            ->when($request->input('date_from'), fn($q) => $q->whereDate('paid_at', '>=', $request->input('date_from')))
            ->when($request->input('date_to'), fn($q) => $q->whereDate('paid_at', '<=', $request->input('date_to')))
            ->sum('amount');

        $gatewayBreakdown = $this->buildGatewayBreakdown($request);

        return [
            'total_credit'        => (float) $totals->total_credit,
            'total_debit'         => (float) $totals->total_debit,
            'total_count'         => (int) $totals->total_count,
            'net_amount'          => (float) ($totals->total_credit - $totals->total_debit),
            'locked_amount'       => (float) $lockedAmount,
            'locked_count'        => (clone $base)->where('is_locked', true)->count(),
            'gateway_total'       => (float) $gatewayTotal,
            'gateway_count'       => Payment::query()
                ->where('status', PaymentStatus::success->value)
                ->when($request->input('date_from'), fn($q) => $q->whereDate('paid_at', '>=', $request->input('date_from')))
                ->when($request->input('date_to'), fn($q) => $q->whereDate('paid_at', '<=', $request->input('date_to')))
                ->count(),
            'unsettled_count'     => (clone $base)->where('is_settled', false)->count(),

            'credit_breakdown'  => $this->buildTypeBreakdown($request, $base, 'credit'),
            'debit_breakdown'   => $this->buildTypeBreakdown($request, $base, 'debit'),
            'settlement_total'    => (float) (clone $base)->where('direction', 'debit')->where('type', 'settlement')->sum('amount'),
            'settlement_count'    => (clone $base)->where('direction', 'debit')->where('type', 'settlement')->count(),
            'commission_total'    => (float) (clone $base)->where('direction', 'debit')->where('type', 'commission')->sum('amount'),
            'commission_count'    => (clone $base)->where('direction', 'debit')->where('type', 'commission')->count(),
            'refunds'             => (float) (clone $base)->where('type', 'refund')->sum('amount'),
            'refunds_count'       => (clone $base)->where('type', 'refund')->count(),
            'manual_deposits'     => (float) (clone $base)->where('type', 'deposit')->sum('amount'),
            'manual_deposits_count' => (clone $base)->where('type', 'deposit')->count(),
            'withdrawals'         => (float) (clone $base)->where('type', 'withdrawal')->sum('amount'),
            'withdrawals_count'   => (clone $base)->where('type', 'withdrawal')->count(),
            'released_amount'     => (float) (clone $base)->where('is_locked', false)->whereNotNull('released_at')->sum('amount'),
            'released_count'      => (clone $base)->where('is_locked', false)->whereNotNull('released_at')->count(),
            'settlements_pending' => Settlement::where('status', SettlementStatus::pending->value)->count(),
            'settlements_processing' => Settlement::where('status', SettlementStatus::processing->value)->count(),
            'settlements_pending_amount' => (float) Settlement::whereIn('status', [
                SettlementStatus::pending->value,
                SettlementStatus::processing->value,
            ])->sum('amount'),
        ];
    }
    /**
     * Breakdown داینامیک درگاه‌های پرداخت
     */
    private function buildGatewayBreakdown(Request $request): array
    {
        $gatewayLabels = [
            'zarinpal' => 'زرین‌پال',
            'idpay'    => 'آیدی‌پی',
            'payping'  => 'پی‌پینگ',
            'nextpay'  => 'نکست‌پی',
        ];

        $rows = Payment::query()
            ->where('status', PaymentStatus::success->value)
            ->when($request->input('date_from'), fn($q) => $q->whereDate('paid_at', '>=', $request->input('date_from')))
            ->when($request->input('date_to'), fn($q) => $q->whereDate('paid_at', '<=', $request->input('date_to')))
            ->selectRaw('gateway, COUNT(*) as count, COALESCE(SUM(amount), 0) as total')
            ->groupBy('gateway')
            ->orderByDesc('total')
            ->get();

        $items = $rows->map(fn($row) => [
            'key'   => $row->gateway,
            'label' => $gatewayLabels[$row->gateway] ?? $row->gateway ?? 'نامشخص',
            'value' => (float) $row->total,
            'count' => (int) $row->count,
        ])->toArray();

        return [
            'total' => (float) $rows->sum('total'),
            'count' => (int) $rows->sum('count'),
            'items' => $items,
        ];
    }

    private function buildTypeBreakdown(Request $request, $base, string $direction): array
    {
        $rows = (clone $base)
            ->where('direction', $direction)
            ->selectRaw('type, COUNT(*) as count, COALESCE(SUM(amount), 0) as total')
            ->groupBy('type')
            ->orderByDesc('total')
            ->get();

        return $rows->map(fn($row) => [
            'key'   => $row->type?->value,
            'label' => $row->type?->label() ?? 'نامشخص',
            'value' => (float) $row->total,
            'count' => (int) $row->count,
        ])->toArray();
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
            'scopes' => ['deposits']
        ]);
    }

    /**
     * گزارش درآمد پلتفرم
     */


    public function revenue(Request $request)
    {
        $period = $request->input('period', '30');
        $type = $request->input('type');
        $userId = $request->input('user_id');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $minAmount = $request->input('min_amount');
        $maxAmount = $request->input('max_amount');
        $search = trim($request->input('search', ''));

        // ============ تعیین بازه تاریخ ============
        if ($period === 'custom' && $dateFrom && $dateTo) {
            $startDate = Carbon::parse($dateFrom)->startOfDay();
            $endDate = Carbon::parse($dateTo)->endOfDay();
        } elseif ($period === 'today') {
            $startDate = now()->startOfDay();
            $endDate = now()->endOfDay();
        } elseif ($period === 'yesterday') {
            $startDate = now()->subDay()->startOfDay();
            $endDate = now()->subDay()->endOfDay();
        } else {
            $startDate = $this->getStartDate($period);
            $endDate = now();
        }

        // ============ بیس کوئری ============
        $baseQuery = WalletTransaction::query()
            ->whereIn('type', [
                WalletTransactionType::commission->value,
                WalletTransactionType::penalty->value,
            ])
            ->where('status', WalletTransactionStatus::completed->value)
            ->whereBetween('created_at', [$startDate, $endDate]);

        // فیلتر نوع
        if ($type) {
            $baseQuery->where('type', $type);
        }

        // فیلتر کاربر
        if ($userId) {
            $baseQuery->where('user_id', $userId);
        }

        // فیلتر مبلغ
        if ($minAmount) {
            $baseQuery->where('amount', '>=', $minAmount);
        }
        if ($maxAmount) {
            $baseQuery->where('amount', '<=', $maxAmount);
        }

        // جستجو
        if ($search) {
            $baseQuery->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        // ============ درآمد بر اساس نوع ============
        $revenueByType = (clone $baseQuery)
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

        // ============ نمودار روزانه ============
        $dailyRevenueData = (clone $baseQuery)
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $dailyRevenue = $this->fillDailyDataBetween($dailyRevenueData, $startDate, $endDate);

        // ============ درآمد بر اساس کاربر ============
        $revenueByUser = (clone $baseQuery)
            ->where('type', WalletTransactionType::commission->value)
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
                    'thumbnail' => $item->user->avatarUrl(),
                ] : null,
                'total'   => (float) $item->total,
                'count'   => (int) $item->count,
            ]);

        // ============ لیست آرایشگرها برای فیلتر ============
        $barbers = User::role('آرایشگر')
            ->select('id', 'name')
            ->orderBy('name')->take(5)
            ->get();

        // ============ آمار ============
        $stats = [
            'revenue_growth' => $this->calculateGrowthBetween($startDate, $endDate),
        ];


        //  مجموع کمیسیون
        $totalCommission = WalletTransaction::where('type', WalletTransactionType::commission->value)
            ->where('status', 'completed')
            ->where('created_at', '>=', $startDate)
            ->sum('amount');

        //  روزانه
        $dailyCommission = WalletTransaction::where('type', WalletTransactionType::commission->value)
            ->where('status', 'completed')
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        //  بر اساس آرایشگر
        $byBarber = WalletTransaction::where('type', WalletTransactionType::commission->value)
            ->where('status', 'completed')
            ->where('created_at', '>=', $startDate)
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
                    'thumbnail' => $item->user->avatarUrl(),
                ] : null,
                'total'   => (float) $item->total,
                'count'   => (int) $item->count,
            ]);

        return Inertia::render('Admin/Finance/Revenue/Index', [
            'totalCommission' => (float) $totalCommission,
            'dailyCommission' => $dailyCommission,
            'byBarber'        => $byBarber,
            'revenueByType' => $revenueByType,
            'dailyRevenue'  => $dailyRevenue,
            'revenueByUser' => $revenueByUser,
            'stats'         => $stats,
            'barbers'       => $barbers,
            'filters' => [
                'period'     => $period,
                'type'       => $type ?? '',
                'user_id'    => $userId ?? '',
                'date_from'  => $dateFrom ?? '',
                'date_to'    => $dateTo ?? '',
                'min_amount' => $minAmount ?? '',
                'max_amount' => $maxAmount ?? '',
                'search'     => $search,
            ],
            'scopes' => ['revenue']
        ]);
    }

    /**
     * پر کردن دادههای روزانه بین دو تاریخ
     */
    private function fillDailyDataBetween($data, Carbon $startDate, Carbon $endDate): array
    {
        $result = [];
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
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

    /**
     * محاسبه رشد نسبت به دوره قبل
     */
    private function calculateGrowthBetween(Carbon $startDate, Carbon $endDate): float
    {
        $periodDays = $startDate->diffInDays($endDate) + 1;

        $currentRevenue = WalletTransaction::whereIn('type', [
            WalletTransactionType::commission->value,
            WalletTransactionType::penalty->value,
        ])
            ->where('status', WalletTransactionStatus::completed->value)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        $previousStart = $startDate->copy()->subDays($periodDays);
        $previousEnd = $startDate->copy()->subSecond();

        $previousRevenue = WalletTransaction::whereIn('type', [
            WalletTransactionType::commission->value,
            WalletTransactionType::penalty->value,
        ])
            ->where('status', WalletTransactionStatus::completed->value)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
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
            'id'           => $t->id,
            'type'         => $t->type?->value,
            'type_label'   => $t->type?->label() ?? $t->type?->value,
            'direction'    => $t->direction?->value,
            'status'       => $t->status?->value,
            'status_label' => $t->status?->label() ?? $t->status?->value,
            'amount'         => (float) $t->amount,
            'balance_before' => (float) $t->balance_before,
            'balance_after'  => (float) $t->balance_after,
            'description'  => $t->description,
            'is_locked'    => (bool) $t->is_locked,
            'is_settled'   => (bool) $t->is_settled,
            'settled_at'   => $t->settled_at?->toIso8601String(),
            'created_at'   => $t->created_at?->toIso8601String(),

            'user' => $t->user ? [
                'id'            => $t->user->id,
                'name'          => $t->user->name,
                'avatar'        => $t->user->avatar,
                'phone'         => $t->user->phone,
                'roles'         => $t->user->getRoleNames()->toArray(),
                'primary_role'  => $t->user->primaryRole(),
                'profile_url'   => $t->user->adminProfileUrl(),
                'profile_label' => $t->user->primaryRoleLabel(),
            ] : null,
        ];

        if (!$detailed) {
            return $data;
        }

        $data['reference'] = $this->mapReference($t);
        $data['wallet_balance'] = $t->wallet ? (float) $t->wallet->balance : null;
        $data['settlement'] = $t->settlement ? [
            'id'     => $t->settlement->id,
            'amount' => (float) $t->settlement->amount,
            'status' => $t->settlement->status?->value,
        ] : null;

        return $data;
    }

    private function mapReference(WalletTransaction $t): ?array
    {
        if (!$t->reference_type || !$t->reference) {
            return null;
        }

        $ref = $t->reference;

        // Payment
        if ($ref instanceof Payment) {
            return [
                'kind'           => 'payment',
                'id'             => $ref->id,
                'gateway'        => $ref->gateway,
                'transaction_id' => $ref->transaction_id,
                'authority'      => $ref->authority,
                'amount'         => (float) $ref->amount,
                'status'         => $ref->status?->value,
                'paid_at'        => $ref->paid_at?->toIso8601String(),
                'booking_id'     => $ref->booking_id,
                'url'            => route('admin.payments.show', $ref->id),
            ];
        }

        // Settlement
        if ($ref instanceof Settlement) {
            return [
                'kind'   => 'settlement',
                'id'     => $ref->id,
                'amount' => (float) $ref->amount,
                'status' => $ref->status?->value,
                'url'    => route('admin.finance.settlements.show', $ref->id),
            ];
        }

        return [
            'kind' => class_basename($ref),
            'id'   => $ref->id,
        ];
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

    private function getUserProfileUrl(?User $user): ?string
    {
        if (!$user) return null;

        // اولویت: barber > customer > admin
        // (هر کدوم که مهم‌تره اول بیاد)

        if ($user->hasRole('آرایشگر')) {
            return "/admin/barbers/{$user->id}/detail";
        }

        if ($user->hasRole('مشتری')) {
            return "/admin/customers/show/{$user->id}";
        }

        if ($user->hasRole('admin')) {
            return "/admin/users/{$user->id}";
        }

        return null;
    }

    private function getUserProfileLabel(?User $user): string
    {
        if (!$user) return 'کاربر';

        if ($user->hasRole('barber')) {
            return 'آرایشگر';
        }

        if ($user->hasRole('customer')) {
            return 'مشتری';
        }

        if ($user->hasRole('admin')) {
            return 'ادمین';
        }

        return 'کاربر';
    }
    // private function getUserProfileLabel(?User $user): string
    // {
    //     if (!$user) return 'کاربر';

    //     return match ($user->role?->value) {
    //         'barber'   => 'آرایشگر',
    //         'customer' => 'مشتری',
    //         default    => 'کاربر',
    //     };
    // }
}
