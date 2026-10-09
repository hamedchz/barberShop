<?php

namespace App\Services;

use App\Enums\Casts\LogsStatus;
use App\Enums\Casts\ReviewStatus;
use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReviewService
{
  /**
   * بازمحاسبه امتیاز آرایشگر بر اساس نظرات فعال
   */
  public function recalculateBarberRating(User $barber): void
  {
    // فقط نظراتی که rejected نشدن رو حساب کن
    // (pending و approved هر دو حساب میشن)
    $stats = Review::query()
      ->whereHas('booking', function ($q) use ($barber) {
        $q->where('barber_id', $barber->id);
      })
      ->where('status', '!=', ReviewStatus::rejected->value)
      ->selectRaw('COUNT(*) as total, COALESCE(SUM(rating), 0) as sum')
      ->first();

    $total = (int) ($stats->total ?? 0);
    $sum   = (int) ($stats->sum ?? 0);

    $barber->update([
      'total_reviews'    => $total,
      'total_rating_sum' => $sum,
      'average_rating'   => $total > 0 ? round($sum / $total, 2) : 0,
    ]);
  }

  /**
   * تایید نظر توسط ادمین
   */
  public function approve(
    Review $review,
    User $admin,
    ?string $note = null,
  ): void {
    DB::transaction(function () use ($review, $admin, $note) {
      $review->update([
        'status'          => ReviewStatus::approved->value,
        'moderated_by'    => $admin->id,
        'moderated_at'    => now(),
        'moderation_note' => $note,
        'rejection_reason' => null,
      ]);

      // اگه قبلاً rejected بوده، الان approved شده → امتیاز باید بازمحاسبه بشه
      if ($review->booking?->barber) {
        $this->recalculateBarberRating($review->booking->barber);
      }

      // لاگ


      (new \App\Models\Log())->storeLog($review->barber_id, LogsStatus::edit->value . 'review_approved', "نظر #{$review->id} تایید شد",);
    });
  }

  /**
   * رد نظر توسط ادمین
   */
  public function reject(
    Review $review,
    User $admin,
    string $reason,
    ?string $note = null,
  ): void {
    DB::transaction(function () use ($review, $admin, $reason, $note) {
      $oldStatus = $review->status?->value;

      $review->update([
        'status'          => ReviewStatus::rejected->value,
        'moderated_by'    => $admin->id,
        'moderated_at'    => now(),
        'moderation_note' => $note,
        'rejection_reason' => $reason,
      ]);

      // بازمحاسبه امتیاز آرایشگر
      if ($review->booking?->barber) {
        $this->recalculateBarberRating($review->booking->barber);
      }

        // لاگ
      ;

      (new \App\Models\Log())->storeLog($review->barber_id, LogsStatus::edit->value . 'review_rejected',  "نظر #{$review->id} رد شد: {$reason}",);
    });
  }

  /**
   * ثبت نظر جدید توسط مشتری
   */
  public function create(
    Booking $booking,
    int $rating,
    ?string $comment = null,
    bool $autoApprove = true,
  ): Review {
    return DB::transaction(function () use ($booking, $rating, $comment, $autoApprove) {
      $review = Review::create([
        'booking_id' => $booking->id,
        'rating'     => $rating,
        'comment'    => $comment,
        'status'     => $autoApprove
          ? ReviewStatus::approved->value
          : ReviewStatus::pending->value,
        'moderated_at' => $autoApprove ? now() : null,
      ]);

      // بازمحاسبه امتیاز
      if ($autoApprove) {
        $this->recalculateBarberRating($booking->barber);
      }

      return $review;
    });
  }

  /**
   * حذف نظر (soft delete) — برای اعتراض تاییدشده
   */
  public function deleteForDispute(
    Review $review,
    User $admin,
    string $reason,
  ): void {
    DB::transaction(function () use ($review, $admin, $reason) {
      $review->update([
        'status'          => ReviewStatus::rejected->value,
        'moderated_by'    => $admin->id,
        'moderated_at'    => now(),
        'rejection_reason' => $reason,
        'moderation_note' => "حذف شده بابت اعتراض تاییدشده",
      ]);

      $review->delete();

      if ($review->booking?->barber) {
        $this->recalculateBarberRating($review->booking->barber);
      }
    });
  }
}
