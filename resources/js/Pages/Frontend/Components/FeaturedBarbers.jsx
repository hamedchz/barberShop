import React from "react";
import {
    Star,
    MapPin,
    Scissors,
    ArrowLeft,
    BadgeCheck,
    MessageSquare,
    BriefcaseBusiness,
} from "lucide-react";
import "../Assets/css/FeaturedBarber.css";
import { toPersianNumber } from "../../../utils/persianNumbers";
export default function FeaturedBarbers({ barbers = [], showHeader = true }) {
    if (!barbers.length) return null;

    return (
        <section className="front-section front-barbers-section" id="barbers">
            <div className="front-container">
                {showHeader && (
                    <div className="front-section-header">
                        <div>
                            <span className="front-section-eyebrow">
                                انتخاب حرفه‌ای‌ها
                            </span>

                            <h2 className="front-section-title">
                                آرایشگران منتخب
                            </h2>

                            <p className="front-section-description">
                                با بهترین آرایشگران آشنا شو و استایل موردنظرت را
                                انتخاب کن.
                            </p>
                        </div>
                    </div>
                )}
                <div className="front-barbers-grid">
                    {barbers.map((barber) => (
                        <article key={barber.id} className="front-barber-card">
                            {/* تصویر آرایشگر */}
                            <a
                                href={`/barbers/${barber.slug}`}
                                className="front-barber-image"
                                aria-label={`مشاهده پروفایل ${barber.name}`}
                            >
                                {barber.avatar ? (
                                    <img
                                        src={barber.avatar}
                                        alt={barber.name}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="front-barber-avatar-placeholder">
                                        {barber.name?.charAt(0) || "آ"}
                                    </div>
                                )}

                                <div className="front-barber-image-overlay" />

                                {/* امتیاز */}
                                <span className="front-barber-rating">
                                    <Star size={14} fill="currentColor" />
                                    {toPersianNumber(
                                        Number(barber.rating || 0).toFixed(1),
                                    )}
                                </span>
                            </a>

                            {/* اطلاعات آرایشگر */}
                            <div className="front-barber-info">
                                <div className="front-barber-heading">
                                    <h3>{barber.name}</h3>
                                    <BadgeCheck
                                        className="front-barber-verified"
                                        size={23}
                                        fill="currentColor"
                                    />
                                </div>

                                <p className="front-barber-specialty">
                                    <Scissors size={15} />
                                    {barber.specialty || "آرایشگر حرفه‌ای"}
                                </p>

                                {barber.bio && (
                                    <p className="front-barber-bio">
                                        {barber.bio}
                                    </p>
                                )}

                                {barber.city && (
                                    <div className="front-barber-location">
                                        <MapPin size={14} />
                                        {barber.city}
                                    </div>
                                )}

                                {/* اطلاعات و دکمه */}
                                <div className="front-barber-bottom">
                                    {/* آمار آرایشگر */}
                                    <div className="front-barber-stats">
                                        <span className="front-barber-stat-badge">
                                            <MessageSquare size={14} />
                                            <span className="front-barber-stat-label">
                                                نظرات:
                                            </span>
                                            <strong>
                                                {toPersianNumber(
                                                    barber.reviews_count || 0,
                                                )}
                                            </strong>
                                        </span>

                                        {/* <span className="front-barber-stat-badge">
                                            <Scissors size={14} />
                                            <span className="front-barber-stat-label">
                                                خدمات:
                                            </span>
                                            <strong>
                                                {toPersianNumber(
                                                    barber.services_count || 0,
                                                )}
                                            </strong>
                                        </span> */}

                                        {barber.experience_years > 0 && (
                                            <span className="front-barber-stat-badge">
                                                <BriefcaseBusiness size={14} />
                                                <span className="front-barber-stat-label">
                                                    تجربه:
                                                </span>
                                                <strong>
                                                    {toPersianNumber(
                                                        barber.experience_years,
                                                    )}{" "}
                                                    سال
                                                </strong>
                                            </span>
                                        )}
                                    </div>

                                    {/* دکمه مشاهده پروفایل */}
                                    <a
                                        href={`/barbers/${barber.slug}`}
                                        className="front-barber-link"
                                    >
                                        مشاهده پروفایل
                                        <ArrowLeft size={16} />
                                    </a>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
