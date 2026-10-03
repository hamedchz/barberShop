import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PublicLayout from "../Layouts/PublicLayout";
import ConfirmModal from "../../Admin/Components/ConfirmModal";
import RatingStars from "../Components/RatingStars";
import "../Assets/BookingShow.css";
import {
    ArrowRight,
    Calendar,
    Clock,
    Scissors,
    DollarSign,
    User,
    Phone,
    MapPin,
    CheckCircle,
    XCircle,
    Clock4,
    Star,
    AlertCircle,
    Hash,
    CreditCard,
    Printer,
    Award,
    Building2,
    CalendarClock,
    Info,
    FileText,
    Shield,
    RefreshCw,
    Hourglass,
    Ban,
    CheckCheck,
    Edit3,
    Trash2,
    X,
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
    return `${toPersianNumber(jy)}/${toPersianNumber(
        String(jm).padStart(2, "0"),
    )}/${toPersianNumber(String(jd).padStart(2, "0"))}`;
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

// ============ وضعیت‌ها ============
// ============ وضعیت‌های پرداخت ============
const statusConfig = {
    pending: {
        label: "در انتظار پرداخت",
        icon: Clock4,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
    },
    confirmed: {
        label: "رزرو  شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#212422",
    },
    completed: {
        label: "تکمیل شده",
        icon: CheckCheck,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#212422",
    },

    success: {
        label: "موفق",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#212422",
    },
    failed: {
        label: "ناموفق",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fee2e2",
    },
    cancelled: {
        label: "لغو شده",
        icon: Ban, // ← از lucide-react
        color: "#6b7280",
        bg: "#f3f4f6",
        border: "#e5e7eb",
    },
    refunded: {
        label: "برگشت داده شده",
        icon: RefreshCw, // ← از lucide-react
        color: "#5b21b6",
        bg: "#f5f3ff",
        border: "#ddd6fe",
    },
};

// ============ کامپوننت شمارش معکوس ============
function CountdownTimer({ expiresAt }) {
    const [timeLeft, setTimeLeft] = useState({
        minutes: 0,
        seconds: 0,
        isExpired: false,
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const expires = new Date(expiresAt).getTime();
            const diff = expires - now;

            if (diff <= 0) {
                setTimeLeft({ minutes: 0, seconds: 0, isExpired: true });
                return;
            }

            const minutes = Math.floor(diff / 1000 / 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft({ minutes, seconds, isExpired: false });
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    if (timeLeft.isExpired) {
        return (
            <span className="countdown-timer expired">
                <Hourglass size={14} />
                منقضی شده
            </span>
        );
    }

    return (
        <span className="countdown-timer">
            <Hourglass size={14} />
            {toPersianNumber(timeLeft.minutes)}:
            {toPersianNumber(String(timeLeft.seconds).padStart(2, "0"))}
        </span>
    );
}

export default function BookingShow({ auth, booking }) {
    // ============ State برای Modal حذف نظر ============

    const [deleteReviewModal, setDeleteReviewModal] = useState({
        isOpen: false,
        isLoading: false,
    });
    const [cancelModal, setCancelModal] = useState({
        isOpen: false,
        isLoading: false,
    });
    const config = statusConfig[booking.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    // ============ لغو رزرو ============
    const handleConfirmCancel = () => {
        setCancelModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(`/customer/bookings/${booking.id}/cancel`, {
            preserveScroll: true,
            onSuccess: () =>
                setCancelModal({ isOpen: false, isLoading: false }),
            onError: () =>
                setCancelModal((prev) => ({ ...prev, isLoading: false })),
        });
    };

    // ============ پرداخت مجدد ============

    const handleRetryPayment = () => {
        const form = document.createElement("form");

        form.method = "POST";
        form.action = "/customer/payment/pay";
        form.target = "_blank";

        // CSRF Token
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

        const csrfInput = document.createElement("input");
        csrfInput.type = "hidden";
        csrfInput.name = "_token";
        csrfInput.value = csrfToken;

        // Booking ID
        const bookingInput = document.createElement("input");
        bookingInput.type = "hidden";
        bookingInput.name = "booking_id";
        bookingInput.value = booking.id;

        // Gateway
        const gatewayInput = document.createElement("input");
        gatewayInput.type = "hidden";
        gatewayInput.name = "gateway";
        gatewayInput.value = booking.payment?.gateway || "zarinpal";

        form.appendChild(csrfInput);
        form.appendChild(bookingInput);
        form.appendChild(gatewayInput);

        document.body.appendChild(form);

        form.submit();

        document.body.removeChild(form);
    };

    // ============ چاپ ============
    const handlePrint = () => {
        window.print();
    };

    // ============ حذف نظر ============
    const handleDeleteReview = () => {
        if (!booking.review) return;

        setDeleteReviewModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(
            `/customer/bookings/reviews/${booking.review.id}/delete`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteReviewModal({ isOpen: false, isLoading: false });
                },
                onError: () => {
                    setDeleteReviewModal((prev) => ({
                        ...prev,
                        isLoading: false,
                    }));
                },
            },
        );
    };

    return (
        <PublicLayout>
            <Head title={`جزئیات رزرو #${booking.id}`} />

            <div className="booking-show-page">
                {/* ============ دکمه بازگشت ============ */}
                <div className="booking-show-back">
                    <Link href="/customer/bookings" className="back-btn">
                        <ArrowRight size={20} />
                        <span>بازگشت به نوبت‌های من</span>
                    </Link>
                </div>

                {/* ============ هدر با وضعیت ============ */}
                <div
                    className="booking-show-header"
                    style={{
                        background: `linear-gradient(135deg, ${config.bg} 0%, #ffffff 100%)`,
                        borderColor: config.border,
                    }}
                >
                    <div
                        className="booking-show-header-icon"
                        style={{
                            backgroundColor: config.bg,
                            color: config.color,
                            borderColor: config.border,
                        }}
                    >
                        <StatusIcon size={28} />
                    </div>

                    <div className="booking-show-header-content">
                        <div className="booking-show-header-top">
                            <span
                                className="booking-show-status-badge"
                                style={{
                                    backgroundColor: config.bg,
                                    color: config.color,
                                    borderColor: config.border,
                                }}
                            >
                                <StatusIcon size={14} />
                                {config.label}
                            </span>

                            <span className="booking-show-code">
                                <Hash size={14} />
                                رزرو {toPersianNumber(booking.id)}
                            </span>

                            {/* شمارش معکوس برای pending */}
                            {booking.status === "pending" &&
                                booking.expires_at && (
                                    <CountdownTimer
                                        expiresAt={booking.expires_at}
                                    />
                                )}
                        </div>

                        <h1 className="booking-show-title">
                            {config.description}
                        </h1>

                        <p className="booking-show-subtitle">
                            ثبت شده در {formatFullDateTime(booking.created_at)}
                        </p>
                    </div>
                </div>

                {/* ============ گرید اصلی ============ */}
                <div className="booking-show-grid">
                    {/* ============ ستون راست: جزئیات رزرو ============ */}
                    <div className="booking-show-main">
                        {/* کارت زمان و خدمت */}
                        <div className="booking-show-card">
                            <div className="booking-show-card-header">
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

                        {/* کارت آرایشگر */}
                        <div className="booking-show-card">
                            <div className="booking-show-card-header">
                                <div className="card-icon-box blue">
                                    <User size={20} />
                                </div>
                                <h2 className="card-title">آرایشگر</h2>
                            </div>

                            <div className="barber-info-card">
                                <div className="barber-info-avatar">
                                    {booking.barber?.thumbnail ? (
                                        <img
                                            src={booking.barber.thumbnail}
                                            alt={booking.barber.name}
                                        />
                                    ) : (
                                        <span>
                                            {booking.barber?.name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="barber-info-content">
                                    <h3 className="barber-info-name">
                                        {booking.barber?.name}
                                    </h3>

                                    {booking.barber?.specialty && (
                                        <div className="barber-info-specialty">
                                            <Award size={12} />
                                            {booking.barber.specialty}
                                        </div>
                                    )}

                                    <div className="barber-info-contact">
                                        {booking.barber?.phone && (
                                            <a
                                                href={`tel:${booking.barber.phone}`}
                                                className="contact-item"
                                            >
                                                <Phone size={14} />
                                                <span dir="ltr">
                                                    {booking.barber.phone}
                                                </span>
                                            </a>
                                        )}

                                        {booking.barber?.city && (
                                            <span className="contact-item">
                                                <MapPin size={14} />
                                                {booking.barber.city}
                                            </span>
                                        )}
                                    </div>

                                    {booking.barber?.address && (
                                        <div className="barber-info-address">
                                            <Building2 size={14} />
                                            <span>
                                                {booking.barber.address}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Link
                                href={`/barbers/${booking.barber.slug}/details`}
                                className="view-barber-btn"
                            >
                                <User size={16} />
                                مشاهده پروفایل آرایشگر
                            </Link>
                        </div>

                        {/* کارت پرداخت */}
                        {booking.payment && (
                            <div className="booking-show-card">
                                <div className="booking-show-card-header">
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
                                            {booking.payment.gateway_label}
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

                                    {/* ============ وضعیت پرداخت ============ */}
                                    <div className="payment-info-item">
                                        <span className="payment-info-label">
                                            وضعیت
                                        </span>

                                        {(() => {
                                            const paymentConfig =
                                                statusConfig[
                                                    booking.payment.status
                                                ] || statusConfig.pending;
                                            const PaymentIcon =
                                                paymentConfig.icon;

                                            return (
                                                <span
                                                    className="payment-status"
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
                                            );
                                        })()}
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
                        {/* ============ کارت نظر ============ */}
                        {/* ============ کارت نظر ============ */}
                        {booking.review && (
                            <div className="booking-show-card review-card">
                                <div className="booking-show-card-header">
                                    <div className="card-icon-box yellow">
                                        <Star
                                            size={20}
                                            fill="#fbbf24"
                                            color="#fbbf24"
                                        />
                                    </div>

                                    <div className="review-header-info">
                                        <h2 className="card-title">نظر شما</h2>

                                        {/* ============ Badge وضعیت ============ */}
                                        {(() => {
                                            const reviewStatusConfig = {
                                                pending: {
                                                    label: "در انتظار تایید",
                                                    color: "#92400e",
                                                    bg: "#fffbeb",
                                                    border: "#fde68a",
                                                    icon: Clock4,
                                                },
                                                approved: {
                                                    label: "تایید شده",
                                                    color: "#065f46",
                                                    bg: "#ecfdf5",
                                                    border: "#d1fae5",
                                                    icon: CheckCircle,
                                                },
                                                rejected: {
                                                    label: "رد شده",
                                                    color: "#991b1b",
                                                    bg: "#fef2f2",
                                                    border: "#fee2e2",
                                                    icon: XCircle,
                                                },
                                            };

                                            const cfg =
                                                reviewStatusConfig[
                                                    booking.review.status
                                                ] || reviewStatusConfig.pending;
                                            const Icon = cfg.icon;

                                            return (
                                                <span
                                                    className="review-status-badge"
                                                    style={{
                                                        backgroundColor: cfg.bg,
                                                        color: cfg.color,
                                                        borderColor: cfg.border,
                                                    }}
                                                >
                                                    <Icon size={12} />
                                                    {cfg.label}
                                                </span>
                                            );
                                        })()}
                                    </div>

                                    {/* ============ دکمه‌های ویرایش و حذف ============ */}
                                    {booking.review.status === "pending" && (
                                        <div className="review-actions">
                                            {booking.review.can_edit && (
                                                <Link
                                                    href={`/customer/bookings/reviews/${booking.review.id}/edit`}
                                                    className="review-action-btn edit"
                                                    title="ویرایش نظر"
                                                >
                                                    <Edit3 size={14} />
                                                    <span>ویرایش</span>
                                                </Link>
                                            )}

                                            {booking.review.can_delete && (
                                                <button
                                                    type="button"
                                                    className="review-action-btn delete"
                                                    onClick={() =>
                                                        setDeleteReviewModal({
                                                            isOpen: true,
                                                            isLoading: false,
                                                        })
                                                    }
                                                    title="حذف نظر"
                                                >
                                                    <Trash2 size={14} />
                                                    <span>حذف</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* ============ نمایش نظر ============ */}
                                <div className="review-display">
                                    <div className="review-display-header">
                                        <RatingStars
                                            rating={booking.review.rating}
                                            size={18}
                                            showNumber={false}
                                            showTotal={false}
                                        />
                                        <span className="review-display-date">
                                            {formatFullDateTime(
                                                booking.review.created_at,
                                            )}
                                            {booking.review.is_edited && (
                                                <span className="review-edited-badge">
                                                    ویرایش شده
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    {booking.review.comment && (
                                        <p className="review-display-comment">
                                            {booking.review.comment}
                                        </p>
                                    )}
                                </div>

                                {/* ============ پیام راهنما ============ */}
                                {booking.review.status === "pending" && (
                                    <div className="review-info-box pending">
                                        <Clock4 size={14} />
                                        <p>
                                            <strong>در انتظار تایید:</strong>{" "}
                                            نظر شما پس از تایید ادمین، در
                                            پروفایل آرایشگر نمایش داده می‌شود.
                                            تا آن زمان می‌توانید آن را ویرایش یا
                                            حذف کنید.
                                        </p>
                                    </div>
                                )}

                                {booking.review.status === "approved" && (
                                    <div className="review-info-box approved">
                                        <CheckCircle size={14} />
                                        <p>
                                            <strong>تایید شده:</strong> نظر شما
                                            در پروفایل آرایشگر نمایش داده
                                            می‌شود.
                                        </p>
                                    </div>
                                )}

                                {booking.review.status === "rejected" && (
                                    <div className="review-info-box rejected">
                                        <XCircle size={14} />
                                        <p>
                                            <strong>رد شده:</strong> نظر شما به
                                            دلیل عدم رعایت قوانین رد شده است.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ============ ستون چپ: عملیات ============ */}
                    <div className="booking-show-sidebar">
                        {/* خلاصه پرداخت */}
                        <div className="booking-show-card summary-card">
                            <div className="booking-show-card-header">
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

                                <div className="summary-row">
                                    <span className="summary-row-label">
                                        تخفیف
                                    </span>
                                    <span className="summary-row-value">
                                        {toPersianNumber("0")} تومان
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

                        {/* دکمه‌های عملیات */}
                        <div className="booking-show-card actions-card">
                            <div className="booking-show-card-header">
                                <div className="card-icon-box gray">
                                    <Info size={20} />
                                </div>
                                <h2 className="card-title">عملیات</h2>
                            </div>

                            <div className="actions-list">
                                {/* ============ پرداخت مجدد ============ */}
                                {booking.can_pay && (
                                    <button
                                        onClick={handleRetryPayment}
                                        className="action-btn pay"
                                    >
                                        <CreditCard size={16} />
                                        <span>تکمیل پرداخت</span>
                                        <span className="action-badge">
                                            <Hourglass size={10} />
                                        </span>
                                    </button>
                                )}

                                {/* ============ ثبت نظر ============ */}
                                {booking.can_review && (
                                    <Link
                                        href={`/customer/bookings/reviews/${booking.id}`}
                                        className="action-btn review"
                                    >
                                        <Star size={16} />
                                        <span>ثبت نظر</span>
                                    </Link>
                                )}

                                {/* ============ چاپ ============ */}
                                <button
                                    className="action-btn print"
                                    onClick={handlePrint}
                                >
                                    <Printer size={16} />
                                    <span>چاپ رسید</span>
                                </button>

                                {/* ============ تماس با آرایشگر ============ */}
                                {booking.barber?.phone && (
                                    <a
                                        href={`tel:${booking.barber.phone}`}
                                        className="action-btn contact"
                                    >
                                        <Phone size={16} />
                                        <span>تماس با آرایشگر</span>
                                    </a>
                                )}

                                {/* ============ لغو رزرو ============ */}
                                {booking.can_cancel && (
                                    <button
                                        className="action-btn cancel"
                                        onClick={() =>
                                            setCancelModal({
                                                isOpen: true,
                                                isLoading: false,
                                            })
                                        }
                                    >
                                        <XCircle size={16} />
                                        <span>لغو رزرو</span>
                                    </button>
                                )}
                            </div>

                            {/* ============ پیام‌های راهنما ============ */}
                            {/* پیام پرداخت برای pending */}
                            {booking.status === "pending" &&
                                booking.can_pay && (
                                    <div className="info-box warning">
                                        <AlertCircle size={14} />
                                        <p>
                                            برای تکمیل رزرو، لطفاً مبلغ را
                                            پرداخت کنید. در غیر این صورت، رزرو
                                            به صورت خودکار لغو می‌شود.
                                        </p>
                                    </div>
                                )}

                            {/* پیام لغو برای confirmed */}
                            {booking.can_cancel &&
                                booking.status === "confirmed" && (
                                    <div className="info-box warning">
                                        <AlertCircle size={14} />
                                        <p>
                                            لغو رزرو تا ۲ ساعت قبل از زمان نوبت
                                            امکان‌پذیر است.
                                        </p>
                                    </div>
                                )}

                            {/* پیام منقضی */}
                            {booking.is_expired && (
                                <div className="info-box danger">
                                    <XCircle size={14} />
                                    <p>
                                        زمان پرداخت منقضی شده است. لطفاً رزرو
                                        جدیدی ثبت کنید.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* راهنمای وضعیت */}
                        <div className="booking-show-card status-guide-card">
                            <div className="booking-show-card-header">
                                <div className="card-icon-box gray">
                                    <Shield size={20} />
                                </div>
                                <h2 className="card-title">راهنما</h2>
                            </div>

                            <ul className="status-guide-list">
                                {booking.status === "pending" ? (
                                    <>
                                        <li>
                                            <CreditCard size={14} />
                                            <span>
                                                برای تکمیل رزرو، مبلغ را پرداخت
                                                کنید.
                                            </span>
                                        </li>
                                        <li>
                                            <Clock4 size={14} />
                                            <span>
                                                مهلت پرداخت ۱۵ دقیقه از زمان ثبت
                                                رزرو است.
                                            </span>
                                        </li>
                                        <li>
                                            <XCircle size={14} />
                                            <span>
                                                در صورت عدم پرداخت، رزرو به صورت
                                                خودکار لغو می‌شود.
                                            </span>
                                        </li>
                                    </>
                                ) : booking.status === "confirmed" ? (
                                    <>
                                        <li>
                                            <CheckCircle size={14} />
                                            <span>
                                                رزرو تایید شده به معنی پرداخت
                                                موفق و ثبت نهایی است.
                                            </span>
                                        </li>
                                        <li>
                                            <Clock4 size={14} />
                                            <span>
                                                لطفاً ۱۰ دقیقه قبل از زمان نوبت
                                                حاضر باشید.
                                            </span>
                                        </li>
                                        <li>
                                            <XCircle size={14} />
                                            <span>
                                                لغو رزرو فقط تا ۲ ساعت قبل
                                                امکان‌پذیر است.
                                            </span>
                                        </li>
                                    </>
                                ) : booking.status === "completed" ? (
                                    <>
                                        <li>
                                            <CheckCircle size={14} />
                                            <span>
                                                خدمت با موفقیت انجام شده است.
                                            </span>
                                        </li>
                                        <li>
                                            <Star size={14} />
                                            <span>
                                                می‌توانید نظر خود را ثبت کنید.
                                            </span>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li>
                                            <XCircle size={14} />
                                            <span>این رزرو لغو شده است.</span>
                                        </li>
                                        <li>
                                            <Calendar size={14} />
                                            <span>
                                                برای رزرو جدید، به صفحه
                                                آرایشگران مراجعه کنید.
                                            </span>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============ Modal حذف نظر ============ */}
            <ConfirmModal
                isOpen={deleteReviewModal.isOpen}
                onClose={() =>
                    !deleteReviewModal.isLoading &&
                    setDeleteReviewModal({ isOpen: false, isLoading: false })
                }
                onConfirm={handleDeleteReview}
                title="حذف نظر"
                message={`آیا از حذف نظر خود مطمئن هستید؟ این عملیات قابل بازگشت نیست و امتیاز آرایشگر مجدداً محاسبه می‌شود.${
                    booking.review?.comment
                        ? `\n\nنظر شما: "${booking.review.comment.substring(0, 100)}${
                              booking.review.comment.length > 100 ? "..." : ""
                          }"`
                        : ""
                }`}
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                type="danger"
                isLoading={deleteReviewModal.isLoading}
            />
        </PublicLayout>
    );
}
