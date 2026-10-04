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
    User,
    Mail,
    CreditCard,
    Ban,
} from "lucide-react";
import { toJalaali } from "jalaali-js";
import {
    toPersianNumber,
    toPersianTimeRange,
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

const paymentStatusConfig = {
    pending: { label: "در انتظار پرداخت", color: "#92400e", bg: "#fffbeb" },
    success: { label: "موفق", color: "#065f46", bg: "#ecfdf5" },
    failed: { label: "ناموفق", color: "#991b1b", bg: "#fef2f2" },
    refunded: { label: "برگشت داده شده", color: "#5b21b6", bg: "#f5f3ff" },
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

export default function AdminBarberBookingCard({ booking, barberId }) {
    const config = statusConfig[booking.status] || statusConfig.pending;
    const StatusIcon = config.icon;
    const relativeTime = getRelativeTime(booking.date);

    const isToday =
        booking.date &&
        new Date(booking.date).toDateString() === new Date().toDateString();

    const paymentCfg = booking.payment_status
        ? paymentStatusConfig[booking.payment_status]
        : null;

    return (
        <div
            className={`admin-booking-card status-${booking.status} ${
                isToday ? "today" : ""
            }`}
        >
            {/* نوار رنگی بالا */}
            <div
                className="admin-booking-card-stripe"
                style={{ background: config.gradient }}
            ></div>

            {/* نشانگر امروز */}
            {isToday && (
                <div className="admin-today-badge">
                    <Clock4 size={12} />
                    امروز
                </div>
            )}

            <div className="admin-booking-content">
                {/* ============ ستون ۱: مشتری ============ */}
                <div className="admin-booking-customer">
                    <div className="admin-customer-avatar-wrapper">
                        <div className="admin-customer-avatar">
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
                        <span
                            className="admin-customer-avatar-status"
                            style={{ background: config.gradient }}
                        ></span>
                    </div>

                    <div className="admin-customer-info">
                        <span className="admin-customer-label">
                            <User size={10} />
                            مشتری
                        </span>
                        <span className="admin-customer-name">
                            {booking.customer?.name}
                        </span>

                        {booking.customer?.phone && (
                            <a
                                href={`tel:${booking.customer.phone}`}
                                className="admin-customer-phone"
                            >
                                <Phone size={12} />
                                <span dir="ltr">{booking.customer.phone}</span>
                            </a>
                        )}

                        {booking.customer?.email && (
                            <span className="admin-customer-email">
                                <Mail size={10} />
                                <span dir="ltr">{booking.customer.email}</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* ============ ستون ۲: جزئیات ============ */}
                <div className="admin-booking-details">
                    <div className="admin-detail-row service">
                        <div className="admin-detail-icon-box">
                            <Scissors size={14} />
                        </div>
                        <div className="admin-detail-content">
                            <span className="admin-detail-label">خدمت</span>
                            <span className="admin-detail-value">
                                {booking.service?.name}
                            </span>
                        </div>
                    </div>

                    <div className="admin-detail-row date">
                        <div className="admin-detail-icon-box">
                            <Calendar size={14} />
                        </div>
                        <div className="admin-detail-content">
                            <span className="admin-detail-label">تاریخ</span>
                            <span className="admin-detail-value">
                                {getDayName(booking.date)}{" "}
                                {formatJalaliDate(booking.date)}
                            </span>
                            {relativeTime.label && (
                                <span
                                    className="admin-relative-time"
                                    style={{ color: relativeTime.color }}
                                >
                                    {relativeTime.label}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="admin-detail-row time">
                        <div className="admin-detail-icon-box">
                            <Clock size={14} />
                        </div>
                        <div className="admin-detail-content">
                            <span className="admin-detail-label">ساعت</span>
                            <span className="admin-detail-value time-value">
                                {toPersianTimeRange(
                                    booking.start_time,
                                    booking.end_time,
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="admin-detail-row price">
                        <div className="admin-detail-icon-box">
                            <DollarSign size={14} />
                        </div>
                        <div className="admin-detail-content">
                            <span className="admin-detail-label">مبلغ</span>
                            <span className="admin-detail-value price-value">
                                {toPersianNumber(
                                    booking.amount.toLocaleString(),
                                )}{" "}
                                تومان
                            </span>
                        </div>
                    </div>
                </div>

                {/* ============ ستون ۳: وضعیت و عملیات ============ */}
                <div className="admin-booking-actions">
                    <div className="admin-status-row">
                        {/* Badge وضعیت */}
                        <span
                            className="admin-status-badge"
                            style={{
                                backgroundColor: config.bg,
                                color: config.color,
                                borderColor: config.border,
                            }}
                        >
                            <StatusIcon size={12} />
                            {config.label}
                        </span>

                        {/* Badge وضعیت پرداخت */}
                        {paymentCfg && (
                            <span
                                className="admin-payment-badge"
                                style={{
                                    backgroundColor: paymentCfg.bg,
                                    color: paymentCfg.color,
                                }}
                            >
                                <CreditCard size={10} />
                                {paymentCfg.label}
                            </span>
                        )}

                        {/* کد رزرو */}
                        <span className="admin-booking-code">
                            <Hash size={10} />
                            {toPersianNumber(booking.id)}
                        </span>
                    </div>

                    {/* دکمه مشاهده جزئیات */}
                    <Link
                        href={`/admin/bookings/${barberId}/barber/${booking.id}`}
                        className="admin-booking-view-btn"
                    >
                        <Eye size={14} />
                        مشاهده جزئیات
                    </Link>
                </div>
            </div>
        </div>
    );
}
