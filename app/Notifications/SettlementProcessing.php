<?php

namespace App\Notifications;

use App\Models\Settlement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SettlementProcessing extends Notification implements ShouldQueue
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
            'type'          => 'settlement_processing',
            'settlement_id' => $this->settlement->id,
            'amount'        => (float) $this->settlement->amount,

            'title'         => 'تسویه در حال پردازش',
            'message'       => 'درخواست برداشت شما در حال پردازش است. لطفاً منتظر بمانید.',
            'icon'          => 'clock',
            'color'         => 'info',

            'action_url'    => '/customer/finance/settlements',
            'action_label'  => 'مشاهده جزئیات',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('تسویه در حال پردازش')
            ->greeting("سلام {$notifiable->name} عزیز,")
            ->line('درخواست برداشت شما در حال پردازش است.')
            ->line('مبلغ: ' . EnglishtoPersianNumber(number_format($this->settlement->amount)) . ' تومان')
            ->line('معمولاً پردازش تا ۷۲ ساعت زمان می‌برد.')
            ->action('مشاهده جزئیات', url('/customer/finance/settlements'))
            ->salutation('با احترام، تیم پشتیبانی');
    }
}
