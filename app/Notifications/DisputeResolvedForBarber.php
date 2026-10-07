<?php

namespace App\Notifications;

use App\Models\Dispute;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class DisputeResolvedForBarber extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Dispute $dispute,
        public string $decision
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $isApproved = $this->decision === 'approve';
        $booking = $this->dispute->booking;

        $message = '';
        if ($isApproved && $this->dispute->disputed_by === 'customer') {
            $message = "اعتراض مشتری به رزرو #{$booking->id} تایید شد. مبلغ " .
                number_format($this->dispute->refund_amount) .
                " تومان به مشتری بازگردانده شد و جریمه " .
                number_format($this->dispute->penalty_amount) .
                " تومان از کیف پول شما کسر شد.";
        } elseif ($isApproved && $this->dispute->disputed_by === 'barber') {
            $message = "اعتراض شما به رزرو #{$booking->id} تایید شد.";
        } else {
            $message = "اعتراض به رزرو #{$booking->id} رد شد.";
        }

        return [
            'title' => $isApproved
                ? 'اعتراض تایید شد'
                : 'اعتراض رد شد',
            'message' => $message,
            'dispute_id' => $this->dispute->id,
            'booking_id' => $booking->id,
            'decision' => $this->decision,
            'refund_amount' => (float) $this->dispute->refund_amount,
            'penalty_amount' => (float) $this->dispute->penalty_amount,
            'resolution' => $this->dispute->resolution,
            'type' => $isApproved
                ? 'dispute_resolved_barber_approved'
                : 'dispute_resolved_barber_rejected',
            'icon' => $isApproved ? 'check-circle' : 'x-circle',
            'color' => $isApproved ? 'success' : 'danger',
            'priority' => 'high',
            'url' => route('barber.bookings.show', $booking->id),
            'created_at' => now()->toIso8601String(),
        ];
    }
}
