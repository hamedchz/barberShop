<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /**
     * نمایش عمومی یک صفحه منتشرشده
     */
    public function show(string $slug): Response
    {
        $page = Page::query()
            ->published()
            ->where('slug', $slug)
            ->with('activeSections')
            ->firstOrFail();

        return Inertia::render('Frontend/Pages/Show', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'excerpt' => $page->excerpt,
                'featured_image' => $page->featured_image,

                'seo' => [
                    'title' => $page->seo_title ?: $page->title,
                    'description' => $page->seo_description ?: $page->excerpt,
                ],

                'published_at' => $page->published_at,

                'sections' => $page->activeSections
                    ->map(fn($section) => [
                        'id' => $section->id,
                        'type' => $section->type,
                        'content' => $section->content ?? [],
                        'settings' => $section->settings ?? [],
                        'sort_order' => $section->sort_order,
                    ])
                    ->values()
                    ->all(),
            ],
        ]);
    }
}
