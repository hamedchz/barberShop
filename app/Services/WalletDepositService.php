<?php

namespace App\Services;

use App\Enums\Casts\WalletDepositStatus;
use App\Enums\Casts\WalletTransactionType;
use App\Exceptions\WalletException;
use App\Models\User;
use App\Models\WalletDeposit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WalletDepositService
{
  public function __construct(
    private WalletService $walletService,
  ) {}

  /**
   * شروع فرآیند شارژ (ساخت رکورد pending)
   */
  public function initiate(
    User $user,
    float $amount,
    string $gateway = 'zarinpal',
  ): WalletDeposit {
    if ($amount < 10000) {
      throw new WalletException('حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است.');
    }

    $wallet = $this->walletService->getOrCreateWallet($user);

    return WalletDeposit::create([
      'user_id'   => $user->id,
      'wallet_id' => $wallet->id,
      'amount'    => $amount,
      'status'    => WalletDepositStatus::pending->value,
      'gateway'   => $gateway,
      'expires_at' => now()->addMinutes(15),
    ]);
  }

  /**
   * تایید پرداخت موفق
   */
  public function confirm(
    WalletDeposit $deposit,
    string $gatewayTransactionId,
    string $gatewayReference = null,
    array $gatewayResponse = [],
    ?float $paidAmount = null,
  ): void {
    if ($deposit->isPaid()) {
      return;
    }

    if (!$deposit->isPending()) {
      throw new WalletException('این تراکنش قابل تایید نیست.');
    }

    DB::transaction(function () use (
      $deposit,
      $gatewayTransactionId,
      $gatewayReference,
      $gatewayResponse,
      $paidAmount,
    ) {
      $paidAmount = $paidAmount ?? (float) $deposit->amount;

      // آپدیت رکورد
      $deposit->update([
        'status'                 => WalletDepositStatus::paid->value,
        'paid_amount'            => $paidAmount,
        'gateway_transaction_id' => $gatewayTransactionId,
        'gateway_reference'      => $gatewayReference,
        'gateway_response'       => $gatewayResponse,
        'tracking_code'          => $this->generateTrackingCode(),
        'paid_at'                => now(),
      ]);

      // واریز به کیف پول
      $this->walletService->deposit(
        user: $deposit->user,
        amount: $paidAmount,
        description: "شارژ کیف پول - کد پیگیری: {$deposit->tracking_code}",
        reference: $deposit,
        metadata: [
          'deposit_id'   => $deposit->id,
          'gateway'      => $deposit->gateway,
          'tracking_code' => $deposit->tracking_code,
        ],
      );
    });
  }

  /**
   * پرداخت ناموفق
   */
  public function fail(WalletDeposit $deposit, string $reason): void
  {
    if ($deposit->isPaid()) {
      return;
    }

    $deposit->update([
      'status'         => WalletDepositStatus::failed->value,
      'failure_reason' => $reason,
      'failed_at'      => now(),
    ]);
  }

  /**
   * لغو
   */
  public function cancel(WalletDeposit $deposit): void
  {
    if (!$deposit->isPending()) {
      return;
    }

    $deposit->update([
      'status' => WalletDepositStatus::cancelled->value,
    ]);
  }

  /**
   * ساخت کد پیگیری
   */
  private function generateTrackingCode(): string
  {
    do {
      $code = 'DP' . strtoupper(Str::random(8));
    } while (WalletDeposit::where('tracking_code', $code)->exists());

    return $code;
  }
}
