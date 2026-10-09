<?php

namespace App\Enums\Casts;


enum TimeSlotStatus: string
{

  case available = 'available';
  case booked = 'booked';
  case blocked = 'blocked';
}
