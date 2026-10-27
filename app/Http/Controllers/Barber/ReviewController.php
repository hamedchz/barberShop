<?php

namespace App\Http\Controllers\Barber;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Enums\Casts\ReviewStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = $user->reviews()
            ->with([
                'user:id,name,avatar',
                'booking:id,amount,time_slot_id',
                'booking.timeSlot:id,date',
                'moderatedBy:id,name',
            ])
            ->where(function ($q) {
                // فقط نظرات approved و rejected (نه pending)
                $q->where('status', ReviewStatus::approved->value)
                    ->orWhere('status', ReviewStatus::rejected->value);
            })
            ->whereNull('deleted_at');

        // فیلتر
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($rating = $request->input('rating')) {
            $query->where('rating', $rating);
        }

        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                    ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        $reviews = $query->latest()->paginate(33)->withQueryString();

        $reviews->through(fn($r) => [
            'id' => $r->id,
            'rating' => $r->rating,
            'comment' => $r->comment,
            'status' => $r->status?->value,
            'status_label' => $r->status?->label(),
            'created_at' => $r->created_at?->toIso8601String(),
            'moderation_note' => $r->status?->value === 'rejected'
                ? $r->moderation_note
                : null,
            'rejection_reason' => $r->status?->value === 'rejected'
                ? $r->rejection_reason
                : null,
            'customer' => $r->user ? [
                'name' => $r->user->name,
                'avatar' => $r->user->avatar ? $r->user->avatarUrl() : null,
            ] : null,
            'booking_id' => $r->booking_id,
            'booking_date' => $r->booking?->timeSlot?->date,
        ]);

        return Inertia::render('Barber/Reviews/Index', [
            'reviews' => $reviews,
            'stats' => $this->buildStats($user),
            'filters' => [
                'status' => $request->input('status', ''),
                'rating' => $request->input('rating', ''),
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    private function buildStats($user): array
    {
        $approved = $user->reviews()
            ->where('status', ReviewStatus::approved->value)
            ->whereNull('deleted_at');

        $total = (clone $approved)->count();
        $avg = (float) (clone $approved)->avg('rating') ?? 0;

        $distribution = (clone $approved)
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        return [
            'total' => $total,
            'avg_rating' => round($avg, 1),
            'distribution' => [
                5 => (int) ($distribution[5] ?? 0),
                4 => (int) ($distribution[4] ?? 0),
                3 => (int) ($distribution[3] ?? 0),
                2 => (int) ($distribution[2] ?? 0),
                1 => (int) ($distribution[1] ?? 0),
            ],
            'rejected_count' => $user->reviews()
                ->where('status', ReviewStatus::rejected->value)
                ->whereNull('deleted_at')
                ->count(),
        ];
    }
}
