// resources/js/Pages/Admin/Bookings/Show.jsx

import React from "react";
import { Head, Link } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import {
    ArrowRight,
    Calendar,
    Clock,
    User,
    Scissors,
    Hash,
    CreditCard,
    Star,
    AlertCircle,
    CheckCircle,
    XCircle,
    Info,
    DollarSign,
    Phone,
    ExternalLink,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import {
    formatFullDateTime,
    formatFullDateWithoutTime,
} from "../../../utils/dateHelpers";
import { getDisputeStatusConfig } from "../../../constants/disputeTypes";

import "./Assets/css/BookingsShow.css";

// ============ تنظیمات وضعیت ============
const statusConfig = {
    pending: {
        label: "در انتظار",
        icon: Clock,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
    },
    confirmed: {
        label: "تایید شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#a7f3d0",
    },
    completed: {
        label: "تکمیل شده",
        icon: CheckCircle,
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#bfdbfe",
    },
    cancelled: {
        label: "لغو شده",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fecaca",
    },
};

// ============ برچسب درگاه‌ها ============
const gatewayLabels = {
    zarinpal: "زرین‌پال",
    idpay: "آیدی‌پی",
    payping: "پی‌پینگ",
    nextpay: "نکست‌پی",
    manual: "دستی",
};

export default function BookingShow({ booking }) {
    const config = statusConfig[booking.status] ?? statusConfig.pending;
    const StatusIcon = config.icon;

    return (
        <Layout>
            <Head title={`رزرو #${booking.id}`} />

            <div className="booking-show-page">
                {/* ============ بازگشت ============ */}
                <div className="booking-show-back">
                    <Link href="/admin/bookings" className="btn-secondary">
                        <ArrowRight size={16} />
                        بازگشت به رزروها
                    </Link>
                </div>

                {/* ============ هدر ============ */}
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
                            background: config.bg,
                            color: config.color,
                            borderColor: config.border,
                        }}
                    >
                        <StatusIcon size={30} />
                    </div>

                    <div className="booking-show-header-content">
                        <div className="booking-show-header-top">
                            <span
                                className="booking-show-status-badge"
                                style={{
                                    background: config.bg,
                                    color: config.color,
                                    borderColor: config.border,
                                }}
                            >
                                <StatusIcon size={12} />
                                {config.label}
                            </span>
                            <span className="booking-show-code">
                                <Hash size={12} />
                                رزرو {toPersianNumber(booking.id)}
                            </span>
                        </div>
                        <h1>{config.label}</h1>
                        <p>
                            ثبت شده در{" "}
                            {booking.created_at
                                ? formatFullDateTime(booking.created_at)
                                : "—"}
                        </p>
                    </div>
                </div>

                {/* ============ گرید ============ */}
                <div className="booking-show-grid">
                    {/* ============ ستون راست ============ */}
                    <div className="booking-show-main">
                        {/* ============ مشتری ============ */}
                        <div className="booking-show-card">
                            <div className="booking-show-card-header">
                                <div className="booking-show-card-icon blue">
                                    <User size={20} />
                                </div>
                                <h2>مشتری</h2>
                            </div>
                            {booking.user ? (
                                <div className="booking-user-card">
                                    <div className="booking-user-avatar customer">
                                        {booking.user.avatar ? (
                                            <img
                                                src={booking.user.avatar}
                                                alt={booking.user.name}
                                            />
                                        ) : (
                                            booking.user.name
                                                ?.charAt(0)
                                                .toUpperCase()
                                        )}
                                    </div>
                                    <div className="booking-user-info">
                                        <span className="booking-user-name">
                                            {booking.user.name}
                                        </span>
                                        {booking.user.phone && (
                                            <a
                                                href={`tel:${booking.user.phone}`}
                                                className="booking-user-phone"
                                            >
                                                <Phone size={12} />
                                                {toPersianNumber(
                                                    booking.user.phone,
                                                )}
                                            </a>
                                        )}
                                    </div>
                                    <Link
                                        href={`/admin/customers/${booking.user.id}`}
                                        className="booking-user-link"
                                    >
                                        <ExternalLink size={12} />
                                        پروفایل
                                    </Link>
                                </div>
                            ) : (
                                <p className="booking-empty">
                                    اطلاعات مشتری موجود نیست
                                </p>
                            )}
                        </div>

                        {/* ============ آرایشگر ============ */}
                        <div className="booking-show-card">
                            <div className="booking-show-card-header">
                                <div className="booking-show-card-icon purple">
                                    <Scissors size={20} />
                                </div>
                                <h2>آرایشگر</h2>
                            </div>
                            {booking.barber ? (
                                <div className="booking-user-card">
                                    <div className="booking-user-avatar barber">
                                        {booking.barber.avatar ? (
                                            <img
                                                src={booking.barber.avatar}
                                                alt={booking.barber.name}
                                            />
                                        ) : (
                                            booking.barber.name
                                                ?.charAt(0)
                                                .toUpperCase()
                                        )}
                                    </div>
                                    <div className="booking-user-info">
                                        <span className="booking-user-name">
                                            {booking.barber.name}
                                        </span>
                                        {booking.barber.phone && (
                                            <a
                                                href={`tel:${booking.barber.phone}`}
                                                className="booking-user-phone"
                                            >
                                                <Phone size={12} />
                                                {toPersianNumber(
                                                    booking.barber.phone,
                                                )}
                                            </a>
                                        )}
                                    </div>
                                    {booking.barber.slug && (
                                        <Link
                                            href={`/admin/barbers/${booking.barber.slug}/detail`}
                                            className="booking-user-link"
                                        >
                                            <ExternalLink size={12} />
                                            پروفایل
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <p className="booking-empty">
                                    اطلاعات آرایشگر موجود نیست
                                </p>
                            )}
                        </div>

                        {/* ============ زمان و خدمت ============ */}
                        <div className="booking-show-card">
                            <div className="booking-show-card-header">
                                <div className="booking-show-card-icon green">
                                    <Calendar size={20} />
                                </div>
                                <h2>زمان و خدمت</h2>
                            </div>
                            <div className="booking-info-grid">
                                {booking.time_slot && (
                                    <>
                                        <div className="booking-info-block">
                                            <span className="booking-info-label">
                                                <Calendar size={12} />
                                                تاریخ
                                            </span>
                                            <span className="booking-info-value">
                                                {booking.time_slot.date
                                                    ? formatFullDateWithoutTime(
                                                          booking.time_slot
                                                              .date,
                                                      )
                                                    : "—"}
                                            </span>
                                        </div>
                                        <div className="booking-info-block">
                                            <span className="booking-info-label">
                                                <Clock size={12} />
                                                ساعت
                                            </span>
                                            <span className="booking-info-value ltr">
                                                {toPersianNumber(
                                                    booking.time_slot
                                                        .start_time,
                                                )}
                                                {" - "}
                                                {toPersianNumber(
                                                    booking.time_slot.end_time,
                                                )}
                                            </span>
                                        </div>
                                    </>
                                )}
                                {booking.service && (
                                    <>
                                        <div className="booking-info-block">
                                            <span className="booking-info-label">
                                                <Scissors size={12} />
                                                خدمت
                                            </span>
                                            <span className="booking-info-value">
                                                {booking.service.name ?? "—"}
                                            </span>
                                        </div>
                                        <div className="booking-info-block">
                                            <span className="booking-info-label">
                                                <Clock size={12} />
                                                مدت زمان
                                            </span>
                                            <span className="booking-info-value">
                                                {toPersianNumber(
                                                    booking.service.duration ??
                                                        0,
                                                )}{" "}
                                                دقیقه
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ============ پرداخت ============ */}
                        {booking.payment && (
                            <div className="booking-show-card">
                                <div className="booking-show-card-header">
                                    <div className="booking-show-card-icon blue">
                                        <CreditCard size={20} />
                                    </div>
                                    <h2>اطلاعات پرداخت</h2>
                                </div>

                                <div className="booking-info-grid">
                                    <div className="booking-info-block">
                                        <span className="booking-info-label">
                                            درگاه پرداخت
                                        </span>
                                        <span className="booking-info-value">
                                            {gatewayLabels[
                                                booking.payment.gateway
                                            ] ??
                                                booking.payment.gateway ??
                                                "—"}
                                        </span>
                                    </div>
                                    <div className="booking-info-block">
                                        <span className="booking-info-label">
                                            <Hash size={12} />
                                            شماره تراکنش
                                        </span>
                                        <span className="booking-info-value ltr">
                                            {booking.payment.transaction_id ||
                                                "—"}
                                        </span>
                                    </div>
                                    <div className="booking-info-block">
                                        <span className="booking-info-label">
                                            <Calendar size={12} />
                                            تاریخ پرداخت
                                        </span>
                                        <span className="booking-info-value">
                                            {booking.payment.paid_at
                                                ? formatFullDateTime(
                                                      booking.payment.paid_at,
                                                  )
                                                : "—"}
                                        </span>
                                    </div>
                                </div>

                                <div className="booking-payment-total">
                                    <span className="booking-payment-total-label">
                                        <DollarSign size={16} />
                                        مبلغ پرداخت‌شده
                                    </span>
                                    <span className="booking-payment-total-value">
                                        {toPersianNumber(
                                            Number(
                                                booking.payment.amount ?? 0,
                                            ).toLocaleString("en-US"),
                                        )}
                                        <span className="currency">تومان</span>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ============ نظر ============ */}
                        {booking.review && (
                            <div className="booking-show-card">
                                <div className="booking-show-card-header">
                                    <div className="booking-show-card-icon yellow">
                                        <Star
                                            size={20}
                                            fill="#fbbf24"
                                            color="#fbbf24"
                                        />
                                    </div>
                                    <h2>نظر مشتری</h2>
                                </div>

                                <div className="booking-review-header">
                                    <div className="booking-review-stars">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                fill={
                                                    i <=
                                                    (booking.review.rating ?? 0)
                                                        ? "#fbbf24"
                                                        : "#e5e7eb"
                                                }
                                                color={
                                                    i <=
                                                    (booking.review.rating ?? 0)
                                                        ? "#fbbf24"
                                                        : "#e5e7eb"
                                                }
                                            />
                                        ))}
                                    </div>
                                    <span className="booking-review-rating">
                                        {toPersianNumber(
                                            booking.review.rating ?? 0,
                                        )}{" "}
                                        / ۵
                                    </span>
                                </div>

                                {booking.review.comment && (
                                    <p className="booking-review-comment">
                                        {booking.review.comment}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ============ ستون چپ ============ */}
                    <div className="booking-show-sidebar">
                        {/* ============ خلاصه مالی ============ */}
                        <div className="booking-show-card booking-summary-card">
                            <div className="booking-show-card-header">
                                <div className="booking-show-card-icon green">
                                    <DollarSign size={20} />
                                </div>
                                <h2>خلاصه مالی</h2>
                            </div>

                            <div className="booking-summary-list">
                                {booking.service?.price !== undefined && (
                                    <div className="booking-summary-row">
                                        <span className="booking-summary-label">
                                            مبلغ خدمت
                                        </span>
                                        <span className="booking-summary-value">
                                            {toPersianNumber(
                                                Number(
                                                    booking.service.price ?? 0,
                                                ).toLocaleString("en-US"),
                                            )}
                                            <span className="currency">
                                                تومان
                                            </span>
                                        </span>
                                    </div>
                                )}

                                <div className="booking-summary-row total">
                                    <span className="booking-summary-label">
                                        مبلغ نهایی
                                    </span>
                                    <span className="booking-summary-value">
                                        {toPersianNumber(
                                            Number(
                                                booking.amount ?? 0,
                                            ).toLocaleString("en-US"),
                                        )}
                                        <span className="currency">تومان</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ============ اعتراضات ============ */}
                        {Array.isArray(booking.disputes) &&
                            booking.disputes.length > 0 && (
                                <div className="booking-show-card">
                                    <div className="booking-show-card-header">
                                        <div className="booking-show-card-icon red">
                                            <AlertCircle size={20} />
                                        </div>
                                        <h2>
                                            اعتراضات (
                                            {toPersianNumber(
                                                booking.disputes.length,
                                            )}
                                            )
                                        </h2>
                                    </div>

                                    <div className="booking-disputes-list">
                                        {booking.disputes.map((d) => {
                                            const disputeStatusConfig =
                                                getDisputeStatusConfig(
                                                    d.status,
                                                );

                                            return (
                                                <div
                                                    key={d.id}
                                                    className="booking-dispute-item"
                                                >
                                                    <div className="booking-dispute-header">
                                                        <span className="booking-dispute-by">
                                                            <AlertCircle
                                                                size={12}
                                                            />
                                                            {d.disputed_by ===
                                                            "customer"
                                                                ? "مشتری"
                                                                : "آرایشگر"}
                                                        </span>
                                                        <span className="booking-dispute-status">
                                                            {
                                                                disputeStatusConfig.label
                                                            }
                                                        </span>
                                                    </div>

                                                    {d.reason && (
                                                        <p className="booking-dispute-reason">
                                                            {d.reason}
                                                        </p>
                                                    )}

                                                    {d.created_at && (
                                                        <span className="booking-dispute-date">
                                                            <Clock size={10} />
                                                            {formatFullDateTime(
                                                                d.created_at,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        {/* ============ راهنما ============ */}
                        <div className="booking-show-card">
                            <div className="booking-show-card-header">
                                <div className="booking-show-card-icon gray">
                                    <Info size={20} />
                                </div>
                                <h2>راهنما</h2>
                            </div>

                            <ul className="booking-status-guide">
                                <li>
                                    <CheckCircle size={14} />
                                    <span>
                                        این صفحه فقط برای مشاهده، توسط ادمین
                                        است.
                                    </span>
                                </li>
                                <li>
                                    <AlertCircle size={14} />
                                    <span>
                                        برای تغییر وضعیت رزرو، از پنل آرایشگر
                                        استفاده کنید.
                                    </span>
                                </li>
                                <li>
                                    <Info size={14} />
                                    <span>
                                        در صورت وجود اعتراض، از صفحه مدیریت
                                        اعتراضات پیگیری کنید.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
