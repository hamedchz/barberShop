import React from "react";
import { Head, Link } from "@inertiajs/react";
import PublicLayout from "../Layouts/PublicLayout";
import {
    Scissors,
    Calendar,
    Shield,
    Zap,
    Star,
    Users,
    ArrowLeft,
    CheckCircle2,
    Sparkles,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function Home({
    topBarbers = [],
    topServices = [],
    stats = {},
}) {
    return (
        <PublicLayout>
            <Head title="رزرو نوبت آرایشگاه - سریع و راحت" />

            {/* ============ Hero Section ============ */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <Sparkles size={14} />
                            <span>سریع‌ترین راه رزرو نوبت</span>
                        </div>
                        <h1 className="hero-title">
                            رزرو نوبت آرایشگاه
                            <br />
                            <span className="hero-title-highlight">
                                در چند ثانیه
                            </span>
                        </h1>
                        <p className="hero-description">
                            بدون تماس تلفنی، بدون معطلی، در هر ساعتی از
                            شبانه‌روز نوبت خود را رزرو کنید.
                        </p>

                        <div className="hero-actions">
                            <Link
                                // href={route("user.barbers.index")}
                                className="hero-btn primary"
                            >
                                <Scissors size={18} />
                                رزرو نوبت
                                <ArrowLeft size={16} />
                            </Link>
                            <Link
                                // href={route("public.about")}
                                className="hero-btn outline"
                            >
                                بیشتر بدانید
                            </Link>
                        </div>

                        {/* آمار */}
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <span className="hero-stat-value">
                                    {toPersianNumber(
                                        stats.barbers_count || 500,
                                    )}
                                    +
                                </span>
                                <span className="hero-stat-label">
                                    آرایشگر فعال
                                </span>
                            </div>
                            <div className="hero-stat">
                                <span className="hero-stat-value">
                                    {toPersianNumber(
                                        stats.users_count || 10000,
                                    )}
                                    +
                                </span>
                                <span className="hero-stat-label">
                                    کاربر راضی
                                </span>
                            </div>
                            <div className="hero-stat">
                                <span className="hero-stat-value">
                                    ⭐{" "}
                                    {toPersianNumber(stats.avg_rating || 4.8)}
                                </span>
                                <span className="hero-stat-label">
                                    میانگین امتیاز
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ Features ============ */}
            <section className="features-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">چرا ما؟</h2>
                        <p className="section-subtitle">
                            ویژگی‌هایی که ما را از دیگران متمایز می‌کند
                        </p>
                    </div>

                    <div className="features-grid">
                        {[
                            {
                                icon: Zap,
                                color: "yellow",
                                title: "سریع و راحت",
                                desc: "در کمتر از ۳۰ ثانیه نوبت خود را رزرو کنید",
                            },
                            {
                                icon: Shield,
                                color: "green",
                                title: "امن و مطمئن",
                                desc: "پرداخت امن و ضمانت بازگشت وجه",
                            },
                            {
                                icon: Users,
                                color: "blue",
                                title: "آرایشگران حرفه‌ای",
                                desc: "همه آرایشگران تأیید شده و دارای تجربه هستند",
                            },
                            {
                                icon: Star,
                                color: "orange",
                                title: "کیفیت تضمینی",
                                desc: "نظرات واقعی کاربران و امتیازدهی شفاف",
                            },
                        ].map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={idx}
                                    className={`feature-card ${feature.color}`}
                                >
                                    <div className="feature-icon">
                                        <Icon size={28} />
                                    </div>
                                    <h3>{feature.title}</h3>
                                    <p>{feature.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ============ Top Barbers ============ */}
            {topBarbers.length > 0 && (
                <section className="barbers-section">
                    <div className="section-container">
                        <div className="section-header">
                            <h2 className="section-title">آرایشگران برتر</h2>
                            <Link
                                // href={route("public.barbers.index")}
                                className="section-link"
                            >
                                مشاهده همه
                                <ArrowLeft size={16} />
                            </Link>
                        </div>

                        <div className="barbers-grid">
                            {topBarbers.map((barber) => (
                                <BarberCard key={barber.id} barber={barber} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ============ Top Services ============ */}
            {topServices.length > 0 && (
                <section className="services-section">
                    <div className="section-container">
                        <div className="section-header">
                            <h2 className="section-title">خدمات پرطرفدار</h2>
                        </div>

                        <div className="services-grid">
                            {topServices.map((service) => (
                                <Link
                                    key={service.id}
                                    // href={route("public.barbers.index", {
                                    //     service: service.id,
                                    // })}
                                    className="service-card"
                                >
                                    <div className="service-icon">
                                        <Scissors size={28} />
                                    </div>
                                    <h3>{service.name}</h3>
                                    <p className="service-price">
                                        از{" "}
                                        {toPersianNumber(
                                            service.min_price.toLocaleString(),
                                        )}{" "}
                                        تومان
                                    </p>
                                    <span className="service-count">
                                        {toPersianNumber(service.barbers_count)}{" "}
                                        آرایشگر
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ============ CTA Section ============ */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>آماده‌اید نوبت بگیرید؟</h2>
                    <p>
                        همین الان اولین رزرو خود را ثبت کنید و از تخفیف ویژه
                        بهره‌مند شوید.
                    </p>
                    <Link
                        // href={route("public.barbers.index")}
                        className="cta-btn"
                    >
                        <Calendar size={20} />
                        رزرو نوبت
                        <ArrowLeft size={16} />
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
