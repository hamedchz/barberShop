<?php

namespace App\Http\Controllers\Public;

use App\Enums\Casts\PageContactSubmissionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePageContactSubmissionRequest;
use App\Models\Page;
use App\Models\PageContactSubmission;
use Illuminate\Http\RedirectResponse;

class PageContactSubmissionController extends Controller
{
    public function store(
        StorePageContactSubmissionRequest $request,
        string $slug
    ): RedirectResponse {
        $page = Page::query()
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();



        // فقط صفحاتی که سکشن فعال فرم تماس دارند
        $hasContactForm = $page->activeSections()
            ->where('type', 'contact_form')
            ->exists();

        abort_unless($hasContactForm, 404);

        // فیلد مخفی ضد ربات؛ پیام ربات ذخیره نمی‌شود.
        if ($request->filled('website')) {

            return back()->with(
                'success',
                'پیام شما با موفقیت ثبت شد. از ارتباط شما سپاسگزاریم.'
            );
        }

        $data = $request->safe()->only([
            'name',
            'phone',
            'email',
            'subject',
            'message',
        ]);

        PageContactSubmission::create([
            ...$data,
            'page_id' => $page->id,
            'user_id' => $request->user()?->id,
            'status' => PageContactSubmissionStatus::NEW->value,
        ]);

        return back()->with(
            'success',
            'پیام شما با موفقیت ثبت شد. از ارتباط شما سپاسگزاریم.'
        );
    }
}
