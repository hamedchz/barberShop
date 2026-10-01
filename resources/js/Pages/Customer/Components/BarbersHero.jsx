import React from "react";
import { Link } from "@inertiajs/react";
import {
    Scissors,
    Star,
    Users,
    Award,
    Shield,
    Sparkles,
    ChevronLeft,
    Clock,
    MapPin,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function BarbersHero({ stats }) {
    return (
        <section className="barbers-hero">
            {/* دایره‌های تزئینی */}
            <div className="hero-shape shape-1"></div>
            <div className="hero-shape shape-2"></div>
            <div className="hero-shape shape-3"></div>

            <div className="hero-container">
                <div className="hero-content">
                    <span className="hero-badge">
                        <Sparkles size={14} />
                        بهترین آرایشگران شهر
                    </span>

                    <h1 className="hero-title">
                        آرایشگر مورد نظرت رو
                        <br />
                        <span className="highlight">پیدا کن و نوبت بگیر</span>
                    </h1>

                    <p className="hero-description">
                        بیش از {toPersianNumber(stats.total)} آرایشگر حرفه‌ای در
                        سراسر ایران. بهترین‌ها را انتخاب کن، ساعت خالی‌شون رو
                        ببین و در چند ثانیه نوبت بگیر.
                    </p>

                    {/* آمار */}
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="stat-icon green">
                                <Scissors size={20} />
                            </div>
                            <div>
                                <strong>{toPersianNumber(stats.total)}</strong>
                                <span>آرایشگر فعال</span>
                            </div>
                        </div>

                        <div className="hero-stat">
                            <div className="stat-icon blue">
                                <Users size={20} />
                            </div>
                            <div>
                                <strong>{toPersianNumber(stats.online)}</strong>
                                <span>الان آنلاین</span>
                            </div>
                        </div>

                        <div className="hero-stat">
                            <div className="stat-icon purple">
                                <Star
                                    size={20}
                                    fill="#8b5cf6"
                                    color="#8b5cf6"
                                />
                            </div>
                            <div>
                                <strong>۴.۸</strong>
                                <span>میانگین امتیاز</span>
                            </div>
                        </div>
                    </div>

                    {/* ویژگی‌ها */}
                    <div className="hero-features">
                        <div className="hero-feature">
                            <Shield size={16} />
                            <span>پرداخت امن</span>
                        </div>
                        <div className="hero-feature">
                            <Clock size={16} />
                            <span>رزرو ۲۴ ساعته</span>
                        </div>
                        <div className="hero-feature">
                            <Award size={16} />
                            <span>آرایشگران تایید شده</span>
                        </div>
                        <div className="hero-feature">
                            <MapPin size={16} />
                            <span>در سراسر ایران</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
