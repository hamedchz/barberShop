<?php

namespace Database\Seeders;

use App\Enums\Casts\Permissions;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermisionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // ایجاد و به‌روزرسانی توضیحات Permissionها
        foreach (Permissions::cases() as $permission) {
            Permission::query()->updateOrCreate(
                [
                    'name' => $permission->value,
                    'guard_name' => 'web',
                ],
                [
                    'description' => $permission->description(),
                ]
            );
        }

        // ایجاد نقش‌ها
        $superAdmin = Role::firstOrCreate([
            'name' => 'سوپر ادمین',
            'guard_name' => 'web',
        ]);

        $barber = Role::firstOrCreate([
            'name' => 'آرایشگر',
            'guard_name' => 'web',
        ]);

        $customer = Role::firstOrCreate([
            'name' => 'مشتری',
            'guard_name' => 'web',
        ]);

        // تمام دسترسی‌ها برای سوپر ادمین
        $superAdmin->syncPermissions(
            Permission::where('guard_name', 'web')->get()
        );

        // دسترسی آرایشگر
        $barber->syncPermissions([
            'barber-dashboard-panel',
        ]);

        // دسترسی مشتری
        $customer->syncPermissions([
            'customer-dashboard-panel',
        ]);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
