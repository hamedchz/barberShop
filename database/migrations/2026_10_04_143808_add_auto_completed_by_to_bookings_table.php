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
            $table->boolean('auto_completed')->default(false)->after('completed_by');
            $table->timestamp('auto_complete_at')->nullable()->after('auto_completed');
            $table->boolean('is_disputed')->default(false)->after('auto_complete_at');
            $table->timestamp('disputed_at')->nullable()->after('is_disputed');
            $table->text('dispute_reason')->nullable()->after('disputed_at');
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
