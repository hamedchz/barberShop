<?php

namespace App\Services\PageBuilder;

class SectionRegistry
{
  /**
   * تمام بلوک‌های قابل استفاده در صفحه‌ساز
   */
  protected array $sections = [

    'hero' => [
      'label' => 'بنر اصلی',
      'description' => 'نمایش عنوان، توضیحات و تصویر اصلی صفحه',

      'content' => [
        'title' => '',
        'subtitle' => '',
        'button_text' => '',
        'button_url' => '',
        'image' => '',
      ],

      'settings' => [
        'alignment' => 'center',
        'background' => 'primary',
        'height' => 'medium',
      ],

      'content_rules' => [
        'title' => ['required', 'string', 'max:200'],
        'subtitle' => ['nullable', 'string', 'max:2000'],
        'button_text' => ['nullable', 'string', 'max:100'],
        'button_url' => ['nullable', 'string', 'max:2048'],
        'image' => ['nullable', 'string', 'max:500'],
      ],

      'settings_rules' => [
        'alignment' => ['nullable', 'in:right,center,left'],
        'background' => ['nullable', 'in:primary,secondary,light,dark,white,transparent'],
        'height' => ['nullable', 'in:small,medium,large'],
      ],
    ],

    'text' => [
      'label' => 'متن',
      'description' => 'نمایش عنوان و متن توضیحات',

      'content' => [
        'title' => '',
        'body' => '',
      ],

      'settings' => [
        'alignment' => 'right',
        'width' => 'normal',
      ],

      'content_rules' => [
        'title' => ['nullable', 'string', 'max:200'],
        'body' => ['required', 'string', 'max:20000'],
      ],

      'settings_rules' => [
        'alignment' => ['nullable', 'in:right,center,left'],
        'width' => ['nullable', 'in:narrow,normal,wide,full'],
      ],
    ],

    'image_text' => [
      'label' => 'تصویر و متن',
      'description' => 'نمایش تصویر در کنار توضیحات',

      'content' => [
        'title' => '',
        'body' => '',
        'image' => '',
        'image_alt' => '',
      ],

      'settings' => [
        'image_position' => 'right',
        'alignment' => 'right',
      ],

      'content_rules' => [
        'title' => ['required', 'string', 'max:200'],
        'body' => ['required', 'string', 'max:10000'],
        'image' => ['required', 'string', 'max:500'],
        'image_alt' => ['nullable', 'string', 'max:200'],
      ],

      'settings_rules' => [
        'image_position' => ['nullable', 'in:right,left'],
        'alignment' => ['nullable', 'in:right,center,left'],
      ],
    ],

    'gallery' => [
      'label' => 'گالری تصاویر',
      'description' => 'نمایش مجموعه‌ای از تصاویر',

      'content' => [
        'title' => '',
        'images' => [],
      ],

      'settings' => [
        'columns' => 3,
        'aspect_ratio' => 'square',
      ],

      'content_rules' => [
        'title' => ['nullable', 'string', 'max:200'],
        'images' => ['required', 'array', 'min:1', 'max:20'],
        'images.*' => ['required', 'string', 'max:500'],
      ],

      'settings_rules' => [
        'columns' => ['nullable', 'integer', 'between:2,4'],
        'aspect_ratio' => ['nullable', 'in:square,landscape,portrait'],
      ],
    ],

    'features' => [
      'label' => 'ویژگی‌ها',
      'description' => 'نمایش ویژگی‌ها و مزایای مجموعه',

      'content' => [
        'title' => '',
        'items' => [],
      ],

      'settings' => [
        'columns' => 3,
      ],

      'content_rules' => [
        'title' => ['nullable', 'string', 'max:200'],
        'items' => ['required', 'array', 'min:1', 'max:12'],
        'items.*' => ['required', 'array:title,description,icon'],
        'items.*.title' => ['required', 'string', 'max:150'],
        'items.*.description' => ['nullable', 'string', 'max:1000'],
        'items.*.icon' => ['nullable', 'string', 'max:100'],
      ],

      'settings_rules' => [
        'columns' => ['nullable', 'integer', 'between:2,4'],
      ],
    ],

    'team' => [
      'label' => 'اعضای تیم',
      'description' => 'نمایش اعضای تیم و آرایشگران',

      'content' => [
        'title' => '',
        'items' => [],
      ],

      'settings' => [
        'columns' => 3,
      ],

      'content_rules' => [
        'title' => ['nullable', 'string', 'max:200'],
        'items' => ['required', 'array', 'min:1', 'max:20'],
        'items.*' => ['required', 'array:name,role,bio,image'],
        'items.*.name' => ['required', 'string', 'max:150'],
        'items.*.role' => ['nullable', 'string', 'max:150'],
        'items.*.bio' => ['nullable', 'string', 'max:1000'],
        'items.*.image' => ['nullable', 'string', 'max:500'],
      ],

      'settings_rules' => [
        'columns' => ['nullable', 'integer', 'between:2,4'],
      ],
    ],

    'contact_info' => [
      'label' => 'اطلاعات تماس',
      'description' => 'نمایش راه‌های ارتباطی مجموعه',

      'content' => [
        'title' => '',
        'phone' => '',
        'email' => '',
        'address' => '',
        'working_hours' => '',
      ],

      'settings' => [
        'layout' => 'grid',
      ],

      'content_rules' => [
        'title' => ['nullable', 'string', 'max:200'],
        'phone' => ['nullable', 'string', 'max:30'],
        'email' => ['nullable', 'email', 'max:255'],
        'address' => ['nullable', 'string', 'max:1000'],
        'working_hours' => ['nullable', 'string', 'max:1000'],
      ],

      'settings_rules' => [
        'layout' => ['nullable', 'in:grid,list'],
      ],
    ],

    'map' => [
      'label' => 'نقشه',
      'description' => 'نمایش موقعیت مجموعه روی نقشه',

      'content' => [
        'title' => '',
        'address' => '',
        'map_url' => '',
      ],

      'settings' => [
        'height' => 'medium',
      ],

      'content_rules' => [
        'title' => ['nullable', 'string', 'max:200'],
        'address' => ['nullable', 'string', 'max:1000'],
        'map_url' => ['required', 'url', 'max:2048'],
      ],

      'settings_rules' => [
        'height' => ['nullable', 'in:small,medium,large'],
      ],
    ],

    'contact_form' => [
      'label' => 'فرم تماس',
      'description' => 'نمایش فرم ارسال پیام توسط کاربران',

      'content' => [
        'title' => '',
        'description' => '',
      ],

      'settings' => [
        'show_email' => true,
        'show_subject' => true,
      ],

      'content_rules' => [
        'title' => ['nullable', 'string', 'max:200'],
        'description' => ['nullable', 'string', 'max:1000'],
      ],

      'settings_rules' => [
        'show_email' => ['nullable', 'boolean'],
        'show_subject' => ['nullable', 'boolean'],
      ],
    ],

    'divider' => [
      'label' => 'جداکننده',
      'description' => 'ایجاد فاصله و خط جداکننده',

      'content' => [],

      'settings' => [
        'style' => 'solid',
        'spacing' => 'medium',
      ],

      'content_rules' => [],

      'settings_rules' => [
        'style' => ['nullable', 'in:solid,dashed,dotted,space'],
        'spacing' => ['nullable', 'in:small,medium,large'],
      ],
    ],
  ];

