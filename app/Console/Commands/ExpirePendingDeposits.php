<?php

namespace App\Console\Commands;

use App\Enums\Casts\WalletDepositStatus;
use App\Models\WalletDeposit;
use Illuminate\Console\Command;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

#[Signature('wallet:expire-pending-deposits {--dry-run} {--minutes=15}')]
#[Description('منقضی کردن شارژهای pending که از مهلتشان گذشته')]
class ExpirePendingDeposits extends Command
{
    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');
        $minutes = (int) $this->option('minutes');

        $this->info("شروع بررسی شارژهای pending (بیش از {$minutes} دقیقه)...");

        $deadline = now()->subMinutes($minutes);

        // ============ پیدا کردن depositهای منقضی‌شده ============
        $deposits = WalletDeposit::query()
            ->where('status', WalletDepositStatus::pending->value)
            ->where(function ($q) use ($deadline) {
                // اگه expires_at داره
                $q->where('expires_at', '<', now())
                    // یا اگه expires_at نداره، بر اساس created_at
                    ->orWhere(function ($q2) use ($deadline) {
                        $q2->whereNull('expires_at')
                            ->where('created_at', '<', $deadline);
                    });
            })
            ->get();

        $this->info("تعداد شارژهای منقضی‌شده: {$deposits->count()}");

        if ($deposits->isEmpty()) {
            $this->info('✓ هیچ شارژ منقضی‌شده‌ای یافت نشد.');
            return Command::SUCCESS;
        }

        // ============ حالت Dry-Run ============
        if ($isDryRun) {
            $this->newLine();
            $this->warn('حالت Dry-Run — هیچ تغییری اعمال نشد.');
            $this->newLine();

            $this->table(
                ['ID', 'User ID', 'Amount', 'Gateway', 'Created At', 'Expires At'],
                $deposits->map(fn($d) => [
                    $d->id,
                    $d->user_id,
                    number_format($d->amount),
                    $d->gateway ?? '-',
                    $d->created_at?->format('Y-m-d H:i:s'),
                    $d->expires_at?->format('Y-m-d H:i:s') ?? '-',
                ])->toArray()
            );

            return Command::SUCCESS;
        }

        // ============ منقضی کردن ============
        $expiredCount = 0;
        $failedCount = 0;

        foreach ($deposits as $deposit) {
            DB::beginTransaction();

            try {
                $deposit->update([
                    'status'         => WalletDepositStatus::expired->value,
                    'failure_reason' => 'مهلت پرداخت به پایان رسید.',
                ]);



                DB::commit();
                $expiredCount++;

                $this->line("  ✓ شارژ #{$deposit->id} منقضی شد (کاربر #{$deposit->user_id})");
            } catch (\Throwable $e) {
                DB::rollBack();
                $failedCount++;

                Log::error('Failed to expire deposit', [
                    'deposit_id' => $deposit->id,
                    'error'      => $e->getMessage(),
                ]);

                $this->error("  ✗ شارژ #{$deposit->id} — خطا: {$e->getMessage()}");
            }

            try {
                $deposit->user->notify(
                    new \App\Notifications\WalletDepositExpired($deposit)
                );
            } catch (\Throwable $e) {
                Log::warning('Failed to send deposit expired notification', [
                    'deposit_id' => $deposit->id,
                    'error'      => $e->getMessage(),
                ]);
            }
        }

        // ============ خلاصه ============
        $this->newLine();
        $this->info("✓ منقضی شده: {$expiredCount}");
        if ($failedCount > 0) {
            $this->error("✗ خطا: {$failedCount}");
        }

        return Command::SUCCESS;
    }
}
