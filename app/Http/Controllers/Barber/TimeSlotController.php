<?php

namespace App\Http\Controllers\Barber;

use App\Enums\Casts\TimeSlotStatus;
use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Service;
use App\Models\TimeSlot;
use App\Supports\StickyAlert;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Hekmatinasser\Verta\Verta;
use Illuminate\Support\Facades\DB;

class TimeSlotController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        // ============ بررسی اجباری service_id ============
        $selectedServiceId = $request->input('service_id');

        if (!$selectedServiceId) {
            StickyAlert::alert('برای زمان‌بندی، ابتدا یک سرویس را انتخاب کنید.', 'error');
            return to_route('barber.services.index');
        }

        // ============ بررسی مالکیت سرویس ============
        $service = Service::where('user_id', $user->id)
            ->where('id', $selectedServiceId)
            ->first();

        if (!$service) {
            StickyAlert::alert('این سرویس متعلق به شما نمی‌باشد.', 'error');
            return to_route('barber.services.index');
        }

        // ============ تبدیل تاریخ شمسی به میلادی ============
        $jalaliYear = $request->input('jy');
        $jalaliMonth = $request->input('jm');
        $jalaliDay = $request->input('jd');

        if ($jalaliYear && $jalaliMonth && $jalaliDay) {
            try {
                $selectedDate = Verta::parseFormat(
                    'Y/m/d',
                    sprintf('%04d/%02d/%02d', $jalaliYear, $jalaliMonth, $jalaliDay)
                )->datetime();
            } catch (\Exception $e) {
                $selectedDate = Carbon::today();
            }
        } else {
            $selectedDate = Carbon::today();
        }

        $gregorianDate = Carbon::parse($selectedDate)->toDateString();

        // ============ بازه‌های این تاریخ — فقط برای این سرویس ============
        $timeSlots = TimeSlot::query()
            ->where('user_id', $user->id)
            ->where('service_id', $selectedServiceId)  // ← فیلتر اجباری سرویس
            ->where('date', $gregorianDate)
            ->with(['service', 'bookedBy'])
            ->orderBy('start_time')
            ->get();

        // ============ برنامه هفتگی این روز ============


        // تبدیل ترتیب Carbon (یکشنبه = 0) به ترتیب پروژه (شنبه = 0)
        $dayOfWeek = (Carbon::parse($selectedDate)->dayOfWeek + 1) % 7;

        $availability = Availability::where('user_id', $user->id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->first();

        // ============ خدمات کاربر ============
        $services = Service::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        return Inertia::render('Barber/TimeSlots/Index', [
            'timeSlots' => $timeSlots,
            'services' => $services,
            'selectedDate' => $gregorianDate,
            'availability' => $availability,
            'selectedServiceId' => (int) $selectedServiceId,
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'duration' => $service->duration,
                'price' => $service->price,
                'image' => $service->image ? asset('storage/' . $service->image) : null,
            ],
            'filters' => [
                'service_id' => $selectedServiceId,
            ],
        ]);
    }

    public function generate(Request $request)
    {
        // ============ اعتبارسنجی اطلاعات ورودی ============
        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'service_id' => 'required|exists:services,id',
        ], [
            'date.required' => 'انتخاب تاریخ الزامی است.',
            'date.date' => 'تاریخ انتخاب‌شده معتبر نیست.',
            'date.after_or_equal' => 'تاریخ باید امروز یا بعد از آن باشد.',
            'service_id.required' => 'انتخاب سرویس الزامی است.',
            'service_id.exists' => 'سرویس انتخاب‌شده معتبر نیست.',
        ]);

        $user = auth()->user();

        // ============ بررسی مالکیت سرویس ============
        $service = Service::query()
            ->where('user_id', $user->id)
            ->where('id', $validated['service_id'])
            ->first();

        if (!$service) {
            StickyAlert::alert(
                'این سرویس متعلق به شما نمی‌باشد.',
                'error'
            );

            return redirect()->back();
        }

        // ============ آماده‌سازی تاریخ ============
        $date = Carbon::parse($validated['date'])->startOfDay();
        $gregorianDate = $date->toDateString();

        // ============ تبدیل روز هفته ============
        // شنبه = 0، یکشنبه = 1، ... جمعه = 6
        $dayOfWeek = ($date->dayOfWeek + 1) % 7;

        // ============ دریافت برنامه کاری و شیفت‌ها ============
        $availability = Availability::query()
            ->with('shifts')
            ->where('user_id', $user->id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->first();

        if (!$availability) {
            StickyAlert::alert(
                'برای این روز برنامه کاری تعریف نشده است.',
                'error'
            );

            return redirect()->back();
        }

        if ($availability->shifts->isEmpty()) {
            StickyAlert::alert(
                'برای این روز شیفت کاری تعریف نشده است.',
                'error'
            );

            return redirect()->back();
        }

        // ============ مرتب‌سازی شیفت‌ها ============
        $shifts = $availability->shifts
            ->sortBy('start_time')
            ->values();

        // ============ اعتبارسنجی مدت سرویس ============
        $interval = (int) $service->duration;

        if ($interval <= 0) {
            StickyAlert::alert(
                'مدت زمان سرویس معتبر نیست.',
                'error'
            );

            return redirect()->back();
        }

        // ============ شمارنده بازه‌های قابل رزرو ============
        $availableCount = 0;

        // ============ حذف و تولید تایم‌اسلات‌ها ============
        DB::transaction(function () use (
            $user,
            $service,
            $gregorianDate,
            $shifts,
            $interval,
            &$availableCount
        ) {
            // حذف بازه‌های available قبلی که رزرو ندارند
            TimeSlot::query()
                ->where('user_id', $user->id)
                ->where('service_id', $service->id)
                ->where('date', $gregorianDate)
                ->where('status', 'available')
                ->whereDoesntHave('bookings')
                ->delete();

            // حذف بازه‌های blocked قبلی که رزرو ندارند
            // برای پاک‌سازی رکوردهای قدیمی تولیدشده
            TimeSlot::query()
                ->where('user_id', $user->id)
                ->where('service_id', $service->id)
                ->where('date', $gregorianDate)
                ->where('status', 'blocked')
                ->whereDoesntHave('bookings')
                ->delete();

            // ============ تولید بازه‌های available ============
            foreach ($shifts as $shift) {
                $shiftStart = Carbon::parse(
                    $gregorianDate . ' ' . $shift->start_time
                );

                $shiftEnd = Carbon::parse(
                    $gregorianDate . ' ' . $shift->end_time
                );

                // جلوگیری از تولید بازه برای شیفت نامعتبر
                if (!$shiftStart->lt($shiftEnd)) {
                    continue;
                }

                $cursor = $shiftStart->copy();

                // فقط بازه‌هایی تولید می‌شوند که
                // مدت کامل سرویس در شیفت جا شود
                while (
                    $cursor->copy()->addMinutes($interval)->lte($shiftEnd)
                ) {
                    $slotEnd = $cursor->copy()->addMinutes($interval);

                    TimeSlot::create([
                        'user_id' => $user->id,
                        'service_id' => $service->id,
                        'date' => $gregorianDate,
                        'start_time' => $cursor->format('H:i'),
                        'end_time' => $slotEnd->format('H:i'),
                        'status' => 'available',
                    ]);

                    $cursor->addMinutes($interval);

                    $availableCount++;
                }
            }
        });

        // ============ پیام نتیجه ============
        StickyAlert::alert(
            "{$availableCount} بازه قابل رزرو ساخته شد.",
            'success'
        );

        // ============ بازگشت به تقویم شمسی ============
        return to_route('barber.time-slots.index', [
            'service_id' => $service->id,
            'jy' => verta($date)->format('Y'),
            'jm' => verta($date)->format('m'),
            'jd' => verta($date)->format('d'),
        ]);
    }


    public function update(Request $request, TimeSlot $timeSlot)
    {
        if ($timeSlot->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'required|in:available,booked,blocked',
        ]);

        $timeSlot->update(['status' => $validated['status']]);
        StickyAlert::toast(
            'وضعیت بازه بروزرسانی شد.',
            'success'
        );
        return redirect()->back();
    }

    public function destroy(TimeSlot $timeSlot)
    {
        if ($timeSlot->user_id !== auth()->id()) {
            abort(403);
        }

        $timeSlot->delete();
        StickyAlert::toast(
            'بازه زمانی حذف شد.',
            'success'
        );
        return redirect()->back();
    }
}
