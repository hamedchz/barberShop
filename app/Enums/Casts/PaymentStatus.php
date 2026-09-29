<?php

namespace App\Enums\Casts;

enum PaymentStatus: string
{

  case pending = 'pending';
  case success = 'success';
  case failed = 'failed';
  case cancelled = 'cancelled';
}
