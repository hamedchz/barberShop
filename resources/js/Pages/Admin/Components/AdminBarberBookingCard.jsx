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
    Search,
    MessageSquare,
    MapPin,
} from "lucide-react";
import { toJalaali } from "jalaali-js";

import {
    toPersianNumber,
    toPersianTimeRange,
} from "../../../utils/persianNumbers";

import { getDisputeTypeConfig } from "../../../Constants/disputeTypes";
import "../Assets/css/AdminBarberBookingsCard.css";

// ============================================
// Booking Status
// ============================================

const statusConfig = {
    pending: {
        label: "در انتظار تأیید",
        icon: Clock4,
    },
    confirmed: {
        label: "تأیید شده",
        icon: CheckCircle,
    },
    completed: {
        label: "تکمیل شده",
        icon: CheckCircle,
    },
    cancelled: {
        label: "لغو شده",
        icon: XCircle,
    },
};

// ============================================
// Dispute Status
// ============================================

const disputeStatusConfig = {
    pending: {
        label: "در انتظار بررسی",
        icon: Clock4,
    },
    investigating: {
        label: "در حال بررسی",
        icon: Search,
    },
    awaiting_response: {
        label: "در انتظار پاسخ",
        icon: MessageSquare,
    },
    resolved: {
        label: "تأیید شده",
        icon: CheckCircle,
    },
    rejected: {
        label: "رد شده",
        icon: XCircle,
    },
    cancelled: {
        label: "لغو شده",
        icon: Ban,
    },
};

// ============================================
// Payment Status
// ============================================

const paymentStatusConfig = {
    pending: {
        label: "در انتظار پرداخت",
    },
    success: {
        label: "پرداخت موفق",
    },
    failed: {
        label: "پرداخت ناموفق",
    },
    refunded: {
        label: "بازپرداخت شده",
    },
};

// ============================================
// Helpers
// ============================================

const formatJalaliDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "-";

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

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "";

    const days = [
        "یکشنبه",
        "دوشنبه",
        "سه‌شنبه",
        "چهارشنبه",
        "پنجشنبه",
        "جمعه",
        "شنبه",
    ];

    return days[d.getDay()];
};

const getRelativeTime = (date) => {
    if (!date) return null;

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return null;

    d.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffInDays = Math.round((d - today) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
        return { label: "امروز", type: "today" };
    }

    if (diffInDays === 1) {
        return { label: "فردا", type: "tomorrow" };
    }

    if (diffInDays === -1) {
        return { label: "دیروز", type: "past" };
    }

    if (diffInDays > 0) {
        return {
            label: `${toPersianNumber(diffInDays)} روز آینده`,
            type: "future",
        };
    }

    return {
        label: `${toPersianNumber(Math.abs(diffInDays))} روز پیش`,
        type: "past",
    };
};

const formatPrice = (amount) => {
    const value = Number(amount || 0);

    return toPersianNumber(Math.round(value).toLocaleString("en-US"));
};

// ============================================
// Component
// ============================================

