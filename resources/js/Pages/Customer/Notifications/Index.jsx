import React, { useEffect, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../../Admin/Layouts/Layout";
import {
    Bell,
    BellOff,
    CheckCheck,
    Trash2,
    ArrowRight,
    AlertCircle,
    AlertTriangle,
} from "lucide-react";
import NotificationItem from "./Components/NotificationItem";
import NotificationEmpty from "./Components/NotificationEmpty";
import NotificationFilters from "./Components/NotificationFilters";
import "./Assets/css/Index.css";
import Pagination from "../../Admin/Components/Pagination";
import ConfirmModal from "../../Admin/Components/ConfirmModal";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function NotificationsIndex({ notifications, filter, counts }) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ["counts"] });
        }, 30000);
        return () => clearInterval(interval);
    }, []);
    const [processing, setProcessing] = useState(false);

    const handleMarkAllRead = () => {
        if (processing) return;
        setProcessing(true);
        router.post(
            route("customer.notifications.mark-all-read"),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    // delete all
    const [clearReadModal, setClearReadModal] = useState({
        isOpen: false,
        isLoading: false,
    });

    const openClearReadModal = () => {
        setClearReadModal({ isOpen: true, isLoading: false });
    };

    const closeClearReadModal = () => {
        setClearReadModal({ isOpen: false, isLoading: false });
    };

    const handleConfirmClearRead = () => {
        setClearReadModal((prev) => ({ ...prev, isLoading: true }));

        router.delete("/admin/notifications/clear-read/delete", {
            preserveScroll: true,
            onSuccess: () => closeClearReadModal(),
            onError: () =>
                setClearReadModal((prev) => ({ ...prev, isLoading: false })),
        });
    };
    return (
        <Layout>
            <Head title="اعلان‌های من" />

            <div className="notifications-page">
                {/* هدر */}
                <div className="notifications-header">
                    <div className="notifications-header-content">
                        <div className="notifications-header-icon">
                            <Bell size={28} />
                        </div>
                        <div>
                            <h1 className="notifications-title">
                                اعلان‌های من
                            </h1>
                            <p className="notifications-subtitle">
                                {counts.unread > 0
                                    ? `${counts.unread} اعلان خوانده‌نشده دارید`
                                    : "همه اعلان‌ها خوانده شده‌اند"}
                            </p>
                        </div>
                    </div>

                    <div className="notifications-header-actions">
                        {counts.unread > 0 && (
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={handleMarkAllRead}
                                disabled={processing}
                            >
                                <CheckCheck size={16} />
                                خواندن همه
                            </button>
                        )}
                        {counts.all > 0 && (
                            <button
                                type="button"
                                className="btn-danger"
                                onClick={openClearReadModal}
                                disabled={processing}
                            >
                                <Trash2 size={16} />
                                حذف همه
                            </button>
                        )}
                    </div>
                </div>

                {/* فیلترها */}
                <NotificationFilters filter={filter} counts={counts} />

                {/* لیست اعلان‌ها */}
                {notifications.data.length > 0 ? (
                    <>
                        <div className="notifications-list">
                            {notifications.data.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    counts={counts}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {notifications.last_page > 1 && (
                            <div className="notifications-pagination">
                                <Pagination
                                    links={notifications.links}
                                    only={notifications}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <NotificationEmpty filter={filter} />
                )}
            </div>

            <ConfirmModal
                isOpen={clearReadModal.isOpen}
                onClose={closeClearReadModal}
                onConfirm={handleConfirmClearRead}
                title="پاک کردن اعلان‌های خوانده‌شده"
                message={`آیا از پاک کردن ${toPersianNumber(counts.read)} اعلان خوانده‌شده مطمئن هستید؟`}
                confirmText="بله، پاک کن"
                cancelText="انصراف"
                type="danger"
                isLoading={clearReadModal.isLoading}
            >
                <div className="modal-warning-box">
                    <AlertTriangle size={16} />
                    <div>
                        <strong>هشدار: این عملیات غیرقابل بازگشت است</strong>
                        {toPersianNumber(counts.read)} اعلان خوانده‌شده برای
                        همیشه حذف خواهند شد. اعلان‌های خوانده‌نشده حفظ می‌شوند.
                    </div>
                </div>
            </ConfirmModal>
        </Layout>
    );
}
