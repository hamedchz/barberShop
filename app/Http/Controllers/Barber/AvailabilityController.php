<?php

namespace App\Http\Controllers\Barber;

use App\Enums\Casts\LogsStatus;
use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Supports\StickyAlert;
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
        ]);
        $store = Availability::updateOrCreate(
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

        if ($store) {
            (new \App\Models\Log())->storeLog($store->id, LogsStatus::store->value . ' برنامه کاری ', LogsStatus::store->value);
            StickyAlert::toast(
                'برنامه کاری با موفقیت ایجاد شد.',
                'success'
            );
        } else {
            StickyAlert::toast(
                'مشکلی وجود دارد.',
                'error'
            );
        }
        return to_route('barber.availabilities.index');
    }

    public function destroy(Availability $availability)
    {
        if ($availability->user_id !== auth()->id()) {
            abort(403);
        }

        $delete = $availability->delete();

        if ($delete) {
            (new \App\Models\Log())->storeLog($availability->id, LogsStatus::delete->value . ' برنامه کاری ', LogsStatus::delete->value);
            StickyAlert::toast(
                'روز مورد نظر حذف شد.',
                'success'
            );
        } else {
            StickyAlert::toast(
                'مشکلی وجود دارد.',
                'error'
            );
        }
        return to_route('barber.availabilities.index');
    }
}
