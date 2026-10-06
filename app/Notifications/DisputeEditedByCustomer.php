<?php

namespace App\Notifications;

use App\Models\Dispute;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class DisputeEditedByCustomer extends Notification implements ShouldQueue
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
            'title' => 'ویرایش اعتراض توسط مشتری',
            'message' => "مشتری «{$booking->user?->name}» اعتراض خود به رزرو #{$booking->id} را ویرایش کرد.",
            'dispute_id' => $this->dispute->id,
            'booking_id' => $booking->id,
            'barber_id' => $booking->barber_id,
            'customer_id' => $booking->user_id,
            'customer_name' => $booking->user?->name,
            'dispute_type' => $this->dispute->dispute_type,
            'dispute_reason' => $this->dispute->reason,
            'edit_count' => $this->dispute->edit_count,
            'type' => 'dispute_edited_by_customer',
            'icon' => 'edit',
            'color' => 'info',
            'priority' => 'medium',
            'url' => route('admin.disputes.show', $this->dispute->id),
            'created_at' => now()->toIso8601String(),
        ];
    }
}
