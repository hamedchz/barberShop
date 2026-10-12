<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\User;

class CommissionService
{
  /**
   * گرفتن نرخ کمیسیون برای کاربر
   * (اول نرخ اختصاصی، بعد پیش‌فرض)
   */


  public function getRateForUser(?User $user = null): float
  {
    if ($user && $user->commission_rate !== null) {
      return (float) $user->commission_rate;
    }

    return (float) Setting::get('commission_rate', 10.00);
  }
  /**
   * محاسبه کمیسیون و مبلغ خالص
   */
  public function calculate(float $amount, ?User $user = null): array
  {
    $rate = $this->getRateForUser($user);
    $commission = round($amount * ($rate / 100));
    $netAmount = $amount - $commission;

    return [
      'gross'      => $amount,
      'rate'       => $rate,
      'commission' => $commission,
      'net'        => $netAmount,
    ];
  }
}
