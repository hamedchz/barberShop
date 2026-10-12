<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\SettlementStatus;
use App\Enums\Casts\SettlementType;
use App\Enums\Casts\WalletTransactionStatus;
use App\Enums\Casts\WalletTransactionType;
use App\Http\Controllers\Controller;
use App\Models\Settlement;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\SettlementService;
use App\Services\WalletService;
use App\Supports\StickyAlert;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SettlementController extends Controller
{
    public function __construct(
        private SettlementService $settlementService,
        private WalletService $walletService
    ) {}

    /**
     * لیست تسویهها
     */
    public function index(Request $request)
    {
        $query = Settlement::with([
            'user:id,name,avatar,phone',
            'processedBy:id,name,avatar',
            'requestedBy:id,name',
        ]);

        // ============ فیلتر وضعیت ============
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // ============ فیلتر نوع ============
        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        // ============ فیلتر تاریخ ============
        if ($dateFrom = $request->input('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay());
        }
        if ($dateTo = $request->input('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay());
        }

        // ============ فیلتر مبلغ ============
        if ($minAmount = $request->input('min_amount')) {
            $query->where('amount', '>=', $minAmount);
        }
        if ($maxAmount = $request->input('max_amount')) {
            $query->where('amount', '<=', $maxAmount);
        }

        // ============ فیلتر کاربر ============
        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        // ============ جستجو ============
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhere('bank_reference', 'like', "%{$search}%")
                    ->orWhere('card_number', 'like', "%{$search}%")
                    ->orWhere('sheba_number', 'like', "%{$search}%")
                    ->orWhere('account_holder_name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        // ============ مرتبسازی ============
        $sort = $request->input('sort', 'latest');
        match ($sort) {
            'oldest'      => $query->oldest(),
            'amount_high' => $query->orderByDesc('amount'),
            'amount_low'  => $query->orderBy('amount'),
            'priority'    => $query->orderByRaw("
                CASE status
                    WHEN 'pending' THEN 1
                    WHEN 'processing' THEN 2
                    WHEN 'completed' THEN 3
                    ELSE 4
                END ASC
            ")->latest(),
            default => $query->latest(),
        };

        $settlements = $query->paginate(20)->withQueryString();
        $settlements->through(fn($s) => $this->mapSettlement($s, detailed: true));

        // ============ آمار ============
        $stats = $this->getStats();

        return Inertia::render('Admin/Finance/Settlements/Index', [
            'settlements' => $settlements,
            'stats'       => $stats,
            'filters' => [
                'status'     => $request->input('status', ''),
                'type'       => $request->input('type', ''),
                'date_from'  => $request->input('date_from', ''),
                'date_to'    => $request->input('date_to', ''),
                'min_amount' => $request->input('min_amount', ''),
                'max_amount' => $request->input('max_amount', ''),
                'user_id'    => $request->input('user_id', ''),
                'search'     => $request->input('search', ''),
                'sort'       => $sort,
            ],
        ]);
    }

    /**
     * جزئیات تسویه
     */
    public function show(Settlement $settlement)
    {
        $settlement->load([
            'user:id,name,avatar,phone,slug',
            'processedBy:id,name,avatar',
            'requestedBy:id,name,avatar',
            'walletTransactions',
        ]);

        $wallet = $settlement->user?->getOrCreateWallet();

        // آمار کاربر
        $userStats = $settlement->user ? [
            'total_settlements' => Settlement::where('user_id', $settlement->user_id)
                ->where('status', SettlementStatus::completed->value)
                ->count(),
            'total_paid' => (float) Settlement::where('user_id', $settlement->user_id)
                ->where('status', SettlementStatus::completed->value)
                ->sum('amount'),
            'pending_settlements' => Settlement::where('user_id', $settlement->user_id)
                ->whereIn('status', [
                    SettlementStatus::pending->value,
                    SettlementStatus::processing->value,
                ])
                ->count(),
        ] : null;

        return Inertia::render('Admin/Finance/Settlements/Show', [
            'settlement' => $this->mapSettlement($settlement, detailed: true, full: true),
            'user' => $settlement->user ? [
                'id'        => $settlement->user->id,
                'name'      => $settlement->user->name,
                'phone'     => $settlement->user->phone,
                'thumbnail' => $settlement->user->avatarUrl(),
                'slug'      => $settlement->user->slug,
            ] : null,
            'wallet' => $wallet ? [
                'balance'        => (float) $wallet->balance,
                'locked_balance' => (float) $wallet->locked_balance,
                'available'      => $wallet->available_balance,
                'total_deposited' => (float) $wallet->total_deposited,
                'total_withdrawn' => (float) $wallet->total_withdrawn,
            ] : null,
            'userStats' => $userStats,
        ]);
    }

    /**
     * شروع پردازش تسویه
     */
    public function process(Request $request, Settlement $settlement)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        if (!$settlement->isPending()) {
            StickyAlert::alert('این تسویه قابل پردازش نیست.', 'error');
            return redirect()->back();
        }

        try {
            $this->settlementService->process(
                settlement: $settlement,
                notes: $validated['notes'] ?? null,
                admin: auth()->user(),
            );
            StickyAlert::toast('تسویه به حالت «در حال پردازش» تغییر یافت.', 'success');
            return redirect()->back();
        } catch (\Throwable $e) {
            Log::error('Settlement process failed', [
                'settlement_id' => $settlement->id,
                'error' => $e->getMessage(),
            ]);
            StickyAlert::alert('خطا در پردازش تسویه:' . $e->getMessage(), 'error');
            return redirect()->back();
        }
    }

    /**
     * تکمیل تسویه (واریز انجام شد)
     */
    public function complete(Request $request, Settlement $settlement)
    {
        // ✅ اینجا validate رو چک کن
        $validated = $request->validate([
            'bank_reference' => 'required|string|max:100',  // ← required
            'notes'          => 'nullable|string|max:1000',
        ], [
            'bank_reference.required' => 'لطفاً شماره پیگیری بانکی را وارد کنید.',
        ]);

        // ✅ اینجا دیگه bank_reference نمیتونه null باشه
        $this->settlementService->complete(
            settlement: $settlement,
            bankReference: trim($validated['bank_reference']),  // ← string
            notes: $validated['notes'] ?? null,
            admin: auth()->user(),
        );
        StickyAlert::alert('تسویه با موفقیت تکمیل شد.', 'success');
        return back();
        // لاگ + نوتیفیکیشن

    }

    /**
     * رد تسویه
     */
    public function reject(Request $request, Settlement $settlement)
    {
        $validated = $request->validate([
            'failure_reason' => 'required|string|max:1000',
        ], [
            'failure_reason.required' => 'لطفاً دلیل رد تسویه را وارد کنید.',
        ]);

        if (!$settlement->isPending() && !$settlement->isProcessing()) {
            StickyAlert::alert('این تسویه قابل رد کردن نیست', 'error');
            return redirect()->back();
        }

        try {
            $this->settlementService->fail(
                settlement: $settlement,
                reason: $validated['failure_reason'],
                admin: auth()->user(),
            );
            StickyAlert::alert('تسویه رد شد', 'success');
            return redirect()->back();
        } catch (\Throwable $e) {
            Log::error('Settlement reject failed', [
                'settlement_id' => $settlement->id,
                'error' => $e->getMessage(),
            ]);
            StickyAlert::alert('خطا در رد تسویه:' . $e->getMessage(), 'error');
            return redirect()->back();
        }
    }

    /**
     * لغو تسویه
     */
    public function cancel(Settlement $settlement)
    {
        if (!$settlement->isPending()) {
            StickyAlert::alert('فقط تسویه های در انتظار قابل لغو هستند', 'error');
            return redirect()->back();
        }

        try {
            $this->settlementService->cancel($settlement, auth()->user());
            StickyAlert::alert('تسویه لغو شد', 'success');
            return redirect()->back();
        } catch (\Throwable $e) {
            StickyAlert::alert('خطا در لغو تسویه: ' . $e->getMessage(), 'error');
            return redirect()->back();
        }
    }

    /**
     * پردازش دستهجمعی
     */
    public function bulkProcess(Request $request)
    {
        $validated = $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'required|integer|exists:settlements,id',
        ]);

        try {
            $count = $this->settlementService->bulkProcess(
                ids: $validated['ids'],
                admin: auth()->user(),
            );

            StickyAlert::alert("{$count} تسویه به حالت پردازش تغییر یافت.", 'success');
            return redirect()->back();
        } catch (\Throwable $e) {
            StickyAlert::alert('خطا در پردازش دسته جمعی: ' . $e->getMessage(), 'error');
            return redirect()->back();
        }
    }

    // ============================================
    // متدهای کمکی
    // ============================================

    private function getStats(): array
    {
        return [
            'total' => Settlement::count(),

            'pending' => Settlement::where('status', SettlementStatus::pending->value)->count(),
            'pending_amount' => (float) Settlement::where('status', SettlementStatus::pending->value)->sum('amount'),

            'processing' => Settlement::where('status', SettlementStatus::processing->value)->count(),
            'processing_amount' => (float) Settlement::where('status', SettlementStatus::processing->value)->sum('amount'),

            'completed' => Settlement::where('status', SettlementStatus::completed->value)->count(),
            'completed_amount' => (float) Settlement::where('status', SettlementStatus::completed->value)->sum('amount'),

            'failed' => Settlement::where('status', SettlementStatus::failed->value)->count(),
            'cancelled' => Settlement::where('status', SettlementStatus::cancelled->value)->count(),

            'today' => Settlement::whereDate('created_at', today())->count(),
            'today_amount' => (float) Settlement::whereDate('created_at', today())->sum('amount'),

            'total_paid' => (float) Settlement::where('status', SettlementStatus::completed->value)->sum('amount'),
        ];
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
            'notes'          => $s->notes,
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
            $data['account_number'] = $s->account_number;
            $data['gateway_reference'] = $s->gateway_reference;
            $data['processed_by'] = $s->processedBy ? [
                'id'        => $s->processedBy->id,
                'name'      => $s->processedBy->name,
                'thumbnail' => $s->processedBy->avatarUrl(),
            ] : null;
        }

        if ($full) {
            $data['requested_by'] = $s->requestedBy ? [
                'id'        => $s->requestedBy->id,
                'name'      => $s->requestedBy->name,
                'thumbnail' => $s->requestedBy->avatarUrl(),
            ] : null;

            $data['wallet_transactions'] = $s->walletTransactions->map(fn($t) => [
                'id'          => $t->id,
                'type'        => $t->type->value,
                'type_label'  => $t->type->label(),
                'amount'      => (float) $t->amount,
                'description' => $t->description,
                'created_at'  => $t->created_at,
            ]);
        }

        return $data;
    }
}
