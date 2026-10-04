import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import ConfirmModal from "../../Admin/Components/ConfirmModal";
import RatingStars from "../../Customer/Components/RatingStars";
import "../Assets/css/BarberBookingShow.css";
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
    CalendarClock,
    Info,
    FileText,
    Shield,
    Ban,
    Check,
    Printer,
    AlertCircle,
    AlertTriangle,
    Bot,
    MessageSquare,
} from "lucide-react";
import { toJalaali } from "jalaali-js";
import {
    toPersianNumber,
    toPersianTimeRange,
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

// ============ وضعیت رزرو ============
const statusConfig = {
    pending: {
        label: "در انتظار تایید",
        icon: Clock4,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
        description: "این رزرو در انتظار تایید شماست.",
    },
    confirmed: {
        label: "تایید شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#d1fae5",
        description: "این رزرو تایید شده است.",
    },
    completed: {
        label: "تکمیل شده",
        icon: CheckCircle,
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#dbeafe",
        description: "این خدمت با موفقیت انجام شده است.",
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

// ============ چه کسی تکمیل کرده ============
const completedByConfig = {
    barber: {
        label: "تکمیل توسط شما",
        icon: Scissors,
        color: "#065f46",
        bg: "#ecfdf5",
    },
    customer: {
        label: "تکمیل توسط مشتری",
        icon: User,
        color: "#1e40af",
        bg: "#eff6ff",
    },
    system: {
        label: "تکمیل خودکار",
        icon: Bot,
        color: "#92400e",
        bg: "#fffbeb",
    },
    admin: {
        label: "تکمیل توسط ادمین",
        icon: Shield,
        color: "#5b21b6",
        bg: "#f5f3ff",
    },
};

// ============ وضعیت پرداخت ============
const paymentStatusConfig = {
    pending: {
        label: "در انتظار پرداخت",
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
    },
    success: {
        label: "پرداخت موفق",
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#d1fae5",
    },
    failed: {
        label: "پرداخت ناموفق",
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fee2e2",
    },
    refunded: {
        label: "برگشت داده شده",
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

export default function BarberBookingShow({ auth, booking }) {
    // ============ Modal states ============
    const [completeModal, setCompleteModal] = useState({
        isOpen: false,
        isLoading: false,
    });

    const [cancelModal, setCancelModal] = useState({
        isOpen: false,
        isLoading: false,
    });

    const [disputeModal, setDisputeModal] = useState({
        isOpen: false,
        isLoading: false,
        reason: "",
        errors: {},
    });

    const config = statusConfig[booking.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    const paymentConfig = booking.payment
        ? paymentStatusConfig[booking.payment.status]
        : null;

    // ============ چاپ ============
    const handlePrint = () => {
        window.print();
    };

    // ============ تایید تکمیل ============
    const handleComplete = () => {
        setCompleteModal((prev) => ({ ...prev, isLoading: true }));

        router.patch(
            `/barber/bookings/${booking.id}/complete`,
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    setCompleteModal({ isOpen: false, isLoading: false }),
                onError: () =>
                    setCompleteModal((prev) => ({
                        ...prev,
                        isLoading: false,
                    })),
            },
        );
    };

    // ============ لغو رزرو ============
    const handleCancel = () => {
        setCancelModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(`/barber/bookings/${booking.id}/cancel`, {
            preserveScroll: true,
            onSuccess: () =>
                setCancelModal({ isOpen: false, isLoading: false }),
            onError: () =>
                setCancelModal((prev) => ({
                    ...prev,
                    isLoading: false,
                })),
        });
    };

    // ============ اعتراض به تکمیل توسط مشتری ============
    const handleDispute = () => {
        if (disputeModal.reason.length < 10) {
            setDisputeModal((prev) => ({
                ...prev,
                errors: { reason: "دلیل باید حداقل ۱۰ کاراکتر باشد." },
            }));
            return;
        }

        setDisputeModal((prev) => ({ ...prev, isLoading: true }));

        router.post(
            `/barber/bookings/${booking.id}/dispute`,
            { reason: disputeModal.reason },
            {
                preserveScroll: true,
                onSuccess: () =>
                    setDisputeModal({
                        isOpen: false,
                        isLoading: false,
                        reason: "",
                        errors: {},
                    }),
                onError: (errors) =>
                    setDisputeModal((prev) => ({
                        ...prev,
                        isLoading: false,
                        errors,
                    })),
            },
        );
    };

    // ============ کامپوننت تکمیل شده ============
    const completedByCfg = booking.completed_by
        ? completedByConfig[booking.completed_by]
        : null;

    return (
        <Layout>
            <Head title={`رزرو #${booking.id}`} />

            <div className="barber-booking-show-page">
                {/* ============ دکمه بازگشت ============ */}
                <div className="barber-booking-show-back">
                    <Link href="/barber/bookings" className="back-btn">
                        <ArrowRight size={20} />
                        <span>بازگشت به رزروها</span>
                    </Link>
                </div>

                {/* ============ هدر ============ */}
                <div
                    className="barber-booking-show-header"
                    style={{
                        background: `linear-gradient(135deg, ${config.bg} 0%, #ffffff 100%)`,
                        borderColor: config.border,
                    }}
                >
                    <div
                        className="barber-booking-show-header-icon"
                        style={{
                            backgroundColor: config.bg,
                            color: config.color,
                            borderColor: config.border,
                        }}
                    >
                        <StatusIcon size={28} />
                    </div>

                    <div className="barber-booking-show-header-content">
                        <div className="barber-booking-show-header-top">
                            <span
                                className="barber-booking-show-status-badge"
                                style={{
                                    backgroundColor: config.bg,
                                    color: config.color,
                                    borderColor: config.border,
                                }}
                            >
                                <StatusIcon size={14} />
                                {config.label}
                            </span>

                            <span className="barber-booking-show-code">
                                <Hash size={14} />
                                رزرو {toPersianNumber(booking.id)}
                            </span>

                            {/* Badge چه کسی تکمیل کرده */}
                            {booking.status === "completed" &&
                                completedByCfg && (
                                    <span
                                        className="barber-booking-show-completed-by"
                                        style={{
                                            backgroundColor: completedByCfg.bg,
                                            color: completedByCfg.color,
                                        }}
                                    >
                                        <completedByCfg.icon size={12} />
                                        {completedByCfg.label}
                                    </span>
                                )}
                        </div>

                        <h1 className="barber-booking-show-title">
                            {config.description}
                        </h1>

                        <p className="barber-booking-show-subtitle">
                            ثبت شده در {formatFullDateTime(booking.created_at)}
                        </p>
                    </div>
                </div>

                {/* ============ هشدار شکایت ============ */}
                {booking.is_disputed && (
                    <div className="barber-dispute-alert">
                        <AlertTriangle size={20} />
                        <div>
                            <h4>اعتراض ثبت شده است</h4>
                            <p>
                                شما به تکمیل این رزرو توسط مشتری اعتراض
                                کرده‌اید. ادمین در حال بررسی است.
                            </p>
                            {booking.dispute_reason && (
                                <p className="dispute-reason">
                                    <strong>دلیل شما:</strong>{" "}
                                    {booking.dispute_reason}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* ============ گرید اصلی ============ */}
                <div className="barber-booking-show-grid">
                    {/* ============ ستون راست ============ */}
                    <div className="barber-booking-show-main">
                        {/* کارت مشتری */}
                        <div className="barber-booking-show-card">
                            <div className="barber-booking-show-card-header">
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
                                </div>
                            ) : (
                                <p className="empty-text">
                                    اطلاعات مشتری یافت نشد.
                                </p>
                            )}
                        </div>

                        {/* کارت زمان و خدمت */}
                        <div className="barber-booking-show-card">
                            <div className="barber-booking-show-card-header">
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
                            <div className="barber-booking-show-card">
                                <div className="barber-booking-show-card-header">
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
                            <div className="barber-booking-show-card">
                                <div className="barber-booking-show-card-header">
                                    <div className="card-icon-box yellow">
                                        <Star
                                            size={20}
                                            fill="#fbbf24"
                                            color="#fbbf24"
                                        />
                                    </div>
                                    <h2 className="card-title">نظر مشتری</h2>
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
                            </div>
                        )}
                    </div>

                    {/* ============ ستون چپ ============ */}
                    <div className="barber-booking-show-sidebar">
                        {/* خلاصه */}
                        <div className="barber-booking-show-card summary-card">
                            <div className="barber-booking-show-card-header">
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

                        {/* دکمه‌های عملیات */}
                        <div className="barber-booking-show-card actions-card">
                            <div className="barber-booking-show-card-header">
                                <div className="card-icon-box gray">
                                    <Info size={20} />
                                </div>
                                <h2 className="card-title">عملیات</h2>
                            </div>

                            <div className="actions-list">
                                {/* تایید تکمیل */}
                                {booking.can_complete && (
                                    <button
                                        type="button"
                                        className="action-btn complete"
                                        onClick={() =>
                                            setCompleteModal({
                                                isOpen: true,
                                                isLoading: false,
                                            })
                                        }
                                    >
                                        <Check size={16} />
                                        <span>تایید تکمیل خدمت</span>
                                    </button>
                                )}

                                {/* اعتراض */}
                                {booking.can_dispute && (
                                    <button
                                        type="button"
                                        className="action-btn dispute"
                                        onClick={() =>
                                            setDisputeModal({
                                                isOpen: true,
                                                isLoading: false,
                                                reason: "",
                                                errors: {},
                                            })
                                        }
                                    >
                                        <AlertTriangle size={16} />
                                        <span>اعتراض به تکمیل</span>
                                    </button>
                                )}

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

                                {/* لغو */}
                                {booking.can_cancel && (
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

                            {/* پیام‌های راهنما */}
                            {booking.can_complete && (
                                <div className="info-box info">
                                    <Info size={14} />
                                    <p>
                                        زمان نوبت گذشته است. لطفاً پس از انجام
                                        خدمت، تکمیل آن را تایید کنید.
                                    </p>
                                </div>
                            )}

                            {booking.can_dispute && (
                                <div className="info-box warning">
                                    <AlertTriangle size={14} />
                                    <p>
                                        مشتری تکمیل خدمت را اعلام کرده است. اگر
                                        خدمت را انجام نداده‌اید، تا ۲۴ ساعت فرصت
                                        اعتراض دارید.
                                    </p>
                                </div>
                            )}

                            {booking.status === "pending" && (
                                <div className="info-box warning">
                                    <Clock4 size={14} />
                                    <p>
                                        این رزرو در انتظار تایید است. برای
                                        تایید، از صفحه رزروهای در انتظار استفاده
                                        کنید.
                                    </p>
                                </div>
                            )}

                            {booking.completed_by === "system" && (
                                <div className="info-box info">
                                    <Bot size={14} />
                                    <p>
                                        این رزرو به صورت خودکار تکمیل شده است
                                        چون شما در ۲۴ ساعت تایید نکردید.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* راهنما */}
                        <div className="barber-booking-show-card">
                            <div className="barber-booking-show-card-header">
                                <div className="card-icon-box gray">
                                    <Shield size={20} />
                                </div>
                                <h2 className="card-title">راهنما</h2>
                            </div>

                            <ul className="status-guide-list">
                                <li>
                                    <Check size={14} />
                                    <span>
                                        برای تکمیل خدمت، دکمه «تایید تکمیل خدمت»
                                        را بزنید.
                                    </span>
                                </li>
                                <li>
                                    <AlertTriangle size={14} />
                                    <span>
                                        اگر مشتری تکمیل را اعلام کرد اما خدمت
                                        انجام نشده، اعتراض کنید.
                                    </span>
                                </li>
                                <li>
                                    <Ban size={14} />
                                    <span>
                                        لغو رزرو فقط قبل از زمان نوبت امکان‌پذیر
                                        است.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============ Modal تایید تکمیل ============ */}
            <ConfirmModal
                isOpen={completeModal.isOpen}
                onClose={() =>
                    setCompleteModal({ isOpen: false, isLoading: false })
                }
                onConfirm={handleComplete}
                title="تایید تکمیل خدمت"
                message={`آیا خدمت «${booking.service?.name}» برای مشتری "${booking.customer?.name}" را انجام داده‌اید؟ با تایید، رزرو به وضعیت «تکمیل شده» تغییر می‌کند و درآمد آن آزاد می‌شود.`}
                confirmText="بله، تایید می‌کنم"
                cancelText="انصراف"
                type="success"
                isLoading={completeModal.isLoading}
            />

            {/* ============ Modal لغو رزرو ============ */}
            <ConfirmModal
                isOpen={cancelModal.isOpen}
                onClose={() =>
                    setCancelModal({ isOpen: false, isLoading: false })
                }
                onConfirm={handleCancel}
                title="لغو رزرو"
                message={`آیا از لغو رزرو #${booking.id} برای مشتری "${booking.customer?.name}" مطمئن هستید؟ در صورت لغو، مبلغ به مشتری بازگردانده می‌شود و ۱۵٪ جریمه کسر می‌شود.`}
                confirmText="بله، لغو کن"
                cancelText="انصراف"
                type="danger"
                isLoading={cancelModal.isLoading}
            />

            {/* ============ Modal اعتراض ============ */}
            {disputeModal.isOpen && (
                <div
                    className="dispute-modal-overlay"
                    onClick={() =>
                        !disputeModal.isLoading &&
                        setDisputeModal((prev) => ({
                            ...prev,
                            isOpen: false,
                        }))
                    }
                >
                    <div
                        className="dispute-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* هدر */}
                        <div className="dispute-modal-header">
                            <div className="dispute-modal-icon">
                                <AlertTriangle size={28} />
                            </div>
                            <h3>اعتراض به تکمیل خدمت</h3>
                        </div>

                        {/* هشدار */}
                        <div className="dispute-modal-warning">
                            <AlertCircle size={16} />
                            <p>
                                <strong>توجه:</strong> مشتری اعلام کرده خدمت
                                انجام شده است. اگر شما این را قبول ندارید، دلیل
                                خود را بنویسید. ادمین بررسی خواهد کرد.
                            </p>
                        </div>

                        {/* اطلاعات رزرو */}
                        <div className="dispute-modal-info">
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
                        <div className="dispute-form-group">
                            <label className="form-label">
                                دلیل اعتراض
                                <span className="required">*</span>
                            </label>
                            <textarea
                                className={`form-textarea ${
                                    disputeModal.errors.reason ? "error" : ""
                                }`}
                                value={disputeModal.reason}
                                onChange={(e) =>
                                    setDisputeModal((prev) => ({
                                        ...prev,
                                        reason: e.target.value,
                                        errors: {},
                                    }))
                                }
                                placeholder="مثلاً: مشتری در زمان نوبت حاضر نشد و خدمت انجام نشد. یا: خدمت را نیمه‌کاره رها کردم..."
                                rows={4}
                                maxLength={500}
                                disabled={disputeModal.isLoading}
                            />
                            <div className="char-counter">
                                {toPersianNumber(disputeModal.reason.length)} /{" "}
                                {toPersianNumber(500)}
                            </div>
                            {disputeModal.errors.reason && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{disputeModal.errors.reason}</span>
                                </div>
                            )}
                        </div>

                        {/* دکمه‌ها */}
                        <div className="dispute-modal-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() =>
                                    setDisputeModal((prev) => ({
                                        ...prev,
                                        isOpen: false,
                                    }))
                                }
                                disabled={disputeModal.isLoading}
                            >
                                انصراف
                            </button>
                            <button
                                type="button"
                                className="btn-confirm"
                                onClick={handleDispute}
                                disabled={disputeModal.isLoading}
                            >
                                {disputeModal.isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        در حال ارسال...
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={16} />
                                        ثبت اعتراض
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
