<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;


class GenerateUtf8Slug extends Facade
{
  protected static function getFacadeAccessor()
  {
    return \App\Services\GenerateUtf8Slug::class;
  }
}
