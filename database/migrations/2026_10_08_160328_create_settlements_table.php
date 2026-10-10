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
        Schema::create('settlements', function (Blueprint $table) {
            $table->id();

            // ============ کاربر (آرایشگر یا مشتری) ============
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // ============ نوع تسویه ============
            // barber_payout → واریز درآمد به آرایشگر
            // customer_refund → بازگشت وجه به مشتری
            // platform_commission → کمیسیون پلتفرم (اختیاری)
            $table->string('type', 50)->default('barber_payout');

            // ============ مبلغ ============
            $table->decimal('amount', 15, 2);

            // ============ وضعیت ============
            // pending → در انتظار
            // processing → در حال پردازش
            // completed → تکمیل شده
            // failed → ناموفق
            // cancelled → لغو شده
            $table->string('status', 20);

            // ============ اطلاعات بانکی (Snapshot در زمان تسویه) ============
            $table->string('bank_name', 100)->nullable();
            $table->string('account_holder_name', 150)->nullable();
            $table->string('account_number', 50)->nullable();
            $table->string('card_number', 20)->nullable();
            $table->string('sheba_number', 50)->nullable();

            // ============ اطلاعات پیگیری ============
            $table->string('bank_reference', 100)->nullable();     // شماره پیگیری بانکی
            $table->string('gateway_reference', 100)->nullable();  // شماره پیگیری درگاه

            // ============ تاریخ‌ها ============
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('failed_at')->nullable();

            // ============ دلایل و توضیحات ============
            $table->text('notes')->nullable();
            $table->text('failure_reason')->nullable();

            // ============ کاربران (ادمین‌ها) ============
            $table->foreignId('requested_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('processed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // ============ زمان‌ها ============
            $table->timestamps();
            $table->softDeletes();

            // ============ ایندکس‌ها ============
            $table->index(['user_id', 'status']);
            $table->index(['type', 'status']);
            $table->index(['status', 'created_at']);
            $table->index('completed_at');
            $table->index('requested_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settlements');
    }
};
