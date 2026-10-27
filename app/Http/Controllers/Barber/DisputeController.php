<?php

namespace App\Http\Controllers\Barber;

use App\Enums\Casts\BookingCompletedBy;
use App\Enums\Casts\BookingStatus;
use App\Enums\Casts\DisputedBy;
use App\Enums\Casts\DisputedStatus;
use App\Enums\Casts\DisputeTypes;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Dispute;
use App\Models\Log;
use App\Models\User;
use App\Notifications\BookingDisputeByBarber;
use App\Notifications\BookingDisputedByBarber;
use App\Notifications\DisputeEditedByBarber;
use App\Notifications\DisputeRespondedByBarber;
use App\Notifications\DisputeRespondedForCustomer;
use App\Supports\StickyAlert;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log as FacadesLog;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DisputeController extends Controller
{

    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Dispute::forBarber($user->id)
            ->with([
                'booking:id,user_id,barber_id,amount,time_slot_id,service_id,status',
                'booking.user:id,name,avatar,phone',
                'booking.service:id,name',
                'booking.timeSlot:id,date,start_time,end_time',
                'disputedByUser:id,name,avatar',
                'respondedByUser:id,name',
            ]);

        // ============ فیلتر وضعیت ============
        if ($status = $request->input('status')) {
            if ($status === 'active') {
                $query->active();
            } else {
                $query->where('status', $status);
            }
        }

        // ============ فیلتر نوع ============
        if ($type = $request->input('type')) {
            $query->where('dispute_type', $type);
        }

        // ============ جستجو ============
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhereHas('booking.user', fn($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        $disputes = $query->latest()->paginate(33)->withQueryString();

        $disputes->through(fn($d) => $this->mapDispute($d));

        return Inertia::render('Barber/Disputes/Index', [
            'disputes' => $disputes,
            'stats'    => $this->buildStats($user),
            'filters'  => [
                'status' => $request->input('status', ''),
                'type'   => $request->input('type', ''),
                'search' => $request->input('search', ''),
            ],
            'types'    => collect(DisputeTypes::cases())
                ->map(fn($t) => [
                    'value' => $t->value,
                    'label' => $t->label() ?? $t->value,
                ])
                ->values(),
            'statuses' => collect(DisputedStatus::cases())
                ->map(fn($s) => [
                    'value' => $s->value,
                    'label' => $s->label() ?? $s->value,
                ])
                ->values(),
        ]);
    }

    public function show(Dispute $dispute)
    {
        $user = auth()->user();

        // بررسی مالکیت
        if ($dispute->booking?->barber_id !== $user->id) {
            abort(403);
        }

        $dispute->load([
            'booking:id,user_id,barber_id,amount,time_slot_id,service_id,status,notes',
            'booking.user:id,name,avatar,phone',
            'booking.service:id,name,price,duration',
            'booking.timeSlot:id,date,start_time,end_time',
            'disputedByUser:id,name,avatar,phone',
            'respondedByUser:id,name',
            'resolvedByUser:id,name',
        ]);

        return Inertia::render('Barber/Disputes/Show', [
            'dispute' => $this->mapDispute($dispute, detailed: true),
        ]);
    }
    /**
     * ثبت اعتراض آرایشگر
     */
    public function store(Request $request, Booking $booking)
    {
        // ============================================
        // ۱. بررسی مالکیت
        // ============================================
        if ($booking->barber_id !== auth()->id()) {
            abort(403);
        }

        // ============ چک: آیا کاربر میتونه اعتراض بزنه؟ ============
        if (!$booking->can_dispute) {
            $hoursRemaining = $booking->dispute_retry_hours_remaining;

            if ($hoursRemaining > 0) {

                StickyAlert::alert(
                    "شما باید حداقل {$hoursRemaining} ساعت دیگر صبر کنید.",
                    'error'
                );
                return back();
            }
            StickyAlert::alert(
                'شما قبلاً به این رزرو اعتراض کردهاید و امکان اعتراض مجدد وجود ندارد.',
                'error'
            );
            return back();
        }

        // ============ اگه اعتراض قبلی rejected شده، چک کن موضوع متفاوت باشه ============
        $latestDispute = $booking->disputes()->latest()->first();

        if ($latestDispute?->status->value === DisputedStatus::rejected->value) {
            // اگه همون dispute_type بود، رد کن
            if ($latestDispute->dispute_type->value === $request->dispute_type) {
                StickyAlert::alert(
                    'شما قبلاً با همین موضوع اعتراض کردهاید و اعتراض شما رد شده است. لطفاً موضوع دیگری انتخاب کنید یا با پشتیبانی تماس بگیرید.',
                    'error'
                );
                return back();
            }
        }

        // ============================================
        // ۲. بررسی وضعیت رزرو
        // ============================================
        if ($booking->status->value !== BookingStatus::completed->value) {
            StickyAlert::alert(
                'فقط برای رزروهای تکمیل شده می‌توانید اعتراض کنید.',
                'error'
            );
            return back();
        }

        // ============================================
        // ۳. بررسی عدم تکمیل توسط خود آرایشگر
        // ============================================
        if ($booking->completed_by?->value === BookingCompletedBy::barber->value) {
            StickyAlert::alert(
                'شما خودتان این رزرو را تکمیل کرده‌اید.',
                'error'
            );
            return back();
        }

        // ============================================
        // ۴. بررسی اعتراض فعال قبلی
        // ============================================
        $activeDispute = $booking->disputes()
            ->where('disputed_by_user_id', auth()->id())
            ->whereIn('status', [
                DisputedStatus::pending->value,
                DisputedStatus::investigating->value,
                DisputedStatus::awaitingResponse->value,
            ])
            ->exists();

        if ($activeDispute) {
            StickyAlert::alert(
                'شما یک اعتراض فعال برای این رزرو دارید.',
                'error'
            );
            return back();
        }

        // ============================================
        // ۵. بررسی مهلت (۲۴ ساعت)
        // ============================================
        $completedAt = $booking->completed_at ?? $booking->updated_at;
        $deadline = $completedAt->copy()->addHours(24);

        if (now()->greaterThan($deadline)) {
            StickyAlert::alert(
                'مهلت اعتراض آرایشگر (۲۴ ساعت) گذشته است.',
                'error'
            );
            return back();
        }

        // ============================================
        // ۶. لیست مجاز برای آرایشگر
        // ============================================
        $allowedTypes = [
            'customer_not_present',
            'customer_rude',
            'false_review',
            'customer_left_early',
            'customer_damaged',
            'other',
        ];

        // ============================================
        // ۷. اعتبارسنجی
        // ============================================
        $validated = $request->validate([
            'dispute_type' => [
                'required',
                'string',
                Rule::in($allowedTypes),
            ],
            'reason' => 'required|string|min:10|max:1000',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ], [
            'dispute_type.required' => 'لطفاً نوع اعتراض را انتخاب کنید.',
            'dispute_type.in' => 'نوع اعتراض معتبر نیست.',
            'reason.required' => 'لطفاً دلیل اعتراض را وارد کنید.',
            'reason.min' => 'دلیل باید حداقل ۱۰ کاراکتر باشد.',
            'reason.max' => 'دلیل نباید بیشتر از ۱۰۰۰ کاراکتر باشد.',
            'attachments.max' => 'حداکثر ۵ فایل می‌توانید آپلود کنید.',
            'attachments.*.image' => 'فایل باید تصویر باشد.',
            'attachments.*.max' => 'حجم هر تصویر نباید بیشتر از ۲ مگابایت باشد.',
        ]);

        DB::beginTransaction();

        try {
            // ============================================
            // ۸. آپلود پیوست‌ها
            // ============================================

            $attachmentPaths = [];
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $attachmentPaths[] = $file->store('disputes', 'public');
                }
            }

            // ============================================
            // ۹. ثبت اعتراض
            // ============================================
            $dispute = Dispute::create([
                'booking_id' => $booking->id,
                'disputed_by_user_id' => auth()->id(),
                'disputed_by' => DisputedBy::barber->value,
                'dispute_type' => $validated['dispute_type'],
                'reason' => $validated['reason'],
                'status' => 'pending',
                'attachments' => $attachmentPaths,
                'ip_address' => request()->ip(),
            ]);

            // ============================================
            // ۱۰. Notification به ادمین
            // ============================================
            try {
                User::role(['سوپر ادمین'])
                    ->get()
                    ->each(function ($admin) use ($dispute) {
                        $admin->notify(
                            new BookingDisputeByBarber($dispute->booking)
                        );
                    });
            } catch (\Exception $e) {
                Log::warning('Dispute notification to admin failed', [
                    'dispute_id' => $dispute->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // ============================================
            // ۱۱. Notification به آرایشگر
            // ============================================
            try {
                $booking->user?->notify(
                    new BookingDisputedByBarber($dispute)
                );
            } catch (\Exception $e) {
                Log::warning('Dispute notification to barber failed', [
                    'dispute_id' => $dispute->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // ============================================
            // ۱۲. لاگ
            // ============================================
            (new Log())->storeLog(
                $booking->id,
                'barber_dispute_booking',
                "اعتراض آرایشگر به رزرو #{$booking->id} - نوع: {$validated['dispute_type']}"
            );

            DB::commit();

            StickyAlert::alert(
                'اعتراض شما ثبت شد. ادمین تا ۴۸ ساعت آینده بررسی خواهد کرد.',
                'success'
            );

            return redirect()->route('barber.bookings.show', $booking->id);
        } catch (\Exception $e) {
            DB::rollBack();

            FacadesLog::error('Barber dispute failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);

            StickyAlert::alert(
                'خطا در ثبت اعتراض. لطفاً دوباره تلاش کنید.',
                'error'
            );
            return back();
        }
    }

    /**
     * ویرایش اعتراض آرایشگر
     */
    public function edit(Dispute $dispute)
    {


        // ============ بررسی مالکیت ============
        if ($dispute->disputed_by_user_id !== auth()->id()) {
            abort(403, 'این اعتراض متعلق به شما نیست.');
        }

        // بررسی نقش
        if ($dispute->disputed_by->value !== DisputedBy::barber->value) {
            abort(403);
        }


        // ============ بررسی وضعیت ============
        if (!in_array($dispute->status->value, [DisputedStatus::pending->value, DisputedStatus::awaitingResponse->value])) {
            StickyAlert::alert('این اعتراض قابل ویرایش نیست', 'error');
            return redirect()->back();
        }

        // ============ بررسی زمان (اختیاری) ============
        // فقط تا ۲ ساعت پس از ثبت
        if ($dispute->created_at->diffInHours(now()) > 2) {
            StickyAlert::alert('مهلت ویرایش اعتراض (۲ ساعت) گذشته است', 'error');
            return redirect()->back();
        }

        // ============ بارگذاری روابط ============
        $dispute->load([
            'booking' => function ($q) {
                $q->with([
                    'user:id,name,avatar,slug',
                    'service:id,name,image,duration,price',
                    'timeSlot:id,date,start_time,end_time',
                ]);
            },
        ]);

        $booking = $dispute->booking;

        return Inertia::render('Barber/Disputes/Edit', [
            'dispute' => [
                'id' => $dispute->id,
                'booking_id' => $dispute->booking_id,
                'dispute_type' => $dispute->dispute_type->value,
                'disputed_by' => $dispute->disputed_by->value,
                'reason' => $dispute->reason,
                'status' => $dispute->status->value,
                'edit_count' => $dispute->edit_count,
                'edited_at' => $dispute->edited_at,
                'created_at' => $dispute->created_at,

                // ============ پیوست‌های فعلی ============
                'attachments' => collect($dispute->attachments ?? [])
                    ->map(fn($path) => [
                        'path' => $path,
                        'url' => asset('storage/' . $path),
                        'name' => basename($path),
                    ])
                    ->toArray(),
            ],

            'booking' => [
                'id' => $booking->id,
                'date' => $booking->timeSlot?->date,
                'start_time' => $booking->timeSlot?->start_time,
                'end_time' => $booking->timeSlot?->end_time,
                'amount' => (float) $booking->amount,

                'customer' => $booking->user ? [
                    'id' => $booking->user->id,
                    'name' => $booking->user->name,
                    'avatar' => $booking->user->avatar,
                    'thumbnail' => $booking->user->avatarUrl(),
                    'slug' => $booking->user->slug,
                ] : null,

                'service' => $booking->service ? [
                    'id' => $booking->service->id,
                    'name' => $booking->service->name,
                    'image' => $booking->service->image
                        ? asset('storage/' . $booking->service->image)
                        : null,
                    'duration' => $booking->service->duration,
                    'price' => (float) $booking->service->price,
                ] : null,
            ],
        ]);
    }

    /**
     * بروزرسانی اعتراض
     */
    public function update(Request $request, Dispute $dispute)
    {
        // ============ بررسی مالکیت ============
        if ($dispute->disputed_by_user_id !== auth()->id()) {
            abort(403);
        }

        // ============ بررسی وضعیت ============
        if (!in_array($dispute->status->value, [DisputedStatus::pending->value, DisputedStatus::awaitingResponse->value])) {
            StickyAlert::alert('این اعتراض قابل ویرایش نیست', 'error');
            return redirect()->back();
        }

        // ============ بررسی زمان ============
        if ($dispute->created_at->diffInHours(now()) > 2) {
            StickyAlert::alert('مهلت ویرایش اعتراض (۲ ساعت) گذشته است', 'error');
            return redirect()->back();
        }

        // ============ اعتبارسنجی ============
        $validated = $request->validate([
            'reason' => 'required|string|min:10|max:1000',
            'dispute_type' => [
                'required',
                Rule::enum(DisputeTypes::class)
            ],
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
            'keep_attachments' => 'nullable|array',
        ], [
            'reason.required' => 'لطفاً دلیل اعتراض را وارد کنید.',
            'reason.min' => 'دلیل باید حداقل ۱۰ کاراکتر باشد.',
            'reason.max' => 'دلیل نباید بیشتر از ۱۰۰۰ کاراکتر باشد.',
            'dispute_type.required' => 'لطفاً نوع اعتراض را انتخاب کنید.',
        ]);

        DB::beginTransaction();

        try {
            // ============ حذف پیوست‌های حذف شده ============
            $currentAttachments = $dispute->attachments ?? [];
            $keepAttachments = $request->input('keep_attachments', []);
            $deletedAttachments = array_diff($currentAttachments, $keepAttachments);

            foreach ($deletedAttachments as $path) {
                if (Storage::exists($path)) {
                    Storage::delete($path);
                }
            }

            // ============ آپلود پیوست‌های جدید ============
            $newAttachments = array_values($keepAttachments);
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $newAttachments[] = $file->store('disputes');
                }
            }



            // ============ بروزرسانی اعتراض ============
            $dispute->update([
                'dispute_type' => $validated['dispute_type'],
                'reason' => $validated['reason'],
                'attachments' => $newAttachments,
                'edited_at' => now(),
                'edit_count' =>  $dispute->edit_count + 1,
            ]);

            // ============ Notification به ادمین ============
            try {
                User::role(['سوپر ادمین'])
                    ->get()
                    ->each(function ($admin) use ($dispute) {
                        $admin->notify(
                            new DisputeEditedByBarber($dispute)
                        );
                    });
            } catch (\Exception $e) {
                Log::warning('Dispute edit notification failed', [
                    'dispute_id' => $dispute->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // ============ لاگ ============
            (new Log())->storeLog(
                $dispute->booking_id,
                'barber_edited_dispute',
                "ویرایش اعتراض #{$dispute->id} توسط آرایشگر"
            );

            DB::commit();
            StickyAlert::alert('اعتراض شما با موفقیت بروزرسانی شد', 'success');
            return to_route('barber.bookings.show', $dispute->booking_id);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Dispute edit failed', [
                'dispute_id' => $dispute->id,
                'error' => $e->getMessage(),
            ]);
            StickyAlert::alert('خطا در بروزرسانی اعتراض', 'error');
            return redirect()->back();
        }
    }
    /**
     * حذف اعتراض آرایشگر
     */
    public function destroy(Dispute $dispute)
    {
        // ============ بررسی مالکیت ============
        if ($dispute->disputed_by_user_id !== auth()->id()) {
            abort(403);
        }

        // ============ بررسی وضعیت ============
        if ($dispute->status->value !== DisputedStatus::pending->value) {
            StickyAlert::alert('فقط اعتراضات در انتظار بررسی قابل حذف هستند', 'error');
            return redirect()->back();
        }

        // ============ بررسی زمان ============
        if ($dispute->created_at->diffInHours(now()) > 2) {
            StickyAlert::alert('مهلت حذف اعتراض (۲ ساعت) گذشته است', 'error');
            return redirect()->back();
        }

        DB::beginTransaction();

        try {
            // ============ حذف پیوست‌ها ============
            if ($dispute->attachments) {
                foreach ($dispute->attachments as $path) {
                    if (Storage::exists($path)) {
                        Storage::delete($path);
                    }
                }
            }

            // ============ حذف اعتراض ============
            $dispute->delete();

            // ============ لاگ ============
            (new Log())->storeLog(
                $dispute->booking_id,
                'barber_deleted_dispute',
                "حذف اعتراض #{$dispute->id} توسط آرایشگر"
            );

            DB::commit();
            StickyAlert::alert('اعتراض شما حذف شد', 'success');
            return to_route('barber.bookings.show', $dispute->booking_id);
        } catch (\Exception $e) {
            DB::rollBack();
            StickyAlert::alert('خطا در حذف اعتراض', 'error');
            return redirect()->back();
        }
    }

    /**
     * پاسخ به درخواست ادمین
     */
    public function respond(Request $request, Dispute $dispute)
    {
        // ============ بررسی مالکیت ============
        if ($dispute->disputed_by_user_id !== auth()->id()) {
            abort(403);
        }

        // ============ بررسی وضعیت ============
        if ($dispute->status->value !== DisputedStatus::awaitingResponse->value) {
            StickyAlert::alert('این اعتراض در وضعیت انتظار پاسخ نیست', 'error');
            return redirect()->back();
        }

        // ============ اعتبارسنجی ============
        $validated = $request->validate([
            'response' => 'required|string|min:10|max:1000',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        DB::beginTransaction();

        try {
            // ============ آپلود پیوست‌های جدید ============

            $newAttachments = $dispute->attachments ?? [];
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $newAttachments[] = $file->store('disputes');
                }
            }

            // ============ بروزرسانی ============
            $dispute->update([
                'response' => $validated['response'],
                'responded_at' => now(),
                'attachments' => $newAttachments,
                'status' => DisputedStatus::investigating->value
            ]);


            // ============ Notification به ادمین ============
            try {
                User::role(['سوپر ادمین'])
                    ->get()
                    ->each(function ($admin) use ($dispute) {
                        $admin->notify(
                            new DisputeRespondedByBarber($dispute)
                        );
                    });
            } catch (\Exception $e) {
                Log::warning('Response notification to admin failed', [
                    'dispute_id' => $dispute->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // ============ Notification به آرایشگر ============
            try {
                $dispute->booking->user?->notify(
                    new DisputeRespondedForCustomer($dispute)
                );
            } catch (\Exception $e) {
                Log::warning('Response notification to barber failed', [
                    'dispute_id' => $dispute->id,
                    'error' => $e->getMessage(),
                ]);
            }

            DB::commit();
            StickyAlert::alert('پاسخ شما ثبت شد', 'success');
            return to_route('barber.bookings.show', $dispute->booking_id);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Dispute response failed', [
                'dispute_id' => $dispute->id,
                'error' => $e->getMessage(),
            ]);
            StickyAlert::alert('خطا در ثبت پاسخ', 'error');
            return redirect()->back();
        }
    }

    private function mapDispute(Dispute $d, bool $detailed = false): array
    {
        $data = [
            'id'          => $d->id,
            'status'      => $d->status?->value,
            'status_label' => $d->status?->label() ?? $d->status?->value,
            'dispute_type' => $d->dispute_type?->value,
            'dispute_type_label' => $d->dispute_type?->label() ?? $d->dispute_type?->value,
            'disputed_by' => $d->disputed_by?->value,
            'disputed_by_label' => $d->disputer_role_label,
            'reason'      => $d->reason,
            'response'    => $d->response,
            'responded_at' => $d->responded_at?->toIso8601String(),
            'created_at'  => $d->created_at?->toIso8601String(),

            'can_respond' => $d->can_respond,
            'can_edit'    => $d->can_edit,
            'can_delete'  => $d->can_delete,

            'booking' => $d->booking ? [
                'id'     => $d->booking->id,
                'amount' => (float) $d->booking->amount,
                'status' => $d->booking->status?->value,
                'customer' => $d->booking->user ? [
                    'id'        => $d->booking->user->id,
                    'name'      => $d->booking->user->name,
                    'avatar'    => $d->booking->user->avatar ? $d->booking->user->avatarUrl() : null,
                    'phone'     => $d->booking->user->phone,
                ] : null,
                'service' => $d->booking->service ? [
                    'name'     => $d->booking->service->name,
                    'price'    => (float) $d->booking->service->price,
                    'duration' => $d->booking->service->duration,
                ] : null,
                'time_slot' => $d->booking->timeSlot ? [
                    'date'  => $d->booking->timeSlot->date,
                    'start' => $d->booking->timeSlot->start_time,
                    'end'   => $d->booking->timeSlot->end_time,
                ] : null,
            ] : null,

            'disputed_by_user' => $d->disputedByUser ? [
                'id'     => $d->disputedByUser->id,
                'name'   => $d->disputedByUser->name,
                'avatar' => $d->disputedByUser->avatar ? $d->disputedByUser->avatarUrl() : null,
            ] : null,
        ];

        if ($detailed) {
            $data['refund_amount']   = (float) ($d->refund_amount ?? 0);
            $data['penalty_amount']  = (float) ($d->penalty_amount ?? 0);
            $data['compensation_amount'] = (float) ($d->compensation_amount ?? 0);
            $data['resolution']      = $d->resolution;
            $data['resolved_at']     = $d->resolved_at?->toIso8601String();
            $data['admin_notes']     = $d->admin_notes;
            $data['attachments']     = $d->attachments ?? [];
            $data['responded_by_user'] = $d->respondedByUser ? [
                'id'   => $d->respondedByUser->id,
                'name' => $d->respondedByUser->name,
            ] : null;
            $data['resolved_by_user'] = $d->resolvedByUser ? [
                'id'   => $d->resolvedByUser->id,
                'name' => $d->resolvedByUser->name,
            ] : null;
        }

        return $data;
    }

    private function buildStats($user): array
    {
        $base = Dispute::forBarber($user->id);

        return [
            'total'      => (clone $base)->count(),
            'pending'    => (clone $base)->where('status', DisputedStatus::pending->value)->count(),
            'investigating' => (clone $base)->where('status', DisputedStatus::investigating->value)->count(),
            'awaiting'   => (clone $base)->where('status', DisputedStatus::awaitingResponse->value)->count(),
            'resolved'   => (clone $base)->where('status', DisputedStatus::resolved->value)->count(),
            'rejected'   => (clone $base)->where('status', DisputedStatus::rejected->value)->count(),
            'active'     => (clone $base)->active()->count(),
            'needs_response' => (clone $base)
                ->where('status', DisputedStatus::awaitingResponse->value)
                ->where('disputed_by_user_id', '!=', $user->id)
                ->count(),
        ];
    }
}
