import React, { useEffect } from "react";

import { createPortal } from "react-dom";
import {
    X,
    CalendarCheck,
    ShieldCheck,
    Scissors,
    Clock3,
    UserRound,
    ArrowLeft,
    Smartphone,
} from "lucide-react";

import "../Assets/css/BookingAuthModal.css";
import { toPersianTime } from "../../../../utils/persianNumbers";

export default function BookingAuthModal({
    isOpen,
    onClose,
    onLogin,
    barber,
    service,
    selectedDate,
    selectedTime,
}) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        document.addEventListener("keydown", handleEscape);

        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen || typeof document === "undefined") {
        return null;
    }

    const formatDate = (date) => {
        if (!date) return "انتخاب نشده";

        const value = new Date(date);

        return new Intl.DateTimeFormat("fa-IR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(value);
    };

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose?.();
        }
    };

    return createPortal(
        <div
            className="booking-auth-overlay"
            onMouseDown={handleOverlayClick}
            role="presentation"
        >
            <div
                className="booking-auth-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-auth-title"
            >
                {/* Header */}
                <div className="booking-auth-header">
                    <div className="booking-auth-header-icon">
                        <CalendarCheck size={25} />
                    </div>

                    <button
                        type="button"
                        className="booking-auth-close"
                        onClick={onClose}
                        aria-label="بستن پنجره"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="booking-auth-content">
                    <div className="booking-auth-heading">
                        <h2 id="booking-auth-title">
                            نوبتت فقط یک قدم تا ثبت فاصله داره!
                        </h2>

                        <p>
                            برای نهایی کردن رزرو، وارد حساب کاربری خودت شو.
                            انتخاب‌های تو تا این مرحله حفظ شده‌اند.
                        </p>
                    </div>

                    {/* Booking Summary */}
                    <div className="booking-auth-summary">
                        <div className="booking-auth-summary-title">
                            <span className="booking-auth-summary-dot" />
                            خلاصه نوبت انتخابی
                        </div>

                        <div className="booking-auth-summary-items">
                            <div className="booking-auth-summary-item">
                                <div className="booking-auth-item-icon">
                                    <UserRound size={17} />
                                </div>

                                <div className="booking-auth-item-info">
                                    <span>آرایشگر</span>
                                    <strong>
                                        {barber?.name || "آرایشگر انتخابی"}
                                    </strong>
                                </div>
                            </div>

                            <div className="booking-auth-summary-item">
                                <div className="booking-auth-item-icon">
                                    <Scissors size={17} />
                                </div>

                                <div className="booking-auth-item-info">
                                    <span>خدمت</span>
                                    <strong>
                                        {service?.name || "خدمت انتخابی"}
                                    </strong>
                                </div>
                            </div>

                            <div className="booking-auth-summary-item">
                                <div className="booking-auth-item-icon">
                                    <CalendarCheck size={17} />
                                </div>

                                <div className="booking-auth-item-info">
                                    <span>تاریخ</span>
                                    <strong>{formatDate(selectedDate)}</strong>
                                </div>
                            </div>

                            <div className="booking-auth-summary-item">
                                <div className="booking-auth-item-icon">
                                    <Clock3 size={16} />
                                </div>
                                <div className="booking-auth-item-info">
                                    <span>ساعت</span>
                                    <strong>
                                        {selectedTime?.start_time &&
                                        selectedTime?.end_time
                                            ? `${toPersianTime(selectedTime.start_time)} تا ${toPersianTime(selectedTime.end_time)}`
                                            : "-"}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Login Action */}
                    <div className="booking-auth-actions">
                        <button
                            type="button"
                            className="booking-auth-login-btn"
                            onClick={onLogin}
                        >
                            <Smartphone size={19} />

                            <span>ورود یا ثبت‌نام با شماره موبایل</span>

                            <ArrowLeft size={18} />
                        </button>

                        <div className="booking-auth-security">
                            <ShieldCheck size={17} />

                            <span>ورود امن با کد تأیید پیامکی</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="booking-auth-footer">
                        با ورود به حساب کاربری، می‌توانی رزرو خودت را پیگیری و
                        مدیریت کنی.
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
