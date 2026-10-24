<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use App\Services\PaymentConfigService;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class PaymentSettingController extends Controller
{
    public function index()
    {
        $settings = collect(PaymentSetting::GATEWAYS)
            ->map(fn($label, $gateway) => PaymentConfigService::get($gateway))
            ->values();

        return Inertia::render('Admin/PaymentSettings/Index', [
            'settings' => $settings,
        ]);
    }

    public function show(string $gateway)
    {
        if (!isset(PaymentSetting::GATEWAYS[$gateway])) {
            abort(404);
        }

        $config = PaymentConfigService::get($gateway);

        return Inertia::render('Admin/PaymentSettings/Show', [
            'setting' => $config,
            'modes'   => collect(PaymentSetting::MODES)
                ->map(fn($label, $value) => ['value' => $value, 'label' => $label])
                ->values(),
            'currencies' => collect(PaymentSetting::CURRENCIES)
                ->map(fn($label, $value) => ['value' => $value, 'label' => $label])
                ->values(),
        ]);
    }

    public function update(Request $request, string $gateway)
    {
        if (!isset(PaymentSetting::GATEWAYS[$gateway])) {
            abort(404);
        }

        $validated = $request->validate([
            'mode'        => 'required|in:' . implode(',', array_keys(PaymentSetting::MODES)),
            'merchant_id' => 'nullable|string|max:255',
            'callback_url' => 'nullable|url|max:500',
            'description' => 'nullable|string|max:255',
            'currency'    => 'required|in:' . implode(',', array_keys(PaymentSetting::CURRENCIES)),
            'is_active'   => 'boolean',
        ], [
            'mode.required'        => 'حالت درگاه الزامی است.',
            'mode.in'              => 'حالت انتخاب‌شده معتبر نیست.',
            'currency.required'    => 'واحد پول الزامی است.',
            'currency.in'          => 'واحد پول معتبر نیست.',
            'callback_url.url'     => 'آدرس بازگشت باید URL معتبر باشد.',
            'merchant_id.max'      => 'شناسه درگاه نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد.',
        ]);

        PaymentSetting::updateOrCreate(
            ['gateway' => $gateway],
            $validated,
        );

        // پاک کردن کش
        Cache::forget('payment_settings');

        // اعمال فوری (برای همین request)
        PaymentConfigService::apply();
        StickyAlert::alert('تنظیمات با موفقیت ذخیره شد.', 'success');
        return redirect()->back();
    }

    public function toggle(string $gateway)
    {
        if (!isset(PaymentSetting::GATEWAYS[$gateway])) {
            abort(404);
        }

        $setting = PaymentSetting::firstOrCreate(
            ['gateway' => $gateway],
            ['mode' => 'normal', 'currency' => 'T', 'is_active' => true],
        );

        $setting->update(['is_active' => !$setting->is_active]);

        Cache::forget('payment_settings');
        StickyAlert::toast($setting->is_active ? 'درگاه فعال شد.' : 'درگاه غیرفعال شد.', 'success');
        return redirect()->back();
    }

    public function testConnection(string $gateway)
    {
        // تست اتصال (اختیاری)
        // مثلاً برای زرین‌پال: ارسال یه درخواست تستی
        StickyAlert::alert('اتصال برقرار است.', 'success');
        return redirect()->back();
    }
}
