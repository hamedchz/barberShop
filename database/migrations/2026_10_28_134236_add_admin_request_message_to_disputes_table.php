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
        Schema::table('disputes', function (Blueprint $table) {
            $table->text('admin_request_message')->nullable()->after('admin_notes');
            $table->timestamp('admin_request_at')->nullable()->after('admin_request_message');
            $table->foreignId('admin_request_by_user_id')->nullable()->after('admin_request_at')
                ->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('disputes', function (Blueprint $table) {
            //
        });
    }
};
