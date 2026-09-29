<?php

namespace App\Console\Commands;

use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\TimeSlotStatus;
use App\Models\Booking;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:cancel-pending-bookings')]
#[Description('Command description')]
class CancelPendingBookings extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expired = Booking::where('status', BookingStatus::pending->value)
            ->where('created_at', '<', now()->subMinutes(15))
            ->get();

        foreach ($expired as $booking) {
            $booking->update([
                'status' => BookingStatus::cancelled->value,
                'cancelled_at' => now(),
            ]);

            $booking->timeSlot->update([
                'status' => TimeSlotStatus::available->value,
                'booked_by' => null,
            ]);
        }

        $this->info("{$expired->count()} رزرو معلق لغو شد.");
    }
}
