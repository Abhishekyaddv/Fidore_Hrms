<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin
        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@hrms.com',
            'password' => bcrypt('password'),
            'role' => 'superadmin',
        ]);

    }
}
