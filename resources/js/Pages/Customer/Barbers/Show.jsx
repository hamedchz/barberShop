import React, { useState, useMemo, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PublicLayout from "../Layouts/PublicLayout";
import HorizontalCalendar from "../Components/HorizontalCalendar";
import ConfirmModal from "../../Admin/Components/ConfirmModal";
// import RatingStars from "../Components/RatingStars";
// import Tooltip from "../Components/Tooltip";

import {
    ArrowRight,
    Star,
    Wifi,
    WifiOff,
    Clock,
    DollarSign,
    Scissors,
    Calendar,
    CheckCircle,
    Award,
    AlertCircle,
    User,
    MessageCircle,
    MapPin,
    Briefcase,
} from "lucide-react";

import {
    toPersianNumber,
    toPersianTimeRange,
    toPersianTime,
} from "../../../utils/persianNumbers";

import { toJalaali } from "jalaali-js";

// ============ ثابت‌ها ============
const daysOfWeek = [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
];

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

const formatRelativeDate = (date) => {
    if (!date) return "";

    const d = new Date(date);
    const now = new Date();

    const diffInMinutes = Math.floor((now - d) / 1000 / 60);

    if (diffInMinutes < 1) return "همین الان";

    if (diffInMinutes < 60) {
        return `${toPersianNumber(diffInMinutes)} دقیقه پیش`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInHours < 24) {
        return `${toPersianNumber(diffInHours)} ساعت پیش`;
    }

    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays < 30) {
        return `${toPersianNumber(diffInDays)} روز پیش`;
    }

    return formatJalaliDate(date);
};

