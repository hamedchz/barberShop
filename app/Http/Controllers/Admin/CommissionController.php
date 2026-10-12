<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use App\Services\CommissionService;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommissionController extends Controller
{
    public function __construct(
        private CommissionService $commissionService,
    ) {}

    /**
     * صفحه تنظیمات کمیسیون
     */
    public function index(Request $request)
    {
        $defaultRate = Setting::getCommissionRate();
        $search = trim($request->input('search', ''));

        $query = User::role('آرایشگر')
            ->whereNotNull('commission_rate')
            ->select('id', 'name', 'avatar', 'commission_rate');

        //  جستجو
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $customRates = $query
            ->latest()
            ->paginate(10, ['*'], 'page')
            ->withQueryString();

        $customRates->through(fn($u) => [
            'id'              => $u->id,
            'name'            => $u->name,
            'thumbnail'       => $u->avatarUrl(),
            'phone'           => $u->phone,
            'commission_rate' => (float) $u->commission_rate,
        ]);

        // ============ آرایشگرها (بدون pagination — برای select) ============
        $barbers = User::role('آرایشگر')
            ->select('id', 'name', 'avatar')
            ->orderBy('name')
            ->get()->take(5)
            ->map(fn($u) => [
                'id'        => $u->id,
                'name'      => $u->name,
                'thumbnail' => $u->avatarUrl(),
            ]);

        return Inertia::render('Admin/Finance/Commission/Index', [
            'defaultRate' => $defaultRate,
            'customRates' => $customRates,
            'barbers'     => $barbers,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * ذخیره نرخ پیش‌فرض
     */
    public function updateDefault(Request $request)
    {
        $validated = $request->validate([
            'commission_rate' => 'required|numeric|min:0|max:50',
        ], [
            'commission_rate.required' => 'لطفاً نرخ کمیسیون را وارد کنید.',
            'commission_rate.min'      => 'نرخ نمی‌تواند منفی باشد.',
            'commission_rate.max'      => 'نرخ نمی‌تواند بیشتر از ۵۰٪ باشد.',
        ]);

        Setting::setCommissionRate((float) $validated['commission_rate']);

        StickyAlert::toast('نرخ کمیسیون پیش‌فرض ذخیره شد.', 'success');

        return redirect()->back();
    }

    /**
     * ذخیره نرخ اختصاصی کاربر
     */
    public function updateUserRate(Request $request, User $user)
    {
        $validated = $request->validate([
            'commission_rate' => 'nullable|numeric|min:0|max:50',
        ], [
            'commission_rate.min' => 'نرخ نمی‌تواند منفی باشد.',
            'commission_rate.max' => 'نرخ نمی‌تواند بیشتر از ۵۰٪ باشد.',
        ]);

        // بررسی: کاربر آرایشگر باشه
        if (!$user->hasRole('آرایشگر')) {

            StickyAlert::toast('این کاربر آرایشگر نیست.', 'error');

            return redirect()->back();
        }

        $user->update([
            'commission_rate' => $validated['commission_rate'],
        ]);

        $message = $validated['commission_rate'] === null
            ? 'نرخ اختصاصی حذف شد. از نرخ پیش‌فرض استفاده می‌شود.'
            : 'نرخ اختصاصی ذخیره شد.';

        StickyAlert::toast($message, 'success');
        return redirect()->back();
    }

    /**
     * حذف نرخ اختصاصی
     */
    public function removeUserRate(User $user)
    {
        if (!$user->hasRole('آرایشگر')) {
            StickyAlert::toast('این کاربر آرایشگر نیست.', 'error');

            return redirect()->back();
        }

        $user->update(['commission_rate' => null]);

        StickyAlert::toast('نرخ اختصاصی حذف شد. از نرخ پیش‌فرض استفاده می‌شود.', 'success');

        return redirect()->back();
    }
}
