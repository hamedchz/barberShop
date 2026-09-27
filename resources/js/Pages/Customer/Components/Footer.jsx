import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    Scissors,
    Mail,
    Phone,
    MapPin,
    Heart,
    Send,
    ArrowUp,
} from "lucide-react";
import {
    FaInstagram,
    FaTwitter,
    FaFacebook,
    FaWhatsapp,
    FaTelegram,
} from "react-icons/fa";

export default function Footer() {
    const { auth } = usePage().props;
    const [showScrollTop, setShowScrollTop] = useState(false);

    // ============ نمایش دکمه با اسکرول ============
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="public-footer">
            {/* ============ دکمه اسکرول به بالا ============ */}
            <button
                className={`footer-scroll-top ${showScrollTop ? "visible" : ""}`}
                onClick={scrollToTop}
                aria-label="بازگشت به بالا"
                title="بازگشت به بالا"
            >
                <ArrowUp size={18} />
            </button>
            <div className="footer-container">
                {/* ============ ستون ۱: برند ============ */}
                <div className="footer-column brand">
                    <Link href="/" className="footer-logo">
                        <div className="footer-logo-icon">
                            <Scissors size={20} />
                        </div>
                        <span className="footer-logo-text">آرایشیار</span>
                    </Link>

                    <p className="footer-description">
                        پلتفرم آنلاین رزرو نوبت آرایشگاه. با آرایشیار، در چند
                        ثانیه بهترین آرایشگر شهر خود را پیدا کنید و نوبت بگیرید.
                    </p>

                    {/* شبکه‌های اجتماعی */}
                    <div className="footer-socials">
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-btn instagram"
                            aria-label="اینستاگرام"
                            title="اینستاگرام"
                        >
                            <FaInstagram size={18} />
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-btn twitter"
                            aria-label="توییتر"
                            title="توییتر"
                        >
                            <FaTwitter size={18} />
                        </a>
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-btn facebook"
                            aria-label="فیسبوک"
                            title="فیسبوک"
                        >
                            <FaFacebook size={18} />
                        </a>
                        <a
                            href="https://wa.me/989123456789"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-btn whatsapp"
                            aria-label="واتساپ"
                            title="واتساپ"
                        >
                            <FaWhatsapp size={18} />
                        </a>
                        <a
                            href="https://t.me/arayeshyar"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-btn telegram"
                            aria-label="تلگرام"
                            title="تلگرام"
                        >
                            <FaTelegram size={18} />
                        </a>
                    </div>
                </div>

                {/* ============ ستون ۲: لینک‌های مفید ============ */}
                <div className="footer-column">
                    <h4 className="footer-title">لینک‌های مفید</h4>
                    <ul className="footer-links">
                        <li>
                            <Link href="/">صفحه اصلی</Link>
                        </li>
                        <li>
                            <Link href="/barbers">آرایشگران</Link>
                        </li>
                        <li>
                            <Link href="/about">درباره ما</Link>
                        </li>
                        <li>
                            <Link href="/contact">تماس با ما</Link>
                        </li>
                        <li>
                            <Link href="/faq">سوالات متداول</Link>
                        </li>
                    </ul>
                </div>

                {/* ============ ستون ۳: خدمات ============ */}
                <div className="footer-column">
                    <h4 className="footer-title">خدمات</h4>
                    <ul className="footer-links">
                        <li>
                            <Link href="/barbers">رزرو آنلاین نوبت</Link>
                        </li>
                        <li>
                            <Link href="/barbers">مشاهده آرایشگران</Link>
                        </li>
                        <li>
                            <Link href="/join">ثبت‌نام آرایشگر</Link>
                        </li>
                        <li>
                            <Link href="/blog">مجله آرایشیار</Link>
                        </li>
                        <li>
                            <Link href="/terms">قوانین و مقررات</Link>
                        </li>
                    </ul>
                </div>

                {/* ============ ستون ۴: تماس با ما ============ */}
                <div className="footer-column">
                    <h4 className="footer-title">تماس با ما</h4>
                    <ul className="footer-contact">
                        <li>
                            <MapPin size={16} />
                            <span>تهران، خیابان آزادی، پلاک ۱، طبقه ۳</span>
                        </li>
                        <li>
                            <Phone size={16} />
                            <a href="tel:+982112345678" dir="ltr">
                                ۰۲۱-۱۲۳۴۵۶۷۸
                            </a>
                        </li>
                        <li>
                            <Mail size={16} />
                            <a href="mailto:info@arayeshyar.com" dir="ltr">
                                info@arayeshyar.com
                            </a>
                        </li>
                    </ul>

                    {/* دکمه تماس سریع */}
                    {!auth?.user && (
                        <Link href="/register" className="footer-cta">
                            <Send size={14} />
                            همین حالا ثبت‌نام کنید
                        </Link>
                    )}
                </div>
            </div>

            {/* ============ بخش پایین ============ */}
            <div className="footer-bottom">
                <p>
                    ساخته شده با{" "}
                    <Heart size={14} fill="#ef4444" color="#ef4444" /> در ایران
                    © {new Date().getFullYear()} - تمامی حقوق محفوظ است.
                </p>

                <div className="footer-bottom-links">
                    <Link href="/privacy">حریم خصوصی</Link>
                    <span>•</span>
                    <Link href="/terms">شرایط استفاده</Link>
                    <span>•</span>
                    <Link href="/sitemap">نقشه سایت</Link>
                </div>
            </div>
        </footer>
    );
}
