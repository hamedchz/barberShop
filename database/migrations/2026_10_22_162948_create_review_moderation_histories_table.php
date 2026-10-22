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
        Schema::create('review_moderation_histories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('review_id')
                ->constrained('reviews')
                ->cascadeOnDelete();

            $table->foreignId('admin_id')
                ->constrained('users');

            $table->string('previous_status', 20);
            $table->string('new_status', 20);

            $table->text('reason');           // دلیل تغییر (الزامی)
            $table->text('note')->nullable(); // یادداشت اضافی (اختیاری)

            $table->timestamps();

            // ایندکس برای کوئری سریع
            $table->index(['review_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_moderation_histories');
    }
};
