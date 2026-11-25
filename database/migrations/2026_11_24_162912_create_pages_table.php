<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->id();

            // اطلاعات اصلی صفحه
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->string('featured_image')->nullable();

            // وضعیت انتشار
            $table->string('status', 20)->default('draft')->index();

            // تنظیمات نمایش در منوها
            $table->boolean('show_in_header')->default(false);
            $table->boolean('show_in_footer')->default(false);

            $table->unsignedInteger('header_order')->nullable();
            $table->unsignedInteger('footer_order')->nullable();

            // تنظیمات SEO
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();

            // تاریخ انتشار
            $table->timestamp('published_at')->nullable()->index();

            // کاربران ایجادکننده و ویرایش‌کننده
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // ایندکس‌های موردنیاز
            $table->index(['status', 'show_in_header']);
            $table->index(['status', 'show_in_footer']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
