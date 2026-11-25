<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PageBuilderPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // پاک‌سازی Cache مجوزهای Spatie
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            // مدیریت صفحات
            'pages-list',
            'pages-create',
            'pages-edit',
            'pages-delete',
            'pages-publish',
            'pages-preview',

            // مدیریت پیام‌های تماس
            'pages-messages-list',
            'pages-messages-view',
            'pages-messages-update',
            'pages-messages-delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        // پاک‌سازی مجدد Cache
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
