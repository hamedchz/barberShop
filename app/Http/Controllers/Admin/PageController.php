<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\PageStatus;
use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Services\PageBuilder\PageBuilderService;
use App\Services\PageBuilder\SectionRegistry;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PageController extends Controller
{
    public function __construct(
        protected PageBuilderService $pageBuilder,
        protected SectionRegistry $sectionRegistry
    ) {}

    /**
     * فهرست صفحات
     */
    public function index(Request $request)
    {

        $search = trim((string) $request->input('search', ''));
        $status = $request->input('status');

        $query = Page::query()
            ->with(['creator:id,name', 'updater:id,name'])
            ->withCount('sections');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }


        if (in_array($status, [PageStatus::DRAFT->value, PageStatus::PUBLISHED->value, PageStatus::ARCHIVED->value], true)) {
            $query->where('status', $status);
        }

        $pages = $query
            ->latest('id')
            ->paginate(33)
            ->withQueryString()
            ->through(fn(Page $page) => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'excerpt' => $page->excerpt,
                'status' => $page->status instanceof PageStatus
                    ? $page->status->value
                    : $page->status,
                'show_in_header' => $page->show_in_header,
                'show_in_footer' => $page->show_in_footer,
                'published_at' => $page->published_at?->format('Y/m/d H:i'),
                'sections_count' => $page->sections_count,
                'creator' => $page->creator?->name,
                'created_at' => $page->created_at?->format('Y/m/d H:i'),
            ]);

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $pages,

            'stats' => [
                'total' => Page::count(),
                'published' => Page::where('status', PageStatus::PUBLISHED->value)->count(),
                'draft' => Page::where('status', PageStatus::DRAFT->value)->count(),
                'archived' => Page::where('status', PageStatus::ARCHIVED->value)->count(),
            ],

            'filters' => [
                'search' => $search,
                'status' => $status,
            ],

            'can' => [
                'create' => $request->user()->can('pages-create'),
                'edit' => $request->user()->can('pages-edit'),
                'delete' => $request->user()->can('pages-delete'),
                'publish' => $request->user()->can('pages-publish'),
                'preview' => $request->user()->can('pages-preview'),
            ],
        ]);
    }

    /**
     * فرم ایجاد صفحه
     */
    public function create()
    {
        return Inertia::render('Admin/Pages/Create');
    }

    /**
     * ذخیره صفحه جدید
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:190'],
            'slug' => [
                'required',
                'string',
                'max:190',
                'regex:/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u',
                Rule::unique('pages', 'slug'),
            ],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'featured_image' => ['nullable', 'string', 'max:2048'],
            'seo_title' => ['nullable', 'string', 'max:190'],
            'seo_description' => ['nullable', 'string', 'max:500'],
            'show_in_header' => ['nullable', 'boolean'],
            'show_in_footer' => ['nullable', 'boolean'],
            'header_order' => ['nullable', 'integer', 'min:0'],
            'footer_order' => ['nullable', 'integer', 'min:0'],
            'intent' => ['required', Rule::in(['builder', 'draft'])],
        ]);

        $intent = $validated['intent'];

        unset($validated['intent']);

        $validated['show_in_header'] = $request->boolean('show_in_header');
        $validated['show_in_footer'] = $request->boolean('show_in_footer');
        $validated['status'] = PageStatus::DRAFT->value;
        $validated['created_by'] = $request->user()->id;
        $validated['updated_by'] = $request->user()->id;
        $validated['published_at'] = null;

        $page = $this->pageBuilder->createPage($validated);

        if ($intent === 'builder') {
            StickyAlert::toast(
                'صفحه ایجاد شد. اکنون می‌توانید محتوای آن را طراحی کنید.',
                'success'
            );

            return to_route('admin.pages.builder', $page);
        }

        StickyAlert::toast(
            'صفحه به‌صورت پیش‌نویس ذخیره شد.',
            'success'
        );

        return to_route('admin.pages.index');
    }

    /**
     * فرم ویرایش صفحه
     */
    public function edit(Page $page)
    {
        $page->load([
            'sections' => fn($query) => $query
                ->orderBy('sort_order')
                ->orderBy('id'),
        ]);

        return Inertia::render('Admin/Pages/Edit', [
            'page' => $page,
            'sectionTypes' => $this->sectionRegistry->all(),
        ]);
    }

    /**
     * بروزرسانی اطلاعات صفحه
     */
    public function update(Request $request, Page $page)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:190'],
            'slug' => [
                'required',
                'string',
                'max:190',
                'regex:/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u',
                Rule::unique('pages', 'slug')->ignore($page->id),
            ],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'featured_image' => ['nullable', 'string', 'max:2048'],
            'seo_title' => ['nullable', 'string', 'max:190'],
            'seo_description' => ['nullable', 'string', 'max:500'],
            'show_in_header' => ['nullable', 'boolean'],
            'show_in_footer' => ['nullable', 'boolean'],
            'header_order' => ['nullable', 'integer', 'min:0'],
            'footer_order' => ['nullable', 'integer', 'min:0'],

        ]);

        $validated['show_in_header'] = $request->boolean('show_in_header');
        $validated['show_in_footer'] = $request->boolean('show_in_footer');
        $validated['updated_by'] = $request->user()->id;

        $this->pageBuilder->updatePage($page, $validated);

        StickyAlert::toast('اطلاعات صفحه با موفقیت بروزرسانی شد.', 'success');
        return  to_route('admin.pages.index');
    }

    public function builder(Page $page)
    {
        $page->load([
            'sections' => function ($query) {
                $query
                    ->orderBy('sort_order')
                    ->orderBy('id');
            },
        ]);

        return Inertia::render('Admin/Pages/Builder', [
            'page' => $page,
            'sectionTypes' => $this->sectionRegistry->all(),
        ]);
    }

    /**
     * پیش‌نمایش صفحه
     */
    public function preview(Page $page)
    {
        $page->load([
            'sections' => fn($query) => $query
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id'),
        ]);

        return Inertia::render('Admin/Pages/Preview', [
            'page' => $page,
            'preview' => true,
        ]);
    }

    /**
     * انتشار صفحه
     */
    public function publish(Page $page)
    {
        $this->pageBuilder->publish($page);

        StickyAlert::toast('صفحه با موفقیت منتشر شد.', 'success');

        return to_route('admin.pages.index');
    }

    /**
     * لغو انتشار صفحه
     */
    public function unpublish(Page $page)
    {
        $this->pageBuilder->unpublish($page);
        StickyAlert::toast('انتشار صفحه لغو شد.', 'success');
        return  to_route('admin.pages.index');
    }

    /**
     * حذف صفحه
     */
    public function destroy(Page $page)
    {
        DB::transaction(function () use ($page) {
            $page->delete();
        });
        StickyAlert::toast('صفحه با موفقیت حذف شد.', 'success');
        return  to_route('admin.pages.index');
    }
}
