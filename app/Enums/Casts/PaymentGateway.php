<?php

namespace App\Enums\Casts;

enum PaymentGateway: string
{
  case ZARINPAL = 'zarinpal';
  case IDPAY    = 'idpay';
  case PAYPING  = 'payping';
  case NEXTPAY  = 'nextpay';

  public function label(): string
  {
    return match ($this) {
      self::ZARINPAL => 'زرین‌پال',
      self::IDPAY    => 'آیدی‌پی',
      self::PAYPING  => 'پی‌پینگ',
      self::NEXTPAY  => 'نکست‌پی',
    };
  }

  public static function labels(): array
  {
    return collect(self::cases())
      ->mapWithKeys(fn($g) => [$g->value => $g->label()])
      ->toArray();
  }
}
