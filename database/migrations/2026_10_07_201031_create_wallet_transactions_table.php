<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('wallet_id')
                ->constrained('wallets')
                ->cascadeOnDelete();

            // برای جستجو و گزارش‌گیری سریع‌تر
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // نوع تراکنش: deposit, withdraw, refund, penalty, payment, earning, commission
            $table->string('type', 50);

            // جهت: credit (افزایش) یا debit (کاهش)
            $table->string('direction', 10);

            // مبلغ همیشه مثبت ذخیره می‌شه؛ جهت تعیین می‌کنه افزایشیه یا کاهش
            $table->decimal('amount', 15, 2);

            // موجودی قبل و بعد (برای audit)
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);

            // وضعیت تراکنش
            $table->string('status', 20)->default('completed');

            // مرجع (اختیاری): مثلاً Booking یا Dispute
            $table->nullableMorphs('reference');

            $table->text('description')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            // ایندکس‌های مفید
            $table->index(['user_id', 'created_at']);
            $table->index(['wallet_id', 'type']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
