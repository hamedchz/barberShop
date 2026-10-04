<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class BookingCompletedByCustomer extends Notification implements ShouldQueue
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
            'title' => 'مشتری خدمت را تکمیل اعلام کرد',
            'message' => "مشتری «{$this->booking->user?->name}» رزرو #{$this->booking->id} برای خدمت «{$this->booking->service?->name}» را تکمیل اعلام کرد. اگر معترض هستید، تا ۲۴ ساعت فرصت دارید اعتراض کنید.",
            'booking_id' => $this->booking->id,
            'type' => 'booking_completed_by_customer',
            'icon' => 'alert',
            'color' => 'warning',
            'url' => route('barber.bookings.show', $this->booking->id),
            'can_dispute' => true,
            'dispute_deadline' => now()->addHours(24)->toIso8601String(),
            'created_at' => now()->toIso8601String(),
        ];
    }
}
