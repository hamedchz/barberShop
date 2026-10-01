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
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('average_rating', 3, 2)->default(0)->after('status');
            $table->integer('total_reviews')->default(0)->after('average_rating');
            $table->integer('total_rating_sum')->default(0)->after('total_reviews');
            $table->timestamp('last_seen_at')->nullable()->after('total_rating_sum');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
