<?php

namespace Database\Seeders;

use App\Enums\Casts\Permissions;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermisionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // foreach (Permissions::toArray() as $key => $value) {
        //     Permission::create([
        //         'name' => $value,
        //         'guard_name' => 'web'
        //     ]);
        // }

        $permissions = Permissions::toArray();
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web',]);
        }

        $superAdmin = Role::firstOrCreate(['name' => 'سوپر ادمین', 'guard_name' => 'web',]);
        $barber = Role::firstOrCreate(['name' => 'آرایشگر', 'guard_name' => 'web',]);
        $superAdmin->syncPermissions(Permission::where('guard_name', 'web')->get());
        $barber->syncPermissions(['barber-dashboard-panel',]); // Reset cache again
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
