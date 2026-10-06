<?php

namespace App\Notifications;

use App\Models\Dispute;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class DisputeRespondedByCustomer extends Notification implements ShouldQueue
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
            'barber_id' => $booking->barber_id,
            'customer_id' => $booking->user_id,
            'customer_name' => $booking->user?->name,
            'response' => $this->dispute->response,
            'dispute_type' => $this->dispute->dispute_type,
            'type' => 'dispute_responded_by_customer',
            'icon' => 'message-circle',
            'color' => 'info',
            'priority' => 'high',
            'url' => route('admin.disputes.show', $this->dispute->id),
            'created_at' => now()->toIso8601String(),
        ];
    }
}
