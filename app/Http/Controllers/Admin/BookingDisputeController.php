<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\TimeSlotStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingDisputeController extends Controller
{
    public function resolve(Request $request, Booking $booking)
    {
        if (!$booking->is_disputed) {
            return back()->with('error', 'این رزرو اعتراضی ندارد.');
        }

        $validated = $request->validate([
            'decision' => 'required|in:approve,reject',
            'resolution' => 'required|string|min:10|max:1000',
            'refund_amount' => 'nullable|numeric|min:0|max:' . $booking->amount,
        ], [
            'decision.required' => 'لطفاً تصمیم خود را انتخاب کنید.',
            'resolution.required' => 'لطفاً توضیحات را وارد کنید.',
        ]);

        DB::beginTransaction();

        try {
            if ($validated['decision'] === 'approve') {
                // ============ تایید اعتراض ============
                $refundAmount = $validated['refund_amount'] ?? $booking->amount;

                $booking->update([
                    'status' => BookingStatus::cancelled->value,
                    'cancelled_at' => now(),
                    'cancelled_by' => 'admin',
                    'dispute_status' => 'resolved',
                    'dispute_resolved_at' => now(),
                    'dispute_resolved_by' => auth()->id(),
                    'dispute_resolution' => $validated['resolution'],
                    'refund_amount' => $refundAmount,
                ]);

                // بازگشت مبلغ
                $this->refundToCustomer($booking, $refundAmount);

                // آزاد کردن بازه
                if ($booking->timeSlot) {
                    $booking->timeSlot->update([
                        'status' => TimeSlotStatus::available->value,
                        'booked_by' => null,
                    ]);
                }

                // جریمه آرایشگر (اختیاری)
                $penalty = $refundAmount * 0.2; // ۲۰٪ جریمه
                $booking->barber->decrement('wallet_balance', $penalty);

                // کاهش امتیاز آرایشگر
                $booking->barber->decrement('rating_points', 10);

                // Notification به هر دو طرف
                $booking->user->notify(
                    new \App\Notifications\DisputeResolvedForCustomer($booking, 'approved')
                );
                $booking->barber->notify(
                    new \App\Notifications\DisputeResolvedForBarber($booking, 'approved')
                );
            } else {
                // ============ رد اعتراض ============
                $booking->update([
                    'dispute_status' => 'rejected',
                    'dispute_resolved_at' => now(),
                    'dispute_resolved_by' => auth()->id(),
                    'dispute_resolution' => $validated['resolution'],
                ]);

                // Notification به مشتری
                $booking->user->notify(
                    new \App\Notifications\DisputeResolvedForCustomer($booking, 'rejected')
                );
            }

            DB::commit();

            return back()->with('success', 'اعتراض بررسی و تصمیم ثبت شد.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Dispute resolution failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', 'خطا در بررسی اعتراض.');
        }
    }

    /**
     * بازگشت مبلغ به مشتری
     */
    private function refundToCustomer(Booking $booking, float $amount): void
    {
        // بازگشت به کیف پول (سریع)
        $booking->user->increment('wallet_balance', $amount);

        \App\Models\WalletTransaction::create([
            'user_id' => $booking->user_id,
            'type' => 'credit',
            'amount' => $amount,
            'reference_type' => Booking::class,
            'reference_id' => $booking->id,
            'description' => "بازگشت مبلغ رزرو #{$booking->id} به دلیل اعتراض تایید شده",
            'status' => 'completed',
        ]);

        // یا بازگشت به درگاه (کند)
        // $this->gatewayRefund($booking->payment, $amount);
    }
}
