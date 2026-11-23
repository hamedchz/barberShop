<?php

namespace App\Http\Controllers\Barber;

use App\Enums\Casts\BookingStatus;
use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceController extends Controller
{
    /**
     * لیست خدمات آرایشگر
     */
    public function index()
    {
        $services = Service::query()
            ->where('user_id', auth()->id())
            ->with('category')
            ->latest()
            ->get()->map(fn($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'is_active' => $service->is_active,
                'price' => $service->price,
                'duration' => $service->duration,
                'image' => $service->image ? asset('storage/' . $service->image) : null,

            ]);



        return inertia('Barber/Services/Index', [
            'services' => $services,
        ]);
    }

    /**
     * نمایش سرویس‌های تعریف‌شده توسط ادمین
     */
    public function create(Request $request)
    {
        $barberId = auth()->id();

        $categories = ServiceCategory::query()
            ->active()
            ->ordered()
            ->whereDoesntHave('services', function ($query) use ($barberId) {
                $query->withTrashed()
                    ->where('user_id', $barberId);
            })
            ->get();

        $selectedCategory = null;

        if ($request->filled('category_id')) {
            $selectedCategory = $categories->firstWhere(
                'id',
                (int) $request->category_id
            );

            abort_unless($selectedCategory, 404);
        }

        return inertia('Barber/Services/Create', [
            'categories' => $categories,
            'selectedCategory' => $selectedCategory,
        ]);
    }

    public function configure(ServiceCategory $category)
    {
        abort_unless($category->is_active, 404);

        $exists = Service::withTrashed()
            ->where('user_id', auth()->id())
            ->where('category_id', $category->id)
            ->exists();

        abort_if($exists, 404);

        return inertia('Barber/Services/Configure', [
            'category' => $category,
        ]);
    }

    /**
     * ثبت سرویس برای آرایشگر
     */
    public function store(Request $request)
    {

        $validated = $request->validate([
            'category_id' => [
                'required',
                'integer',
                Rule::exists('service_categories', 'id')
                    ->where('is_active', true)
                    ->whereNull('deleted_at'),
            ],
            'price' => ['nullable', 'numeric', 'min:0'],
            'duration' => ['nullable', 'integer', 'min:5', 'max:600'],
        ]);

        $barberId = auth()->id();

        $existingService = Service::withTrashed()
            ->where('user_id', $barberId)
            ->where('category_id', $validated['category_id'])
            ->first();

        if ($existingService && !$existingService->trashed()) {

            return back()->withErrors([
                'category_id' => 'این سرویس قبلاً به خدمات شما اضافه شده است.',
            ]);
        }
        $category = ServiceCategory::findOrFail($validated['category_id']);
        if ($existingService) {
            $existingService->restore();

            $existingService->update([
                'price' => $validated['price'] ?? null,
                'duration' => $validated['duration'] ?? null,
                'is_active' => true,
            ]);
        } else {
            Service::create([
                'user_id' => $barberId,
                'category_id' => $validated['category_id'],
                'price' => $validated['price'] ?? null,
                'duration' => $validated['duration'] ?? null,
                'is_active' => true,
            ]);
        }
        StickyAlert::toast('سرویس با موفقیت به خدمات شما اضافه شد.', 'success');
        return redirect()->back();
    }

    /**
     * صفحه ویرایش قیمت و زمان
     */
    public function edit(Service $service)
    {
        abort_unless($service->user_id === auth()->id(), 403);

        $service->load('category');

        return inertia('Barber/Services/Edit', [
            'service' => $service,
        ]);
    }

    /**
     * ذخیره قیمت و زمان
     */
    public function update(Request $request, Service $service)
    {
        abort_unless($service->user_id === auth()->id(), 403);

        $validated = $request->validate([
            'price' => ['nullable', 'numeric', 'min:0'],
            'duration' => ['nullable', 'integer', 'min:5', 'max:600'],
            'is_active' => ['sometimes', 'boolean'],
        ]);



        $message = 'اطلاعات سرویس با موفقیت ویرایش شد.';
        if ($request->has('toggle') && !is_null($request->toggle) && $request->boolean('toggle')) {
            $hasActiveBookings = $service->bookings()
                ->whereIn('status', [
                    BookingStatus::pending->value,
                    BookingStatus::confirmed->value,
                ])
                ->exists();

            if ($hasActiveBookings) {
                StickyAlert::alert(
                    'این سرویس دارای رزرو فعال است. ابتدا باید رزروهای آن تعیین تکلیف شوند.',
                    'error'
                );

                return back();
            }
            if ($service->is_active) {
                $message = 'سرویس غیر فعال شد.';
            } else {
                $message = 'سرویس  فعال شد.';
            }
        }

        $service->update($validated);
        StickyAlert::toast($message, 'success');
        return to_route('barber.services.index');
    }

    /**
     * حذف سرویس
     */
    public function destroy(Service $service)
    {
        abort_unless($service->user_id === auth()->id(), 403);

        $hasActiveBookings = $service->bookings()
            ->whereIn('status', [
                BookingStatus::pending->value,
                BookingStatus::confirmed->value,
            ])
            ->exists();

        if ($hasActiveBookings) {
            StickyAlert::alert(
                'این سرویس دارای رزرو فعال است. ابتدا باید رزروهای آن تعیین تکلیف شوند.',
                'error'
            );

            return back();
        }

        $service->delete();

        StickyAlert::toast(
            'سرویس از خدمات شما حذف شد.',
            'success'
        );

        return to_route('barber.services.index');
    }
}
