<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\LogsStatus;
use App\Enums\Casts\Permissions;
use App\Enums\Casts\UserStatus;
use App\Facades\GenerateUtf8Slug;
use App\Helpers\Thumbnail;
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
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;


class AdminController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {


        $query = User::query()->with('roles')->where('is_admin', true);

        // ============ فیلتر جستجو ============
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // ============ فیلتر وضعیت ============
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // ============ فیلتر نقش ============
        if ($roleId = $request->input('role')) {
            $query->whereHas('roles', function ($q) use ($roleId) {
                $q->where('roles.id', $roleId);
            });
        }

        // ============ فیلتر فقط آنلاین ============
        $onlyOnline = $request->boolean('only_online', false);

        $admins = $query->latest()->get();

        // ============ محاسبه وضعیت آنلاین و فیلتر ============
        $admins = $admins->map(function ($admin) {
            $admin->is_online = $admin->isOnline();
            $admin->last_activity = $admin->lastActivity();
            return $admin;
        });

        // اگر فقط آنلاین‌ها درخواست شده باشد
        if ($onlyOnline) {
            $admins = $admins->filter(fn($a) => $a->is_online);
        }

        // ============ مرتب‌سازی: آنلاین‌ها اول ============
        $admins = $admins->sortByDesc('is_online')->values();

        // ============ صفحه‌بندی دستی ============
        $perPage = 21;
        $currentPage = (int) $request->input('page', 1);
        $total = $admins->count();
        $paginatedAdmins = $admins->slice(($currentPage - 1) * $perPage, $perPage)->values();

        $adminsPaginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $paginatedAdmins,
            $total,
            $perPage,
            $currentPage,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        // ============ شمارش کل آنلاین‌ها ============
        $totalOnline = User::query()
            ->whereHas('roles', function ($q) {
                $q->where('is_admin', true);
            })
            ->get()
            ->filter(fn($user) => $user->isOnline())
            ->count();

        return Inertia::render('Admin/Admins/Index', [
            'title' => 'لیست ادمین‌ها',
            'admins' => $adminsPaginator->through(function ($admin) {
                return [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'phone' => $admin->phone,
                    'slug' => $admin->slug,
                    'avatar' => $admin->avatar,
                    'thumbnail' => $admin->avatar(),

                    'status' => $admin->status?->value ?? 'active',
                    'is_online' => $admin->is_online,
                    'last_activity' => $admin->last_activity,
                    'created_at' => $admin->created_at,
                    'last_login_at' => $admin->last_login_at,
                    'roles' => $admin->roles->map(function ($role) {
                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                            // 'label' => $this->translateRoleName($role->name),
                        ];
                    }),
                ];
            }),
            'roles' => Role::select('id', 'name')->get()->map(fn($role) => [
                'id' => $role->id,
                'name' => $role->name,
                // 'label' => $this->translateRoleName($role->name),
            ]),
            'totalOnline' => $totalOnline,
            'filters' => [
                'search' => $search ?? '',
                'status' => $request->input('status', ''),
                'role' => $request->input('role', ''),
                'only_online' => $onlyOnline,
            ],
            'scope' => ['admins', 'admin-list'],
        ]);
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
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',

        ]);
        // slug

        $slug = GenerateUtf8Slug::generateUtf8Slug($request->input('name'));
        $num = 1;
        while (User::where('slug', $slug)->exists()) {
            $num++;
            $slug = $slug . "-$num";
        }

        if ($request->hasFile('image')) {

            $image = $validated['image'];

            $filename = $image->hashName();

            $avatarPath = $image->storeAs(
                'avatars',
                $filename,
                'public'
            );

            Thumbnail::storeThumb(
                $image,
                $avatarPath
            );
        }

        $store = User::create([
            'name' => Str::lower($validated['name']),
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'is_admin' => true,
            'slug' => $slug,
            'phone_verified_at' => Carbon::now(),
            'status' => UserStatus::ACTIVE->value,
            'avatar' => $avatarPath,

        ]);

        $store->syncRoles(
            Role::whereIn('id', $request->roles)->get()
        );

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
                'image' => $user->avatar
                    ? asset('storage/' . $user->avatar)
                    : null,  // ← URL کامل
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',

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



        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($user->avatar);
            Storage::disk('public')->delete('thumbnails/' . $user->avatar);

            $image = $validated['image'];

            $filename = $image->hashName();

            $validated['avatar'] = $image->storeAs(
                'avatars',
                $filename,
                'public'
            );

            Thumbnail::storeThumb(
                $image,
                $validated['avatar']
            );
        }
        $update = $user->update($validated);
        $user->syncRoles(
            Role::whereIn('id', $request->roles)->get()
        );

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

    public function destroy(User $admin)
    {
        // جلوگیری از حذف خود
        if (auth()->id() == $admin->id) {
            session()->forget('alert');
            StickyAlert::alert(
                'نمی‌توانید حساب خودتان را حذف کنید.',
                'success'
            );
            return redirect()->back();
        }

        // بررسی آخرین ادمین
        $adminCount = User::where('is_admin', true)->count();

        if ($adminCount <= 1) {
            StickyAlert::alert(
                'حداقل یک ادمین باید در سیستم باقی بماند.',
                'success'
            );
            return to_route('admin.admins.list');
        }

        $adminName = $admin->name;

        // Soft Delete
        $admin->delete();


        (new \App\Models\Log())->storeLog($admin->id, LogsStatus::delete->value . 'حذف ادمین: ' . $adminName, LogsStatus::delete->value);

        StickyAlert::toast(
            'ادمین با موفقیت حذف شد.',
            'success'
        );
        // return redirect()->back()->with('success', 'ادمین با موفقیت حذف شد.');
    }



    public function onlineStatus()
    {
        $admins = User::query()
            ->where('is_admin', true)
            ->get()
            ->map(function ($admin) {
                return [
                    'id' => $admin->id,
                    'is_online' => $admin->isOnline(),
                    'last_activity' => $admin->lastActivity(),
                ];
            });

        return response()->json([
            'admins' => $admins,
            'total_online' => $admins->where('is_online', true)->count(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
