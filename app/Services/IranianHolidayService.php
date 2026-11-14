<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class IranianHolidayService
{
  private const BASE_URL =
  'https://raw.githubusercontent.com/MiladJoodi/FarsiUI/main/calendar/years/';

  /**
   * دریافت تعطیلات رسمی یک سال شمسی
   */
  public function getHolidays(int $year): array
  {
    $cacheKey = "iran_holidays_{$year}";
    $staleCacheKey = "iran_holidays_stale_{$year}";
    $retryCacheKey = "iran_holidays_retry_{$year}";

    // اگر اطلاعات معتبر در Cache وجود دارد
    if (Cache::has($cacheKey)) {
      return Cache::get($cacheKey);
    }

    // اگر اخیراً دریافت اطلاعات ناموفق بوده،
    // از تلاش مجدد در هر درخواست جلوگیری کن.
    if (Cache::has($retryCacheKey)) {
      if (Cache::has($staleCacheKey)) {
        return Cache::get($staleCacheKey);
      }

      throw new RuntimeException(
        'اطلاعات تعطیلات در دسترس نیست.'
      );
    }

    try {
      $response = Http::timeout(10)
        ->retry(2, 500)
        ->get(
          self::BASE_URL . $year . '/holidays.json'
        );

      $response->throw();

      $items = $response->json('items');

      if (!is_array($items)) {
        throw new RuntimeException(
          'ساختار اطلاعات تعطیلات معتبر نیست.'
        );
      }

      // فقط تعطیلات رسمی
      $holidays = collect($items)
        ->filter(
          fn($item) =>
          !empty($item['isHoliday']) &&
            !empty($item['date'])
        )
        ->groupBy('date')
        ->map(function ($items) {
          return $items->map(fn($item) => [
            'title' => $item['title']['fa']
              ?? 'تعطیل رسمی',
          ])->values()->all();
        })
        ->all();

      // Cache اصلی: هفت روز
      Cache::put(
        $cacheKey,
        $holidays,
        now()->addDays(7)
      );

      // Cache پشتیبان: یک سال
      Cache::put(
        $staleCacheKey,
        $holidays,
        now()->addYear()
      );

      return $holidays;
    } catch (\Throwable $exception) {

      report($exception);

      // جلوگیری از تلاش مجدد در ۱۵ دقیقه آینده
      Cache::put(
        $retryCacheKey,
        true,
        now()->addMinutes(15)
      );

      // در صورت خطای اینترنت، اطلاعات قبلی را برگردان
      if (Cache::has($staleCacheKey)) {
        return Cache::get($staleCacheKey);
      }

      // اگر هیچ اطلاعات ذخیره‌شده‌ای نداریم
      throw new RuntimeException(
        'در حال حاضر دریافت تعطیلات رسمی امکان‌پذیر نیست.',
        0,
        $exception
      );
    }
  }
}
