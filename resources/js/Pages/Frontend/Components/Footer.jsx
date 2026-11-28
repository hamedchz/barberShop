import React from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    CalendarDays,
    Clock3,
    MapPin,
    Phone,
    Mail,
    Scissors,
    ShieldCheck,
    Sparkles,
    Camera,
    Send,
} from "lucide-react";

export default function Footer() {
    const { props } = usePage();

    const site = props.site ?? {};

    const normalizeUsername = (username) =>
        String(username ?? "")
            .trim()
            .replace(/^@+/, "")
            .replace(/\s+/g, "");

    const instagramUsername = normalizeUsername(site.instagram);
    const telegramUsername = normalizeUsername(site.telegram);

    const footerPages = props.footerPages ?? [];

    const currentYear = new Date().getFullYear();

    const quickLinks = [
        {
            label: "صفحه اصلی",
            href: route("user.home"),
        },
        {
            label: "آرایشگران",
            href: route("user.services.index"),
        },
        // {
        //     label: "خدمات",
        //     href: route("user.services.index"),
        // },
    ];

    const bookingLinks = [
        {
            label: "مشاهده آرایشگران",
            href: route("user.barbers.index"),
        },
        {
            label: "مشاهده خدمات",
            href: route("user.services.index"),
        },
    ];

    return (
        <footer className="front-footer">
            <div className="front-container">
                {/* Main footer */}
                <div className="front-footer-main">
                    {/* Brand */}
                    <div className="front-footer-brand">
                        <Link
                            href={route("user.home")}
                            className="front-footer-logo"
                            aria-label="صفحه اصلی"
                        >
                            <span className="front-footer-logo-icon">
                                {site?.logo ? (
                                    <img
                                        src={site.logo}
                                        alt={site?.name || "لوگو"}
                                    />
                                ) : (
                                    <span>{site?.name?.charAt(0) || "B"}</span>
                                )}
                            </span>

                            <strong>{site.name}</strong>
                        </Link>

                        <p className="front-footer-description">
                            {site.description ||
                                "راهی ساده‌تر برای انتخاب آرایشگر حرفه‌ای، مشاهده خدمات و رزرو آنلاین نوبت."}
                        </p>

                        <div className="front-footer-trust">
                            <ShieldCheck size={17} />
                            <span>تجربه‌ای آسان و مطمئن در رزرو نوبت</span>
                        </div>
                    </div>

                    {/* Quick links */}
                    <div className="front-footer-column">
                        <h3>دسترسی سریع</h3>

                        <ul>
                            {quickLinks.map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href}>
                                        <ArrowLeft size={14} />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Dynamic pages */}
                    <div className="front-footer-column">
                        <h3>صفحات سایت</h3>

                        <ul>
                            {footerPages.map((page) => (
                                <li key={page.id}>
                                    <Link
                                        href={route(
                                            "user.pages.show",
                                            page.slug,
                                        )}
                                    >
                                        <ArrowLeft size={14} />
                                        <span>{page.title}</span>
                                    </Link>
                                </li>
                            ))}

                            {footerPages.length === 0 && (
                                <li className="front-footer-empty">
                                    صفحات دیگری به‌زودی اضافه می‌شوند.
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="front-footer-column front-footer-contact-column">
                        <h3>ارتباط با ما</h3>

                        <div className="front-footer-contact-list">
                            {site.phone && (
                                <a
                                    href={`tel:${site.phone}`}
                                    className="front-footer-contact-item"
                                >
                                    <span className="front-footer-contact-icon">
                                        <Phone size={17} />
                                    </span>
                                    <span dir="ltr">{site.phone}</span>
                                </a>
                            )}

                            {site.email && (
                                <a
                                    href={`mailto:${site.email}`}
                                    className="front-footer-contact-item"
                                >
                                    <span className="front-footer-contact-icon">
                                        <Mail size={17} />
                                    </span>
                                    <span>{site.email}</span>
                                </a>
                            )}

                            {site.address && (
                                <div className="front-footer-contact-item">
                                    <span className="front-footer-contact-icon">
                                        <MapPin size={17} />
                                    </span>
                                    <span>{site.address}</span>
                                </div>
                            )}

                            {!site.phone && !site.email && !site.address && (
                                <p className="front-footer-contact-empty">
                                    اطلاعات تماس در حال تکمیل است.
                                </p>
                            )}
                        </div>

                        {(instagramUsername || telegramUsername) && (
                            <div className="front-footer-social">
                                <span className="front-footer-social-title">
                                    ما را در شبکه‌های اجتماعی دنبال کنید
                                </span>

                                <div className="front-footer-social-links">
                                    {instagramUsername && (
                                        <a
                                            href={`https://www.instagram.com/${encodeURIComponent(instagramUsername)}/`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="front-footer-social-link instagram"
                                            aria-label="اینستاگرام"
                                            title="اینستاگرام"
                                        >
                                            <Camera size={19} />
                                        </a>
                                    )}

                                    {telegramUsername && (
                                        <a
                                            href={`https://t.me/${encodeURIComponent(telegramUsername)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="front-footer-social-link telegram"
                                            aria-label="تلگرام"
                                            title="تلگرام"
                                        >
                                            <Send size={19} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Booking CTA */}
                <div className="front-footer-cta">
                    <div className="front-footer-cta-icon">
                        <Sparkles size={23} />
                    </div>

                    <div className="front-footer-cta-content">
                        <h3>برای تغییر آماده‌ای؟</h3>
                        <p>
                            آرایشگر موردنظرت را پیدا کن و در چند قدم نوبتت را
                            رزرو کن.
                        </p>
                    </div>

                    <Link
                        href={route("user.services.index")}
                        className="front-footer-cta-button"
                    >
                        <CalendarDays size={17} />
                        <span>رزرو نوبت</span>
                        <ArrowLeft size={16} />
                    </Link>
                </div>

                {/* Bottom */}
                <div className="front-footer-bottom">
                    <div className="front-footer-copyright">
                        <span>
                            © {currentYear} {site.name || "barberApp"}
                        </span>
                        <span>تمامی حقوق محفوظ است.</span>
                    </div>

                    <div className="front-footer-bottom-note">
                        <Clock3 size={14} />
                        <span>ساده، سریع و آنلاین نوبت بگیر</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
