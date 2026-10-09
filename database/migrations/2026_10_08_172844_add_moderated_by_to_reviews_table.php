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
        Schema::table('reviews', function (Blueprint $table) {


            $table->foreignId('moderated_by')->nullable()->after('status')
                ->constrained('users')->nullOnDelete();
            $table->timestamp('moderated_at')->nullable()->after('moderated_by');
            $table->text('moderation_note')->nullable()->after('moderated_at');

            $table->string('rejection_reason', 100)->nullable()->after('moderation_note');

            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            //
        });
    }
};
