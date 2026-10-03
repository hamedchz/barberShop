import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import PublicLayout from "../Layouts/PublicLayout";
import InteractiveRating from "../Components/InteractiveRating";
import {
    ArrowRight,
    User,
    Scissors,
    Calendar,
    Clock,
    MessageSquare,
    Send,
    AlertCircle,
    Star,
    CheckCircle,
    Sparkles,
    Heart,
    Info,
} from "lucide-react";
import { toJalaali } from "jalaali-js";
import {
    toPersianNumber,
    toPersianTimeRange,
} from "../../../utils/persianNumbers";
import "../Assets/InteractiveReview.css";
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

export default function BookingReview({ auth, booking, review = null }) {
    const isEditing = !!review;

    // ============ useForm ============
    const { data, setData, post, put, processing, errors, reset } = useForm({
        rating: review?.rating || 0,
        comment: review?.comment || "",
    });

    // ============ ارسال فرم ============
    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(`/customer/bookings/reviews/${review.id}`);
        } else {
            post(`/customer/bookings/reviews/${booking.id}`);
        }
    };

    return (
        <PublicLayout>
            <Head
                title={
                    isEditing
                        ? `ویرایش نظر - ${booking.barber?.name}`
                        : `ثبت نظر - ${booking.barber?.name}`
                }
            />

            <div className="review-page-container">
                {/* ============ دکمه بازگشت ============ */}
                <div className="review-page-back">
                    <Link
                        href={`/customer/bookings/${booking.id}`}
                        className="back-btn"
                    >
                        <ArrowRight size={20} />
                        <span>بازگشت به جزئیات رزرو</span>
                    </Link>
                </div>

                {/* ============ هدر ============ */}
                <div className="review-page-header">
                    <div className="review-header-icon">
                        <Sparkles size={28} />
                    </div>
                    <div>
                        <h1 className="review-page-title">
                            {isEditing
                                ? "ویرایش نظر شما"
                                : "تجربه خود را با ما به اشتراک بگذارید"}
                        </h1>
                        <p className="review-page-subtitle">
                            نظر شما به سایر مشتریان کمک می‌کند تا انتخاب بهتری
                            داشته باشند.
                        </p>
                    </div>
                </div>

                {/* ============ خلاصه رزرو ============ */}
                <div className="review-booking-summary">
                    {/* آرایشگر */}
                    <div className="summary-barber">
                        <div className="summary-barber-avatar">
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
                        <div className="summary-barber-info">
                            <span className="summary-barber-label">
                                آرایشگر
                            </span>
                            <span className="summary-barber-name">
                                {booking.barber?.name}
                            </span>
                            {booking.barber?.specialty && (
                                <span className="summary-barber-specialty">
                                    {booking.barber.specialty}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* اطلاعات رزرو */}
                    <div className="summary-details">
                        <div className="summary-detail-item">
                            <Scissors size={14} />
                            <span>{booking.service?.name}</span>
                        </div>
                        <div className="summary-detail-item">
                            <Calendar size={14} />
                            <span>
                                {getDayName(booking.date)}{" "}
                                {formatJalaliDate(booking.date)}
                            </span>
                        </div>
                        <div className="summary-detail-item">
                            <Clock size={14} />
                            <span>
                                {toPersianTimeRange(
                                    booking.start_time,
                                    booking.end_time,
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ============ فرم نظر ============ */}
                <form onSubmit={handleSubmit} className="review-form">
                    {/* ============ بخش امتیاز ============ */}
                    <div className="review-form-section rating-section">
                        <div className="review-section-header">
                            <div className="review-section-icon yellow">
                                <Star
                                    size={20}
                                    fill="#fbbf24"
                                    color="#fbbf24"
                                />
                            </div>
                            <div>
                                <h2 className="review-section-title">
                                    امتیاز شما به این خدمت
                                </h2>
                                <p className="review-section-subtitle">
                                    کیفیت کلی خدمت را چطور ارزیابی می‌کنید؟
                                </p>
                            </div>
                        </div>

                        <div className="rating-stars-container">
                            <InteractiveRating
                                value={data.rating}
                                onChange={(value) => setData("rating", value)}
                                size={48}
                            />
                        </div>

                        {errors.rating && (
                            <div className="form-error-box">
                                <AlertCircle size={14} />
                                <span>{errors.rating}</span>
                            </div>
                        )}
                    </div>

                    {/* ============ بخش متن نظر ============ */}
                    <div className="review-form-section">
                        <div className="review-section-header">
                            <div className="review-section-icon blue">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h2 className="review-section-title">
                                    نظر شما (اختیاری)
                                </h2>
                                <p className="review-section-subtitle">
                                    تجربه‌تان را با ما و سایر مشتریان در میان
                                    بگذارید.
                                </p>
                            </div>
                        </div>

                        <div className="review-textarea-wrapper">
                            <textarea
                                className={`review-textarea ${
                                    errors.comment ? "error" : ""
                                }`}
                                value={data.comment}
                                onChange={(e) =>
                                    setData("comment", e.target.value)
                                }
                                placeholder="مثلاً: کار بسیار عالی و تمیز بود. برخورد بسیار حرفه‌ای داشتند. حتماً دوباره میام..."
                                rows={6}
                                maxLength={1000}
                            />

                            <div className="review-textarea-footer">
                                <div className="char-counter">
                                    <span
                                        className={
                                            data.comment.length > 900
                                                ? "warning"
                                                : ""
                                        }
                                    >
                                        {toPersianNumber(data.comment.length)} /{" "}
                                        {toPersianNumber(1000)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {errors.comment && (
                            <div className="form-error-box">
                                <AlertCircle size={14} />
                                <span>{errors.comment}</span>
                            </div>
                        )}

                        {/* راهنما */}
                        <div className="review-info-box">
                            <Info size={14} />
                            <p>
                                <strong>نکته:</strong> نظر شما پس از ثبت به صورت
                                عمومی در پروفایل آرایشگر نمایش داده می‌شود.
                            </p>
                        </div>
                    </div>

                    {/* ============ دکمه‌های عملیات ============ */}
                    <div className="review-form-actions">
                        <Link
                            href={`/customer/bookings/${booking.id}`}
                            className="review-cancel-btn"
                        >
                            انصراف
                        </Link>

                        <button
                            type="submit"
                            className="review-submit-btn"
                            disabled={processing || data.rating === 0}
                        >
                            {processing ? (
                                <>
                                    <span className="spinner"></span>
                                    در حال ذخیره...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    {isEditing ? "بروزرسانی نظر" : "ثبت نظر"}
                                </>
                            )}
                        </button>
                    </div>

                    {/* نشانگر امتیاز پایین */}
                    {data.rating > 0 && (
                        <div className="review-footer-message">
                            <Heart size={14} fill="#ef4444" color="#ef4444" />
                            <span>
                                با ثبت نظر، به بهبود کیفیت خدمات ما کمک می‌کنید.
                                متشکریم!
                            </span>
                        </div>
                    )}
                </form>
            </div>
        </PublicLayout>
    );
}
