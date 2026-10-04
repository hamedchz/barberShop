<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class BookingCompletedConfirmation extends Notification implements ShouldQueue
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
            'title' => 'تکمیل خدمت تایید شد',
            'message' => "تکمیل خدمت «{$this->booking->service?->name}» در تاریخ {$this->booking->timeSlot?->date} تایید شد. حالا می‌توانید نظر خود را ثبت کنید.",
            'booking_id' => $this->booking->id,
            'type' => 'booking_completed_confirmation',
            'icon' => 'check-circle',
            'color' => 'success',
            'url' => route('customer.bookings.show', $this->booking->id),
            'can_review' => true,
            'created_at' => now()->toIso8601String(),
        ];
    }
}
