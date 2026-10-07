import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import EmptyList from "../Components/EmptyList";
import Pagination from "../Components/Pagination";
import Search from "../../../Components/Search";
import {
    AlertTriangle,
    Clock4,
    Search as SearchIcon,
    CheckCircle,
    XCircle,
    MessageSquare,
    Filter,
    X,
    User,
    Scissors,
    TrendingUp,
    Eye,
    Flame,
    Ban,
    Shield,
} from "lucide-react";
import { toJalaali } from "jalaali-js";
import { toPersianNumber } from "../../../utils/persianNumbers";
import {
    getDisputeTypeConfig,
    getDisputeStatusConfig,
} from "../../../constants/disputeTypes";

import "../Assets/css/AdminDisputes.css";
// ============ توابع کمکی ============
const formatJalaliDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const { jy, jm, jd } = toJalaali(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    );
    return toPersianNumber(
        `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`,
    );
};

const getRelativeTime = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diffInMinutes = Math.floor((now - d) / 1000 / 60);

    if (diffInMinutes < 1) return "همین الان";
    if (diffInMinutes < 60)
        return `${toPersianNumber(diffInMinutes)} دقیقه پیش`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${toPersianNumber(diffInHours)} ساعت پیش`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${toPersianNumber(diffInDays)} روز پیش`;
    return formatJalaliDate(date);
};

