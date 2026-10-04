<?php

namespace App\Enums\Casts;

enum BookingCompletedBy: string
{

  case customer = 'customer';
  case barber = 'barber';
  case admin = 'admin';
  case system = 'system';
}
