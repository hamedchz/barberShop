// resources/js/Pages/Admin/Reviews/Index.jsx

import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import SearchComponent from "../../../Components/Search";
import PersianDatePicker from "../../../Components/PersianDatePicker";
import RejectReviewModal from "./Components/RejectReviewModal";
import ApproveReviewModal from "./Components/ApproveReviewModal";
import DeleteReviewModal from "./Components/DeleteReviewModal";
import RestoreReviewModal from "./Components/RestoreReviewModal";
import Pagination from "../Components/Pagination";

import "../Assets/css/Finance.css";
import "../Assets/css/Transactions.css";
import "./Assets/css/Review.css";

import {
    Star,
    Filter,
    X,
    User,
    RefreshCw,
    TrendingUp,
    CheckCircle,
    Clock,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Info,
    MessageSquare,
    Trash2,
    RotateCcw,
    AlertTriangle,
    ThumbsUp,
    ThumbsDown,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../utils/dateHelpers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";

const statusConfig = {
    pending: {
        label: "در انتظار",
        icon: Clock,
        color: "#92400e",
        bg: "#fffbeb",
    },
    approved: {
        label: "تایید شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
    },
    rejected: {
        label: "رد شده",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
    },
};

export default function ReviewsIndex({
    reviews,
    filters,
    stats,
    statuses = [],
    barbers = [],
}) {
    const [showFilters, setShowFilters] = useState(false);
    // const [selectedStat, setSelectedStat] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);

    // ============ Modals ============
    const [approveModal, setApproveModal] = useState({
        isOpen: false,
        review: null,
        isLoading: false,
    });
    const [rejectModal, setRejectModal] = useState({
        isOpen: false,
        review: null,
        isLoading: false,
    });
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        review: null,
        isLoading: false,
    });

    const [restoreModal, setRestoreModal] = useState({
        isOpen: false,
        review: null,
        isLoading: false,
    });

    const [localFilters, setLocalFilters] = useState({
        status: filters.status || "",
        barber_id: filters.barber_id || "",
        rating: filters.rating || "",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
    });

    useEffect(() => {
        setLocalFilters({
            status: filters.status || "",
            barber_id: filters.barber_id || "",
            rating: filters.rating || "",
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
        router.get("/admin/reviews", cleaned, {
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
        router.get("/admin/reviews", cleaned, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const clearFilters = () => {
        const empty = {
            status: "",
            barber_id: "",
            rating: "",
            date_from: "",
            date_to: "",
        };
        setLocalFilters(empty);
        setSearchTerm("");
        router.get("/admin/reviews", {}, { preserveScroll: true });
    };

    const activeTab = localFilters.status || "all";
    const quickFilter = (status) => {
        setLocalFilters((prev) => ({ ...prev, status }));
        applyFilters({ status });
    };

    // ============ آمار ============
    const statCards = [
        {
            key: "total",
            variant: "purple",
            title: "کل نظرات",
            icon: MessageSquare,
            color: "#5b21b6",
            bg: "#f5f3ff",
            border: "#ddd6fe",
            amount: stats.total ?? 0,
            unit: "مورد",
            isCount: true,
            description: "تعداد همه نظرات (شامل حذف‌شده)",
            breakdown: [],
            actionLink: null,
        },
        {
            key: "pending",
            variant: "yellow",
            title: "در انتظار",
            icon: Clock,
            color: "#92400e",
            bg: "#fffbeb",
            border: "#fde68a",
            amount: stats.pending ?? 0,
            unit: "مورد",
            isCount: true,
            description: "نظرات در انتظار بررسی",
            breakdown: [],
            actionLink: {
                label: "مشاهده در انتظار",
                href: "/admin/reviews?status=pending",
            },
        },
        {
            key: "approved",
            variant: "green",
            title: "تایید شده",
            icon: ThumbsUp,
            color: "#065f46",
            bg: "#ecfdf5",
            border: "#a7f3d0",
            amount: stats.approved ?? 0,
            unit: "مورد",
            isCount: true,
            description: "نظرات تاییدشده",
            breakdown: [
                {
                    label: "میانگین امتیاز",
                    value: stats.avg_rating ?? 0,
                    isCount: true,
                },
            ],
            actionLink: {
                label: "مشاهده تاییدشده",
                href: "/admin/reviews?status=approved",
            },
        },
        {
            key: "rejected",
            variant: "red",
            title: "رد شده",
            icon: ThumbsDown,
            color: "#991b1b",
            bg: "#fef2f2",
            border: "#fecaca",
            amount: stats.rejected ?? 0,
            unit: "مورد",
            isCount: true,
            description: "نظرات ردشده",
            breakdown: [],
            actionLink: {
                label: "مشاهده ردشده",
                href: "/admin/reviews?status=rejected",
            },
        },
        {
            key: "deleted",
            variant: "gray",
            title: "حذف شده",
            icon: Trash2,
            color: "#6b7280",
            bg: "#f3f4f6",
            border: "#e5e7eb",
            amount: stats.deleted ?? 0,
            unit: "مورد",
            isCount: true,
            description: "نظرات حذف‌شده (قابل بازیابی)",
            breakdown: [],
            actionLink: {
                label: "مشاهده حذف‌شده‌ها",
                href: "/admin/reviews?status=deleted",
            },
        },
        {
            key: "today_count",
            variant: "blue",
            title: "امروز",
            icon: RefreshCw,
            color: "#1e40af",
            bg: "#eff6ff",
            border: "#bfdbfe",
            amount: stats.today_count ?? 0,
            unit: "مورد",
            isCount: true,
            description: "نظرات ثبت‌شده امروز",
            breakdown: [],
            actionLink: null,
        },
    ];

    const renderStats = () => (
        <div className="finance-stats-wrapper">
            <div className="finance-stats-grid">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.key}
                            className={`finance-stat-card ${card.variant}`}
                            style={{ cursor: "pointer" }}
                            tabIndex={0}
                        >
                            <div
                                className="stat-icon-box"
                                style={{
                                    background: card.bg,
                                    color: card.color,
                                }}
                            >
                                <Icon size={22} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">{card.title}</span>
                                <span
                                    className="stat-value"
                                    style={{ color: card.color }}
                                >
                                    {card.isCount
                                        ? toPersianNumber(card.amount)
                                        : formatCompactNumber(card.amount)}
                                    <span className="stat-currency">
                                        {card.unit}
                                    </span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // ============ رندر هر نظر ============
    const renderReview = (r) => {
        const statConfig = statusConfig[r.status] ?? statusConfig.pending;
        const StatIcon = statConfig.icon;

        const isCommentLong = (r.comment?.length ?? 0) > 200;
        const displayComment = isCommentLong
            ? r.comment.substring(0, 200) + "..."
            : r.comment;

        return (
            <div
                key={r.id}
                className="admin-transaction-item"
                style={{
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    alignItems: "flex-start",
                }}
            >
                <div
                    className="transaction-icon"
                    style={{
                        background: statConfig.bg,
                        color: statConfig.color,
                    }}
                >
                    <StatIcon size={18} />
                </div>

                <div
                    className="transaction-content"
                    style={{ flex: "1 1 60%", minWidth: 0, overflow: "hidden" }}
                >
                    <div
                        className="transaction-user"
                        style={{ flexWrap: "wrap", gap: "0.375rem" }}
                    >
                        <span style={{ fontWeight: 800 }}>
                            {r.user?.name ?? "—"}
                        </span>
                        <span
                            className={`transaction-status-badge ${r.status}`}
                        >
                            <StatIcon size={10} />
                            {statConfig.label}
                        </span>
                        {r.is_deleted && (
                            <span
                                className="transaction-flag"
                                style={{
                                    background: "#f3f4f6",
                                    color: "#6b7280",
                                }}
                            >
                                <Trash2 size={10} />
                                حذف شده
                            </span>
                        )}
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.125rem",
                            }}
                        >
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    size={12}
                                    fill={i <= r.rating ? "#fbbf24" : "#e5e7eb"}
                                    color={
                                        i <= r.rating ? "#fbbf24" : "#e5e7eb"
                                    }
                                />
                            ))}
                            <span
                                style={{
                                    fontWeight: 800,
                                    color: "#92400e",
                                    marginRight: "0.25rem",
                                    fontSize: "0.6875rem",
                                }}
                            >
                                {toPersianNumber(r.rating)}/۵
                            </span>
                        </span>
                    </div>

                    <div
                        className="transaction-type"
                        style={{ marginTop: "0.25rem" }}
                    >
                        آرایشگر: {r.barber?.name ?? "—"}
                        <span
                            style={{
                                marginRight: "0.5rem",
                                fontSize: "0.625rem",
                                color: "#9ca3af",
                            }}
                        >
                            {formatFullDateTime(r.created_at)}
                        </span>
                    </div>

                    {r.comment && (
                        <div className="review-comment-box">
                            <p className="review-comment-text">
                                {displayComment}
                            </p>
                            {isCommentLong && (
                                <Link
                                    href={`/admin/reviews/${r.id}/show`}
                                    className="review-comment-more"
                                >
                                    مشاهده کامل
                                    <ChevronLeft size={12} />
                                </Link>
                            )}
                        </div>
                    )}

                    {r.moderation_note && (
                        <div className="review-moderation-note">
                            <strong>یادداشت ادمین:</strong> {r.moderation_note}
                        </div>
                    )}
                    {r.rejection_reason && (
                        <div className="review-rejection-note">
                            <strong>دلیل رد:</strong> {r.rejection_reason}
                        </div>
                    )}
                </div>

                {/* ============ اکشن‌ها (compact) ============ */}
                <div className="review-actions-compact">
                    <Link
                        href={`/admin/reviews/${r.id}/show`}
                        className="review-action-btn-compact view"
                        title="مشاهده جزئیات"
                    >
                        <Info size={11} />
                        <span>جزئیات</span>
                    </Link>

                    {/* pending: تایید + رد */}
                    {r.status === "pending" && !r.is_deleted && (
                        <>
                            <button
                                type="button"
                                className="review-action-btn-compact approve"
                                onClick={() =>
                                    setApproveModal({
                                        isOpen: true,
                                        review: r,
                                        isLoading: false,
                                    })
                                }
                                title="تایید نظر"
                            >
                                <CheckCircle size={11} />
                                <span>تایید</span>
                            </button>
                            <button
                                type="button"
                                className="review-action-btn-compact reject"
                                onClick={() =>
                                    setRejectModal({
                                        isOpen: true,
                                        review: r,
                                        isLoading: false,
                                    })
                                }
                                title="رد نظر"
                            >
                                <XCircle size={11} />
                                <span>رد</span>
                            </button>
                        </>
                    )}

                    {/* approved: تغییر به رد */}
                    {r.status === "approved" && !r.is_deleted && (
                        <button
                            type="button"
                            className="review-action-btn-compact change"
                            onClick={() =>
                                setRejectModal({
                                    isOpen: true,
                                    review: r,
                                    isLoading: false,
                                })
                            }
                            title="تغییر تصمیم به رد"
                        >
                            <RefreshCw size={11} />
                            <span>← رد</span>
                        </button>
                    )}

                    {/* rejected: تغییر به تایید */}
                    {r.status === "rejected" && !r.is_deleted && (
                        <button
                            type="button"
                            className="review-action-btn-compact change"
                            onClick={() =>
                                setApproveModal({
                                    isOpen: true,
                                    review: r,
                                    isLoading: false,
                                })
                            }
                            title="تغییر تصمیم به تایید"
                        >
                            <RefreshCw size={11} />
                            <span>← تایید</span>
                        </button>
                    )}

                    {/* حذف */}
                    {!r.is_deleted && (
                        <button
                            type="button"
                            className="review-action-btn-compact delete"
                            onClick={() =>
                                setDeleteModal({
                                    isOpen: true,
                                    review: r,
                                    isLoading: false,
                                })
                            }
                            title="حذف نظر"
                        >
                            <Trash2 size={11} />
                        </button>
                    )}

                    {/* بازیابی */}
                    {r.is_deleted && (
                        <button
                            type="button"
                            className="review-action-btn-compact restore"
                            onClick={() =>
                                setRestoreModal({
                                    isOpen: true,
                                    review: r,
                                    isLoading: false,
                                })
                            }
                            title="بازیابی نظر"
                        >
                            <RotateCcw size={11} />
                            <span>بازیابی</span>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <Head title="مدیریت نظرات" />

            <div className="admin-finance-page">
                {/* هدر */}
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div className="finance-header-icon">
                            <MessageSquare size={28} />
                        </div>
                        <div>
                            <h1>مدیریت نظرات</h1>
                            <p>بررسی، تایید و رد نظرات مشتریان</p>
                        </div>
                    </div>
                    <div className="finance-header-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() =>
                                router.reload({ only: ["reviews", "stats"] })
                            }
                        >
                            <RefreshCw size={14} />
                            بروزرسانی
                        </button>
                    </div>
                </div>

                {/* آمار */}
                {renderStats()}

                {/* تب‌های سریع */}
                <div className="status-filters">
                    <button
                        type="button"
                        className={`filter-btn ${activeTab === "all" ? "active" : ""}`}
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
                        className={`filter-btn ${activeTab === "pending" ? "active" : ""}`}
                        onClick={() => quickFilter("pending")}
                    >
                        <Clock size={12} />
                        در انتظار
                        {stats.pending > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.pending)}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${activeTab === "approved" ? "active" : ""}`}
                        onClick={() => quickFilter("approved")}
                    >
                        <CheckCircle size={12} />
                        تایید شده
                        {stats.approved > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.approved)}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${activeTab === "rejected" ? "active" : ""}`}
                        onClick={() => quickFilter("rejected")}
                    >
                        <XCircle size={12} />
                        رد شده
                        {stats.rejected > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.rejected)}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${activeTab === "deleted" ? "active" : ""}`}
                        onClick={() => quickFilter("deleted")}
                    >
                        <Trash2 size={12} />
                        حذف شده
                        {stats.deleted > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.deleted)}
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
                        placeholder="جستجو در متن نظر، نام مشتری، آرایشگر..."
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
                            <div className="filter-group">
                                <label>وضعیت</label>
                                <select
                                    className="filter-select"
                                    value={localFilters.status}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            status: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">همه</option>
                                    {statuses.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                    <option value="deleted">حذف شده</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>امتیاز</label>
                                <select
                                    className="filter-select"
                                    value={localFilters.rating}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            rating: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">همه</option>
                                    {[5, 4, 3, 2, 1].map((r) => (
                                        <option key={r} value={r}>
                                            {toPersianNumber(r)} ستاره
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                        <div className="card-icon-box yellow">
                            <MessageSquare size={20} />
                        </div>
                        <h2>نظرات</h2>
                        <span className="permissions-count">
                            {toPersianNumber(reviews.total || 0)} مورد
                        </span>
                    </div>
                    {reviews.data.length === 0 ? (
                        <div className="empty-state-large">
                            <MessageSquare size={48} />
                            <p>هیچ نظری با این فیلترها یافت نشد</p>
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
                            <div className="admin-transactions-list">
                                {reviews.data.map(renderReview)}
                            </div>
                            <Pagination
                                links={reviews.links}
                                only={["reviews"]}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            {/* <StatDetailModal
                isOpen={!!selectedStat}
                onClose={() => setSelectedStat(null)}
                config={selectedStat}
            /> */}

            <ApproveReviewModal
                isOpen={approveModal.isOpen}
                review={approveModal.review}
                isLoading={approveModal.isLoading}
                onClose={() =>
                    setApproveModal({
                        isOpen: false,
                        review: null,
                        isLoading: false,
                    })
                }
                setIsLoading={(v) =>
                    setApproveModal((p) => ({ ...p, isLoading: v }))
                }
            />

            <RejectReviewModal
                isOpen={rejectModal.isOpen}
                review={rejectModal.review}
                isLoading={rejectModal.isLoading}
                onClose={() =>
                    setRejectModal({
                        isOpen: false,
                        review: null,
                        isLoading: false,
                    })
                }
                setIsLoading={(v) =>
                    setRejectModal((p) => ({ ...p, isLoading: v }))
                }
            />

            <DeleteReviewModal
                isOpen={deleteModal.isOpen}
                review={deleteModal.review}
                isLoading={deleteModal.isLoading}
                onClose={() =>
                    setDeleteModal({
                        isOpen: false,
                        review: null,
                        isLoading: false,
                    })
                }
                setIsLoading={(v) =>
                    setDeleteModal((p) => ({ ...p, isLoading: v }))
                }
            />

            <RestoreReviewModal
                isOpen={restoreModal.isOpen}
                review={restoreModal.review}
                isLoading={restoreModal.isLoading}
                onClose={() =>
                    setRestoreModal({
                        isOpen: false,
                        review: null,
                        isLoading: false,
                    })
                }
                setIsLoading={(v) =>
                    setRestoreModal((p) => ({ ...p, isLoading: v }))
                }
            />
        </Layout>
    );
}
