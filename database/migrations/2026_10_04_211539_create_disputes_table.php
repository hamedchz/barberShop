<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();

            // ============ ارتباط ============
            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->onDelete('cascade');

            $table->foreignId('disputed_by_user_id')
                ->constrained('users')
                ->onDelete('cascade');

            // ============ نوع اعتراض ============
            $table->enum('disputed_by', ['customer', 'barber', 'admin'])
                ->comment('چه کسی اعتراض کرده');

            $table->string('dispute_type')
                ->comment('نوع اعتراض: not_done, incomplete, poor_quality, bad_behavior, other');

            $table->text('reason')
                ->comment('دلیل اعتراض');

            // ============ وضعیت ============
            $table->enum('status', [
                'pending',        // در انتظار بررسی
                'investigating',  // در حال بررسی
                'awaiting_response', // در انتظار پاسخ طرف مقابل
                'resolved',       // تایید شده
                'rejected',       // رد شده
                'cancelled',      // لغو شده توسط معترض
            ])->default('pending');

            // ============ پاسخ طرف مقابل ============
            $table->text('response')
                ->nullable()
                ->comment('پاسخ طرف مقابل');

            $table->timestamp('responded_at')
                ->nullable();

            $table->foreignId('responded_by_user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            // ============ بررسی توسط ادمین ============
            $table->foreignId('resolved_by_user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            $table->text('resolution')
                ->nullable()
                ->comment('پاسخ ادمین');

            $table->timestamp('resolved_at')
                ->nullable();

            // ============ مالی ============
            $table->decimal('refund_amount', 15, 2)
                ->default(0)
                ->comment('مبلغ بازگشتی به مشتری');

            $table->decimal('penalty_amount', 15, 2)
                ->default(0)
                ->comment('جریمه کسر شده از آرایشگر');

            // ============ پیوست‌ها ============
            $table->json('attachments')
                ->nullable()
                ->comment('عکس‌ها یا فایل‌های پیوست');

            // ============ متادیتا ============
            $table->string('ip_address', 45)
                ->nullable();

            $table->text('admin_notes')
                ->nullable()
                ->comment('یادداشت‌های داخلی ادمین');

            $table->timestamps();
            $table->softDeletes();

            // ============ ایندکس‌ها ============
            $table->index(['booking_id', 'status']);
            $table->index(['disputed_by_user_id', 'status']);
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};
