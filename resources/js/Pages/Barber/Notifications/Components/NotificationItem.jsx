import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import {
    Bell,
    Calendar,
    CalendarX,
    Clock,
    Wallet,
    Scale,
    Trash2,
    Check,
    ChevronLeft,
    AlertTriangle,
} from "lucide-react";
import { formatFullDateTime } from "../../../../utils/dateHelpers";

import ConfirmModal from "../../../Admin/Components/ConfirmModal";
const ICON_MAP = {
    Calendar,
    CalendarX,
    Clock,
    Wallet,
    Scale,
    Bell,
};

export default function NotificationItem({ notification, counts }) {
    const [processing, setProcessing] = useState(false);

    const Icon = ICON_MAP[notification.icon] || Bell;

    const markAsRead = () => {
        if (processing) return;
        setProcessing(true);
        router.post(
            route("barber.notifications.mark-read", notification.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (processing) return;
        if (!confirm("حذف این اعلان؟")) return;

        setProcessing(true);
        router.delete(route("barber.notifications.destroy", notification.id), {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        notification: null,
        isLoading: false,
    });
    const openDeleteModal = (notification) => {
        setDeleteModal({
            isOpen: true,
            notification,
            isLoading: false,
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            notification: null,
            isLoading: false,
        });
    };

    const handleConfirmDelete = () => {
        if (!deleteModal.notification) return;

        setDeleteModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(`/admin/notifications/${deleteModal.notification.id}`, {
            preserveScroll: true,
            onSuccess: () => closeDeleteModal(),
            onError: () =>
                setDeleteModal((prev) => ({ ...prev, isLoading: false })),
        });
    };

    return (
        <>
            <div
                className={`notification-item ${notification.color} ${
                    notification.is_read ? "is-read" : "is-unread"
                }`}
            >
                {/* نشانگر خوانده‌نشده */}
                {!notification.is_read && (
                    <span className="notification-unread-dot" />
                )}

                {/* آیکون */}
                <div className={`notification-icon ${notification.color}`}>
                    <Icon size={20} />
                </div>

                {/* محتوا */}
                <div className="notification-content">
                    <div className="notification-header">
                        <h3 className="notification-title">
                            {notification.title}
                        </h3>
                        {!notification.is_read && (
                            <span className="notification-badge">جدید</span>
                        )}
                    </div>
                    <p className="notification-message">
                        {notification.message}
                    </p>
                    <span className="notification-date">
                        {formatFullDateTime(notification.created_at)}
                    </span>
                </div>

                {/* عملیات */}
                <div className="notification-actions">
                    {/* {notification.action_url && (
                    <Link
                        href={notification.action_url}
                        className="notification-action-link"
                        onClick={(e) => {
                            e.preventDefault();
                            handleClick(e);
                        }}
                    >
                        {notification.action_label || "مشاهده"}
                        <ChevronLeft size={14} />
                    </Link>
                )} */}

                    {!notification.is_read && (
                        <button
                            type="button"
                            className="notification-action-btn read"
                            onClick={() => markAsRead(notification)}
                            disabled={processing}
                            title="علامت‌گذاری خوانده‌شده"
                        >
                            <Check size={14} />
                        </button>
                    )}

                    <button
                        type="button"
                        className="notification-action-btn delete"
                        onClick={() => openDeleteModal(notification)}
                        disabled={processing}
                        title="حذف"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="⚠️ حذف اعلان"
                message="آیا از حذف این اعلان مطمئن هستید؟"
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                type="danger"
                isLoading={deleteModal.isLoading}
            >
                {deleteModal.notification && (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                        }}
                    >
                        {/* اطلاعات اعلان */}
                        <div
                            style={{
                                padding: "0.75rem",
                                background: "#f9fafb",
                                border: "1px solid #e5e7eb",
                                borderRadius: "0.5rem",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "0.8125rem",
                                    fontWeight: 800,
                                    color: "#1f2937",
                                    marginBottom: "0.375rem",
                                }}
                            >
                                {deleteModal.notification.title}
                            </div>
                            <div
                                style={{
                                    fontSize: "0.75rem",
                                    color: "#6b7280",
                                    lineHeight: 1.6,
                                }}
                            >
                                {deleteModal.notification.message}
                            </div>
                        </div>

                        {/* اخطار غیرقابل بازگشت */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "0.5rem",
                                padding: "0.75rem",
                                background: "#fef2f2",
                                border: "1.5px solid #fecaca",
                                borderRadius: "0.5rem",
                                fontSize: "0.75rem",
                                color: "#991b1b",
                                lineHeight: 1.7,
                                fontWeight: 600,
                            }}
                        >
                            <AlertTriangle
                                size={16}
                                style={{ flexShrink: 0, marginTop: "0.125rem" }}
                            />
                            <div>
                                <strong
                                    style={{
                                        display: "block",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    هشدار: این عملیات غیرقابل بازگشت است
                                </strong>
                                اعلان برای همیشه حذف می‌شود و امکان بازیابی وجود
                                ندارد.
                            </div>
                        </div>
                    </div>
                )}
            </ConfirmModal>
        </>
    );
}
