<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingCompletionReminder extends Notification implements ShouldQueue
{
    use Queueable;
    public function __construct(
        public Booking $booking,
        public int $hoursRemaining
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'یادآوری تایید تکمیل رزرو',
            'message' => "رزرو #{$this->booking->id} هنوز تایید نشده است. تا {$this->hoursRemaining} ساعت دیگر به صورت خودکار تکمیل می‌شود.",
            'booking_id' => $this->booking->id,
            'type' => 'booking_completion_reminder',
            'icon' => 'alert',
            'color' => 'warning',
            'url' => route('barber.bookings.show', $this->booking->id),
            'hours_remaining' => $this->hoursRemaining,
            'created_at' => now()->toIso8601String(),
        ];
    }
}
