<?php

namespace App\Enums\Casts;

enum PageContactSubmissionStatus: string
{
  case NEW = 'new';
  case READ = 'read';
  case ANSWERED = 'answered';
  case CLOSED = 'closed';

  public function label(): string
  {
    return match ($this) {
      self::NEW => 'جدید',
      self::READ => 'خوانده شده',
      self::ANSWERED => 'پاسخ داده شده',
      self::CLOSED => 'بسته شده',
    };
  }

  public function color(): string
  {
    return match ($this) {
      self::NEW => 'warning',
      self::READ => 'info',
      self::ANSWERED => 'success',
      self::CLOSED => 'secondary',
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
