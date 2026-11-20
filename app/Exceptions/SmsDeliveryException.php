<?php

namespace App\Exceptions;

use RuntimeException;

class SmsDeliveryException extends RuntimeException
{
  public function __construct(
    string $message = 'ارسال پیامک با خطا مواجه شد.'
  ) {
    parent::__construct($message);
  }
}
