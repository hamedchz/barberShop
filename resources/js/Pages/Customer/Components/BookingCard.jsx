import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
    Calendar,
    Clock,
    Scissors,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock4,
    Star,
    Eye,
    X,
    Hash,
    MessageCircle,
    CreditCard,
    Edit3,
    Trash2,
    Hourglass,
    Sparkles,
    Search,
    MessageSquare,
    Ban,
    AlertTriangle,
} from "lucide-react";
import { toJalaali } from "jalaali-js";
import {
    toPersianNumber,
    toPersianTimeRange,
} from "../../../utils/persianNumbers";

// ============ وضعیت‌های رزرو ============
const statusConfig = {
    pending: {
        label: "در انتظار پرداخت",
        icon: Clock4,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
    },
    confirmed: {
        label: "تایید شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#d1fae5",
    },
    completed: {
        label: "تکمیل شده",
        icon: CheckCircle,
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#dbeafe",
    },
    cancelled: {
        label: "لغو شده",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fee2e2",
    },
};

// ============ وضعیت‌های نظر ============
const reviewStatusConfig = {
    pending: {
        label: "نظر در انتظار",
        icon: Clock4,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
    },
    approved: {
        label: "نظر تایید شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#d1fae5",
    },
    rejected: {
        label: "نظر رد شده",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fee2e2",
    },
};

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

