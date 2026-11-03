<?php

namespace App\Notifications;

use App\Models\Booking;
use Carbon\Carbon;
use Hekmatinasser\Verta\Verta;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class BookingCompletedForCustomer extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Booking $booking) {}

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
            'title' => 'خدمت شما تکمیل شد',
            'message' => "خدمت «{$this->booking->service?->name}» شما در تاریخ {$formattedDate} تکمیل شد. لطفاً نظر خود را ثبت کنید.",
            'booking_id' => $this->booking->id,
            'barber_name' => $this->booking->barber?->name,
            'type' => 'booking_completed_by_barber',
            'icon' => 'check-circle',
            'color' => 'success',
            'url' => route('customer.bookings.show', $this->booking->id),
            'can_review' => true,
            'created_at' => now()->toIso8601String(),
        ];
    }
}
