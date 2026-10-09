<?php

namespace App\Console\Commands;

use App\Enums\Casts\BookingCompletedBy;
use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\DisputedStatus;
use App\Models\Booking;
use App\Models\Log;
use App\Models\User;
use App\Notifications\BookingAutoCompleted;
use App\Notifications\BookingAutoCompletedForAdmin;
use App\Notifications\BookingAutoCompletedForCustomer;
use App\Services\BookingCompletionService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Support\Facades\DB;

#[Signature('app:auto-complete-bookings {--hours=24} {--dry-run}')]
#[Description('تکمیل خودکار رزروهای confirmed که بیش از ۲۴ ساعت از زمان آنها گذشته و اعتراض فعال/حل‌شده ندارند')]
class AutoCompleteBookings extends Command
{
    /**
     * وضعیت‌های اعتراضی که مانع تکمیل خودکار رزرو می‌شن.
     *
     * - pending / investigating / awaiting_response → اعتراض در جریانه
     * - resolved → اعتراض به نفع مشتری حل شده، رزرو باید توسط ادمین تعیین تکلیف بشه
     *
     * rejected و cancelled مانع نیستن.
     */
    private const BLOCKING_DISPUTE_STATUSES = [
        DisputedStatus::pending->value,
        DisputedStatus::investigating->value,
        DisputedStatus::awaitingResponse->value,
        DisputedStatus::resolved->value,
    ];

    public function handle(BookingCompletionService $service)
    {
        $hours = (int) $this->option('hours');
        $isDryRun = $this->option('dry-run');
        $now = Carbon::now();

        $this->info("شروع جستجو (بیش از {$hours} ساعت)...");
        $this->info(
            'اعتراض‌های مانع تکمیل: ' . implode(', ', self::BLOCKING_DISPUTE_STATUSES)
        );

        // ============ پیدا کردن رزروهای واجد شرایط ============
        $bookings = Booking::where('status', BookingStatus::confirmed->value)
            // رزروهایی که اعتراض فعال یا حل‌شده ندارن
            // (SoftDeletes روی Dispute باعث میشه اعتراض‌های حذف‌شده نادیده گرفته بشن)
            ->whereDoesntHave('disputes', function ($q) {
                $q->whereIn('status', self::BLOCKING_DISPUTE_STATUSES);
            })
            // شرط زمان گذشته
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
                $this->line(
                    "  - رزرو #{$booking->id} | آرایشگر: {$booking->barber->name} | مشتری: {$booking->user->name}"
                );
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
                    'status'           => BookingStatus::completed->value,
                    'completed_at'     => now(),
                    'completed_by'     => 'system',
                    'auto_completed'   => true,
                    'auto_complete_at' => now(),
                ]);
                $service->complete($booking, BookingCompletedBy::system->value);
                // ============ ثبت لاگ ============

                (new Log())->storeLog($booking->id,  'auto_complete_booking', "تکمیل خودکار رزرو #{$booking->id} — آرایشگر تایید نکرد (بدون اعتراض فعال)");


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
                        'error'      => $e->getMessage(),
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
                        'error'      => $e->getMessage(),
                    ]);
                }

                // ============ Notification برای ادمین ============
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
                        'error'      => $e->getMessage(),
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
                    'error'      => $e->getMessage(),
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
