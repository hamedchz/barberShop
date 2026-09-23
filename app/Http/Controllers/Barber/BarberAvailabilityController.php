<?php

namespace App\Http\Controllers\Barber;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Service;
use App\Models\TimeSlot;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BarberAvailabilityController extends Controller
{
    /**
     * صفحه مدیریت ساعات کاری
     */
    public function index()
    {
        $user = auth()->user();

        // برنامه هفتگی
        $availabilities = Availability::where('user_id', $user->id)
            ->orderBy('day_of_week')
            ->get();

        // خدمات
        $services = Service::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        // بازه‌های زمانی هفته جاری
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        $timeSlots = TimeSlot::where('user_id', $user->id)
            ->whereBetween('date', [$startOfWeek, $endOfWeek])
            ->with(['service', 'bookedBy'])
            ->orderBy('date')
            ->orderBy('start_time')
            ->get()
            ->groupBy('date');

        return Inertia::render('Barber/Availability/Index', [
            'availabilities' => $availabilities,
            'services' => $services,
            'timeSlots' => $timeSlots,
            'daysOfWeek' => Availability::daysOfWeek(),
            'startOfWeek' => $startOfWeek->toDateString(),
        ]);
    }

    /**
     * ذخیره برنامه هفتگی
     */
    public function storeAvailability(Request $request)
    {
        $validated = $request->validate([
            'day_of_week' => 'required|integer|min:0|max:6',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        Availability::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'day_of_week' => $validated['day_of_week'],
            ],
            [
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'is_active' => true,
            ]
        );

        return redirect()->back()->with('success', 'برنامه کاری ذخیره شد.');
    }

    /**
     * حذف یک روز از برنامه
     */
    public function destroyAvailability(Availability $availability)
    {
        if ($availability->user_id !== auth()->id()) {
            abort(403);
        }

        $availability->delete();

        return redirect()->back()->with('success', 'روز مورد نظر از برنامه حذف شد.');
    }

    /**
     * ساخت بازه‌های زمانی برای یک تاریخ خاص
     */
    public function generateTimeSlots(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'service_id' => 'nullable|exists:services,id',
        ]);

        $user = auth()->user();
        $date = Carbon::parse($validated['date']);
        $dayOfWeek = $date->dayOfWeek;

        // پیدا کردن برنامه کاری برای این روز
        $availability = Availability::where('user_id', $user->id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->first();

        if (!$availability) {
            return redirect()->back()->with('error', 'برای این روز برنامه کاری تعریف نشده است.');
        }

        // حذف بازه‌های قبلی این تاریخ (فقط آن‌های available)
        TimeSlot::where('user_id', $user->id)
            ->where('date', $date->toDateString())
            ->where('status', 'available')
            ->delete();

        // ساخت بازه‌های جدید با فاصله ۳۰ دقیقه
        $start = Carbon::parse($date->toDateString() . ' ' . $availability->start_time);
        $end = Carbon::parse($date->toDateString() . ' ' . $availability->end_time);

        $service = $validated['service_id'] ? Service::find($validated['service_id']) : null;
        $interval = $service ? $service->duration : 30;

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
        }

        return redirect()->back()->with('success', 'بازه‌های زمانی ساخته شد.');
    }

    /**
     * تغییر وضعیت یک بازه (available/booked/blocked)
     */
    public function updateTimeSlot(Request $request, TimeSlot $timeSlot)
    {
        if ($timeSlot->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'required|in:available,booked,blocked',
        ]);

        $timeSlot->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'وضعیت بازه زمانی بروزرسانی شد.');
    }

    /**
     * حذف یک بازه زمانی
     */
    public function destroyTimeSlot(TimeSlot $timeSlot)
    {
        if ($timeSlot->user_id !== auth()->id()) {
            abort(403);
        }

        $timeSlot->delete();

        return redirect()->back()->with('success', 'بازه زمانی حذف شد.');
    }
}
