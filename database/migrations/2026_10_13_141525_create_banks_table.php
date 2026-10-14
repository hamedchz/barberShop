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
        Schema::create('banks', function (Blueprint $table) {
            $table->id();
            // نام فارسی
            $table->string('name', 100);

            // نام انگلیسی (برای فیلتر/سرچ)
            $table->string('slug', 100)->unique();

            // کد بانک (برای APIهای بانکی)
            $table->string('code', 20)->nullable();

            // آیکون/لوگو
            $table->string('icon')->nullable();

            // رنگ (اختیاری)
            $table->string('color', 20)->nullable();

            // وضعیت
            $table->boolean('is_active')->default(true);

            // ترتیب نمایش
            $table->integer('sort_order')->default(0);

            $table->text('description')->nullable();

            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banks');
    }
};
