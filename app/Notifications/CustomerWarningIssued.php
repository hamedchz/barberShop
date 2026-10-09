<?php

namespace App\Notifications;

use App\Models\UserWarning;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomerWarningIssued extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public UserWarning $warning,
    ) {}

    /**
     * کانال‌های ارسال
     */
    public function via(object $notifiable): array
    {
        return ['database'];
        // اگه ایمیل هم میخوای:
        // return ['database', 'mail'];
    }

    /**
     * کانال دیتابیس (برای نمایش توی پنل کاربر)
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'customer_warning_issued',
            'warning_id'   => $this->warning->id,
            'dispute_id'   => $this->warning->dispute_id,
            'reason'       => $this->warning->reason,
            'expires_at'   => $this->warning->expires_at?->toIso8601String(),

            'title'        => 'اخطار جدید',
            'message'      => 'به دلیل رفتار نامناسب، یک اخطار برای شما ثبت شد. لطفاً قوانین پلتفرم را رعایت کنید.',
            'icon'         => 'alert-triangle',
            'color'        => 'warning',

            'action_url'   => '/customer/warnings',
            'action_label' => 'مشاهده جزئیات',
        ];
    }

    /**
     * کانال ایمیل (اختیاری)
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('اخطار جدید در حساب شما')
            ->greeting("سلام {$notifiable->name} عزیز،")
            ->line('به دلیل رفتار نامناسب گزارش‌شده توسط آرایشگر و تایید آن توسط تیم پشتیبانی، یک اخطار برای شما ثبت شد.')
            ->line("دلیل: {$this->warning->reason}")
            ->line("این اخطار تا {$this->warning->expires_at?->toJalali()->format('Y/m/d')} معتبر است.")
            ->line('تکرار تخلف ممکن است منجر به محدودیت یا مسدود شدن حساب شما شود.')
            ->action('مشاهده جزئیات', url('/customer/warnings'))
            ->line('اگر فکر می‌کنید این اخطار نادرست است، می‌توانید از طریق پشتیبانی اعتراض کنید.')
            ->salutation('با احترام، تیم پشتیبانی');
    }
}
