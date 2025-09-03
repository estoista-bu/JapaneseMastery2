<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UserGroup;

class GroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groups = [
            [
                'name' => 'Beginner Students',
                'description' => 'Students who are just starting their Japanese learning journey',
            ],
            [
                'name' => 'Intermediate Learners',
                'description' => 'Students with some experience in Japanese',
            ],
            [
                'name' => 'Advanced Students',
                'description' => 'Students preparing for JLPT N2 and N1',
            ],
            [
                'name' => 'Study Group A',
                'description' => 'Weekly study group for motivated learners',
            ],
        ];

        foreach ($groups as $group) {
            UserGroup::create($group);
        }
    }
}
