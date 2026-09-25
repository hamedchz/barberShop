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

class TimeSlotController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        // ============ بررسی اجباری service_id ============
        $selectedServiceId = $request->input('service_id');

        if (!$selectedServiceId) {
            return redirect()
                ->route('barber.services.index')
                ->with('error', 'برای زمان‌بندی، ابتدا یک سرویس را انتخاب کنید.');
        }

        // ============ بررسی مالکیت سرویس ============
        $service = Service::where('user_id', $user->id)
            ->where('id', $selectedServiceId)
            ->first();

        if (!$service) {
            return redirect()
                ->route('barber.services.index')
                ->with('error', 'این سرویس متعلق به شما نمی‌باشد.');
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
        $availability = Availability::where('user_id', $user->id)
            ->where('day_of_week', Carbon::parse($selectedDate)->dayOfWeek)
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
        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'service_id' => 'required|exists:services,id',  // ← اجباری
        ], [
            'date.required' => 'انتخاب تاریخ الزامی است.',
            'date.after_or_equal' => 'تاریخ باید امروز یا بعد از آن باشد.',
            'service_id.required' => 'انتخاب سرویس الزامی است.',
            'service_id.exists' => 'سرویس انتخاب شده معتبر نیست.',
        ]);

        $user = auth()->user();

        // ============ بررسی مالکیت سرویس ============
        $service = Service::where('user_id', $user->id)
            ->where('id', $validated['service_id'])
            ->first();

        if (!$service) {
            return redirect()->back()->with('error', 'این سرویس متعلق به شما نمی‌باشد.');
        }

        $date = Carbon::parse($validated['date']);
        $dayOfWeek = $date->dayOfWeek;

        $availability = Availability::where('user_id', $user->id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->first();

        if (!$availability) {
            return redirect()->back()->with('error', 'برای این روز برنامه کاری تعریف نشده است.');
        }

        // حذف بازه‌های available قبلی **برای این سرویس در این تاریخ**
        TimeSlot::where('user_id', $user->id)
            ->where('service_id', $validated['service_id'])
            ->where('date', $date->toDateString())
            ->where('status', 'available')
            ->delete();

        // ساخت بازه‌ها
        $start = Carbon::parse($date->toDateString() . ' ' . $availability->start_time);
        $end = Carbon::parse($date->toDateString() . ' ' . $availability->end_time);
        $interval = $service->duration;

        $count = 0;
        while ($start->copy()->addMinutes($interval)->lte($end)) {
            TimeSlot::create([
                'user_id' => $user->id,
                'service_id' => $validated['service_id'],
                'date' => $date->toDateString(),
                'start_time' => $start->format('H:i'),
                'end_time' => $start->copy()->addMinutes($interval)->format('H:i'),
                'status' => 'available',
            ]);
            $start->addMinutes($interval);
            $count++;
        }

        return redirect()
            ->route('barber.time-slots.index', [
                'service_id' => $validated['service_id'],
                'jy' => verta($date)->format('Y'),
                'jm' => verta($date)->format('m'),
                'jd' => verta($date)->format('d'),
            ])
            ->with('success', "$count بازه زمانی ساخته شد.");
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

        return redirect()->back()->with('success', 'وضعیت بازه بروزرسانی شد.');
    }

    public function destroy(TimeSlot $timeSlot)
    {
        if ($timeSlot->user_id !== auth()->id()) {
            abort(403);
        }

        $timeSlot->delete();

        return redirect()->back()->with('success', 'بازه زمانی حذف شد.');
    }
}
