<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class BookingCompletedForCustomer extends Notification implements ShouldQueue
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
            'title' => 'خدمت شما تکمیل شد',
            'message' => "خدمت «{$this->booking->service?->name}» شما در تاریخ {$this->booking->timeSlot?->date} تکمیل شد. لطفاً نظر خود را ثبت کنید.",
            'booking_id' => $this->booking->id,
            'barber_name' => $this->booking->barber?->name,
            'type' => 'booking_completed_by_barber',
            'icon' => 'check-circle',
            'color' => 'success',
            'url' => route('customer.bookings.show', $this->booking->id),
            'can_review' => true,
            'created_at' => now()->toIso8601String(),
        ];
    }
}
