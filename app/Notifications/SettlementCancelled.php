<?php

namespace App\Notifications;

use App\Models\Settlement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SettlementCancelled extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Settlement $settlement,
    ) {
        $this->afterCommit();
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'          => 'settlement_cancelled',
            'settlement_id' => $this->settlement->id,
            'amount'        => (float) $this->settlement->amount,

            'title'         => 'تسویه لغو شد',
            'message'       => 'درخواست برداشت شما لغو شد. مبلغ آزاد شد.',
            'icon'          => 'ban',
            'color'         => 'warning',

            'action_url'    => '/customer/finance/settlements',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('تسویه لغو شد')
            ->greeting("سلام {$notifiable->name} عزیز,")
            ->line('درخواست برداشت شما لغو شد.')
            ->line('مبلغ قفل‌شده آزاد شد و می‌توانید دوباره درخواست دهید.')
            ->action('مشاهده تسویه‌ها', url('/customer/finance/settlements'))
            ->salutation('با احترام، تیم پشتیبانی');
    }
}
