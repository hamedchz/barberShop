<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BankController extends Controller
{
    /**
     * لیست بانکها
     */
    public function index(Request $request)
    {
        $query = Bank::query();

        // فیلتر وضعیت
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // جستجو
        $search = trim((string) $request->input('search', ''));

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }
        $banks = $query
            ->ordered()
            ->paginate(33)
            ->withQueryString();

        $banks->through(fn($b) => [
            'id'          => $b->id,
            'name'        => $b->name,
            'slug'        => $b->slug,
            'code'        => $b->code,
            'icon_url'    => $b->icon_url,
            'color'       => $b->color,
            'is_active'   => $b->is_active,
            'sort_order'  => $b->sort_order,
            'description' => $b->description,
            'users_count' => $b->users()->count() ?? 0,  // اگه رابطه داری
            'created_at'  => $b->created_at,
        ]);

        // آمار
        $stats = [
            'total'    => Bank::count(),
            'active'   => Bank::active()->count(),
            'inactive' => Bank::where('is_active', false)->count(),
        ];

        return Inertia::render('Admin/Banks/Index', [
            'banks' => $banks,
            'stats' => $stats,
            'filters' => [
                'search'    => $request->input('search', ''),
                'is_active' => $request->input('is_active', ''),
            ],
        ]);
    }

    /**
     * ذخیره بانک جدید
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100|unique:banks,name',
            'slug'        => 'nullable|string|max:100|unique:banks,slug',
            'code'        => 'nullable|string|max:20',
            'color'       => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'is_active'   => 'boolean',
            'sort_order'  => 'nullable|integer|min:0',
            'icon'        => 'nullable|image|mimes:jpg,jpeg,png,svg,webp|max:512',
        ], [
            'name.required' => 'لطفاً نام بانک را وارد کنید.',
            'name.unique'   => 'این نام بانک قبلاً ثبت شده است.',
            'name.max'      => 'نام نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.',
            'code.max'      => 'کد نمی‌تواند بیشتر از ۲۰ کاراکتر باشد.',
            'icon.image'    => 'فایل باید تصویر باشد.',
            'icon.mimes'    => 'فرمت‌های مجاز: JPG, PNG, SVG, WEBP',
            'icon.max'      => 'حجم تصویر نمی‌تواند بیشتر از ۵۱۲ کیلوبایت باشد.',
        ]);

        // ساخت slug اگه ندادی
        $validated['slug'] = Str::slug($validated['name']);


        // آپلود آیکون
        if ($request->hasFile('icon')) {
            $validated['icon'] = $request->file('icon')
                ->store('banks', 'public');
        }

        Bank::create($validated);

        StickyAlert::toast('بانک با موفقیت اضافه شد.', 'success');
        return redirect()->back();
    }

    /**
     * ویرایش بانک
     */
    public function update(Request $request, Bank $bank)
    {

        $validated = $request->validate([
            'name'        => 'required|string|max:100|unique:banks,name,' . $bank->id,
            'slug'        => 'nullable|string|max:100|unique:banks,slug,' . $bank->id,
            'code'        => 'nullable|string|max:20',
            'color'       => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'is_active'   => 'boolean',
            'sort_order'  => 'nullable|integer|min:0',
            'icon'        => 'nullable|image|mimes:jpg,jpeg,png,svg,webp|max:512',
        ]);

        // آپلود آیکون جدید
        if ($request->hasFile('icon')) {
            // حذف آیکون قبلی
            if ($bank->icon) {
                Storage::disk('public')->delete($bank->icon);
            }

            $validated['icon'] = $request->file('icon')
                ->store('banks', 'public');
        }

        // حذف آیکون اگه کاربر خواست
        if ($request->boolean('remove_icon') && $bank->icon) {
            Storage::disk('public')->delete($bank->icon);
            $validated['icon'] = null;
        }

        $validated['slug'] = Str::slug($validated['name']);


        $bank->update($validated);
        StickyAlert::toast('بانک با موفقیت ویرایش شد.', 'success');
        return redirect()->back();
    }

    /**
     * حذف بانک
     */
    public function destroy(Bank $bank)
    {
        // بررسی: آیا کاربری از این بانک استفاده میکنه؟
        $usersCount = \App\Models\User::where('bank_id', $bank->id)->count();

        if ($usersCount > 0) {
            StickyAlert::alert(
                "این بانک توسط {$usersCount} کاربر استفاده می‌شود و قابل حذف نیست. " .
                    "می‌توانید آن را غیرفعال کنید.",
                'warning'
            );
            return redirect()->back();
        }

        // حذف آیکون
        if ($bank->icon) {
            Storage::disk('public')->delete($bank->icon);
        }

        $bank->delete();
        StickyAlert::toast('بانک با موفقیت حذف شد.', 'success');
        return redirect()->back();
    }

    /**
     * فعال/غیرفعال کردن
     */
    public function toggleStatus(Bank $bank)
    {
        $bank->update(['is_active' => !$bank->is_active]);

        $status = $bank->is_active ? 'فعال' : 'غیرفعال';
        StickyAlert::toast("بانک {$status} شد.", 'success');
        return redirect()->back();
    }

    /**
     * جستجوی بانکها (برای Select2 AJAX)
     */
    public function search(Request $request)
    {
        $search = trim($request->input('search', ''));
        $limit = (int) $request->input('limit', 50);

        $banks = Bank::active()
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->ordered()
            ->limit($limit)
            ->get()
            ->map(fn($b) => [
                'id'    => $b->id,
                'value' => $b->name,   // ✅ چون users.bank_name رشتهست
                'label' => $b->name,
                'name'  => $b->name,
                'icon'  => $b->icon_url,
            ])
            ->values();

        return response()->json([
            'results' => $banks,
        ]);
    }

    /**
     * گرفتن یک بانک خاص (برای مقدار اولیه)
     */
    public function show(Bank $bank)
    {
        return response()->json([
            'id'   => $bank->id,
            'name' => $bank->name,
            'icon' => $bank->icon_url,
        ]);
    }
}
