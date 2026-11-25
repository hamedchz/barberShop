<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageContactSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageContactSubmissionController extends Controller
{
    /**
     * فهرست پیام‌های دریافتی
     */
    public function index(Request $request)
    {
        $query = PageContactSubmission::query();

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $messages = $query
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Pages/Messages/Index', [
            'messages' => $messages,

            'stats' => [
                'total' => PageContactSubmission::count(),
                'new' => PageContactSubmission::where('status', 'new')->count(),
                'read' => PageContactSubmission::where('status', 'read')->count(),
                'answered' => PageContactSubmission::where('status', 'answered')->count(),
            ],

            'filters' => [
                'search' => $request->input('search'),
                'status' => $request->input('status'),
            ],
        ]);
    }

    /**
     * مشاهده جزئیات پیام
     */
    public function show(PageContactSubmission $submission)
    {
        if ($submission->status === 'new') {
            $submission->update([
                'status' => 'read',
            ]);
        }

        return Inertia::render('Admin/Pages/Messages/Show', [
            'submission' => $submission->fresh(),
        ]);
    }

    /**
     * بروزرسانی وضعیت پیام
     */
    public function update(Request $request, PageContactSubmission $submission)
    {
        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                'in:new,read,answered,closed',
            ],
        ]);

        $submission->update($validated);

        return back()->with('success', 'وضعیت پیام بروزرسانی شد.');
    }

    /**
     * حذف پیام
     */
    public function destroy(PageContactSubmission $submission)
    {
        $submission->delete();

        return redirect()
            ->route('admin.pages.messages.index')
            ->with('success', 'پیام با موفقیت حذف شد.');
    }
}
