<?php

namespace App\Http\Controllers\Customer;

use App\Enums\Casts\WalletDepositStatus;
use App\Exceptions\WalletException;
use App\Http\Controllers\Controller;
use App\Models\WalletDeposit;
use App\Services\WalletDepositService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WalletDepositController extends Controller
{
    public function __construct(
        private WalletDepositService $depositService,
    ) {}

    /**
     * صفحه شارژ کیف پول
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $wallet = $user->getOrCreateWallet();

        // ============ تاریخچه با فیلتر ============
        $query = WalletDeposit::where('user_id', $user->id);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $deposits = $query->latest()->paginate(10)->withQueryString();

        $deposits->through(fn($d) => $this->mapDeposit($d));

        return Inertia::render('Customer/Wallet/Deposit', [
            'wallet' => [
                'balance' => (float) $wallet->balance,
            ],
            'deposits' => $deposits,
            'quickAmounts' => [50000, 100000, 200000, 500000, 1000000, 2000000],
            'minAmount' => 10000,
            'maxAmount' => 50000000,
            'filters' => [
                'status' => $request->input('status', ''),
            ],
        ]);
    }

    /**
     * شروع شارژ و هدایت به درگاه
     */
    public function initiate(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:10000|max:50000000',
        ], [
            'amount.required' => 'لطفاً مبلغ شارژ را وارد کنید.',
            'amount.min'      => 'حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است.',
            'amount.max'      => 'حداکثر مبلغ شارژ ۵۰,۰۰۰,۰۰۰ تومان است.',
        ]);

        try {
            $deposit = $this->depositService->initiate(
                user: auth()->user(),
                amount: (float) $validated['amount'],
                gateway: 'zarinpal',
            );

            // TODO: اتصال به درگاه زرین‌پال
            // $paymentUrl = $this->zarinpal->request($deposit);
            // return Inertia::location($paymentUrl);

            // برای تست:
            return redirect()->route('customer.wallet.deposit.callback', [
                'deposit'   => $deposit->id,
                'status'    => 'OK',
                'authority' => 'TEST_' . $deposit->id,
            ]);
        } catch (WalletException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * بازگشت از درگاه
     */
    public function callback(Request $request, WalletDeposit $deposit)
    {
        if ($deposit->user_id !== auth()->id()) {
            abort(403);
        }

        // TODO: تایید از درگاه
        $verified = $request->status === 'OK'; // برای تست

        if ($verified) {
            try {
                $this->depositService->confirm(
                    deposit: $deposit,
                    gatewayTransactionId: $request->authority ?? 'TEST',
                    gatewayReference: $request->ref_id ?? null,
                    gatewayResponse: $request->all(),
                );

                return redirect()
                    ->route('customer.wallet.index')
                    ->with('success', 'کیف پول شما با موفقیت شارژ شد.');
            } catch (WalletException $e) {
                return redirect()
                    ->route('customer.wallet.deposit')
                    ->with('error', $e->getMessage());
            }
        }

        $this->depositService->fail($deposit, 'پرداخت ناموفق یا لغو شد.');

        return redirect()
            ->route('customer.wallet.deposit')
            ->with('error', 'پرداخت ناموفق بود. لطفاً دوباره تلاش کنید.');
    }

    private function mapDeposit(WalletDeposit $d): array
    {
        return [
            'id'             => $d->id,
            'amount'         => (float) $d->amount,
            'paid_amount'    => (float) $d->paid_amount,
            'status'         => $d->status->value,
            'status_label'   => $d->status->label(),
            'tracking_code'  => $d->tracking_code,
            'gateway'        => $d->gateway,
            'paid_at'        => $d->paid_at,
            'created_at'     => $d->created_at,
            'failure_reason' => $d->failure_reason,
        ];
    }
}
