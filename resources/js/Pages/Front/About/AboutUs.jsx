import React from "react";
import { Head } from "@inertiajs/react";
import PublicLayout from "../../Layouts/PublicLayout";
import {
    Target,
    Heart,
    Users,
    Award,
    Sparkles,
    CheckCircle2,
} from "lucide-react";

export default function About() {
    return (
        <PublicLayout>
            <Head title="درباره ما" />

            <div className="page-hero">
                <div className="page-hero-content">
                    <h1>درباره ما</h1>
                    <p>داستان ما، مأموریت ما، و تیم پشت صحنه</p>
                </div>
            </div>

            <div className="page-container">
                {/* داستان ما */}
                <section className="about-section">
                    <div className="about-grid">
                        <div className="about-content">
                            <h2>داستان ما</h2>
                            <p>
                                ما در سال ۱۴۰۰ با یک ایده ساده شروع کردیم: «چرا
                                رزرو نوبت آرایشگاه باید انقدر سخت باشد؟»
                            </p>
                            <p>
                                امروز، با افتخار به بیش از ۱۰,۰۰۰ کاربر خدمت
                                می‌کنیم و به آن‌ها کمک می‌کنیم تا در چند ثانیه
                                نوبت خود را رزرو کنند.
                            </p>
                        </div>
                        <div className="about-image">
                            <img src="/images/about.jpg" alt="تیم ما" />
                        </div>
                    </div>
                </section>

                {/* ارزش‌ها */}
                <section className="values-section">
                    <h2>ارزش‌های ما</h2>
                    <div className="values-grid">
                        {[
                            {
                                icon: Heart,
                                title: "مشتری‌مداری",
                                desc: "رضایت شما اولویت ما است",
                            },
                            {
                                icon: Shield,
                                title: "اعتماد و امنیت",
                                desc: "اطلاعات شما نزد ما امن است",
                            },
                            {
                                icon: Award,
                                title: "کیفیت بالا",
                                desc: "همه آرایشگران تأیید شده",
                            },
                            {
                                icon: Users,
                                title: "همکاری و رشد",
                                desc: "رشد آرایشگران و رضایت مشتریان",
                            },
                        ].map((value, idx) => {
                            const Icon = value.icon;
                            return (
                                <div key={idx} className="value-card">
                                    <div className="value-icon">
                                        <Icon size={28} />
                                    </div>
                                    <h3>{value.title}</h3>
                                    <p>{value.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* آمار */}
                <section className="stats-section">
                    <div className="stats-grid">
                        {[
                            { value: "۱۰,۰۰۰+", label: "کاربر راضی" },
                            { value: "۵۰۰+", label: "آرایشگر فعال" },
                            { value: "۵۰,۰۰۰+", label: "رزرو موفق" },
                            { value: "۴.۸", label: "میانگین امتیاز" },
                        ].map((stat, idx) => (
                            <div key={idx} className="stat-item">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
