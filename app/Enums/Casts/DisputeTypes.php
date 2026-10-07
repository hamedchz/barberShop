<?php

namespace App\Enums\Casts;

enum DisputeTypes: string
{

  case not_done = 'not_done';
  case incomplete = 'incomplete';
  case poor_quality = 'poor_quality';
  case bad_behavior = 'bad_behavior';
  case other = 'other';

  case customer_not_present = 'customer_not_present';
  case customer_rude = 'customer_rude';
  case false_review = 'false_review';
  case customer_left_early = 'customer_left_early';
  case customer_damaged = 'customer_damaged';
}