  /**
   * دریافت تمام بلوک‌ها
   */
  public function all(): array
  {
    return $this->sections;
  }

  /**
   * دریافت اطلاعات یک بلوک
   */
  public function get(string $type): ?array
  {
    return $this->sections[$type] ?? null;
  }

  /**
   * بررسی مجاز بودن نوع بلوک
   */
  public function has(string $type): bool
  {
    return isset($this->sections[$type]);
  }

  /**
   * دریافت نام انواع بلوک‌ها
   */
  public function types(): array
  {
    return array_keys($this->sections);
  }

  /**
   * دریافت ساختار اولیه محتوای بلوک
   */
  public function defaultContent(string $type): array
  {
    return $this->get($type)['content'] ?? [];
  }

  /**
   * دریافت تنظیمات پیش‌فرض بلوک
   */
  public function defaultSettings(string $type): array
  {
    return $this->get($type)['settings'] ?? [];
  }

  /**
   * دریافت قوانین اعتبارسنجی محتوا
   */
  public function contentRules(string $type): array
  {
    return $this->get($type)['content_rules'] ?? [];
  }

  /**
   * دریافت قوانین اعتبارسنجی تنظیمات
   */
  public function settingsRules(string $type): array
  {
    return $this->get($type)['settings_rules'] ?? [];
  }
}
