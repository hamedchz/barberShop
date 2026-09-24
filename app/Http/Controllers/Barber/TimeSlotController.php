<?php

namespace App\Http\Controllers\Barber;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Service;
use App\Models\TimeSlot;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimeSlotController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $jalaliYear = $request->input('jy', null);
        $jalaliMonth = $request->input('jm', null);
        $jalaliDay = $request->input('jd', null);

        // اگر تاریخ انتخاب نشده، امروز
        $selectedDate = $jalaliYear && $jalaliMonth && $jalaliDay
            ? \Morilog\Jalali\Jalalian::fromFormat('Y/m/d', "$jalaliYear/$jalaliMonth/$jalaliDay")->toCarbon()
            : Carbon::today();

        // بازه‌های این تاریخ
        $timeSlots = TimeSlot::where('user_id', $user->id)
            ->where('date', $selectedDate->toDateString())
            ->with(['service', 'bookedBy'])
            ->orderBy('start_time')
            ->get();

        // بررسی اینکه این روز در برنامه هفتگی هست یا نه
        $availability = Availability::where('user_id', $user->id)
            ->where('day_of_week', $selectedDate->dayOfWeek)
            ->where('is_active', true)
            ->first();

        // خدمات
        $services = Service::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        return Inertia::render('Barber/TimeSlots/Index', [
            'timeSlots' => $timeSlots,
            'services' => $services,
            'selectedDate' => $selectedDate->toDateString(),
            'availability' => $availability,
        ]);
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'service_id' => 'nullable|exists:services,id',
        ], [
            'date.required' => 'انتخاب تاریخ الزامی است.',
            'date.after_or_equal' => 'تاریخ باید امروز یا بعد از آن باشد.',
        ]);

        $user = auth()->user();
        $date = Carbon::parse($validated['date']);
        $dayOfWeek = $date->dayOfWeek;

        // بررسی برنامه کاری
        $availability = Availability::where('user_id', $user->id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->first();

        if (!$availability) {
            return redirect()->back()->with('error', 'برای این روز برنامه کاری تعریف نشده است.');
        }

        // حذف بازه‌های available قبلی
        TimeSlot::where('user_id', $user->id)
            ->where('date', $date->toDateString())
            ->where('status', 'available')
            ->delete();

        // ساخت بازه‌های جدید
        $start = Carbon::parse($date->toDateString() . ' ' . $availability->start_time);
        $end = Carbon::parse($date->toDateString() . ' ' . $availability->end_time);

        $service = $validated['service_id'] ? Service::find($validated['service_id']) : null;
        $interval = $service ? $service->duration : 30;

        $slotsCreated = 0;
        while ($start->copy()->addMinutes($interval)->lte($end)) {
            TimeSlot::create([
                'user_id' => $user->id,
                'service_id' => $validated['service_id'] ?? null,
                'date' => $date->toDateString(),
                'start_time' => $start->format('H:i'),
                'end_time' => $start->copy()->addMinutes($interval)->format('H:i'),
                'status' => 'available',
            ]);
            $start->addMinutes($interval);
            $slotsCreated++;
        }

        return redirect()
            ->route('barber.time-slots.index', [
                'date' => $date->toDateString(),
            ])
            ->with('success', "$slotsCreated بازه زمانی ساخته شد.");
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
