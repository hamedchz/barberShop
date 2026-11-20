<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\LogsStatus;
use App\Enums\Casts\Permissions;
use App\Enums\Casts\TimeSlotStatus;
use App\Enums\Casts\UserStatus;
use App\Facades\GenerateUtf8Slug;
use App\Helpers\Thumbnail;
use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Booking;
use App\Models\Service;
use App\Models\TimeSlot;
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
use Illuminate\Validation\ValidationException;

class BarberController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->with('roles')
            // ->where('is_admin', false)
            ->role(User::ROLE_BARBER);

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
            ->role(User::ROLE_BARBER)

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
                    'thumbnail' => $barber->avatarUrl(),

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

            // تصویر اصلی
            'image' => [
                'required',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'max:5120',
            ],

            // تصویر برش‌خورده مخصوص کارت
            'card_image' => [
                'required',
                'image',
                'mimes:webp',
                'max:3072',
            ],
        ]);
        // slug

        $slug = GenerateUtf8Slug::generateUtf8Slug($request->input('name'));
        $num = 1;
        while (User::where('slug', $slug)->exists()) {
            $num++;
            $slug = $slug . "-$num";
        }

        $avatarPath = null;
        $avatarCardPath = null;

        if ($request->hasFile('image') && $request->hasFile('card_image')) {
            $image = $validated['image'];

            $filename = $image->hashName();

            // ذخیره تصویر اصلی
            $avatarPath = $image->storeAs(
                'avatars',
                $filename,
                'public'
            );

            // تولید thumbnail معمولی
            Thumbnail::storeThumb(
                $image,
                $avatarPath
            );

            // تولید تصویر مخصوص کارت
            $avatarCardPath = Thumbnail::storeCardThumb(
                $validated['card_image'],
                $avatarPath,
                800,
                1280,
                85
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
            'avatar_card' => $avatarCardPath,

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
            StickyAlert::alert(
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
        if (!$user->hasRole(User::ROLE_BARBER)) {
            StickyAlert::alert('این کاربر آرایشگر نیست.', 'error');

            return to_route('admin.barbers.list');
        }

        // دریافت تمام نقش‌ها
        $roles = Role::select('id', 'name')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
            ];
        });

        // دریافت ID نقش‌های فعلی آرایشگر
        $adminRoleIds = $user->roles->pluck('id')->toArray();

        return Inertia::render('Admin/Barbers/Edit', [
            'title' => 'ویرایش آرایشگر',

            'barber' => [
                'name' => $user->name,
                'slug' => $user->slug,
                'phone' => $user->phone,

                // تصویر اصلی
                'avatar_url' => $user->avatarUrl(),

                // تصویر مخصوص کارت
                'avatar_card_url' => $user->avatarCardUrl(),

                'status' => $user->status instanceof UserStatus
                    ? $user->status->value
                    : ($user->status ?? 'active'),

                'roles' => $adminRoleIds,
            ],

            'roles' => $roles,
            'statuses' => UserStatus::toSelectArray(),
            'scope' => ['barbers', 'barber-edit'],
        ]);
    }

    //edit admin
    public function update(Request $request, User $user)
    {

        // بررسی نقش آرایشگر
        if (!$user->hasRole(User::ROLE_BARBER)) {
            StickyAlert::alert('این کاربر آرایشگر نیست.', 'error');

            return to_route('admin.barbers.list');
        }

        // ============ اعتبارسنجی ============
        $rules = [
            'name' => 'required|string|max:255',

            'phone' => [
                'required',
                'string',
                'max:20',
                'unique:users,phone,' . $user->id,
            ],

            'status' => [
                'required',
                Rule::enum(UserStatus::class),
            ],

            // تصویر اصلی
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'max:5120',
            ],

            // تصویر برش‌خورده مخصوص کارت
            'card_image' => [
                'required_with:image',
                'image',
                'mimes:webp',
                'max:3072',
            ],
        ];

        if ($request->filled('password')) {
            $rules['password'] = [
                'required',
                'confirmed',
                Password::min(8),
            ];
        }

        $validated = $request->validate($rules);

        // ============ رمز عبور ============
        if ($request->filled('password')) {
            $validated['password'] = Hash::make(
                $validated['password']
            );
        }

        // ============ تولید Slug یکتا ============
        $slug = GenerateUtf8Slug::generateUtf8Slug(
            $validated['name']
        );

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

        // ============ ذخیره تصاویر جدید ============
        $oldAvatar = $user->avatar;
        $oldCardAvatar = $user->avatar_card;

        if ($request->hasFile('image')) {

            $image = $validated['image'];
            $cardImage = $validated['card_image'];

            $filename = $image->hashName();

            // ذخیره تصویر اصلی
            $avatarPath = $image->storeAs(
                'avatars',
                $filename,
                'public'
            );

            // تولید thumbnail معمولی
            Thumbnail::storeThumb(
                $image,
                $avatarPath
            );

            // تولید تصویر اختصاصی کارت از تصویر برش‌خورده React
            $avatarCardPath = Thumbnail::storeCardThumb(
                $cardImage,
                $avatarPath,
                800,
                1280,
                85
            );

            // ثبت مسیر تصاویر جدید
            $validated['avatar'] = $avatarPath;
            $validated['avatar_card'] = $avatarCardPath;
        }

        // فایل‌ها نباید مستقیماً وارد update مدل شوند
        unset(
            $validated['image'],
            $validated['card_image']
        );

        // ============ به‌روزرسانی کاربر ============
        $update = $user->update($validated);

        if ($update) {

            // حذف تصاویر قبلی بعد از موفقیت به‌روزرسانی
            if ($request->hasFile('image')) {

                if (!empty($oldAvatar)) {
                    Storage::disk('public')->delete([
                        $oldAvatar,
                        'thumbnails/' . $oldAvatar,
                    ]);
                }

                if (!empty($oldCardAvatar)) {
                    Storage::disk('public')->delete(
                        $oldCardAvatar
                    );
                }
            }

            // ثبت لاگ
            (new \App\Models\Log())->storeLog(
                $user->id,
                LogsStatus::edit->value . 'آرایشگر',
                LogsStatus::edit->value
            );

            StickyAlert::toast(
                'آرایشگر با موفقیت ویرایش شد.',
                'success'
            );
        } else {

            StickyAlert::alert(
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
        return redirect()->back();
    }

    /**
     * نمایش جزئیات کامل یک آرایشگر
     */
    public function show(User $barber)
    {


        // بررسی اینکه کاربر آرایشگر است
        if (!$barber->hasRole(User::ROLE_BARBER)) {
            StickyAlert::alert('این کاربر آرایشگر نیست.', 'error');
            return to_route('admin.barbers.list');
        }

        // ============ اطلاعات پایه ============
        $barberInfo = [
            'id' => $barber->id,
            'name' => $barber->name,
            'phone' => $barber->phone,
            'slug' => $barber->slug,
            'avatar' => $barber->avatar,
            'thumbnail' => $barber->avatarUrl(),
            'status' => $barber->status?->value ?? 'active',
            'is_online' => $barber->isOnline(),
            'last_activity' => $barber->lastActivity(),
            'created_at' => $barber->created_at,
            'last_login_at' => $barber->last_login_at,
            'roles' => $barber->roles->map(fn($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'label' => $this->translateRoleName($role->name),
            ]),
            'bookings_count' => Booking::where('barber_id', $barber->id)->count()

        ];

        // ============ خدمات ============
        $services = Service::with('category')->where('user_id', $barber->id)
            ->latest()
            ->get()
            ->map(fn($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'image' => $service->category->image ? asset('storage/' . $service->category->image) : null,
                'duration' => $service->duration,
                'price' => $service->price,
                'is_active' => (bool) $service->is_active,
                'created_at' => $service->created_at,
            ]);

        // ============ برنامه هفتگی ============
        $availabilities = Availability::where('user_id', $barber->id)
            ->orderBy('day_of_week')
            ->get()
            ->map(fn($avail) => [
                'id' => $avail->id,
                'day_of_week' => $avail->day_of_week,
                'start_time' => $avail->start_time,
                'end_time' => $avail->end_time,
                'is_active' => (bool) $avail->is_active,
            ]);

        // ============ آمار ============
        $stats = [
            'total_services' => $services->count(),
            'active_services' => $services->where('is_active', true)->count(),
            'total_time_slots' => TimeSlot::where('user_id', $barber->id)->count(),
            'available_slots' => TimeSlot::where('user_id', $barber->id)
                ->where('status', TimeSlotStatus::available->value)->count(),
            'booked_slots' => TimeSlot::where('user_id', $barber->id)
                ->where('status', TimeSlotStatus::booked->value)->count(),
            'blocked_slots' => TimeSlot::where('user_id', $barber->id)
                ->where('status', TimeSlotStatus::blocked->value)->count(),
            'total_bookings' => TimeSlot::where('user_id', $barber->id)
                ->where('status', TimeSlotStatus::booked->value)->count(),
            'total_revenue' => Booking::where('barber_id', $barber->id)
                ->where('status', BookingStatus::completed->value)
                ->whereHas('timeSlot', function ($q) {
                    $q->whereMonth('date', Carbon::now()->month)
                        ->whereYear('date', Carbon::now()->year);
                })
                ->sum('amount'),

        ];

        // ============ بازه‌های پیش رو (۷ روز آینده) ============
        $upcomingSlots = TimeSlot::where('user_id', $barber->id)
            ->where('date', '>=', Carbon::today())
            ->where('date', '<=', Carbon::today()->addDays(7))
            ->with(['service', 'bookedBy'])
            ->orderBy('date')
            ->orderBy('start_time')
            ->limit(20)
            ->get()
            ->map(fn($slot) => [
                'id' => $slot->id,
                'date' => $slot->date,
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'status' => $slot->status,
                'service' => $slot->service ? [
                    'id' => $slot->service->id,
                    'name' => $slot->service->name,
                    'price' => $slot->service->price,
                ] : null,
                'booked_by' => $slot->bookedBy ? [
                    'id' => $slot->bookedBy->id,
                    'name' => $slot->bookedBy->name,
                    'phone' => $slot->bookedBy->phone,
                ] : null,
            ]);

        return Inertia::render('Admin/Barbers/Show', [
            'title' => "جزئیات آرایشگر: {$barber->name}",
            'barber' => $barberInfo,
            'services' => $services,
            'availabilities' => $availabilities,
            'stats' => $stats,
            'upcomingSlots' => $upcomingSlots,
        ]);
    }

    /**
     * ترجمه نام نقش
     */
    private function translateRoleName(string $name): string
    {
        $translations = [
            'super-admin' => 'مدیر ارشد',
            'admin' => 'مدیر',
            'barber' => 'آرایشگر',
            'teacher' => 'معلم',
            'student' => 'دانش‌آموز',
        ];

        return $translations[$name] ?? ucfirst(str_replace('-', ' ', $name));
    }

    public function onlineStatus()
    {
        $barbers = User::query()
            ->where('is_admin', false)->role(User::ROLE_BARBER)
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
