<?php

namespace App\Enums\Casts;

enum DisputedStatus: string
{

  case pending = 'pending';
  case investigating = 'investigating';
  case resolved = 'resolved';
  case rejected = 'rejected';
  case awaitingResponse = 'awaiting_response';
}
