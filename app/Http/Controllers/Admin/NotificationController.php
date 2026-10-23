<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = $user->notifications();

        // ============ فیلترها ============
        if ($type = $request->input('type')) {
            $query->where('data->type', $type);
        }

        if ($filter = $request->input('filter')) {
            if ($filter === 'unread') {
                $query->whereNull('read_at');
            } elseif ($filter === 'read') {
                $query->whereNotNull('read_at');
            }
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('data->title', 'like', "%{$search}%")
                    ->orWhere('data->message', 'like', "%{$search}%");
            });
        }

        $notifications = $query->latest()->paginate(33)->withQueryString();

        $notifications->through(fn($n) => $this->mapNotification($n));

        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => $notifications,
            'stats'         => $this->buildStats($user),
            'filters'       => [
                'type'      => $request->input('type', ''),
                'filter'    => $request->input('filter', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to'   => $request->input('date_to', ''),
                'search'    => $request->input('search', ''),
            ],
            'types' => $this->getNotificationTypes($user),
        ]);
    }

    public function show($id)
    {
        $notification = auth()->user()->notifications()->findOrFail($id);

        // Mark as read on view
        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return Inertia::render('Admin/Notifications/Show', [
            'notification' => $this->mapNotification($notification, detailed: true),
        ]);
    }

    public function markAsRead($id)
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return redirect()->back();
    }

    public function markAllAsRead()
    {
        auth()->user()->unreadNotifications->markAsRead();

        StickyAlert::toast('همه اعلان‌ها خوانده شدند.', 'success');

        return redirect()->back();
    }

    public function destroy($id)
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->delete();

        StickyAlert::toast('اعلان حذف شد.', 'success');

        return redirect()->back();
    }

    public function clearRead()
    {
        auth()->user()->readNotifications()->delete();

        StickyAlert::toast('اعلان‌های خوانده‌شده حذف شدند.', 'success');
        return redirect()->back();
    }

    // ============ آمار ============
    private function buildStats($user): array
    {
        return [
            'total'  => $user->notifications()->count(),
            'unread' => $user->unreadNotifications()->count(),
            'read'   => $user->readNotifications()->count(),
            'today'  => $user->notifications()
                ->whereDate('created_at', today())
                ->count(),
        ];
    }

    private function getNotificationTypes($user): array
    {
        return $user->notifications()
            ->reorder()
            ->selectRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '$.type')) as type")
            ->distinct()
            ->pluck('type')
            ->filter()
            ->map(fn($type) => [
                'value' => $type,
                'label' => $this->typeLabel($type),
            ])
            ->values()
            ->toArray();
    }

    private function typeLabel(?string $type): string
    {
        return match ($type) {
            'review_pending'      => 'نظر در انتظار',
            'review_approved'     => 'نظر تایید شده',
            'review_rejected'     => 'نظر رد شده',
            'dispute_created'     => 'اعتراض جدید',
            'dispute_resolved'    => 'اعتراض حل شده',
            'settlement_request'  => 'درخواست تسویه',
            'settlement_completed' => 'تسویه انجام شده',
            'booking_confirmed'   => 'رزرو تایید شده',
            'booking_cancelled'   => 'رزرو لغو شده',
            'payment_success'     => 'پرداخت موفق',
            'payment_failed'      => 'پرداخت ناموفق',
            'report_created'      => 'گزارش جدید',
            'system_alert'        => 'هشدار سیستم',
            default               => $type ?? 'سایر',
        };
    }

    private function mapNotification(DatabaseNotification $n, bool $detailed = false): array
    {
        $data = $n->data ?? [];

        $result = [
            'id'         => $n->id,
            'type'       => $data['type'] ?? 'system',
            'type_label' => $this->typeLabel($data['type'] ?? null),
            'title'      => $data['title'] ?? 'بدون عنوان',
            'message'    => $data['message'] ?? '',
            'icon'       => $data['icon'] ?? null,
            'color'      => $data['color'] ?? 'gray',
            'action_url' => $data['action_url'] ?? null,
            'action_text' => $data['action_text'] ?? null,
            'is_read'    => $n->read_at !== null,
            'read_at'    => $n->read_at?->toIso8601String(),
            'created_at' => $n->created_at?->toIso8601String(),
        ];

        if ($detailed) {
            $result['data'] = $data;
        }

        return $result;
    }
}
