<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomerBanned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $reason,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
        // return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'customer_banned',
            'reason'       => $this->reason,

            'title'        => 'حساب شما مسدود شد',
            'message'      => "حساب کاربری شما به دلیل {$this->reason} مسدود شده است.",
            'icon'         => 'ban',
            'color'        => 'danger',

            'action_url'   => '/support',
            'action_label' => 'تماس با پشتیبانی',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('حساب کاربری شما مسدود شد')
            ->greeting("سلام {$notifiable->name} عزیز،")
            ->line('متأسفانه حساب کاربری شما در پلتفرم ما مسدود شده است.')
            ->line("دلیل مسدودی: {$this->reason}")
            ->line('اگر فکر می‌کنید این تصمیم نادرست است، می‌توانید از طریق پشتیبانی اعتراض کنید.')
            ->action('تماس با پشتیبانی', url('/support'))
            ->salutation('با احترام، تیم پشتیبانی');
    }
}
