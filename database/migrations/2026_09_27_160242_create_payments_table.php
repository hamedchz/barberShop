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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->string('gateway'); // zarinpal, idpay, payping, ...
            $table->string('authority')->nullable(); // کد پیگیری درگاه
            $table->string('transaction_id')->nullable(); // شماره تراکنش
            $table->decimal('amount', 15, 2); // مبلغ
            $table->string('status')->nullable();
            $table->text('gateway_response')->nullable(); // پاسخ درگاه (JSON)
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('authority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
