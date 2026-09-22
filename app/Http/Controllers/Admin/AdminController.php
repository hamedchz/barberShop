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
            'status' => UserStatus::approved->value,

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
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
                'is_active' => (bool) ($user->is_active ?? true),
                'roles' => $adminRoleIds, // آرایه‌ای از ID نقش‌ها
                'created_at' => $user->created_at,
            ],
            'roles' => $roles,
            'scope' => ['admins', 'admin-edit'],
        ]);
    }
    // public function edit(User $user)
    // {
    //     // $this->authorize(Permissions::manageAdmins->value);
    //     $user  = User::with('roles')->where('slug',$user->slug)->first();
    //     $scope = ['admins', 'admin-edit'];
    //     $context = [
    //         'title' => 'Edit',
    //         'admin' => $user,
    //         'roles' => Role::all(),
    //         'scope' => $scope,
    //     ];

    //     return Inertia::render('Admin/Admins/Edit', $context);
    // }

    //edit admin
    public function update($locale, Request $request, User $user)
    {
        $this->authorize(Permissions::manageAdmins->value);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'family' => ['required', 'string', 'max:255'],
            'country_code' => ['required'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['required',  Rule::unique('users')->ignore($user->id)],
            'roles' => ['required', 'array', Rule::in(Role::all()->pluck('name')->toArray())],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'status' => ['required', Rule::enum(UserStatus::class)],
        ]);

        // Storing the original and thumbnail profile picture
        if ($request->hasFile('avatar') and $request->file('avatar')->isValid()) {
            $user->addMediaFromRequest('avatar')->usingFileName(Str::random(50) . '.' . $request->avatar->extension())
                ->toMediaCollection('avatar');
        }
        if ($request->has('password') && !is_null($request->password)) {
            $validated['password'] = Hash::make($request->input('password'));
        }
        // Unique Slug Creator
        $slug = AssetManager::generateUtf8Slug($request->input('name') . ' ' . $request->input('family'));
        $num = 1;
        while (User::where([['slug', $slug], ['id', '!=', $user->id]])->exists()) {
            $num++;
            $slug = $slug . "-$num";
        }



        $update = $user->update($validated);
        $user->syncRoles($request->roles);

        if ($update) {
            (new \App\Models\Log())->storeLog($user->id, LogsStatus::edit->value . 'admin', LogsStatus::edit->value);
            StickyAlert::success(trans('Updated Successfully'));
        } else {
            StickyAlert::error(trans('Something is wrong'));
        }

        return to_route('admin.admins.list', app()->getLocale());
    }
}
