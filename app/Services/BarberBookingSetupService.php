<?php

namespace App\Services;

use App\Models\User;
use App\Models\Service;
use App\Models\TimeSlot;

class BarberBookingSetupService
{
  public function getStatus(User $user): array
  {
    // برنامه کاری آرایشگر
    $weeklySchedule = $user->availabilities()
      ->get();

    $hasWorkingDays = $weeklySchedule->contains(function ($day) {
      return (bool) $day->is_active;
    });

    // سرویس‌های فعال آرایشگر
    $activeServices = Service::query()
      ->where('user_id', $user->id)
      ->where('is_active', true)
      ->get(['id']);

    $hasServices = $activeServices->isNotEmpty();

    $firstServiceId = $activeServices->first()?->id;

    // وجود نوبت‌های آینده
    $hasGeneratedSlots = TimeSlot::query()
      ->whereHas('service', function ($query) use ($user) {
        $query->where('user_id', $user->id);
      })
      ->whereDate('date', '>=', now()->toDateString())
      ->exists();

    return [
      'workingDays' => $hasWorkingDays,
      'services' => $hasServices,
      'generatedSlots' => $hasGeneratedSlots,
      'firstServiceId' => $firstServiceId,
    ];
  }
}
