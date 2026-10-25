<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $defaults = [
            [
                'key'         => 'primary_color',
                'value'       => '#10B981',
                'type'        => 'string',
                'group'       => 'theme',
                'label'       => 'رنگ اصلی',
                'description' => 'رنگ هویت بصری؛ دکمه‌ها، لینک‌ها، آیتم فعال منو',
            ],
            [
                'key'         => 'secondary_color',
                'value'       => '#1E293B',
                'type'        => 'string',
                'group'       => 'theme',
                'label'       => 'رنگ مکمل',
                'description' => 'برای عناصر فرعی، کارت‌ها و مرزهای بصری',
            ],
            [
                'key'         => 'theme_mode',
                'value'       => 'light',
                'type'        => 'string',
                'group'       => 'theme',
                'label'       => 'حالت ظاهری',
                'description' => 'روشن، تاریک یا مطابق دستگاه',
            ],
            // بقیه فیلدها (site_name, logo, ...) از قبل هستن
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
            'primary_color',
            'secondary_color',
            'theme_mode',
        ])->delete();
    }
};
