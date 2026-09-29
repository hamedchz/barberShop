import React from "react";
import { Link } from "@inertiajs/react";
import { Star, Wifi, WifiOff, ChevronLeft, Scissors } from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function BarberCard({ barber }) {
    return (
        <div
            className={`barber-card-public ${barber.is_online ? "online" : ""}`}
        >
            {/* نوار آنلاین */}
            {barber.is_online && <div className="barber-card-stripe"></div>}

            <div className="barber-card-public-header">
                <div className="barber-card-public-avatar-wrapper">
                    <div className="barber-card-public-avatar">
                        {barber.avatar ? (
                            <img src={barber.thumbnail} alt={barber.name} />
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

                <div className="barber-card-public-rating">
                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                    <span>{toPersianNumber(barber.rating)}</span>
                    <span className="rating-count">
                        ({toPersianNumber(barber.total_reviews)})
                    </span>
                </div>
            </div>

            <div className="barber-card-public-body">
                <h3 className="barber-card-public-name">{barber.name}</h3>
                <p className="barber-card-public-bio">
                    آرایشگر حرفه‌ای با تجربه
                </p>
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
                href={`/barbers/${barber.slug}`}
                className="barber-card-public-cta"
            >
                <span>مشاهده و رزرو</span>
                <ChevronLeft size={16} />
            </Link>
        </div>
    );
}
