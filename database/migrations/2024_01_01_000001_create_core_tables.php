<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // کاربران (مشتری / آرایشگر / ادمین)
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['customer', 'barber', 'admin'])->default('customer')->after('email');
            $table->string('phone')->nullable()->after('role');
        });

        // پروفایل آرایشگر
        Schema::create('barber_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('shop_name')->nullable();
            $table->string('address')->nullable();
            $table->text('bio')->nullable();
            $table->string('avatar')->nullable();
            $table->timestamps();
        });

        // خدمات قابل ارائه توسط هر آرایشگر
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barber_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('price'); // به تومان
            $table->unsignedInteger('duration_minutes')->default(30);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // الگوی زمان‌های قابل رزرو (ورودی آرایشگر)
        Schema::create('availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barber_id')->constrained('users')->cascadeOnDelete();
            $table->date('date')->nullable(); // برای یک روز خاص
            $table->tinyInteger('day_of_week')->nullable(); // 0-6 برای تکرارشونده هفتگی
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedInteger('slot_length_minutes')->default(30);
            $table->boolean('is_recurring')->default(false);
            $table->timestamps();
        });

        // اسلات‌های زمانی واقعی که از availability تولید می‌شوند
        Schema::create('time_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barber_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('availability_id')->nullable()->constrained('availabilities')->nullOnDelete();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', ['available', 'booked', 'blocked'])->default('available');
            $table->timestamps();

            $table->unique(['barber_id', 'date', 'start_time']);
        });

        // نوبت‌ها
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('barber_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('time_slot_id')->constrained('time_slots')->cascadeOnDelete();
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->unsignedInteger('price');
            $table->enum('status', ['pending_payment', 'confirmed', 'completed', 'cancelled'])->default('pending_payment');
            $table->text('note')->nullable();
            $table->timestamps();
        });

        // پرداخت‌ها
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained('appointments')->cascadeOnDelete();
            $table->unsignedInteger('amount');
            $table->string('gateway')->default('zarinpal');
            $table->string('transaction_id')->nullable();
            $table->enum('status', ['pending', 'paid', 'failed'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('time_slots');
        Schema::dropIfExists('availabilities');
        Schema::dropIfExists('services');
        Schema::dropIfExists('barber_profiles');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone']);
        });
    }
};
