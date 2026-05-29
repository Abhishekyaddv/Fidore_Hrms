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
        Schema::create('leave_policies', function (Blueprint $table) {
            $table->id();
            $table->string('employment_type')->unique(); // 'Probation', 'Full-time'
            $table->integer('cl')->default(0); // Casual leaves
            $table->integer('sl')->default(0); // Sick leaves
            $table->integer('el')->default(0); // Earned leaves
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_policies');
    }
};
