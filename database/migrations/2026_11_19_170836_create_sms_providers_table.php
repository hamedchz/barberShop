<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sms_providers', function (Blueprint $table) {
            $table->id();

            // شناسه فنی پنل پیامکی
            // مثل: kavenegar, melipayamak, farazsms
            $table->string('driver', 50);

            // نام نمایشی پنل
            $table->string('name', 100);

            // اطلاعات محرمانه اتصال
            // به‌صورت رمزنگاری‌شده ذخیره می‌شوند
            $table->longText('credentials')->nullable();

            // تنظیمات اختصاصی پنل
            $table->longText('settings')->nullable();

            // فعال یا غیرفعال بودن پنل
            $table->boolean('is_active')->default(false);

            // آخرین زمان تست اتصال
            $table->timestamp('last_tested_at')->nullable();

            // نتیجه آخرین تست
            // success / failed
            $table->string('last_test_status', 30)->nullable();

            $table->timestamps();

            $table->index(
                ['driver', 'is_active'],
                'sms_providers_driver_active_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_providers');
    }
};
