<?php

namespace App\Notifications;

use App\Models\Dispute;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class DisputeRespondedForBarber extends Notification implements ShouldQueue
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
            'title' => 'پاسخ مشتری به اعتراض',
            'message' => "مشتری «{$booking->user?->name}» پاسخ خود را برای اعتراض #{$this->dispute->id} ثبت کرد.",
            'dispute_id' => $this->dispute->id,
            'booking_id' => $booking->id,
            'customer_name' => $booking->user?->name,
            'response' => $this->dispute->response,
            'type' => 'dispute_responded_for_barber',
            'icon' => 'message-circle',
            'color' => 'warning',
            'url' => route('barber.bookings.show', $booking->id),
            'created_at' => now()->toIso8601String(),
        ];
    }
}
