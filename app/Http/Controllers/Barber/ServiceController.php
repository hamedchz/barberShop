<?php

namespace App\Http\Controllers\Barber;

use App\Enums\Casts\LogsStatus;
use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ServiceController extends Controller
{

    public function index(Request $request)
    {
        $query = Service::where('user_id', auth()->id());

        // ============ جستجو ============
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // ============ فیلتر وضعیت ============
        if ($status = $request->input('status')) {
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $services = $query->latest()->paginate(21)->withQueryString();

        // ============ تبدیل داده‌ها ============
        $services->through(function ($service) {
            return [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'image' => $service->image
                    ? asset('storage/' . $service->image)
                    : null,
                'duration' => $service->duration,
                'price' => $service->price,
                'is_active' => (bool) $service->is_active,
                'created_at' => $service->created_at,
                'updated_at' => $service->updated_at,
            ];
        });

        return Inertia::render('Barber/Services/Index', [
            'services' => $services,
            'filters' => [
                'search' => $search ?? '',
                'status' => $request->input('status', ''),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Barber/Services/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'duration' => 'required|integer|min:1|max:480',
            'price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('services', 'public');
        }

        $validated['user_id'] = auth()->id();

        $store =  Service::create($validated);
        if ($store) {
            (new \App\Models\Log())->storeLog($store->id, LogsStatus::store->value . ' خدمت ', LogsStatus::store->value);
            StickyAlert::toast(
                'خدمت با موفقیت ایجاد شد.',
                'success'
            );
        } else {
            StickyAlert::toast(
                'مشکلی وجود دارد.',
                'error'
            );
        }

        return to_route('barber.time-slots.index', ['service_id' => $store->id]);
    }

    public function edit(Service $service)
    {
        if ($service->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Barber/Services/Edit', [
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'image' => $service->image
                    ? asset('storage/' . $service->image)
                    : null,  // ← URL کامل
                'duration' => $service->duration,
                'price' => $service->price,
                'is_active' => $service->is_active,
                'created_at' => $service->created_at,
                'updated_at' => $service->updated_at,
            ],
        ]);
    }

    public function update(Request $request, Service $service)
    {

        if ($service->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'duration' => 'required|integer|min:5|max:480',
            'price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // ← آپلود عکس جدید (و حذف قبلی)
        if ($request->hasFile('image')) {
            // حذف عکس قبلی
            if ($service->image && Storage::disk('public')->exists($service->image)) {
                Storage::disk('public')->delete($service->image);
            }
            $validated['image'] = $request->file('image')->store('services', 'public');
        } else {
            // اگر عکسی آپلود نشد، عکس قبلی حفظ شود
            unset($validated['image']);
        }

        $store = $service->update($validated);

        if ($store) {
            (new \App\Models\Log())->storeLog($service->id, LogsStatus::edit->value . ' خدمت ', LogsStatus::edit->value);
            StickyAlert::toast(
                'خدمت با موفقیت ویرایش شد.',
                'success'
            );
        } else {
            StickyAlert::toast(
                'مشکلی وجود دارد.',
                'error'
            );
        }

        return to_route('barber.services.index');
    }

    public function destroy(Service $service)
    {
        if ($service->user_id !== auth()->id()) {
            abort(403);
        }

        $delete = $service->delete();

        if ($delete) {
            (new \App\Models\Log())->storeLog($service->id, LogsStatus::delete->value . ' خدمت ', LogsStatus::store->value);
            StickyAlert::toast(
                'خدمت با موفقیت حذف شد.',
                'success'
            );
        } else {
            StickyAlert::toast(
                'مشکلی وجود دارد.',
                'error'
            );
        }

        return to_route('barber.services.index');
    }
}
