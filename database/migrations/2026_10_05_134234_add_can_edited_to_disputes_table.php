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
            $table->timestamp('edited_at')->nullable()->after('updated_at');
            $table->integer('edit_count')->default(0)->after('edited_at');
            $table->boolean('can_be_edited')->default(true)->after('edit_count');
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
