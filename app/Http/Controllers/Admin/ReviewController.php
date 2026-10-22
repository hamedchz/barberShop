<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Models\Log;
use App\Models\Review;
use App\Models\User;
use App\Services\ReviewService;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Inertia\Inertia;


class ReviewController extends Controller
{
    public function __construct(
        private ReviewService $reviewService,
    ) {}

    // ============ لیست نظرات ============
    public function index(Request $request)
    {
        $query = Review::query()
            ->with([
                'user:id,name,phone,avatar',
                'barber:id,name,phone,avatar,slug',
                'booking:id,amount,time_slot_id',
                'moderatedBy:id,name',
            ])
            ->withTrashed();  // ادمین باید حذف‌شده‌ها رو هم ببینه

        // ============ فیلترها ============
        if ($status = $request->input('status')) {
            if ($status === 'deleted') {
                $query->onlyTrashed();
            } else {
                $query->where('status', $status)->whereNull('deleted_at');
            }
        }

        if ($barberId = $request->input('barber_id')) {
            $query->where('barber_id', $barberId);
        }

        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($rating = $request->input('rating')) {
            $query->where('rating', $rating);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%"))
                    ->orWhereHas('barber', fn($b) => $b->where('name', 'like', "%{$search}%"));
            });
        }

        $reviews = $query->latest()->paginate(33)->withQueryString();

        $reviews->through(fn($r) => $this->mapReview($r));

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews,
            'filters' => [
                'status'    => $request->input('status', ''),
                'barber_id' => $request->input('barber_id', ''),
                'user_id'   => $request->input('user_id', ''),
                'rating'    => $request->input('rating', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to'   => $request->input('date_to', ''),
                'search'    => $request->input('search', ''),
            ],
            'stats'    => $this->buildStats(),
            'statuses' => collect(ReviewStatus::cases())
                ->map(fn($s) => [
                    'value' => $s->value,
                    'label' => $s->label(),
                    'color' => $s->color(),
                ])
                ->values(),
            'barbers' => User::role('آرایشگر')
                ->select('id', 'name')
                ->orderBy('name')
                ->limit(100)
                ->get(),
        ]);
    }

    // ============ جزئیات ============

    public function show($id)
    {
        $review = Review::withTrashed()
            ->with([
                'user:id,name,phone,avatar,slug',
                'barber:id,name,phone,avatar,slug',
                'booking:id,amount,time_slot_id,created_at',
                'booking.timeSlot:id,date,start_time,end_time',
                'booking.service:id,name,price',
                'moderatedBy:id,name',
                'moderationHistory.admin:id,name',
            ])
            ->findOrFail($id);

        return Inertia::render('Admin/Reviews/Show', [
            'review' => $this->mapReview($review, detailed: true),
        ]);
    }

    // ============ تایید ============
    public function approve(Request $request, Review $review)
    {
        // تشخیص: آیا این تغییر تصمیمه؟
        $isChange = $review->status === ReviewStatus::rejected;

        // ============ Validation ============
        $rules = [
            'note' => 'nullable|string|max:500',
        ];

        // دلیل فقط برای تغییر تصمیم الزامیه
        if ($isChange) {
            $rules['reason'] = 'required|string|min:5|max:500';
        } else {
            $rules['reason'] = 'nullable|string|max:500';
        }

        $validated = $request->validate($rules, [
            'reason.required' => 'دلیل تغییر تصمیم الزامی است.',
            'reason.min'      => 'دلیل باید حداقل ۵ کاراکتر باشد.',
            'reason.max'      => 'دلیل نباید بیشتر از ۵۰۰ کاراکتر باشد.',
        ]);

        try {
            $this->reviewService->approve(
                review: $review,
                admin: auth()->user(),
                reason: $validated['reason'] ?? null,  // ← nullable
                note: $validated['note'] ?? null,
            );

            $message = $isChange
                ? 'تصمیم به تایید تغییر کرد'
                : 'نظر تایید شد';

            StickyAlert::toast($message, 'success');
        } catch (\InvalidArgumentException $e) {
            StickyAlert::toast($e->getMessage(), 'error');
        }

        return redirect()->back();
    }
    public function reject(Request $request, Review $review)
    {
        $validated = $request->validate([
            'reason' => 'required|string|min:5|max:500',
            'note'   => 'nullable|string|max:500',
        ], [
            'reason.required' => 'دلیل رد الزامی است.',
            'reason.min'      => 'دلیل باید حداقل ۵ کاراکتر باشد.',
            'reason.max'      => 'دلیل نباید بیشتر از ۵۰۰ کاراکتر باشد.',
        ]);

        try {
            $this->reviewService->reject(
                review: $review,
                admin: auth()->user(),
                reason: $validated['reason'],
                note: $validated['note'] ?? null,
            );

            $message = $review->status === ReviewStatus::approved
                ? 'تصمیم به رد تغییر کرد'
                : 'نظر رد شد';

            StickyAlert::toast($message, 'success');
        } catch (\InvalidArgumentException $e) {
            StickyAlert::toast($e->getMessage(), 'error');
        }

        return redirect()->back();
    }

    // ============ حذف (Soft) ============
    public function destroy(Review $review)
    {
        $review->delete();

        StickyAlert::toast('نظر حذف شد', 'success');

        return redirect()->back();
    }

    // ============ بازیابی ============
    public function restore($id)
    {
        $review = Review::withTrashed()->findOrFail($id);

        // ============ اطلاعات قبلی برای ثبت در تاریخچه ============
        $previousStatus        = $review->status;
        $previousStatusLabel   = $previousStatus?->label() ?? 'نامشخص';
        $previousModeratedAt   = $review->moderated_at;
        $previousModeratedBy   = $review->moderated_by;
        $previousRejectionReason = $review->rejection_reason;

        // ============ بازیابی + برگشت به pending ============
        $review->restore();
        $review->update([
            'status'           => ReviewStatus::pending->value,
            'moderated_by'     => null,
            'moderated_at'     => null,
            'moderation_note'  => "بازیابی شده از حذف. وضعیت قبلی: {$previousStatusLabel}",
            'rejection_reason' => null,
        ]);

        // ============ لاگ فعالیت (اختیاری ولی توصیه‌شده) ============

        (new Log())->storeLog($review->id,  'review restored from trash', "بازیابی نظر  #{$review->id} — #{$previousModeratedAt?->toIso8601String()}");


        // ============ بازمحاسبه امتیاز آرایشگر ============
        // چون نظر حذف‌شده بود و احتمالاً از average حذف شده بود،
        // حالا که pending شده، امتیاز دوباره محاسبه می‌شه
        if ($review->barber) {
            app(ReviewService::class)->recalculateBarberRating($review->barber);
        }

        StickyAlert::toast(
            'نظر بازیابی شد و در صف بررسی قرار گرفت.',
            'success'
        );

        return redirect()->back();
    }

    // ============ حذف کامل ============
    public function forceDelete($id)
    {
        $review = Review::withTrashed()->findOrFail($id);
        $review->forceDelete();

        return redirect()->back()->with('success', 'نظر برای همیشه حذف شد.');
    }

    // ============ آمار ============
    private function buildStats(): array
    {
        return [
            'total'    => Review::withTrashed()->count(),
            'pending'  => Review::where('status', ReviewStatus::pending->value)->count(),
            'approved' => Review::where('status', ReviewStatus::approved->value)->count(),
            'rejected' => Review::where('status', ReviewStatus::rejected->value)->count(),
            'deleted'  => Review::onlyTrashed()->count(),

            'avg_rating' => (float) Review::where('status', ReviewStatus::approved->value)
                ->avg('rating') ?? 0,

            'today_count' => Review::whereDate('created_at', today())->count(),
        ];
    }

    // ============ mapReview ============
    private function mapReview(Review $r, bool $detailed = false): array
    {
        $data = [
            'id'             => $r->id,
            'rating'         => $r->rating,
            'comment'        => $r->comment,
            'status'         => $r->status?->value,
            'status_label'   => $r->status?->label() ?? 'نامشخص',
            'status_color'   => $r->status?->color(),
            'status_icon'    => $r->status?->icon(),

            'is_deleted'     => $r->trashed(),
            'deleted_at'     => $r->deleted_at?->toIso8601String(),
            'created_at'     => $r->created_at?->toIso8601String(),
            'updated_at'     => $r->updated_at?->toIso8601String(),

            'moderated_at'   => $r->moderated_at?->toIso8601String(),
            'moderation_note' => $r->moderation_note,
            'rejection_reason' => $r->rejection_reason,

            'user' => $r->user ? [
                'id'         => $r->user->id,
                'slug'         => $r->user->slug,
                'name'       => $r->user->name,
                'phone'      => $r->user->phone,
                'avatar_url' => $r->user->avatar ? $r->user->avatarUrl() : null,
            ] : null,

            'barber' => $r->barber ? [
                'id'         => $r->barber->id,
                'name'       => $r->barber->name,
                'phone'      => $r->barber->phone,
                'avatar_url' => $r->barber->avatar ? $r->barber->avatarUrl() : null,
                'slug'       => $r->barber->slug,
            ] : null,

            'moderated_by' => $r->moderatedBy ? [
                'id'   => $r->moderatedBy->id,
                'name' => $r->moderatedBy->name,
            ] : null,

            'is_change' => $r->status !== ReviewStatus::pending,
            'can_change_to_approved' => $r->canChangeStatusTo(ReviewStatus::approved),
            'can_change_to_rejected' => $r->canChangeStatusTo(ReviewStatus::rejected),
        ];

        if ($detailed) {
            $data['booking'] = $r->booking ? [
                'id'         => $r->booking->id,
                'amount'     => (float) $r->booking->amount,
                'created_at' => $r->booking->created_at?->toIso8601String(),
                'time_slot'  => $r->booking->timeSlot ? [
                    'date'       => $r->booking->timeSlot->date,
                    'start_time' => $r->booking->timeSlot->start_time,
                    'end_time'   => $r->booking->timeSlot->end_time,
                ] : null,
                'service' => $r->booking->service ? [
                    'id'    => $r->booking->service->id,
                    'name'  => $r->booking->service->name,
                    'price' => (float) $r->booking->service->price,
                ] : null,
            ] : null;

            // تاریخچه moderation
            $data['moderation_history'] = $r->moderationHistory()
                ->with('admin:id,name')
                ->get()
                ->map(fn($h) => [
                    'id'              => $h->id,
                    'admin'           => $h->admin ? [
                        'id'   => $h->admin->id,
                        'name' => $h->admin->name,
                    ] : null,
                    'previous_status' => $h->previous_status?->value,
                    'previous_label'  => $h->previous_status?->label(),
                    'new_status'      => $h->new_status?->value,
                    'new_label'       => $h->new_status?->label(),
                    'reason'          => $h->reason,
                    'note'            => $h->note,
                    'created_at'      => $h->created_at?->toIso8601String(),
                ])
                ->toArray();
        }

        return $data;
    }
}
