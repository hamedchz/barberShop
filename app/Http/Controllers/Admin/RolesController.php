<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\LogsStatus;
use App\Enums\Casts\Permissions;
use App\Http\Controllers\Controller;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesController extends Controller
{
    protected function getPermissions()
    {
        return Permission::all();
    }
    private function validationRules(): array
    {
        return [
            'role' => ['required', 'unique:roles,name', 'max:250'],
            'permissions' => ['required', 'array', Rule::in($this->getPermissions()->pluck('id')->toArray())],
        ];
    }
    public function index()
    {
        $roles = Role::with('permissions')
            ->latest()
            ->paginate(20);

        $roles->getCollection()->transform(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,

                'permissions' => $role->permissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'label' => __($permission->name),
                    ];
                })->values(),

                'created_at' => $role->created_at,
                'updated_at' => $role->updated_at,
            ];
        });

        $context = [
            'title' => 'لیست نقش ها',
            'roles' => $roles,
            'scope' => ['roles', 'role-list'],
        ];

        return Inertia::render('Admin/Roles/Index', $context);
    }
    public function create()
    {
        $permissions = Permission::all()->map(function ($permission) {
            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'label' => __($permission->name),
            ];
        });

        $context = [
            'title' => __('roles.create'),
            'permissions' => $permissions,
            'scope' => ['roles', 'role-create'],
        ];
        return Inertia::render('Admin/Roles/Create', $context);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->validationRules());
        $role = Role::create(['name' => $validated['role']]);
        $permissions = Permission::whereIn('id', $validated['permissions'])
            ->pluck('name')
            ->toArray();
        $store = $role->syncPermissions($permissions);
        if ($store) {
            (new \App\Models\Log())->storeLog($role->id, LogsStatus::store->value . ' نقش ', LogsStatus::store->value);
            StickyAlert::toast(
                'نقش با موفقیت ایجاد شد.',
                'success'
            );
        } else {
            StickyAlert::toast(
                'مشکلی وجود دارد.',
                'error'
            );
        }
        return to_route('admin.role.list');
    }

    public function edit(Role $role)
    {
        // ترجمه تمام دسترسی‌ها
        $allPermissions = Permission::select('id', 'name')->get()->map(function ($permission) {
            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'label' => __($permission->name) !== $permission->name
                    ? __($permission->name)
                    : $this->humanizePermission($permission->name),
            ];
        });

        // ID دسترسی‌های فعلی این نقش
        $rolePermissionIds = $role->permissions->pluck('id')->toArray();

        return Inertia::render('Admin/Roles/Edit', [
            'title' => 'ویرایش نقش',
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $rolePermissionIds,
            ],
            'permissions' => $allPermissions,
            'scope' => ['roles', 'role-edit'],
        ]);
    }

    private function humanizePermission($name)
    {
        // جدا کردن با نقطه و تبدیل به حروف بزرگ
        $parts = explode('.', $name);
        $humanized = array_map(function ($part) {
            return ucfirst(str_replace('_', ' ', $part));
        }, $parts);

        return implode(' - ', $humanized);
    }
    public function update(Request $request, Role $role)
    {

        $validated = $request->validate([
            'name' => 'required|unique:roles,name,' . $role->id,
            'permissions' => 'required|array',
            Rule::in($this->getPermissions()->pluck('id')->toArray()),
        ]);

        $role->update(['name' => $validated['name']]);
        $permissions = Permission::whereIn('id', $validated['permissions'])
            ->pluck('name')
            ->toArray();
        $store = $role->syncPermissions($permissions);
        if ($store) {
            (new \App\Models\Log())->storeLog($role->id, LogsStatus::edit->value . ' نقش ', LogsStatus::edit->value);
            StickyAlert::toast(
                'نقش با موفقیت ویرایش شد.',
                'success'
            );
        } else {
            StickyAlert::toast(
                'مشکلی وجود دارد.',
                'error'
            );
        }

        return to_route('admin.role.list');
    }

    public function destroy(Role $role)
    {
        $delete = $role->delete();
        if ($delete) {
            (new \App\Models\Log())->storeLog($role->id, LogsStatus::delete->value . ' نقش ', LogsStatus::delete->value);
            return  StickyAlert::toast(
                'نقش با موفقیت حذف شد.',
                'success'
            );
        } else {
            return   StickyAlert::toast(
                'مشکلی وجود دارد.',
                'error'
            );
        }
    }
}
