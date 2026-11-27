<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class PageImageController extends Controller
{
    use AuthorizesRequests;
    public function store(Request $request, Page $page): JsonResponse
    {
        $this->authorize('pages-edit');

        $validated = $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ], [
            'image.required' => 'لطفاً یک تصویر انتخاب کنید.',
            'image.image' => 'فایل انتخاب‌شده تصویر معتبر نیست.',
            'image.mimes' => 'فرمت تصویر باید JPG، PNG یا WEBP باشد.',
            'image.max' => 'حجم تصویر نباید بیشتر از ۵ مگابایت باشد.',
        ]);

        $path = $validated['image']->store(
            "pages/{$page->id}/images",
            'public'
        );

        return response()->json([
            'success' => true,
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
            'name' => basename($path),
        ]);
    }
}
