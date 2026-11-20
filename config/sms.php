<?php

use App\Services\Sms\Drivers\FarazSmsDriver;
use App\Services\Sms\Drivers\KavenegarSmsDriver;
use App\Services\Sms\Drivers\MeliPayamakSmsDriver;
use App\Services\Sms\Drivers\RestSmsDriver;

return [

  'timeout' => 15,

  'drivers' => [

    'kavenegar' => KavenegarSmsDriver::class,

    'melipayamak' => MeliPayamakSmsDriver::class,

    'farazsms' => FarazSmsDriver::class,

    'rest' => RestSmsDriver::class,

  ],

];
