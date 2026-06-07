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
        Schema::table('attendances', function (Blueprint $table) {
            $table->json('punch_history')->nullable();
            $table->integer('total_logged_minutes')->default(0);
            $table->boolean('is_regularized')->default(false);
            $table->foreignId('regularized_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['regularized_by']);
            $table->dropColumn(['punch_history', 'total_logged_minutes', 'is_regularized', 'regularized_by']);
        });
    }
};
