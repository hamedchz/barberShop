<?php

namespace App\Contracts\Sms;

interface SmsProviderInterface
{
  /**
   * ارسال پیامک به شماره مقصد
   *
   * در صورت شکست ارسال، باید Exception پرتاب شود.
   */
  public function send(string $phone, string $message): void;
}
