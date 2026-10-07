<?php

namespace App\Notifications;

use App\Models\Dispute;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class DisputeRespondedForCustomer extends Notification implements ShouldQueue
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
            'title' => 'پاسخ آرایشگر به اعتراض',
            'message' => "آرایشگر پاسخ خود را برای اعتراض #{$this->dispute->id} ثبت کرد.",
            'dispute_id' => $this->dispute->id,
            'booking_id' => $booking->id,
            'barber_name' => $booking->barber?->name,
            'response' => $this->dispute->response,
            'type' => 'dispute_responded_for_customer',
            'icon' => 'message-circle',
            'color' => 'info',
            'priority' => 'high',
            'url' => route('customer.bookings.show', $booking->id),
            'created_at' => now()->toIso8601String(),
        ];
    }
}
