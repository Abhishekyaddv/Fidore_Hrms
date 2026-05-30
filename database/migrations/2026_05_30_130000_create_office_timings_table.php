<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('office_timings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Standard Shift');
            $table->time('start_time')->default('09:00:00');
            $table->time('end_time')->default('18:00:00');
            $table->timestamps();
        });

        // Insert default record
        DB::table('office_timings')->insert([
            'name' => 'Standard Shift',
            'start_time' => '09:00:00',
            'end_time' => '18:00:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('office_timings');
    }
};
