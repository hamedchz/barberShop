<?php

namespace App\Console\Commands;

use App\Enums\Casts\BookingStatus;
use App\Models\Booking;
use App\Notifications\BookingCompletionReminder;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;

#[Signature('app:send-completion-reminders')]
#[Description('ارسال یادآوری برای رزروهایی که نزدیک به تکمیل خودکار هستند')]


class SendCompletionReminders extends Command
{
    // protected $signature = 'bookings:send-completion-reminders';
    // protected $description = 'ارسال یادآوری برای رزروهایی که نزدیک به تکمیل خودکار هستند';

    public function handle()
    {
        $now = Carbon::now();

        // ============ Reminder ۱: ۴ ساعت به تکمیل خودکار ============
        $bookings20h = Booking::where('status', BookingStatus::confirmed->value)
            ->where('is_disputed', false)
            ->whereNull('completion_reminder_sent_at')
            ->whereHas('timeSlot', function ($q) use ($now) {
                // بین ۲۰ تا ۲۱ ساعت گذشته باشد
                $q->whereRaw("CONCAT(date, ' ', start_time) BETWEEN ? AND ?", [
                    $now->copy()->subHours(21),
                    $now->copy()->subHours(20),
                ]);
            })
            ->with(['barber', 'timeSlot'])
            ->get();

        foreach ($bookings20h as $booking) {
            $booking->barber?->notify(
                new BookingCompletionReminder($booking, 4)
            );

            $booking->update(['completion_reminder_sent_at' => now()]);
        }

        $this->info("Reminder ۴ ساعت: {$bookings20h->count()} ارسال شد.");

        return Command::SUCCESS;
    }
}
