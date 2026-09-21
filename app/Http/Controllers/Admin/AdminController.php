<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\LogsStatus;
use App\Enums\Casts\Permissions;
use App\Enums\Casts\UserStatus;
use App\Facades\AssetManager;
use App\Helpers\StickyAlert;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
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
        $users = User::where('is_admin', true)->latest()->paginate(21);
        $roles = Role::all();


        $context = [
            'title' => 'لیست ادمین ها',
            'roles' => $roles,
            'users' => $users,
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

        return view('admin.users.admin.create')->with($context);
    }
    public function store($locale, Request $request)
    {

        $this->authorize(Permissions::manageAdmins->value);
        $validated = $request->validate([
            'name' => 'required',
            'country_code' => 'required',
            'family' => 'required',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|unique:users,phone',
            'password' => 'required|min:8|max:191|confirmed',
            'roles' => ['required', 'array', Rule::in(Role::all()->pluck('name')->toArray())],
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
        ]);
        // slug

        $slug = AssetManager::generateUtf8Slug($request->input('name') . ' ' . $request->input('family'));
        $num = 1;
        while (User::where('slug', $slug)->exists()) {
            $num++;
            $slug = $slug . "-$num";
        }


        $store = User::create([
            'name' => Str::lower($validated['name']),
            'family' => Str::lower($validated['family']),
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'country_code' => $validated['country_code'],
            'password' => Hash::make($validated['password']),
            'is_admin' => true,
            'slug' => $slug,
            'email_verified_at' => Carbon::now(),
            'phone_verified_at' => Carbon::now(),
            'status' => UserStatus::approved->value,

        ]);
        if ($request->hasFile('avatar') && $request->file('avatar')->isValid()) {

            $store->addMediaFromRequest('avatar')->usingFileName(Str::random(50) . '.' . $request->avatar->extension())
                ->toMediaCollection('avatar');
        }
        $store->syncRoles($request->roles);

        if ($store) {
            (new \App\Models\Log())->storeLog($store->id, LogsStatus::store->value . 'admin', LogsStatus::store->value);
            StickyAlert::success(trans('Added Successfully'));
        } else {
            StickyAlert::error(trans('Something is wrong'));
        }

        return to_route('admin.admins.list', app()->getLocale());
    }

    //edit admin
    public function edit($locale, User $user)
    {
        $this->authorize(Permissions::manageAdmins->value);
        $scope = ['admins', 'admin-edit'];
        $context = [
            'title' => 'Edit',
            'user' => $user,
            'roles' => Role::all(),
            'scope' => $scope,
        ];

        return view('admin.users.admin.edit', $context);
    }

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
