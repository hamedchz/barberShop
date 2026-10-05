<?php

namespace App\Enums\Casts;

enum DisputeTypes: string
{

  case not_done = 'not_done';
  case incomplete = 'incomplete';
  case poor_quality = 'poor_quality';
  case bad_behavior = 'bad_behavior';
  case other = 'other';
}
