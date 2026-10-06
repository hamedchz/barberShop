<?php

namespace App\Notifications;

use App\Models\Dispute;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class DisputeEditedForBarber extends Notification implements ShouldQueue
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
            'title' => 'ویرایش اعتراض مشتری',
            'message' => "مشتری «{$booking->user?->name}» اعتراض خود به رزرو #{$booking->id} را ویرایش کرد.",
            'dispute_id' => $this->dispute->id,
            'booking_id' => $booking->id,
            'customer_name' => $booking->user?->name,
            'type' => 'dispute_edited_for_barber',
            'icon' => 'edit',
            'color' => 'warning',
            'url' => route('barber.bookings.show', $booking->id),
            'created_at' => now()->toIso8601String(),
        ];
    }
}
