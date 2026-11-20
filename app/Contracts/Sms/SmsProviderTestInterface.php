<?php

namespace App\Contracts\Sms;

interface SmsProviderTestInterface
{
  /**
   * بررسی اتصال و اعتبار اطلاعات حساب
   *
   * در صورت شکست باید SmsDeliveryException پرتاب شود.
   */
  public function testConnection(): void;
}
