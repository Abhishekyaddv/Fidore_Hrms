<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Designation;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $engDesignation = Designation::create([
            'name' => 'seniorSoftwareEngineer',
            'display_name' => 'Senior Software Engineer',
            'description' => 'Oversees core software engineering projects and technical stack decisions.',
            'role' => 'employee',
        ]);

        $hrDesignation = Designation::create([
            'name' => 'hrManager',
            'display_name' => 'HR Manager',
            'description' => 'Manages human resource initiatives and workplace culture.',
            'role' => 'hr',
        ]);

        $uiDesignation = Designation::create([
            'name' => 'uiDesigner',
            'display_name' => 'UI Designer',
            'description' => 'Responsible for crafting aesthetic and user-friendly digital designs.',
            'role' => 'employee',
        ]);

        $mktDesignation = Designation::create([
            'name' => 'marketingAssociate',
            'display_name' => 'Marketing Associate',
            'description' => 'Executes campaigns and growth strategies across digital channels.',
            'role' => 'employee',
        ]);

        $cfoDesignation = Designation::create([
            'name' => 'chiefFinancialOfficer',
            'display_name' => 'Chief Financial Officer',
            'description' => 'Drives financial strategy, planning, and accounting operations.',
            'role' => 'employee',
        ]);

        // Create Admin
        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@hrms.com',
            'password' => bcrypt('password'),
            'role' => 'superadmin',
        ]);

        // Create some employees and link to designations
        User::factory(5)->create([
            'designation_id' => $engDesignation->id,
            'role' => $engDesignation->role,
        ]);

        User::factory(2)->create([
            'designation_id' => $uiDesignation->id,
            'role' => $uiDesignation->role,
        ]);

        User::factory(1)->create([
            'designation_id' => $hrDesignation->id,
            'role' => $hrDesignation->role,
        ]);
    }
}
