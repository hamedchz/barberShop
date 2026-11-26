<?php

namespace App\Services\PageBuilder;

use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Enums\Casts\PageStatus;
use App\Facades\GenerateUtf8Slug;

class PageBuilderService
{
  public function __construct(
    protected SectionValidator $validator
  ) {}

  /**
   * ایجاد صفحه جدید
   */
  public function createPage(array $data): Page
  {
    return DB::transaction(function () use ($data) {

      $data = $this->preparePageData($data);

      return Page::create([
        ...$data,
        'created_by' => auth()->id(),
        'updated_by' => auth()->id(),
      ]);
    });
  }

  /**
   * ویرایش اطلاعات صفحه
   */
  public function updatePage(Page $page, array $data): Page
  {
    return DB::transaction(function () use ($page, $data) {

      $data = $this->preparePageData(
        $data,
        $page
      );

      $page->update([
        ...$data,
        'updated_by' => auth()->id(),
      ]);

      return $page->refresh();
    });
  }

  /**
   * آماده‌سازی اطلاعات صفحه
   */
  protected function preparePageData(
    array $data,
    ?Page $page = null
  ): array {

    /*
    |--------------------------------------------------------------------------
    | Generate slug when empty
    |--------------------------------------------------------------------------
    */

    if (empty($data['slug']) && !empty($data['title'])) {
      $data['slug'] = GenerateUtf8Slug::generateUtf8Slug(
        $data['title']
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate and normalize slug
    |--------------------------------------------------------------------------
    */

    if (isset($data['slug'])) {

      $slug = GenerateUtf8Slug::generateUtf8Slug(
        $data['slug']
      );

      if (empty($slug)) {
        throw ValidationException::withMessages([
          'slug' => 'شناسه URL صفحه معتبر نیست.',
        ]);
      }

      $baseSlug = $slug;
      $counter = 2;

      while (
        Page::query()
        ->where('slug', $slug)
        ->when(
          $page,
          fn($query) => $query->where('id', '!=', $page->id)
        )
        ->exists()
      ) {
        $slug = $baseSlug . '-' . $counter;
        $counter++;
      }

      $data['slug'] = $slug;
    }

    return $data;
  }

  /**
   * ذخیره کامل بلوک‌های صفحه
   *
   * ساختار ورودی:
   *
   * [
   *   [
   *     'id' => null,
   *     'type' => 'hero',
   *     'content' => [...],
   *     'settings' => [...],
   *     'is_active' => true
   *   ]
   * ]
   */
  public function saveSections(
    Page $page,
    array $sections
  ): Page {

    if (count($sections) > 50) {
      throw ValidationException::withMessages([
        'sections' => 'حداکثر ۵۰ بلوک برای هر صفحه مجاز است.',
      ]);
    }

    $sectionIds = collect($sections)
      ->pluck('id')
      ->filter()
      ->map(fn($id) => (int) $id);

    if ($sectionIds->count() !== $sectionIds->unique()->count()) {
      throw ValidationException::withMessages([
        'sections' => 'شناسه یکی از بلوک‌ها تکراری است.',
      ]);
    }

    return DB::transaction(function () use ($page, $sections) {

      $savedIds = [];

      foreach (array_values($sections) as $index => $section) {

        $validated = $this->validator->validate($section);

        $sectionId = $section['id'] ?? null;

        if ($sectionId) {
          $model = $page->sections()
            ->whereKey($sectionId)
            ->first();

          if (!$model) {
            throw ValidationException::withMessages([
              'sections' => 'یکی از بلوک‌های ارسالی متعلق به این صفحه نیست.',
            ]);
          }
        } else {
          $model = new PageSection();
        }

        $model->fill([
          'type' => $validated['type'],
          'content' => $validated['content'],
          'settings' => $validated['settings'],
          'sort_order' => $index,
          'is_active' => $validated['is_active'],
        ]);

        $page->sections()->save($model);

        $savedIds[] = $model->id;
      }

      // حذف بلوک‌هایی که در درخواست جدید وجود ندارند
      $page->sections()
        ->when(
          !empty($savedIds),
          fn($query) => $query->whereNotIn('id', $savedIds)
        )
        ->when(
          empty($savedIds),
          fn($query) => $query
        )
        ->delete();

      $page->update([
        'updated_by' => auth()->id(),
      ]);

      return $page->refresh();
    });
  }

  /**
   * مرتب‌سازی بلوک‌ها بر اساس شناسه
   */
  public function reorderSections(
    Page $page,
    array $sectionIds
  ): Page {

    return DB::transaction(function () use ($page, $sectionIds) {

      $existingIds = $page->sections()
        ->pluck('id')
        ->map(fn($id) => (int) $id)
        ->sort()
        ->values()
        ->all();

      $requestedIds = collect($sectionIds)
        ->map(fn($id) => (int) $id)
        ->sort()
        ->values()
        ->all();

      if (
        count($requestedIds) !== count(array_unique($requestedIds)) ||
        $existingIds !== $requestedIds
      ) {
        throw ValidationException::withMessages([
          'sections' => 'فهرست بلوک‌ها برای مرتب‌سازی معتبر نیست.',
        ]);
      }

      foreach (array_values($sectionIds) as $index => $id) {
        $page->sections()
          ->whereKey($id)
          ->update([
            'sort_order' => $index,
          ]);
      }

      $page->update([
        'updated_by' => auth()->id(),
      ]);

      return $page->refresh();
    });
  }

  /**
   * فعال یا غیرفعال کردن بلوک
   */
  public function toggleSection(
    Page $page,
    PageSection $section,
    bool $isActive
  ): PageSection {

    if ((int) $section->page_id !== (int) $page->id) {
      throw ValidationException::withMessages([
        'section' => 'این بلوک متعلق به صفحه انتخاب‌شده نیست.',
      ]);
    }

    $section->update([
      'is_active' => $isActive,
    ]);

    return $section->refresh();
  }

  /**
   * انتشار صفحه
   */
  public function publish(Page $page): Page
  {
    return DB::transaction(function () use ($page) {

      $hasActiveSections = $page->sections()
        ->where('is_active', true)
        ->exists();

      if (!$hasActiveSections) {
        throw ValidationException::withMessages([
          'sections' => 'برای انتشار صفحه حداقل یک بلوک فعال لازم است.',
        ]);
      }

      $page->update([
        'status' => PageStatus::PUBLISHED,
        'published_at' => $page->published_at ?? now(),
        'updated_by' => auth()->id(),
      ]);

      return $page->refresh();
    });
  }

  /**
   * خارج کردن صفحه از انتشار
   */
  public function unpublish(Page $page): Page
  {
    $page->update([
      'status' => PageStatus::DRAFT,
      'published_at' => null,
      'updated_by' => auth()->id(),
    ]);

    return $page->refresh();
  }

  /**
   * حذف صفحه
   */
  public function deletePage(Page $page): bool
  {
    return DB::transaction(function () use ($page) {
      return (bool) $page->delete();
    });
  }
}
