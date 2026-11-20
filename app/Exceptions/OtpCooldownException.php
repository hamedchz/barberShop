<?php

namespace App\Exceptions;

use RuntimeException;

class OtpCooldownException extends RuntimeException
{
  public function __construct(
    public readonly int $retryAfter
  ) {
    parent::__construct(
      "برای ارسال مجدد کد باید {$retryAfter} ثانیه صبر کنید."
    );
  }
}
