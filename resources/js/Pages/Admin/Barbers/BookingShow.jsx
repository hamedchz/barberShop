import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import ConfirmModal from "../Components/ConfirmModal";
import RatingStars from "../../Customer/Components/RatingStars";
import ApproveReviewModal from "../Reviews/Components/ApproveReviewModal";
import RejectReviewModal from "../Reviews/Components/RejectReviewModal";
import DeleteReviewModal from "../Reviews/Components/DeleteReviewModal";
import RestoreReviewModal from "../Reviews/Components/RestoreReviewModal";
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
    Trash2,
    RotateCcw,
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

// ============ دلایل رد نظر ============
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

// ============ Map وضعیت نظر به آیکون ============
const reviewStatusIcons = {
    pending: Clock4,
    approved: CheckCircle,
    rejected: XCircle,
    flagged: AlertTriangle,
};

export default function BarberBookingShow({ auth, barber, booking }) {
    const isPending =
        booking.review.status === "pending" && !booking.review.is_deleted;
    const isApproved =
        booking.review.status === "approved" && !booking.review.is_deleted;
    const isRejected =
        booking.review.status === "rejected" && !booking.review.is_deleted;
    const isDeleted = booking.review.is_deleted;

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
        setApproveModal({
            isOpen: true,
            review: booking.review,
            isLoading: false,
        });
    const openReject = () =>
        setRejectModal({
            isOpen: true,
            review: booking.review,
            isLoading: false,
        });
    const openDelete = () =>
        setDeleteModal({
            isOpen: true,
            review: booking.review,
            isLoading: false,
        });
    const openRestore = () =>
        setRestoreModal({
            isOpen: true,
            review: booking.review,
            isLoading: false,
        });
    // ============ Modal states ============
    // const [rejectModal, setRejectModal] = useState({
    //     isOpen: false,
    //     review: null,
    //     reason: "",
    //     note: "",
    //     isLoading: false,
    //     errors: {},
    // });

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

    const [changeDecisionModal, setChangeDecisionModal] = useState({
        isOpen: false,
        review: null,
        newDecision: null, // "approve" | "reject"
        isLoading: false,
    });

    // ============ Loading states ============
    const [loading, setLoading] = useState(null); // "approve" | null

    // ============ Config های محاسبه‌شده ============
    const config = statusConfig[booking.status] ?? statusConfig.pending;
    const StatusIcon = config.icon;

    const paymentConfig = booking.payment
        ? (paymentStatusConfig[booking.payment.status] ??
          paymentStatusConfig.pending)
        : null;
    const PaymentIcon = paymentConfig?.icon;

    // ============ وضعیت نظر (امن برای null) ============
    const reviewStatus = booking.review?.status; // ← optional chaining

    const ReviewStatusIcon = reviewStatusIcons[reviewStatus] ?? Clock4;
    // const isPending = reviewStatus === "pending";
    // const isApproved = reviewStatus === "approved";
    // const isRejected = reviewStatus === "rejected";
    const isFlagged = reviewStatus === "flagged";
    const isFinalized = isApproved || isRejected;

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
        if (completeModal.reason.trim().length < 10) {
            setCompleteModal((prev) => ({
                ...prev,
                errors: { reason: "دلیل باید حداقل ۱۰ کاراکتر باشد." },
            }));
            return;
        }

        setCompleteModal((prev) => ({ ...prev, isLoading: true }));

        router.patch(
            `/admin/bookings/${barber.id}/barbers/${booking.id}/complete`,
            { reason: completeModal.reason.trim() },
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

    // ============ تایید نظر ============
    const handleApprove = (reviewId) => {
        setLoading("approve");
        router.patch(
            `/admin/reviews/${reviewId}/approve`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setLoading(null),
            },
        );
    };

    // ============ باز کردن مدال رد ============
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

    // ============ بستن مدال رد ============
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

    // ============ ارسال رد ============
    const handleReject = () => {
        const { review, reason, note } = rejectModal;

        // محافظت: اگه review نال باشه
        if (!review?.id) {
            console.error("Review not found");
            return;
        }

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

    // ============ تغییر تصمیم ============
    const handleChangeDecision = (review, newDecision) => {
        setChangeDecisionModal({
            isOpen: true,
            review,
            newDecision,
            isLoading: false,
        });
    };

    const confirmChangeDecision = () => {
        const { review, newDecision } = changeDecisionModal;

        if (!review?.id || !newDecision) {
            console.error("Invalid change decision payload");
            return;
        }

        setChangeDecisionModal((prev) => ({ ...prev, isLoading: true }));

        const url =
            newDecision === "approve"
                ? `/admin/reviews/${review.id}/approve`
                : `/admin/reviews/${review.id}/reject`;

        // ⚠️ reason باید یکی از مقادیر مجاز rejectionReasons باشه
        const payload =
            newDecision === "reject"
                ? { reason: "false_review_dispute", note: "تغییر تصمیم ادمین" }
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
            onError: (errors) => {
                console.error("Change decision failed:", errors);
                setChangeDecisionModal((prev) => ({
                    ...prev,
                    isLoading: false,
                }));
            },
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
                                        href={`/admin/customers/${booking.customer.id}`}
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
                        {booking.payment && paymentConfig && (
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
                            <div className="booking-review-card">
                                {/* ============ هدر ============ */}
                                <div className="booking-review-card-header">
                                    <div className="booking-review-card-icon">
                                        <Star
                                            size={20}
                                            fill="#fbbf24"
                                            color="#fbbf24"
                                        />
                                    </div>
                                    <div className="booking-review-card-title">
                                        <h2>نظر مشتری</h2>
                                        <div className="booking-review-card-meta">
                                            <span className="booking-review-card-date">
                                                <Calendar size={11} />
                                                {formatFullDateTime(
                                                    booking.review.created_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* badge وضعیت */}
                                    <div
                                        className={`booking-review-status status-${reviewStatus ?? "unknown"}`}
                                    >
                                        <ReviewStatusIcon size={12} />
                                        <span>
                                            {booking.review.status_label ??
                                                booking.review.status ??
                                                "نامشخص"}
                                        </span>
                                    </div>
                                </div>

                                {/* ============ امتیاز و متن ============ */}
                                <div className="booking-review-card-body">
                                    <div className="booking-review-card-rating">
                                        <div className="booking-review-card-stars">
                                            <RatingStars
                                                rating={booking.review.rating}
                                                size={20}
                                                showNumber={false}
                                                showTotal={false}
                                            />
                                        </div>
                                        <div className="booking-review-card-score">
                                            <strong>
                                                {toPersianNumber(
                                                    booking.review.rating,
                                                )}
                                            </strong>
                                            <span>از ۵</span>
                                        </div>
                                    </div>

                                    {booking.review.comment ? (
                                        <blockquote className="booking-review-card-comment">
                                            {booking.review.comment}
                                        </blockquote>
                                    ) : (
                                        <div className="booking-review-card-empty">
                                            <MessageSquare size={16} />
                                            <span>این نظر بدون متن است</span>
                                        </div>
                                    )}

                                    {/* اطلاعات بررسی */}
                                    {isFinalized &&
                                        booking.review.moderated_at && (
                                            <div className="booking-review-card-moderation">
                                                <div className="booking-review-card-moderation-icon">
                                                    <Shield size={12} />
                                                </div>
                                                <div className="booking-review-card-moderation-content">
                                                    <span
                                                        className={`booking-review-card-moderation-action ${isApproved ? "approved" : "rejected"}`}
                                                    >
                                                        {isApproved
                                                            ? "تایید شده"
                                                            : "رد شده"}
                                                    </span>
                                                    {booking.review.moderated_by
                                                        ?.name && (
                                                        <span className="booking-review-card-moderation-by">
                                                            توسط{" "}
                                                            {
                                                                booking.review
                                                                    .moderated_by
                                                                    .name
                                                            }
                                                        </span>
                                                    )}
                                                    <span className="booking-review-card-moderation-date">
                                                        {formatFullDateTime(
                                                            booking.review
                                                                .moderated_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                    {/* دلیل رد */}
                                    {booking.review.rejection_reason && (
                                        <div className="booking-review-card-rejection">
                                            <AlertCircle size={14} />
                                            <div>
                                                <strong>دلیل رد:</strong>{" "}
                                                {
                                                    booking.review
                                                        .rejection_reason
                                                }
                                            </div>
                                        </div>
                                    )}

                                    {/* یادداشت */}
                                    {booking.review.moderation_note && (
                                        <div className="booking-review-card-note">
                                            <Info size={14} />
                                            <div>
                                                <strong>یادداشت:</strong>{" "}
                                                {booking.review.moderation_note}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ============ پیام حذف ============ */}
                                {isDeleted && (
                                    <div className="booking-review-card-deleted">
                                        <AlertTriangle size={16} />
                                        <div>
                                            <strong>
                                                این نظر حذف شده است.
                                            </strong>
                                            <p>
                                                با بازیابی، به وضعیت «در انتظار
                                                بررسی» برمی‌گردد و باید دوباره
                                                بررسی شود.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* ============ اکشن‌ها ============ */}
                                <div className="booking-review-card-actions">
                                    {isPending && (
                                        <>
                                            <button
                                                type="button"
                                                className="booking-review-btn approve"
                                                onClick={openApprove}
                                                disabled={loading === "approve"}
                                            >
                                                {loading === "approve" ? (
                                                    <>
                                                        <span className="booking-review-spinner" />
                                                        در حال تایید...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle
                                                            size={14}
                                                        />
                                                        تایید نظر
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                className="booking-review-btn reject"
                                                onClick={openReject}
                                            >
                                                <XCircle size={14} />
                                                رد نظر
                                            </button>
                                        </>
                                    )}

                                    {isApproved && (
                                        <button
                                            type="button"
                                            className="booking-review-btn change-reject"
                                            onClick={openReject}
                                        >
                                            <RefreshCw size={14} />
                                            تغییر به رد
                                        </button>
                                    )}

                                    {isRejected && (
                                        <button
                                            type="button"
                                            className="booking-review-btn change-approve"
                                            onClick={openApprove}
                                        >
                                            <RefreshCw size={14} />
                                            تغییر به تایید
                                        </button>
                                    )}

                                    {!isDeleted && (
                                        <button
                                            type="button"
                                            className="booking-review-btn delete"
                                            onClick={openDelete}
                                            title="حذف نظر"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}

                                    {isDeleted && (
                                        <button
                                            type="button"
                                            className="booking-review-btn restore"
                                            onClick={openRestore}
                                        >
                                            <RotateCcw size={14} />
                                            بازیابی
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
