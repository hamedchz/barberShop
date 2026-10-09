<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Services\ReviewService;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;

use function Laravel\Prompts\alert;

class ReviewController extends Controller
{
    public function __construct(
        private ReviewService $reviewService,
    ) {}
    public function approve(Request $request, Review $review)
    {
        $validated = $request->validate([
            'note' => 'nullable|string|max:500',
        ]);

        $this->reviewService->approve(
            review: $review,
            admin: auth()->user(),
            note: $validated['note'] ?? null,
        );

        StickyAlert::alert('نظر تایید شد', 'success');

        return redirect()->back();
    }

    public function reject(Request $request, Review $review)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:100',
            'note'   => 'nullable|string|max:500',
        ]);

        $this->reviewService->reject(
            review: $review,
            admin: auth()->user(),
            reason: $validated['reason'],
            note: $validated['note'] ?? null,
        );
        StickyAlert::alert('نظر رد شد', 'success');

        return redirect()->back();
    }
}
