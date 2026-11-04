import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import PublicLayout from "../../../Layouts/PublicLayout";
import {
    Star,
    MapPin,
    Phone,
    Clock,
    Scissors,
    CheckCircle2,
    Calendar,
    ChevronLeft,
    User,
    ArrowRight,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../../utils/dateHelpers";

const DAY_NAMES = {
    0: "یکشنبه",
    1: "دوشنبه",
    2: "سه‌شنبه",
    3: "چهارشنبه",
    4: "پنجشنبه",
    5: "جمعه",
    6: "شنبه",
};

export default function BarberShow({
    barber,
    stats,
    reviews = [],
    weeklySchedule = [],
}) {
    const [selectedService, setSelectedService] = useState(null);

    return (
        <PublicLayout>
            <Head title={`${barber.name} - رزرو نوبت`} />

            <div className="barber-show-page">
                <div className="page-container">
                    {/* Back Link */}
                    <Link
                        href={route("public.barbers.index")}
                        className="back-link"
                    >
                        <ArrowRight size={16} />
                        بازگشت به لیست آرایشگران
                    </Link>

                    {/* Hero Card */}
                    <div className="barber-hero-card">
                        <div className="barber-hero-avatar-wrapper">
                            <div className="barber-hero-avatar">
                                {barber.avatar ? (
                                    <img
                                        src={barber.avatar}
                                        alt={barber.name}
                                    />
                                ) : (
                                    <User size={48} />
                                )}
                            </div>
                            {barber.is_online && (
                                <span className="barber-hero-online">
                                    <span className="pulse-ring" />
                                </span>
                            )}
                        </div>

                        <div className="barber-hero-content">
                            <h1 className="barber-hero-name">{barber.name}</h1>
                            {barber.specialty && (
                                <span className="barber-hero-specialty">
                                    <Scissors size={14} />
                                    {barber.specialty}
                                </span>
                            )}

                            <div className="barber-hero-meta">
                                <div className="barber-hero-rating">
                                    <Star size={16} fill="currentColor" />
                                    <span className="rating-value">
                                        {toPersianNumber(stats.average_rating)}
                                    </span>
                                    <span className="count">
                                        ({toPersianNumber(stats.reviews_count)}{" "}
                                        نظر)
                                    </span>
                                </div>

                                {barber.city && (
                                    <div className="barber-hero-meta-item">
                                        <MapPin size={14} />
                                        {barber.city}
                                    </div>
                                )}

                                <div className="barber-hero-meta-item">
                                    <CheckCircle2 size={14} />
                                    {toPersianNumber(
                                        stats.completed_bookings,
                                    )}{" "}
                                    رزرو موفق
                                </div>
                            </div>

                            {barber.bio && (
                                <p className="barber-hero-bio">{barber.bio}</p>
                            )}
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="barber-show-grid">
                        {/* Main */}
                        <div className="barber-show-main">
                            {/* Services */}
                            <div className="barber-section">
                                <h2 className="barber-section-title">
                                    <Scissors size={20} />
                                    خدمات
                                </h2>
                                <div className="barber-services-grid">
                                    {barber.services.map((service) => (
                                        <div
                                            key={service.id}
                                            className={`barber-service-card ${
                                                selectedService?.id ===
                                                service.id
                                                    ? "selected"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setSelectedService(service)
                                            }
                                        >
                                            <div className="service-card-header">
                                                <h3>{service.name}</h3>
                                                {selectedService?.id ===
                                                    service.id && (
                                                    <CheckCircle2 size={18} />
                                                )}
                                            </div>
                                            {service.description && (
                                                <p className="service-card-desc">
                                                    {service.description}
                                                </p>
                                            )}
                                            <div className="service-card-meta">
                                                <span className="price">
                                                    {toPersianNumber(
                                                        service.price.toLocaleString(),
                                                    )}{" "}
                                                    تومان
                                                </span>
                                                {service.duration && (
                                                    <span>
                                                        <Clock size={12} />
                                                        {toPersianNumber(
                                                            service.duration,
                                                        )}{" "}
                                                        دقیقه
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Weekly Schedule */}
                            {weeklySchedule.length > 0 && (
                                <div className="barber-section">
                                    <h2 className="barber-section-title">
                                        <Clock size={20} />
                                        ساعات کاری
                                    </h2>
                                    <div className="weekly-schedule">
                                        {weeklySchedule.map((slot, idx) => (
                                            <div
                                                key={idx}
                                                className="schedule-row"
                                            >
                                                <span className="schedule-day">
                                                    {DAY_NAMES[slot.day]}
                                                </span>
                                                <span
                                                    className="schedule-time"
                                                    dir="ltr"
                                                >
                                                    {slot.start_time} -{" "}
                                                    {slot.end_time}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reviews */}
                            {reviews.length > 0 && (
                                <div className="barber-section">
                                    <h2 className="barber-section-title">
                                        <Star size={20} />
                                        نظرات کاربران
                                        <span className="count-badge">
                                            {toPersianNumber(reviews.length)}
                                        </span>
                                    </h2>
                                    <div className="reviews-list">
                                        {reviews.map((review) => (
                                            <div
                                                key={review.id}
                                                className="review-card"
                                            >
                                                <div className="review-header">
                                                    <div className="review-user">
                                                        <div className="review-avatar">
                                                            {review.user_avatar ? (
                                                                <img
                                                                    src={
                                                                        review.user_avatar
                                                                    }
                                                                    alt={
                                                                        review.user_name
                                                                    }
                                                                />
                                                            ) : (
                                                                <User
                                                                    size={18}
                                                                />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="review-user-name">
                                                                {
                                                                    review.user_name
                                                                }
                                                            </span>
                                                            <span className="review-date">
                                                                {formatFullDateTime(
                                                                    review.created_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="review-stars">
                                                        {Array.from(
                                                            {
                                                                length: 5,
                                                            },
                                                            (_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={14}
                                                                    fill={
                                                                        i <
                                                                        review.rating
                                                                            ? "currentColor"
                                                                            : "none"
                                                                    }
                                                                    className={
                                                                        i <
                                                                        review.rating
                                                                            ? "filled"
                                                                            : "empty"
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="review-comment">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar — Booking */}
                        <div className="barber-show-sidebar">
                            <div className="booking-card sticky">
                                <div className="booking-card-header">
                                    <Calendar size={20} />
                                    <h3>رزرو نوبت</h3>
                                </div>

                                {selectedService ? (
                                    <>
                                        <div className="selected-service-info">
                                            <span className="label">
                                                خدمت انتخاب‌شده
                                            </span>
                                            <span className="value">
                                                {selectedService.name}
                                            </span>
                                            <span className="price">
                                                {toPersianNumber(
                                                    selectedService.price.toLocaleString(),
                                                )}{" "}
                                                تومان
                                            </span>
                                        </div>

                                        <Link
                                            href={route(
                                                "public.barbers.booking",
                                                barber.id,
                                            )}
                                            data={{
                                                service_id: selectedService.id,
                                            }}
                                            className="booking-btn"
                                        >
                                            <Calendar size={18} />
                                            ادامه رزرو
                                            <ChevronLeft size={16} />
                                        </Link>
                                    </>
                                ) : (
                                    <div className="booking-empty">
                                        <Scissors size={32} />
                                        <p>لطفاً ابتدا یک خدمت انتخاب کنید</p>
                                    </div>
                                )}

                                {barber.phone && (
                                    <a
                                        href={`tel:${barber.phone}`}
                                        className="contact-link"
                                    >
                                        <Phone size={16} />
                                        تماس با آرایشگر
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
