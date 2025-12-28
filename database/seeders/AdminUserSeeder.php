<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::updateOrCreate(
            ['email' => 'admin@fea-lms.com'],
            [
                'name' => 'Admin FEA',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'role' => \App\Models\User::ROLE_ADMIN,
                'email_verified_at' => now(),
            ]
        );
    }
}
