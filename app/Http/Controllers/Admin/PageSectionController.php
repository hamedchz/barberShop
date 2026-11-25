<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Services\PageBuilder\PageBuilderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;




class PageSectionController extends Controller
{
    use AuthorizesRequests;
    public function update(
        Request $request,
        Page $page,
        PageBuilderService $pageBuilder
    ): RedirectResponse {
        $this->authorize('pages-edit');

        $validated = $request->validate([
            'sections' => [
                'required',
                'array',
                'max:50',
            ],

            'sections.*' => [
                'required',
                'array',
            ],

            'sections.*.id' => [
                'nullable',
                'integer',
                'distinct',
            ],

            'sections.*.type' => [
                'required',
                'string',
                'max:50',
            ],

            'sections.*.content' => [
                'required',
                'array',
            ],

            'sections.*.settings' => [
                'nullable',
                'array',
            ],

            'sections.*.is_active' => [
                'required',
                'boolean',
            ],
        ]);

        try {
            $pageBuilder->saveSections(
                $page,
                $validated['sections']
            );
        } catch (ValidationException $exception) {
            throw $exception;
        }

        return back()->with(
            'success',
            'بلوک‌های صفحه با موفقیت ذخیره شدند.'
        );
    }
}
