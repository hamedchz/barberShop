// resources/js/Pages/Barber/Disputes/Index.jsx

import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import Pagination from "../Components/Pagination";

import "../Dashboard/Assets/css/BarberDashboard.css";
import "./Assets/css/BarberDisputes.css";

import {
    AlertTriangle,
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    Filter,
    X,
    Search,
    Calendar,
    ChevronLeft,
    ChevronRight,
    User,
    Scissors,
    ArrowRight,
    Eye,
    RefreshCw,
    AlertCircle,
    Shield,
    FileText,
    Info,
    Ban,
    UserCheck,
    Phone,
    DollarSign,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import {
    formatFullDateTime,
    formatFullDateWithoutTime,
} from "../../../utils/dateHelpers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";

const statusConfig = {
    pending: {
        label: "در انتظار بررسی",
        icon: Clock,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
    },
    investigating: {
        label: "در حال بررسی",
        icon: Search,
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#bfdbfe",
    },
    awaiting_response: {
        label: "در انتظار پاسخ",
        icon: MessageSquare,
        color: "#9a3412",
        bg: "#fff7ed",
        border: "#fed7aa",
    },
    resolved: {
        label: "حل شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#a7f3d0",
    },
    rejected: {
        label: "رد شده",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fecaca",
    },
    cancelled: {
        label: "لغو شده",
        icon: Ban,
        color: "#6b7280",
        bg: "#f3f4f6",
        border: "#e5e7eb",
    },
};

const tabs = [
    { key: "", label: "همه" },
    { key: "active", label: "فعال" },
    { key: "awaiting_response", label: "نیاز به پاسخ", urgent: true },
    { key: "resolved", label: "حل شده" },
];

export default function BarberDisputesIndex({
    disputes,
    stats,
    filters = {},
    types = [],
    statuses = [],
}) {
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || "");

    const activeTab = filters.status || "all";

    const setTab = (status) => {
        router.get(
            "/barber/disputes",
            {
                ...filters,
                status: status === "all" ? "" : status,
                page: 1,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            "/barber/disputes",
            { ...filters, search: searchTerm, page: 1 },
            { preserveScroll: true, preserveState: true },
        );
    };

    const applyFilters = (overrides = {}) => {
        router.get(
            "/barber/disputes",
            { ...filters, ...overrides, page: 1 },
            { preserveScroll: true, preserveState: true },
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        router.get("/barber/disputes", {}, { preserveScroll: true });
    };

    const renderDispute = (dispute) => {
        const config = statusConfig[dispute.status] ?? statusConfig.pending;
        const StatusIcon = config.icon;
        const needsResponse = dispute.can_respond;

        return (
            <div
                key={dispute.id}
                className={`barber-dispute-card ${needsResponse ? "needs-response" : ""}`}
            >
                {/* نوار وضعیت */}
                <div
                    className="barber-dispute-card-bar"
                    style={{ background: config.color }}
                />

                {/* هدر */}
                <div className="barber-dispute-card-header">
                    <div
                        className="barber-dispute-card-icon"
                        style={{ background: config.bg, color: config.color }}
                    >
                        <StatusIcon size={20} />
                    </div>
                    <div className="barber-dispute-card-header-content">
                        <div className="barber-dispute-card-title-row">
                            <h3 className="barber-dispute-card-title">
                                اعتراض #{toPersianNumber(dispute.id)}
                            </h3>
                            <span
                                className="barber-dispute-card-badge"
                                style={{
                                    color: config.color,
                                    background: config.bg,
                                    borderColor: config.border,
                                }}
                            >
                                <StatusIcon size={10} />
                                {config.label}
                            </span>
                            {needsResponse && (
                                <span className="barber-dispute-card-urgent">
                                    <AlertCircle size={10} />
                                    نیاز به پاسخ شما
                                </span>
                            )}
                        </div>
                        <p className="barber-dispute-card-subtitle">
                            <span className="barber-dispute-card-type">
                                <FileText size={11} />
                                {dispute.dispute_type_label}
                            </span>
                            <span className="barber-dispute-card-separator">
                                •
                            </span>
                            <span className="barber-dispute-card-date">
                                <Calendar size={11} />
                                {formatFullDateTime(dispute.created_at)}
                            </span>
                        </p>
                    </div>
                </div>

                {/* متن اعتراض */}
                <div className="barber-dispute-card-reason">
                    <AlertTriangle size={14} />
                    <p>{dispute.reason}</p>
                </div>

                {/* اطلاعات مشتری */}
                {dispute.booking?.customer && (
                    <div className="barber-dispute-card-customer">
                        <div className="barber-dispute-card-avatar">
                            {dispute.booking.customer.avatar ? (
                                <img
                                    src={dispute.booking.customer.avatar}
                                    alt={dispute.booking.customer.name}
                                />
                            ) : (
                                dispute.booking.customer.name
                                    ?.charAt(0)
                                    .toUpperCase() || "؟"
                            )}
                        </div>
                        <div className="barber-dispute-card-customer-info">
                            <span className="barber-dispute-card-customer-name">
                                {dispute.booking.customer.name}
                            </span>
                            <span className="barber-dispute-card-customer-role">
                                <User size={10} />
                                {dispute.disputed_by_label}
                            </span>
                        </div>
                    </div>
                )}

                {/* اطلاعات رزرو */}
                {dispute.booking && (
                    <div className="barber-dispute-card-booking">
                        <div className="barber-dispute-card-booking-row">
                            <Scissors size={12} />
                            <span>{dispute.booking.service?.name ?? "—"}</span>
                        </div>
                        {dispute.booking.time_slot && (
                            <div className="barber-dispute-card-booking-row">
                                <Calendar size={12} />
                                <span>
                                    {formatFullDateWithoutTime(
                                        dispute.booking.time_slot.date,
                                    )}
                                    {" — "}
                                    {toPersianNumber(
                                        dispute.booking.time_slot.start?.substring(
                                            0,
                                            5,
                                        ),
                                    )}
                                </span>
                            </div>
                        )}
                        <div className="barber-dispute-card-booking-row amount">
                            <DollarSign size={12} />
                            <span>
                                {toPersianNumber(
                                    dispute.booking.amount.toLocaleString(),
                                )}{" "}
                                تومان
                            </span>
                        </div>
                    </div>
                )}

                {/* پاسخ (اگه هست) */}
                {dispute.response && (
                    <div className="barber-dispute-card-response">
                        <div className="barber-dispute-card-response-header">
                            <MessageSquare size={12} />
                            <strong>پاسخ شما</strong>
                        </div>
                        <p>{dispute.response}</p>
                    </div>
                )}

                {/* اکشن‌ها */}
                <div className="barber-dispute-card-actions">
                    <Link
                        href={`/barber/disputes/${dispute.id}/show`}
                        className="barber-dispute-card-btn primary"
                    >
                        <Eye size={14} />
                        مشاهده جزئیات
                    </Link>

                    {needsResponse && (
                        <Link
                            href={`/barber/disputes/${dispute.id}`}
                            className="barber-dispute-card-btn urgent"
                        >
                            <MessageSquare size={14} />
                            پاسخ بده
                        </Link>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <Head title="اعتراضات" />

            <div className="barber-dashboard">
                {/* هدر */}
                <div className="barber-hero">
                    <div className="barber-hero-content">
                        <div className="barber-hero-greeting">
                            <h1 className="greeting-name">⚠️ اعتراضات</h1>
                        </div>
                        <p className="barber-hero-subtitle">
                            {stats.total > 0 ? (
                                <>
                                    {toPersianNumber(stats.total)} اعتراض ثبت
                                    شده
                                    {stats.needs_response > 0 && (
                                        <>
                                            {" — "}
                                            <strong
                                                style={{ color: "#ef4444" }}
                                            >
                                                {toPersianNumber(
                                                    stats.needs_response,
                                                )}{" "}
                                                نیاز به پاسخ شما
                                            </strong>
                                        </>
                                    )}
                                </>
                            ) : (
                                "هنوز اعتراضی ثبت نشده"
                            )}
                        </p>
                    </div>

                    <div className="barber-hero-actions">
                        <button
                            type="button"
                            className="barber-hero-btn"
                            onClick={() =>
                                router.reload({ only: ["disputes", "stats"] })
                            }
                        >
                            <RefreshCw size={16} />
                            بروزرسانی
                        </button>
                    </div>
                </div>

                {/* آمار */}
                <div className="barber-stats-grid">
                    <div className="barber-stat-card bookings">
                        <div className="barber-stat-icon bookings">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">
                                کل اعتراضات
                            </span>
                            <div className="barber-stat-value">
                                {toPersianNumber(stats.total)}
                                <span className="barber-stat-unit">مورد</span>
                            </div>
                        </div>
                    </div>

                    <div className="barber-stat-card wallet">
                        <div className="barber-stat-icon wallet">
                            <MessageSquare size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">
                                نیاز به پاسخ
                            </span>
                            <div
                                className="barber-stat-value"
                                style={{ color: "#ef4444" }}
                            >
                                {toPersianNumber(stats.needs_response)}
                                <span className="barber-stat-unit">مورد</span>
                            </div>
                        </div>
                    </div>

                    <div className="barber-stat-card revenue">
                        <div className="barber-stat-icon revenue">
                            <CheckCircle size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">حل شده</span>
                            <div className="barber-stat-value">
                                {toPersianNumber(stats.resolved)}
                                <span className="barber-stat-unit">مورد</span>
                            </div>
                        </div>
                    </div>

                    <div className="barber-stat-card rating">
                        <div className="barber-stat-icon rating">
                            <Clock size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">
                                در حال بررسی
                            </span>
                            <div className="barber-stat-value">
                                {toPersianNumber(
                                    stats.investigating + stats.pending,
                                )}
                                <span className="barber-stat-unit">مورد</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* تب‌ها */}
                <div className="barber-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key || "all"}
                            type="button"
                            className={`barber-tab ${
                                activeTab === (tab.key || "all") ? "active" : ""
                            } ${tab.urgent ? "urgent" : ""}`}
                            onClick={() => setTab(tab.key || "all")}
                        >
                            {tab.urgent && <AlertCircle size={12} />}

                            {tab.label}

                            {tab.key === "awaiting_response" &&
                                stats.needs_response > 0 && (
                                    <span className="barber-tab-badge">
                                        {toPersianNumber(stats.needs_response)}
                                    </span>
                                )}
                        </button>
                    ))}
                </div>

                {/* جستجو و فیلتر */}
                <div className="barber-search-bar">
                    <form
                        onSubmit={handleSearch}
                        className="barber-search-form"
                    >
                        <Search size={16} className="barber-search-icon" />
                        <input
                            type="text"
                            className="barber-search-input"
                            placeholder="جستجو در متن اعتراض، نام مشتری..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                className="barber-search-clear"
                                onClick={() => {
                                    setSearchTerm("");
                                    applyFilters({ search: "" });
                                }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </form>

                    <button
                        type="button"
                        className={`barber-filter-btn ${showFilters ? "active" : ""}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={14} />
                        فیلترها
                    </button>
                </div>

                {/* پنل فیلتر */}
                {showFilters && (
                    <div className="barber-card barber-filters-panel">
                        <div className="barber-filters-horizontal">
                            {/* آیکون و عنوان */}
                            <div className="barber-filters-title">
                                <Filter size={16} />
                                <span>فیلترها</span>
                            </div>

                            {/* نوع اعتراض */}
                            <div className="barber-filter-inline">
                                <label className="barber-filter-inline-label">
                                    نوع
                                </label>
                                <select
                                    className="barber-filter-inline-select"
                                    value={filters.type || ""}
                                    onChange={(e) =>
                                        applyFilters({ type: e.target.value })
                                    }
                                >
                                    <option value="">همه</option>
                                    {types.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* وضعیت */}
                            <div className="barber-filter-inline">
                                <label className="barber-filter-inline-label">
                                    وضعیت
                                </label>
                                <select
                                    className="barber-filter-inline-select"
                                    value={filters.status || ""}
                                    onChange={(e) =>
                                        applyFilters({ status: e.target.value })
                                    }
                                >
                                    <option value="">همه</option>
                                    {statuses.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* دکمه پاک کردن */}
                            <button
                                type="button"
                                className="barber-filter-inline-reset"
                                onClick={clearFilters}
                            >
                                <X size={14} />
                                پاک کردن
                            </button>
                        </div>
                    </div>
                )}

                {/* لیست */}
                <div className="barber-card">
                    <div className="barber-card-header">
                        <div className="barber-card-header-icon purple">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h2>لیست اعتراضات</h2>
                            <p>{toPersianNumber(disputes.total)} مورد</p>
                        </div>
                    </div>

                    {disputes.data.length === 0 ? (
                        <div className="barber-empty-state">
                            <div className="barber-empty-state-icon">
                                <CheckCircle
                                    size={48}
                                    style={{ color: "#10b981" }}
                                />
                            </div>
                            <h3>هیچ اعتراضی وجود ندارد</h3>
                            <p>
                                وقتی مشتری یا شما اعتراضی ثبت کنید، اینجا نمایش
                                داده می‌شود.
                            </p>
                        </div>
                    ) : (
                        <div className="barber-disputes-grid">
                            {disputes.data.map(renderDispute)}
                        </div>
                    )}

                    {/* Pagination */}
                    <Pagination links={disputes.links} only={disputes} />
                </div>
            </div>
        </Layout>
    );
}
