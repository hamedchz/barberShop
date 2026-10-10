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
        Schema::create('wallet_deposits', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('wallet_id')
                ->constrained('wallets')
                ->cascadeOnDelete();

            // مبلغ درخواستی
            $table->decimal('amount', 15, 2);

            // مبلغ پرداخت‌شده (ممکنه با درخواستی فرق کنه)
            $table->decimal('paid_amount', 15, 2)->nullable();

            // وضعیت
            // pending → در انتظار پرداخت
            // paid → پرداخت شده (موفق)
            // failed → ناموفق
            // cancelled → لغو شده
            // expired → منقضی شده
            $table->string('status', 20)->default('pending');

            // اطلاعات درگاه
            $table->string('gateway', 50)->nullable();
            $table->string('gateway_authority', 100)->nullable();
            $table->string('gateway_transaction_id', 100)->nullable();
            $table->string('gateway_reference', 100)->nullable();
            $table->json('gateway_response')->nullable();

            // شماره پیگیری
            $table->string('tracking_code', 50)->nullable();

            // تاریخ‌ها
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            $table->text('failure_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // ایندکس‌ها
            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
            $table->index('gateway_authority');
            $table->index('tracking_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_deposits');
    }
};
