<?php

namespace App\Http\Controllers\Barber;

use App\Http\Controllers\Controller;
use App\Services\IranianHolidayService;
use Illuminate\Http\JsonResponse;

class CalendarController extends Controller
{
    public function holidays(
        int $year,
        IranianHolidayService $holidayService
    ): JsonResponse {
        abort_if($year < 1300 || $year > 1500, 404);

        try {
            $holidays = $holidayService->getHolidays($year);

            return response()->json([
                'success' => true,
                'year' => $year,
                'holidays' => $holidays,
            ]);
        } catch (\Throwable $exception) {

            report($exception);

            return response()->json([
                'success' => false,
                'year' => $year,
                'holidays' => [],
                'message' => 'دریافت تعطیلات رسمی امکان‌پذیر نیست.',
            ], 503);
        }
    }
}
