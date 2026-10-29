import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import Pagination from "../../Admin/Components/Pagination";
import CustomerSpentModal from "./Components/CustomerSpentModal";
import "../Dashboard/Assets/css/BarberDashboard.css";
import "./Assets/css/BarberCustomers.css";
import "./Assets/css/BarberCustomerShowPage.css";
import {
    ArrowRight,
    User,
    Phone,
    Mail,
    Calendar,
    MapPin,
    Star,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    Scissors,
    Eye,
    TrendingUp,
    Award,
    CreditCard,
    Hash,
    ShoppingBag,
    UserCheck,
    Activity,
    Info,
    Banknote,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import {
    formatFullDateWithoutTime,
    formatFullDateTime,
} from "../../../utils/dateHelpers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";

// ============ تنظیمات وضعیت رزرو ============
const bookingStatusConfig = {
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

const paymentStatusConfig = {
    pending: { label: "در انتظار", color: "#92400e", bg: "#fffbeb" },
    success: { label: "موفق", color: "#065f46", bg: "#ecfdf5" },
    failed: { label: "ناموفق", color: "#991b1b", bg: "#fef2f2" },
    refunded: { label: "برگشت داده شده", color: "#5b21b6", bg: "#f5f3ff" },
};

export default function BarberCustomerShow({ customer, stats, bookings }) {
    const [showSpentModal, setShowSpentModal] = useState(false);
    return (
        <Layout>
            <Head title={customer.name} />

            <div className="barber-customer-show-page">
                {/* ============ بازگشت ============ */}
                <div className="customer-show-back">
                    <Link href="/barber/customers" className="btn-secondary">
                        <ArrowRight size={16} />
                        بازگشت به مشتریان
                    </Link>
                </div>

                {/* ============ پروفایل مشتری ============ */}
                <div className="customer-show-hero">
                    <div className="customer-show-avatar">
                        {customer.avatar ? (
                            <img src={customer.avatar} alt={customer.name} />
                        ) : (
                            customer.name?.charAt(0).toUpperCase() || "؟"
                        )}
                    </div>

                    <div className="customer-show-hero-content">
                        <div className="customer-show-hero-header">
                            <h1 className="customer-show-hero-name">
                                {customer.name}
                            </h1>
                            {stats.completed_bookings >= 3 && (
                                <span className="customer-show-vip-badge">
                                    <Award size={12} />
                                    مشتری وفادار
                                </span>
                            )}
                        </div>

                        <div className="customer-show-contact">
                            {customer.phone && (
                                <a
                                    href={`tel:${customer.phone}`}
                                    className="customer-show-contact-item"
                                >
                                    <Phone size={13} />
                                    <span dir="ltr">
                                        {toPersianNumber(customer.phone)}
                                    </span>
                                </a>
                            )}
                            {customer.email && (
                                <a
                                    href={`mailto:${customer.email}`}
                                    className="customer-show-contact-item"
                                >
                                    <Mail size={13} />
                                    <span dir="ltr">{customer.email}</span>
                                </a>
                            )}
                            {customer.city && (
                                <span className="customer-show-contact-item">
                                    <MapPin size={13} />
                                    <span>{customer.city}</span>
                                </span>
                            )}
                        </div>

                        <p className="customer-show-joined">
                            <Calendar size={12} />
                            عضو از{" "}
                            {formatFullDateWithoutTime(customer.created_at)}
                        </p>
                    </div>

                    {/* اکشن سریع */}
                    {customer.phone && (
                        <a
                            href={`tel:${customer.phone}`}
                            className="customer-show-call-btn"
                        >
                            <Phone size={16} />
                            تماس
                        </a>
                    )}
                </div>

                {/* ============ آمار ============ */}
                <div className="finance-stats-hint">
                    <Info size={14} />
                    <span>
                        برای مشاهده مبلغ دقیق و جزئیات، روی هر کارت کلیک کنید
                    </span>
                </div>
                <div className="barber-stats-grid">
                    <div className="barber-stat-card bookings">
                        <div className="barber-stat-icon bookings">
                            <Calendar size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">کل رزروها</span>
                            <div className="barber-stat-value">
                                {toPersianNumber(stats.total_bookings)}
                                <span className="barber-stat-unit">مورد</span>
                            </div>
                            <div className="barber-stat-footer">
                                <span className="barber-stat-subtitle">
                                    {toPersianNumber(stats.completed_bookings)}{" "}
                                    تکمیل‌شده
                                </span>
                            </div>
                        </div>
                    </div>

                    <div
                        className="barber-stat-card revenue"
                        onClick={() => setShowSpentModal(true)}
                        style={{ cursor: "pointer" }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setShowSpentModal(true);
                            }
                        }}
                        title="برای مشاهده جزئیات خرید کلیک کنید"
                    >
                        <div className="barber-stat-icon revenue">
                            <DollarSign size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">
                                مجموع خرید
                            </span>
                            <div className="barber-stat-value">
                                {formatCompactNumber(stats.total_spent)}
                                <span className="barber-stat-unit">تومان</span>
                            </div>
                            <div className="barber-stat-footer">
                                <span className="barber-stat-subtitle">
                                    <Eye
                                        size={10}
                                        style={{
                                            display: "inline",
                                            marginLeft: "0.25rem",
                                        }}
                                    />
                                    مشاهده جزئیات
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="barber-stat-card rating">
                        <div className="barber-stat-icon rating">
                            <Star size={24} fill="#fbbf24" color="#fbbf24" />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">
                                میانگین امتیاز
                            </span>
                            <div className="barber-stat-value">
                                {toPersianNumber(
                                    Number(stats.average_rating).toFixed(1),
                                )}
                                <span className="barber-stat-unit">از ۵</span>
                            </div>
                        </div>
                    </div>

                    <div className="barber-stat-card wallet">
                        <div className="barber-stat-icon wallet">
                            <XCircle size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">لغو‌شده</span>
                            <div className="barber-stat-value">
                                {toPersianNumber(stats.cancelled_bookings)}
                                <span className="barber-stat-unit">مورد</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============ لیست رزروها ============ */}
                <div className="barber-card">
                    <div className="barber-card-header">
                        <div className="barber-card-header-icon purple">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h2>رزروها</h2>
                            <p>{toPersianNumber(bookings.total)} رزرو با شما</p>
                        </div>
                    </div>

                    {bookings.data.length === 0 ? (
                        <div className="barber-empty-state">
                            <Calendar size={40} />
                            <p>هنوز رزروی ثبت نشده</p>
                        </div>
                    ) : (
                        <div className="customer-show-bookings-list">
                            {bookings.data.map((booking) => {
                                const statusConfig =
                                    bookingStatusConfig[booking.status] ??
                                    bookingStatusConfig.pending;
                                const StatusIcon = statusConfig.icon;

                                const payConfig = booking.payment
                                    ? (paymentStatusConfig[
                                          booking.payment.status
                                      ] ?? paymentStatusConfig.pending)
                                    : null;

                                return (
                                    <Link
                                        key={booking.id}
                                        href={`/barber/bookings/${booking.id}`}
                                        className="customer-show-booking-card"
                                    >
                                        {/* آیکون وضعیت */}
                                        <div
                                            className="customer-show-booking-icon"
                                            style={{
                                                background: statusConfig.bg,
                                                color: statusConfig.color,
                                            }}
                                        >
                                            <StatusIcon size={20} />
                                        </div>

                                        {/* اطلاعات */}
                                        <div className="customer-show-booking-content">
                                            <div className="customer-show-booking-header">
                                                <h3 className="customer-show-booking-title">
                                                    {booking.service ?? "—"}
                                                </h3>
                                                <span
                                                    className="customer-show-booking-badge"
                                                    style={{
                                                        color: statusConfig.color,
                                                        background:
                                                            statusConfig.bg,
                                                        borderColor:
                                                            statusConfig.border,
                                                    }}
                                                >
                                                    <StatusIcon size={10} />
                                                    {statusConfig.label}
                                                </span>
                                            </div>

                                            <div className="customer-show-booking-meta">
                                                {booking.date && (
                                                    <span className="customer-show-booking-meta-item">
                                                        <Calendar size={11} />
                                                        {formatFullDateWithoutTime(
                                                            booking.date,
                                                        )}
                                                    </span>
                                                )}
                                                {booking.start_time && (
                                                    <span className="customer-show-booking-meta-item">
                                                        <Clock size={11} />
                                                        {toPersianNumber(
                                                            booking.start_time.substring(
                                                                0,
                                                                5,
                                                            ),
                                                        )}
                                                        {" - "}
                                                        {toPersianNumber(
                                                            booking.end_time?.substring(
                                                                0,
                                                                5,
                                                            ),
                                                        )}
                                                    </span>
                                                )}
                                                {booking.duration && (
                                                    <span className="customer-show-booking-meta-item">
                                                        <Clock size={11} />
                                                        {toPersianNumber(
                                                            booking.duration,
                                                        )}{" "}
                                                        دقیقه
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* مبلغ و پرداخت */}
                                        <div className="customer-show-booking-amount">
                                            <span className="customer-show-booking-price">
                                                {toPersianNumber(
                                                    Number(
                                                        booking.amount,
                                                    ).toLocaleString("en-US"),
                                                )}{" "}
                                                <span className="currency">
                                                    تومان
                                                </span>
                                            </span>
                                            {payConfig && (
                                                <span
                                                    className="customer-show-booking-payment"
                                                    style={{
                                                        color: payConfig.color,
                                                        background:
                                                            payConfig.bg,
                                                    }}
                                                >
                                                    {payConfig.label}
                                                </span>
                                            )}
                                        </div>

                                        {/* نظر */}
                                        {booking.review && (
                                            <div className="customer-show-booking-review">
                                                <div className="customer-show-booking-review-stars">
                                                    {[1, 2, 3, 4, 5].map(
                                                        (i) => (
                                                            <Star
                                                                key={i}
                                                                size={11}
                                                                fill={
                                                                    i <=
                                                                    booking
                                                                        .review
                                                                        .rating
                                                                        ? "#fbbf24"
                                                                        : "#e5e7eb"
                                                                }
                                                                color={
                                                                    i <=
                                                                    booking
                                                                        .review
                                                                        .rating
                                                                        ? "#fbbf24"
                                                                        : "#e5e7eb"
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* فلش */}
                                        <Eye
                                            size={16}
                                            className="customer-show-booking-eye"
                                        />
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
                <Pagination links={bookings.links} only={bookings} />
            </div>

            {/* ============ Modal مجموع خرید ============ */}
            <CustomerSpentModal
                isOpen={showSpentModal}
                onClose={() => setShowSpentModal(false)}
                customer={customer}
                stats={stats}
                bookings={bookings.data}
            />
        </Layout>
    );
}
