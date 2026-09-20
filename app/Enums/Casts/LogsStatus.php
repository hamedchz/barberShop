<?php

namespace App\Enums\Casts;

enum LogsStatus: string
{

  case store = 'create';
  case edit = 'edit';
  case delete = 'delete';
}