export default function DisputesIndex({ auth, disputes, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const disputesList = disputes.data || [];
    const hasActiveFilters =
        filters?.status ||
        filters?.role ||
        filters?.type ||
        filters?.search ||
        filters?.urgent;

    // ============ تب‌های وضعیت ============
    const statusTabs = [
        { id: "", label: "همه", count: stats.total, icon: Shield },
        {
            id: "urgent",
            label: "فوری",
            count: stats.urgent,
            icon: Flame,
            isUrgent: true,
        },
        {
            id: "pending",
            label: "در انتظار",
            count: stats.pending,
            icon: Clock4,
        },
        {
            id: "investigating",
            label: "در حال بررسی",
            count: stats.investigating,
            icon: SearchIcon,
        },
        {
            id: "awaiting_response",
            label: "در انتظار پاسخ",
            count: stats.awaiting_response,
            icon: MessageSquare,
        },
        {
            id: "resolved",
            label: "تایید شده",
            count: stats.resolved,
            icon: CheckCircle,
        },
        {
            id: "rejected",
            label: "رد شده",
            count: stats.rejected,
            icon: XCircle,
        },
    ];

    // ============ تغییر فیلتر ============
    const handleStatusFilter = (status) => {
        router.get(
            "/admin/disputes",
            {
                status: status === "urgent" ? "" : status,
                urgent: status === "urgent" ? 1 : 0,
                role: filters?.role,
                type: filters?.type,
                search: searchTerm,
                sort: filters?.sort,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleRoleFilter = (role) => {
        router.get(
            "/admin/disputes",
            {
                status: filters?.status,
                role: filters?.role === role ? "" : role,
                type: filters?.type,
                search: searchTerm,
                sort: filters?.sort,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleSearch = (term) => {
        setIsSearching(true);
        router.get(
            "/admin/disputes",
            {
                status: filters?.status,
                role: filters?.role,
                type: filters?.type,
                search: term,
                sort: filters?.sort,
                urgent: filters?.urgent ? 1 : 0,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        router.get(
            "/admin/disputes",
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <Layout>
            <Head title="مدیریت اعتراضات" />

            <div className="center-column">
                {/* ============ هدر ============ */}
                <div className="roles-page-header">
                    <div>
                        <h1 className="roles-page-title">مدیریت اعتراضات</h1>
                        <p
                            style={{
                                color: "#6b7280",
                                fontSize: "0.875rem",
                                marginTop: "0.25rem",
                            }}
                        >
                            {hasActiveFilters
                                ? `${disputes.total} نتیجه یافت شد`
                                : `${stats.total} اعتراض در سیستم`}
                        </p>
                    </div>
                </div>

                {/* ============ کارت‌های آمار ============ */}
                <div className="disputes-stats-grid">
                    <div className="dispute-stat-card urgent">
                        <div className="dispute-stat-icon">
                            <Flame size={20} />
                        </div>
                        <div>
                            <span className="dispute-stat-value">
                                {toPersianNumber(stats.urgent)}
                            </span>
                            <span className="dispute-stat-label">فوری</span>
                        </div>
                    </div>
                    <div className="dispute-stat-card pending">
                        <div className="dispute-stat-icon">
                            <Clock4 size={20} />
                        </div>
                        <div>
                            <span className="dispute-stat-value">
                                {toPersianNumber(stats.pending)}
                            </span>
                            <span className="dispute-stat-label">
                                در انتظار
                            </span>
                        </div>
                    </div>
                    <div className="dispute-stat-card investigating">
                        <div className="dispute-stat-icon">
                            <SearchIcon size={20} />
                        </div>
                        <div>
                            <span className="dispute-stat-value">
                                {toPersianNumber(stats.investigating)}
                            </span>
                            <span className="dispute-stat-label">
                                در حال بررسی
                            </span>
                        </div>
                    </div>
                    <div className="dispute-stat-card resolved">
                        <div className="dispute-stat-icon">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <span className="dispute-stat-value">
                                {toPersianNumber(stats.resolved)}
                            </span>
                            <span className="dispute-stat-label">
                                تایید شده
                            </span>
                        </div>
                    </div>
                </div>

                {/* ============ تب‌ها ============ */}
                <div className="disputes-tabs">
                    {statusTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive =
                            tab.id === "urgent"
                                ? filters?.urgent
                                : (filters?.status || "") === tab.id;
                        return (
                            <button
                                key={tab.id}
                                className={`disputes-tab ${isActive ? "active" : ""} ${tab.isUrgent ? "urgent" : ""}`}
                                onClick={() => handleStatusFilter(tab.id)}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className="tab-count">
                                        {toPersianNumber(tab.count)}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ============ نوار جستجو ============ */}
                <div className="disputes-toolbar">
                    <div className="disputes-search-wrapper">
                        <Search
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={handleSearch}
                            placeholder="جستجو در شماره رزرو، نام آرایشگر، مشتری یا متن اعتراض..."
                            delay={500}
                            isLoading={isSearching}
                        />
                    </div>
                    <div className="disputes-toolbar-actions">
                        <button
                            className={`filter-toggle-btn ${filters?.role ? "active" : ""}`}
                            onClick={() => handleRoleFilter("customer")}
                        >
                            <User size={16} />
                            اعتراض مشتری
                        </button>
                        <button
                            className={`filter-toggle-btn ${filters?.role === "barber" ? "active" : ""}`}
                            onClick={() => handleRoleFilter("barber")}
                        >
                            <Scissors size={16} />
                            اعتراض آرایشگر
                        </button>
                        {hasActiveFilters && (
                            <button
                                className="clear-filters-btn"
                                onClick={handleClearFilters}
                            >
                                <X size={16} />
                                پاک کردن
                            </button>
                        )}
                    </div>
                </div>

                {/* ============ لیست اعتراضات ============ */}
                {disputesList.length === 0 ? (
                    <div className="card" style={{ padding: "3rem" }}>
                        <EmptyList
                            title={
                                hasActiveFilters
                                    ? "نتیجه‌ای یافت نشد"
                                    : "اعتراضی وجود ندارد"
                            }
                            message={
                                hasActiveFilters
                                    ? "هیچ اعتراضی با فیلترهای انتخاب شده مطابقت ندارد."
                                    : "در حال حاضر هیچ اعتراضی در سیستم ثبت نشده است."
                            }
                        />
                    </div>
                ) : (
                    <div className="disputes-list">
                        {disputesList.map((dispute) => {
                            const typeConfig = getDisputeTypeConfig(
                                dispute.dispute_type,
                            );
                            const statusConfig = getDisputeStatusConfig(
                                dispute.status,
                            );
                            const TypeIcon = typeConfig.icon;
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div
                                    key={dispute.id}
                                    className={`dispute-card status-${dispute.status} ${dispute.is_urgent ? "urgent" : ""}`}
                                >
                                    {/* نوار بالا */}
                                    <div
                                        className={`dispute-card-stripe ${dispute.is_urgent ? "urgent" : ""}`}
                                    ></div>

                                    {/* Badge فوری */}
                                    {dispute.is_urgent && (
                                        <div className="dispute-urgent-badge">
                                            <Flame size={12} />
                                            فوری
                                        </div>
                                    )}

                                    <div className="dispute-card-content">
                                        {/* ستون ۱: معترض */}
                                        <div className="dispute-card-disputer">
                                            <div className="disputer-avatar-wrapper">
                                                <div className="disputer-avatar">
                                                    {dispute.disputed_by_user
                                                        ?.thumbnail ? (
                                                        <img
                                                            src={
                                                                dispute
                                                                    .disputed_by_user
                                                                    .thumbnail
                                                            }
                                                            alt={
                                                                dispute
                                                                    .disputed_by_user
                                                                    .name
                                                            }
                                                        />
                                                    ) : (
                                                        <span>
                                                            {dispute.disputed_by_user?.name
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <span
                                                    className={`disputer-role-badge ${dispute.disputed_by}`}
                                                >
                                                    {dispute.disputed_by ===
                                                    "customer" ? (
                                                        <User size={10} />
                                                    ) : (
                                                        <Scissors size={10} />
                                                    )}
                                                </span>
                                            </div>
                                            <div className="disputer-info">
                                                <span className="disputer-label">
                                                    {dispute.disputed_by ===
                                                    "customer"
                                                        ? "مشتری"
                                                        : "آرایشگر"}
                                                </span>
                                                <span className="disputer-name">
                                                    {
                                                        dispute.disputed_by_user
                                                            ?.name
                                                    }
                                                </span>
                                                <span className="disputer-time">
                                                    {getRelativeTime(
                                                        dispute.created_at,
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ستون ۲: جزئیات */}
                                        <div className="dispute-card-details">
                                            {/* شماره رزرو */}
                                            <div className="dispute-detail-row">
                                                <span className="detail-label">
                                                    رزرو:
                                                </span>
                                                <Link
                                                    href={`/admin/barbers/${dispute.booking.barber?.id}/bookings/${dispute.booking.id}`}
                                                    className="detail-link"
                                                >
                                                    #
                                                    {toPersianNumber(
                                                        dispute.booking.id,
                                                    )}
                                                </Link>
                                            </div>

                                            {/* نوع اعتراض */}
                                            <div className="dispute-detail-row">
                                                <TypeIcon size={14} />
                                                <span className="detail-value">
                                                    {typeConfig.label}
                                                </span>
                                            </div>

                                            {/* آرایشگر و مشتری */}
                                            {dispute.booking.barber && (
                                                <div className="dispute-detail-row">
                                                    <Scissors size={14} />
                                                    <span className="detail-value">
                                                        {
                                                            dispute.booking
                                                                .barber.name
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {dispute.booking.customer && (
                                                <div className="dispute-detail-row">
                                                    <User size={14} />
                                                    <span className="detail-value">
                                                        {
                                                            dispute.booking
                                                                .customer.name
                                                        }
                                                    </span>
                                                </div>
                                            )}

                                            {/* متن اعتراض */}
                                            <div className="dispute-card-reason">
                                                <span className="reason-label">
                                                    دلیل:
                                                </span>
                                                <p>
                                                    {dispute.reason.substring(
                                                        0,
                                                        100,
                                                    )}
                                                    {dispute.reason.length >
                                                        100 && "..."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* ستون ۳: وضعیت + عملیات */}
                                        <div className="dispute-card-actions">
                                            {/* Badge وضعیت */}
                                            <span
                                                className={`dispute-status-badge status-${dispute.status}`}
                                            >
                                                <StatusIcon size={12} />
                                                {statusConfig.label}
                                            </span>

                                            {/* مشاهده */}
                                            <Link
                                                href={`/admin/disputes/${dispute.id}`}
                                                className="dispute-view-btn"
                                            >
                                                <Eye size={14} />
                                                بررسی
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* صفحه‌بندی */}
                <Pagination links={disputes.links} />
            </div>
        </Layout>
    );
}
