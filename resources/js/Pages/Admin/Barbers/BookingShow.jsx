import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import ConfirmModal from "../Components/ConfirmModal";
import RatingStars from "../../Customer/Components/RatingStars";
import "../Assets/css/AdminBookingShow.css";
import {
    ArrowRight,
    Calendar,
    Clock,
    Scissors,
    DollarSign,
    User,
    Phone,
    Mail,
    CheckCircle,
    XCircle,
    Clock4,
    Star,
    Hash,
    CreditCard,
    Award,
    Building2,
    CalendarClock,
    Info,
    FileText,
    Shield,
    Ban,
    Check,
    Printer,
    MessageSquare,
    Edit3,
    TrendingUp,
    AlertCircle,
    X,
    RefreshCw,
    AlertTriangle,
} from "lucide-react";
import { toJalaali } from "jalaali-js";
import {
    toPersianNumber,
    toPersianTimeRange,
    toPersianTime,
} from "../../../utils/persianNumbers";

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

const getDayName = (date) => {
    if (!date) return "";
    const days = [
        "یکشنبه",
        "دوشنبه",
        "سه‌شنبه",
        "چهارشنبه",
        "پنجشنبه",
        "جمعه",
        "شنبه",
    ];
    return days[new Date(date).getDay()];
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
    return `${getDayName(date)} ${toPersianNumber(jy)}/${toPersianNumber(
        String(jm).padStart(2, "0"),
    )}/${toPersianNumber(String(jd).padStart(2, "0"))} - ${toPersianNumber(
        hours,
    )}:${toPersianNumber(minutes)}`;
};
const rejectionReasons = [
    {
        value: "inappropriate_language",
        label: "استفاده از الفاظ نامناسب",
        description: "نظر شامل توهین، فحش یا الفاظ رکیک است.",
    },
    {
        value: "false_information",
        label: "اطلاعات نادرست",
        description: "نظر حاوی اطلاعات نادرست یا گمراه‌کننده است.",
    },
    {
        value: "not_related",
        label: "نامرتبط با خدمت",
        description: "نظر ربطی به خدمت ارائه‌شده ندارد.",
    },
    {
        value: "spam",
        label: "اسپم یا تبلیغ",
        description: "نظر شامل تبلیغ، لینک یا محتوای اسپم است.",
    },
    {
        value: "personal_info",
        label: "افشای اطلاعات شخصی",
        description: "نظر شامل شماره تماس، آدرس یا اطلاعات خصوصی است.",
    },
    {
        value: "false_review_dispute",
        label: "تایید اعتراض آرایشگر",
        description: "بابت تایید اعتراض آرایشگر به نادرست بودن نظر.",
    },
    {
        value: "other",
        label: "سایر (نیاز به توضیح)",
        description: "دلیل دیگری که باید توضیح دهید.",
    },
];

// ============ وضعیت رزرو ============
const statusConfig = {
    pending: {
        label: "در انتظار تایید",
        icon: Clock4,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
        description: "این رزرو در انتظار تایید آرایشگر است.",
    },
    confirmed: {
        label: "تایید شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#d1fae5",
        description: "رزرو تایید شده است.",
    },
    completed: {
        label: "تکمیل شده",
        icon: CheckCircle,
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#dbeafe",
        description: "خدمت با موفقیت انجام شده است.",
    },
    cancelled: {
        label: "لغو شده",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fee2e2",
        description: "این رزرو لغو شده است.",
    },
};

// ============ وضعیت پرداخت ============
const paymentStatusConfig = {
    pending: {
        label: "در انتظار پرداخت",
        icon: Clock4,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
    },
    success: {
        label: "پرداخت موفق",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#d1fae5",
    },
    failed: {
        label: "پرداخت ناموفق",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fee2e2",
    },
    refunded: {
        label: "برگشت داده شده",
        icon: TrendingUp,
        color: "#5b21b6",
        bg: "#f5f3ff",
        border: "#ddd6fe",
    },
};

const gatewayLabels = {
    zarinpal: "زرین‌پال",
    idpay: "آیدی‌پی",
    payping: "پی‌پینگ",
    nextpay: "نکست‌پی",
};

const reviewStatusIcons = {
    pending: Clock4,
    approved: CheckCircle,
    rejected: XCircle,
    flagged: AlertTriangle,
};

