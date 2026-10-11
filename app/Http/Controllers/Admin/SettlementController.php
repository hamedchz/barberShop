<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\SettlementStatus;
use App\Http\Controllers\Controller;
use App\Models\Settlement;
use App\Services\SettlementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SettlementController extends Controller
{
    public function __construct(
        private SettlementService $settlementService,
    ) {}

    /**
     * تایید و پردازش تسویه
     */
    public function process(Request $request, Settlement $settlement)
    {
        $validated = $request->validate([
            'bank_reference' => 'required|string|max:100',
            'notes'          => 'nullable|string|max:1000',
        ], [
            'bank_reference.required' => 'لطفاً شماره پیگیری بانکی را وارد کنید.',
        ]);

        if (!$settlement->isPending()) {
            return back()->with('error', 'این تسویه قابل پردازش نیست.');
        }

        try {
            $this->settlementService->process(
                settlement: $settlement,
                bankReference: $validated['bank_reference'],
                notes: $validated['notes'] ?? null,
                admin: auth()->user(),
            );

            return back()->with('success', 'تسویه با موفقیت پردازش شد.');
        } catch (\Throwable $e) {
            return back()->with('error', 'خطا در پردازش تسویه: ' . $e->getMessage());
        }
    }

    /**
     * تکمیل تسویه
     */
    public function complete(Request $request, Settlement $settlement)
    {
        $validated = $request->validate([
            'bank_reference' => 'required|string|max:100',
        ]);

        if (!$settlement->isProcessing()) {
            return back()->with('error', 'این تسویه در وضعیت در حال پردازش نیست.');
        }

        try {
            $this->settlementService->complete(
                settlement: $settlement,
                bankReference: $validated['bank_reference'],
                admin: auth()->user(),
            );

            return back()->with('success', 'تسویه با موفقیت تکمیل شد.');
        } catch (\Throwable $e) {
            return back()->with('error', 'خطا در تکمیل تسویه: ' . $e->getMessage());
        }
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
            return back()->with('error', 'این تسویه قابل رد کردن نیست.');
        }

        try {
            $this->settlementService->fail(
                settlement: $settlement,
                reason: $validated['failure_reason'],
                admin: auth()->user(),
            );

            return back()->with('success', 'تسویه رد شد.');
        } catch (\Throwable $e) {
            return back()->with('error', 'خطا در رد تسویه: ' . $e->getMessage());
        }
    }

    /**
     * لغو تسویه
     */
    public function cancel(Settlement $settlement)
    {
        if (!$settlement->isPending()) {
            return back()->with('error', 'فقط تسویه‌های در انتظار قابل لغو هستند.');
        }

        try {
            $this->settlementService->cancel($settlement, auth()->user());
            return back()->with('success', 'تسویه لغو شد.');
        } catch (\Throwable $e) {
            return back()->with('error', 'خطا در لغو تسویه: ' . $e->getMessage());
        }
    }
}