// ============ کامپوننت شمارش معکوس ============
function CountdownTimer({ expiresAt }) {
    const [timeLeft, setTimeLeft] = useState({
        minutes: 0,
        seconds: 0,
        isExpired: false,
    });

    useEffect(() => {
        if (!expiresAt) return;

        const calculateTimeLeft = () => {
            const now = Date.now();
            const expires = Number(expiresAt);
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
                <Hourglass size={12} />
                منقضی شده
            </span>
        );
    }

    return (
        <span className="countdown-timer">
            <Hourglass size={12} />
            {toPersianNumber(timeLeft.minutes)}:
            {toPersianNumber(String(timeLeft.seconds).padStart(2, "0"))}
        </span>
    );
}

export default function BookingCard({
    booking,
    onCancelClick,
    onDeleteReviewClick,
}) {
    const { auth } = usePage().props;
    const config = statusConfig[booking.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    const handleReviewClick = (booking) => {
        // هدایت به صفحه ثبت نظر
        router.get(`/customer/bookings/reviews/${booking.id}`);
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
    // ============ اطلاعات اعتراض ============
    const disputeStatusConfig = {
        pending: {
            label: "اعتراض در انتظار بررسی",
            icon: Clock4,
            color: "#92400e",
            bg: "#fffbeb",
            border: "#fde68a",
        },
        investigating: {
            label: "اعتراض در حال بررسی",
            icon: Search,
            color: "#1e40af",
            bg: "#eff6ff",
            border: "#dbeafe",
        },
        awaiting_response: {
            label: "در انتظار پاسخ",
            icon: MessageSquare,
            color: "#9a3412",
            bg: "#fff7ed",
            border: "#ffedd5",
        },
        resolved: {
            label: "اعتراض تایید شد",
            icon: CheckCircle,
            color: "#065f46",
            bg: "#ecfdf5",
            border: "#d1fae5",
        },
        rejected: {
            label: "اعتراض رد شد",
            icon: XCircle,
            color: "#991b1b",
            bg: "#fef2f2",
            border: "#fee2e2",
        },
        cancelled: {
            label: "اعتراض لغو شد",
            icon: Ban,
            color: "#6b7280",
            bg: "#f3f4f6",
            border: "#e5e7eb",
        },
    };

    const latestDispute = booking.latest_dispute;
    const disputeConfig = latestDispute
        ? disputeStatusConfig[latestDispute.status] ||
          disputeStatusConfig.pending
        : null;
    const DisputeIcon = disputeConfig?.icon;
    return (
        <div
            className={`booking-card status-${booking.status} ${
                booking.status === "pending" && booking.can_pay ? "urgent" : ""
            }`}
        >
            {/* ============ نوار رنگی بالا ============ */}
            <div
                className="booking-card-stripe"
                style={{ backgroundColor: config.color }}
            ></div>

            {/* ============================================ */}
            {/* Badge اعتراض - بالای کارت */}
            {/* ============================================ */}
            {booking.has_disputes && latestDispute && (
                <div
                    className={`booking-dispute-badge status-${latestDispute.status}`}
                    style={{
                        backgroundColor: disputeConfig.bg,
                        color: disputeConfig.color,
                        borderColor: disputeConfig.border,
                    }}
                >
                    <DisputeIcon size={12} />
                    <span>
                        {latestDispute && (
                            <>
                                {latestDispute.status === "awaiting_response"
                                    ? latestDispute.disputed_by_user_id ===
                                      auth.id
                                        ? disputeConfig.label
                                        : disputeStatusConfig.investigating
                                              .label
                                    : disputeConfig.label}
                            </>
                        )}
                    </span>
                    {booking.disputes_count > 1 && (
                        <span className="dispute-count">
                            {toPersianNumber(booking.disputes_count)}
                        </span>
                    )}
                </div>
            )}

            <div className="booking-card-content">
                {/* ============ ستون ۱: آواتار + اطلاعات باربر ============ */}
                <div className="booking-card-barber">
                    <div className="booking-barber-avatar">
                        {booking.barber?.thumbnail ? (
                            <img
                                src={booking.barber.thumbnail}
                                alt={booking.barber.name}
                            />
                        ) : (
                            <span>
                                {booking.barber?.name?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    {/* نشانگر اعتراض روی آواتار */}
                    {/* {booking.has_disputes && (
                        <span
                            className={`barber-avatar-dispute-indicator status-${latestDispute.status}`}
                            title={disputeConfig.label}
                        >
                            <AlertTriangle size={10} />
                        </span>
                    )} */}
                    <div className="booking-barber-info">
                        <span className="booking-barber-label">آرایشگر</span>
                        <span className="booking-barber-name">
                            {booking.barber?.name}
                        </span>
                    </div>
                </div>

                {/* ============ ستون ۲: اطلاعات رزرو ============ */}
                <div className="booking-card-details">
                    {/* خدمت */}
                    <div className="booking-detail-row">
                        <Scissors size={14} />
                        <span className="detail-label">خدمت:</span>
                        <span className="detail-value">
                            {booking.service?.name}
                        </span>
                    </div>

                    {/* تاریخ و ساعت */}
                    <div className="booking-detail-row">
                        <Calendar size={14} />
                        <span className="detail-label">تاریخ:</span>
                        <span className="detail-value">
                            {getDayName(booking.date)}{" "}
                            {formatJalaliDate(booking.date)}
                        </span>
                    </div>

                    <div className="booking-detail-row">
                        <Clock size={14} />
                        <span className="detail-label">ساعت:</span>
                        <span className="detail-value">
                            {toPersianTimeRange(
                                booking.start_time,
                                booking.end_time,
                            )}
                        </span>
                    </div>

                    {/* قیمت */}
                    <div className="booking-detail-row price">
                        <DollarSign size={14} />
                        <span className="detail-label">مبلغ:</span>
                        <span className="detail-value">
                            {toPersianNumber(booking.amount.toLocaleString())}{" "}
                            تومان
                        </span>
                    </div>
                </div>

                {/* ============ ستون ۳: وضعیت + دکمه‌ها ============ */}
                <div className="booking-card-actions">
                    {/* ============ ردیف وضعیت ============ */}
                    <div className="booking-status-row">
                        {/* Badge وضعیت رزرو */}
                        <span
                            className="booking-status-badge"
                            style={{
                                backgroundColor: config.bg,
                                color: config.color,
                                borderColor: config.border,
                            }}
                        >
                            <StatusIcon size={14} />
                            {config.label}
                        </span>

                        {/* ============================================ */}
                        {/* Badge اعتراض - کنار وضعیت */}
                        {/* ============================================ */}
                        {/* {booking.has_disputes && latestDispute && (
                            <span
                                className={`booking-dispute-badge status-${latestDispute.status}`}
                                style={{
                                    backgroundColor: disputeConfig.bg,
                                    color: disputeConfig.color,
                                    borderColor: disputeConfig.border,
                                }}
                            >
                                <DisputeIcon size={12} />
                                {disputeConfig.label}
                                {booking.disputes_count > 1 && (
                                    <span className="dispute-count">
                                        {toPersianNumber(
                                            booking.disputes_count,
                                        )}
                                    </span>
                                )}
                            </span>
                        )} */}

                        {/* کد رزرو */}
                        {/* <span className="booking-code">
                            <Hash size={12} />
                            {toPersianNumber(booking.id)}
                        </span> */}

                        {/* شمارش معکوس برای pending */}
                        {booking.status === "pending" &&
                            booking.can_pay &&
                            booking.expires_at && (
                                <CountdownTimer
                                    expiresAt={booking.expires_at}
                                />
                            )}
                    </div>

                    {/* ============ Badge وضعیت نظر ============ */}
                    {/* ============ Badge وضعیت نظر ============ */}
                    {/* {booking.has_review && booking.review && (
                        <div className="booking-review-status">
                            {(() => {
                                const rCfg =
                                    reviewStatusConfig[booking.review.status] ||
                                    reviewStatusConfig.pending;
                                const RIcon = rCfg.icon;

                                return (
                                    <span
                                        className={`review-status-badge ${booking.review.status}`} // ← اضافه کردن کلاس وضعیت
                                        style={{
                                            backgroundColor: rCfg.bg,
                                            color: rCfg.color,
                                            borderColor: rCfg.border,
                                        }}
                                    >
                                        <RIcon size={12} />
                                        {rCfg.label}
                                    </span>
                                );
                            })()}
                        </div>
                    )} */}

                    {/* ============ دکمه‌های عملیات ============ */}
                    <div className="booking-buttons">
                        {/* ۱. پرداخت مجدد (pending + can_pay) */}
                        {booking.can_pay && (
                            <button
                                type="button"
                                onClick={handleRetryPayment}
                                className="booking-btn pay"
                                title="تکمیل پرداخت"
                            >
                                <CreditCard size={14} />
                                <span>تکمیل پرداخت</span>
                                <span className="booking-btn-badge">
                                    <Hourglass size={10} />
                                </span>
                            </button>
                        )}

                        {/* ۲. مشاهده جزئیات */}
                        <Link
                            href={`/customer/bookings/${booking.id}`}
                            className="booking-btn view"
                            title="مشاهده جزئیات"
                        >
                            <Eye size={14} />
                            <span>جزئیات</span>
                        </Link>

                        {/* ۳. ثبت نظر (completed + no review) */}
                        {booking.can_review && (
                            <button
                                type="button"
                                className="booking-btn review"
                                onClick={() => handleReviewClick(booking)}
                                title="ثبت نظر"
                            >
                                <Star size={14} />
                                <span>ثبت نظر</span>
                            </button>
                        )}

                        {/* ۴. ویرایش نظر (has_review + pending) */}
                        {/* {booking.can_edit_review && (
                            <Link
                                href={`/customer/bookings/reviews/${booking.id}/edit`}
                                className="booking-btn review-edit"
                                title="ویرایش نظر"
                            >
                                <Edit3 size={14} />
                                <span>ویرایش نظر</span>
                            </Link>
                        )} */}

                        {/* ۵. حذف نظر (has_review + pending) */}
                        {/* {booking.can_delete_review && (
                            <button
                                type="button"
                                className="booking-btn review-delete"
                                onClick={() => onDeleteReviewClick(booking)}
                                title="حذف نظر"
                            >
                                <Trash2 size={14} />
                                <span>حذف نظر</span>
                            </button>
                        )} */}

                        {/* ۶. مشاهده نظر (approved/rejected) */}
                        {booking.has_review &&
                            booking.review?.status !== "pending" && (
                                <span
                                    className="booking-btn reviewed"
                                    title="نظر شما ثبت شده است"
                                >
                                    <MessageCircle size={14} />
                                    <span>نظر ثبت شده</span>
                                </span>
                            )}

                        {/* ۷. لغو رزرو */}
                        {/* {booking.can_cancel && (
                            <button
                                type="button"
                                className="booking-btn cancel"
                                onClick={() => onCancelClick(booking)}
                                title="لغو رزرو"
                            >
                                <X size={14} />
                                <span>لغو</span>
                            </button>
                        )} */}
                    </div>

                    {/* ============ پیام منقضی ============ */}
                    {booking.status === "pending" &&
                        booking.is_expired &&
                        !booking.can_pay && (
                            <div className="booking-expired-notice">
                                <XCircle size={12} />
                                <span>مهلت پرداخت منقضی شده است</span>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}
