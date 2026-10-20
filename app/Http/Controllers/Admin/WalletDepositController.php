<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletDeposit;
use App\Models\WalletTransaction;
use App\Enums\Casts\WalletDepositStatus;
use App\Enums\Casts\WalletTransactionDirection;
use App\Enums\Casts\WalletTransactionStatus;
use App\Enums\Casts\WalletTransactionType;
use App\Exceptions\WalletException;
use App\Services\WalletDepositService;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WalletDepositController extends Controller
{
    public function index(Request $request)
    {
        $query = WalletDeposit::with([
            'user:id,name,avatar,phone,slug',
            'user.roles',
            'wallet:id,balance',
        ]);

        // ============ فیلترها ============
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($gateway = $request->input('gateway')) {
            $query->where('gateway', $gateway);
        }

        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
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
                    ->orWhere('tracking_code', 'like', "%{$search}%")
                    ->orWhere('gateway_transaction_id', 'like', "%{$search}%")
                    ->orWhere('gateway_authority', 'like', "%{$search}%")
                    ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%"));
            });
        }

        $deposits = $query->latest()->paginate(33)->withQueryString();

        $deposits->through(fn($d) => $this->mapDeposit($d));

        // ============ آمار ============
        $stats = $this->buildStats($request);

        // ============ آپشن‌ها ============
        // $users = User::query()
        //     ->select('id', 'name', 'phone', 'avatar')
        //     ->orderBy('name')
        //     ->limit(5)
        //     ->get();
        return Inertia::render('Admin/Finance/WalletDeposits/Index', [
            'deposits' => $deposits,
            'stats'    => $stats,
            'filters'  => [
                'status'     => $request->input('status', ''),
                'gateway'    => $request->input('gateway', ''),
                'user_id'    => $request->input('user_id', ''),
                'date_from'  => $request->input('date_from', ''),
                'date_to'    => $request->input('date_to', ''),
                'min_amount' => $request->input('min_amount', ''),
                'max_amount' => $request->input('max_amount', ''),
                'search'     => $request->input('search', ''),
            ],
            'statuses' => collect(WalletDepositStatus::cases())
                ->map(fn($s) => ['value' => $s->value, 'label' => $s->label()])
                ->values(),
            'gateways' => [
                ['value' => 'zarinpal', 'label' => 'زرین‌پال'],
                ['value' => 'idpay',    'label' => 'آیدی‌پی'],
                ['value' => 'payping',  'label' => 'پی‌پینگ'],
                ['value' => 'nextpay',  'label' => 'نکست‌پی'],
                ['value' => 'manual',   'label' => 'دستی (ادمین)'],
            ],
            'userOptions' => SearchController::getInitialUsersOptions(5),
        ]);
    }


    // ============ شارژ دستی توسط ادمین ============
    public function store(Request $request, WalletDepositService $depositService)
    {
        $validated = $request->validate([
            'user_id'     => 'required|exists:users,id',
            'amount'      => 'required|numeric|min:1000|max:500000000',
            'description' => 'nullable|string|max:500',
        ], [
            'user_id.required' => 'انتخاب کاربر الزامی است.',
            'amount.required'  => 'مبلغ الزامی است.',
            'amount.min'       => 'حداقل مبلغ ۱,۰۰۰ تومان است.',
            'amount.max'       => 'حداکثر مبلغ ۵۰۰,۰۰۰,۰۰۰ تومان است.',
        ]);

        try {
            $user = User::findOrFail($validated['user_id']);

            $deposit = $depositService->confirmManual(
                user: $user,
                amount: (float) $validated['amount'],
                description: $validated['description'] ?? null,
                adminId: auth()->id(),
            );
            StickyAlert::toast("شارژ کیف پول با موفقیت انجام شد. کد پیگیری: {$deposit->tracking_code}", 'success');
            return redirect()->back();
        } catch (WalletException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Exception $e) {
            Log::error('Manual deposit failed', [
                'user_id'  => $validated['user_id'] ?? null,
                'amount'   => $validated['amount'] ?? null,
                'admin_id' => auth()->id(),
                'error'    => $e->getMessage(),
                'trace'    => $e->getTraceAsString(),
            ]);
            StickyAlert::alert('خطا در انجام شارژ. لطفاً دوباره تلاش کنید.', 'error');
            return redirect()->back();
        }
    }

    private function mapDeposit(WalletDeposit $d): array
    {
        return [
            'id'          => $d->id,
            'amount'      => (float) $d->amount,
            'paid_amount' => (float) $d->paid_amount,
            'status'      => $d->status?->value,
            'status_label' => $d->status?->label() ?? $d->status?->value,
            'gateway'     => $d->gateway,
            'gateway_authority'      => $d->gateway_authority,
            'gateway_transaction_id' => $d->gateway_transaction_id,
            'gateway_reference'      => $d->gateway_reference,
            'tracking_code'          => $d->tracking_code,
            'paid_at'     => $d->paid_at?->toIso8601String(),
            'failed_at'   => $d->failed_at?->toIso8601String(),
            'expires_at'  => $d->expires_at?->toIso8601String(),
            'failure_reason' => $d->failure_reason,
            'created_at'  => $d->created_at?->toIso8601String(),

            'user' => $d->user ? [
                'id'            => $d->user->id,
                'name'          => $d->user->name,
                'avatar'        => $d->user->avatar,
                'phone'         => $d->user->phone,
                'profile_url'   => $d->user->adminProfileUrl(),
                'profile_label' => $d->user->primaryRoleLabel(),
            ] : null,
        ];
    }

    private function buildStats(Request $request): array
    {
        $base = WalletDeposit::query();

        if ($dateFrom = $request->input('date_from')) {
            $base->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $base->whereDate('created_at', '<=', $dateTo);
        }
        if ($userId = $request->input('user_id')) {
            $base->where('user_id', $userId);
        }
        if ($gateway = $request->input('gateway')) {
            $base->where('gateway', $gateway);
        }

        $totalCount = (clone $base)->count();
        $paidCount = (clone $base)->where('status', WalletDepositStatus::paid->value)->count();
        $pendingCount = (clone $base)->where('status', WalletDepositStatus::pending->value)->count();
        $failedCount = (clone $base)->where('status', WalletDepositStatus::failed->value)->count();
        $expiredCount = (clone $base)->where('status', WalletDepositStatus::expired->value)->count();

        $totalPaidAmount = (float) (clone $base)->where('status', WalletDepositStatus::paid->value)->sum('paid_amount');
        $todayPaidAmount = (float) (clone $base)
            ->where('status', WalletDepositStatus::paid->value)
            ->whereDate('paid_at', today())
            ->sum('paid_amount');
        $todayPaidCount = (clone $base)
            ->where('status', WalletDepositStatus::paid->value)
            ->whereDate('paid_at', today())
            ->count();

        $avgAmount = $paidCount > 0 ? $totalPaidAmount / $paidCount : 0;

        $gatewayBreakdown = (clone $base)
            ->where('status', WalletDepositStatus::paid->value)
            ->selectRaw('gateway, COUNT(*) as count, COALESCE(SUM(paid_amount), 0) as total')
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
                    'manual'   => 'دستی (ادمین)',
                ][$row->gateway] ?? $row->gateway ?? 'نامشخص',
                'value' => (float) $row->total,
                'count' => (int) $row->count,
            ])
            ->toArray();

        return [
            'total_count'       => $totalCount,
            'paid_count'        => $paidCount,
            'pending_count'     => $pendingCount,
            'failed_count'      => $failedCount,
            'expired_count'     => $expiredCount,
            'total_paid_amount' => $totalPaidAmount,
            'today_paid_amount' => $todayPaidAmount,
            'today_paid_count'  => $todayPaidCount,
            'avg_amount'        => (float) $avgAmount,
            'success_rate'      => $totalCount > 0
                ? round(($paidCount / $totalCount) * 100, 1)
                : 0,
            'gateway_breakdown' => $gatewayBreakdown,
        ];
    }
}
