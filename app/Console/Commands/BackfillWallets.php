<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\WalletService;
use Illuminate\Console\Command;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;

#[Signature('wallets:backfill')]
#[Description('ساخت کیف پول برای کاربرانی که ندارند')]
class BackfillWallets extends Command
{
    public function handle(WalletService $walletService): int
    {
        $users = User::doesntHave('wallet')->get();
        $bar = $this->output->createProgressBar($users->count());

        foreach ($users as $user) {
            $walletService->getOrCreateWallet($user);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("✓ کیف پول برای {$users->count()} کاربر ساخته شد.");

        return Command::SUCCESS;
    }
}
