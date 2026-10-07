import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import ConfirmModal from "../Components/ConfirmModal";
import RatingStars from "../../Customer/Components/RatingStars";
import {
    ArrowRight,
    User,
    Scissors,
    MessageSquare,
    CheckCircle,
    XCircle,
    Clock4,
    AlertTriangle,
    AlertCircle,
    Flame,
    Paperclip,
    Eye,
    FileText,
    CreditCard,
    DollarSign,
    Calendar,
    Shield,
    Ban,
    Send,
    ThumbsUp,
    ThumbsDown,
    Info,
    Search,
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

const formatFullDateTime = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const { jy, jm, jd } = toJalaali(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    );
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return toPersianNumber(
        `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")} - ${hours}:${minutes}`,
    );
};

export default function DisputeShow({ auth, dispute, otherDisputes }) {
    const [decisionModal, setDecisionModal] = useState({
        isOpen: false,
        decision: null,
        isLoading: false,
    });

    const [requestModal, setRequestModal] = useState({
        isOpen: false,
        isLoading: false,
        message: "",
        errors: {},
    });

    const typeConfig = getDisputeTypeConfig(dispute.dispute_type);
    const statusConfig = getDisputeStatusConfig(dispute.status);
    const TypeIcon = typeConfig.icon;
    const StatusIcon = statusConfig.icon;

    const canResolve = [
        "pending",
        "investigating",
        "awaiting_response",
    ].includes(dispute.status);
    const booking = dispute.booking;

    // ============ باز کردن Modal تصمیم ============
    const openDecisionModal = (decision) => {
        setDecisionModal({ isOpen: true, decision, isLoading: false });
    };

    // ============ تایید تصمیم ============
    const handleConfirmDecision = () => {
        const { decision } = decisionModal;
        setDecisionModal((prev) => ({ ...prev, isLoading: true }));

        router.post(
            `/admin/disputes/${dispute.id}/resolve`,
            {
                decision,
                resolution:
                    decision === "approve"
                        ? "پس از بررسی شواهد، اعتراض تایید شد."
                        : "پس از بررسی شواهد، اعتراض رد شد.",
                refund_amount: decision === "approve" ? booking.amount : 0,
                penalty_amount:
                    decision === "approve" ? booking.amount * 0.2 : 0,
            },
            {
                preserveScroll: true,
                onSuccess: () =>
                    setDecisionModal({
                        isOpen: false,
                        decision: null,
                        isLoading: false,
                    }),
                onError: () =>
                    setDecisionModal((prev) => ({ ...prev, isLoading: false })),
            },
        );
    };

    // ============ اعتبارسنجی پیام درخواست ============
    const validateRequestMessage = (message) => {
        const errors = {};
        const trimmed = message.trim();

        if (!trimmed) {
            errors.message = "لطفاً متن پیام را وارد کنید.";
        } else if (trimmed.length < 10) {
            errors.message = "پیام باید حداقل ۱۰ کاراکتر باشد.";
        } else if (trimmed.length > 1000) {
            errors.message = "پیام نمیتواند بیشتر از ۱۰۰۰ کاراکتر باشد.";
        }

        return errors;
    };

    // ============ ارسال درخواست اطلاعات بیشتر ============
    const handleRequestInfo = () => {
        const message = requestModal.message.trim();
        const clientErrors = validateRequestMessage(message);

        if (Object.keys(clientErrors).length > 0) {
            setRequestModal((prev) => ({ ...prev, errors: clientErrors }));
            return;
        }

        setRequestModal((prev) => ({
            ...prev,
            isLoading: true,
            errors: {},
        }));

        router.post(
            `/admin/disputes/${dispute.id}/request-response`,
            { message },
            {
                preserveScroll: true,
                onSuccess: () =>
                    setRequestModal({
                        isOpen: false,
                        isLoading: false,
                        message: "",
                        errors: {},
                    }),
                onError: (errors) =>
                    setRequestModal((prev) => ({
                        ...prev,
                        isLoading: false,
                        errors,
                    })),
            },
        );
    };

    return (
        <Layout>
            <Head title={`بررسی اعتراض #${dispute.id}`} />

            <div className="admin-dispute-show-page">
                {/* ============ دکمه بازگشت ============ */}
                <div className="page-header-with-back">
                    <Link href="/admin/disputes" className="back-btn">
                        <ArrowRight size={20} />
                        <span>بازگشت به لیست اعتراضات</span>
                    </Link>
                </div>

                {/* ============ هدر ============ */}
                <div
                    className={`admin-dispute-header status-${dispute.status}`}
                >
                    <div
                        className={`admin-dispute-header-icon status-${dispute.status}`}
                    >
                        <StatusIcon size={28} />
                    </div>
                    <div className="admin-dispute-header-content">
                        <div className="admin-dispute-header-top">
                            <span
                                className={`dispute-status-badge status-${dispute.status}`}
                            >
                                <StatusIcon size={14} />
                                {statusConfig.label}
                            </span>
                            <span className="dispute-code">
                                اعتراض #{toPersianNumber(dispute.id)}
                            </span>
                            <span
                                className={`disputer-role-badge ${dispute.disputed_by}`}
                            >
                                {dispute.disputed_by === "customer" ? (
                                    <User size={12} />
                                ) : (
                                    <Scissors size={12} />
                                )}
                                {dispute.disputed_by === "customer"
                                    ? "مشتری"
                                    : "آرایشگر"}
                            </span>
                        </div>
                        <h1 className="admin-dispute-title">
                            {typeConfig.label}
                        </h1>
                        <p className="admin-dispute-subtitle">
                            ثبت شده در {formatFullDateTime(dispute.created_at)}
                        </p>
                    </div>
                </div>

                {/* ============ گرید اصلی ============ */}
                <div className="admin-dispute-grid">
                    {/* ============ ستون راست ============ */}
                    <div className="admin-dispute-main">
                        {/* ============ اطلاعات معترض ============ */}
                        <div className="admin-dispute-card">
                            <div className="card-header">
                                <div
                                    className={`card-icon-box ${dispute.disputed_by === "customer" ? "blue" : "green"}`}
                                >
                                    {dispute.disputed_by === "customer" ? (
                                        <User size={20} />
                                    ) : (
                                        <Scissors size={20} />
                                    )}
                                </div>
                                <h2 className="card-title">اطلاعات معترض</h2>
                            </div>
                            {dispute.disputed_by_user && (
                                <div className="disputer-info-card">
                                    <div className="disputer-info-avatar">
                                        {dispute.disputed_by_user.thumbnail ? (
                                            <img
                                                src={
                                                    dispute.disputed_by_user
                                                        .thumbnail
                                                }
                                                alt={
                                                    dispute.disputed_by_user
                                                        .name
                                                }
                                            />
                                        ) : (
                                            <span>
                                                {dispute.disputed_by_user.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="disputer-info-content">
                                        <h3>{dispute.disputed_by_user.name}</h3>
                                        <div className="disputer-info-contact">
                                            {dispute.disputed_by_user.phone && (
                                                <a
                                                    href={`tel:${dispute.disputed_by_user.phone}`}
                                                    className="contact-item"
                                                >
                                                    <span dir="ltr">
                                                        {toPersianNumber(
                                                            dispute
                                                                .disputed_by_user
                                                                .phone,
                                                        )}
                                                    </span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ============ متن اعتراض ============ */}
                        <div className="admin-dispute-card">
                            <div className="card-header">
                                <div className="card-icon-box red">
                                    <AlertTriangle size={20} />
                                </div>
                                <h2 className="card-title">متن اعتراض</h2>
                            </div>
                            <div className="dispute-reason-full">
                                <p>{dispute.reason}</p>
                            </div>

                            {/* پیوست‌ها */}
                            {dispute.attachments?.length > 0 && (
                                <div className="dispute-attachments-full">
                                    <h4 className="attachments-title">
                                        <Paperclip size={14} />
                                        پیوست‌ها (
                                        {toPersianNumber(
                                            dispute.attachments.length,
                                        )}
                                        )
                                    </h4>
                                    <div className="attachments-full-grid">
                                        {dispute.attachments.map(
                                            (att, index) => (
                                                <a
                                                    key={index}
                                                    href={att.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="attachment-full-item"
                                                >
                                                    <img
                                                        src={att.url}
                                                        alt={att.name}
                                                    />
                                                    <div className="attachment-full-overlay">
                                                        <Eye size={20} />
                                                    </div>
                                                </a>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ============ اطلاعات رزرو ============ */}
                        <div className="admin-dispute-card">
                            <div className="card-header">
                                <div className="card-icon-box purple">
                                    <FileText size={20} />
                                </div>
                                <h2 className="card-title">اطلاعات رزرو</h2>
                                <Link
                                    href={`/admin/bookings/${booking.barber?.id}/barber/${booking.id}`}
                                    className="view-booking-btn"
                                    target="_blank"
                                >
                                    <Eye size={14} />
                                    مشاهده رزرو
                                </Link>
                            </div>

                            <div className="booking-info-grid">
                                <div className="info-block">
                                    <div className="info-icon">
                                        <Calendar size={16} />
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">
                                            تاریخ نوبت
                                        </span>
                                        <span className="info-value">
                                            {formatJalaliDate(booking.date)}
                                        </span>
                                    </div>
                                </div>
                                <div className="info-block">
                                    <div className="info-icon">
                                        <DollarSign size={16} />
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">مبلغ</span>
                                        <span className="info-value">
                                            {toPersianNumber(
                                                booking.amount.toLocaleString(),
                                            )}{" "}
                                            تومان
                                        </span>
                                    </div>
                                </div>
                                <div className="info-block">
                                    <div className="info-icon">
                                        <Scissors size={16} />
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">خدمت</span>
                                        <span className="info-value">
                                            {booking.service?.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="info-block">
                                    <div className="info-icon">
                                        <CreditCard size={16} />
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">
                                            وضعیت پرداخت
                                        </span>
                                        <span className="info-value">
                                            {booking.payment?.status ===
                                            "success"
                                                ? "موفق"
                                                : "ناموفق"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* نظر مشتری (اگر وجود دارد) */}
                            {booking.review && (
                                <div className="booking-review-box">
                                    <h4>نظر مشتری</h4>
                                    <div className="review-content">
                                        <RatingStars
                                            rating={booking.review.rating}
                                            size={16}
                                            showNumber={false}
                                            showTotal={false}
                                        />
                                        <p>{booking.review.comment}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ============ تاریخچه اعتراضات ============ */}
                        {otherDisputes?.length > 0 && (
                            <div className="admin-dispute-card">
                                <div className="card-header">
                                    <div className="card-icon-box gray">
                                        <Info size={20} />
                                    </div>
                                    <h2 className="card-title">
                                        اعتراضات دیگر این رزرو
                                    </h2>
                                </div>
                                <div className="other-disputes-list">
                                    {otherDisputes.map((d) => {
                                        const otherType = getDisputeTypeConfig(
                                            d.dispute_type,
                                        );
                                        const otherStatus =
                                            getDisputeStatusConfig(d.status);
                                        return (
                                            <Link
                                                key={d.id}
                                                href={`/admin/disputes/${d.id}`}
                                                className="other-dispute-item"
                                            >
                                                <div
                                                    className={`other-dispute-role ${d.disputed_by}`}
                                                >
                                                    {d.disputed_by ===
                                                    "customer" ? (
                                                        <User size={12} />
                                                    ) : (
                                                        <Scissors size={12} />
                                                    )}
                                                </div>
                                                <div className="other-dispute-info">
                                                    <span>
                                                        {otherType.label}
                                                    </span>
                                                    <span className="other-dispute-date">
                                                        {formatJalaliDate(
                                                            d.created_at,
                                                        )}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`other-dispute-status status-${d.status}`}
                                                >
                                                    {otherStatus.label}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ============ ستون چپ ============ */}
                    <div className="admin-dispute-sidebar">
                        {/* ============ خلاصه ============ */}
                        <div className="admin-dispute-card summary-card">
                            <div className="card-header">
                                <div className="card-icon-box blue">
                                    <Shield size={20} />
                                </div>
                                <h2 className="card-title">خلاصه</h2>
                            </div>
                            <div className="summary-list">
                                <div className="summary-row">
                                    <span className="summary-row-label">
                                        معترض
                                    </span>
                                    <span className="summary-row-value">
                                        {dispute.disputed_by_user?.name}
                                    </span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-row-label">
                                        نوع اعتراض
                                    </span>
                                    <span className="summary-row-value">
                                        {typeConfig.label}
                                    </span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-row-label">
                                        وضعیت
                                    </span>
                                    <span
                                        className={`dispute-status-badge status-${dispute.status}`}
                                    >
                                        {statusConfig.label}
                                    </span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-row total">
                                    <span className="summary-row-label">
                                        مبلغ رزرو
                                    </span>
                                    <span className="summary-row-value">
                                        {toPersianNumber(
                                            booking.amount.toLocaleString(),
                                        )}{" "}
                                        تومان
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ============ تصمیم‌گیری ============ */}
                        {canResolve && (
                            <div className="admin-dispute-card decision-card">
                                <div className="card-header">
                                    <div className="card-icon-box green">
                                        <CheckCircle size={20} />
                                    </div>
                                    <h2 className="card-title">تصمیم‌گیری</h2>
                                </div>
                                <p className="decision-description">
                                    پس از بررسی دقیق شواهد، تصمیم خود را انتخاب
                                    کنید.
                                </p>
                                <div className="decision-actions">
                                    <button
                                        className="decision-btn approve"
                                        onClick={() =>
                                            openDecisionModal("approve")
                                        }
                                    >
                                        <ThumbsUp size={18} />
                                        <span>تایید اعتراض</span>
                                        <small>بازگشت مبلغ + جریمه</small>
                                    </button>
                                    <button
                                        className="decision-btn reject"
                                        onClick={() =>
                                            openDecisionModal("reject")
                                        }
                                    >
                                        <ThumbsDown size={18} />
                                        <span>رد اعتراض</span>
                                        <small>رزرو تکمیل می‌ماند</small>
                                    </button>
                                </div>
                                <button
                                    className="request-response-btn"
                                    onClick={() =>
                                        setRequestModal({
                                            isOpen: true,
                                            isLoading: false,
                                            message: "",
                                            errors: {},
                                        })
                                    }
                                >
                                    <Send size={14} />
                                    درخواست اطلاعات بیشتر
                                </button>
                            </div>
                        )}

                        {/* ============ پاسخ ادمین (اگر تصمیم گرفته شده) ============ */}
                        {dispute.resolution && (
                            <div className="admin-dispute-card">
                                <div className="card-header">
                                    <div
                                        className={`card-icon-box ${dispute.status === "resolved" ? "green" : "red"}`}
                                    >
                                        {dispute.status === "resolved" ? (
                                            <CheckCircle size={20} />
                                        ) : (
                                            <XCircle size={20} />
                                        )}
                                    </div>
                                    <h2 className="card-title">پاسخ ادمین</h2>
                                </div>
                                <div className="admin-response-box">
                                    <p>{dispute.resolution}</p>
                                    {dispute.resolved_at && (
                                        <span className="response-date">
                                            {formatFullDateTime(
                                                dispute.resolved_at,
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ============ مالی ============ */}
                        {(dispute.refund_amount > 0 ||
                            dispute.penalty_amount > 0) && (
                            <div className="admin-dispute-card">
                                <div className="card-header">
                                    <div className="card-icon-box green">
                                        <DollarSign size={20} />
                                    </div>
                                    <h2 className="card-title">تسویه مالی</h2>
                                </div>
                                <div className="financial-info">
                                    {dispute.refund_amount > 0 && (
                                        <div className="financial-row success">
                                            <span>بازگشت به مشتری</span>
                                            <strong>
                                                {toPersianNumber(
                                                    dispute.refund_amount.toLocaleString(),
                                                )}{" "}
                                                تومان
                                            </strong>
                                        </div>
                                    )}
                                    {dispute.penalty_amount > 0 && (
                                        <div className="financial-row danger">
                                            <span>جریمه آرایشگر</span>
                                            <strong>
                                                {toPersianNumber(
                                                    dispute.penalty_amount.toLocaleString(),
                                                )}{" "}
                                                تومان
                                            </strong>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ============ Modal تصمیم ============ */}
            <ConfirmModal
                isOpen={decisionModal.isOpen}
                onClose={() =>
                    setDecisionModal({
                        isOpen: false,
                        decision: null,
                        isLoading: false,
                    })
                }
                onConfirm={handleConfirmDecision}
                title={
                    decisionModal.decision === "approve"
                        ? "تایید اعتراض"
                        : "رد اعتراض"
                }
                message={
                    decisionModal.decision === "approve"
                        ? `آیا از تایید این اعتراض مطمئن هستید؟ رزرو لغو می‌شود، مبلغ ${toPersianNumber(booking.amount.toLocaleString())} تومان به مشتری بازگردانده می‌شود و جریمه ${toPersianNumber((booking.amount * 0.2).toLocaleString())} تومان از آرایشگر کسر می‌شود.`
                        : "آیا از رد این اعتراض مطمئن هستید؟ رزرو در وضعیت تکمیل شده باقی می‌ماند و مبلغی بازگردانده نمی‌شود."
                }
                confirmText={
                    decisionModal.decision === "approve"
                        ? "بله، تایید کن"
                        : "بله، رد کن"
                }
                cancelText="انصراف"
                type={
                    decisionModal.decision === "approve" ? "success" : "danger"
                }
                isLoading={decisionModal.isLoading}
            />

            {/* ============ Modal درخواست پاسخ ============ */}
            {requestModal.isOpen && (
                <div
                    className="request-modal-overlay"
                    onClick={() =>
                        !requestModal.isLoading &&
                        setRequestModal({ ...requestModal, isOpen: false })
                    }
                >
                    <div
                        className="request-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="request-modal-header">
                            <div className="request-modal-icon">
                                <MessageSquare size={28} />
                            </div>
                            <h3>درخواست اطلاعات بیشتر</h3>
                        </div>
                        <p className="request-modal-description">
                            از {dispute.disputed_by_user?.name} بخواهید اطلاعات
                            بیشتری ارسال کند.
                        </p>
                        <div className="form-group">
                            <label className="form-label">پیام شما:</label>
                            <textarea
                                className={`form-textarea ${requestModal.errors?.message ? "has-error" : ""}`}
                                value={requestModal.message}
                                onChange={(e) => {
                                    setRequestModal((prev) => ({
                                        ...prev,
                                        message: e.target.value,
                                        // پاک کردن خطا هنگام تایپ
                                        errors: {
                                            ...prev.errors,
                                            message: undefined,
                                        },
                                    }));
                                }}
                                placeholder="لطفاً توضیح دهید چه اطلاعاتی نیاز دارید..."
                                rows={4}
                                maxLength={1000}
                            />
                            <div className="form-textarea-footer">
                                {requestModal.errors?.message ? (
                                    <span className="form-error">
                                        <AlertCircle size={12} />
                                        {requestModal.errors.message}
                                    </span>
                                ) : (
                                    <span className="form-hint">
                                        حداقل ۱۰ و حداکثر ۱۰۰۰ کاراکتر
                                    </span>
                                )}
                                <span className="form-counter" dir="ltr">
                                    {toPersianNumber(
                                        requestModal.message.length,
                                    )}{" "}
                                    / ۱۰۰۰
                                </span>
                            </div>
                        </div>
                        <div className="request-modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() =>
                                    setRequestModal({
                                        ...requestModal,
                                        isOpen: false,
                                    })
                                }
                            >
                                انصراف
                            </button>
                            <button
                                className="btn-confirm"
                                disabled={
                                    requestModal.isLoading ||
                                    !requestModal.message.trim()
                                }
                                onClick={handleRequestInfo}
                            >
                                {requestModal.isLoading
                                    ? "در حال ارسال..."
                                    : "ارسال درخواست"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
