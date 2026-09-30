<?php

namespace App\Enums\Casts;

enum ReviewStatus: string
{

  case pending = 'pending';
  case approved = 'approved';
  case rejected = 'rejected';
}
