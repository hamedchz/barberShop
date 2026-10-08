<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->cascadeOnDelete();

            $table->decimal('balance', 15, 2)->default(0);
            $table->decimal('locked_balance', 15, 2)->default(0);
            $table->decimal('total_deposited', 15, 2)->default(0);
            $table->decimal('total_withdrawn', 15, 2)->default(0);

            $table->string('currency', 10)->default('IRT');
            $table->boolean('is_active')->default(true);

            $table->timestamp('last_transaction_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
