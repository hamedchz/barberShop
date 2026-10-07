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
                    'thumbnail' => $booking->user->avatar(),
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
            StickyAlert::alert('پاسخ شما ثبت شد', 'errsuccessor');
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
}
