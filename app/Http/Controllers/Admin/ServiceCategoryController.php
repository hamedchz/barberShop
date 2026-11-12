<?php

namespace App\Http\Controllers\Admin;

use App\Facades\GenerateUtf8Slug;
use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ServiceCategoryController extends Controller
{
    /**
     * لیست دسته‌بندی‌ها
     */
    public function index(Request $request)
    {
        $query = ServiceCategory::query()->ordered();

        // جستجو
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        // فیلتر وضعیت
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $categories = $query
            ->withCount(['activeServices as services_count'])
            ->paginate(12)
            ->withQueryString()
            ->through(fn($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'image_url' => $category->image_url,
                'icon' => $category->icon,
                'color' => $category->color,
                'min_price' => $category->min_price,
                'max_price' => $category->max_price,
                'suggested_duration' => $category->suggested_duration,
                'sort_order' => $category->sort_order,
                'is_active' => $category->is_active,
                'services_count' => $category->services_count,
                'created_at' => $category->created_at->toIso8601String(),
            ]);

        // آمار کلی
        $stats = [
            'total' => ServiceCategory::count(),
            'active' => ServiceCategory::where('is_active', true)->count(),
            'inactive' => ServiceCategory::where('is_active', false)->count(),
            'total_services' => \App\Models\Service::count(),
        ];

        return Inertia::render('Admin/ServiceCategories/Index', [
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
            'colors' => $this->getAvailableColors(),
            'icons' => $this->getAvailableIcons(),
        ]);
    }

    /**
     * فرم ایجاد
     */
    public function create()
    {
        return Inertia::render('Admin/ServiceCategories/Create', [
            'colors' => $this->getAvailableColors(),
            'icons' => $this->getAvailableIcons(),
        ]);
    }

    /**
     * ذخیره جدید
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:service_categories,name',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'min_price' => 'nullable|integer|min:0',
            'max_price' => 'nullable|integer|min:0|gte:min_price',
            'suggested_duration' => 'nullable|integer|min:5|max:480',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ], [
            'name.required' => 'نام دسته‌بندی الزامی است.',
            'name.unique' => 'این نام قبلاً ثبت شده است.',
            'max_price.gte' => 'حداکثر قیمت باید بزرگ‌تر یا مساوی حداقل قیمت باشد.',
            'image.image' => 'فایل باید تصویر باشد.',
            'image.max' => 'حجم تصویر حداکثر ۲ مگابایت است.',
        ]);

        // ساخت slug
        $slug = GenerateUtf8Slug::generateUtf8Slug($validated['name']);
        $num = 1;
        while (ServiceCategory::where('slug', $slug)->exists()) {
            $num++;
            $slug = $slug . "-$num";
        }

        // آپلود تصویر
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')
                ->store('service-categories', 'public');
        }

        // پیش‌فرض‌ها
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['color'] = $validated['color'] ?? 'green';
        $validated['icon'] = $validated['icon'] ?? 'Scissors';

        ServiceCategory::create($validated);
        StickyAlert::toast('دسته‌بندی خدمت با موفقیت ایجاد شد.', 'success');
        return to_route('admin.service-categories.index');
    }

    /**
     * فرم ویرایش
     */
    public function edit(ServiceCategory $serviceCategory)
    {
        return Inertia::render('Admin/ServiceCategories/Edit', [
            'category' => [
                'id' => $serviceCategory->id,
                'name' => $serviceCategory->name,
                'slug' => $serviceCategory->slug,
                'description' => $serviceCategory->description,
                'image_url' => $serviceCategory->image_url,
                'icon' => $serviceCategory->icon,
                'color' => $serviceCategory->color,
                'min_price' => $serviceCategory->min_price,
                'max_price' => $serviceCategory->max_price,
                'suggested_duration' => $serviceCategory->suggested_duration,
                'sort_order' => $serviceCategory->sort_order,
                'is_active' => $serviceCategory->is_active,
                'services_count' => $serviceCategory->activeServices()->count(),
            ],
            'colors' => $this->getAvailableColors(),
            'icons' => $this->getAvailableIcons(),
        ]);
    }

    /**
     * بروزرسانی
     */

    public function update(Request $request, ServiceCategory $serviceCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:service_categories,name,' . $serviceCategory->id,
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'min_price' => 'nullable|integer|min:0',
            'max_price' => 'nullable|integer|min:0|gte:min_price',
            'suggested_duration' => 'nullable|integer|min:5|max:480',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ], [
            'name.required' => 'نام دسته‌بندی الزامی است.',
            'name.unique' => 'این نام قبلاً ثبت شده است.',
            'max_price.gte' => 'حداکثر قیمت باید بزرگ‌تر یا مساوی حداقل قیمت باشد.',
        ]);

        // تولید slug
        $slug = GenerateUtf8Slug::generateUtf8Slug($validated['name']);

        $num = 1;
        $originalSlug = $slug;

        while (
            ServiceCategory::where('slug', $slug)
            ->where('id', '!=', $serviceCategory->id)
            ->exists()
        ) {
            $slug = $originalSlug . '-' . $num;
            $num++;
        }

        $validated['slug'] = $slug;

        if ($request->hasFile('image')) {

            if ($serviceCategory->image) {
                Storage::disk('public')->delete($serviceCategory->image);
            }

            $validated['image'] = $request->file('image')
                ->store('service-categories', 'public');
        } else {
            unset($validated['image']);
        }

        $serviceCategory->update($validated);

        StickyAlert::toast('دسته‌بندی با موفقیت بروزرسانی شد.', 'success');

        return to_route('admin.service-categories.index');
    }


    /**
     * حذف
     */
    public function destroy(ServiceCategory $serviceCategory)
    {
        // چک: آیا خدمتی به این دسته‌بندی متصل است؟
        if ($serviceCategory->services()->exists()) {
            StickyAlert::alert('این دسته‌بندی دارای خدمت است و قابل حذف نیست. می‌توانید آن را غیرفعال کنید.', 'error');
            return redirect()->back();
        }

        // حذف تصویر
        if ($serviceCategory->image) {
            Storage::disk('public')->delete($serviceCategory->image);
        }

        $serviceCategory->delete();
        StickyAlert::toast('دسته‌بندی با موفقیت حذف شد.', 'success');
        return redirect()->back();
    }

    /**
     * تغییر وضعیت
     */
    public function toggleStatus(ServiceCategory $serviceCategory)
    {
        $serviceCategory->update([
            'is_active' => !$serviceCategory->is_active,
        ]);

        $status = $serviceCategory->is_active ? 'فعال' : 'غیرفعال';
        StickyAlert::toast("دسته‌بندی {$status} شد.", 'success');
        return redirect()->back();
    }

    /**
     * رنگ‌های موجود
     */
    private function getAvailableColors(): array
    {
        return [
            ['value' => 'green', 'label' => 'سبز', 'class' => 'green'],
            ['value' => 'blue', 'label' => 'آبی', 'class' => 'blue'],
            ['value' => 'purple', 'label' => 'بنفش', 'class' => 'purple'],
            ['value' => 'orange', 'label' => 'نارنجی', 'class' => 'orange'],
            ['value' => 'red', 'label' => 'قرمز', 'class' => 'red'],
            ['value' => 'pink', 'label' => 'صورتی', 'class' => 'pink'],
            ['value' => 'yellow', 'label' => 'زرد', 'class' => 'yellow'],
            ['value' => 'gray', 'label' => 'خاکستری', 'class' => 'gray'],
        ];
    }

    /**
     * آیکون‌های موجود
     */
    private function getAvailableIcons(): array
    {
        return [
            'Scissors',
            'SoapDispenserDroplet',
            'TowelRack',
            'ShowerHead',
            'SprayCan',
            'Sparkles',
            'Droplet',
            'Flower',
            'Crown',
            'Star',
            'Sun',
            'Zap',

        ];
    }
}
