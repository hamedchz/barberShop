import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PublicLayout from "../Layouts/PublicLayout";
import HorizontalCalendar from "../Components/HorizontalCalendar";
import ConfirmModal from "../../Admin/Components/ConfirmModal";
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
    ChevronLeft,
} from "lucide-react";
import {
    toPersianNumber,
    toPersianTimeRange,
    toPersianTime,
} from "../../../utils/persianNumbers";
import { toJalaali } from "jalaali-js";

const daysOfWeek = [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
];

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

export default function BarbersShow({
    auth,
    barber,
    services,
    availabilities,
    slotsByDate,
}) {
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingModal, setBookingModal] = useState({
        isOpen: false,
        isLoading: false,
    });

    // ============ پیدا کردن اولین روز دارای نوبت ============
    const getFirstAvailableDate = () => {
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = `${date.getFullYear()}-${String(
                date.getMonth() + 1,
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

            if (slotsByDate[dateStr]?.length > 0) {
                return date;
            }
        }
        return today;
    };

    const [selectedDate, setSelectedDate] = useState(() =>
        getFirstAvailableDate(),
    );

    // ============ بررسی لاگین ============
    const isLoggedIn = !!auth?.user;

    const selectedDateStr = useMemo(() => {
        const d = selectedDate;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0",
        )}-${String(d.getDate()).padStart(2, "0")}`;
    }, [selectedDate]);

    const slotsForDate = useMemo(() => {
        const slots = slotsByDate[selectedDateStr] || [];
        if (!selectedServiceId) return slots;
        return slots.filter(
            (s) => String(s.service_id) === String(selectedServiceId),
        );
    }, [slotsByDate, selectedDateStr, selectedServiceId]);

    const handleSelectService = (serviceId) => {
        setSelectedServiceId((prev) => (prev === serviceId ? null : serviceId));
        setSelectedSlot(null);
    };

    const handleSelectSlot = (slot) => setSelectedSlot(slot);

    const openBookingModal = () => {
        if (!selectedSlot) return;

        // ============ اگر لاگین نکرده → ریدایرکت به لاگین ============
        if (!isLoggedIn) {
            if (
                confirm(
                    "برای رزرو نوبت باید وارد حساب خود شوید. آیا می‌خواهید به صفحه ورود بروید؟",
                )
            ) {
                // ذخیره انتخاب در sessionStorage
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

        setBookingModal({ isOpen: true, isLoading: false });
    };

    const handleConfirmBooking = () => {
        if (!selectedSlot) return;
        setBookingModal((prev) => ({ ...prev, isLoading: true }));

        router.post(
            "/customer/bookings/create",
            { time_slot_id: selectedSlot.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setBookingModal({ isOpen: false, isLoading: false });
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

    const dayOfWeek = selectedDate.getDay();
    const iranianDayOfWeek = (dayOfWeek + 1) % 7;
    const availability = availabilities.find(
        (a) => a.day_of_week === iranianDayOfWeek,
    );

    // ============ بررسی گذشته بودن یک بازه ============
    const isPastSlot = (slot, date) => {
        const now = new Date();

        // ساخت تاریخ و ساعت بازه
        const slotDate = new Date(date);
        const [hours, minutes] = slot.start_time.split(":").map(Number);
        slotDate.setHours(hours, minutes, 0, 0);

        return slotDate < now;
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
                                        src={barber.thumbnail}
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

                            <div className="barber-hero-meta">
                                <div className="barber-hero-rating">
                                    <Star
                                        size={14}
                                        fill="#fbbf24"
                                        color="#fbbf24"
                                    />
                                    <span>
                                        {toPersianNumber(barber.rating)}
                                    </span>
                                    <span className="count">
                                        ({toPersianNumber(barber.total_reviews)}{" "}
                                        نظر)
                                    </span>
                                </div>
                            </div>

                            <p className="barber-hero-bio">{barber.bio}</p>
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

                {/* ============ مراحل رزرو ============ */}
                <div className="public-booking-steps">
                    {/* مرحله ۱: انتخاب خدمت */}
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
                                            handleSelectService(service.id)
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
                                                    <Scissors size={28} />
                                                </div>
                                            )}

                                            {isSelected && (
                                                <div className="public-service-check">
                                                    <CheckCircle size={20} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="public-service-info">
                                            <h4 className="public-service-name">
                                                {service.name}
                                            </h4>

                                            {service.description && (
                                                <p className="public-service-desc">
                                                    {service.description}
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
                    </div>

                    {/* مرحله ۲: انتخاب تاریخ */}
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

                    {/* مرحله ۳: انتخاب ساعت */}
                    <div className="public-booking-step">
                        <div className="public-step-header">
                            <div className="public-step-number">۳</div>
                            <div>
                                <h2 className="public-step-title">
                                    انتخاب ساعت
                                </h2>
                                <p className="public-step-subtitle">
                                    {formatJalaliDate(selectedDate)} — یکی از
                                    بازه‌های زیر را انتخاب کنید.
                                </p>
                            </div>
                        </div>

                        {slotsForDate.length === 0 ? (
                            <div className="public-empty-slots">
                                <Clock size={40} />
                                <h4>هیچ نوبتی موجود نیست</h4>
                                <p>
                                    برای این روز نوبتی ثبت نشده است. روز دیگری
                                    را امتحان کنید.
                                </p>
                            </div>
                        ) : (
                            <div className="public-slots-grid">
                                {slotsForDate.map((slot) => {
                                    const isBooked = slot.status === "booked";
                                    const isBlocked = slot.status === "blocked";
                                    const isDisabled = isBooked || isBlocked;
                                    // ============ محتوای Tooltip ============

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
                                            className={
                                                isDisabled
                                                    ? "public-slot-btn-reserved"
                                                    : isPast
                                                      ? "public-slot-btn-past"
                                                      : isSelected
                                                        ? "selected public-slot-btn"
                                                        : "public-slot-btn"
                                            }
                                            onClick={
                                                !isDisabled && !isPast
                                                    ? () =>
                                                          handleSelectSlot(slot)
                                                    : undefined
                                            }
                                            disabled={isDisabled || isPast}
                                        >
                                            <Clock size={14} />

                                            <span className="slot-time">
                                                {toPersianTime(slot.start_time)}
                                            </span>

                                            {slot.service && (
                                                <span className="slot-service">
                                                    {slot.service.name}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ============ نوار خلاصه رزرو ============ */}
                {selectedSlot && (
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
                            <div className="summary-item">
                                <DollarSign size={16} />
                                <span>
                                    {parseFloat(
                                        selectedSlot.service.price,
                                    ).toLocaleString("fa-IR")}{" "}
                                </span>
                            </div>
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
                    setBookingModal({ isOpen: false, isLoading: false })
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
