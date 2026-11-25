<?php

namespace App\Enums\Casts;

enum PageStatus: string
{
  case DRAFT = 'draft';
  case PUBLISHED = 'published';
  case ARCHIVED = 'archived';

  public function label(): string
  {
    return match ($this) {
      self::DRAFT => 'پیش‌نویس',
      self::PUBLISHED => 'منتشر شده',
      self::ARCHIVED => 'بایگانی شده',
    };
  }

  public function color(): string
  {
    return match ($this) {
      self::DRAFT => 'secondary',
      self::PUBLISHED => 'success',
      self::ARCHIVED => 'warning',
    };
  }

  public static function options(): array
  {
    return array_map(
      fn(self $status) => [
        'value' => $status->value,
        'label' => $status->label(),
      ],
      self::cases()
    );
  }
}
