<?php

namespace App\Enums\Casts;

enum OtpPurpose: string
{
  case REGISTRATION = 'registration';

  case PASSWORD_RESET = 'password_reset';

  public function label(): string
  {
    return match ($this) {
      self::REGISTRATION => 'ثبت‌نام و تأیید شماره موبایل',
      self::PASSWORD_RESET => 'بازیابی رمز عبور',
    };
  }

  public static function toSelectArray(): array
  {
    return collect(self::cases())
      ->map(fn(self $purpose) => [
        'value' => $purpose->value,
        'label' => $purpose->label(),
      ])
      ->values()
      ->all();
  }
}
