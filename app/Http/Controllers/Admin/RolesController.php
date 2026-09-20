<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\Permissions;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
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
        $pers = Permissions::toArray();
        $roles = Role::latest()->paginate(20);
        $context = [
            'title' => 'Roles List',
            'roles' => $roles,
            'scope' => ['roles', 'role-list'],
        ];
        // dd($context);
        return Inertia::render('Admin/Roles', $context);
    }
    public function create()
    {
        $permissions = Permission::all();
        $context = [
            'title' => 'Create new role',
            'permissions' => $permissions,
            'scope' => ['roles', 'role-create'],
        ];
        return view('admin.users.roles.create', $context);
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
            StickyAlert::success(trans('Added Successfully'));
        } else {
            StickyAlert::error(trans('Something is wrong'));
        }
        return to_route('admin.role.list', app()->getLocale());
    }

    public function edit($local, Role $role)
    {

        $permissions = Permission::all();
        $context = [
            'title' => 'Edit role',
            'permissions' => $permissions,
            'role' => $role,
            'scope' => ['roles', 'role-edit'],
            'translate' => new GoogleTranslate(app()->getLocale())
        ];
        return view('admin.users.roles.edit', $context);
    }

    public function update(Request $request, $local, Role $role)
    {

        $validated = $request->validate([
            'role' => 'required|unique:roles,name,' . $role->id,
            'permissions' => 'required|array',
            Rule::in($this->getPermissions()->pluck('id')->toArray()),
        ]);

        $role->update(['name' => $validated['role']]);
        $permissions = Permission::whereIn('id', $validated['permissions'])
            ->pluck('name')
            ->toArray();
        $store = $role->syncPermissions($permissions);
        if ($store) {
            (new \App\Models\Log())->storeLog($role->id, LogsStatus::edit->value . ' نقش ', LogsStatus::edit->value);
            StickyAlert::success(trans('Updated Successfully'));
        } else {
            StickyAlert::error(trans('Something is wrong'));
        }

        return to_route('admin.role.list', app()->getLocale());
    }

    public function destroy($local, Role $role)
    {
        $delete = $role->delete();
        if ($delete) {
            (new \App\Models\Log())->storeLog($role->id, LogsStatus::delete->value . ' نقش ', LogsStatus::delete->value);
            StickyAlert::success(trans('Deleted Successfully'));
        } else {
            StickyAlert::error(trans('Something is wrong'));
        }
        return to_route('admin.role.list', app()->getLocale());
    }
}
