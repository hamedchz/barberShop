<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\DisputedStatus;
use App\Enums\Casts\TimeSlotStatus;
use App\Exceptions\WalletException;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Dispute;
use App\Models\Log;
use App\Models\User;
use App\Notifications\DisputeResolvedForBarber;
use App\Notifications\DisputeResolvedForCustomer;
use App\Notifications\DisputeResponseRequested;
use App\Services\DisputeResolutionService;
use App\Services\WalletService;
use App\Supports\StickyAlert;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log as FacadesLog;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;


class DisputeController extends Controller
{

    public function __construct(
        private DisputeResolutionService $resolutionService,
    ) {}
    // ============================================
    // لیست اعتراضات
    // ============================================
    public function index(Request $request)
    {
        $query = Dispute::query()
            ->with([
                'booking' => function ($q) {
                    $q->with([
                        'barber:id,name,avatar,slug',
                        'user:id,name,avatar,phone',
                        'service:id,name',
                    ]);
                },
                'disputedByUser:id,name,avatar',
            ]);

        // ============ فیلتر وضعیت ============
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // ============ فیلتر نقش ============
        if ($role = $request->input('role')) {
            $query->where('disputed_by', $role);
        }

        // ============ فیلتر نوع اعتراض ============
        if ($type = $request->input('type')) {
            $query->where('dispute_type', $type);
        }

        // ============ فیلتر اولویت ============
        if ($request->boolean('urgent')) {
            $query->where('created_at', '<', now()->subHours(24))
                ->whereIn('status', [DisputedStatus::pending->value, DisputedStatus::investigating->value]);
        }

        // ============ جستجو ============
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('booking', function ($bq) use ($search) {
                    $bq->where('id', 'like', "%{$search}%")
                        ->orWhereHas('barber', function ($barberQ) use ($search) {
                            $barberQ->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('user', function ($userQ) use ($search) {
                            $userQ->where('name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                })->orWhere('reason', 'like', "%{$search}%");
            });
        }

        // ============ مرتب‌سازی ============
        $sort = $request->input('sort', 'latest');
        switch ($sort) {
            case 'oldest':
                $query->oldest();
                break;
            case 'urgent':
                $query->whereIn('status', [DisputedStatus::pending->value, DisputedStatus::investigating->value])
                    ->oldest();
                break;
            default:
                $query->latest();
        }

        $disputes = $query->paginate(15)->withQueryString();

        // ============ تبدیل داده‌ها ============
        $disputes->through(function ($dispute) {
            $booking = $dispute->booking;

            // محاسبه زمان گذشته از ثبت اعتراض
            $hoursSinceCreation = $dispute->created_at->diffInHours(now());
            $isUrgent = $hoursSinceCreation >= 24
                && in_array($dispute->status->value, [DisputedStatus::pending->value, DisputedStatus::investigating->value]);

            return [
                'id' => $dispute->id,
                'disputed_by' => $dispute->disputed_by->value,
                'dispute_type' => $dispute->dispute_type->value,
                'reason' => $dispute->reason,
                'status' => $dispute->status,
                'created_at' => $dispute->created_at,
                'updated_at' => $dispute->updated_at,
                'is_urgent' => $isUrgent,
                'hours_since_creation' => $hoursSinceCreation,

                // اطلاعات رزرو
                'booking' => [
                    'id' => $booking->id,
                    'amount' => (float) $booking->amount,
                    'status' => $booking->status->value,
                    'date' => $booking->timeSlot?->date,
                    'barber' => $booking->barber ? [
                        'id' => $booking->barber->id,
                        'name' => $booking->barber->name,
                        'avatar' => $booking->barber->avatar,
                        'thumbnail' => $booking->barber->avatar(),
                    ] : null,
                    'customer' => $booking->user ? [
                        'id' => $booking->user->id,
                        'name' => $booking->user->name,
                        'avatar' => $booking->user->avatar,
                        'thumbnail' => $booking->user->avatar(),
                        'phone' => $booking->user->phone,
                    ] : null,
                    'service' => $booking->service ? [
                        'id' => $booking->service->id,
                        'name' => $booking->service->name,
                    ] : null,
                ],

                // اطلاعات معترض
                'disputed_by_user' => $dispute->disputedByUser ? [
                    'id' => $dispute->disputedByUser->id,
                    'name' => $dispute->disputedByUser->name,
                    'avatar' => $dispute->disputedByUser->avatar,
                    'thumbnail' => $dispute->disputedByUser->avatar(),
                ] : null,
            ];
        });

        // ============ آمار ============
        $stats = [
            'total' => Dispute::count(),
            'pending' => Dispute::where('status', 'pending')->count(),
            'investigating' => Dispute::where('status', 'investigating')->count(),
            'awaiting_response' => Dispute::where('status', 'awaiting_response')->count(),
            'resolved' => Dispute::where('status', 'resolved')->count(),
            'rejected' => Dispute::where('status', 'rejected')->count(),
            'urgent' => Dispute::whereIn('status', ['pending', 'investigating'])
                ->where('created_at', '<', now()->subHours(24))
                ->count(),
            'by_customer' => Dispute::where('disputed_by', 'customer')->count(),
            'by_barber' => Dispute::where('disputed_by', 'barber')->count(),
        ];

        return Inertia::render('Admin/Disputes/Index', [
            'disputes' => $disputes,
            'stats' => $stats,
            'filters' => [
                'status' => $request->input('status', ''),
                'role' => $request->input('role', ''),
                'type' => $request->input('type', ''),
                'search' => $search ?? '',
                'sort' => $sort,
                'urgent' => $request->boolean('urgent'),
            ],
        ]);
    }

    // ============================================
    // جزئیات اعتراض
    // ============================================
    public function show(Dispute $dispute, DisputeResolutionService $service)
    {

        $dispute->load([
            'booking' => function ($q) {
                $q->with([
                    'barber:id,name,avatar,phone,slug',
                    'user:id,name,avatar,phone',
                    'service:id,name,image,duration,price',
                    'timeSlot:id,date,start_time,end_time',
                    'payment',
                    'review',
                ]);
            },
            'disputedByUser:id,name,avatar,phone',
            'respondedByUser:id,name,avatar',
            'resolvedByUser:id,name,avatar',
        ]);

        // ============ تاریخچه اعتراضات این رزرو ============
        $otherDisputes = Dispute::where('booking_id', $dispute->booking_id)
            ->where('id', '!=', $dispute->id)
            ->latest()
            ->get()
            ->map(function ($d) {
                return [
                    'id' => $d->id,
                    'disputed_by' => $d->disputed_by->value,
                    'dispute_type' => $d->dispute_type->value,
                    'status' => $d->status->value,
                    'admin_notes' => $d->admin_notes,
                    'response' => $d->response,
                    'created_at' => $d->created_at,
                ];
            });

        return Inertia::render('Admin/Disputes/Show', [
            'dispute' => [
                'id' => $dispute->id,
                'disputed_by' => $dispute->disputed_by->value,
                'dispute_type' => $dispute->dispute_type->value,
                'reason' => $dispute->reason,
                'admin_notes' => $dispute->admin_notes,
                'status' => $dispute->status->value,
                'response' => $dispute->response,
                'responded_at' => $dispute->responded_at,
                'resolution' => $dispute->resolution,
                'resolved_at' => $dispute->resolved_at,
                'refund_amount' => (float) $dispute->refund_amount,
                'penalty_amount' => (float) $dispute->penalty_amount,
                'edit_count' => $dispute->edit_count,
                'edited_at' => $dispute->edited_at,
                'created_at' => $dispute->created_at,
                'updated_at' => $dispute->updated_at,

                // پیوست‌ها
                'attachments' => collect($dispute->attachments ?? [])
                    ->map(fn($path) => [
                        'path' => $path,
                        'url' => asset('storage/' . $path),
                        'name' => basename($path),
                    ])
                    ->toArray(),

                // معترض
                'disputed_by_user' => $dispute->disputedByUser ? [
                    'id' => $dispute->disputedByUser->id,
                    'name' => $dispute->disputedByUser->name,
                    'avatar' => $dispute->disputedByUser->avatar,
                    'thumbnail' => $dispute->disputedByUser->avatar(),
                    'phone' => $dispute->disputedByUser->phone,
                    'email' => $dispute->disputedByUser->email,
                ] : null,

                // پاسخ دهنده
                'responded_by_user' => $dispute->respondedByUser ? [
                    'id' => $dispute->respondedByUser->id,
                    'name' => $dispute->respondedByUser->name,
                    'avatar' => $dispute->respondedByUser->avatar,
                ] : null,

                // بررسی کننده
                'resolved_by_user' => $dispute->resolvedByUser ? [
                    'id' => $dispute->resolvedByUser->id,
                    'name' => $dispute->resolvedByUser->name,
                    'avatar' => $dispute->resolvedByUser->avatar,
                ] : null,

                // رزرو
                'booking' => [
                    'id' => $dispute->booking->id,
                    'amount' => (float) $dispute->booking->amount,
                    'status' => $dispute->booking->status->value,
                    'date' => $dispute->booking->timeSlot?->date,
                    'start_time' => $dispute->booking->timeSlot?->start_time,
                    'end_time' => $dispute->booking->timeSlot?->end_time,
                    'completed_at' => $dispute->booking->completed_at,
                    'completed_by' => $dispute->booking->completed_by?->value,

                    'barber' => $dispute->booking->barber ? [
                        'id' => $dispute->booking->barber->id,
                        'name' => $dispute->booking->barber->name,
                        'avatar' => $dispute->booking->barber->avatar,
                        'thumbnail' => $dispute->booking->barber->avatar(),
                        'phone' => $dispute->booking->barber->phone,
                        'email' => $dispute->booking->barber->email,
                    ] : null,

                    'customer' => $dispute->booking->user ? [
                        'id' => $dispute->booking->user->id,
                        'name' => $dispute->booking->user->name,
                        'avatar' => $dispute->booking->user->avatar,
                        'thumbnail' => $dispute->booking->user->avatar(),
                        'phone' => $dispute->booking->user->phone,
                        'email' => $dispute->booking->user->email,
                    ] : null,

                    'service' => $dispute->booking->service ? [
                        'id' => $dispute->booking->service->id,
                        'name' => $dispute->booking->service->name,
                        'image' => $dispute->booking->service->image
                            ? asset('storage/' . $dispute->booking->service->image)
                            : null,
                        'duration' => $dispute->booking->service->duration,
                        'price' => (float) $dispute->booking->service->price,
                    ] : null,

                    'payment' => $dispute->booking->payment ? [
                        'gateway' => $dispute->booking->payment->gateway,
                        'status' => $dispute->booking->payment->status,
                        'amount' => (float) $dispute->booking->payment->amount,
                        'transaction_id' => $dispute->booking->payment->transaction_id,
                    ] : null,

                    'review' => $dispute->booking->review ? [
                        'id' => $dispute->booking->review->id,
                        'rating' => (int) $dispute->booking->review->rating,
                        'comment' => $dispute->booking->review->comment,
                        'status' => $dispute->booking->review->status->value,
                    ] : null,
                ],
            ],
            'other_disputes' => $otherDisputes,
            'suggestedAmounts' => $service->previewAmounts($dispute),
        ]);
    }


    // ============================================
    // تصمیم‌گیری (تایید یا رد اعتراض)
    // ============================================
    public function resolve(
        Request $request,
        Dispute $dispute,
    ) {

        // ============ بررسی وضعیت ============
        if (!in_array($dispute->status->value, [DisputedStatus::pending->value, DisputedStatus::investigating->value, DisputedStatus::awaitingResponse->value])) {
            StickyAlert::alert('این اعتراض قبلاً بررسی شده است.', 'error');
            return redirect()->back();
        }

        // ============ اعتبارسنجی ============
        $validated = $request->validate([
            'decision' => 'required|in:approve,reject',
            'resolution' => 'required|string|min:10|max:1000',
            'refund_amount' => 'nullable|numeric|min:0',
            'penalty_amount'        => 'nullable|numeric|min:0',
            'compensation_amount'   => 'nullable|numeric|min:0',
            'admin_notes' => 'nullable|string|max:1000',
        ], [
            'decision.required' => 'لطفاً تصمیم خود را انتخاب کنید.',
            'resolution.required' => 'لطفاً توضیحات را وارد کنید.',
            'resolution.min' => 'توضیحات باید حداقل ۱۰ کاراکتر باشد.',
        ]);

        // ============ بررسی وضعیت اعتراض ============
        if (!in_array($dispute->status->value, [
            DisputedStatus::pending->value,
            DisputedStatus::investigating->value,
            DisputedStatus::awaitingResponse->value,
        ])) {

            StickyAlert::alert('این اعتراض قبلاً بررسی شده است.', 'error');
            return redirect()->back();
        }

        // ============ اجرا ============
        try {
            $this->resolutionService->resolve(
                dispute: $dispute,
                decision: $validated['decision'],
                resolution: $validated['resolution'],
                admin: auth()->user(),
                adminRefundAmount: $validated['refund_amount'] ?? null,
                adminPenaltyAmount: $validated['penalty_amount'] ?? null,
                adminCompensationAmount: $validated['compensation_amount'] ?? null,
            );

            $message = $validated['decision'] === 'approve'
                ? 'اعتراض با موفقیت تایید شد.'
                : 'اعتراض با موفقیت رد شد.';

            StickyAlert::alert($message, 'success');
            return redirect()->back();
        } catch (WalletException $e) {
            // خطای مربوط به کیف پول (مثلاً موجودی کافی نیست)
            Log::warning('Dispute resolution wallet error', [
                'dispute_id' => $dispute->id,
                'error'      => $e->getMessage(),
            ]);

            return back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            // خطای غیرمنتظره
            FacadesLog::error('Dispute resolution failed', [
                'dispute_id' => $dispute->id,
                'error'      => $e->getMessage(),
                'trace'      => $e->getTraceAsString(),
            ]);
            StickyAlert::alert('خطایی در انجام عملیات رخ داد.', 'error');
            return redirect()->back();
        }
    }

    // ============================================
    // درخواست اطلاعات بیشتر
    // ============================================
    public function requestResponse(Request $request, Dispute $dispute)
    {

        if (!in_array($dispute->status->value, [DisputedStatus::pending->value, DisputedStatus::investigating->value])) {
            StickyAlert::alert('این اعتراض قابل درخواست پاسخ نیست.', 'error');
            return back();
        }

        $validated = $request->validate([
            'message' => 'required|string|min:10|max:1000',
        ]);

        $dispute->update([
            'status' => DisputedStatus::awaitingResponse->value,
            'admin_notes' => $validated['message'],
        ]);

        // Notification به معترض
        try {
            $dispute->disputedByUser?->notify(
                new DisputeResponseRequested($dispute)
            );
        } catch (\Exception $e) {
            FacadesLog::warning('Response request notification failed', [
                'dispute_id' => $dispute->id,
            ]);
        }
        StickyAlert::alert('درخواست پاسخ ارسال شد.', 'success');
        return back();
    }

    // ============================================
    // توابع کمکی
    // ============================================

    private function refundToCustomer(User $user, float $amount, Dispute $dispute): void
    {
        $user->increment('wallet_balance', $amount);

        \App\Models\WalletTransaction::create([
            'user_id' => $user->id,
            'type' => 'credit',
            'amount' => $amount,
            'reference_type' => Dispute::class,
            'reference_id' => $dispute->id,
            'description' => "بازگشت مبلغ به دلیل تایید اعتراض #{$dispute->id}",
            'status' => 'completed',
        ]);
    }

    private function penalizeBarber(User $barber, float $amount, Dispute $dispute): void
    {
        $barber->decrement('wallet_balance', $amount);
        $barber->decrement('rating_points', 10);

        \App\Models\WalletTransaction::create([
            'user_id' => $barber->id,
            'type' => 'debit',
            'amount' => $amount,
            'reference_type' => Dispute::class,
            'reference_id' => $dispute->id,
            'description' => "جریمه به دلیل تایید اعتراض #{$dispute->id}",
            'status' => 'completed',
        ]);
    }

    private function penalizeCustomer(User $customer, float $amount, Dispute $dispute): void
    {
        $customer->decrement('wallet_balance', $amount);
        $customer->decrement('rating_points', 5);
    }
}
