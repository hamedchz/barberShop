<?php

namespace App\Notifications;

use App\Models\Settlement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SettlementCompleted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Settlement $settlement,
    ) {
        // بعد از commit اجرا کن (برای اطمینان از ثبت تسویه)
        $this->afterCommit();
    }

    public function via(object $notifiable): array
    {
        return ['database'];
        // اگه ایمیل هم میخوای:
        // return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'          => 'settlement_completed',
            'settlement_id' => $this->settlement->id,
            'amount'        => (float) $this->settlement->amount,
            'bank_reference' => $this->settlement->bank_reference,
            'bank_name'     => $this->settlement->bank_name,
            'card_last4'    => $this->settlement->card_number
                ? substr($this->settlement->card_number, -4)
                : null,
            'completed_at'  => $this->settlement->completed_at?->toIso8601String(),

            'title'         => 'تسویه با موفقیت انجام شد',
            'message'       => 'مبلغ ' .
                EnglishtoPersianNumber(number_format($this->settlement->amount)) .
                ' تومان به حساب بانکی شما واریز شد.',
            'icon'          => 'check-circle',
            'color'         => 'success',

            'action_url'    => '/customer/finance/settlements',
            'action_label'  => 'مشاهده جزئیات',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('تسویه با موفقیت انجام شد')
            ->greeting("سلام {$notifiable->name} عزیز,")
            ->line('درخواست برداشت شما با موفقیت پردازش شد.')
            ->line('مبلغ: ' . EnglishtoPersianNumber(number_format($this->settlement->amount))  . ' تومان')
            ->line('بانک: ' . $this->settlement->bank_name)
            ->line('شماره پیگیری: ' . $this->settlement->bank_reference)
            ->action('مشاهده جزئیات', url('/customer/finance/settlements'))
            ->line('از اعتماد شما سپاسگزاریم.')
            ->salutation('با احترام، تیم پشتیبانی');
    }
}
