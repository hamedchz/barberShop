<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingAutoCompletedForCustomer extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Booking $booking) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'خدمت شما تکمیل شد',
            'message' => "خدمت «{$this->booking->service?->name}» شما در تاریخ {$this->booking->timeSlot?->date} تکمیل شد. لطفاً نظر خود را ثبت کنید.",
            'booking_id' => $this->booking->id,
            'type' => 'booking_auto_completed_customer',
            'icon' => 'star',
            'color' => 'success',
            'url' => route('customer.bookings.show', $this->booking->id),
            'can_review' => true,
            'created_at' => now()->toIso8601String(),
        ];
    }
}
