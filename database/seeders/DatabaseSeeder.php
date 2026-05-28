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
            'department' => 'Engineering',
            'description' => 'Oversees core software engineering projects and technical stack decisions.',
        ]);

        $hrDesignation = Designation::create([
            'name' => 'hrManager',
            'display_name' => 'HR Manager',
            'department' => 'People Operations',
            'description' => 'Manages human resource initiatives and workplace culture.',
        ]);

        $uiDesignation = Designation::create([
            'name' => 'uiDesigner',
            'display_name' => 'UI Designer',
            'department' => 'Design',
            'description' => 'Responsible for crafting aesthetic and user-friendly digital designs.',
        ]);

        $mktDesignation = Designation::create([
            'name' => 'marketingAssociate',
            'display_name' => 'Marketing Associate',
            'department' => 'Growth',
            'description' => 'Executes campaigns and growth strategies across digital channels.',
        ]);

        $cfoDesignation = Designation::create([
            'name' => 'chiefFinancialOfficer',
            'display_name' => 'Chief Financial Officer',
            'department' => 'Finance',
            'description' => 'Drives financial strategy, planning, and accounting operations.',
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
            'role' => 'employee',
        ]);

        User::factory(2)->create([
            'designation_id' => $uiDesignation->id,
            'role' => 'employee',
        ]);

        User::factory(1)->create([
            'designation_id' => $hrDesignation->id,
            'role' => 'employee',
        ]);
    }
}
