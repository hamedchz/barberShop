<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class BookingCompletedForAdmin extends Notification implements ShouldQueue
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
            'title' => 'تکمیل رزرو توسط آرایشگر',
            'message' => "آرایشگر «{$this->booking->barber?->name}» رزرو #{$this->booking->id} را تکمیل اعلام کرد.",
            'booking_id' => $this->booking->id,
            'barber_id' => $this->booking->barber_id,
            'customer_id' => $this->booking->user_id,
            'amount' => (float) $this->booking->amount,
            'type' => 'booking_completed_by_barber_admin',
            'icon' => 'check-circle',
            'color' => 'success',
            'url' => route('admin.barbers.bookings.show', [
                'barber' => $this->booking->barber_id,
                'booking' => $this->booking->id,
            ]),
            'created_at' => now()->toIso8601String(),
        ];
    }
}
