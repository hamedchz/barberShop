<?php

namespace App\Notifications;

use App\Models\Settlement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SettlementFailed extends Notification implements ShouldQueue
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
        // return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'          => 'settlement_failed',
            'settlement_id' => $this->settlement->id,
            'amount'        => (float) $this->settlement->amount,
            'reason'        => $this->settlement->failure_reason,
            'failed_at'     => $this->settlement->failed_at?->toIso8601String(),

            'title'         => 'تسویه انجام نشد',
            'message'       => 'درخواست برداشت شما رد شد. دلیل: ' .
                ($this->settlement->failure_reason ?? 'نامشخص'),
            'icon'          => 'x-circle',
            'color'         => 'danger',

            'action_url'    => '/customer/finance/settlements',
            'action_label'  => 'مشاهده جزئیات',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('تسویه انجام نشد')
            ->greeting("سلام {$notifiable->name} عزیز,")
            ->line('متأسفانه درخواست برداشت شما رد شد.')
            ->line('مبلغ: ' . EnglishtoPersianNumber(number_format($this->settlement->amount)) . ' تومان')
            ->line('دلیل: ' . ($this->settlement->failure_reason ?? 'نامشخص'))
            ->line('مبلغ قفل‌شده آزاد شد و می‌توانید دوباره درخواست دهید.')
            ->action('مشاهده جزئیات', url('/customer/finance/settlements'))
            ->line('اگر سوالی دارید با پشتیبانی تماس بگیرید.')
            ->salutation('با احترام، تیم پشتیبانی');
    }
}
