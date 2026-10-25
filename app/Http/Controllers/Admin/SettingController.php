<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * نمایش تنظیمات
     */
    public function index()
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => Setting::getSettingsWithMeta(),
            'groups'   => Setting::GROUPS,
            'types'    => Setting::TYPES,
        ]);
    }

    /**
     * ذخیره تنظیمات
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings'         => 'required|array|min:1',
            'settings.*.key'   => 'required|string|exists:settings,key',
            'settings.*.value' => 'nullable',
        ], [
            'settings.required'     => 'حداقل یک تنظیم باید ارسال شود.',
            'settings.*.key.exists' => 'کلید تنظیم معتبر نیست.',
        ]);

        // ============ Validation اختصاصی بر اساس نوع ============
        $errors = $this->validateSpecificSettings($validated['settings']);
        if (!empty($errors)) {
            return redirect()->back()->withErrors($errors);
        }

        // ============ ذخیره ============
        foreach ($validated['settings'] as $item) {
            $setting = Setting::where('key', $item['key'])->firstOrFail();

            Setting::set(
                $item['key'],
                $item['value'],
                $setting->type,
                [
                    'group'       => $setting->group,
                    'label'       => $setting->label,
                    'description' => $setting->description,
                ],
            );
        }

        // ============ پاک کردن کش ============
        $this->clearCache();

        return redirect()->back()->with('success', 'تنظیمات با موفقیت ذخیره شد.');
    }

    /**
     * آپلود لوگو
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
        ], [
            'logo.required' => 'انتخاب لوگو الزامی است.',
            'logo.image'    => 'فایل باید تصویر باشد.',
            'logo.mimes'    => 'فرمت‌های مجاز: PNG, JPG, SVG, WebP.',
            'logo.max'      => 'حداکثر ۲ مگابایت.',
        ]);

        // ============ حذف لوگوی قبلی ============
        $oldLogo = Setting::get('site_logo');
        if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
            Storage::disk('public')->delete($oldLogo);
        }

        $path = $request->file('logo')->store('site', 'public');

        Setting::set('site_logo', $path, 'string', [
            'group'       => 'general',
            'label'       => 'لوگو سایت',
            'description' => 'مسیر لوگو',
        ]);

        $this->clearCache();

        return redirect()->back()->with('success', 'لوگو با موفقیت آپلود شد.');
    }

    /**
     * آپلود فاوآیکون
     */
    public function uploadFavicon(Request $request)
    {
        $request->validate([
            'favicon' => 'required|image|mimes:png,ico,svg|max:512',
        ], [
            'favicon.required' => 'انتخاب فاوآیکون الزامی است.',
            'favicon.mimes'    => 'فرمت‌های مجاز: PNG, ICO, SVG.',
            'favicon.max'      => 'حداکثر ۵۱۲ کیلوبایت.',
        ]);

        $oldFavicon = Setting::get('site_favicon');
        if ($oldFavicon && Storage::disk('public')->exists($oldFavicon)) {
            Storage::disk('public')->delete($oldFavicon);
        }

        $path = $request->file('favicon')->store('site', 'public');

        Setting::set('site_favicon', $path, 'string', [
            'group'       => 'general',
            'label'       => 'فاوآیکون',
            'description' => 'آیکون مرورگر',
        ]);

        $this->clearCache();

        return redirect()->back()->with('success', 'فاوآیکون با موفقیت آپلود شد.');
    }

    // ============================================
    // Helpers
    // ============================================

    /**
     * Validation اختصاصی بر اساس کلید
     */
    private function validateSpecificSettings(array $settings): array
    {
        $errors = [];

        foreach ($settings as $item) {
            $key = $item['key'];
            $value = $item['value'];

            // رنگ‌ها
            if (in_array($key, ['primary_color', 'secondary_color'])) {
                if (empty($value) || !preg_match('/^#[0-9A-Fa-f]{6}$/', $value)) {
                    $errors["settings.{$key}"] = [
                        'کد رنگ باید به فرمت #RRGGBB باشد (مثلاً #10B981).'
                    ];
                }
            }

            // حالت ظاهری
            if ($key === 'theme_mode') {
                if (!in_array($value, ['light', 'dark', 'auto'])) {
                    $errors["settings.{$key}"] = [
                        'حالت ظاهری باید یکی از light، dark یا auto باشد.'
                    ];
                }
            }

            // نام سایت
            if ($key === 'site_name') {
                if (empty(trim($value ?? ''))) {
                    $errors["settings.{$key}"] = ['نام سایت الزامی است.'];
                } elseif (mb_strlen($value) > 100) {
                    $errors["settings.{$key}"] = ['نام سایت نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.'];
                }
            }

            // ایمیل
            if ($key === 'contact_email' && !empty($value)) {
                if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $errors["settings.{$key}"] = ['ایمیل معتبر نیست.'];
                }
            }
        }

        return $errors;
    }

    /**
     * پاک کردن همه کش‌های مربوطه
     */
    private function clearCache(): void
    {
        Cache::forget('site_theme');
        Cache::forget('site_info');
        Cache::forget('site_settings'); // برای سازگاری با کد قدیمی
    }
}