export default function BarberBookingShow({ auth, barber, booking }) {
    const [rejectModal, setRejectModal] = useState({
        isOpen: false,
        review: null,
        reason: "",
        note: "",
        isLoading: false,
        errors: {},
    });
    // ============ Modal states ============
    const [cancelModal, setCancelModal] = useState({
        isOpen: false,
        isLoading: false,
    });

    const [completeModal, setCompleteModal] = useState({
        isOpen: false,
        isLoading: false,
        reason: "",
        errors: {},
    });

    const config = statusConfig[booking.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    const paymentConfig = booking.payment
        ? paymentStatusConfig[booking.payment.status] ||
          paymentStatusConfig.pending
        : null;
    const PaymentIcon = paymentConfig?.icon;

    // ============ بررسی امکان تکمیل توسط ادمین ============
    const canAdminComplete = (() => {
        if (booking.status !== "confirmed") return false;
        if (!booking.date) return false;

        const slotDate = new Date(booking.date);
        const now = new Date();

        // باید گذشته باشد
        if (slotDate >= now) return false;

        // باید بیش از ۲۴ ساعت از نوبت گذشته باشد
        const hoursSince = (now - slotDate) / 1000 / 60 / 60;
        return hoursSince >= 24;
    })();

    // ============ چاپ ============
    const handlePrint = () => {
        window.print();
    };

    // ============ لغو توسط ادمین ============
    const handleCancelBooking = () => {
        setCancelModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(
            `/admin/bookings/barber/${barber.id}/cancel/${booking.id}`,
            {
                preserveScroll: true,
                onSuccess: () =>
                    setCancelModal({ isOpen: false, isLoading: false }),
                onError: () =>
                    setCancelModal((prev) => ({
                        ...prev,
                        isLoading: false,
                    })),
            },
        );
    };
    // ============ تکمیل خدمت ============
    const handleCompleteBooking = () => {
        if (completeModal.reason.length < 10) {
            setCompleteModal((prev) => ({
                ...prev,
                errors: { reason: "دلیل باید حداقل ۱۰ کاراکتر باشد." },
            }));
            return;
        }

        setCompleteModal((prev) => ({ ...prev, isLoading: true }));

        router.patch(
            `/admin/bookings/${barber.id}/barbers/${booking.id}/complete`,
            { reason: completeModal.reason },
            {
                preserveScroll: true,
                onSuccess: () =>
                    setCompleteModal({
                        isOpen: false,
                        isLoading: false,
                        reason: "",
                        errors: {},
                    }),
                onError: (errors) =>
                    setCompleteModal((prev) => ({
                        ...prev,
                        isLoading: false,
                        errors,
                    })),
            },
        );
    };
    const [loading, setLoading] = useState(null);
    const handleApprove = (review) => {
        setLoading("approve");
        router.patch(
            `/admin/reviews/${review}/approve`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setLoading(null),
            },
        );
    };
    // ============ وضعیت‌های نظر ============
    const ReviewStatusIcon = reviewStatusIcons[booking.review.status] || Clock4;

    const isPending = booking.review.status === "pending";
    const isApproved = booking.review.status === "approved";
    const isRejected = booking.review.status === "rejected";
    const isFlagged = booking.review.status === "flagged";
    const isFinalized = isApproved || isRejected;
    // ============ باز کردن مدال ============
    const openRejectModal = (review) => {
        setRejectModal({
            isOpen: true,
            review,
            reason: "",
            note: "",
            isLoading: false,
            errors: {},
        });
    };

    // ============ بستن مدال ============
    const closeRejectModal = () => {
        setRejectModal({
            isOpen: false,
            review: null,
            reason: "",
            note: "",
            isLoading: false,
            errors: {},
        });
    };

    // ============ ارسال ============
    const handleReject = () => {
        const { review, reason, note } = rejectModal;

        // ============ Validation سمت کلاینت ============
        const clientErrors = {};
        if (!reason) {
            clientErrors.reason = "لطفاً دلیل رد نظر را انتخاب کنید.";
        }
        if (reason === "other" && !note.trim()) {
            clientErrors.note = "لطفاً توضیح دهید چرا نظر رد می‌شود.";
        }
        if (note.length > 500) {
            clientErrors.note = "توضیحات نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد.";
        }

        if (Object.keys(clientErrors).length > 0) {
            setRejectModal((prev) => ({ ...prev, errors: clientErrors }));
            return;
        }

        setRejectModal((prev) => ({ ...prev, isLoading: true, errors: {} }));

        router.patch(
            `/admin/reviews/${review.id}/reject`,
            {
                reason,
                note: note.trim() || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => closeRejectModal(),
                onError: (errors) =>
                    setRejectModal((prev) => ({
                        ...prev,
                        isLoading: false,
                        errors,
                    })),
            },
        );
    };

    const [changeDecisionModal, setChangeDecisionModal] = useState({
        isOpen: false,
        review: null,
        newDecision: null, // "approve" | "reject"
        isLoading: false,
    });

    const handleChangeDecision = (review, newDecision) => {
        console.log(review);
        setChangeDecisionModal({
            isOpen: true,
            review,
            newDecision,
            isLoading: false,
        });
    };

    const confirmChangeDecision = () => {
        const { review, newDecision } = changeDecisionModal;
        setChangeDecisionModal((prev) => ({ ...prev, isLoading: true }));

        const url =
            newDecision === "approve"
                ? `/admin/reviews/${review.id}/approve`
                : `/admin/reviews/${review.id}/reject`;

        const payload =
            newDecision === "reject"
                ? { reason: "changed_decision", note: "تغییر تصمیم ادمین" }
                : {};

        router.patch(url, payload, {
            preserveScroll: true,
            onSuccess: () =>
                setChangeDecisionModal({
                    isOpen: false,
                    review: null,
                    newDecision: null,
                    isLoading: false,
                }),
            onError: () =>
                setChangeDecisionModal((prev) => ({
                    ...prev,
                    isLoading: false,
                })),
        });
    };

    return (
        <Layout>
            <Head title={`رزرو #${booking.id} - ${barber.name}`} />

            <div className="admin-booking-show-page">
                {/* ============ دکمه بازگشت ============ */}
                <div className="admin-booking-show-back">
                    <Link
                        href={`/admin/bookings/barber/${barber.slug}`}
                        className="back-btn"
                    >
                        <ArrowRight size={20} />
                        <span>بازگشت به رزروهای {barber.name}</span>
                    </Link>
                </div>

                {/* ============ هدر با وضعیت ============ */}
                <div
                    className="admin-booking-show-header"
                    style={{
                        background: `linear-gradient(135deg, ${config.bg} 0%, #ffffff 100%)`,
                        borderColor: config.border,
                    }}
                >
                    <div
                        className="admin-booking-show-header-icon"
                        style={{
                            backgroundColor: config.bg,
                            color: config.color,
                            borderColor: config.border,
                        }}
                    >
                        <StatusIcon size={28} />
                    </div>

                    <div className="admin-booking-show-header-content">
                        <div className="admin-booking-show-header-top">
                            <span
                                className="admin-booking-show-status-badge"
                                style={{
                                    backgroundColor: config.bg,
                                    color: config.color,
                                    borderColor: config.border,
                                }}
                            >
                                <StatusIcon size={14} />
                                {config.label}
                            </span>

                            <span className="admin-booking-show-code">
                                <Hash size={14} />
                                رزرو {toPersianNumber(booking.id)}
                            </span>

                            {/* Badge پرداخت */}
                            {paymentConfig && (
                                <span
                                    className="admin-booking-show-payment-badge"
                                    style={{
                                        backgroundColor: paymentConfig.bg,
                                        color: paymentConfig.color,
                                        borderColor: paymentConfig.border,
                                    }}
                                >
                                    <PaymentIcon size={12} />
                                    {paymentConfig.label}
                                </span>
                            )}
                        </div>

                        <h1 className="admin-booking-show-title">
                            {config.description}
                        </h1>

                        <p className="admin-booking-show-subtitle">
                            ثبت شده در {formatFullDateTime(booking.created_at)}
                        </p>
                    </div>
                </div>

                {/* ============ گرید اصلی ============ */}
                <div className="admin-booking-show-grid">
                    {/* ============ ستون راست: جزئیات ============ */}
                    <div className="admin-booking-show-main">
                        {/* کارت اطلاعات مشتری */}
                        <div className="admin-booking-show-card">
                            <div className="admin-booking-show-card-header">
                                <div className="card-icon-box blue">
                                    <User size={20} />
                                </div>
                                <h2 className="card-title">اطلاعات مشتری</h2>
                            </div>

                            {booking.customer ? (
                                <div className="customer-info-card">
                                    <div className="customer-info-avatar">
                                        {booking.customer.thumbnail ? (
                                            <img
                                                src={booking.customer.thumbnail}
                                                alt={booking.customer.name}
                                            />
                                        ) : (
                                            <span>
                                                {booking.customer.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="customer-info-content">
                                        <h3 className="customer-info-name">
                                            {booking.customer.name}
                                        </h3>

                                        <div className="customer-info-contact">
                                            {booking.customer.phone && (
                                                <a
                                                    href={`tel:${booking.customer.phone}`}
                                                    className="contact-item"
                                                >
                                                    <Phone size={14} />
                                                    <span dir="ltr">
                                                        {toPersianNumber(
                                                            booking.customer
                                                                .phone,
                                                        )}
                                                    </span>
                                                </a>
                                            )}

                                            {booking.customer.email && (
                                                <a
                                                    href={`mailto:${booking.customer.email}`}
                                                    className="contact-item"
                                                >
                                                    <Mail size={14} />
                                                    <span dir="ltr">
                                                        {booking.customer.email}
                                                    </span>
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <Link
                                        href={`/admin/users/${booking.customer.id}`}
                                        className="view-customer-btn"
                                    >
                                        <User size={14} />
                                        پروفایل مشتری
                                    </Link>
                                </div>
                            ) : (
                                <p className="empty-text">
                                    اطلاعات مشتری یافت نشد.
                                </p>
                            )}
                        </div>

                        {/* کارت زمان و خدمت */}
                        <div className="admin-booking-show-card">
                            <div className="admin-booking-show-card-header">
                                <div className="card-icon-box green">
                                    <CalendarClock size={20} />
                                </div>
                                <h2 className="card-title">زمان و خدمت</h2>
                            </div>

                            <div className="booking-info-grid">
                                <div className="info-block">
                                    <div className="info-icon">
                                        <Calendar size={16} />
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">
                                            تاریخ
                                        </span>
                                        <span className="info-value">
                                            {getDayName(booking.date)}{" "}
                                            {formatJalaliDate(booking.date)}
                                        </span>
                                    </div>
                                </div>

                                <div className="info-block">
                                    <div className="info-icon">
                                        <Clock size={16} />
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">ساعت</span>
                                        <span className="info-value">
                                            {toPersianTimeRange(
                                                booking.start_time,
                                                booking.end_time,
                                            )}
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
                                        <Clock size={16} />
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">
                                            مدت زمان
                                        </span>
                                        <span className="info-value">
                                            {toPersianNumber(
                                                booking.service?.duration,
                                            )}{" "}
                                            دقیقه
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {booking.service?.description && (
                                <div className="service-description-box">
                                    <FileText size={14} />
                                    <p>{booking.service.description}</p>
                                </div>
                            )}
                        </div>

                        {/* کارت پرداخت */}
                        {booking.payment && (
                            <div className="admin-booking-show-card">
                                <div className="admin-booking-show-card-header">
                                    <div className="card-icon-box purple">
                                        <CreditCard size={20} />
                                    </div>
                                    <h2 className="card-title">
                                        اطلاعات پرداخت
                                    </h2>
                                </div>

                                <div className="payment-info-grid">
                                    <div className="payment-info-item">
                                        <span className="payment-info-label">
                                            درگاه پرداخت
                                        </span>
                                        <span className="payment-info-value">
                                            {gatewayLabels[
                                                booking.payment.gateway
                                            ] || booking.payment.gateway}
                                        </span>
                                    </div>

                                    <div className="payment-info-item">
                                        <span className="payment-info-label">
                                            شماره تراکنش
                                        </span>
                                        <span
                                            className="payment-info-value mono"
                                            dir="ltr"
                                        >
                                            {booking.payment.transaction_id ||
                                                "-"}
                                        </span>
                                    </div>

                                    <div className="payment-info-item">
                                        <span className="payment-info-label">
                                            تاریخ پرداخت
                                        </span>
                                        <span className="payment-info-value">
                                            {formatFullDateTime(
                                                booking.payment.paid_at,
                                            )}
                                        </span>
                                    </div>

                                    <div className="payment-info-item">
                                        <span className="payment-info-label">
                                            وضعیت
                                        </span>
                                        <span
                                            className="payment-status-badge"
                                            style={{
                                                backgroundColor:
                                                    paymentConfig.bg,
                                                color: paymentConfig.color,
                                                borderColor:
                                                    paymentConfig.border,
                                            }}
                                        >
                                            <PaymentIcon size={12} />
                                            {paymentConfig.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="payment-total">
                                    <span className="payment-total-label">
                                        <DollarSign size={16} />
                                        مبلغ پرداخت شده
                                    </span>
                                    <span className="payment-total-value">
                                        {toPersianNumber(
                                            booking.amount.toLocaleString(),
                                        )}{" "}
                                        <span className="currency">تومان</span>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* کارت نظر */}
                        {booking.review && (
                            <div className="admin-booking-show-card">
                                <div className="admin-booking-show-card-header">
                                    <div className="card-icon-box yellow">
                                        <Star
                                            size={20}
                                            fill="#fbbf24"
                                            color="#fbbf24"
                                        />
                                    </div>
                                    <h2 className="card-title">نظر مشتری</h2>
                                </div>

                                {/* ============ وضعیت نظر ============ */}
                                <div
                                    className="review-status-section"
                                    style={{ marginBottom: "10px" }}
                                >
                                    <div className="review-status-main">
                                        <div
                                            className={`review-status-badge status-${booking.review.status}`}
                                        >
                                            <ReviewStatusIcon size={14} />
                                            <span>
                                                {booking.review.status_label}
                                            </span>
                                        </div>

                                        {isFinalized &&
                                            booking.review.moderated_at && (
                                                <div className="review-moderated-info">
                                                    <Shield size={12} />
                                                    <span className="moderated-action">
                                                        {isApproved
                                                            ? "تایید شده"
                                                            : "رد شده"}
                                                    </span>
                                                    {booking.review.moderated_by
                                                        ?.name && (
                                                        <>
                                                            <span className="moderated-separator">
                                                                •
                                                            </span>
                                                            <span className="moderated-by">
                                                                {
                                                                    booking
                                                                        .review
                                                                        .moderated_by
                                                                        .name
                                                                }
                                                            </span>
                                                        </>
                                                    )}
                                                    <span className="moderated-separator">
                                                        •
                                                    </span>
                                                    <span className="moderated-date">
                                                        {formatFullDateTime(
                                                            booking.review
                                                                .moderated_at,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                    </div>
                                </div>

                                <div className="review-display">
                                    <div className="review-display-header">
                                        <RatingStars
                                            rating={booking.review.rating}
                                            size={16}
                                            showNumber={false}
                                            showTotal={false}
                                        />
                                        <span className="review-display-date">
                                            {formatFullDateTime(
                                                booking.review.created_at,
                                            )}
                                        </span>
                                    </div>

                                    {booking.review.comment && (
                                        <p className="review-display-comment">
                                            {booking.review.comment}
                                        </p>
                                    )}
                                </div>
                                <div className="review-actions">
                                    {isPending && (
                                        <>
                                            <button
                                                type="button"
                                                className="review-action-btn approve"
                                                onClick={() =>
                                                    handleApprove(
                                                        booking.review.id,
                                                    )
                                                }
                                            >
                                                <CheckCircle size={14} />
                                                <span>تایید نظر</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="review-action-btn reject"
                                                onClick={() =>
                                                    openRejectModal(
                                                        booking.review,
                                                    )
                                                }
                                            >
                                                <XCircle size={14} />
                                                <span>رد نظر</span>
                                            </button>
                                        </>
                                    )}
                                    {isApproved && (
                                        <button
                                            type="button"
                                            className="review-action-btn change-decision"
                                            onClick={() =>
                                                handleChangeDecision(
                                                    booking.review,
                                                    "reject",
                                                )
                                            }
                                        >
                                            <RefreshCw size={14} />
                                            <span>تغییر تصمیم به رد</span>
                                        </button>
                                    )}

                                    {isRejected && (
                                        <button
                                            type="button"
                                            className="review-action-btn change-decision"
                                            onClick={() =>
                                                handleChangeDecision(
                                                    booking.review,
                                                    "approve",
                                                )
                                            }
                                        >
                                            <RefreshCw size={14} />
                                            <span>تغییر تصمیم به تایید</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ============ ستون چپ: عملیات ============ */}
                    <div className="admin-booking-show-sidebar">
                        {/* خلاصه */}
                        <div className="admin-booking-show-card summary-card">
                            <div className="admin-booking-show-card-header">
                                <div className="card-icon-box green">
                                    <DollarSign size={20} />
                                </div>
                                <h2 className="card-title">خلاصه</h2>
                            </div>

                            <div className="summary-list">
                                <div className="summary-row">
                                    <span className="summary-row-label">
                                        مبلغ خدمت
                                    </span>
                                    <span className="summary-row-value">
                                        {toPersianNumber(
                                            (
                                                booking.service?.price || 0
                                            ).toLocaleString(),
                                        )}{" "}
                                        تومان
                                    </span>
                                </div>

                                <div className="summary-divider"></div>

                                <div className="summary-row total">
                                    <span className="summary-row-label">
                                        مبلغ نهایی
                                    </span>
                                    <span className="summary-row-value">
                                        {toPersianNumber(
                                            booking.amount.toLocaleString(),
                                        )}{" "}
                                        <span className="currency">تومان</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات آرایشگر */}
                        <div className="admin-booking-show-card">
                            <div className="admin-booking-show-card-header">
                                <div className="card-icon-box blue">
                                    <Award size={20} />
                                </div>
                                <h2 className="card-title">آرایشگر</h2>
                            </div>

                            <Link
                                href={`/admin/barbers/${barber.slug}/detail`}
                                className="barber-mini-card"
                            >
                                <div className="barber-mini-avatar">
                                    {barber.thumbnail ? (
                                        <img
                                            src={barber.thumbnail}
                                            alt={barber.name}
                                        />
                                    ) : (
                                        <span>
                                            {barber.name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="barber-mini-info">
                                    <span className="barber-mini-name">
                                        {barber.name}
                                    </span>
                                    <span className="barber-mini-label">
                                        مشاهده پروفایل
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* دکمه‌های عملیات */}
                        <div className="admin-booking-show-card actions-card">
                            <div className="admin-booking-show-card-header">
                                <div className="card-icon-box gray">
                                    <Info size={20} />
                                </div>
                                <h2 className="card-title">عملیات</h2>
                            </div>

                            <div className="actions-list">
                                {/* چاپ */}
                                <button
                                    type="button"
                                    className="action-btn print"
                                    onClick={handlePrint}
                                >
                                    <Printer size={16} />
                                    <span>چاپ رسید</span>
                                </button>

                                {/* تماس با مشتری */}
                                {booking.customer?.phone && (
                                    <a
                                        href={`tel:${booking.customer.phone}`}
                                        className="action-btn contact"
                                    >
                                        <Phone size={16} />
                                        <span>تماس با مشتری</span>
                                    </a>
                                )}
                                {canAdminComplete && (
                                    <button
                                        type="button"
                                        className="action-btn complete-admin"
                                        onClick={() =>
                                            setCompleteModal({
                                                isOpen: true,
                                                isLoading: false,
                                                reason: "",
                                                errors: {},
                                            })
                                        }
                                    >
                                        <CheckCircle size={16} />
                                        <span>تکمیل خدمت (ادمین)</span>
                                    </button>
                                )}

                                {/* لغو رزرو */}
                                {["pending"].includes(booking.status) && (
                                    <button
                                        type="button"
                                        className="action-btn cancel"
                                        onClick={() =>
                                            setCancelModal({
                                                isOpen: true,
                                                isLoading: false,
                                            })
                                        }
                                    >
                                        <Ban size={16} />
                                        <span>لغو رزرو</span>
                                    </button>
                                )}
                            </div>

                            {/* هشدار */}
                            {booking.status === "pending" && (
                                <div className="info-box warning">
                                    <AlertCircle size={14} />
                                    <p>این رزرو در انتظار تایید آرایشگر است.</p>
                                </div>
                            )}
                        </div>

                        {/* راهنما */}
                        <div className="admin-booking-show-card">
                            <div className="admin-booking-show-card-header">
                                <div className="card-icon-box gray">
                                    <Shield size={20} />
                                </div>
                                <h2 className="card-title">راهنما</h2>
                            </div>

                            <ul className="status-guide-list">
                                <li>
                                    <CheckCircle size={14} />
                                    <span>
                                        این صفحه فقط برای مشاهده توسط ادمین است.
                                    </span>
                                </li>
                                <li>
                                    <AlertCircle size={14} />
                                    <span>
                                        برای تغییر وضعیت، از پنل آرایشگر استفاده
                                        کنید.
                                    </span>
                                </li>
                                <li>
                                    <Ban size={14} />
                                    <span>
                                        لغو رزرو باید با دلیل انجام شود.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            {/* ============ Modal تکمیل خدمت ============ */}
            {completeModal.isOpen && (
                <div
                    className="complete-admin-modal-overlay"
                    onClick={() =>
                        !completeModal.isLoading &&
                        setCompleteModal((prev) => ({ ...prev, isOpen: false }))
                    }
                >
                    <div
                        className="complete-admin-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* هدر */}
                        <div className="complete-admin-modal-header">
                            <div className="complete-admin-icon">
                                <AlertCircle size={28} />
                            </div>
                            <h3>تکمیل خدمت توسط ادمین</h3>
                        </div>

                        {/* هشدار */}
                        <div className="complete-admin-warning">
                            <AlertCircle size={16} />
                            <p>
                                <strong>توجه:</strong> این عملیات معمولاً توسط
                                آرایشگر انجام می‌شود. با تایید، رزرو به وضعیت
                                "تکمیل شده" تغییر می‌کند و این اقدام در لاگ
                                سیستم ثبت می‌شود.
                            </p>
                        </div>

                        {/* اطلاعات رزرو */}
                        <div className="complete-admin-info">
                            <div className="info-row">
                                <span>مشتری:</span>
                                <strong>{booking.customer?.name}</strong>
                            </div>
                            <div className="info-row">
                                <span>خدمت:</span>
                                <strong>{booking.service?.name}</strong>
                            </div>
                            <div className="info-row">
                                <span>تاریخ:</span>
                                <strong>
                                    {formatJalaliDate(booking.date)}
                                </strong>
                            </div>
                            <div className="info-row">
                                <span>مبلغ:</span>
                                <strong>
                                    {toPersianNumber(
                                        booking.amount.toLocaleString(),
                                    )}{" "}
                                    تومان
                                </strong>
                            </div>
                        </div>

                        {/* فیلد دلیل */}
                        <div className="complete-admin-form-group">
                            <label className="form-label">
                                دلیل تکمیل توسط ادمین
                                <span className="required">*</span>
                            </label>
                            <textarea
                                className={`form-textarea ${
                                    completeModal.errors.reason ? "error" : ""
                                }`}
                                value={completeModal.reason}
                                onChange={(e) =>
                                    setCompleteModal((prev) => ({
                                        ...prev,
                                        reason: e.target.value,
                                        errors: {},
                                    }))
                                }
                                placeholder="مثلاً: آرایشگر فراموش کرده بود تایید کند و مشتری تایید انجام خدمت را ارسال کرده است..."
                                rows={4}
                                maxLength={500}
                                disabled={completeModal.isLoading}
                            />
                            <div className="char-counter">
                                {toPersianNumber(completeModal.reason.length)} /{" "}
                                {toPersianNumber(500)}
                            </div>
                            {completeModal.errors.reason && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{completeModal.errors.reason}</span>
                                </div>
                            )}
                        </div>

                        {/* دکمه‌ها */}
                        <div className="complete-admin-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() =>
                                    setCompleteModal((prev) => ({
                                        ...prev,
                                        isOpen: false,
                                    }))
                                }
                                disabled={completeModal.isLoading}
                            >
                                انصراف
                            </button>
                            <button
                                type="button"
                                className="btn-confirm"
                                onClick={handleCompleteBooking}
                                disabled={completeModal.isLoading}
                            >
                                {completeModal.isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        در حال تکمیل...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        بله، تکمیل کن
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============ Modal لغو رزرو ============ */}
            <ConfirmModal
                isOpen={cancelModal.isOpen}
                onClose={() =>
                    setCancelModal({ isOpen: false, isLoading: false })
                }
                onConfirm={handleCancelBooking}
                title="لغو رزرو توسط ادمین"
                message={`آیا از لغو رزرو #${booking.id} برای مشتری "${booking.customer?.name}" مطمئن هستید؟ `}
                confirmText="بله، لغو کن"
                cancelText="انصراف"
                type="danger"
                isLoading={cancelModal.isLoading}
            />

            {rejectModal.isOpen && rejectModal.review && (
                <div
                    className="reject-modal-overlay"
                    onClick={() => !rejectModal.isLoading && closeRejectModal()}
                >
                    <div
                        className="reject-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ============ هدر ============ */}
                        <div className="reject-modal-header">
                            <div className="reject-modal-icon">
                                <XCircle size={28} />
                            </div>
                            <h3>رد نظر</h3>
                            <button
                                type="button"
                                className="reject-modal-close"
                                onClick={closeRejectModal}
                                disabled={rejectModal.isLoading}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* ============ هشدار ============ */}
                        <div className="reject-modal-warning">
                            <AlertTriangle size={16} />
                            <p>
                                با رد این نظر، از دید عمومی مخفی می‌شود و امتیاز
                                آرایشگر بازمحاسبه خواهد شد. این عملیات قابل
                                بازگشت است.
                            </p>
                        </div>

                        {/* ============ پیش‌نمایش نظر ============ */}
                        <div className="reject-modal-preview">
                            <div className="preview-header">
                                <div className="preview-user">
                                    {booking.customer?.thumbnail ? (
                                        <img
                                            src={booking.customer.thumbnail}
                                            alt={booking.customer.name}
                                        />
                                    ) : (
                                        <span>
                                            {booking.customer?.name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                    <span className="preview-user-name">
                                        {booking.customer?.name}
                                    </span>
                                </div>

                                <RatingStars
                                    rating={rejectModal.review.rating}
                                    size={14}
                                    showNumber={false}
                                    showTotal={false}
                                />
                            </div>

                            {rejectModal.review.comment && (
                                <p className="preview-comment">
                                    {rejectModal.review.comment.length > 200
                                        ? rejectModal.review.comment.substring(
                                              0,
                                              200,
                                          ) + "..."
                                        : rejectModal.review.comment}
                                </p>
                            )}
                        </div>

                        {/* ============ انتخاب دلیل ============ */}
                        <div className="reject-form-group">
                            <label className="form-label">
                                دلیل رد نظر
                                <span className="required">*</span>
                            </label>

                            <div className="reject-reasons-list">
                                {rejectionReasons.map((reasonOption) => {
                                    const isSelected =
                                        rejectModal.reason ===
                                        reasonOption.value;

                                    return (
                                        <button
                                            key={reasonOption.value}
                                            type="button"
                                            className={`reject-reason-option ${
                                                isSelected ? "selected" : ""
                                            }`}
                                            onClick={() =>
                                                setRejectModal((prev) => ({
                                                    ...prev,
                                                    reason: reasonOption.value,
                                                    errors: {
                                                        ...prev.errors,
                                                        reason: undefined,
                                                    },
                                                }))
                                            }
                                            disabled={rejectModal.isLoading}
                                        >
                                            <span className="reason-radio">
                                                {isSelected && (
                                                    <Check size={12} />
                                                )}
                                            </span>
                                            <div className="reason-content">
                                                <span className="reason-label">
                                                    {reasonOption.label}
                                                </span>
                                                <span className="reason-description">
                                                    {reasonOption.description}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {rejectModal.errors?.reason && (
                                <div className="form-error">
                                    <AlertCircle size={12} />
                                    <span>{rejectModal.errors.reason}</span>
                                </div>
                            )}
                        </div>

                        {/* ============ توضیحات ============ */}
                        <div className="reject-form-group">
                            <label className="form-label">
                                توضیحات
                                {rejectModal.reason === "other" && (
                                    <span className="required">*</span>
                                )}
                            </label>
                            <textarea
                                className={`form-textarea ${
                                    rejectModal.errors?.note ? "error" : ""
                                }`}
                                value={rejectModal.note}
                                onChange={(e) =>
                                    setRejectModal((prev) => ({
                                        ...prev,
                                        note: e.target.value,
                                        errors: {
                                            ...prev.errors,
                                            note: undefined,
                                        },
                                    }))
                                }
                                placeholder={
                                    rejectModal.reason === "other"
                                        ? "لطفاً دلیل رد نظر را بنویسید..."
                                        : "توضیحات تکمیلی (اختیاری)..."
                                }
                                rows={3}
                                maxLength={500}
                                disabled={rejectModal.isLoading}
                            />
                            <div className="form-footer">
                                {rejectModal.errors?.note ? (
                                    <span className="form-error">
                                        <AlertCircle size={12} />
                                        {rejectModal.errors.note}
                                    </span>
                                ) : (
                                    <span className="form-hint">
                                        حداکثر ۵۰۰ کاراکتر
                                    </span>
                                )}
                                <span className="form-counter" dir="ltr">
                                    {toPersianNumber(rejectModal.note.length)} /
                                    ۵۰۰
                                </span>
                            </div>
                        </div>

                        {/* ============ دکمه‌ها ============ */}
                        <div className="reject-modal-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={closeRejectModal}
                                disabled={rejectModal.isLoading}
                            >
                                انصراف
                            </button>
                            <button
                                type="button"
                                className="btn-confirm reject"
                                onClick={handleReject}
                                disabled={
                                    rejectModal.isLoading || !rejectModal.reason
                                }
                            >
                                {rejectModal.isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        در حال رد...
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={16} />
                                        رد نظر
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={changeDecisionModal.isOpen}
                onClose={() =>
                    setChangeDecisionModal({
                        isOpen: false,
                        review: null,
                        newDecision: null,
                        isLoading: false,
                    })
                }
                onConfirm={confirmChangeDecision}
                title={
                    changeDecisionModal.newDecision === "approve"
                        ? "تغییر به تایید"
                        : "تغییر به رد"
                }
                message={
                    changeDecisionModal.newDecision === "approve"
                        ? "آیا از تغییر تصمیم به «تایید» مطمئن هستید؟ نظر دوباره در دید عمومی نمایش داده میشود و امتیاز آرایشگر بازمحاسبه میشود."
                        : "آیا از تغییر تصمیم به «رد» مطمئن هستید؟ نظر از دید عمومی مخفی میشود و امتیاز آرایشگر بازمحاسبه میشود."
                }
                confirmText="بله، تغییر بده"
                cancelText="انصراف"
                type={
                    changeDecisionModal.newDecision === "approve"
                        ? "success"
                        : "danger"
                }
                isLoading={changeDecisionModal.isLoading}
            />
        </Layout>
    );
}
