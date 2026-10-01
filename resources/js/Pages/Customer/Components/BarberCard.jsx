import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
    Wifi,
    WifiOff,
    ChevronLeft,
    ChevronUp,
    ChevronDown,
    Scissors,
    Award,
    MapPin,
} from "lucide-react";
import RatingStars from "./RatingStars";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function BarberCard({ barber, viewMode = "grid" }) {
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const bio = barber.bio || "آرایشگر حرفه‌ای با تجربه در ارائه خدمات آرایشی";
    const isBioLong = bio.length > 100;

    // ============ انتخاب تصویر بر اساس حالت ============
    // در حالت لیستی: عکس اصلی (کیفیت بالا)
    // در حالت شبکه‌ای: thumbnail (بهینه)
    const imageSrc = viewMode === "list" ? barber.avatar : barber.thumbnail;
    console.log(barber);
    console.log(viewMode);

    return (
        <div
            className={`barber-card-public ${
                barber.is_online ? "online" : ""
            } ${viewMode === "list" ? "card-list-mode" : "card-grid-mode"}`}
        >
            {barber.is_online && <div className="barber-card-stripe"></div>}

            <div className="barber-card-public-header">
                <div className="barber-card-public-avatar-wrapper">
                    <div className="barber-card-public-avatar">
                        {imageSrc ? (
                            <img
                                src={imageSrc}
                                alt={barber.name}
                                loading="lazy"
                                onLoad={() => setImageLoaded(true)}
                                className={imageLoaded ? "loaded" : ""}
                            />
                        ) : (
                            <span>{barber.name?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>

                    <span
                        className={`barber-card-public-status ${
                            barber.is_online ? "online" : "offline"
                        }`}
                        title={barber.is_online ? "آنلاین" : "آفلاین"}
                    >
                        {barber.is_online ? (
                            <Wifi size={10} />
                        ) : (
                            <WifiOff size={10} />
                        )}
                    </span>
                </div>

                {barber.total_reviews > 0 ? (
                    <RatingStars
                        rating={barber.rating}
                        total={barber.total_reviews}
                        size={14}
                    />
                ) : (
                    <span className="no-rating-badge">آرایشگر جدید</span>
                )}
            </div>

            <div className="barber-card-public-body">
                <h3 className="barber-card-public-name">{barber.name}</h3>

                {/* تخصص */}
                {barber.specialty && (
                    <div className="barber-card-specialty">
                        <Award size={12} />
                        <span>{barber.specialty}</span>
                    </div>
                )}

                {/* ============ بیوگرافی با قابلیت باز/بسته ============ */}
                <div className="barber-card-bio-wrapper">
                    <p
                        className={`barber-card-public-bio ${
                            isBioExpanded ? "expanded" : ""
                        }`}
                    >
                        {bio}
                    </p>

                    {/* {isBioLong && (
                        <button
                            type="button"
                            className="bio-toggle-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsBioExpanded(!isBioExpanded);
                            }}
                        >
                            {isBioExpanded ? (
                                <>
                                    <ChevronUp size={12} />
                                    کمتر
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={12} />
                                    بیشتر
                                </>
                            )}
                        </button>
                    )} */}
                </div>

                {/* اطلاعات */}
                <div className="barber-card-info-row">
                    {barber.experience_years > 0 && (
                        <span className="info-item">
                            <Award size={12} />
                            {toPersianNumber(barber.experience_years)} سال سابقه
                        </span>
                    )}
                    {barber.city && (
                        <span className="info-item">
                            <MapPin size={12} />
                            {barber.city}
                        </span>
                    )}
                </div>
            </div>

            {/* خدمات */}
            {barber.services?.length > 0 && (
                <div className="barber-card-public-services">
                    <span className="services-label">
                        <Scissors size={12} />
                        خدمات
                    </span>
                    <div className="services-tags">
                        {barber.services.slice(0, 2).map((s) => (
                            <span key={s.id} className="service-tag">
                                {s.name}
                            </span>
                        ))}
                        {barber.services_count > 2 && (
                            <span className="service-tag more">
                                +{toPersianNumber(barber.services_count - 2)}
                            </span>
                        )}
                    </div>
                </div>
            )}

            <Link
                href={`/barbers/${barber.slug}/details`}
                className="barber-card-public-cta"
            >
                <span>مشاهده و رزرو</span>
                <ChevronLeft size={16} />
            </Link>
        </div>
    );
}
