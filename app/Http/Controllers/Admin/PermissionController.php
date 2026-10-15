<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function search(Request $request)
    {
        $search = trim($request->input('search', ''));

        $permissions = Permission::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->limit(5)
            ->get();

        return response()->json([
            'results' => $permissions->map(function ($permission) {
                return [
                    'value' => (string) $permission->id,
                    'label' => $permission->description
                        ?: __($permission->name),
                    'name' => $permission->name,
                ];
            })->values(),
        ]);
    }
}
