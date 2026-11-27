<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\PageSection;
use App\Services\PageBuilder\PageBuilderService;
use App\Supports\StickyAlert;
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
        StickyAlert::toast('بلوک‌های صفحه با موفقیت ذخیره شدند.', 'success');
        return back();
    }

    public function destroy(Page $page, PageSection $section)
    {
        abort_unless(auth()->user()->can('pages-edit'), 403);

        // اطمینان از تعلق بلوک به صفحه موردنظر
        abort_unless(
            $section->page_id === $page->id,
            404
        );

        $section->delete();
        StickyAlert::toast('بلوک با موفقیت حذف شد.', 'success');
        return back();
    }
}
