<?php

namespace App\Enums\Casts;

enum DisputedBy: string
{

  case customer = 'customer';
  case barber = 'barber';
  case admin = 'admin';
  case system = 'system';
}
