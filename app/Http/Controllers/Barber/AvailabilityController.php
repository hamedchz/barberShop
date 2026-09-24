<?php

namespace App\Http\Controllers\Barber;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AvailabilityController extends Controller
{
    public function index()
    {
        $availabilities = Availability::where('user_id', auth()->id())
            ->orderBy('day_of_week')
            ->get();

        return Inertia::render('Barber/Availabilities/Index', [
            'availabilities' => $availabilities,
            'daysOfWeek' => Availability::daysOfWeek(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'day_of_week' => 'required|integer|min:0|max:6',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ], [
            'day_of_week.required' => 'انتخاب روز هفته الزامی است.',
            'start_time.required' => 'ساعت شروع الزامی است.',
            'end_time.after' => 'ساعت پایان باید بعد از ساعت شروع باشد.',
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

        return redirect()
            ->route('barber.availabilities.index')
            ->with('success', 'برنامه کاری ذخیره شد.');
    }

    public function destroy(Availability $availability)
    {
        if ($availability->user_id !== auth()->id()) {
            abort(403);
        }

        $availability->delete();

        return redirect()
            ->route('barber.availabilities.index')
            ->with('success', 'روز مورد نظر حذف شد.');
    }
}
