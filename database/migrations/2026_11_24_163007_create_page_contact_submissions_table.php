<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_contact_submissions', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('phone', 20);
            $table->string('email')->nullable();

            $table->string('subject')->nullable();
            $table->text('message');

            // وضعیت رسیدگی
            $table->string('status', 20)->default('new')->index();

            // اطلاعات تکمیلی
            $table->string('ip_address', 45)->nullable();

            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_contact_submissions');
    }
};
