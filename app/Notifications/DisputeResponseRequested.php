<?php

namespace App\Notifications;

use App\Models\Dispute;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class DisputeResponseRequested extends Notification implements ShouldQueue
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
        $isBarber = $this->dispute->disputed_by === 'barber';

        return [
            'title' => 'ادمین درخواست اطلاعات بیشتر دارد',
            'message' => "ادمین برای بررسی اعتراض #{$this->dispute->id} نیاز به اطلاعات بیشتری دارد. لطفاً پاسخ خود را ثبت کنید.",
            'dispute_id' => $this->dispute->id,
            'booking_id' => $booking->id,
            'admin_message' => $this->dispute->admin_notes,
            'type' => $isBarber
                ? 'dispute_response_requested_barber'
                : 'dispute_response_requested_customer',
            'icon' => 'message-circle',
            'color' => 'warning',
            'priority' => 'high',
            'url' => $isBarber
                ? route('barber.bookings.show', $booking->id)
                : route('customer.bookings.show', $booking->id),
            'created_at' => now()->toIso8601String(),
        ];
    }
}
