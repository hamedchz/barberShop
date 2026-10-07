<?php

namespace App\Notifications;

use App\Models\Dispute;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class BookingDisputedByBarber extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Dispute $dispute) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $booking = $this->dispute->booking;

        return [
            'title' => 'آرایشگر به رزرو شما اعتراض کرد',
            'message' => "آرایشگر «{$booking->barber?->name}» به رزرو #{$booking->id} اعتراض کرده است. ادمین بررسی خواهد کرد.",
            'dispute_id' => $this->dispute->id,
            'booking_id' => $booking->id,
            'barber_name' => $booking->barber?->name,
            'dispute_type' => $this->dispute->dispute_type,
            'dispute_reason' => $this->dispute->reason,
            'type' => 'disputed_by_barber',
            'icon' => 'alert-triangle',
            'color' => 'warning',
            'url' => route('customer.bookings.show', $booking->id),
            'created_at' => now()->toIso8601String(),
        ];
    }
}
