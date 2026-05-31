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
            $table->integer('custom_leave_year')->nullable();
            $table->integer('custom_cl')->nullable();
            $table->integer('custom_sl')->nullable();
            $table->integer('custom_el')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'custom_leave_year',
                'custom_cl',
                'custom_sl',
                'custom_el',
            ]);
        });
    }
};
