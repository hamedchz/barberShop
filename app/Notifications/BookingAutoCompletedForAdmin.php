<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingAutoCompletedForAdmin extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Booking $booking) {}

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
            'title' => 'تکمیل خودکار رزرو',
            'message' => "رزرو #{$this->booking->id} آرایشگر «{$this->booking->barber?->name}» به دلیل عدم تایید در ۲۴ ساعت، خودکار تکمیل شد.",
            'booking_id' => $this->booking->id,
            'type' => 'booking_auto_completed_admin',
            'icon' => 'alert',
            'color' => 'info',
            'url' => route('admin.barbers.bookings.show', [
                'barber' => $this->booking->barber_id,
                'booking' => $this->booking->id,
            ]),
            'created_at' => now()->toIso8601String(),
        ];
    }
}
