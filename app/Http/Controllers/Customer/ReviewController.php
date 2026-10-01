<?php

namespace App\Http\Controllers\Customer;

use App\Enums\Casts\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;


class ReviewController extends Controller
{
    // app/Http/Controllers/Customer/BarberController.php

    /**
     * نمایش همه نظرات یک آرایشگر
     */
    public function reviews(Request $request, User $barber)
    {
        if (!$barber->hasRole('آرایشگر')) {
            abort(404);
        }

        $query = Review::where('barber_id', $barber->id)
            ->where('status', ReviewStatus::approved->value)
            ->with(['user:id,name,avatar']); // ← با with

        // فیلتر
        if ($rating = $request->input('rating')) {
            $query->where('rating', $rating);
        }

        // مرتب‌سازی
        $sort = $request->input('sort', 'latest');
        match ($sort) {
            'oldest' => $query->oldest(),
            'highest' => $query->orderBy('rating', 'desc')->latest(),
            'lowest' => $query->orderBy('rating', 'asc')->latest(),
            default => $query->latest(),
        };

        $reviews = $query->paginate(10)->withQueryString();

        // ============ تبدیل داده‌ها ============
        $reviews->through(function ($review) {
            return [
                'id' => $review->id,
                'rating' => (int) $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at,
                'user' => [
                    'id' => $review->user?->id,
                    'name' => $review->user?->name,

                    'avatar' => $review->user?->avatar,
                    'thumbnail' => $review->user?->avatar(),
                ],

            ];
        });

        // ============ اطلاعات آرایشگر ============
        $barberInfo = [
            'id' => $barber->id,
            'name' => $barber->name,
            'avatar' => $barber->avatar,
            'thumbnail' => $barber->avatar(),
            'slug' => $barber->slug,
            'rating' => (float) $barber->average_rating,
            'total_reviews' => (int) $barber->total_reviews,
            'rating_distribution' => $barber->rating_distribution,
        ];

        return Inertia::render('Customer/Barbers/Reviews', [
            'barber' => $barberInfo,
            'reviews' => $reviews,
            'filters' => [
                'rating' => $request->input('rating', ''),
                'sort' => $sort,
            ],
        ]);
    }
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
