import React from "react";
import { Link } from "@inertiajs/react";
import {
    Calendar,
    Clock,
    Scissors,
    DollarSign,
    Phone,
    CheckCircle,
    XCircle,
    Clock4,
    Hash,
    Eye,
    Check,
    Ban,
    User,
    MessageCircle,
    Sparkles,
} from "lucide-react";
import { toJalaali } from "jalaali-js";
import {
    toPersianNumber,
    toPersianTimeRange,
    toPersianTime,
} from "../../../utils/persianNumbers";

// ============ وضعیت‌ها ============
const statusConfig = {
    pending: {
        label: "در انتظار تایید",
        icon: Clock4,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
        gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    },
    confirmed: {
        label: "تایید شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#d1fae5",
        gradient: "linear-gradient(135deg, #10b981, #059669)",
    },
    completed: {
        label: "تکمیل شده",
        icon: CheckCircle,
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#dbeafe",
        gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    },
    cancelled: {
        label: "لغو شده",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fee2e2",
        gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
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

const getRelativeTime = (date) => {
    if (!date) return { label: "", color: "" };

    const now = new Date();
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const diffInDays = Math.round((d - today) / 1000 / 60 / 60 / 24);

    if (diffInDays === 0) return { label: "امروز", color: "#f59e0b" };
    if (diffInDays === 1) return { label: "فردا", color: "#3b82f6" };
    if (diffInDays === -1) return { label: "دیروز", color: "#9ca3af" };
    if (diffInDays > 0)
        return {
            label: `${toPersianNumber(diffInDays)} روز آینده`,
            color: "#10b981",
        };
    return {
        label: `${toPersianNumber(Math.abs(diffInDays))} روز پیش`,
        color: "#9ca3af",
    };
};

export default function BarberBookingCard({
    booking,
    onConfirmClick,
    onCompleteClick,
    onCancelClick,
}) {
    const config = statusConfig[booking.status] || statusConfig.pending;
    const StatusIcon = config.icon;
    const relativeTime = getRelativeTime(booking.date);

    const isToday =
        booking.date &&
        new Date(booking.date).toDateString() === new Date().toDateString();

    return (
        <div
            className={`barber-booking-card status-${booking.status} ${
                isToday ? "today" : ""
            }`}
        >
            {/* ============ نوار رنگی بالا ============ */}
            <div
                className="barber-booking-card-stripe"
                style={{ background: config.gradient }}
            ></div>

            {/* ============ نشانگر امروز ============ */}
            {isToday && (
                <div className="today-badge">
                    <Sparkles size={12} />
                    امروز
                </div>
            )}

            <div className="barber-booking-content">
                {/* ============ ستون ۱: مشتری ============ */}
                <div className="barber-booking-customer">
                    <div className="customer-avatar-wrapper">
                        <div className="customer-avatar">
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
                        </div>

                        {/* نشانگر وضعیت کوچک روی آواتار */}
                        <span
                            className="customer-avatar-status"
                            style={{ background: config.gradient }}
                        ></span>
                    </div>

                    <div className="customer-info">
                        <span className="customer-label">
                            <User size={10} />
                            مشتری
                        </span>
                        <span className="customer-name">
                            {booking.customer?.name}
                        </span>

                        {booking.customer?.phone && (
                            <a
                                href={`tel:${booking.customer.phone}`}
                                className="customer-phone"
                                title="تماس با مشتری"
                            >
                                <Phone size={12} />
                                <span dir="ltr">{booking.customer.phone}</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* ============ ستون ۲: جزئیات ============ */}
                <div className="barber-booking-details">
                    <div className="booking-detail-row service">
                        <div className="detail-icon-box">
                            <Scissors size={14} />
                        </div>
                        <div className="detail-content">
                            <span className="detail-label">خدمت</span>
                            <span className="detail-value">
                                {booking.service?.name}
                            </span>
                        </div>
                    </div>

                    <div className="booking-detail-row date">
                        <div className="detail-icon-box">
                            <Calendar size={14} />
                        </div>
                        <div className="detail-content">
                            <span className="detail-label">تاریخ</span>
                            <span className="detail-value">
                                {getDayName(booking.date)}{" "}
                                {formatJalaliDate(booking.date)}
                            </span>
                            {relativeTime.label && (
                                <span
                                    className="relative-time"
                                    style={{ color: relativeTime.color }}
                                >
                                    {relativeTime.label}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="booking-detail-row time">
                        <div className="detail-icon-box">
                            <Clock size={14} />
                        </div>
                        <div className="detail-content">
                            <span className="detail-label">ساعت</span>
                            <span className="detail-value time-value">
                                {toPersianTimeRange(
                                    booking.start_time,
                                    booking.end_time,
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="booking-detail-row price">
                        <div className="detail-icon-box">
                            <DollarSign size={14} />
                        </div>
                        <div className="detail-content">
                            <span className="detail-label">مبلغ</span>
                            <span className="detail-value price-value">
                                {toPersianNumber(
                                    booking.amount.toLocaleString(),
                                )}{" "}
                                تومان
                            </span>
                        </div>
                    </div>
                </div>

                {/* ============ ستون ۳: وضعیت و عملیات ============ */}
                <div className="barber-booking-actions">
                    <div className="booking-status-row">
                        <span
                            className="booking-status-badge"
                            style={{
                                backgroundColor: config.bg,
                                color: config.color,
                                borderColor: config.border,
                            }}
                        >
                            <StatusIcon size={12} />
                            {config.label}
                        </span>

                        <span className="booking-code">
                            <Hash size={10} />
                            {toPersianNumber(booking.id)}
                        </span>
                    </div>

                    {/* دکمه‌های عملیات */}
                    <div className="booking-buttons-group">
                        {booking.can_confirm && (
                            <button
                                className="booking-action-btn confirm"
                                onClick={() => onConfirmClick(booking)}
                                title="تایید رزرو"
                            >
                                <Check size={14} />
                                <span>تایید</span>
                            </button>
                        )}

                        {booking.can_complete && (
                            <button
                                className="booking-action-btn complete"
                                onClick={() => onCompleteClick(booking)}
                                title="تکمیل رزرو"
                            >
                                <CheckCircle size={14} />
                                <span>تکمیل</span>
                            </button>
                        )}

                        <Link
                            href={`/barber/bookings/${booking.id}`}
                            className="booking-action-btn view"
                            title="مشاهده جزئیات"
                        >
                            <Eye size={14} />
                            <span>جزئیات</span>
                        </Link>

                        {booking.can_cancel && (
                            <button
                                className="booking-action-btn cancel"
                                onClick={() => onCancelClick(booking)}
                                title="لغو رزرو"
                            >
                                <Ban size={14} />
                                <span>لغو</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
