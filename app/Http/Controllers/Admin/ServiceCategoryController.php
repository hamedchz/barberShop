<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ServiceCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = ServiceCategory::query()->ordered();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $categories = $query
            ->withCount(['activeServices as services_count'])
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/ServiceCategories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/ServiceCategories/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:service_categories,name',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer|min:0',
            'min_price' => 'nullable|integer|min:0',
            'max_price' => 'nullable|integer|min:0|gte:min_price',
            'suggested_duration' => 'nullable|integer|min:5|max:480',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')
                ->store('service-categories', 'public');
        }

        ServiceCategory::create($validated);
        StickyAlert::toast('دسته‌بندی خدمات با موفقیت ایجاد شد.', 'success');
        return redirect()->back();
    }

    public function edit(ServiceCategory $serviceCategory)
    {
        return Inertia::render('Admin/ServiceCategories/Edit', [
            'category' => $serviceCategory,
        ]);
    }

    public function update(Request $request, ServiceCategory $serviceCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:service_categories,name,' . $serviceCategory->id,
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer|min:0',
            'min_price' => 'nullable|integer|min:0',
            'max_price' => 'nullable|integer|min:0|gte:min_price',
            'suggested_duration' => 'nullable|integer|min:5|max:480',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($serviceCategory->image) {
                Storage::disk('public')->delete($serviceCategory->image);
            }
            $validated['image'] = $request->file('image')
                ->store('service-categories', 'public');
        }

        $serviceCategory->update($validated);
        StickyAlert::toast('دسته‌بندی بروزرسانی شد.', 'success');
        return redirect()->back();
    }

    public function destroy(ServiceCategory $serviceCategory)
    {
        if ($serviceCategory->services()->exists()) {
            StickyAlert::alert('این دسته‌بندی دارای خدمت است و قابل حذف نیست.', 'error');
            return redirect()->back();
        }

        if ($serviceCategory->image) {
            Storage::disk('public')->delete($serviceCategory->image);
        }

        $serviceCategory->delete();
        StickyAlert::toast('دسته‌بندی حذف شد.', 'success');
        return redirect()->back();
    }

    public function toggleStatus(ServiceCategory $serviceCategory)
    {
        $serviceCategory->update(['is_active' => !$serviceCategory->is_active]);
        StickyAlert::toast('وضعیت تغییر کرد.', 'success');
        return redirect()->back();
    }
}
