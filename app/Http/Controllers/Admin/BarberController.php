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


class BarberController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->with('roles')
            ->where('is_admin', false)
            ->whereHas('roles', function ($q) {
                $q->where('roles.id', 8);
            });

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

        $barbers = $query->latest()->get();

        // ============ محاسبه وضعیت آنلاین و فیلتر ============
        $barbers = $barbers->map(function ($admin) {
            $admin->is_online = $admin->isOnline();
            $admin->last_activity = $admin->lastActivity();

            return $admin;
        });

        if ($onlyOnline) {
            $barbers = $barbers->filter(fn($a) => $a->is_online);
        }

        // ============ مرتب‌سازی: آنلاین‌ها اول ============
        $barbers = $barbers->sortByDesc('is_online')->values();

        // ============ صفحه‌بندی دستی ============
        $perPage = 21;
        $currentPage = (int) $request->input('page', 1);

        $total = $barbers->count();

        $paginatedbarbers = $barbers
            ->slice(($currentPage - 1) * $perPage, $perPage)
            ->values();

        $barbersPaginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $paginatedbarbers,
            $total,
            $perPage,
            $currentPage,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );

        // ============ شمارش کل آنلاین‌ها ============
        $totalOnline = User::query()
            ->where('is_admin', false)
            ->whereHas('roles', function ($q) {
                $q->where('roles.id', 2);
            })
            ->get()
            ->filter(fn($user) => $user->isOnline())
            ->count();

        return Inertia::render('Admin/Barbers/Index', [
            'title' => 'لیست آرایشگر ها',

            'barbers' => $barbersPaginator->through(function ($barber) {
                return [
                    'id' => $barber->id,
                    'name' => $barber->name,
                    'phone' => $barber->phone,
                    'slug' => $barber->slug,
                    'avatar' => $barber->avatar,
                    'thumbnail' => $barber->avatar(),

                    'status' => $barber->status?->value ?? 'active',
                    'is_online' => $barber->is_online,
                    'last_activity' => $barber->last_activity,
                    'created_at' => $barber->created_at,
                    'last_login_at' => $barber->last_login_at,

                    'roles' => $barber->roles->map(function ($role) {
                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                        ];
                    }),
                ];
            }),

            'totalOnline' => $totalOnline,
            'filters' => [
                'search' => $search ?? '',
                'status' => $request->input('status', ''),
                'only_online' => $onlyOnline,
            ],

            'scope' => ['barbers', 'barber-list'],
        ]);
    }
    public function create()
    {
        // $this->authorize(Permissions::manageAdmins->value);
        $context = [
            'title' => 'New barber',
            'roles' => Role::all(),
            'scope' => ['barbers', 'barber-create'],
        ];

        return Inertia::render('Admin/Barbers/Create', $context);
    }
    public function store(Request $request)
    {



        // $this->authorize(Permissions::manageAdmins->value);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone',
            'password' => ['required', 'confirmed', Password::min(8)],
            // 'roles' => ['required', 'array', Rule::in(Role::all()->pluck('id')->toArray())],
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
            'slug' => $slug,
            'phone_verified_at' => Carbon::now(),
            'status' => UserStatus::ACTIVE->value,
            'avatar' => $avatarPath,

        ]);

        $store->syncRoles(
            Role::where('id', 8)->get()
        );

        if ($store) {
            (new \App\Models\Log())->storeLog($store->id, LogsStatus::store->value . 'barber', LogsStatus::store->value);
            StickyAlert::toast(
                'آرایشگر جدید با موفقیت ایجاد شد.',
                'success'
            );
        } else {
            StickyAlert::toast(
                'مشکلی وجود دارد.',
                'error'
            );
        }

        return to_route('admin.barbers.list');
    }

    //edit admin
    public function edit(User $user)
    {
        // بررسی اینکه کاربر آرایشگر است
        if (!$user->roles()->where('roles.id', 8)->exists()) {
            StickyAlert::alert('این کاربر آرایشگر نیست.', 'error');

            return to_route('admin.barbers.list');
        }

        // دریافت تمام نقش‌ها
        $roles = Role::select('id', 'name')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                // 'label' => $this->translateRoleName($role->name),
            ];
        });

        // دریافت ID نقش‌های فعلی این آرایشگر
        $adminRoleIds = $user->roles->pluck('id')->toArray();

        return Inertia::render('Admin/Barbers/Edit', [
            'title' => 'ویرایش آرایشگر',
            'barber' => [
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
            'scope' => ['barbers', 'barber-edit'],
        ]);
    }

    //edit admin
    public function update(Request $request, User $user)
    {


        // $this->authorize(Permissions::manageAdmins->value);

        if (!$user->roles()->where('roles.id', 8)->exists()) {
            StickyAlert::alert('این کاربر آرایشگر نیست.', 'error');

            return to_route('admin.barbers.list');
        }
        // ============ اعتبارسنجی ============
        $rules = [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone,' . $user->id,
            'status' => ['required', Rule::enum(UserStatus::class)], // ← اعتبارسنجی Enum
            // 'roles' => ['required', 'array', Rule::in(Role::all()->pluck('id')->toArray())],
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


        if ($update) {
            (new \App\Models\Log())->storeLog($user->id, LogsStatus::edit->value . 'آرایشگر', LogsStatus::edit->value);
            StickyAlert::toast(
                'آرایشگر  با موفقیت ویرایش شد.',
                'success'
            );
        } else {
            StickyAlert::toast(
                'مشکلی وجود دارد.',
                'error'
            );
        }
        return to_route('admin.barbers.list');
    }

    public function destroy(User $barber)
    {


        $barberName = $barber->name;

        // Soft Delete
        $barber->delete();


        (new \App\Models\Log())->storeLog($barber->id, LogsStatus::delete->value . 'حذف آرایشگر: ' . $barberName, LogsStatus::delete->value);

        StickyAlert::toast(
            'آرایشگر با موفقیت حذف شد.',
            'success'
        );
        // return redirect()->back()->with('success', 'ادمین با موفقیت حذف شد.');
    }

    public function onlineStatus()
    {
        $barbers = User::query()
            ->where('is_admin', false)->whereHas('roles', function ($q) {
                $q->where('roles.id', 8);
            })
            ->get()
            ->map(function ($admin) {
                return [
                    'id' => $admin->id,
                    'is_online' => $admin->isOnline(),
                    'last_activity' => $admin->lastActivity(),
                ];
            });

        return response()->json([
            'barbers' => $barbers,
            'total_online' => $barbers->where('is_online', true)->count(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
