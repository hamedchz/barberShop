<?php

namespace App\Console\Commands;

use App\Models\WalletTransaction;
use App\Services\WalletService;
use Illuminate\Console\Command;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Support\Facades\Log;

#[Signature('wallet:release-locked
    {--dry-run : نمایش تراکنش‌ها بدون آزادسازی}
    {--limit=100 : حداکثر تعداد تراکنش‌ها}
')] #[Description('آزادسازی مبالغ قفل‌شده‌ای که زمانشان رسیده')]
class ReleaseLockedWalletFunds extends Command
{
    public function handle(WalletService $walletService): int
    {
        $isDryRun = $this->option('dry-run');
        $limit = (int) $this->option('limit');
        $now = now();

        $this->info("شروع آزادسازی...");

        $transactions = WalletTransaction::query()
            ->where('is_locked', true)
            ->whereNull('released_at')
            ->whereNotNull('release_at')
            ->where('release_at', '<=', $now)
            ->with(['user:id,name,phone'])
            ->orderBy('release_at')
            ->limit($limit)
            ->get();

        $this->info("تعداد: {$transactions->count()}");

        if ($transactions->isEmpty()) {
            $this->info('✓ هیچ تراکنشی برای آزادسازی وجود ندارد.');
            return Command::SUCCESS;
        }

        if ($isDryRun) {
            $this->table(
                ['ID', 'User', 'Amount', 'Release At'],
                $transactions->map(fn($t) => [
                    $t->id,
                    $t->user?->name ?? '-',
                    number_format((float) $t->amount),
                    $t->release_at?->format('Y-m-d H:i:s') ?? '-',
                ])->toArray()
            );
            $this->warn('حالت Dry-Run.');
            return Command::SUCCESS;
        }

        $released = 0;
        $failed = 0;
        $totalAmount = 0;

        foreach ($transactions as $transaction) {
            try {
                $walletService->releaseLocked($transaction);
                $released++;
                $totalAmount += (float) $transaction->amount;
            } catch (\Throwable $e) {
                $failed++;
                Log::error('Failed to release locked funds', [
                    'transaction_id' => $transaction->id,
                    'error'          => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();
        $this->info("✓ آزاد شده: {$released} تراکنش");
        $this->info("✓ مبلغ کل: " . number_format($totalAmount) . " تومان");

        if ($failed > 0) {
            $this->error("✗ خطا: {$failed}");
        }

        return Command::SUCCESS;
    }
}
