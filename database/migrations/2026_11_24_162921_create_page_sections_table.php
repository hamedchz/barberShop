<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_sections', function (Blueprint $table) {
            $table->id();

            // ارتباط با صفحه
            $table->foreignId('page_id')
                ->constrained('pages')
                ->cascadeOnDelete();

            // نوع بلوک
            $table->string('type', 50);

            // محتوای بلوک
            $table->json('content');

            // تنظیمات ظاهری بلوک
            $table->json('settings')->nullable();

            // ترتیب نمایش
            $table->unsignedInteger('sort_order')->default(0);

            // فعال یا غیرفعال بودن بلوک
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // بهینه‌سازی دریافت بلوک‌های صفحه
            $table->index(['page_id', 'sort_order']);
            $table->index(['page_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_sections');
    }
};
