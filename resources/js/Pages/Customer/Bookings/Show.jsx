import React, { useState } from "react";
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
    Download,
    Printer,
    MessageCircle,
    Edit3,
    Award,
    Building2,
    CalendarClock,
    Info,
    FileText,
    Shield,
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

const statusConfig = {
    pending: {
        label: "در انتظار پرداخت",
        icon: Clock4,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
        description: "این رزرو در انتظار پرداخت است.",
    },
    confirmed: {
        label: "تایید شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#d1fae5",
        description: "رزرو شما تایید شده است. در تاریخ مقرر حضور یابید.",
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

export default function BookingShow({ auth, booking }) {
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

    // ============ چاپ ============
    const handlePrint = () => {
        window.print();
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
                            {/* توضیحات خدمت */}
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

                                    <div className="payment-info-item">
                                        <span className="payment-info-label">
                                            وضعیت
                                        </span>
                                        <span
                                            className={`payment-status ${
                                                booking.payment.status ===
                                                "success"
                                                    ? "success"
                                                    : "failed"
                                            }`}
                                        >
                                            {booking.payment.status ===
                                            "success" ? (
                                                <>
                                                    <CheckCircle size={12} />
                                                    موفق
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={12} />
                                                    ناموفق
                                                </>
                                            )}
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

                        {/* کارت نظر (اگر ثبت شده) */}
                        {booking.review && (
                            <div className="booking-show-card">
                                <div className="booking-show-card-header">
                                    <div className="card-icon-box yellow">
                                        <Star
                                            size={20}
                                            fill="#fbbf24"
                                            color="#fbbf24"
                                        />
                                    </div>
                                    <h2 className="card-title">نظر شما</h2>
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
                                {/* ثبت نظر */}
                                {booking.can_review && (
                                    <Link
                                        href={`/customer/bookings/${booking.id}/review`}
                                        className="action-btn review"
                                    >
                                        <Star size={16} />
                                        <span>ثبت نظر</span>
                                    </Link>
                                )}

                                {/* چاپ */}
                                <button
                                    className="action-btn print"
                                    onClick={handlePrint}
                                >
                                    <Printer size={16} />
                                    <span>چاپ رسید</span>
                                </button>

                                {/* تماس با آرایشگر */}
                                {booking.barber?.phone && (
                                    <a
                                        href={`tel:${booking.barber.phone}`}
                                        className="action-btn contact"
                                    >
                                        <Phone size={16} />
                                        <span>تماس با آرایشگر</span>
                                    </a>
                                )}

                                {/* لغو رزرو */}
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

                            {/* پیام راهنما */}
                            {booking.can_cancel && (
                                <div className="info-box warning">
                                    <AlertCircle size={14} />
                                    <p>
                                        لغو رزرو تا ۲ ساعت قبل از زمان نوبت
                                        امکان‌پذیر است.
                                    </p>
                                </div>
                            )}

                            {booking.status === "pending" && (
                                <div className="info-box info">
                                    <Info size={14} />
                                    <p>
                                        برای تکمیل رزرو، لطفاً مبلغ را پرداخت
                                        کنید.
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
                                <li>
                                    <CheckCircle size={14} />
                                    <span>
                                        رزرو تایید شده به معنی پرداخت موفق و ثبت
                                        نهایی است.
                                    </span>
                                </li>
                                <li>
                                    <Clock4 size={14} />
                                    <span>
                                        لطفاً ۱۰ دقیقه قبل از زمان نوبت حاضر
                                        باشید.
                                    </span>
                                </li>
                                <li>
                                    <XCircle size={14} />
                                    <span>
                                        لغو رزرو فقط تا ۲ ساعت قبل امکان‌پذیر
                                        است.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============ Modal لغو رزرو ============ */}
            <ConfirmModal
                isOpen={cancelModal.isOpen}
                onClose={() =>
                    setCancelModal({ isOpen: false, isLoading: false })
                }
                onConfirm={handleConfirmCancel}
                title="لغو رزرو"
                message={`آیا از لغو رزرو خود در تاریخ ${formatJalaliDate(
                    booking.date,
                )} از ساعت ${toPersianTime(
                    booking.start_time,
                )} مطمئن هستید؟ در صورت لغو، مبلغ پرداخت شده به حساب شما بازگردانده می‌شود.`}
                confirmText="بله، لغو کن"
                cancelText="انصراف"
                type="danger"
                isLoading={cancelModal.isLoading}
            />
        </PublicLayout>
    );
}
