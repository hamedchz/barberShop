<?php

namespace App\Notifications;

use App\Models\Dispute;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class DisputeResolvedForCustomer extends Notification implements ShouldQueue
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

        return [
            'title' => $isApproved
                ? 'اعتراض شما تایید شد'
                : 'اعتراض شما رد شد',
            'message' => $isApproved
                ? "اعتراض شما به رزرو #{$booking->id} تایید شد. مبلغ " .
                number_format($this->dispute->refund_amount) .
                " تومان به کیف پول شما بازگردانده شد."
                : "پس از بررسی، اعتراض شما به رزرو #{$booking->id} رد شد. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.",
            'dispute_id' => $this->dispute->id,
            'booking_id' => $booking->id,
            'decision' => $this->decision,
            'refund_amount' => (float) $this->dispute->refund_amount,
            'resolution' => $this->dispute->resolution,
            'type' => $isApproved
                ? 'dispute_resolved_customer_approved'
                : 'dispute_resolved_customer_rejected',
            'icon' => $isApproved ? 'check-circle' : 'x-circle',
            'color' => $isApproved ? 'success' : 'danger',
            'priority' => 'high',
            'url' => route('customer.bookings.show', $booking->id),
            'created_at' => now()->toIso8601String(),
        ];
    }
}
