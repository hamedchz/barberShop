<?php

namespace App\Http\Controllers\Customer;

use App\Enums\Casts\DisputedBy;
use App\Http\Controllers\Controller;
use App\Notifications\DisputeEditedByCustomer;
use Illuminate\Http\Request;
use App\Enums\Casts\DisputedStatus;
use App\Enums\Casts\DisputeTypes;
use App\Models\Dispute;
use App\Models\User;
use App\Notifications\DisputeRespondedByCustomer;
use App\Supports\StickyAlert;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DisputeController extends Controller
{

    public function show(Dispute $dispute)
    {
        abort_unless(
            $dispute->booking->user_id === auth()->id(),
            403
        );

        $dispute->load([
            'booking.barber:id,name,avatar',
            'booking.service:id,name,price',
            'disputedByUser:id,name,avatar',
            'respondedByUser:id,name,avatar',
            'resolvedByUser:id,name',
            'adminRequestBy:id,name',
        ]);

        // ============ محاسبه دسترسی‌ها ============
        $canEditDispute = false;
        $canDeleteDispute = false;
        $canRespondDispute = false;
        $editHoursRemaining = null;

        if ($dispute->disputed_by_user_id === auth()->id()) {
            if ($dispute->status->value === DisputedStatus::pending->value) {
                $hoursSinceCreation = $dispute->created_at->diffInHours(now());
                $hoursRemaining = 2 - $hoursSinceCreation;

                if ($hoursRemaining > 0) {
                    $canEditDispute = true;
                    $canDeleteDispute = true;
                    $editHoursRemaining = $hoursRemaining;
                }
            }

            if ($dispute->status->value === DisputedStatus::awaitingResponse->value) {
                $canRespondDispute = true;
            }
        }

        return Inertia::render('Customer/Disputes/Show', [
            'dispute' => [
                'id' => $dispute->id,
                'booking_id' => $dispute->booking_id,
                'dispute_type' => $dispute->dispute_type?->value,
                'dispute_type_label' => $dispute->dispute_type?->label(),
                'reason' => $dispute->reason,
                'status' => $dispute->status?->value,
                'status_label' => $dispute->status?->label(),
                'status_color' => $this->getStatusColor($dispute->status),
                'disputed_by' => $dispute->disputed_by?->value,
                'disputed_by_user' => [
                    'id' => $dispute->disputedByUser?->id,
                    'name' => $dispute->disputedByUser?->name,
                    'avatar' => $dispute->disputedByUser?->avatarUrl(),
                ],
                'response' => $dispute->response,
                'responded_at' => $dispute->responded_at?->toIso8601String(),
                'responded_by_user' => $dispute->respondedByUser ? [
                    'id' => $dispute->respondedByUser->id,
                    'name' => $dispute->respondedByUser->name,
                    'avatar' => $dispute->respondedByUser->avatarUrl(),
                ] : null,
                'resolution' => $dispute->resolution,
                'resolved_at' => $dispute->resolved_at?->toIso8601String(),
                'resolved_by_user' => $dispute->resolvedByUser ? [
                    'id' => $dispute->resolvedByUser->id,
                    'name' => $dispute->resolvedByUser->name,
                ] : null,
                'refund_amount' => (float) ($dispute->refund_amount ?? 0),
                'penalty_amount' => (float) ($dispute->penalty_amount ?? 0),
                'compensation_amount' => (float) ($dispute->compensation_amount ?? 0),
                // 'attachments' => $dispute->attachments ?? [],
                'created_at' => $dispute->created_at->toIso8601String(),
                'admin_notes' => $dispute->admin_notes,
                'admin_request_message' => $dispute->admin_request_message,
                'admin_request_at' => $dispute->admin_request_at?->toIso8601String(),
                'attachments' => collect($dispute->attachments ?? [])
                    ->map(fn($path) => [
                        'path' => $path,
                        'url'  => asset('storage/' . $path),
                        'name' => basename($path),
                    ])
                    ->values()
                    ->toArray(),
            ],
            'booking' => [
                'id' => $dispute->booking->id,
                'booking_code' => $dispute->booking->booking_code,
                'service_name' => $dispute->booking->service?->name,
                'service_price' => (float) ($dispute->booking->service?->price ?? 0),
                'barber' => [
                    'name' => $dispute->booking->barber?->name,
                    'avatar' => $dispute->booking->barber?->avatarUrl(),
                ],
            ],
            'permissions' => [
                'can_edit' => $canEditDispute,
                'can_delete' => $canDeleteDispute,
                'can_respond' => $canRespondDispute,
                'edit_hours_remaining' => $editHoursRemaining,
            ],
            // فقط انواع اعتراض مشتری
            'disputeTypes' => collect(DisputeTypes::cases())
                ->filter(fn($t) => in_array($t->disputedBy(), ['customer', 'both']))
                ->map(fn($t) => [
                    'value' => $t->value,
                    'label' => $t->label(),
                ])
                ->values(),
        ]);
    }
    public function edit(Dispute $dispute)
    {


        // ============ بررسی مالکیت ============
        if ($dispute->disputed_by_user_id !== auth()->id()) {
            abort(403, 'این اعتراض متعلق به شما نیست.');
        }

        // بررسی نقش
        if ($dispute->disputed_by->value !== DisputedBy::customer->value) {
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
                    'barber:id,name,avatar,slug,specialty',
                    'service:id,name,image,duration,price',
                    'timeSlot:id,date,start_time,end_time',
                ]);
            },
        ]);

        $booking = $dispute->booking;

        return Inertia::render('Customer/Disputes/Edit', [
            'dispute' => [
                'id' => $dispute->id,
                'booking_id' => $dispute->booking_id,
                'dispute_type' => $dispute->dispute_type,
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

                'barber' => $booking->barber ? [
                    'id' => $booking->barber->id,
                    'name' => $booking->barber->name,
                    'avatar' => $booking->barber->avatar,
                    'thumbnail' => $booking->barber->avatarUrl(),
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
                    'price' => (float) $booking->service->price,
                ] : null,
            ],
        ]);
    }

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
                            new DisputeEditedByCustomer($dispute)
                        );
                    });
            } catch (\Exception $e) {
                Log::warning('Dispute edit notification failed', [
                    'dispute_id' => $dispute->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // ============ لاگ ============
            (new \App\Models\Log())->storeLog(
                $dispute->booking_id,
                'customer_edited_dispute',
                "ویرایش اعتراض #{$dispute->id} توسط مشتری"
            );

            DB::commit();
            StickyAlert::alert('اعتراض شما با موفقیت بروزرسانی شد', 'success');
            return to_route('customer.bookings.show', $dispute->booking_id);
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
            (new \App\Models\Log())->storeLog(
                $dispute->booking_id,
                'customer_deleted_dispute',
                "حذف اعتراض #{$dispute->id} توسط مشتری"
            );

            DB::commit();
            StickyAlert::alert('اعتراض شما حذف شد', 'success');
            return to_route('customer.bookings.show', $dispute->booking_id);
        } catch (\Exception $e) {
            DB::rollBack();
            StickyAlert::alert('خطا در حذف اعتراض', 'error');
            return redirect()->back();
        }
    }
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

            // ============ Notification ============
            try {
                User::role(['سوپر ادمین'])
                    ->get()
                    ->each(function ($admin) use ($dispute) {
                        $admin->notify(
                            new DisputeRespondedByCustomer($dispute)
                        );
                    });
            } catch (\Exception $e) {
                Log::warning('Response notification failed', [
                    'dispute_id' => $dispute->id,
                ]);
            }

            DB::commit();
            StickyAlert::alert('پاسخ شما ثبت شد', 'success');
            if ($request->has('from_disputes_show') && $request->boolean('from_disputes_show')) {
                return redirect()->back();
            }
            return to_route('customer.bookings.show', $dispute->booking_id);
        } catch (\Exception $e) {
            DB::rollBack();
            StickyAlert::alert('خطا در ثبت پاسخ', 'error');
            return redirect()->back();
        }
    }


    private function getStatusColor(?DisputedStatus $status): string
    {
        return match ($status?->value) {
            DisputedStatus::pending->value => 'warning',
            DisputedStatus::investigating->value => 'info',
            DisputedStatus::awaitingResponse->value => 'warning',
            DisputedStatus::resolved->value => 'primary',
            DisputedStatus::rejected->value => 'danger',
            DisputedStatus::cancelled->value => 'gray',
            default => 'gray',
        };
    }
}
