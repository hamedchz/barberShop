<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('time_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // آرایشگر
            $table->foreignId('service_id')->nullable()->constrained()->onDelete('set null');
            $table->date('date'); // تاریخ
            $table->time('start_time'); // ساعت شروع
            $table->time('end_time'); // ساعت پایان
            $table->enum('status', ['available', 'booked', 'blocked'])->default('available');
            $table->foreignId('booked_by')->nullable()->constrained('users')->onDelete('set null'); // مشتری
            $table->timestamps();

            $table->index(['user_id', 'date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('time_slots');
    }
};
