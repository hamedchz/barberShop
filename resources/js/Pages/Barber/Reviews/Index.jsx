import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../../Admin/Layouts/Layout";
import "../Dashboard/Assets/css/BarberDashboard.css";
import "./Assets/css/BarberReviews.css";
import Pagination from "../../Admin/Components/Pagination";

import {
    Star,
    MessageSquare,
    Filter,
    X,
    Search,
    CheckCircle,
    Clock,
    XCircle,
    TrendingUp,
    Calendar,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    User,
    Eye,
    Info,
    RefreshCw,
    Shield,
    Award,
    ThumbsUp,
    ThumbsDown,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import {
    formatFullDateTime,
    formatFullDateWithoutTime,
} from "../../../utils/dateHelpers";

const statusConfig = {
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

export default function BarberReviewsIndex({ reviews, stats, filters = {} }) {
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || "");

    const activeTab = filters.status || "all";

    const setTab = (status) => {
        router.get(
            "/barber/reviews",
            { ...filters, status },
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            "/barber/reviews",
            { ...filters, search: searchTerm },
            { preserveScroll: true, preserveState: true },
        );
    };

    const renderReview = (review) => {
        const config = statusConfig[review.status] ?? statusConfig.approved;
        const StatusIcon = config.icon;

        return (
            <div
                key={review.id}
                className={`barber-review-card status-${review.status}`}
            >
                {/* هدر */}
                <div className="barber-review-card-header">
                    <div className="barber-review-card-avatar">
                        {review.customer?.avatar ? (
                            <img
                                src={review.customer.avatar}
                                alt={review.customer.name}
                            />
                        ) : (
                            review.customer?.name?.charAt(0).toUpperCase() ||
                            "؟"
                        )}
                    </div>
                    <div className="barber-review-card-info">
                        <span className="barber-review-card-name">
                            {review.customer?.name ?? "—"}
                        </span>
                        <div className="barber-review-card-stars">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    fill={
                                        i <= review.rating
                                            ? "#fbbf24"
                                            : "#e5e7eb"
                                    }
                                    color={
                                        i <= review.rating
                                            ? "#fbbf24"
                                            : "#e5e7eb"
                                    }
                                />
                            ))}
                            <span className="barber-review-card-rating">
                                {toPersianNumber(review.rating)}/۵
                            </span>
                        </div>
                    </div>
                    <div className="barber-review-card-meta">
                        <span
                            className="barber-review-card-status"
                            style={{
                                color: config.color,
                                background: config.bg,
                            }}
                        >
                            <StatusIcon size={10} />
                            {config.label}
                        </span>
                        <span className="barber-review-card-date">
                            {formatFullDateWithoutTime(review.created_at)}
                        </span>
                    </div>
                </div>

                {/* متن */}
                {review.comment && (
                    <p className="barber-review-card-comment">
                        "{review.comment}"
                    </p>
                )}

                {/* اطلاعات رد */}
                {review.status === "rejected" && (
                    <div className="barber-review-card-rejection">
                        <AlertCircle size={14} />
                        <div>
                            <strong>این نظر رد شده است</strong>
                            {review.rejection_reason && (
                                <p>دلیل: {review.rejection_reason}</p>
                            )}
                            {review.moderation_note && (
                                <p className="moderation-note">
                                    یادداشت: {review.moderation_note}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* اکشن‌ها */}
                <div className="barber-review-card-actions">
                    {review.booking_id && (
                        <Link
                            href={`/barber/bookings/${review.booking_id}`}
                            className="barber-review-card-btn"
                        >
                            <Calendar size={12} />
                            مشاهده رزرو
                        </Link>
                    )}
                    {review.booking_date && (
                        <span className="barber-review-card-booking-date">
                            <Calendar size={11} />
                            {formatFullDateWithoutTime(review.booking_date)}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <Head title="نظرات مشتریان" />

            <div className="barber-dashboard">
                {/* هدر */}
                <div className="barber-hero">
                    <div className="barber-hero-content">
                        <div className="barber-hero-greeting">
                            <h1 className="greeting-name">💬 نظرات مشتریان</h1>
                        </div>
                        <p className="barber-hero-subtitle">
                            {toPersianNumber(stats.total)} نظر تایید‌شده —
                            میانگین امتیاز{" "}
                            <strong>
                                {toPersianNumber(stats.avg_rating)} از ۵
                            </strong>
                        </p>
                    </div>
                </div>

                {/* آمار */}
                <div className="barber-stats-grid">
                    <div className="barber-stat-card rating">
                        <div className="barber-stat-icon rating">
                            <Star size={24} fill="#fbbf24" color="#fbbf24" />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">
                                میانگین امتیاز
                            </span>
                            <div className="barber-stat-value">
                                {toPersianNumber(stats.avg_rating)}
                                <span className="barber-stat-unit">از ۵</span>
                            </div>
                        </div>
                    </div>

                    <div className="barber-stat-card bookings">
                        <div className="barber-stat-icon bookings">
                            <MessageSquare size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">کل نظرات</span>
                            <div className="barber-stat-value">
                                {toPersianNumber(stats.total)}
                                <span className="barber-stat-unit">نظر</span>
                            </div>
                        </div>
                    </div>

                    <div className="barber-stat-card revenue">
                        <div className="barber-stat-icon revenue">
                            <ThumbsUp size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">
                                نظرات مثبت (۴-۵ ستاره)
                            </span>
                            <div className="barber-stat-value">
                                {toPersianNumber(
                                    stats.distribution[5] +
                                        stats.distribution[4],
                                )}
                                <span className="barber-stat-unit">نظر</span>
                            </div>
                        </div>
                    </div>

                    <div className="barber-stat-card wallet">
                        <div className="barber-stat-icon wallet">
                            <ThumbsDown size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">
                                نظرات منفی (۱-۲ ستاره)
                            </span>
                            <div className="barber-stat-value">
                                {toPersianNumber(
                                    stats.distribution[1] +
                                        stats.distribution[2],
                                )}
                                <span className="barber-stat-unit">نظر</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* توزیع امتیاز */}
                <div className="barber-card">
                    <div className="barber-card-header">
                        <div className="barber-card-header-icon yellow">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h2>توزیع امتیاز</h2>
                            <p>نمودار ستاره‌ها</p>
                        </div>
                    </div>

                    <div className="barber-rating-distribution">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = stats.distribution[star] ?? 0;
                            const percent =
                                stats.total > 0
                                    ? (count / stats.total) * 100
                                    : 0;

                            return (
                                <div key={star} className="barber-rating-bar">
                                    <span className="barber-rating-bar-label">
                                        {toPersianNumber(star)}
                                        <Star
                                            size={12}
                                            fill="#fbbf24"
                                            color="#fbbf24"
                                        />
                                    </span>
                                    <div className="barber-rating-bar-track">
                                        <div
                                            className="barber-rating-bar-fill"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <span className="barber-rating-bar-count">
                                        {toPersianNumber(count)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* تب‌ها */}
                <div className="barber-tabs">
                    <button
                        type="button"
                        className={`barber-tab ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setTab("")}
                    >
                        همه
                    </button>
                    <button
                        type="button"
                        className={`barber-tab ${activeTab === "approved" ? "active" : ""}`}
                        onClick={() => setTab("approved")}
                    >
                        <CheckCircle size={12} />
                        تایید شده
                    </button>
                    <button
                        type="button"
                        className={`barber-tab ${activeTab === "rejected" ? "active" : ""}`}
                        onClick={() => setTab("rejected")}
                    >
                        <XCircle size={12} />
                        رد شده
                    </button>
                </div>

                {/* لیست */}

                <div className="barber-card barber-reviews-card">
                    {/* Header */}
                    <div className="barber-card-header barber-reviews-header">
                        <div className="barber-card-header-icon purple">
                            <MessageSquare size={21} />
                        </div>

                        <div className="barber-reviews-heading">
                            <h2>نظرات کاربران</h2>
                            <p>{toPersianNumber(reviews.total)} نظر ثبت شده</p>
                        </div>

                        {reviews.total > 0 && (
                            <div className="barber-reviews-count">
                                <MessageSquare size={15} />
                                <span>{toPersianNumber(reviews.total)}</span>
                            </div>
                        )}
                    </div>

                    {/* Reviews */}
                    {reviews.data.length === 0 ? (
                        <div className="barber-empty-state barber-reviews-empty">
                            <div className="barber-reviews-empty-icon">
                                <MessageSquare size={32} />
                            </div>
                            <h3> نظری موجود نیست</h3>
                        </div>
                    ) : (
                        <>
                            <div className="barber-reviews-list">
                                {reviews.data.map(renderReview)}
                            </div>

                            <div className="barber-reviews-footer">
                                <Pagination
                                    links={reviews.links}
                                    only={reviews}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
