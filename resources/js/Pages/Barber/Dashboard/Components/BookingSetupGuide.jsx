import React, { useState } from "react";
import { Link } from "@inertiajs/react";

import {
    Calendar,
    Clock,
    Scissors,
    CheckCircle,
    ArrowRight,
    AlertCircle,
    Info,
    ChevronUp,
} from "lucide-react";

import { toPersianNumber } from "../../../../utils/persianNumbers";
import "../Assets/css/BookingSetup.css";

export default function BookingSetupGuide({ bookingSetup = {} }) {
    const {
        workingDays = false,
        services = false,
        generatedSlots = false,
        firstServiceId = null,
    } = bookingSetup;

    const steps = [
        {
            id: 1,
            title: "تنظیم برنامه کاری",
            description:
                "روزهای فعالیت و ساعات حضور خود در آرایشگاه را مشخص کنید.",
            done: workingDays,
            icon: Clock,
            href: "/barber/availabilities",
            buttonText: workingDays ? "ویرایش برنامه کاری" : "تنظیم ساعات کاری",
        },
        {
            id: 2,
            title: "انتخاب خدمات",
            description:
                "خدماتی که ارائه می‌دهید را انتخاب کرده و قیمت و مدت‌زمان آن‌ها را مشخص کنید.",
            done: services,
            icon: Scissors,
            href: "/barber/services",
            buttonText: services ? "مدیریت خدمات" : "انتخاب خدمات",
        },
        {
            id: 3,
            title: "ایجاد نوبت‌های قابل رزرو",
            description:
                "تاریخ موردنظر را انتخاب کنید تا ساعت‌های قابل رزرو برای مشتریان ایجاد شوند.",
            done: generatedSlots,
            icon: Calendar,
            href:
                services && firstServiceId
                    ? `/barber/time-slots?service_id=${firstServiceId}`
                    : "/barber/services",
            buttonText: generatedSlots ? "مدیریت نوبت‌ها" : "ایجاد نوبت‌ها",
            disabled: !workingDays || !services,
        },
    ];

    const completedCount = steps.filter((step) => step.done).length;
    const progress = Math.round((completedCount / steps.length) * 100);

    const allCompleted = completedCount === steps.length;
    const [isExpanded, setIsExpanded] = useState(false);
    if (allCompleted && !isExpanded) {
        return (
            <section className="barber-setup-compact">
                <button
                    type="button"
                    className="barber-setup-compact-button"
                    onClick={() => setIsExpanded(true)}
                >
                    <span className="barber-setup-compact-info">
                        <CheckCircle size={19} />

                        <span>راه‌اندازی نوبت‌دهی</span>

                        <span className="barber-setup-compact-badge">
                            تکمیل شده
                        </span>
                    </span>

                    <span className="barber-setup-compact-action">
                        مشاهده مراحل
                        <ArrowRight size={15} />
                    </span>
                </button>
            </section>
        );
    }
    return (
        <section id="booking-setup" className="barber-setup-guide">
            {/* Header */}
            <div className="barber-setup-header">
                <div className="barber-setup-heading">
                    <div className="barber-setup-main-icon">
                        <Calendar size={22} />
                    </div>

                    <div>
                        <h2>راه‌اندازی نوبت‌دهی</h2>
                        <p>
                            برای فعال شدن فرآیند رزرو آنلاین، مراحل زیر را تکمیل
                            کنید.
                        </p>
                    </div>
                </div>

                <div className="barber-setup-header-actions">
                    <div className="barber-setup-progress-info">
                        <strong>
                            {toPersianNumber(completedCount)} از ۳ مرحله
                        </strong>

                        <span>
                            {allCompleted
                                ? "راه‌اندازی کامل شد"
                                : "در حال راه‌اندازی"}
                        </span>
                    </div>

                    {allCompleted && (
                        <button
                            type="button"
                            onClick={() => setIsExpanded(false)}
                            className="barber-setup-collapse"
                            aria-label="جمع کردن مراحل راه‌اندازی"
                            title="جمع کردن"
                        >
                            <ChevronUp size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Progress */}
            <div className="barber-setup-progress">
                <div
                    className="barber-setup-progress-bar"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Success */}
            {allCompleted && (
                <div className="barber-setup-success">
                    <CheckCircle size={18} />

                    <span>
                        تبریک! مراحل اولیه راه‌اندازی نوبت‌دهی شما تکمیل شده
                        است.
                    </span>
                </div>
            )}

            {/* Steps */}
            <div className="barber-setup-steps">
                {steps.map((step) => {
                    const StepIcon = step.icon;

                    return (
                        <div
                            key={step.id}
                            className={`barber-setup-step ${
                                step.done ? "completed" : ""
                            } ${step.disabled ? "disabled" : ""}`}
                        >
                            <div className="barber-setup-step-top">
                                <div className="barber-setup-step-icon">
                                    <StepIcon size={21} />
                                </div>

                                <span className="barber-setup-step-number">
                                    {step.done ? (
                                        <CheckCircle size={17} />
                                    ) : (
                                        toPersianNumber(step.id)
                                    )}
                                </span>
                            </div>

                            <div className="barber-setup-step-content">
                                <div className="barber-setup-step-title">
                                    <h3>{step.title}</h3>

                                    {step.done && (
                                        <span className="barber-setup-done">
                                            تکمیل شده
                                        </span>
                                    )}
                                </div>

                                <p>{step.description}</p>
                            </div>

                            {step.disabled ? (
                                <span
                                    className="barber-setup-action is-disabled"
                                    aria-disabled="true"
                                >
                                    {step.buttonText}
                                    <ArrowRight size={15} />
                                </span>
                            ) : (
                                <Link
                                    href={step.href}
                                    className={`barber-setup-action ${
                                        step.done ? "is-completed" : ""
                                    }`}
                                >
                                    {step.buttonText}
                                    <ArrowRight size={15} />
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Hints */}
            {!workingDays && (
                <div className="barber-setup-hint">
                    <AlertCircle size={16} />

                    <span>
                        ابتدا برنامه کاری خود را مشخص کنید تا بتوانید نوبت‌های
                        قابل رزرو ایجاد کنید.
                    </span>
                </div>
            )}

            {workingDays && !services && (
                <div className="barber-setup-hint">
                    <AlertCircle size={16} />

                    <span>
                        برنامه کاری شما ثبت شده است. حالا خدمات موردنظر خود را
                        انتخاب کنید.
                    </span>
                </div>
            )}

            {workingDays && services && !generatedSlots && (
                <div className="barber-setup-hint">
                    <Info size={16} />

                    <span>
                        همه پیش‌نیازها آماده است. برای نمایش ساعت‌های رزرو به
                        مشتریان، نوبت‌های خود را ایجاد کنید.
                    </span>
                </div>
            )}
        </section>
    );
}
