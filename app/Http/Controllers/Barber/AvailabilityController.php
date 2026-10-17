<?php

namespace App\Http\Controllers\Barber;

use App\Enums\Casts\LogsStatus;
use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\AvailabilityShift;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AvailabilityController extends Controller
{

    // ============ Validation مشترک ============
    private function validateRequest(Request $request): array
    {
        $validated = $request->validate([
            'day_of_week' => 'required|integer|between:0,6',
            'shifts' => 'required|array|min:1',
            'shifts.*.start_time' => 'required|date_format:H:i',
            'shifts.*.end_time' => 'required|date_format:H:i|after:shifts.*.start_time',
        ], [
            'day_of_week.required' => 'انتخاب روز هفته الزامی است.',
            'day_of_week.between' => 'روز هفته معتبر نیست.',
            'shifts.required' => 'حداقل یک شیفت باید تعریف شود.',
            'shifts.array' => 'فرمت شیفت‌ها معتبر نیست.',
            'shifts.min' => 'حداقل یک شیفت باید تعریف شود.',
            'shifts.*.start_time.required' => 'ساعت شروع هر شیفت الزامی است.',
            'shifts.*.start_time.date_format' => 'فرمت ساعت شروع معتبر نیست (HH:MM).',
            'shifts.*.end_time.required' => 'ساعت پایان هر شیفت الزامی است.',
            'shifts.*.end_time.date_format' => 'فرمت ساعت پایان معتبر نیست (HH:MM).',
            'shifts.*.end_time.after' => 'ساعت پایان باید بعد از شروع باشد.',
        ]);

        // ============ بررسی تداخل شیفت‌ها ============
        $shifts = collect($validated['shifts'])
            ->sortBy('start_time')
            ->values();

        for ($i = 0; $i < $shifts->count() - 1; $i++) {
            if ($shifts[$i]['end_time'] > $shifts[$i + 1]['start_time']) {
                throw ValidationException::withMessages([
                    'shifts' => 'شیفت‌ها با یکدیگر تداخل دارند. لطفاً ساعات را اصلاح کنید.',
                ]);
            }
        }

        return $validated;
    }
    public function index()
    {
        $availabilities = Availability::with('shifts')
            ->where('user_id', auth()->id())
            ->orderBy('day_of_week')
            ->get();

        return inertia('Barber/Availabilities/Index', [
            'availabilities' => $availabilities,
            'daysOfWeek' => [
                0 => 'شنبه',
                1 => 'یکشنبه',
                2 => 'دوشنبه',
                3 => 'سه‌شنبه',
                4 => 'چهارشنبه',
                5 => 'پنجشنبه',
                6 => 'جمعه',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateRequest($request);

        $user = auth()->user();

        // جلوگیری از تعریف تکراری
        $exists = Availability::where('user_id', $user->id)
            ->where('day_of_week', $validated['day_of_week'])
            ->exists();

        if ($exists) {

            return redirect()->back()->withErrors([
                'day_of_week' => 'این روز قبلاً تعریف شده است.',
            ]);
        }

        DB::transaction(function () use ($user, $validated) {
            $availability = Availability::create([
                'user_id' => $user->id,
                'day_of_week' => $validated['day_of_week'],
                'is_active' => true,
                // برای سازگاری با کد قدیمی، بازه کلی رو از اولین تا آخرین شیفت می‌ذاریم
                'start_time' => $validated['shifts'][0]['start_time'],
                'end_time' => end($validated['shifts'])['end_time'],
            ]);

            foreach ($validated['shifts'] as $index => $shift) {
                $availability->shifts()->create([
                    'start_time' => $shift['start_time'],
                    'end_time' => $shift['end_time'],
                    'order' => $index,
                ]);
            }
        });
        StickyAlert::toast(
            'برنامه روز با موفقیت ذخیره شد.',
            'success'
        );
        return to_route('barber.availabilities.index');
    }

    public function update(Request $request, Availability $availability)
    {
        if ($availability->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $this->validateRequest($request);

        DB::transaction(function () use ($availability, $validated) {
            $availability->update([
                'day_of_week' => $validated['day_of_week'],
                'start_time' => $validated['shifts'][0]['start_time'],
                'end_time' => end($validated['shifts'])['end_time'],
            ]);

            // حذف شیفت‌های قبلی و ساخت جدیدها
            $availability->shifts()->delete();

            foreach ($validated['shifts'] as $index => $shift) {
                $availability->shifts()->create([
                    'start_time' => $shift['start_time'],
                    'end_time' => $shift['end_time'],
                    'order' => $index,
                ]);
            }
        });
        StickyAlert::toast(
            'برنامه روز با موفقیت بروزرسانی شد.',
            'success'
        );
        return to_route('barber.availabilities.index');
    }
    // ============ حذف ============
    public function destroy(Availability $availability)
    {
        if ($availability->user_id !== auth()->id()) {
            abort(403);
        }

        DB::transaction(function () use ($availability) {
            $availability->shifts()->delete();
            $availability->delete();
        });
        StickyAlert::toast(
            'روز از برنامه هفتگی حذف شد.',
            'success'
        );
        return to_route('barber.availabilities.index');
    }


    public function destroyShift(Availability $availability, AvailabilityShift $shift)
    {
        if ($availability->user_id !== auth()->id()) {
            abort(403);
        }

        if ($shift->availability_id !== $availability->id) {
            abort(404);
        }

        // اگه تنها شیفت بود، کل روز حذف بشه
        if ($availability->shifts()->count() <= 1) {
            $availability->delete();

            StickyAlert::toast(
                'روز به طور کامل حذف شد (آخرین شیفت بود).',
                'success'
            );
            return to_route('barber.availabilities.index');
        }

        DB::transaction(function () use ($availability, $shift) {
            $shift->delete();
            // بازچینش order
            $availability->shifts()
                ->orderBy('order')
                ->get()
                ->each(fn($s, $i) => $s->order !== $i ? $s->update(['order' => $i]) : null);
        });
        StickyAlert::toast(
            'شیفت با موفقیت حذف شد.',
            'success'
        );
        return to_route('barber.availabilities.index');
    }
}
