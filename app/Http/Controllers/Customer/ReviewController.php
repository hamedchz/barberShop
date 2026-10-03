<?php

namespace App\Http\Controllers\Customer;

use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use App\Supports\StickyAlert;
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
     * نمایش فرم ثبت نظر
     */
    public function create(Booking $booking)
    {
        // ============ بررسی مالکیت ============
        if ($booking->user_id !== auth()->id()) {
            abort(403, 'این رزرو متعلق به شما نیست.');
        }

        // ============ بررسی وضعیت ============
        if ($booking->status->value !== BookingStatus::completed->value) {
            return redirect()
                ->route('customer.bookings.show', $booking->id)
                ->with('error', 'فقط می‌توانید برای رزروهای تکمیل شده نظر ثبت کنید.');
        }

        // ============ بررسی نظر تکراری ============
        $existingReview = Review::where('user_id', auth()->id())
            ->where('booking_id', $booking->id)
            ->first();

        if ($existingReview) {
            return redirect()
                ->route('customer.bookings.show', $booking->id)
                ->with('error', 'قبلاً برای این رزرو نظر ثبت کرده‌اید.');
        }

        // ============ بارگذاری روابط ============
        $booking->load([
            'barber:id,name,avatar,slug,specialty',
            'service:id,name,image,duration,price',
            'timeSlot:id,date,start_time,end_time',
        ]);

        return Inertia::render('Customer/Bookings/Review', [
            'booking' => [
                'id' => $booking->id,
                'date' => $booking->timeSlot?->date,
                'start_time' => $booking->timeSlot?->start_time,
                'end_time' => $booking->timeSlot?->end_time,

                'barber' => $booking->barber ? [
                    'id' => $booking->barber->id,
                    'name' => $booking->barber->name,
                    'avatar' => $booking->barber->avatar,
                    'thumbnail' => $booking->barber->avatar(),
                    'slug' => $booking->barber->slug,
                    'specialty' => $booking->barber->specialty,
                ] : null,

                'service' => $booking->service ? [
                    'id' => $booking->service->id,
                    'name' => $booking->service->name,
                    'image' => $booking->service->image
                        ? asset('storage/' . $booking->service->image)
                        : null,
                    'duration' => $booking->service->duration,
                ] : null,
            ],
        ]);
    }

    /**
     * ذخیره نظر
     */
    public function store(Request $request, Booking $booking)
    {
        // ============ بررسی مالکیت ============
        if ($booking->user_id !== auth()->id()) {
            abort(403);
        }

        // ============ بررسی وضعیت ============
        if ($booking->status->value !== BookingStatus::completed->value) {
            return back()->with('error', 'این رزرو قابل ثبت نظر نیست.');
        }

        // ============ بررسی نظر تکراری ============
        $existingReview = Review::where('user_id', auth()->id())
            ->where('booking_id', $booking->id)
            ->first();

        if ($existingReview) {
            return back()->with('error', 'قبلاً برای این رزرو نظر ثبت کرده‌اید.');
        }

        // ============ اعتبارسنجی ============
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ], [
            'rating.required' => 'لطفاً امتیاز خود را انتخاب کنید.',
            'rating.min' => 'امتیاز باید بین ۱ تا ۵ باشد.',
            'rating.max' => 'امتیاز باید بین ۱ تا ۵ باشد.',
            'comment.max' => 'متن نظر نباید بیشتر از ۱۰۰۰ کاراکتر باشد.',
        ]);

        // ============ ثبت نظر ============
        Review::create([
            'user_id' => auth()->id(),
            'barber_id' => $booking->barber_id,
            'booking_id' => $booking->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        // ============ پاک کردن کش امتیازات ============
        $booking->barber->clearReviewsCache();

        return redirect()
            ->route('customer.bookings.show', $booking->id)
            ->with('success', 'نظر شما با موفقیت ثبت شد. متشکریم!');
    }

    /**
     * ویرایش نظر
     */
    public function edit(Review $review)
    {

        if ($review->user_id !== auth()->id()) {
            abort(403);
        }

        $review = Review::where('user_id', auth()->id())
            ->where('booking_id', $review->booking->id)
            ->first();

        if (!$review) {
            return redirect()
                ->route('customer.bookings.show', $review->booking->id)
                ->with('error', 'نظری برای این رزرو یافت نشد.');
        }

        // ============ بررسی وضعیت ============
        if ($review->status->value !== ReviewStatus::pending->value) {
            return redirect()
                ->route('customer.bookings.show', $review->booking->id)
                ->with('error', 'فقط نظرات در انتظار تایید قابل ویرایش هستند.');
        }

        $review->booking->load([
            'barber:id,name,avatar,slug,specialty',
            'service:id,name,image,duration,price',
            'timeSlot:id,date,start_time,end_time',
        ]);


        return Inertia::render('Customer/Bookings/Review', [
            'booking' => [
                'id' => $review->booking->id,
                'date' => $review->booking->timeSlot?->date,
                'start_time' => $review->booking->timeSlot?->start_time,
                'end_time' => $review->booking->timeSlot?->end_time,
                'barber' => $review->booking->barber ? [
                    'id' => $review->booking->barber->id,
                    'name' => $review->booking->barber->name,
                    'avatar' => $review->booking->barber->avatar,
                    'thumbnail' => $review->booking->barber->avatar(),
                    'slug' => $review->booking->barber->slug,
                    'specialty' => $review->booking->barber->specialty,
                ] : null,
                'service' => $review->booking->service ? [
                    'id' => $review->booking->service->id,
                    'name' => $review->booking->service->name,
                    'image' => $review->booking->service->image
                        ? asset('storage/' . $review->booking->service->image)
                        : null,
                    'duration' => $review->booking->service->duration,
                ] : null,
            ],
            'review' => [
                'id' => $review->id,
                'rating' => (int) $review->rating,
                'comment' => $review->comment,
            ],
        ]);
    }




    /**
     * بروزرسانی نظر
     */
    public function update(Request $request, Review $review)
    {
        if ($review->user_id !== auth()->id()) {
            abort(403);
        }

        // ============ بررسی وضعیت ============
        if ($review->status->value !== ReviewStatus::pending->value) {
            return redirect()
                ->route('customer.bookings.show', $review->booking_id)
                ->with('error', 'فقط نظرات در انتظار تایید قابل ویرایش هستند.');
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ], [
            'rating.required' => 'لطفاً امتیاز خود را انتخاب کنید.',
            'comment.max' => 'متن نظر نباید بیشتر از ۱۰۰۰ کاراکتر باشد.',
        ]);

        $review->update([
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'status' => ReviewStatus::pending->value,
        ]);

        $review->barber->clearReviewsCache();

        return redirect()
            ->route('customer.bookings.show', $review->booking_id)
            ->with('success', 'نظر شما بروزرسانی شد و در انتظار تایید ادمین است.');
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
        $bookingId = $review->booking_id;

        $review->delete();

        $barber->clearReviewsCache();

        StickyAlert::alert("نظر شما با موفقیت حذف شد", 'success');

        return redirect()
            ->route('customer.bookings.show', $bookingId);
    }
}
