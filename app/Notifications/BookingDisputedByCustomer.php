<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class BookingDisputedByCustomer extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Booking $booking) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'مشتری به تکمیل رزرو اعتراض کرد',
            'message' => "مشتری «{$this->booking->user?->name}» به تکمیل رزرو #{$this->booking->id} اعتراض کرده است. ادمین در حال بررسی است.",
            'booking_id' => $this->booking->id,
            'customer_name' => $this->booking->user?->name,
            'dispute_reason' => $this->booking->dispute_reason,
            'type' => 'booking_disputed_by_customer',
            'icon' => 'alert-triangle',
            'color' => 'warning',
            'url' => route('barber.bookings.show', $this->booking->id),
            'created_at' => now()->toIso8601String(),
        ];
    }
}
