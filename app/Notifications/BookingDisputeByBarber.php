<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class BookingDisputeByBarber extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Booking $booking)
    {
        //
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'اعتراض آرایشگر به تکمیل رزرو',
            'message' => "آرایشگر «{$this->booking->barber?->name}» به تکمیل رزرو #{$this->booking->id} توسط مشتری اعتراض کرده است. دلیل: {$this->booking->dispute_reason}",
            'booking_id' => $this->booking->id,
            'barber_id' => $this->booking->barber_id,
            'customer_id' => $this->booking->user_id,
            'dispute_reason' => $this->booking->dispute_reason,
            'type' => 'booking_dispute_by_barber',
            'icon' => 'alert-triangle',
            'color' => 'danger',
            'url' => route('admin.barbers.bookings.show', [
                'barber' => $this->booking->barber_id,
                'booking' => $this->booking->id,
            ]),
            'priority' => 'high',
            'created_at' => now()->toIso8601String(),
        ];
    }
}
