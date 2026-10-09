<?php

namespace App\Enums\Casts;


enum UserWarningType: string
{

  case customerRude = 'customer_rude';
  case falseReview = 'false_review';
  case rude_behavior = 'rude_behavior';
}
