import React, { useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import PublicLayout from "../Layouts/PublicLayout";
import "../Assets/Payment.css";

import {
    CheckCircle,
    Calendar,
    Clock,
    User,
    Scissors,
    DollarSign,
    Home,
    Download,
    Hash,
} from "lucide-react";
import {
    toPersianNumber,
    toPersianTimeRange,
} from "../../../utils/persianNumbers";
import { toJalaali } from "jalaali-js";
import confetti from "canvas-confetti";

export default function PaymentSuccess({ auth, booking }) {
    const formatJalaliDate = (date) => {
        if (!date) return "-";
        const d = new Date(date);
        const { jy, jm, jd } = toJalaali(
            d.getFullYear(),
            d.getMonth() + 1,
            d.getDate(),
        );
        return `${toPersianNumber(jy)}/${toPersianNumber(
            String(jm).padStart(2, "0"),
        )}/${toPersianNumber(String(jd).padStart(2, "0"))}`;
    };

    // ============ انیمیشن جشن ============
    useEffect(() => {
        const duration = 2000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ["#10b981", "#059669", "#34d399"],
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ["#10b981", "#059669", "#34d399"],
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();
    }, []);

    return (
        <PublicLayout>
            <Head title="پرداخت موفق" />

            <div className="payment-result-container">
                <div className="payment-result-card success">
                    {/* آیکون موفقیت */}
                    <div className="result-icon-wrapper success">
                        <div className="result-icon-pulse"></div>
                        <CheckCircle size={48} />
                    </div>

                    <h1 className="result-title success">
                        پرداخت با موفقیت انجام شد
                    </h1>

                    <p className="result-subtitle">
                        نوبت شما با موفقیت ثبت شد. اطلاعات رزرو برای شما ارسال
                        می‌شود.
                    </p>

                    {/* اطلاعات تراکنش */}
                    <div className="transaction-info">
                        <div className="info-row">
                            <div className="info-label">
                                <Hash size={14} />
                                <span>شماره پیگیری</span>
                            </div>
                            <div className="info-value">
                                {booking.transaction_id}
                            </div>
                        </div>

                        <div className="info-row">
                            <div className="info-label">
                                <DollarSign size={14} />
                                <span>مبلغ پرداخت شده</span>
                            </div>
                            <div className="info-value primary">
                                {parseFloat(booking.amount).toLocaleString(
                                    "fa-IR",
                                )}{" "}
                                تومان
                            </div>
                        </div>

                        <div className="info-row">
                            <div className="info-label">
                                <User size={14} />
                                <span>آرایشگر</span>
                            </div>
                            <div className="info-value">
                                {booking.barber.name}
                            </div>
                        </div>

                        <div className="info-row">
                            <div className="info-label">
                                <Scissors size={14} />
                                <span>خدمت</span>
                            </div>
                            <div className="info-value">
                                {booking.service.name}
                            </div>
                        </div>

                        <div className="info-row">
                            <div className="info-label">
                                <Calendar size={14} />
                                <span>تاریخ</span>
                            </div>
                            <div className="info-value">
                                {formatJalaliDate(booking.date)}
                            </div>
                        </div>

                        <div className="info-row">
                            <div className="info-label">
                                <Clock size={14} />
                                <span>ساعت</span>
                            </div>
                            <div className="info-value">
                                {toPersianTimeRange(
                                    booking.start_time,
                                    booking.end_time,
                                )}
                            </div>
                        </div>
                    </div>

                    {/* اطلاعات تماس */}
                    <div className="contact-info-box">
                        <p>
                            در صورت نیاز به لغو یا تغییر، با شماره{" "}
                            <strong dir="ltr">{booking.barber.phone}</strong>{" "}
                            تماس بگیرید.
                        </p>
                    </div>

                    {/* دکمه‌ها */}
                    <div className="result-actions">
                        <Link
                            href="/customer/bookings"
                            className="result-btn primary"
                        >
                            <Calendar size={18} />
                            مشاهده نوبت‌های من
                        </Link>
                        <Link href="/" className="result-btn outline">
                            <Home size={18} />
                            بازگشت به خانه
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
