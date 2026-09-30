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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('barber_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('booking_id')->nullable()->constrained()->onDelete('set null');
            $table->tinyInteger('rating');
            $table->text('comment')->nullable();
            $table->string('status')->nullable();
            $table->timestamps();
            $table->index(['barber_id', 'status']);
            $table->index(['user_id', 'barber_id']);

            // جلوگیری از نظر تکراری برای یک رزرو
            $table->unique(['user_id', 'barber_id', 'booking_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
