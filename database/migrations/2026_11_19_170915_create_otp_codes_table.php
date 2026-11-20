<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('otp_codes', function (Blueprint $table) {
            $table->id();

            // شماره موبایل دریافت‌کننده
            $table->string('phone', 20);

            // هش کد OTP، نه کد خام
            $table->string('code_hash');

            // registration / password_reset
            $table->string('purpose', 30);

            // تعداد تلاش‌های ناموفق
            $table->unsignedTinyInteger('attempts')->default(0);

            // زمان انقضا
            $table->timestamp('expires_at');

            // زمان تأیید موفق کد
            $table->timestamp('verified_at')->nullable();

            // زمان مصرف نهایی کد
            $table->timestamp('consumed_at')->nullable();

            $table->timestamps();

            // جست‌وجوی کدهای یک شماره و هدف مشخص
            $table->index(
                ['phone', 'purpose', 'created_at'],
                'otp_codes_phone_purpose_created_index'
            );

            // مدیریت کدهای منقضی و مصرف‌شده
            $table->index(
                ['expires_at', 'consumed_at'],
                'otp_codes_expiry_consumed_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('otp_codes');
    }
};
