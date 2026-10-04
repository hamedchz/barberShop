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
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('disputed_by')->nullable()->after('dispute_reason'); // customer | barber
            $table->string('dispute_status')
                ->after('disputed_by');
            $table->timestamp('dispute_resolved_at')->nullable()->after('dispute_status');
            $table->text('dispute_resolution')->nullable()->after('dispute_resolved_at');
            $table->foreignId('dispute_resolved_by')->nullable()
                ->after('dispute_resolution')
                ->constrained('users')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            //
        });
    }
};
