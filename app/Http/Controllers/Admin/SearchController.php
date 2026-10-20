<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class SearchController extends Controller
{


    /**
     * جستجوی کاربران + ۵ کاربر اولیه (اگه q خالی باشه)
     */
    public function UserSearch(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $users = User::query()
            ->select(['id', 'name', 'phone'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");

                    if (ctype_digit($search)) {
                        $query->orWhere('id', (int) $search);
                    }
                });
            })
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json(
            $users->map(function ($user) {
                return [
                    'value' => $user->id,
                    'label' => $user->name
                        . ' - '
                        . ($user->phone ?: 'بدون شماره تماس'),
                ];
            })->values()
        );
    }

    /**
     * ۵ کاربر اولیه برای initialOptions
     */
    public static function getInitialUsersOptions(int $limit = 5): array
    {
        return User::query()
            ->select('id', 'name', 'phone', 'avatar')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn($user) => [
                'value' => $user->id,
                'label' => $user->phone
                    ? "{$user->name} — {$user->phone}"
                    : $user->name,
                'name' => $user->name,
                'phone' => $user->phone,
                'icon' => $user->avatar
                    ? $user->avatarUrl()
                    : null,
            ])
            ->toArray();
    }
}