export default function AdminBarberBookingCard({ booking, barberId }) {
    const config = statusConfig[booking.status] || statusConfig.pending;

    const StatusIcon = config.icon;

    const relativeTime = getRelativeTime(booking.date);

    const isToday = relativeTime?.type === "today";

    const paymentCfg = booking.payment_status
        ? paymentStatusConfig[booking.payment_status]
        : null;

    // ========================================
    // Dispute
    // ========================================

    const latestDispute = booking.latest_dispute;

    const hasDisputes = Boolean(booking.has_disputes && latestDispute);

    const disputeCfg = hasDisputes
        ? disputeStatusConfig[latestDispute.status] ||
          disputeStatusConfig.pending
        : null;

    const DisputeIcon = disputeCfg?.icon;

    const disputeTypeLabel = hasDisputes
        ? getDisputeTypeConfig(latestDispute.dispute_type)?.label
        : null;

    return (
        <article
            className={`admin-booking-card status-${booking.status} ${
                isToday ? "today" : ""
            }`}
        >
            {/* نوار وضعیت کارت */}
            <div className="admin-booking-card-stripe" />

            {/* نشانگر رزرو امروز */}
            {isToday && (
                <div className="admin-today-badge">
                    <Clock4 size={13} />
                    رزرو امروز
                </div>
            )}

            {/* ========================================
                Dispute Indicator
            ======================================== */}

            {hasDisputes && (
                <Link
                    href={`/admin/disputes/${latestDispute.id}`}
                    className={`admin-booking-dispute-indicator dispute-${latestDispute.status}`}
                >
                    <div className="dispute-indicator-icon">
                        {DisputeIcon && <DisputeIcon size={17} />}
                    </div>

                    <div className="dispute-indicator-content">
                        <div className="dispute-indicator-title">
                            <strong>
                                {latestDispute.disputed_by === "customer"
                                    ? "اعتراض مشتری"
                                    : "اعتراض آرایشگر"}
                            </strong>

                            {booking.disputes_count > 1 && (
                                <span className="dispute-indicator-count">
                                    +
                                    {toPersianNumber(
                                        booking.disputes_count - 1,
                                    )}
                                </span>
                            )}

                            {booking.has_active_dispute && (
                                <span className="dispute-indicator-active-dot" />
                            )}
                        </div>

                        <div className="dispute-indicator-meta">
                            {disputeTypeLabel && (
                                <span>{disputeTypeLabel}</span>
                            )}

                            {disputeTypeLabel && (
                                <span className="dispute-indicator-separator">
                                    ·
                                </span>
                            )}

                            <span>{disputeCfg.label}</span>
                        </div>
                    </div>

                    <span className="dispute-indicator-action">
                        مشاهده اعتراض
                        <Eye size={14} />
                    </span>
                </Link>
            )}

            {/* ========================================
                Main Content
            ======================================== */}

            <div className="admin-booking-content">
                {/* اطلاعات مشتری */}
                <section className="admin-booking-customer">
                    <div className="admin-customer-avatar-wrapper">
                        <div className="admin-customer-avatar">
                            {booking.customer?.thumbnail ? (
                                <img
                                    src={booking.customer.thumbnail}
                                    alt={booking.customer.name || "مشتری"}
                                    loading="lazy"
                                />
                            ) : (
                                <span>
                                    {booking.customer?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "؟"}
                                </span>
                            )}
                        </div>

                        <span className="admin-customer-avatar-status" />
                    </div>

                    <div className="admin-customer-info">
                        <span className="admin-customer-label">
                            <User size={13} />
                            اطلاعات مشتری
                        </span>

                        <strong className="admin-customer-name">
                            {booking.customer?.name || "مشتری حذف‌شده"}
                        </strong>

                        {booking.customer?.phone && (
                            <a
                                href={`tel:${booking.customer.phone}`}
                                className="admin-customer-contact"
                                dir="ltr"
                            >
                                <Phone size={13} />
                                {booking.customer.phone}
                            </a>
                        )}

                        {booking.customer?.email && (
                            <span
                                className="admin-customer-contact admin-customer-email"
                                dir="ltr"
                                title={booking.customer.email}
                            >
                                <Mail size={13} />
                                {booking.customer.email}
                            </span>
                        )}
                    </div>
                </section>

                {/* جزئیات رزرو */}
                <section className="admin-booking-details">
                    <div className="admin-booking-service">
                        <div className="admin-detail-icon-box service-icon">
                            <Scissors size={17} />
                        </div>

                        <div className="admin-detail-content">
                            <span className="admin-detail-label">
                                خدمت رزرو شده
                            </span>

                            <strong className="admin-detail-value service-name">
                                {booking.service?.name || "خدمت نامشخص"}
                            </strong>

                            {booking.service?.duration && (
                                <span className="admin-detail-subtext">
                                    <Clock size={12} />
                                    {toPersianNumber(
                                        booking.service.duration,
                                    )}{" "}
                                    دقیقه
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="admin-booking-detail-grid">
                        <div className="admin-detail-item">
                            <div className="admin-detail-icon-box date-icon">
                                <Calendar size={16} />
                            </div>

                            <div className="admin-detail-content">
                                <span className="admin-detail-label">
                                    تاریخ رزرو
                                </span>

                                <strong className="admin-detail-value">
                                    {getDayName(booking.date)}{" "}
                                    {formatJalaliDate(booking.date)}
                                </strong>

                                {relativeTime && (
                                    <span
                                        className={`admin-relative-time ${relativeTime.type}`}
                                    >
                                        {relativeTime.label}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="admin-detail-item">
                            <div className="admin-detail-icon-box time-icon">
                                <Clock size={16} />
                            </div>

                            <div className="admin-detail-content">
                                <span className="admin-detail-label">
                                    ساعت مراجعه
                                </span>

                                <strong
                                    className="admin-detail-value"
                                    dir="ltr"
                                >
                                    {toPersianTimeRange(
                                        booking.start_time,
                                        booking.end_time,
                                    )}
                                </strong>
                            </div>
                        </div>

                        <div className="admin-detail-item">
                            <div className="admin-detail-icon-box price-icon">
                                <DollarSign size={16} />
                            </div>

                            <div className="admin-detail-content">
                                <span className="admin-detail-label">
                                    مبلغ رزرو
                                </span>

                                <strong className="admin-detail-value price-value">
                                    {formatPrice(booking.amount)}
                                    <small>تومان</small>
                                </strong>
                            </div>
                        </div>
                    </div>
                </section>

                {/* وضعیت و عملیات */}
                <section className="admin-booking-actions">
                    <div className="admin-booking-statuses">
                        <span
                            className={`admin-status-badge status-badge-${booking.status}`}
                        >
                            <StatusIcon size={14} />
                            {config.label}
                        </span>

                        {paymentCfg && (
                            <span
                                className={`admin-payment-badge payment-${booking.payment_status}`}
                            >
                                <CreditCard size={13} />
                                {paymentCfg.label}
                            </span>
                        )}
                    </div>

                    <div className="admin-booking-footer">
                        <span className="admin-booking-code">
                            <Hash size={13} />
                            کد رزرو:
                            <strong>{toPersianNumber(booking.id)}</strong>
                        </span>

                        <Link
                            href={`/admin/bookings/${barberId}/barber/${booking.id}`}
                            className="admin-booking-view-btn"
                        >
                            مشاهده جزئیات
                            <Eye size={16} />
                        </Link>
                    </div>
                </section>
            </div>
        </article>
    );
}
