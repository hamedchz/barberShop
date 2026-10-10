<?php

namespace App\Notifications;

use App\Models\WalletDeposit;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WalletDepositExpired extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public WalletDeposit $deposit,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'       => 'wallet_deposit_expired',
            'deposit_id' => $this->deposit->id,
            'amount'     => (float) $this->deposit->amount,

            'title'   => 'شارژ کیف پول منقضی شد',
            'message' => 'مهلت پرداخت شارژ شما به پایان رسید. می‌توانید دوباره تلاش کنید.',
            'icon'    => 'clock',
            'color'   => 'warning',

            'action_url' => '/customer/wallet/deposit',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('شارژ کیف پول منقضی شد')
            ->line('مهلت پرداخت شارژ کیف پول شما به پایان رسید.')
            ->action('شارژ مجدد', url('/customer/wallet/deposit'))
            ->line('اگر پرداختی انجام داده‌اید و مبلغ کسر شده، تا ۷۲ ساعت به حساب شما بازمی‌گردد.');
    }
}
