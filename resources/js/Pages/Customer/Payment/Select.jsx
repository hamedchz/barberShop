import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PublicLayout from "../Layouts/PublicLayout";
import "../Assets/Payment.css";
import {
    CreditCard,
    CheckCircle,
    Shield,
    Scissors,
    Calendar,
    Clock,
    User,
    DollarSign,
    ArrowRight,
    AlertCircle,
    Lock,
} from "lucide-react";
import {
    toPersianNumber,
    toPersianTimeRange,
} from "../../../utils/persianNumbers";
import { toJalaali } from "jalaali-js";

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

export default function PaymentSelect({ auth, booking, gateways }) {
    const [selectedGateway, setSelectedGateway] = useState(
        gateways[0]?.id || null,
    );
    const [isProcessing, setIsProcessing] = useState(false);

    // ============ پرداخت ============
    const handlePay = () => {
        if (!selectedGateway || isProcessing) return;

        setIsProcessing(true);

        const form = document.createElement("form");

        form.method = "POST";
        form.action = "/customer/payment/pay";

        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

        const inputs = {
            _token: csrfToken,
            booking_id: booking.id,
            gateway: selectedGateway,
        };

        Object.entries(inputs).forEach(([name, value]) => {
            const input = document.createElement("input");

            input.type = "hidden";
            input.name = name;
            input.value = value ?? "";

            form.appendChild(input);
        });

        document.body.appendChild(form);

        form.submit();
    };

    return (
        <PublicLayout>
            <Head title="انتخاب روش پرداخت" />

            <div className="payment-page-container">
                {/* هدر */}
                <div className="payment-page-header">
                    <Link
                        href={`/barbers/${booking.barber.id}`}
                        className="back-btn"
                    >
                        <ArrowRight size={20} />
                        <span>بازگشت</span>
                    </Link>
                    <h1 className="payment-page-title">تکمیل رزرو و پرداخت</h1>
                </div>

                {/* خلاصه رزرو */}
                <div className="payment-summary-card">
                    <div className="payment-summary-header">
                        <div className="summary-icon-box">
                            <Scissors size={24} />
                        </div>
                        <h2>خلاصه رزرو</h2>
                    </div>

                    <div className="payment-summary-body">
                        <div className="summary-row">
                            <div className="summary-label">
                                <User size={16} />
                                <span>آرایشگر</span>
                            </div>
                            <div className="summary-value">
                                {booking.barber.name}
                            </div>
                        </div>

                        <div className="summary-row">
                            <div className="summary-label">
                                <Scissors size={16} />
                                <span>سرویس</span>
                            </div>
                            <div className="summary-value">
                                {booking.service.name}
                            </div>
                        </div>

                        <div className="summary-row">
                            <div className="summary-label">
                                <Calendar size={16} />
                                <span>تاریخ</span>
                            </div>
                            <div className="summary-value">
                                {formatJalaliDate(booking.date)}
                            </div>
                        </div>

                        <div className="summary-row">
                            <div className="summary-label">
                                <Clock size={16} />
                                <span>ساعت</span>
                            </div>
                            <div className="summary-value">
                                {toPersianTimeRange(
                                    booking.start_time,
                                    booking.end_time,
                                )}
                            </div>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row total">
                            <div className="summary-label">
                                <DollarSign size={18} />
                                <span>مبلغ قابل پرداخت</span>
                            </div>
                            <div className="summary-total">
                                {parseFloat(booking.amount).toLocaleString(
                                    "fa-IR",
                                )}{" "}
                                <span className="currency">تومان</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* انتخاب درگاه */}
                <div className="payment-gateways-card">
                    <div className="gateways-header">
                        <CreditCard size={22} />
                        <div>
                            <h2>روش پرداخت را انتخاب کنید</h2>
                            <p>پرداخت امن از طریق درگاه‌های بانکی معتبر</p>
                        </div>
                    </div>

                    <div className="gateways-list">
                        {gateways.map((gateway) => {
                            const isSelected = selectedGateway === gateway.id;

                            return (
                                <button
                                    key={gateway.id}
                                    type="button"
                                    className={`gateway-item ${
                                        isSelected ? "selected" : ""
                                    }`}
                                    onClick={() =>
                                        setSelectedGateway(gateway.id)
                                    }
                                >
                                    <div className="gateway-radio">
                                        <div className="radio-circle">
                                            {isSelected && (
                                                <div className="radio-inner"></div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="gateway-logo">
                                        <img
                                            src={gateway.logo}
                                            alt={gateway.name}
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                            }}
                                        />
                                    </div>

                                    <div className="gateway-info">
                                        <span className="gateway-name">
                                            {gateway.name}
                                        </span>
                                        <span className="gateway-desc">
                                            پرداخت امن و سریع
                                        </span>
                                    </div>

                                    {isSelected && (
                                        <div className="gateway-check">
                                            <CheckCircle size={20} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* هشدار امنیتی */}
                    <div className="payment-security">
                        <Shield size={16} />
                        <p>اطلاعات پرداخت شما با رمزنگاری SSL محافظت می‌شود.</p>
                    </div>

                    {/* دکمه پرداخت */}
                    <button
                        className="payment-submit-btn"
                        onClick={handlePay}
                        disabled={!selectedGateway || isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <span className="spinner"></span>
                                در حال انتقال به درگاه...
                            </>
                        ) : (
                            <>
                                <Lock size={18} />
                                پرداخت{" "}
                                {parseFloat(booking.amount).toLocaleString(
                                    "fa-IR",
                                )}{" "}
                                تومان
                            </>
                        )}
                    </button>

                    <p className="payment-terms">
                        با کلیک روی دکمه پرداخت،{" "}
                        <a href="/terms" target="_blank">
                            قوانین و مقررات
                        </a>{" "}
                        را می‌پذیرید.
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}
