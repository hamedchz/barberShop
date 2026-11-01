import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { Calendar, Clock, Scissors, ArrowLeft, User } from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../../utils/dateHelpers";

export default function NextBookingCard({ booking }) {
    const [countdown, setCountdown] = useState("");

    useEffect(() => {
        const updateCountdown = () => {
            // ✅ فیلدها از سطح بالا می‌آیند (نه از timeSlot)
            if (!booking.date || !booking.start_time) {
                setCountdown("");
                return;
            }

            const bookingDateTime = new Date(
                `${booking.date}T${booking.start_time}`,
            );
            const now = new Date();
            const diff = bookingDateTime - now;

            if (diff <= 0) {
                setCountdown("در حال انجام");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setCountdown(`${toPersianNumber(days)} روز دیگر`);
            } else if (hours > 0) {
                setCountdown(
                    `${toPersianNumber(hours)} ساعت و ${toPersianNumber(minutes)} دقیقه دیگر`,
                );
            } else {
                setCountdown(`${toPersianNumber(minutes)} دقیقه دیگر`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000);
        return () => clearInterval(interval);
    }, [booking]);

    const statusLabels = {
        pending: "در انتظار تأیید",
        confirmed: "تأیید شده",
    };

    return (
        <div className="next-booking-card">
            <div className="next-booking-header">
                <div className="next-booking-header-icon">
                    <Calendar size={22} />
                </div>
                <div className="next-booking-header-content">
                    <h3>رزرو بعدی شما</h3>
                    <p>نزدیک‌ترین نوبتی که رزرو کرده‌اید</p>
                </div>
                <span className={`next-booking-status ${booking.status}`}>
                    {statusLabels[booking.status] || booking.status}
                </span>
            </div>

            <div className="next-booking-body">
                {/* آرایشگر */}
                <div className="next-booking-barber">
                    <div className="next-booking-avatar">
                        {booking.barber?.avatar ? (
                            <img
                                src={booking.barber.avatar}
                                alt={booking.barber.name}
                            />
                        ) : (
                            <User size={24} />
                        )}
                    </div>
                    <div>
                        <span className="next-booking-label">
                            <Scissors size={12} />
                            آرایشگر
                        </span>
                        <p className="next-booking-barber-name">
                            {booking.barber?.name || "آرایشگر"}
                        </p>
                    </div>
                </div>

                {/* تاریخ و ساعت */}
                <div className="next-booking-details">
                    <div className="next-booking-detail-item">
                        <Calendar size={16} />
                        <span>{formatFullDateTime(booking.date)}</span>
                    </div>
                    <div className="next-booking-detail-item">
                        <Clock size={16} />
                        <span dir="ltr">
                            {booking.start_time} - {booking.end_time}
                        </span>
                    </div>
                </div>

                {/* خدمات */}
                <div className="next-booking-service">
                    <span className="next-booking-label">خدمت</span>
                    <p className="next-booking-service-name">
                        {booking.service?.name || "—"}
                    </p>
                    {booking.service?.price && (
                        <span className="next-booking-service-price">
                            {toPersianNumber(
                                booking.service.price.toLocaleString(),
                            )}{" "}
                            تومان
                        </span>
                    )}
                </div>

                {/* شمارش معکوس */}
                {countdown && (
                    <div className="next-booking-countdown">
                        <Clock size={16} />
                        <span>{countdown}</span>
                    </div>
                )}
            </div>

            <div className="next-booking-actions">
                <Link
                    href={route("customer.bookings.show", booking.id)}
                    className="next-booking-btn primary"
                >
                    <ArrowLeft size={16} />
                    مشاهده جزئیات
                </Link>
            </div>
        </div>
    );
}
