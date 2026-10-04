<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
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
                        'thumbnail' => $request->user()->avatar(),
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


            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'warning' => fn() => $request->session()->get('warning'),
                'info' => fn() => $request->session()->get('info'),
                'alert' => fn() => $request->session()->get('alert'),
            ],

        ]);
    }
}
