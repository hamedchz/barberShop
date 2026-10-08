<?php

namespace App\Observers;

use App\Models\User;
use App\Services\WalletService;

class UserObserver
{
    public function __construct(
        private WalletService $walletService
    ) {}

    public function created(User $user): void
    {
        // ساخت خودکار کیف پول برای کاربر جدید
        $this->walletService->getOrCreateWallet($user);
    }
}
