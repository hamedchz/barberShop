<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user()
                    ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'phone' => $request->user()->phone,
                        'avatar' => $request->user()->avatar,
                        'avatar_url' => $request->user()->avatarUrl(),
                        'roles' => $request->user()
                            ->getRoleNames()
                            ->toArray(),
                        'permissions' => $request->user()
                            ->getAllPermissions()
                            ->pluck('name')
                            ->toArray(),
                        'notifications' => $request->user()->notifications()
                            ->latest()
                            ->limit(10)
                            ->get()
                            ->map(fn($n) => [
                                'id' => $n->id,
                                'data' => $n->data,
                                'read_at' => $n->read_at,
                                'created_at' => $n->created_at->toIso8601String(),
                            ]),
                        'unread_notifications_count' => $request->user()
                            ->unreadNotifications()
                            ->count(),
                    ]
                    : null,
            ],

            'theme' => $this->getTheme(),
            'site'  => $this->getSiteInfo(),
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'warning' => fn() => $request->session()->get('warning'),
                'info' => fn() => $request->session()->get('info'),
                'alert' => fn() => $request->session()->get('alert'),
            ],

        ]);
    }
    /**
     * رنگ‌های سایت (از cache)
     */
    private function getTheme(): array
    {
        return Cache::remember('site_theme', 3600, function () {
            $primary = Setting::get('primary_color', '#10B981');
            $secondary = Setting::get('secondary_color', '#1E293B');

            // ============ مشتقات خودکار ============
            $primaryHover = Setting::getHoverFromPrimary($primary);
            $primaryTint = Setting::getTintFromPrimary($primary);

            return [
                'mode' => Setting::get('theme_mode', 'light'),

                'primary'       => $primary,
                'primaryHover'  => $primaryHover,
                'primaryTint'   => $primaryTint,

                'secondary'     => $secondary,

                // ============ ثابت‌ها (قابل تغییر نیستن) ============
                'success' => '#10B981',
                'danger'  => '#EF4444',
                'warning' => '#F59E0B',
                'info'    => '#3B82F6',
            ];
        });
    }

    /**
     * اطلاعات سایت
     */
    private function getSiteInfo(): array
    {
        return Cache::remember('site_info', 3600, function () {
            $logo = Setting::get('site_logo');
            $favicon = Setting::get('site_favicon');

            return [
                'name'        => Setting::get('site_name', 'آرایشگاه من'),
                'description' => Setting::get('site_description', ''),
                'logo'        => $logo ? asset('storage/' . $logo) : null,
                'favicon'     => $favicon ? asset('storage/' . $favicon) : null,
                'phone'       => Setting::get('contact_phone', ''),
                'email'       => Setting::get('contact_email', ''),
                'instagram'   => Setting::get('social_instagram', ''),
                'telegram'    => Setting::get('social_telegram', ''),
            ];
        });
    }
}
