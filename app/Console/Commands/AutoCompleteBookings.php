<?php

namespace App\Console\Commands;

use App\Enums\Casts\BookingStatus;
use App\Models\Booking;
use App\Models\Log;
use App\Models\User;
use App\Notifications\BookingAutoCompleted;
use App\Notifications\BookingAutoCompletedForAdmin;
use App\Notifications\BookingAutoCompletedForCustomer;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Support\Facades\DB;

#[Signature('app:auto-complete-bookings')]
#[Description('تکمیل خودکار رزروهای confirmed که بیش از ۲۴ ساعت از زمان آنها گذشته')]

class AutoCompleteBookings extends Command

{

    // protected $signature = 'bookings:auto-complete';
    // protected $description = 'تکمیل خودکار رزروهای confirmed که بیش از ۲۴ ساعت از زمان آنها گذشته';

    public function handle()
    {
        $hours = (int) $this->option('hours');
        $isDryRun = $this->option('dry-run');
        $now = Carbon::now();

        $this->info("شروع جستجو (بیش از {$hours} ساعت)...");

        // ============ پیدا کردن رزروهای واجد شرایط ============
        $bookings = Booking::where('status', BookingStatus::confirmed->value)
            ->where('is_disputed', false)
            ->whereHas('timeSlot', function ($q) use ($now, $hours) {
                $q->whereRaw(
                    "CONCAT(date, ' ', start_time) <= ?",
                    [$now->copy()->subHours($hours)]
                );
            })
            ->with(['barber', 'user', 'service', 'timeSlot'])
            ->get();

        $this->info("تعداد رزروهای واجد شرایط: {$bookings->count()}");

        if ($isDryRun) {
            foreach ($bookings as $booking) {
                $this->line("  - رزرو #{$booking->id} | آرایشگر: {$booking->barber->name} | مشتری: {$booking->user->name}");
            }
            $this->warn('حالت Dry-Run — هیچ تغییری اعمال نشد.');
            return Command::SUCCESS;
        }

        $completedCount = 0;
        $failedCount = 0;

        foreach ($bookings as $booking) {
            DB::beginTransaction();

            try {
                // ============ تکمیل خودکار ============
                $booking->update([
                    'status' => BookingStatus::completed->value,
                    'completed_at' => now(),
                    'completed_by' => 'system',
                    'auto_completed' => true,
                    'auto_complete_at' => now(),
                ]);

                // ============ ثبت لاگ ============
                Log::create([
                    'user_id' => null,
                    'action' => 'auto_complete_booking',
                    'model_type' => Booking::class,
                    'model_id' => $booking->id,
                    'description' => "تکمیل خودکار رزرو #{$booking->id} — آرایشگر تایید نکرد",
                    'old_values' => ['status' => 'confirmed'],
                    'new_values' => ['status' => 'completed'],
                    'ip_address' => request()->ip() ?? '127.0.0.1',
                ]);

                // ============ Notification برای آرایشگر ============
                try {
                    if ($booking->barber) {
                        $booking->barber->notify(
                            new BookingAutoCompleted($booking)
                        );
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning('Notification to barber failed', [
                        'booking_id' => $booking->id,
                        'error' => $e->getMessage(),
                    ]);
                }

                // ============ Notification برای مشتری ============
                try {
                    if ($booking->user) {
                        $booking->user->notify(
                            new BookingAutoCompletedForCustomer($booking)
                        );
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning('Notification to customer failed', [
                        'booking_id' => $booking->id,
                        'error' => $e->getMessage(),
                    ]);
                }

                // ============ Notification برای ادمین (اختیاری) ============
                try {
                    $admins = User::role(['سوپر ادمین'])->get();
                    foreach ($admins as $admin) {
                        $admin->notify(
                            new BookingAutoCompletedForAdmin($booking)
                        );
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning('Notification to admins failed', [
                        'booking_id' => $booking->id,
                        'error' => $e->getMessage(),
                    ]);
                }

                DB::commit();
                $completedCount++;

                $this->line("  ✓ رزرو #{$booking->id} تکمیل شد");
            } catch (\Exception $e) {
                DB::rollBack();
                $failedCount++;

                \Illuminate\Support\Facades\Log::error('Auto-complete booking failed', [
                    'booking_id' => $booking->id,
                    'error' => $e->getMessage(),
                ]);

                $this->error("  ✗ رزرو #{$booking->id} — خطا: {$e->getMessage()}");
            }
        }

        $this->newLine();
        $this->info("✓ تکمیل شده: {$completedCount}");
        if ($failedCount > 0) {
            $this->error("✗ خطا: {$failedCount}");
        }

        return Command::SUCCESS;
    }
}
