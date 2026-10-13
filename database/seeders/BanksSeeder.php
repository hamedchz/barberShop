<?php

namespace Database\Seeders;

use App\Models\Bank;
use Illuminate\Database\Seeder;

class BanksSeeder extends Seeder
{
    public function run(): void
    {
        $banks = [
            ['name' => 'بانک ملی ایران', 'slug' => 'melli', 'code' => '017'],
            ['name' => 'بانک ملت', 'slug' => 'mellat', 'code' => '012'],
            ['name' => 'بانک صادرات', 'slug' => 'saderat', 'code' => '019'],
            ['name' => 'بانک تجارت', 'slug' => 'tejarat', 'code' => '018'],
            ['name' => 'بانک سپه', 'slug' => 'sepah', 'code' => '015'],
            ['name' => 'بانک کشاورزی', 'slug' => 'keshavarzi', 'code' => '016'],
            ['name' => 'بانک مسکن', 'slug' => 'maskan', 'code' => '014'],
            ['name' => 'بانک پارسیان', 'slug' => 'parsian', 'code' => '054'],
            ['name' => 'بانک پاسارگاد', 'slug' => 'pasargad', 'code' => '057'],
            ['name' => 'بانک سامان', 'slug' => 'saman', 'code' => '056'],
            ['name' => 'بانک اقتصاد نوین', 'slug' => 'en', 'code' => '055'],
            ['name' => 'بانک کارآفرین', 'slug' => 'karafarin', 'code' => '053'],
            ['name' => 'بانک سینا', 'slug' => 'sina', 'code' => '058'],
            ['name' => 'بانک شهر', 'slug' => 'shahr', 'code' => '061'],
            ['name' => 'بانک رفاه', 'slug' => 'refah', 'code' => '013'],
            ['name' => 'بانک دی', 'slug' => 'day', 'code' => '066'],
            ['name' => 'بانک صنعت و معدن', 'slug' => 'sanat-madan', 'code' => '011'],
            ['name' => 'بانک توسعه صادرات', 'slug' => 'edbi', 'code' => '020'],
            ['name' => 'بانک آینده', 'slug' => 'ayandeh', 'code' => '062'],
            ['name' => 'بانک قرض‌الحسنه رسالت', 'slug' => 'resalat', 'code' => '070'],
            ['name' => 'بانک قرض‌الحسنه مهر ایران', 'slug' => 'mehr-iran', 'code' => '060'],
            ['name' => 'بانک خاورمیانه', 'slug' => 'me-bank', 'code' => '078'],
            ['name' => 'بانک ایران زمین', 'slug' => 'izbank', 'code' => '069'],
            ['name' => 'بانک قوامین', 'slug' => 'ghavamin', 'code' => '052'],
            ['name' => 'بانک حکمت ایرانیان', 'slug' => 'hekmat', 'code' => '065'],
            ['name' => 'بانک گردشگری', 'slug' => 'gardeshgari', 'code' => '064'],
            ['name' => 'بانک توسعه تعاون', 'slug' => 'ttbank', 'code' => '051'],
            ['name' => 'پست بانک ایران', 'slug' => 'postbank', 'code' => '021'],
            ['name' => 'بانک مهر ایران', 'slug' => 'mehr', 'code' => '060'],
            ['name' => 'بانک سرمایه', 'slug' => 'sarmayeh', 'code' => '058'],
        ];

        foreach ($banks as $index => $bank) {
            Bank::updateOrCreate(
                ['slug' => $bank['slug']],
                [
                    'name'       => $bank['name'],
                    'code'       => $bank['code'] ?? null,
                    'is_active'  => true,
                    'sort_order' => $index,
                ]
            );
        }
    }
}