// ============ کامپوننت اصلی ============
export default function BarbersShow({
    auth,
    barber,
    services = [],
    availabilities = [],
    slotsByDate = {},
    reviews = [],
}) {
    // ============ State ============

    const [selectedServiceId, setSelectedServiceId] = useState(
        () => services[0]?.id || null,
    );

    const [selectedSlot, setSelectedSlot] = useState(null);

    const [bookingModal, setBookingModal] = useState({
        isOpen: false,
        isLoading: false,
    });

    const [activeTab, setActiveTab] = useState("booking");

    const [currentTime, setCurrentTime] = useState(new Date());

    // ============ بروزرسانی زمان هر دقیقه ============
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // ============ پیدا کردن اولین روز دارای نوبت ============
    const getFirstAvailableDate = () => {
        const today = new Date();
        const now = new Date();

        for (let i = 0; i < 14; i++) {
            const date = new Date(today);

            date.setDate(today.getDate() + i);

            const dateStr = `${date.getFullYear()}-${String(
                date.getMonth() + 1,
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

            const slots = slotsByDate[dateStr] || [];

            // فیلتر بازه‌های گذشته برای امروز
            const availableSlots = slots.filter((slot) => {
                if (i === 0) {
                    const slotDate = new Date(date);

                    const [h, m] = slot.start_time.split(":").map(Number);

                    slotDate.setHours(h, m, 0, 0);

                    return slotDate > now;
                }

                return true;
            });

            if (availableSlots.length > 0) {
                return date;
            }
        }

        return today;
    };

    const [selectedDate, setSelectedDate] = useState(() =>
        getFirstAvailableDate(),
    );

    const isLoggedIn = !!auth?.user;

    // ============ تاریخ میلادی به فرمت YYYY-MM-DD ============
    const selectedDateStr = useMemo(() => {
        const d = selectedDate;

        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0",
        )}-${String(d.getDate()).padStart(2, "0")}`;
    }, [selectedDate]);

    // ============ فیلتر بازه‌ها بر اساس سرویس ============
    const slotsForDate = useMemo(() => {
        const slots = slotsByDate[selectedDateStr] || [];

        // اگر سرویسی انتخاب نشده باشد، هیچ بازه‌ای نمایش نده
        if (!selectedServiceId) {
            return [];
        }

        // فقط بازه‌های مربوط به سرویس انتخاب شده
        return slots.filter(
            (s) => String(s.service_id) === String(selectedServiceId),
        );
    }, [slotsByDate, selectedDateStr, selectedServiceId]);

    // ============ هندلرها ============
    const handleSelectService = (serviceId) => {
        if (selectedServiceId === serviceId) return;

        setSelectedServiceId(serviceId);
        setSelectedSlot(null);
    };

    const handleSelectSlot = (slot) => {
        setSelectedSlot(slot);
    };

    const openBookingModal = () => {
        if (!selectedSlot) return;

        if (!isLoggedIn) {
            if (
                confirm(
                    "برای رزرو نوبت باید وارد حساب خود شوید. آیا می‌خواهید به صفحه ورود بروید؟",
                )
            ) {
                sessionStorage.setItem(
                    "pending_booking",
                    JSON.stringify({
                        time_slot_id: selectedSlot.id,
                        barber_id: barber.id,
                    }),
                );

                window.location.href = "/login";
            }

            return;
        }

        setBookingModal({
            isOpen: true,
            isLoading: false,
        });
    };

    const handleConfirmBooking = () => {
        if (!selectedSlot) return;

        setBookingModal((prev) => ({
            ...prev,
            isLoading: true,
        }));

        router.post(
            "/customer/bookings/create",
            {
                time_slot_id: selectedSlot.id,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setBookingModal({
                        isOpen: false,
                        isLoading: false,
                    });

                    setSelectedSlot(null);
                },

                onError: () => {
                    setBookingModal((prev) => ({
                        ...prev,
                        isLoading: false,
                    }));
                },
            },
        );
    };

    // ============ روز هفته ============
    const dayOfWeek = selectedDate.getDay();

    const iranianDayOfWeek = (dayOfWeek + 1) % 7;

    const availability = availabilities.find(
        (a) => a.day_of_week === iranianDayOfWeek,
    );

    // ============ بررسی گذشته بودن یک بازه ============
    const isPastSlot = (slot, date) => {
        const slotDate = new Date(date);

        const [hours, minutes] = slot.start_time.split(":").map(Number);

        slotDate.setHours(hours, minutes, 0, 0);

        return slotDate < currentTime;
    };

    return (
        <PublicLayout>
            <Head title={`رزرو نوبت - ${barber.name}`} />

            <div className="public-booking-container">
                {/* ============ دکمه بازگشت ============ */}
                <div className="public-back-wrapper">
                    <Link href="/barbers" className="public-back-btn">
                        <ArrowRight size={18} />
                        <span>بازگشت به لیست آرایشگران</span>
                    </Link>
                </div>

                {/* ============ کارت پروفایل آرایشگر ============ */}
                <div className="barber-hero-card">
                    <div className="barber-hero-shape"></div>

                    <div className="barber-hero-content">
                        <div className="barber-hero-avatar-wrapper">
                            <div className="barber-hero-avatar">
                                {barber.avatar ? (
                                    <img
                                        src={barber.avatar}
                                        alt={barber.name}
                                    />
                                ) : (
                                    <span>
                                        {barber.name?.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {barber.is_online && (
                                <span className="barber-hero-online">
                                    <span className="pulse-ring"></span>
                                </span>
                            )}
                        </div>

                        <div className="barber-hero-info">
                            <div className="barber-hero-name-row">
                                <h1 className="barber-hero-name">
                                    {barber.name}
                                </h1>

                                {barber.is_online ? (
                                    <span className="barber-hero-status online">
                                        <Wifi size={12} />
                                        آنلاین
                                    </span>
                                ) : (
                                    <span className="barber-hero-status offline">
                                        <WifiOff size={12} />
                                        آفلاین
                                    </span>
                                )}
                            </div>

                            {/* متادیتا */}
                            <div className="barber-hero-meta">
                                {barber.total_reviews > 0 ? (
                                    <div className="barber-hero-rating">
                                        <Star
                                            size={14}
                                            fill="#fbbf24"
                                            color="#fbbf24"
                                        />

                                        <span>
                                            {toPersianNumber(
                                                parseFloat(
                                                    barber.rating || 0,
                                                ).toFixed(1),
                                            )}
                                        </span>

                                        <span className="count">
                                            (
                                            {toPersianNumber(
                                                barber.total_reviews,
                                            )}{" "}
                                            نظر)
                                        </span>
                                    </div>
                                ) : (
                                    <div className="barber-hero-rating new">
                                        <Award size={14} />
                                        <span>آرایشگر جدید</span>
                                    </div>
                                )}

                                {barber.experience_years > 0 && (
                                    <div className="barber-hero-meta-item">
                                        <Briefcase size={14} />

                                        <span>
                                            {toPersianNumber(
                                                barber.experience_years,
                                            )}{" "}
                                            سال سابقه
                                        </span>
                                    </div>
                                )}

                                {barber.city && (
                                    <div className="barber-hero-meta-item">
                                        <MapPin size={14} />
                                        <span>{barber.city}</span>
                                    </div>
                                )}
                            </div>

                            {/* تخصص */}
                            {barber.specialty && (
                                <div className="barber-hero-specialty">
                                    <Award size={14} />
                                    <span>{barber.specialty}</span>
                                </div>
                            )}

                            <p className="barber-hero-bio">
                                {barber.bio ||
                                    "آرایشگر حرفه‌ای با تجربه در ارائه خدمات آرایشی"}
                            </p>
                        </div>
                    </div>

                    {/* برنامه هفتگی */}
                    {availabilities.length > 0 && (
                        <div className="barber-hero-schedule">
                            <h3 className="barber-hero-schedule-title">
                                <Calendar size={16} />
                                برنامه هفتگی
                            </h3>

                            <div className="schedule-chips">
                                {availabilities.map((avail) => (
                                    <div
                                        key={avail.day_of_week}
                                        className="schedule-chip"
                                    >
                                        <span className="chip-day">
                                            {daysOfWeek[avail.day_of_week]}
                                        </span>

                                        <span className="chip-time">
                                            {toPersianTimeRange(
                                                avail.start_time,
                                                avail.end_time,
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ============ تب‌ها ============ */}
                <div className="public-tabs">
                    <button
                        className={`public-tab ${
                            activeTab === "booking" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("booking")}
                    >
                        <Calendar size={16} />
                        رزرو نوبت
                    </button>

                    <button
                        className={`public-tab ${
                            activeTab === "reviews" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("reviews")}
                    >
                        <MessageCircle size={16} />
                        نظرات
                        {barber.total_reviews > 0 && (
                            <span className="tab-count">
                                {toPersianNumber(barber.total_reviews)}
                            </span>
                        )}
                    </button>
                </div>

                {/* ============ تب رزرو ============ */}
                {activeTab === "booking" && (
                    <div className="public-booking-steps">
                        {/* مرحله ۱ */}
                        <div className="public-booking-step">
                            <div className="public-step-header">
                                <div className="public-step-number">۱</div>

                                <div>
                                    <h2 className="public-step-title">
                                        انتخاب خدمت
                                    </h2>

                                    <p className="public-step-subtitle">
                                        خدمتی که می‌خواهید دریافت کنید را انتخاب
                                        کنید.
                                    </p>
                                </div>
                            </div>

                            {services.length === 0 ? (
                                <div className="public-empty-slots">
                                    <Scissors size={40} />

                                    <h4>هیچ خدمتی موجود نیست</h4>

                                    <p>
                                        این آرایشگر هنوز خدمتی تعریف نکرده است.
                                    </p>
                                </div>
                            ) : (
                                <div className="public-services-grid">
                                    {services.map((service) => {
                                        const isSelected =
                                            selectedServiceId === service.id;

                                        return (
                                            <button
                                                key={service.id}
                                                type="button"
                                                className={`public-service-card ${
                                                    isSelected ? "selected" : ""
                                                }`}
                                                onClick={() =>
                                                    handleSelectService(
                                                        service.id,
                                                    )
                                                }
                                            >
                                                <div className="public-service-image">
                                                    {service.image ? (
                                                        <img
                                                            src={service.image}
                                                            alt={service.name}
                                                        />
                                                    ) : (
                                                        <div className="public-service-placeholder">
                                                            <Scissors
                                                                size={28}
                                                            />
                                                        </div>
                                                    )}

                                                    {isSelected && (
                                                        <div className="public-service-check">
                                                            <CheckCircle
                                                                size={20}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="public-service-info">
                                                    <h4 className="public-service-name">
                                                        {service.name}
                                                    </h4>

                                                    {service.description && (
                                                        <p className="public-service-desc">
                                                            {
                                                                service.description
                                                            }
                                                        </p>
                                                    )}

                                                    <div className="public-service-meta">
                                                        <span>
                                                            <Clock size={12} />
                                                            {toPersianNumber(
                                                                service.duration,
                                                            )}{" "}
                                                            دقیقه
                                                        </span>

                                                        <span className="price">
                                                            {parseFloat(
                                                                service.price,
                                                            ).toLocaleString(
                                                                "fa-IR",
                                                            )}{" "}
                                                            تومان
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* مرحله ۲ */}
                        <div className="public-booking-step">
                            <div className="public-step-header">
                                <div className="public-step-number">۲</div>

                                <div>
                                    <h2 className="public-step-title">
                                        انتخاب تاریخ
                                    </h2>

                                    <p className="public-step-subtitle">
                                        روز مورد نظر خود را انتخاب کنید.
                                    </p>
                                </div>
                            </div>

                            <HorizontalCalendar
                                selectedDate={selectedDate}
                                onSelectDate={(d) => {
                                    setSelectedDate(d);
                                    setSelectedSlot(null);
                                }}
                                slotsByDate={slotsByDate}
                                daysToShow={14}
                            />

                            <div className="public-day-info">
                                {availability ? (
                                    <div className="day-info-item">
                                        <Calendar size={14} />

                                        <span>
                                            برنامه این روز:{" "}
                                            <strong>
                                                {toPersianTimeRange(
                                                    availability.start_time,
                                                    availability.end_time,
                                                )}
                                            </strong>
                                        </span>
                                    </div>
                                ) : (
                                    <div className="day-info-item warning">
                                        <AlertCircle size={14} />
                                        <span>این روز تعطیل است.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* مرحله ۳ */}
                        <div className="public-booking-step">
                            <div className="public-step-header">
                                <div className="public-step-number">۳</div>

                                <div>
                                    <h2 className="public-step-title">
                                        انتخاب ساعت
                                    </h2>

                                    <p className="public-step-subtitle">
                                        {formatJalaliDate(selectedDate)} — یکی
                                        از بازه‌های زیر را انتخاب کنید.
                                    </p>
                                </div>
                            </div>

                            {/* نمایش ساعت‌ها */}
                            {slotsForDate.length === 0 ? (
                                <div className="public-empty-slots">
                                    <Clock size={40} />

                                    <h4>هیچ نوبتی موجود نیست</h4>

                                    <p>
                                        برای این روز نوبتی ثبت نشده است یا همه
                                        نوبت‌ها گذشته‌اند. روز دیگری را امتحان
                                        کنید.
                                    </p>
                                </div>
                            ) : (
                                <div className="public-slots-grid">
                                    {slotsForDate.map((slot) => {
                                        const isBooked =
                                            slot.status === "booked";

                                        const isBlocked =
                                            slot.status === "blocked";

                                        const isDisabled =
                                            isBooked || isBlocked;

                                        const isSelected =
                                            selectedSlot?.id === slot.id;

                                        const isPast = isPastSlot(
                                            slot,
                                            selectedDateStr,
                                        );

                                        return (
                                            <button
                                                key={slot.id}
                                                type="button"
                                                className={`public-slot-btn ${
                                                    isSelected ? "selected" : ""
                                                } ${isPast ? "past" : ""} ${
                                                    isDisabled ? "disabled" : ""
                                                }`}
                                                onClick={
                                                    !isDisabled && !isPast
                                                        ? () =>
                                                              handleSelectSlot(
                                                                  slot,
                                                              )
                                                        : (e) =>
                                                              e.preventDefault()
                                                }
                                                disabled={isDisabled || isPast}
                                                title={
                                                    isPast
                                                        ? "این نوبت منقضی شده است"
                                                        : isBooked
                                                          ? "این نوبت قبلاً رزرو شده"
                                                          : isBlocked
                                                            ? "این نوبت بسته شده است"
                                                            : "برای انتخاب کلیک کنید"
                                                }
                                            >
                                                <Clock size={14} />

                                                <span className="slot-time">
                                                    {toPersianTime(
                                                        slot.start_time,
                                                    )}
                                                </span>

                                                {slot.service && (
                                                    <span className="slot-service">
                                                        {slot.service.name}
                                                    </span>
                                                )}

                                                {isPast && (
                                                    <span className="slot-past-label">
                                                        منقضی
                                                    </span>
                                                )}

                                                {isBooked && (
                                                    <span className="slot-booked-label">
                                                        رزرو شده
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ============ تب نظرات ============ */}
                {activeTab === "reviews" && (
                    <div className="barber-reviews-section">
                        <div className="reviews-header">
                            <h2 className="reviews-title">
                                <MessageCircle size={22} />
                                نظرات مشتریان
                                {barber.total_reviews > 0 && (
                                    <span className="reviews-count">
                                        {toPersianNumber(barber.total_reviews)}{" "}
                                        نظر
                                    </span>
                                )}
                            </h2>

                            {barber.total_reviews > 0 && (
                                <div className="reviews-summary">
                                    <div className="reviews-average">
                                        <span className="average-number">
                                            {toPersianNumber(
                                                parseFloat(
                                                    barber.rating || 0,
                                                ).toFixed(1),
                                            )}
                                        </span>

                                        <RatingStars
                                            rating={barber.rating}
                                            size={18}
                                            showNumber={false}
                                            showTotal={false}
                                        />

                                        <span className="average-label">
                                            از{" "}
                                            {toPersianNumber(
                                                barber.total_reviews,
                                            )}{" "}
                                            نظر
                                        </span>
                                    </div>

                                    <div className="rating-distribution">
                                        {[5, 4, 3, 2, 1].map((star) => {
                                            const count =
                                                barber.rating_distribution?.[
                                                    star
                                                ] || 0;

                                            const percent =
                                                barber.total_reviews > 0
                                                    ? (count /
                                                          barber.total_reviews) *
                                                      100
                                                    : 0;

                                            return (
                                                <div
                                                    key={star}
                                                    className="distribution-row"
                                                >
                                                    <span className="distribution-star">
                                                        {toPersianNumber(star)}{" "}
                                                        ستاره
                                                    </span>

                                                    <div className="distribution-bar">
                                                        <div
                                                            className="distribution-fill"
                                                            style={{
                                                                width: `${percent}%`,
                                                            }}
                                                        ></div>
                                                    </div>

                                                    <span className="distribution-count">
                                                        {toPersianNumber(count)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {reviews.length === 0 ? (
                            <div className="no-reviews">
                                <MessageCircle size={48} />

                                <h3>هنوز نظری ثبت نشده است</h3>

                                <p>اولین نفری باشید که نظر می‌دهید!</p>
                            </div>
                        ) : (
                            <div className="reviews-list">
                                {reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="review-card"
                                    >
                                        <div className="review-header">
                                            <div className="review-user">
                                                <div className="review-avatar">
                                                    {review.user.avatar ? (
                                                        <img
                                                            src={
                                                                review.user
                                                                    .avatar
                                                            }
                                                            alt={
                                                                review.user.name
                                                            }
                                                        />
                                                    ) : (
                                                        <span>
                                                            {review.user.name
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <span className="review-user-name">
                                                        {review.user.name}
                                                    </span>

                                                    <span className="review-date">
                                                        {formatRelativeDate(
                                                            review.created_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <RatingStars
                                                rating={review.rating}
                                                size={14}
                                                showNumber={false}
                                                showTotal={false}
                                            />
                                        </div>

                                        {review.comment && (
                                            <p className="review-comment">
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ============ نوار خلاصه رزرو ============ */}
                {selectedSlot && activeTab === "booking" && (
                    <div className="public-booking-summary">
                        <div className="summary-content">
                            {selectedSlot.service && (
                                <div className="summary-item">
                                    <Scissors size={16} />
                                    <span>{selectedSlot.service.name}</span>
                                </div>
                            )}

                            <div className="summary-item">
                                <Calendar size={16} />

                                <span>{formatJalaliDate(selectedDate)}</span>
                            </div>

                            <div className="summary-item">
                                <Clock size={16} />

                                <span>
                                    {toPersianTimeRange(
                                        selectedSlot.start_time,
                                        selectedSlot.end_time,
                                    )}
                                </span>
                            </div>

                            {selectedSlot.service && (
                                <div className="summary-item price">
                                    <DollarSign size={16} />

                                    <span>
                                        {parseFloat(
                                            selectedSlot.service.price,
                                        ).toLocaleString("fa-IR")}{" "}
                                        تومان
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            className="public-booking-btn"
                            onClick={openBookingModal}
                        >
                            {isLoggedIn ? (
                                <>
                                    <CheckCircle size={18} />
                                    تایید و رزرو نوبت
                                </>
                            ) : (
                                <>
                                    <User size={18} />
                                    ورود و رزرو نوبت
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* ============ Modal رزرو ============ */}
            <ConfirmModal
                isOpen={bookingModal.isOpen}
                onClose={() =>
                    setBookingModal({
                        isOpen: false,
                        isLoading: false,
                    })
                }
                onConfirm={handleConfirmBooking}
                title="تایید رزرو نوبت"
                message={
                    selectedSlot
                        ? `آیا از رزرو نوبت در تاریخ ${formatJalaliDate(
                              selectedDate,
                          )} از ساعت ${toPersianTime(
                              selectedSlot.start_time,
                          )} تا ${toPersianTime(
                              selectedSlot.end_time,
                          )} مطمئن هستید؟`
                        : ""
                }
                confirmText="بله، رزرو کن"
                cancelText="انصراف"
                type="success"
                isLoading={bookingModal.isLoading}
            />
        </PublicLayout>
    );
}
