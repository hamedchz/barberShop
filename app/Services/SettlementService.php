<?php

namespace App\Services;

use App\Enums\Casts\SettlementStatus;
use App\Enums\Casts\WalletTransactionType;
use App\Models\Log as ModelsLog;
use App\Models\Settlement;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SettlementService
{
    public function __construct(
        private WalletService $walletService,
    ) {}

    /**
     * شروع پردازش تسویه
     */
    public function process(
        Settlement $settlement,
        ?string $bankReference = null,
        ?string $notes = null,
        ?User $admin = null,
    ): void {
        DB::transaction(function () use ($settlement, $bankReference, $notes, $admin) {
            $settlement->update([
                'status'         => SettlementStatus::processing->value,
                'processed_at'   => now(),
                'processed_by'   => $admin?->id,
                'bank_reference' => $bankReference,
                'notes'          => $notes,
            ]);

            // نوتیفیکیشن
            try {
                $settlement->user->notify(
                    new \App\Notifications\SettlementProcessing($settlement)
                );
            } catch (\Throwable $e) {
                Log::warning('Failed to send settlement processing notification', [
                    'settlement_id' => $settlement->id,
                    'error'         => $e->getMessage(),
                ]);
            }
        });
    }

    /**
     * تکمیل تسویه (پول واقعاً واریز شده)
     *
     * ✅ منطق: پول توی locked_balance هست (از requestWithdrawal).
     *         فقط locked_balance کم میشه، balance دست نمیخوره.
     */
    public function complete(
        Settlement $settlement,
        string $bankReference,
        ?string $notes = null,
        ?User $admin = null,
    ): void {
        DB::transaction(function () use ($settlement, $bankReference, $notes, $admin) {
            $user = $settlement->user;
            $wallet = $user->getOrCreateWallet();

            // ============ چک امنیتی ============
            if ((float) $wallet->locked_balance < (float) $settlement->amount) {
                throw new \App\Exceptions\WalletException(
                    'مبلغ قفل‌شده کافی نیست. قفل‌شده: ' .
                        number_format($wallet->locked_balance) . ' تومان'
                );
            }

            $balanceBefore = (float) $wallet->balance;
            $lockedBefore = (float) $wallet->locked_balance;

            // ============ ۱) کم کردن از locked_balance ============
            $wallet->decrement('locked_balance', $settlement->amount);
            $wallet->save();

            // ============ ۲) ثبت تراکنش ============
            \App\Models\WalletTransaction::create([
                'wallet_id'      => $wallet->id,
                'user_id'        => $user->id,
                'type'           => WalletTransactionType::withdraw->value,
                'direction'      => 'debit',
                'amount'         => $settlement->amount,
                'balance_before' => $balanceBefore,
                'balance_after'  => $balanceBefore,  // balance تغییر نکرده
                'status'         => 'completed',
                'reference_type' => Settlement::class,
                'reference_id'   => $settlement->id,
                'description'    => "تسویه #{$settlement->id} - واریز به حساب بانکی",
                'metadata'       => [
                    'settlement_id'  => $settlement->id,
                    'bank_reference' => $bankReference,
                    'from_locked'    => true,
                    'locked_before'  => $lockedBefore,
                    'locked_after'   => (float) $wallet->locked_balance,
                ],
                'is_locked'      => false,
            ]);

            // ============ ۳) آپدیت تسویه ============
            $settlement->update([
                'status'         => SettlementStatus::completed->value,
                'completed_at'   => now(),
                'bank_reference' => $bankReference,
                'notes'          => $notes ?? $settlement->notes,
                'processed_by'   => $admin?->id ?? $settlement->processed_by,
            ]);

            // ============ ۴) لاگ ============
            (new ModelsLog())->storeLog(
                $settlement->id,
                'settlement_completed',
                "تسویه #{$settlement->id} تکمیل شد - شماره پیگیری: {$bankReference}",
            );

            // ============ ۵) نوتیفیکیشن ============
            try {
                $user->notify(new \App\Notifications\SettlementCompleted($settlement));
            } catch (\Throwable $e) {
                Log::warning('Failed to send settlement completed notification', [
                    'settlement_id' => $settlement->id,
                    'error'         => $e->getMessage(),
                ]);
            }
        });
    }

    /**
     * رد تسویه
     *
     * ✅ منطق: پول توی locked_balance هست.
     *         locked_balance کم میشه و به balance برمیگرده.
     */
    public function fail(
        Settlement $settlement,
        string $reason,
        ?User $admin = null,
    ): void {
        DB::transaction(function () use ($settlement, $reason, $admin) {
            $user = $settlement->user;
            $wallet = $user->getOrCreateWallet();

            // ============ چک امنیتی ============
            if ((float) $wallet->locked_balance < (float) $settlement->amount) {
                throw new \App\Exceptions\WalletException(
                    'مبلغ قفل‌شده کافی نیست.'
                );
            }

            $balanceBefore = (float) $wallet->balance;
            $lockedBefore = (float) $wallet->locked_balance;

            // ============ ۱) آزادسازی: از locked کم کن و به balance برگردون ============
            $wallet->decrement('locked_balance', $settlement->amount);
            $wallet->increment('balance', $settlement->amount);
            $wallet->save();

            // ============ ۲) ثبت تراکنش برگشت ============
            \App\Models\WalletTransaction::create([
                'wallet_id'      => $wallet->id,
                'user_id'        => $user->id,
                'type'           => WalletTransactionType::refund->value,
                'direction'      => 'credit',
                'amount'         => $settlement->amount,
                'balance_before' => $balanceBefore,
                'balance_after'  => (float) $wallet->balance,
                'status'         => 'completed',
                'reference_type' => Settlement::class,
                'reference_id'   => $settlement->id,
                'description'    => "برگشت درخواست برداشت #{$settlement->id} - دلیل: {$reason}",
                'metadata'       => [
                    'settlement_id'  => $settlement->id,
                    'failure_reason' => $reason,
                    'from_locked'    => true,
                ],
            ]);

            // ============ ۳) آپدیت تسویه ============
            $settlement->update([
                'status'         => SettlementStatus::failed->value,
                'failed_at'      => now(),
                'failure_reason' => $reason,
                'processed_by'   => $admin?->id ?? $settlement->processed_by,
            ]);

            // ============ ۴) لاگ ============
            (new ModelsLog())->storeLog(
                $settlement->id,
                'settlement_failed',
                "تسویه #{$settlement->id} رد شد - دلیل: {$reason}",
            );

            // ============ ۵) نوتیفیکیشن ============
            try {
                $user->notify(new \App\Notifications\SettlementFailed($settlement));
            } catch (\Throwable $e) {
                Log::warning('Failed to send settlement failed notification', [
                    'settlement_id' => $settlement->id,
                    'error'         => $e->getMessage(),
                ]);
            }
        });
    }

    /**
     * لغو تسویه (توسط کاربر یا ادمین)
     *
     * ✅ منطق: مثل fail — پول از locked آزاد و به balance برمیگرده.
     */
    public function cancel(Settlement $settlement, ?User $admin = null): void
    {
        DB::transaction(function () use ($settlement, $admin) {
            $user = $settlement->user;
            $wallet = $user->getOrCreateWallet();

            // ============ چک امنیتی ============
            if ((float) $wallet->locked_balance < (float) $settlement->amount) {
                throw new \App\Exceptions\WalletException(
                    'مبلغ قفل‌شده کافی نیست.'
                );
            }

            $balanceBefore = (float) $wallet->balance;
            $lockedBefore = (float) $wallet->locked_balance;

            // ============ ۱) آزادسازی: از locked کم کن و به balance برگردون ============
            $wallet->decrement('locked_balance', $settlement->amount);
            $wallet->increment('balance', $settlement->amount);
            $wallet->save();

            // ============ ۲) ثبت تراکنش برگشت ============
            \App\Models\WalletTransaction::create([
                'wallet_id'      => $wallet->id,
                'user_id'        => $user->id,
                'type'           => WalletTransactionType::refund->value,
                'direction'      => 'credit',
                'amount'         => $settlement->amount,
                'balance_before' => $balanceBefore,
                'balance_after'  => (float) $wallet->balance,
                'status'         => 'completed',
                'reference_type' => Settlement::class,
                'reference_id'   => $settlement->id,
                'description'    => "لغو درخواست برداشت #{$settlement->id}",
                'metadata'       => [
                    'settlement_id' => $settlement->id,
                    'cancelled'     => true,
                    'from_locked'   => true,
                ],
            ]);

            // ============ ۳) آپدیت تسویه ============
            $settlement->update([
                'status'       => SettlementStatus::cancelled->value,
                'processed_by' => $admin?->id ?? $settlement->processed_by,
            ]);

            // ============ ۴) لاگ ============
            (new ModelsLog())->storeLog(
                $settlement->id,
                'settlement_cancelled',
                "تسویه #{$settlement->id} لغو شد",
            );

            // ============ ۵) نوتیفیکیشن ============
            try {
                $user->notify(new \App\Notifications\SettlementCancelled($settlement));
            } catch (\Throwable $e) {
                Log::warning('Failed to send settlement cancelled notification', [
                    'settlement_id' => $settlement->id,
                    'error'         => $e->getMessage(),
                ]);
            }
        });
    }

    /**
     * پردازش دسته‌جمعی تسویه‌ها
     *
     * @param array $ids
     * @param User|null $admin
     * @return int تعداد تسویه‌های پردازش‌شده
     */
    public function bulkProcess(array $ids, ?User $admin = null): int
    {
        $count = 0;

        DB::transaction(function () use ($ids, $admin, &$count) {
            $settlements = Settlement::whereIn('id', $ids)
                ->where('status', SettlementStatus::pending->value)
                ->get();

            foreach ($settlements as $settlement) {
                $settlement->update([
                    'status'       => SettlementStatus::processing->value,
                    'processed_at' => now(),
                    'processed_by' => $admin?->id,
                ]);

                // لاگ
                (new ModelsLog())->storeLog(
                    $settlement->id,
                    'settlement_bulk_processed',
                    "تسویه #{$settlement->id} در پردازش دسته‌جمعی شروع شد",
                );

                // نوتیفیکیشن
                try {
                    $settlement->user->notify(
                        new \App\Notifications\SettlementProcessing($settlement)
                    );
                } catch (\Throwable $e) {
                    Log::warning('Failed to send bulk process notification', [
                        'settlement_id' => $settlement->id,
                        'error'         => $e->getMessage(),
                    ]);
                }

                $count++;
            }
        });

        return $count;
    }
}
