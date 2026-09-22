<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\LogsStatus;
use App\Enums\Casts\Permissions;
use App\Enums\Casts\UserStatus;
use App\Facades\GenerateUtf8Slug;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Supports\StickyAlert;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;


class AdminController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $users = User::with('roles')->where('is_admin', true)->latest()->paginate(21);
        $roles = Role::all();


        $context = [
            'title' => 'لیست ادمین ها',
            'roles' => $roles,
            'admins' => $users,
            'scope' => ['admins', 'admin-list'],
        ];

        return Inertia::render('Admin/Admins/Index', $context);
    }
    public function create()
    {
        // $this->authorize(Permissions::manageAdmins->value);
        $context = [
            'title' => 'New Admin',
            'roles' => Role::all(),
            'scope' => ['admins', 'admin-create'],
        ];

        return Inertia::render('Admin/Admins/Create', $context);
    }
    public function store(Request $request)
    {

        // $this->authorize(Permissions::manageAdmins->value);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone',
            'password' => ['required', 'confirmed', Password::min(8)],
            'roles' => ['required', 'array', Rule::in(Role::all()->pluck('id')->toArray())],
        ]);
        // slug

        $slug = GenerateUtf8Slug::generateUtf8Slug($request->input('name'));
        $num = 1;
        while (User::where('slug', $slug)->exists()) {
            $num++;
            $slug = $slug . "-$num";
        }


        $store = User::create([
            'name' => Str::lower($validated['name']),
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'is_admin' => true,
            'slug' => $slug,
            'phone_verified_at' => Carbon::now(),
            'status' => UserStatus::ACTIVE->value,

        ]);

        $store->syncRoles($request->roles);

        if ($store) {
            (new \App\Models\Log())->storeLog($store->id, LogsStatus::store->value . 'admin', LogsStatus::store->value);
            StickyAlert::toast(
                'ادمین جدید با موفقیت ایجاد شد.',
                'success'
            );
        } else {
            StickyAlert::toast(
                'مشکلی وجود دارد.',
                'error'
            );
        }

        return to_route('admin.admins.list');
    }

    //edit admin
    public function edit(User $user)
    {
        // بررسی اینکه کاربر ادمین است
        if (!$user->is_admin) {
            StickyAlert::alert(
                'این کاربر ادمین نیست.',
                'error'
            );
            return to_route('admin.admins.list');
        }

        // دریافت تمام نقش‌ها
        $roles = Role::select('id', 'name')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                // 'label' => $this->translateRoleName($role->name),
            ];
        });

        // دریافت ID نقش‌های فعلی این ادمین
        $adminRoleIds = $user->roles->pluck('id')->toArray();

        return Inertia::render('Admin/Admins/Edit', [
            'title' => 'ویرایش ادمین',
            'admin' => [
                'name' => $user->name,
                'slug' => $user->slug,
                'phone' => $user->phone,
                'status' => $user->status->value ?? 'active',
                'roles' => $adminRoleIds, // آرایه‌ای از ID نقش‌ها
            ],
            'roles' => $roles,
            'statuses' => UserStatus::toSelectArray(), // ← لیست Enum
            'scope' => ['admins', 'admin-edit'],
        ]);
    }

    //edit admin
    public function update(Request $request, User $user)
    {
        // $this->authorize(Permissions::manageAdmins->value);

        if (!$user->is_admin) {
            StickyAlert::alert(
                'این کاربر ادمین نیست.',
                'error'
            );
            return to_route('admin.admins.list');
        }
        // ============ اعتبارسنجی ============
        $rules = [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone,' . $user->id,
            'status' => ['required', Rule::enum(UserStatus::class)], // ← اعتبارسنجی Enum
            'roles' => ['required', 'array', Rule::in(Role::all()->pluck('id')->toArray())],
        ];

        if ($request->filled('password')) {
            $rules['password'] = ['required', 'confirmed', Password::min(8)];
        }

        $validated = $request->validate($rules);


        if ($request->has('password') && !is_null($request->password)) {
            $validated['password'] = Hash::make($request->input('password'));
        }
        // Unique Slug Creator
        $slug = GenerateUtf8Slug::generateUtf8Slug($request->input('name'));

        $num = 1;
        $originalSlug = $slug;

        while (
            User::where('slug', $slug)
            ->where('id', '!=', $user->id)
            ->exists()
        ) {
            $slug = $originalSlug . '-' . $num;
            $num++;
        }

        $validated['slug'] = $slug;



        $update = $user->update($validated);
        $user->syncRoles($request->roles);

        if ($update) {
            (new \App\Models\Log())->storeLog($user->id, LogsStatus::edit->value . 'admin', LogsStatus::edit->value);
            StickyAlert::toast(
                'ادمین  با موفقیت ویرایش شد.',
                'success'
            );
        } else {
            StickyAlert::toast(
                'مشکلی وجود دارد.',
                'error'
            );
        }
        return to_route('admin.admins.list');
    }
}
