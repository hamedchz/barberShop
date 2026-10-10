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
            $table->string('bank_name', 100)->nullable()->after('phone');
            $table->string('account_holder_name', 150)->nullable()->after('bank_name');
            $table->string('card_number', 20)->nullable()->after('account_holder_name');
            $table->string('sheba_number', 30)->nullable()->after('card_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users_tale', function (Blueprint $table) {
            //
        });
    }
};
