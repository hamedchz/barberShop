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
        Schema::create('payment_settings', function (Blueprint $table) {
            $table->id();
            $table->string('gateway')->unique(); // zarinpal, idpay, ...
            $table->string('mode')->default('normal'); // normal, sandbox, zaringate
            $table->string('merchant_id')->nullable();
            $table->string('callback_url')->nullable();
            $table->string('description')->nullable();
            $table->string('currency', 1)->default('T'); // R, T
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_settings');
    }
};
