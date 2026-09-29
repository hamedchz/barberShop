<?php

namespace App\Http\Controllers\Customer;

use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\TimeSlotStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\TimeSlot;
use App\Supports\StickyAlert;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * مرحله ۱: ایجاد رزرو موقت (pending) و نمایش صفحه انتخاب درگاه
     */
    public function create(Request $request)
    {


        $validated = $request->validate([
            'time_slot_id' => 'required|exists:time_slots,id',
        ]);

        $user = auth()->user();
        $slot = TimeSlot::with(['service', 'user'])
            ->findOrFail($validated['time_slot_id']);

        // ============ بررسی اعتبار بازه ============
        if ($slot->status->value !== TimeSlotStatus::available->value) {
            StickyAlert::alert('این بازه قابل رزرو نیست.', 'error');
            return redirect()->back();
        }

        // ============ بررسی گذشته نبودن ============
        $slotDateDate = Carbon::parse($slot->date)->format('Y-m-d');
        $slotDateTime = Carbon::parse($slotDateDate . ' ' . $slot->start_time);

        if ($slotDateTime->lessThan(Carbon::now())) {

            StickyAlert::alert('این بازه گذشته است.', 'error');
            return redirect()->back();
        }

        // ============ بررسی مالکیت (نمی‌تواند نوبت خودش را رزرو کند) ============
        if ($slot->user_id === $user->id) {
            StickyAlert::alert('نمی‌توانید نوبت خودتان را رزرو کنید.', 'error');
            return redirect()->back();
        }

        // ============ ایجاد رزرو موقت ============
        $booking = Booking::create([
            'user_id' => $user->id,
            'barber_id' => $slot->user_id,
            'service_id' => $slot->service_id,
            'time_slot_id' => $slot->id,
            'status' => BookingStatus::pending->value,
            'amount' => $slot->service->price ?? 0,
        ]);

        // ============ رزرو موقت بازه ============
        // (وضعیت blocked تا کاربر دیگر نتواند رزرو کند)
        $slot->update(['status' => TimeSlotStatus::blocked->value]);

        // ============ لیست درگاه‌های فعال ============
        $gateways = collect(config('payment.gateways'))
            ->filter(fn($gw) => $gw['enabled'])
            ->map(fn($gw, $key) => [
                'id' => $key,
                'name' => $gw['name'],
                'logo' => $gw['logo'],
                'color' => $gw['color'],
            ])
            ->values()
            ->toArray();

        return Inertia::render('Customer/Payment/Select', [
            'booking' => [
                'id' => $booking->id,
                'barber' => [
                    'id' => $slot->user->id,
                    'name' => $slot->user->name,
                    'avatar' => $slot->user->avatar,
                ],
                'service' => [
                    'id' => $slot->service->id,
                    'name' => $slot->service->name,
                    'duration' => $slot->service->duration,
                ],
                'date' => $slot->date,
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'amount' => $booking->amount,
            ],
            'gateways' => $gateways,
        ]);
    }
}
