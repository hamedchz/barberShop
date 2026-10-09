<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_warnings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('dispute_id')
                ->nullable()
                ->constrained('disputes')
                ->nullOnDelete();

            $table->foreignId('issued_by')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('type', 50);       // rude_behavior, ...
            $table->text('reason')->nullable();

            $table->timestamp('expires_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('revoked_by')->nullable()
                ->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['user_id', 'type', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_warnings');
    }
};
