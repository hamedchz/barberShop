<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * لیست اعلان‌های مشتری
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // فیلتر
        $filter = $request->input('filter', 'all'); // all | unread | read

        $query = $user->notifications();

        if ($filter === 'unread') {
            $query = $user->unreadNotifications();
        } elseif ($filter === 'read') {
            $query = $user->readNotifications();
        }

        $notifications = $query
            ->paginate(33)
            ->withQueryString()
            ->through(function ($notification) {
                $data = $notification->data;

                return [
                    'id' => $notification->id,
                    'type' => $this->getNotificationType($notification->type),
                    'title' => $data['title'] ?? 'اعلان',
                    'message' => $data['message'] ?? '',
                    'icon' => $data['icon'] ?? 'Bell',
                    'color' => $data['color'] ?? 'info',
                    'action_url' => $data['action_url'] ?? null,
                    'action_label' => $data['action_label'] ?? 'مشاهده',
                    'read_at' => $notification->read_at?->toIso8601String(),
                    'created_at' => $notification->created_at->toIso8601String(),
                    'is_read' => $notification->read_at !== null,
                ];
            });

        // شمارنده‌ها
        $counts = [
            'all' => $user->notifications()->count(),
            'unread' => $user->unreadNotifications()->count(),
            'read' => $user->readNotifications()->count(),
            'today'  => $user->notifications()
                ->whereDate('created_at', today())
                ->count(),
        ];

        return Inertia::render('Customer/Notifications/Index', [
            'notifications' => $notifications,
            'filter' => $filter,
            'counts' => $counts,
        ]);
    }

    /**
     * علامت‌گذاری یک اعلان به عنوان خوانده‌شده
     */
    public function markAsRead(string $id)
    {
        $user = Auth::user();

        $notification = $user->notifications()->where('id', $id)->first();

        if (!$notification) {
            StickyAlert::alert('اعلان یافت نشد.', 'error');
            return redirect()->back();
        }

        $notification->markAsRead();
        StickyAlert::toast('اعلان به خوانده شده تغییر وضعیت داد.', 'success');
        return redirect()->back();
    }

    /**
     * علامت‌گذاری همه به عنوان خوانده‌شده
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        $user->unreadNotifications->markAsRead();
        StickyAlert::toast('همه اعلان‌ها خوانده‌شده شدند.', 'success');
        return redirect()->back();
    }

    /**
     * حذف یک اعلان
     */
    public function destroy(string $id)
    {
        $user = Auth::user();

        $notification = $user->notifications()->where('id', $id)->first();

        if (!$notification) {
            StickyAlert::alert('اعلان یافت نشد.', 'error');
            return redirect()->back();
        }

        $notification->delete();
        StickyAlert::toast('اعلان حذف شد.', 'success');
        return redirect()->back();
    }

    /**
     * حذف همه اعلان‌ها
     */
    public function destroyAll()
    {
        $user = Auth::user();
        $user->notifications()->delete();
        StickyAlert::toast('همه اعلان‌ها حذف شدند.', 'success');
        return redirect()->back();
    }

    /**
     * استخراج نام کوتاه از کلاس notification
     */
    private function getNotificationType(string $fullClass): string
    {
        $parts = explode('\\', $fullClass);
        $className = end($parts);

        return match ($className) {
            'BookingConfirmedNotification' => 'booking_confirmed',
            'BookingCancelledNotification' => 'booking_cancelled',
            'BookingReminderNotification' => 'booking_reminder',
            'DisputeResponseNotification' => 'dispute_response',
            'WalletChargedNotification' => 'wallet_charged',
            default => 'general',
        };
    }
}
