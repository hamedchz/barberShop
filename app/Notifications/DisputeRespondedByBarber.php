<?php

namespace App\Notifications;

use App\Models\Dispute;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class DisputeRespondedByBarber extends Notification implements ShouldQueue
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
            'message' => "آرایشگر «{$booking->barber?->name}» پاسخ خود را برای اعتراض #{$this->dispute->id} ثبت کرد.",
            'dispute_id' => $this->dispute->id,
            'booking_id' => $booking->id,
            'barber_id' => $booking->barber_id,
            'barber_name' => $booking->barber?->name,
            'customer_id' => $booking->user_id,
            'customer_name' => $booking->user?->name,
            'dispute_type' => $this->dispute->dispute_type,
            'response' => $this->dispute->response,
            'type' => 'dispute_responded_by_barber',
            'icon' => 'message-circle',
            'color' => 'info',
            'priority' => 'high',
            'url' => route('admin.disputes.show', $this->dispute->id),
            'created_at' => now()->toIso8601String(),
        ];
    }
}
