<?php

namespace App\Notifications;

use App\Models\Dispute;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class DisputeEditedForCustomer extends Notification implements ShouldQueue
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
            'title' => 'ویرایش اعتراض آرایشگر',
            'message' => "آرایشگر اعتراض خود به رزرو #{$booking->id} را ویرایش کرد.",
            'dispute_id' => $this->dispute->id,
            'booking_id' => $booking->id,
            'barber_name' => $booking->barber?->name,
            'type' => 'dispute_edited_for_customer',
            'icon' => 'edit',
            'color' => 'info',
            'url' => route('customer.bookings.show', $booking->id),
            'created_at' => now()->toIso8601String(),
        ];
    }
}
