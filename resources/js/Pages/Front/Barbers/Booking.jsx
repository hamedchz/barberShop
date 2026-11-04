import React, { useState, useMemo } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import PublicLayout from "../../../Layouts/PublicLayout";
import {
    Calendar,
    Clock,
    Scissors,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    User,
    Wallet,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";

const DAY_NAMES = {
    0: "یکشنبه",
    1: "دوشنبه",
    2: "سه‌شنبه",
    3: "چهارشنبه",
    4: "پنجشنبه",
    5: "جمعه",
    6: "شنبه",
};

const MONTH_NAMES = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
];

export default function Booking({
    barber,
    service,
    availableDates = [],
    timeSlots = [],
    selectedDate,
}) {
    const { auth } = usePage().props;
    const [step, setStep] = useState(2); // 1=service, 2=date, 3=time, 4=confirm
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingDate, setBookingDate] = useState(selectedDate);

    const { data, setData, post, processing, errors } = useForm({
        service_id: service?.id,
        time_slot_id: null,
        notes: "",
    });

    // ============ انتخاب تاریخ ============
    const handleDateSelect = (date) => {
        setBookingDate(date);
        setSelectedSlot(null);
        window.location.href = route("public.barbers.booking", {
            barber: barber.id,
            date: date,
        });
    };

    // ============ انتخاب اسلات ============
    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
        setData("time_slot_id", slot.id);
    };

    // ============ ثبت رزرو ============
    const handleSubmit = () => {
        if (!auth?.user) {
            // هدایت به صفحه ورود
            window.location.href = route("login", {
                redirect: route("public.barbers.booking", barber.id),
            });
            return;
        }

        post(route("public.barbers.booking.store", barber.id));
    };

    // ============ فیلتر اسلات‌ها ============
    const filteredSlots = useMemo(() => {
        if (!selectedDate) return [];
        return timeSlots.filter((slot) => slot.date === selectedDate);
    }, [timeSlots, selectedDate]);

    return (
        <PublicLayout>
            <Head title={`رزرو نوبت با ${barber.name}`} />

            <div className="booking-flow-page">
                <div className="page-container">
                    {/* Back */}
                    <Link
                        href={route("public.barbers.show", barber.id)}
                        className="back-link"
                    >
                        <ArrowRight size={16} />
                        بازگشت به پروفایل
                    </Link>

                    {/* Steps */}
                    <div className="booking-steps">
                        {[
                            { num: 1, label: "خدمت", done: step > 1 },
                            { num: 2, label: "تاریخ", done: step > 2 },
                            { num: 3, label: "ساعت", done: step > 3 },
                            { num: 4, label: "تایید", done: step > 4 },
                        ].map((s) => (
                            <div
                                key={s.num}
                                className={`booking-step ${
                                    s.num === step ? "active" : ""
                                } ${s.done ? "done" : ""}`}
                            >
                                <div className="step-number">
                                    {s.done ? (
                                        <CheckCircle2 size={16} />
                                    ) : (
                                        toPersianNumber(s.num)
                                    )}
                                </div>
                                <span>{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="booking-layout">
                        {/* Main */}
                        <div className="booking-main">
                            {/* Step 1: Service */}
                            <div className="booking-section">
                                <div className="booking-section-header">
                                    <div className="section-icon">
                                        <Scissors size={20} />
                                    </div>
                                    <div>
                                        <h2>۱. انتخاب خدمت</h2>
                                        <p>خدمت موردنظر خود را انتخاب کنید</p>
                                    </div>
                                </div>

                                <div className="service-selected">
                                    <div className="service-selected-info">
                                        <span className="label">خدمت</span>
                                        <h3>{service.name}</h3>
                                        <span className="price">
                                            {toPersianNumber(
                                                service.price.toLocaleString(),
                                            )}{" "}
                                            تومان
                                        </span>
                                    </div>
                                    {service.duration && (
                                        <span className="duration">
                                            <Clock size={14} />
                                            {toPersianNumber(
                                                service.duration,
                                            )}{" "}
                                            دقیقه
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Step 2: Date */}
                            <div className="booking-section">
                                <div className="booking-section-header">
                                    <div className="section-icon">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <h2>۲. انتخاب تاریخ</h2>
                                        <p>روز موردنظر خود را انتخاب کنید</p>
                                    </div>
                                </div>

                                <div className="dates-scroll">
                                    {availableDates.map((date) => {
                                        const d = new Date(date);
                                        const persianDate =
                                            new Intl.DateTimeFormat("fa-IR", {
                                                weekday: "short",
                                                day: "numeric",
                                                month: "long",
                                            }).format(d);

                                        return (
                                            <button
                                                key={date}
                                                type="button"
                                                className={`date-card ${
                                                    bookingDate === date
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleDateSelect(date)
                                                }
                                            >
                                                <span className="date-day">
                                                    {persianDate.split(" ")[0]}
                                                </span>
                                                <span className="date-num">
                                                    {persianDate
                                                        .split(" ")
                                                        .slice(1, 2)
                                                        .join(" ")}
                                                </span>
                                                <span className="date-month">
                                                    {persianDate
                                                        .split(" ")
                                                        .slice(-1)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Step 3: Time */}
                            {bookingDate && (
                                <div className="booking-section">
                                    <div className="booking-section-header">
                                        <div className="section-icon">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <h2>۳. انتخاب ساعت</h2>
                                            <p>
                                                ساعت موردنظر خود را انتخاب کنید
                                            </p>
                                        </div>
                                    </div>

                                    {filteredSlots.length > 0 ? (
                                        <div className="time-slots-grid">
                                            {filteredSlots.map((slot) => (
                                                <button
                                                    key={slot.id}
                                                    type="button"
                                                    className={`time-slot ${
                                                        selectedSlot?.id ===
                                                        slot.id
                                                            ? "selected"
                                                            : ""
                                                    } ${
                                                        slot.is_booked
                                                            ? "disabled"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        !slot.is_booked &&
                                                        handleSlotSelect(slot)
                                                    }
                                                    disabled={slot.is_booked}
                                                >
                                                    <span
                                                        className="time"
                                                        dir="ltr"
                                                    >
                                                        {slot.start_time}
                                                    </span>
                                                    {slot.is_booked && (
                                                        <span className="status">
                                                            رزرو شده
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-slots">
                                            <Clock size={32} />
                                            <p>برای این روز نوبتی موجود نیست</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar — Summary */}
                        <div className="booking-sidebar">
                            <div className="summary-card">
                                <div className="summary-header">
                                    <Scissors size={20} />
                                    <h3>خلاصه رزرو</h3>
                                </div>

                                <div className="summary-content">
                                    <div className="summary-item">
                                        <span className="label">آرایشگر</span>
                                        <span className="value">
                                            {barber.name}
                                        </span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">خدمت</span>
                                        <span className="value">
                                            {service.name}
                                        </span>
                                    </div>
                                    {bookingDate && (
                                        <div className="summary-item">
                                            <span className="label">تاریخ</span>
                                            <span className="value">
                                                {new Intl.DateTimeFormat(
                                                    "fa-IR",
                                                    {
                                                        weekday: "long",
                                                        day: "numeric",
                                                        month: "long",
                                                    },
                                                ).format(new Date(bookingDate))}
                                            </span>
                                        </div>
                                    )}
                                    {selectedSlot && (
                                        <div className="summary-item">
                                            <span className="label">ساعت</span>
                                            <span className="value" dir="ltr">
                                                {selectedSlot.start_time} -{" "}
                                                {selectedSlot.end_time}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="summary-total">
                                    <span>مبلغ نهایی</span>
                                    <strong>
                                        {toPersianNumber(
                                            service.price.toLocaleString(),
                                        )}{" "}
                                        تومان
                                    </strong>
                                </div>

                                {errors.time_slot_id && (
                                    <div className="form-error">
                                        <AlertCircle size={14} />
                                        {errors.time_slot_id}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="confirm-btn"
                                    onClick={handleSubmit}
                                    disabled={!selectedSlot || processing}
                                >
                                    {processing ? (
                                        <span className="spinner" />
                                    ) : (
                                        <CheckCircle2 size={18} />
                                    )}
                                    {auth?.user
                                        ? "تایید و پرداخت"
                                        : "ورود و ادامه"}
                                </button>

                                {!auth?.user && (
                                    <div className="login-hint">
                                        <User size={14} />
                                        برای ثبت رزرو باید وارد حساب کاربری خود
                                        شوید
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
