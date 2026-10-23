import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import SearchComponent from "../../../Components/Search";
import PersianDatePicker from "../../../Components/PersianDatePicker";
import Pagination from "../Components/Pagination";
import ConfirmModal from "../Components/ConfirmModal";

import "../Assets/css/Finance.css";
import "../Assets/css/Transactions.css";
import "./Assets/css/Notification.css";

import {
    Bell,
    BellDot,
    CheckCheck,
    Filter,
    X,
    Trash2,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Info,
    CheckCircle,
    Clock,
    AlertCircle,
    AlertTriangle,
    Eye,
    ExternalLink,
    Mail,
    MailOpen,
    Calendar,
    Star,
    CreditCard,
    Shield,
    MessageSquare,
    XCircle,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../utils/dateHelpers";

// ============ آیکون‌ها بر اساس نوع ============
const typeIcons = {
    review_pending: Clock,
    review_approved: CheckCircle,
    review_rejected: XCircle,
    dispute_created: AlertTriangle,
    dispute_resolved: CheckCircle,
    settlement_request: CreditCard,
    settlement_completed: CheckCircle,
    booking_confirmed: Calendar,
    booking_cancelled: XCircle,
    payment_success: CheckCircle,
    payment_failed: XCircle,
    report_created: AlertCircle,
    system_alert: AlertCircle,
    system: Bell,
};

// ============ رنگ‌ها بر اساس نوع ============
const typeColors = {
    review_pending: { color: "#92400e", bg: "#fffbeb" },
    review_approved: { color: "#065f46", bg: "#ecfdf5" },
    review_rejected: { color: "#991b1b", bg: "#fef2f2" },
    dispute_created: { color: "#9a3412", bg: "#fff7ed" },
    dispute_resolved: { color: "#065f46", bg: "#ecfdf5" },
    settlement_request: { color: "#1e40af", bg: "#eff6ff" },
    settlement_completed: { color: "#065f46", bg: "#ecfdf5" },
    booking_confirmed: { color: "#1e40af", bg: "#eff6ff" },
    booking_cancelled: { color: "#991b1b", bg: "#fef2f2" },
    payment_success: { color: "#065f46", bg: "#ecfdf5" },
    payment_failed: { color: "#991b1b", bg: "#fef2f2" },
    report_created: { color: "#991b1b", bg: "#fef2f2" },
    system_alert: { color: "#9a3412", bg: "#fff7ed" },
    system: { color: "#6b7280", bg: "#f3f4f6" },
};

export default function NotificationsIndex({
    notifications,
    stats,
    filters,
    types = [],
}) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ["stats"] });
        }, 30000);
        return () => clearInterval(interval);
    }, []);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);

    const [localFilters, setLocalFilters] = useState({
        type: filters.type || "",
        filter: filters.filter || "",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
    });

    useEffect(() => {
        setLocalFilters({
            type: filters.type || "",
            filter: filters.filter || "",
            date_from: filters.date_from || "",
            date_to: filters.date_to || "",
        });
        setSearchTerm(filters.search || "");
    }, [filters]);

    const activeFiltersCount =
        Object.values(localFilters).filter(
            (v) => v !== null && v !== "" && v !== undefined,
        ).length + (searchTerm ? 1 : 0);

    const handleSearch = (query) => {
        setIsSearching(true);
        const merged = { ...localFilters, search: query };
        const cleaned = Object.fromEntries(
            Object.entries(merged).filter(
                ([, v]) => v !== null && v !== "" && v !== undefined,
            ),
        );
        router.get("/admin/notifications", cleaned, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
    };

    const applyFilters = (overrides = {}) => {
        const merged = { ...localFilters, search: searchTerm, ...overrides };
        const cleaned = Object.fromEntries(
            Object.entries(merged).filter(
                ([, v]) => v !== null && v !== "" && v !== undefined,
            ),
        );
        router.get("/admin/notifications", cleaned, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const clearFilters = () => {
        const empty = { type: "", filter: "", date_from: "", date_to: "" };
        setLocalFilters(empty);
        setSearchTerm("");
        router.get("/admin/notifications", {}, { preserveScroll: true });
    };

    const quickFilter = (filterValue) => {
        setLocalFilters((prev) => ({ ...prev, filter: filterValue }));
        applyFilters({ filter: filterValue });
    };

    const markAsRead = (id) => {
        router.patch(
            `/admin/notifications/${id}/read`,
            {},
            { preserveScroll: true },
        );
    };

    const deleteNotification = (id) => {
        if (confirm("اعلان حذف شود؟")) {
            router.delete(`/admin/notifications/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const markAllAsRead = () => {
        router.patch(
            "/admin/notifications/mark-all-read",
            {},
            { preserveScroll: true },
        );
    };

    const clearRead = () => {
        if (confirm("همه اعلان‌های خوانده‌شده حذف شوند؟")) {
            router.delete("/admin/notifications/clear-read", {
                preserveScroll: true,
            });
        }
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

    // ============ رندر اعلان ============
    const renderNotification = (n) => {
        const Icon = typeIcons[n.type] ?? Bell;
        const colors = typeColors[n.type] ?? typeColors.system;

        return (
            <div
                key={n.id}
                className={`notification-item ${n.is_read ? "read" : "unread"}`}
            >
                <div
                    className="notification-icon"
                    style={{ background: colors.bg, color: colors.color }}
                >
                    <Icon size={18} />
                </div>

                <div className="notification-content">
                    <div className="notification-header">
                        <div className="notification-title">
                            {n.title}
                            {!n.is_read && (
                                <span className="notification-unread-dot" />
                            )}
                        </div>
                        <span className="notification-date">
                            {formatFullDateTime(n.created_at)}
                        </span>
                    </div>

                    <p className="notification-message">{n.message}</p>

                    {n.action_url && n.action_text && (
                        <Link
                            href={n.action_url}
                            className="notification-action-link"
                        >
                            <ExternalLink size={12} />
                            {n.action_text}
                        </Link>
                    )}
                </div>

                <div className="notification-actions">
                    {!n.is_read && (
                        <button
                            type="button"
                            className="notification-action-btn read"
                            onClick={() => markAsRead(n.id)}
                            title="علامت به عنوان خوانده‌شده"
                        >
                            <MailOpen size={14} />
                        </button>
                    )}
                    <button
                        type="button"
                        className="notification-action-btn delete"
                        onClick={() => openDeleteModal(n)}
                        title="حذف"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <Head title="مرکز اعلان‌ها" />

            <div className="admin-finance-page">
                {/* هدر */}
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div className="finance-header-icon">
                            <Bell size={28} />
                        </div>
                        <div>
                            <h1>مرکز اعلان‌ها</h1>
                            <p>مشاهده و مدیریت همه اعلان‌های سیستم</p>
                        </div>
                    </div>
                    <div className="finance-header-actions">
                        {stats.unread > 0 && (
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={markAllAsRead}
                            >
                                <CheckCheck size={14} />
                                خواندن همه
                            </button>
                        )}
                        {stats.read > 0 && (
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={openClearReadModal}
                            >
                                <Trash2 size={14} />
                                پاک کردن خوانده‌ها
                            </button>
                        )}
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() =>
                                router.reload({
                                    only: ["notifications", "stats"],
                                })
                            }
                        >
                            <RefreshCw size={14} />
                            بروزرسانی
                        </button>
                    </div>
                </div>

                {/* آمار */}
                <div className="finance-stats-wrapper">
                    <div className="finance-stats-grid">
                        <div className="finance-stat-card blue">
                            <div className="stat-icon-box">
                                <Bell size={22} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">کل اعلان‌ها</span>
                                <span
                                    className="stat-value"
                                    style={{ color: "#1e40af" }}
                                >
                                    {toPersianNumber(stats.total ?? 0)}
                                    <span className="stat-currency">مورد</span>
                                </span>
                            </div>
                        </div>
                        <div className="finance-stat-card yellow">
                            <div className="stat-icon-box">
                                <BellDot size={22} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">خوانده‌نشده</span>
                                <span
                                    className="stat-value"
                                    style={{ color: "#92400e" }}
                                >
                                    {toPersianNumber(stats.unread ?? 0)}
                                    <span className="stat-currency">مورد</span>
                                </span>
                            </div>
                        </div>
                        <div className="finance-stat-card green">
                            <div className="stat-icon-box">
                                <CheckCircle size={22} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">خوانده‌شده</span>
                                <span
                                    className="stat-value"
                                    style={{ color: "#065f46" }}
                                >
                                    {toPersianNumber(stats.read ?? 0)}
                                    <span className="stat-currency">مورد</span>
                                </span>
                            </div>
                        </div>
                        <div className="finance-stat-card purple">
                            <div className="stat-icon-box">
                                <Calendar size={22} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">امروز</span>
                                <span
                                    className="stat-value"
                                    style={{ color: "#5b21b6" }}
                                >
                                    {toPersianNumber(stats.today ?? 0)}
                                    <span className="stat-currency">مورد</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* تب‌های سریع */}
                <div className="status-filters">
                    <button
                        type="button"
                        className={`filter-btn ${!localFilters.filter ? "active" : ""}`}
                        onClick={() => quickFilter("")}
                    >
                        همه
                        {stats.total > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.total)}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${localFilters.filter === "unread" ? "active" : ""}`}
                        onClick={() => quickFilter("unread")}
                    >
                        <Mail size={12} />
                        خوانده‌نشده
                        {stats.unread > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.unread)}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${localFilters.filter === "read" ? "active" : ""}`}
                        onClick={() => quickFilter("read")}
                    >
                        <MailOpen size={12} />
                        خوانده‌شده
                        {stats.read > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.read)}
                            </span>
                        )}
                    </button>
                </div>

                {/* Toolbar */}
                <div className="transactions-toolbar">
                    <SearchComponent
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onSearch={handleSearch}
                        placeholder="جستجو در عنوان یا متن اعلان..."
                        delay={500}
                        isLoading={isSearching}
                    />
                    <button
                        type="button"
                        className={`filter-toggle ${showFilters ? "active" : ""}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={14} />
                        فیلترها
                        {activeFiltersCount > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(activeFiltersCount)}
                            </span>
                        )}
                    </button>
                </div>

                {/* پنل فیلتر */}
                {showFilters && (
                    <div className="filters-panel">
                        <div className="filters-grid">
                            {/* <div className="filter-group">
                                <label>نوع اعلان</label>
                                <select
                                    className="filter-select"
                                    value={localFilters.type}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            type: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">همه</option>
                                    {types.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div> */}
                            <div className="filter-group">
                                <PersianDatePicker
                                    label="از تاریخ"
                                    value={localFilters.date_from}
                                    onChange={(v) =>
                                        setLocalFilters((p) => ({
                                            ...p,
                                            date_from: v,
                                        }))
                                    }
                                    placeholder="تاریخ شروع"
                                />
                            </div>
                            <div className="filter-group">
                                <PersianDatePicker
                                    label="تا تاریخ"
                                    value={localFilters.date_to}
                                    onChange={(v) =>
                                        setLocalFilters((p) => ({
                                            ...p,
                                            date_to: v,
                                        }))
                                    }
                                    placeholder="تاریخ پایان"
                                    minDate={localFilters.date_from || null}
                                />
                            </div>
                        </div>
                        <div className="filters-actions">
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={clearFilters}
                            >
                                <X size={14} />
                                پاک کردن
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => applyFilters()}
                            >
                                <CheckCircle size={14} />
                                اعمال فیلتر
                            </button>
                        </div>
                    </div>
                )}

                {/* لیست */}
                <div className="finance-card">
                    <div className="finance-card-header">
                        <div className="card-icon-box blue">
                            <Bell size={20} />
                        </div>
                        <h2>اعلان‌ها</h2>
                        <span className="permissions-count">
                            {toPersianNumber(notifications.total || 0)} مورد
                        </span>
                    </div>
                    {notifications.data.length === 0 ? (
                        <div className="empty-state-large">
                            <Bell size={48} />
                            <p>هیچ اعلانی با این فیلترها یافت نشد</p>
                            {activeFiltersCount > 0 && (
                                <button
                                    type="button"
                                    className="btn-ghost"
                                    onClick={clearFilters}
                                >
                                    <X size={14} />
                                    پاک کردن فیلترها
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="notifications-list">
                                {notifications.data.map(renderNotification)}
                            </div>
                            <Pagination
                                links={notifications.links}
                                only={notifications}
                            />
                        </>
                    )}
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

            <ConfirmModal
                isOpen={clearReadModal.isOpen}
                onClose={closeClearReadModal}
                onConfirm={handleConfirmClearRead}
                title="پاک کردن اعلان‌های خوانده‌شده"
                message={`آیا از پاک کردن ${toPersianNumber(stats.read)} اعلان خوانده‌شده مطمئن هستید؟`}
                confirmText="بله، پاک کن"
                cancelText="انصراف"
                type="danger"
                isLoading={clearReadModal.isLoading}
            >
                <div className="modal-warning-box">
                    <AlertTriangle size={16} />
                    <div>
                        <strong>هشدار: این عملیات غیرقابل بازگشت است</strong>
                        {toPersianNumber(stats.read)} اعلان خوانده‌شده برای
                        همیشه حذف خواهند شد. اعلان‌های خوانده‌نشده حفظ می‌شوند.
                    </div>
                </div>
            </ConfirmModal>
        </Layout>
    );
}
