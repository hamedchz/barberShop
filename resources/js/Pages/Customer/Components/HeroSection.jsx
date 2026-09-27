import React from "react";
import { Link } from "@inertiajs/react";
import { Scissors, Clock, Shield, Star, ChevronLeft } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="hero-section">
            {/* دایره‌های تزئینی */}
            <div className="hero-shape shape-1"></div>
            <div className="hero-shape shape-2"></div>
            <div className="hero-shape shape-3"></div>

            <div className="hero-container">
                <div className="hero-content">
                    <span className="hero-badge">
                        <Star size={14} fill="#fbbf24" color="#fbbf24" />
                        بیش از ۱۰۰۰ رزرو موفق
                    </span>

                    <h1 className="hero-title">
                        نوبت آرایشگاه خود را
                        <br />
                        <span className="highlight">آنلاین رزرو کنید</span>
                    </h1>

                    <p className="hero-description">
                        با آرایشیار، در چند ثانیه بهترین آرایشگر شهر خود را پیدا
                        کنید، ساعت خالی او را ببینید و بدون تماس تلفنی نوبت
                        بگیرید.
                    </p>

                    <div className="hero-actions">
                        <Link href="/barbers" className="hero-btn primary">
                            <Scissors size={18} />
                            مشاهده آرایشگران
                            <ChevronLeft size={18} />
                        </Link>
                        <Link href="/join" className="hero-btn outline">
                            ثبت‌نام به عنوان آرایشگر
                        </Link>
                    </div>

                    {/* آمار */}
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="stat-icon green">
                                <Scissors size={20} />
                            </div>
                            <div>
                                <strong>۵۰+</strong>
                                <span>آرایشگر فعال</span>
                            </div>
                        </div>
                        <div className="hero-stat">
                            <div className="stat-icon blue">
                                <Clock size={20} />
                            </div>
                            <div>
                                <strong>۲۴/۷</strong>
                                <span>رزرو آنلاین</span>
                            </div>
                        </div>
                        <div className="hero-stat">
                            <div className="stat-icon purple">
                                <Shield size={20} />
                            </div>
                            <div>
                                <strong>۱۰۰٪</strong>
                                <span>امن و مطمئن</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
