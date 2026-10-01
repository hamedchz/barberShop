<?php

namespace Database\Seeders;

use App\Enums\Casts\ReviewStatus;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BarberProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    // database/seeders/BarberProfileSeeder.php
    public function run()
    {
        $barbers = User::role('آرایشگر')->get();

        foreach ($barbers as $barber) {
            $barber->update([
                'bio' => 'آرایشگر حرفه‌ای با بیش از ۵ سال سابقه در زمینه کوتاهی مو، اصلاح ریش و رنگ مو. دارای مدرک بین‌المللی از آکادمی آرایش لندن.',
                'specialty' => 'کوتاهی مو، اصلاح ریش، رنگ مو',
                'experience_years' => rand(3, 15),
                'city' => ['تهران', 'مشهد', 'اصفهان', 'شیراز'][rand(0, 3)],
                'address' => 'خیابان آزادی، پلاک ' . rand(1, 200),
            ]);

            // ساخت نظرات نمونه
            // $customers = User::role('customer')->inRandomOrder()->limit(rand(5, 20))->get();

            for ($i = 0; $i < 10; $i++) {
                Review::create([
                    'user_id' => 2,
                    'barber_id' => $barber->id,
                    'rating' => rand(3, 5),
                    'comment' => [
                        'کار بسیار عالی و تمیز. حتماً دوباره میام.',
                        'برخورد بسیار خوب و حرفه‌ای. توصیه می‌کنم.',
                        'کیفیت کار عالی بود. متشکرم.',
                        'سریع و دقیق. راضی بودم.',
                        'بهترین آرایشگری که تا حالا رفتم.',
                    ][rand(0, 4)],
                    'status' => ReviewStatus::approved->value,
                ]);
            }

            // foreach ($customers as $customer) {
            //     Review::create([
            //         'user_id' => $customer->id,
            //         'barber_id' => $barber->id,
            //         'rating' => rand(3, 5),
            //         'comment' => [
            //             'کار بسیار عالی و تمیز. حتماً دوباره میام.',
            //             'برخورد بسیار خوب و حرفه‌ای. توصیه می‌کنم.',
            //             'کیفیت کار عالی بود. متشکرم.',
            //             'سریع و دقیق. راضی بودم.',
            //             'بهترین آرایشگری که تا حالا رفتم.',
            //         ][rand(0, 4)],
            //         'status' => ReviewStatus::approved->value,
            //     ]);
            // }

            $barber->clearReviewsCache();
        }
    }
}
