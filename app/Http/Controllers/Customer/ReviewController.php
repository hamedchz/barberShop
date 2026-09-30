<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * ثبت نظر جدید
     */
    public function store(Request $request, User $barber)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        // بررسی مالکیت رزرو
        $booking = Booking::findOrFail($validated['booking_id']);

        if ($booking->user_id !== auth()->id()) {
            abort(403, 'این رزرو متعلق به شما نیست.');
        }

        if ($booking->barber_id !== $barber->id) {
            abort(403, 'این رزرو برای این آرایشگر نیست.');
        }

        if ($booking->status !== 'completed') {
            return back()->with('error', 'فقط می‌توانید برای رزروهای تکمیل شده نظر ثبت کنید.');
        }

        // بررسی نظر تکراری
        $existing = Review::where('user_id', auth()->id())
            ->where('booking_id', $booking->id)
            ->first();

        if ($existing) {
            return back()->with('error', 'قبلاً برای این رزرو نظر ثبت کرده‌اید.');
        }

        // ثبت نظر
        $review = Review::create([
            'user_id' => auth()->id(),
            'barber_id' => $barber->id,
            'booking_id' => $booking->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        // پاک کردن کش
        $barber->clearReviewsCache();

        return back()->with('success', 'نظر شما با موفقیت ثبت شد.');
    }

    /**
     * ویرایش نظر
     */
    public function update(Request $request, Review $review)
    {
        if ($review->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review->update([
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        $review->barber->clearReviewsCache();

        return back()->with('success', 'نظر شما بروزرسانی شد.');
    }

    /**
     * حذف نظر
     */
    public function destroy(Review $review)
    {
        if ($review->user_id !== auth()->id()) {
            abort(403);
        }

        $barber = $review->barber;
        $review->delete();
        $barber->clearReviewsCache();

        return back()->with('success', 'نظر شما حذف شد.');
    }
}
