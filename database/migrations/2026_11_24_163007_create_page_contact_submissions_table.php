<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_contact_submissions', function (Blueprint $table) {
            $table->id();

            // صفحه‌ای که فرم تماس در آن قرار داشته است
            $table->foreignId('page_id')
                ->nullable()
                ->constrained('pages')
                ->nullOnDelete();

            // کاربر ارسال‌کننده؛ برای مهمان null خواهد بود
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // اطلاعات فرستنده
            $table->string('name', 120);
            $table->string('phone', 30);
            $table->string('email', 150)->nullable();
            $table->string('subject', 180)->nullable();
            $table->text('message');

            // وضعیت پیگیری
            $table->string('status', 20)->default('new');
            // یادداشت داخلی مدیر
            $table->text('admin_note')->nullable();

            // مدیر مسئول پیگیری پیام
            $table->foreignId('handled_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // زمان‌های پیگیری
            $table->timestamp('read_at')->nullable();
            $table->timestamp('answered_at')->nullable();
            $table->timestamp('closed_at')->nullable();

            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['page_id', 'created_at']);
            $table->index('phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_contact_submissions');
    }
};
