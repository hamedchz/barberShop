<?php

namespace Database\Seeders;

use App\Enums\Casts\Permissions;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermisionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (Permissions::toArray() as $key => $value) {
            Permission::create([
                'name' => $value,
                'guard_name' => 'web'
            ]);
        }
    }
}
