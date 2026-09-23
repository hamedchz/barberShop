<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class OnlineUsersController extends Controller
{
    /**
     * نمایش صفحه کاربران آنلاین (فقط برای سوپر ادمین)
     */
    public function index()
    {
        // بررسی دسترسی سوپر ادمین
        if (!auth()->user()->hasRole('super-admin')) {
            abort(403, 'شما دسترسی به این صفحه ندارید.');
        }

        // تمام کاربران آنلاین
        $onlineUsers = $this->getOnlineUsers();

        // تمام کاربران آفلاین (برای نمایش در تب دیگر)
        $offlineUsers = $this->getOfflineUsers();

        // آمار کلی
        $stats = [
            'total_online' => count($onlineUsers),
            'total_offline' => count($offlineUsers),
            'total_users' => User::count(),
        ];

        return Inertia::render('Admin/OnlineUsers/Index', [
            'title' => 'کاربران آنلاین',
            'onlineUsers' => $onlineUsers,
            'offlineUsers' => $offlineUsers,
            'stats' => $stats,
        ]);
    }

    /**
     * API برای بروزرسانی زنده (Polling)
     */
    public function live()
    {
        if (!auth()->user()->hasRole('super-admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'onlineUsers' => $this->getOnlineUsers(),
            'stats' => [
                'total_online' => count($this->getOnlineUsers()),
                'total_offline' => count($this->getOfflineUsers()),
                'total_users' => User::count(),
            ],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * دریافت لیست کاربران آنلاین
     */
    private function getOnlineUsers(): array
    {
        // دریافت تمام کاربران
        $users = User::with(['roles', 'permissions'])
            ->get()
            ->filter(function ($user) {
                return $user->isOnline();
            })
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'status' => $user->status?->value ?? 'active',
                    'roles' => $user->roles->map(function ($role) {
                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                            'label' => $this->translateRoleName($role->name),
                        ];
                    }),
                    'last_activity' => $user->lastActivity(),
                    'last_activity_human' => $user->lastActivity()
                        ? \Carbon\Carbon::parse($user->lastActivity())->diffForHumans()
                        : null,
                    'ip_address' => $user->last_login_ip ?? null,
                    'user_agent' => $user->last_login_user_agent ?? null,
                ];
            })
            ->values()
            ->toArray();

        // مرتب‌سازی: جدیدترین فعالیت اول
        usort($onlineUsers, function ($a, $b) {
            return strtotime($b['last_activity']) - strtotime($a['last_activity']);
        });

        return $onlineUsers;
    }

    /**
     * دریافت لیست کاربران آفلاین
     */
    private function getOfflineUsers(): array
    {
        return User::with(['roles'])
            ->get()
            ->filter(function ($user) {
                return !$user->isOnline();
            })
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'status' => $user->status?->value ?? 'active',
                    'roles' => $user->roles->map(function ($role) {
                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                            'label' => $this->translateRoleName($role->name),
                        ];
                    }),
                    'last_login_at' => $user->last_login_at,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * ترجمه نام نقش
     */
    private function translateRoleName(string $name): string
    {
        $translations = [
            'super-admin' => 'مدیر ارشد',
            'admin' => 'مدیر',
            'teacher' => 'معلم',
            'student' => 'دانش‌آموز',
            'parent' => 'والد',
        ];

        return $translations[$name] ?? ucfirst(str_replace('-', ' ', $name));
    }
}
