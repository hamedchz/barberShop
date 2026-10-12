<?php

namespace App\Services;

use App\Enums\Casts\BookingCompletedBy;
use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\WalletTransactionType;
use App\Models\Booking;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class BookingCompletionService
{
  public function __construct(
    private WalletService $walletService,
  ) {}

  /**
   * تکمیل رزرو + واریز قفل‌شده درآمد به آرایشگر
   */
  public function complete(
    Booking $booking,
    string $completedBy, // BookingCompletedBy::customer->value
  ): void {
    DB::transaction(function () use ($booking, $completedBy) {
      // ۱) آپدیت وضعیت رزرو
      $booking->update([
        'status'       => BookingStatus::completed->value,
        'completed_at' => now(),
        'completed_by' => $completedBy,
      ]);

      // ۲) واریز قفل‌شده به آرایشگر
      $this->creditBarberEarningLocked($booking);
    });
  }

  /**
   * واریز درآمد رزرو به کیف پول آرایشگر (قفل‌شده تا پایان بازه اعتراض)
   */
  private function creditBarberEarningLocked(Booking $booking): void
  {
    $alreadyCredited = WalletTransaction::where('reference_type', Booking::class)
      ->where('reference_id', $booking->id)
      ->where('user_id', $booking->barber_id)
      ->where('type', WalletTransactionType::earning->value)
      ->exists();

    if ($alreadyCredited) {
      return;
    }

    $releaseHours = (int) config('disputes.release_hours', 48);
    $releaseAt = now()->addHours($releaseHours);

    //  کل مبلغ، بدون کمیسیون
    $this->walletService->creditLocked(
      user: $booking->barber,
      amount: (float) $booking->amount,
      type: WalletTransactionType::earning,
      description: "درآمد رزرو #{$booking->id}",
      reference: $booking,
      metadata: [
        'booking_id'   => $booking->id,
        'gross_amount' => (float) $booking->amount,
        'release_at'   => $releaseAt->toIso8601String(),
      ],
      releaseAt: $releaseAt,
    );
  }
}
