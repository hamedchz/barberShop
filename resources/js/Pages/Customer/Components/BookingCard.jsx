import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import {
    Calendar,
    Clock,
    Scissors,
    DollarSign,
    User,
    Phone,
    CheckCircle,
    XCircle,
    Clock4,
    Star,
    AlertCircle,
    MoreVertical,
    Eye,
    X,
    Hash,
    MessageCircle,
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

export default function BookingCard({ booking, onCancelClick, onReviewClick }) {
    const config = statusConfig[booking.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
        <div className={`booking-card status-${booking.status}`}>
            {/* ============ نوار رنگی بالا ============ */}
            <div
                className="booking-card-stripe"
                style={{ backgroundColor: config.color }}
            ></div>

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
                    {/* Badge وضعیت */}
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

                    {/* کد رزرو */}
                    <span className="booking-code">
                        <Hash size={12} />
                        {toPersianNumber(booking.id)}
                    </span>

                    {/* دکمه‌های عملیات */}
                    <div className="booking-buttons">
                        {/* مشاهده جزئیات */}
                        <Link
                            href={`/customer/bookings/${booking.id}`}
                            className="booking-btn view"
                        >
                            <Eye size={14} />
                            جزئیات
                        </Link>

                        {/* ثبت نظر (اگر تکمیل شده و نظر نداده) */}
                        {booking.can_review && (
                            <button
                                className="booking-btn review"
                                onClick={() => onReviewClick(booking)}
                            >
                                <Star size={14} />
                                ثبت نظر
                            </button>
                        )}

                        {/* مشاهده نظر (اگر قبلاً داده) */}
                        {booking.has_review && (
                            <button className="booking-btn reviewed" disabled>
                                <MessageCircle size={14} />
                                نظر داده شده
                            </button>
                        )}

                        {/* لغو رزرو */}
                        {booking.can_cancel && (
                            <button
                                className="booking-btn cancel"
                                onClick={() => onCancelClick(booking)}
                            >
                                <X size={14} />
                                لغو
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
