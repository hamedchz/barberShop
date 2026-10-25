<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // فیلدهای رنگ که ممکنه نباشن
        if (!Schema::hasColumn('settings', 'type')) {
            Schema::table('settings', function (Blueprint $table) {
                $table->string('type')->default('string')->after('value');
            });
        }

        // درج تنظیمات پیش‌فرض
        $defaults = [
            ['key' => 'site_name',         'value' => 'آرایشگاه من', 'type' => 'string', 'group' => 'general', 'label' => 'نام سایت',           'description' => 'نام نمایشی سایت'],
            ['key' => 'site_logo',         'value' => '',            'type' => 'string', 'group' => 'general', 'label' => 'لوگو سایت',          'description' => 'مسیر لوگو (SVG/PNG)'],
            ['key' => 'site_favicon',      'value' => '',            'type' => 'string', 'group' => 'general', 'label' => 'فاوآیکون',           'description' => 'آیکون مرورگر'],
            ['key' => 'primary_color',     'value' => '#8b5cf6',     'type' => 'string', 'group' => 'theme',   'label' => 'رنگ اصلی',          'description' => 'رنگ اصلی سایت (Hex)'],
            ['key' => 'primary_hover',     'value' => '#7c3aed',     'type' => 'string', 'group' => 'theme',   'label' => 'رنگ هاور',          'description' => 'رنگ هاور دکمه‌ها'],
            ['key' => 'secondary_color',   'value' => '#3b82f6',     'type' => 'string', 'group' => 'theme',   'label' => 'رنگ ثانویه',        'description' => 'رنگ ثانویه (آبی)'],
            ['key' => 'success_color',     'value' => '#10b981',     'type' => 'string', 'group' => 'theme',   'label' => 'رنگ موفقیت',        'description' => 'رنگ سبز (موفقیت)'],
            ['key' => 'danger_color',      'value' => '#ef4444',     'type' => 'string', 'group' => 'theme',   'label' => 'رنگ خطر',           'description' => 'رنگ قرمز (خطا)'],
            ['key' => 'warning_color',     'value' => '#f59e0b',     'type' => 'string', 'group' => 'theme',   'label' => 'رنگ هشدار',         'description' => 'رنگ زرد (هشدار)'],
            ['key' => 'site_description',  'value' => 'سیستم رزرو آنلاین آرایشگاه', 'type' => 'string', 'group' => 'general', 'label' => 'توضیحات سایت', 'description' => 'توضیح متا'],
            ['key' => 'contact_phone',     'value' => '',            'type' => 'string', 'group' => 'contact', 'label' => 'تلفن تماس',          'description' => 'شماره تماس اصلی'],
            ['key' => 'contact_email',     'value' => '',            'type' => 'string', 'group' => 'contact', 'label' => 'ایمیل',              'description' => 'ایمیل تماس'],
            ['key' => 'social_instagram',  'value' => '',            'type' => 'string', 'group' => 'social',  'label' => 'اینستاگرام',         'description' => 'آدرس اینستاگرام'],
            ['key' => 'social_telegram',   'value' => '',            'type' => 'string', 'group' => 'social',  'label' => 'تلگرام',             'description' => 'آدرس تلگرام'],
        ];

        foreach ($defaults as $s) {
            if (!DB::table('settings')->where('key', $s['key'])->exists()) {
                $s['created_at'] = now();
                $s['updated_at'] = now();
                DB::table('settings')->insert($s);
            }
        }
    }

    public function down(): void
    {
        DB::table('settings')->whereIn('key', [
            'site_name',
            'site_logo',
            'site_favicon',
            'primary_color',
            'primary_hover',
            'secondary_color',
            'success_color',
            'danger_color',
            'warning_color',
            'site_description',
            'contact_phone',
            'contact_email',
            'social_instagram',
            'social_telegram',
        ])->delete();
    }
};
