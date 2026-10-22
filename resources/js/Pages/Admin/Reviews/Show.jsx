// resources/js/Pages/Admin/Reviews/Show.jsx

import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import {
    ArrowRight,
    Calendar,
    User,
    Scissors,
    Star,
    MessageSquare,
    CheckCircle,
    XCircle,
    Clock,
    Trash2,
    RotateCcw,
    AlertCircle,
    AlertTriangle,
    Hash,
    Phone,
    ExternalLink,
    Info,
    RefreshCw,
    ThumbsUp,
    ThumbsDown,
    History,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import {
    formatFullDateTime,
    formatFullDateWithoutTime,
} from "../../../utils/dateHelpers";

import "./Assets/css/Show.css";
import "../Bookings/Assets/css/BookingsShow.css";

import ApproveReviewModal from "./Components/ApproveReviewModal";
import RejectReviewModal from "./Components/RejectReviewModal";
import DeleteReviewModal from "./Components/DeleteReviewModal";
import RestoreReviewModal from "./Components/RestoreReviewModal";

// ============ تنظیمات وضعیت ============
const statusConfig = {
    pending: {
        label: "در انتظار بررسی",
        icon: Clock,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
        gradient: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)",
    },
    approved: {
        label: "تایید شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#a7f3d0",
        gradient: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
    },
    rejected: {
        label: "رد شده",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fecaca",
        gradient: "linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)",
    },
};

