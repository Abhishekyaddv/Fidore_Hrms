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
            $table->date('dob')->nullable()->after('role');
            $table->string('gender')->nullable()->after('dob');
            $table->string('phone')->nullable()->after('gender');
            $table->string('employee_id')->nullable()->unique()->after('phone');
            $table->date('joining_date')->nullable()->after('employee_id');
            $table->string('employment_type')->nullable()->after('joining_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'dob',
                'gender',
                'phone',
                'employee_id',
                'joining_date',
                'employment_type',
            ]);
        });
    }
};
