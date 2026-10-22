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
   * تایید نظر توسط ادمین (یا تغییر تصمیم به تایید)
   */
  public function approve(
    Review $review,
    User $admin,
    ?string $reason = null,   // ← nullable
    ?string $note = null,
  ): void {
    // ============ اعتبارسنجی ============
    if (!$review->canChangeStatusTo(ReviewStatus::approved)) {
      throw new \InvalidArgumentException(
        "امکان تغییر وضعیت از '{$review->status?->label()}' به 'تایید' وجود ندارد."
      );
    }

    $isChange = $review->status !== ReviewStatus::pending;

    // دلیل فقط برای تغییر تصمیم الزامیه
    if ($isChange && empty(trim($reason ?? ''))) {
      throw new \InvalidArgumentException('دلیل تغییر تصمیم الزامی است.');
    }

    DB::transaction(function () use ($review, $admin, $reason, $note, $isChange) {
      $previousStatus = $review->status;

      // ============ ثبت تاریخچه ============
      // برای pending: reason می‌تونه null باشه
      // برای rejected: reason الزامیه
      $review->moderationHistory()->create([
        'admin_id'        => $admin->id,
        'previous_status' => $previousStatus->value,
        'new_status'      => ReviewStatus::approved->value,
        'reason'          => $isChange
          ? trim($reason)
          : (trim($reason ?? '') ?: 'تایید اولیه'),  // ← برای pending
        'note'            => $note,
      ]);

      // ============ آپدیت نظر ============
      $review->update([
        'status'           => ReviewStatus::approved->value,
        'moderated_by'     => $admin->id,
        'moderated_at'     => now(),
        'moderation_note'  => $note,
        'rejection_reason' => null,
      ]);

      // ============ بازمحاسبه امتیاز ============
      if ($review->booking?->barber) {
        $this->recalculateBarberRating($review->booking->barber);
      }

      // ============ لاگ ============
      $logAction = $isChange
        ? "تغییر تصمیم به تایید"
        : "تایید";

      $reasonForLog = $isChange
        ? "دلیل: {$reason}"
        : "تایید اولیه";

      (new \App\Models\Log())->storeLog(
        $review->barber_id,
        LogsStatus::edit->value . 'review_approved',
        "نظر #{$review->id} {$logAction} شد. {$reasonForLog}",
      );
    });
  }

  /**
   * رد نظر توسط ادمین (یا تغییر تصمیم به رد)
   */
  public function reject(
    Review $review,
    User $admin,
    string $reason,
    ?string $note = null,
  ): void {
    // ============ اعتبارسنجی وضعیت ============
    if (!$review->canChangeStatusTo(ReviewStatus::rejected)) {
      throw new \InvalidArgumentException(
        "امکان تغییر وضعیت از '{$review->status?->label()}' به 'رد' وجود ندارد."
      );
    }

    if (empty(trim($reason))) {
      throw new \InvalidArgumentException('دلیل رد الزامی است.');
    }

    $isChange = $review->status !== ReviewStatus::pending;

    DB::transaction(function () use ($review, $admin, $reason, $note, $isChange) {
      $previousStatus = $review->status;

      // ============ ثبت تاریخچه ============
      $review->moderationHistory()->create([
        'admin_id'        => $admin->id,
        'previous_status' => $previousStatus->value,
        'new_status'      => ReviewStatus::rejected->value,
        'reason'          => trim($reason),
        'note'            => $note,
      ]);

      // ============ آپدیت نظر ============
      $review->update([
        'status'           => ReviewStatus::rejected->value,
        'moderated_by'     => $admin->id,
        'moderated_at'     => now(),
        'moderation_note'  => $note,
        'rejection_reason' => trim($reason),
      ]);

      // ============ بازمحاسبه امتیاز ============
      if ($review->booking?->barber) {
        $this->recalculateBarberRating($review->booking->barber);
      }

      // ============ لاگ ============
      $logAction = $isChange
        ? "تغییر تصمیم به رد"
        : "رد";

      (new \App\Models\Log())->storeLog(
        $review->barber_id,
        LogsStatus::edit->value . 'review_rejected',
        "نظر #{$review->id} {$logAction} شد. دلیل: {$reason}",
      );
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
      $previousStatus = $review->status;

      // ثبت تاریخچه حذف
      $review->moderationHistory()->create([
        'admin_id'        => $admin->id,
        'previous_status' => $previousStatus->value,
        'new_status'      => ReviewStatus::rejected->value,
        'reason'          => trim($reason),
        'note'            => "حذف شده بابت اعتراض تاییدشده",
      ]);

      $review->update([
        'status'           => ReviewStatus::rejected->value,
        'moderated_by'     => $admin->id,
        'moderated_at'     => now(),
        'rejection_reason' => $reason,
        'moderation_note'  => "حذف شده بابت اعتراض تاییدشده",
      ]);

      $review->delete();

      if ($review->booking?->barber) {
        $this->recalculateBarberRating($review->booking->barber);
      }

      // لاگ
      (new \App\Models\Log())->storeLog(
        $review->barber_id,
        LogsStatus::edit->value . 'review_deleted_for_dispute',
        "نظر #{$review->id} بابت اعتراض حذف شد. دلیل: {$reason}",
      );
    });
  }
}
