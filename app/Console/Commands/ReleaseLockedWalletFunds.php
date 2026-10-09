<?php

namespace App\Console\Commands;

use App\Models\WalletTransaction;
use App\Services\WalletService;
use Illuminate\Console\Command;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;

#[Signature('wallet:release-locked')]
#[Description('آزادسازی مبالغ قفل‌شده‌ای که زمانشان رسیده')]
class ReleaseLockedWalletFunds extends Command
{
    public function handle(WalletService $walletService): int
    {
        $now = now();

        // تراکنش‌های قفل‌شده‌ای که زمان آزادسازیشون رسیده
        $transactions = WalletTransaction::query()
            ->where('is_locked', true)
            ->whereNull('released_at')
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.release_at')) <= ?", [
                $now->toIso8601String(),
            ])
            ->get();

        $this->info("تعداد تراکنش‌های آماده آزادسازی: {$transactions->count()}");

        $released = 0;
        $failed = 0;

        foreach ($transactions as $transaction) {
            try {
                $walletService->releaseLocked($transaction);
                $released++;
                $this->line("  ✓ تراکنش #{$transaction->id} آزاد شد");
            } catch (\Throwable $e) {
                $failed++;
                $this->error("  ✗ تراکنش #{$transaction->id} - خطا: {$e->getMessage()}");
            }
        }

        $this->newLine();
        $this->info("✓ آزاد شده: {$released}");
        if ($failed > 0) {
            $this->error("✗ خطا: {$failed}");
        }

        return Command::SUCCESS;
    }
}
