import React from "react";
import { Head, Link } from "@inertiajs/react";
import {
    CalendarDays,
    Scissors,
    Clock3,
    CheckCircle2,
    Circle,
    ArrowLeft,
    LockKeyhole,
    Sparkles,
    PartyPopper,
    ClipboardCheck,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import "./Assets/css/BookingSetupPage.css";

export default function Index({ bookingSetup = {} }) {
    const steps = [
        {
            id: 1,
            title: "تنظیم برنامه هفتگی",
            description:
                "روزها و ساعت‌هایی را که در آرایشگاه فعالیت می‌کنید مشخص کنید.",
            completed: Boolean(bookingSetup.workingDays),
            href: route("barber.availabilities.index", { from: "setup" }),
            icon: CalendarDays,
        },
        {
            id: 2,
            title: "انتخاب خدمات و تعیین قیمت",
            description:
                "خدمات موردنظر خود را انتخاب کنید و قیمت و مدت‌زمان انجام هر خدمت را مشخص کنید.",
            completed: Boolean(bookingSetup.services),
            href: route("barber.services.create", { from: "setup" }),
            icon: Scissors,
        },
        {
            id: 3,
            title: "ایجاد نوبت‌های قابل رزرو",
            description:
                "برای تاریخ‌های موردنظر، با توجه به برنامه کاری و مدت خدمات، نوبت‌های قابل رزرو ایجاد کنید.",
            completed: Boolean(bookingSetup.generatedSlots),
            href: bookingSetup.firstServiceId
                ? route("barber.time-slots.index", {
                      from: "setup",
                      service_id: bookingSetup.firstServiceId,
                  })
                : null,
            icon: Clock3,
            locked: !bookingSetup.workingDays || !bookingSetup.services,
        },
    ];

    const completedCount = steps.filter((step) => step.completed).length;

    const allCompleted = completedCount === steps.length;

    const progress = Math.round((completedCount / steps.length) * 100);

    const currentStep = steps.find((step) => !step.completed);

    return (
        <>
            <Head title="راه‌اندازی نوبت‌دهی" />

            <div className="barber-setup-page" dir="rtl">
                <div className="barber-setup-container">
                    {/* معرفی صفحه */}
                    <header className="barber-setup-page-header">
                        <div className="barber-setup-intro">
                            <div className="barber-setup-eyebrow">
                                <Sparkles size={16} />
                                <span>شروع فعالیت حرفه‌ای شما</span>
                            </div>

                            <h1 className="barber-setup-page-title">
                                راه‌اندازی نوبت‌دهی
                            </h1>

                            <p className="barber-setup-page-description">
                                برای فعال‌سازی رزرو آنلاین، کافی است سه مرحله
                                زیر را تکمیل کنید. پس از آن، امکانات پنل
                                آرایشگری در اختیار شما قرار می‌گیرد.
                            </p>
                        </div>

                        <div className="barber-setup-header-icon">
                            <ClipboardCheck size={34} />
                        </div>
                    </header>

                    {/* کارت پیشرفت */}
                    <section className="barber-setup-progress-card">
                        <div className="barber-setup-progress-top">
                            <div className="barber-setup-progress-title">
                                <span className="barber-setup-progress-icon">
                                    <CheckCircle2 size={19} />
                                </span>

                                <div>
                                    <h2>پیشرفت راه‌اندازی</h2>
                                    <p>
                                        {allCompleted
                                            ? "تمام مراحل با موفقیت تکمیل شده‌اند."
                                            : "مراحل زیر را به‌ترتیب تکمیل کنید."}
                                    </p>
                                </div>
                            </div>

                            <div className="barber-setup-progress-percent">
                                <strong>{toPersianNumber(progress)}</strong>
                                <span>٪</span>
                            </div>
                        </div>

                        <div
                            className="barber-setup-progress-track"
                            role="progressbar"
                            aria-valuenow={progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="میزان پیشرفت راه‌اندازی"
                        >
                            <div
                                className="barber-setup-progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="barber-setup-progress-footer">
                            <span>
                                {toPersianNumber(completedCount)} از{" "}
                                {toPersianNumber(steps.length)} مرحله تکمیل شده
                            </span>

                            <span>
                                {allCompleted
                                    ? "راه‌اندازی کامل شد"
                                    : `${toPersianNumber(steps.length - completedCount)} مرحله باقی مانده`}
                            </span>
                        </div>
                    </section>

                    {/* مراحل راه‌اندازی */}
                    <section className="barber-setup-steps-section">
                        <div className="barber-setup-section-heading">
                            <div>
                                <h2>مراحل فعال‌سازی نوبت‌دهی</h2>
                                <p>
                                    هر مرحله را انجام دهید تا به مرحله بعد
                                    دسترسی پیدا کنید.
                                </p>
                            </div>
                        </div>

                        <div className="barber-setup-steps">
                            {steps.map((step) => {
                                const Icon = step.icon;
                                const isCurrent = currentStep?.id === step.id;
                                const isLocked =
                                    !step.completed &&
                                    (step.locked || !step.href);

                                return (
                                    <article
                                        key={step.id}
                                        className={[
                                            "barber-setup-step-card",
                                            step.completed
                                                ? "is-completed"
                                                : "",
                                            isCurrent ? "is-current" : "",
                                            isLocked ? "is-locked" : "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                    >
                                        <div className="barber-setup-step-number">
                                            {step.completed ? (
                                                <CheckCircle2 size={21} />
                                            ) : (
                                                toPersianNumber(step.id)
                                            )}
                                        </div>

                                        <div className="barber-setup-step-icon">
                                            <Icon size={25} />
                                        </div>

                                        <div className="barber-setup-step-content">
                                            <div className="barber-setup-step-meta">
                                                <span>
                                                    مرحله{" "}
                                                    {toPersianNumber(step.id)}
                                                </span>

                                                {step.completed ? (
                                                    <span className="barber-setup-status completed">
                                                        <CheckCircle2
                                                            size={14}
                                                        />
                                                        تکمیل شده
                                                    </span>
                                                ) : isLocked ? (
                                                    <span className="barber-setup-status locked">
                                                        <LockKeyhole
                                                            size={13}
                                                        />
                                                        قفل شده
                                                    </span>
                                                ) : isCurrent ? (
                                                    <span className="barber-setup-status current">
                                                        مرحله بعدی
                                                    </span>
                                                ) : null}
                                            </div>

                                            <h3>{step.title}</h3>

                                            <p>{step.description}</p>

                                            <div className="barber-setup-step-action">
                                                {step.completed ? (
                                                    step.href ? (
                                                        <Link
                                                            href={step.href}
                                                            className="barber-setup-action-link completed-link"
                                                        >
                                                            مشاهده و ویرایش
                                                            <ArrowLeft
                                                                size={16}
                                                            />
                                                        </Link>
                                                    ) : (
                                                        <span className="barber-setup-completed-text">
                                                            <CheckCircle2
                                                                size={17}
                                                            />
                                                            انجام شده
                                                        </span>
                                                    )
                                                ) : isLocked ? (
                                                    <span className="barber-setup-locked-text">
                                                        <LockKeyhole
                                                            size={16}
                                                        />
                                                        ابتدا مراحل قبلی را
                                                        تکمیل کنید
                                                    </span>
                                                ) : (
                                                    <Link
                                                        href={step.href}
                                                        className="barber-setup-action-link"
                                                    >
                                                        شروع این مرحله
                                                        <ArrowLeft size={17} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        <div className="barber-setup-step-check">
                                            {step.completed ? (
                                                <CheckCircle2 size={23} />
                                            ) : (
                                                <Circle size={23} />
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    {/* پیام پایانی */}
                    <section
                        className={`barber-setup-footer ${
                            allCompleted ? "is-completed" : ""
                        }`}
                    >
                        <div className="barber-setup-footer-icon">
                            {allCompleted ? (
                                <PartyPopper size={25} />
                            ) : (
                                <Sparkles size={24} />
                            )}
                        </div>

                        <div className="barber-setup-footer-content">
                            <h3>
                                {allCompleted
                                    ? "تبریک! نوبت‌دهی شما آماده است"
                                    : "یک قدم تا شروع فعالیت آنلاین"}
                            </h3>

                            <p>
                                {allCompleted
                                    ? "تمام مراحل راه‌اندازی انجام شده است. اکنون می‌توانید از امکانات پنل آرایشگری استفاده کنید."
                                    : "با تکمیل مراحل بالا، مشتریان می‌توانند زمان‌های خالی شما را مشاهده و برای دریافت خدمات نوبت رزرو کنند."}
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
