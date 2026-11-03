<?php

namespace App\Notifications;

use App\Models\Booking;
use Carbon\Carbon;
use Hekmatinasser\Verta\Verta;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class BookingCompletedConfirmation extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Booking $booking)
    {
        //
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $date = $this->booking->timeSlot?->date;

        $formattedDate = 'نامشخص';

        if ($date) {
            try {
                $carbonDate = $date instanceof Carbon
                    ? $date
                    : Carbon::parse($date);

                $formattedDate = Verta::instance($carbonDate)->format('Y/m/d');
            } catch (\Throwable $e) {
                report($e);
            }
        }
        return [
            'title' => 'تکمیل خدمت تایید شد',
            'message' => "تکمیل خدمت «{$this->booking->service?->name}» در تاریخ {$formattedDate} تایید شد. حالا می‌توانید نظر خود را ثبت کنید.",
            'booking_id' => $this->booking->id,
            'type' => 'booking_completed_confirmation',
            'icon' => 'check-circle',
            'color' => 'success',
            'url' => route('customer.bookings.show', $this->booking->id),
            'can_review' => true,
            'created_at' => now()->toIso8601String(),
        ];
    }
}
