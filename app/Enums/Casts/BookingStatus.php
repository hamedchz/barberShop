<?php

namespace App\Enums\Casts;

enum BookingStatus: string
{

  case pending = 'pending';
  case confirmed = 'confirmed';
  case completed = 'completed';
  case cancelled = 'cancelled';
}
