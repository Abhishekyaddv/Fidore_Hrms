<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CompanyPolicySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $policies = [
            [
                'title' => 'EL/CL/SL Policy',
                'description' => 'Outlines Leave Entitlement, Casual Leave, and Sick Leave procedures.',
                'category' => 'Benefits',
                'status' => 'Active',
                'audience' => 'All Employees',
                'icon' => 'calendar-days',
                'created_at' => '2023-10-12 00:00:00',
                'updated_at' => '2023-10-12 00:00:00',
            ],
            [
                'title' => 'Probation Policy',
                'description' => 'Guidelines for performance evaluation during initial hire period.',
                'category' => 'Compliance',
                'status' => 'Active',
                'audience' => 'New Hires',
                'icon' => 'timer',
                'created_at' => '2024-01-05 00:00:00',
                'updated_at' => '2024-01-05 00:00:00',
            ],
            [
                'title' => 'Code of Conduct',
                'description' => 'Standard of ethical behavior and workplace professional expectations.',
                'category' => 'Compliance',
                'status' => 'Active',
                'audience' => 'All Employees',
                'icon' => 'gavel',
                'created_at' => '2024-03-20 00:00:00',
                'updated_at' => '2024-03-20 00:00:00',
            ],
        ];

        foreach ($policies as $policy) {
            \App\Models\CompanyPolicy::create($policy);
        }
    }
}