export default function ReviewShow({ review }) {
    const config = statusConfig[review.status] ?? statusConfig.pending;
    const StatusIcon = config.icon;

    const isPending = review.status === "pending" && !review.is_deleted;
    const isApproved = review.status === "approved" && !review.is_deleted;
    const isRejected = review.status === "rejected" && !review.is_deleted;
    const isDeleted = review.is_deleted;

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

    // ============ helpers ============
    const openApprove = () =>
        setApproveModal({ isOpen: true, review, isLoading: false });
    const openReject = () =>
        setRejectModal({ isOpen: true, review, isLoading: false });
    const openDelete = () =>
        setDeleteModal({ isOpen: true, review, isLoading: false });
    const openRestore = () =>
        setRestoreModal({ isOpen: true, review, isLoading: false });

    return (
        <Layout>
            <Head title={`نظر #${review.id}`} />

            <div className="review-show-page">
                {/* ============ بازگشت ============ */}
                <div className="review-show-back">
                    <Link href="/admin/reviews" className="btn-secondary">
                        <ArrowRight size={16} />
                        بازگشت به نظرات
                    </Link>
                </div>

                {/* ============ هدر با عملیات سریع ============ */}
                <div
                    className="review-hero"
                    style={{
                        background: config.gradient,
                        borderColor: config.border,
                    }}
                >
                    <div className="review-hero-main">
                        <div
                            className="review-hero-icon"
                            style={{
                                background: config.bg,
                                color: config.color,
                                borderColor: config.border,
                            }}
                        >
                            <StatusIcon size={32} />
                        </div>

                        <div className="review-hero-content">
                            <div className="review-hero-badges">
                                <span
                                    className="review-hero-badge"
                                    style={{
                                        background: config.bg,
                                        color: config.color,
                                        borderColor: config.border,
                                    }}
                                >
                                    <StatusIcon size={12} />
                                    {config.label}
                                </span>
                                <span className="review-hero-code">
                                    <Hash size={12} />
                                    نظر {toPersianNumber(review.id)}
                                </span>
                                {isDeleted && (
                                    <span
                                        className="review-hero-badge"
                                        style={{
                                            background: "#f3f4f6",
                                            color: "#6b7280",
                                            borderColor: "#e5e7eb",
                                        }}
                                    >
                                        <Trash2 size={12} />
                                        حذف شده
                                    </span>
                                )}
                            </div>

                            <h1 className="review-hero-title">
                                {review.user?.name ?? "ناشناس"}{" "}
                                <span
                                    style={{
                                        fontWeight: 400,
                                        fontSize: "0.875rem",
                                        opacity: 0.7,
                                    }}
                                >
                                    به{" "}
                                </span>
                                {review.barber?.name ?? "آرایشگر"}
                            </h1>

                            <p className="review-hero-subtitle">
                                <Calendar size={12} />
                                {formatFullDateTime(review.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* ============ عملیات سریع ============ */}
                    <div className="review-hero-actions">
                        {isPending && (
                            <>
                                <button
                                    type="button"
                                    className="review-hero-btn approve"
                                    onClick={openApprove}
                                >
                                    <CheckCircle size={16} />
                                    تایید
                                </button>
                                <button
                                    type="button"
                                    className="review-hero-btn reject"
                                    onClick={openReject}
                                >
                                    <XCircle size={16} />
                                    رد
                                </button>
                            </>
                        )}

                        {isApproved && (
                            <button
                                type="button"
                                className="review-hero-btn reject"
                                onClick={openReject}
                            >
                                <RefreshCw size={16} />
                                تغییر به رد
                            </button>
                        )}

                        {isRejected && (
                            <button
                                type="button"
                                className="review-hero-btn approve"
                                onClick={openApprove}
                            >
                                <RefreshCw size={16} />
                                تغییر به تایید
                            </button>
                        )}

                        {!isDeleted && (
                            <button
                                type="button"
                                className="review-hero-btn delete"
                                onClick={openDelete}
                                title="حذف نظر"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}

                        {isDeleted && (
                            <button
                                type="button"
                                className="review-hero-btn restore"
                                onClick={openRestore}
                            >
                                <RotateCcw size={16} />
                                بازیابی
                            </button>
                        )}
                    </div>
                </div>

                {/* ============ گرید ============ */}
                <div className="booking-show-grid">
                    {/* ============ ستون راست ============ */}
                    <div className="booking-show-main">
                        {/* کارت نظر */}
                        <div className="review-card-rating">
                            <div className="review-card-rating-top">
                                <div className="review-card-rating-stars">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star
                                            key={i}
                                            size={24}
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
                                </div>
                                <div className="review-card-rating-score">
                                    <strong>
                                        {toPersianNumber(review.rating)}
                                    </strong>
                                    <span>از ۵</span>
                                </div>
                            </div>

                            <div className="review-card-rating-label">
                                <MessageSquare size={14} />
                                متن نظر
                            </div>

                            {review.comment ? (
                                <blockquote className="review-card-comment">
                                    <span className="review-card-comment-quote">
                                        "
                                    </span>
                                    {review.comment}
                                </blockquote>
                            ) : (
                                <div className="review-card-empty">
                                    <MessageSquare size={20} />
                                    <span>این نظر بدون متن است</span>
                                </div>
                            )}
                        </div>

                        {/* اطلاعات بررسی */}
                        {(review.moderated_at ||
                            review.moderation_note ||
                            review.rejection_reason) && (
                            <div className="booking-show-card">
                                <div className="booking-show-card-header">
                                    <div className="booking-show-card-icon blue">
                                        <Info size={20} />
                                    </div>
                                    <h2>اطلاعات بررسی</h2>
                                </div>

                                <div className="booking-info-grid">
                                    {review.moderated_by && (
                                        <div className="booking-info-block">
                                            <span className="booking-info-label">
                                                <User size={12} />
                                                بررسی‌کننده
                                            </span>
                                            <span className="booking-info-value">
                                                {review.moderated_by.name}
                                            </span>
                                        </div>
                                    )}
                                    {review.moderated_at && (
                                        <div className="booking-info-block">
                                            <span className="booking-info-label">
                                                <Calendar size={12} />
                                                تاریخ بررسی
                                            </span>
                                            <span className="booking-info-value">
                                                {formatFullDateTime(
                                                    review.moderated_at,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {review.moderation_note && (
                                    <div className="review-moderation-block note">
                                        <Info size={14} />
                                        <div>
                                            <strong>یادداشت:</strong>{" "}
                                            {review.moderation_note}
                                        </div>
                                    </div>
                                )}

                                {review.rejection_reason && (
                                    <div className="review-moderation-block rejection">
                                        <AlertCircle size={14} />
                                        <div>
                                            <strong>دلیل رد:</strong>{" "}
                                            {review.rejection_reason}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* تاریخچه بررسی */}
                        {review.moderation_history &&
                            review.moderation_history.length > 0 && (
                                <div className="booking-show-card">
                                    <div className="booking-show-card-header">
                                        <div className="booking-show-card-icon gray">
                                            <History size={20} />
                                        </div>
                                        <h2>
                                            تاریخچه بررسی (
                                            {toPersianNumber(
                                                review.moderation_history
                                                    .length,
                                            )}
                                            )
                                        </h2>
                                    </div>

                                    <div className="review-timeline">
                                        {review.moderation_history.map(
                                            (h, i) => {
                                                // شماره از پایین: قدیمی‌ترین = ۱، جدیدترین = آخرین
                                                const stepNumber =
                                                    review.moderation_history
                                                        .length - i;

                                                return (
                                                    <div
                                                        key={h.id}
                                                        className="review-timeline-item"
                                                    >
                                                        {/* ============ شماره در دایره ============ */}
                                                        <div className="review-timeline-dot">
                                                            <span className="review-timeline-dot-number">
                                                                {toPersianNumber(
                                                                    stepNumber,
                                                                )}
                                                            </span>
                                                        </div>

                                                        <div className="review-timeline-content">
                                                            <div className="review-timeline-header">
                                                                <div className="review-timeline-status">
                                                                    <span
                                                                        className={`status-badge ${h.previous_status}`}
                                                                    >
                                                                        {
                                                                            h.previous_label
                                                                        }
                                                                    </span>
                                                                    <ArrowRight
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                    <span
                                                                        className={`status-badge ${h.new_status}`}
                                                                    >
                                                                        {
                                                                            h.new_label
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <span className="review-timeline-date">
                                                                    {formatFullDateTime(
                                                                        h.created_at,
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <div className="review-timeline-admin">
                                                                <User
                                                                    size={12}
                                                                />
                                                                {h.admin
                                                                    ?.name ??
                                                                    "—"}
                                                            </div>

                                                            <div className="review-timeline-reason">
                                                                <strong>
                                                                    دلیل:
                                                                </strong>{" "}
                                                                {h.reason}
                                                            </div>

                                                            {h.note && (
                                                                <div className="review-timeline-note">
                                                                    <strong>
                                                                        یادداشت:
                                                                    </strong>{" "}
                                                                    {h.note}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* ============ ستون چپ ============ */}
                    <div className="booking-show-sidebar">
                        {/* مشتری */}
                        <div className="review-person-card customer">
                            <div className="review-person-card-header">
                                <div className="review-person-icon customer">
                                    <User size={16} />
                                </div>
                                <span className="review-person-role">
                                    مشتری
                                </span>
                                {review.user?.id && (
                                    <Link
                                        href={`/admin/customers/${review.user.id}`}
                                        className="review-person-link"
                                    >
                                        <ExternalLink size={12} />
                                    </Link>
                                )}
                            </div>
                            {review.user ? (
                                <div className="review-person-info">
                                    <div className="review-person-avatar customer">
                                        {review.user.avatar_url ? (
                                            <img
                                                src={review.user.avatar_url}
                                                alt={review.user.name}
                                            />
                                        ) : (
                                            review.user.name
                                                ?.charAt(0)
                                                .toUpperCase()
                                        )}
                                    </div>
                                    <div className="review-person-details">
                                        <span className="review-person-name">
                                            {review.user.name}
                                        </span>
                                        {review.user.phone && (
                                            <a
                                                href={`tel:${review.user.phone}`}
                                                className="review-person-phone"
                                            >
                                                <Phone size={12} />
                                                {toPersianNumber(
                                                    review.user.phone,
                                                )}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="booking-empty">—</p>
                            )}
                        </div>

                        {/* آرایشگر */}
                        <div className="review-person-card barber">
                            <div className="review-person-card-header">
                                <div className="review-person-icon barber">
                                    <Scissors size={16} />
                                </div>
                                <span className="review-person-role">
                                    آرایشگر
                                </span>
                                {review.barber?.slug && (
                                    <Link
                                        href={`/admin/barbers/${review.barber.slug}/detail`}
                                        className="review-person-link"
                                    >
                                        <ExternalLink size={12} />
                                    </Link>
                                )}
                            </div>
                            {review.barber ? (
                                <div className="review-person-info">
                                    <div className="review-person-avatar barber">
                                        {review.barber.avatar_url ? (
                                            <img
                                                src={review.barber.avatar_url}
                                                alt={review.barber.name}
                                            />
                                        ) : (
                                            review.barber.name
                                                ?.charAt(0)
                                                .toUpperCase()
                                        )}
                                    </div>
                                    <div className="review-person-details">
                                        <span className="review-person-name">
                                            {review.barber.name}
                                        </span>
                                        {review.barber.phone && (
                                            <a
                                                href={`tel:${review.barber.phone}`}
                                                className="review-person-phone"
                                            >
                                                <Phone size={12} />
                                                {toPersianNumber(
                                                    review.barber.phone,
                                                )}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="booking-empty">—</p>
                            )}
                        </div>

                        {/* رزرو مرتبط */}
                        {review.booking && (
                            <div className="booking-show-card">
                                <div className="booking-show-card-header">
                                    <div className="booking-show-card-icon green">
                                        <Calendar size={20} />
                                    </div>
                                    <h2>رزرو مرتبط</h2>
                                </div>

                                <Link
                                    href={`/admin/bookings/${review.booking.id}/detail`}
                                    className="review-booking-link"
                                >
                                    <ExternalLink size={14} />
                                    رزرو #{toPersianNumber(review.booking.id)}
                                </Link>

                                {review.booking.time_slot && (
                                    <div className="review-booking-detail">
                                        <div className="review-booking-row">
                                            <Calendar size={12} />
                                            <span>
                                                {formatFullDateWithoutTime(
                                                    review.booking.time_slot
                                                        .date,
                                                )}
                                            </span>
                                        </div>
                                        <div className="review-booking-row ltr">
                                            <span>
                                                {toPersianNumber(
                                                    review.booking.time_slot.start_time.slice(
                                                        0,
                                                        5,
                                                    ),
                                                )}{" "}
                                                -{" "}
                                                {toPersianNumber(
                                                    review.booking.time_slot.end_time.slice(
                                                        0,
                                                        5,
                                                    ),
                                                )}
                                            </span>
                                            <Clock size={12} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* پیام بازیابی */}
                        {isDeleted && (
                            <div className="review-restore-hint">
                                <AlertTriangle size={16} />
                                <div>
                                    <strong>این نظر حذف شده است.</strong>
                                    <p>
                                        با بازیابی، به وضعیت «در انتظار بررسی»
                                        برمی‌گردد و باید دوباره بررسی شود.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* راهنما */}
                        <div className="booking-show-card">
                            <div className="booking-show-card-header">
                                <div className="booking-show-card-icon gray">
                                    <Info size={20} />
                                </div>
                                <h2>راهنما</h2>
                            </div>

                            <ul className="review-help-list">
                                <li>
                                    <CheckCircle size={14} />
                                    <span>
                                        تایید نظر باعث نمایش آن در پروفایل
                                        آرایشگر می‌شود.
                                    </span>
                                </li>
                                <li>
                                    <XCircle size={14} />
                                    <span>
                                        رد نظر باعث مخفی شدن آن از دید عمومی
                                        می‌شود.
                                    </span>
                                </li>
                                <li>
                                    <RefreshCw size={14} />
                                    <span>
                                        تغییر تصمیم، امتیاز آرایشگر را بازمحاسبه
                                        می‌کند.
                                    </span>
                                </li>
                                <li>
                                    <Trash2 size={14} />
                                    <span>حذف (soft) قابل بازیابی است.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============ Modals ============ */}
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
