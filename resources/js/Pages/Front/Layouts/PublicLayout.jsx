import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    Scissors,
    Menu,
    X,
    User,
    LogIn,
    UserPlus,
    ChevronDown,
} from "lucide-react";
import "./Assets/css/PublicLayout.css";
import "../Assets/css/PublicStyles.css";

export default function PublicLayout({ children }) {
    const { props } = usePage();
    const { auth, site } = props;

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // ============ تشخیص اسکرول ============
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // ============ بستن منو با Escape ============
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                setIsMobileMenuOpen(false);
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, []);

    const navLinks = [
        { label: "خانه", href: "" },
        { label: "آرایشگران", href: "" },
        { label: "خدمات", href: "" },
        { label: "درباره ما", href: "" },
        { label: "تماس با ما", href: "" },
    ];

    return (
        <div className="public-layout">
            {/* ============ Navbar ============ */}
            <nav className={`public-navbar ${isScrolled ? "scrolled" : ""}`}>
                <div className="navbar-container">
                    {/* Logo */}
                    <Link href="/" className="navbar-logo">
                        <div className="navbar-logo-icon">
                            {site?.logo ? (
                                <img src={site.logo} alt={site.name} />
                            ) : (
                                <Scissors size={20} />
                            )}
                        </div>
                        <span className="navbar-logo-text">
                            {site?.name || "سالن"}
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="navbar-links desktop-only">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="navbar-link"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="navbar-actions">
                        {auth?.user ? (
                            <div className="navbar-user-menu">
                                <button
                                    type="button"
                                    className="navbar-user-trigger"
                                    onClick={() =>
                                        setIsUserMenuOpen(!isUserMenuOpen)
                                    }
                                >
                                    <div className="navbar-user-avatar">
                                        {auth.user.thumbnail ? (
                                            <img
                                                src={auth.user.thumbnail}
                                                alt={auth.user.name}
                                            />
                                        ) : (
                                            <User size={16} />
                                        )}
                                    </div>
                                    <span className="navbar-user-name desktop-only">
                                        {auth.user.name}
                                    </span>
                                    <ChevronDown
                                        size={14}
                                        className={`navbar-chevron ${
                                            isUserMenuOpen ? "rotated" : ""
                                        }`}
                                    />
                                </button>

                                {isUserMenuOpen && (
                                    <>
                                        <div
                                            className="navbar-dropdown-overlay"
                                            onClick={() =>
                                                setIsUserMenuOpen(false)
                                            }
                                        />
                                        <div className="navbar-user-dropdown">
                                            <Link
                                                href=""
                                                className="dropdown-item"
                                            >
                                                داشبورد
                                            </Link>
                                            <Link
                                                href=""
                                                className="dropdown-item"
                                            >
                                                رزروهای من
                                            </Link>
                                            <Link
                                                href=""
                                                className="dropdown-item"
                                            >
                                                پروفایل
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="navbar-auth desktop-only">
                                <Link
                                    href={route("login")}
                                    className="navbar-btn outline"
                                >
                                    <LogIn size={16} />
                                    ورود
                                </Link>
                                <Link
                                    href={route("register")}
                                    className="navbar-btn primary"
                                >
                                    <UserPlus size={16} />
                                    ثبت‌نام
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            className="navbar-mobile-btn"
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            aria-label="منو"
                        >
                            {isMobileMenuOpen ? (
                                <X size={24} />
                            ) : (
                                <Menu size={24} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="navbar-mobile-menu open">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="mobile-menu-item"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="mobile-menu-divider" />
                        {!auth?.user && (
                            <>
                                <Link
                                    href={route("login")}
                                    className="mobile-menu-item"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <LogIn size={16} />
                                    ورود
                                </Link>
                                <Link
                                    href={route("register")}
                                    className="mobile-menu-item primary"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <UserPlus size={16} />
                                    ثبت‌نام
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </nav>

            {/* ============ Main Content ============ */}
            <main className="public-main">{children}</main>

            {/* ============ Footer ============ */}
            <footer className="public-footer">
                <div className="footer-container">
                    {/* ستون برند */}
                    <div className="footer-column brand">
                        <Link href="/" className="footer-logo">
                            <div className="footer-logo-icon">
                                {site?.logo ? (
                                    <img src={site.logo} alt={site.name} />
                                ) : (
                                    <Scissors size={20} />
                                )}
                            </div>
                            <span className="footer-logo-text">
                                {site?.name || "سالن"}
                            </span>
                        </Link>
                        <p className="footer-description">
                            رزرو نوبت آرایشگاه در چند ثانیه، بدون تماس تلفنی، با
                            بهترین آرایشگران.
                        </p>
                    </div>

                    {/* لینک‌ها */}
                    <div className="footer-column">
                        <h4 className="footer-title">لینک‌های سریع</h4>
                        <ul className="footer-links">
                            <li>
                                <Link href="">خانه</Link>
                            </li>
                            <li>
                                <Link href="">آرایشگران</Link>
                            </li>
                            <li>
                                <Link href="">خدمات</Link>
                            </li>
                            <li>
                                <Link href="">درباره ما</Link>
                            </li>
                        </ul>
                    </div>

                    {/* پشتیبانی */}
                    <div className="footer-column">
                        <h4 className="footer-title">پشتیبانی</h4>
                        <ul className="footer-links">
                            <li>
                                <Link href="">تماس با ما</Link>
                            </li>
                            <li>
                                <Link href="">سوالات متداول</Link>
                            </li>
                            <li>
                                <Link href="">قوانین و مقررات</Link>
                            </li>
                            <li>
                                <Link href="">حریم خصوصی</Link>
                            </li>
                        </ul>
                    </div>

                    {/* تماس */}
                    <div className="footer-column">
                        <h4 className="footer-title">تماس</h4>
                        <ul className="footer-links">
                            <li>
                                <span dir="ltr">۰۲۱-۱۲۳۴۵۶۷۸</span>
                            </li>
                            <li>
                                <span dir="ltr">info@salon.com</span>
                            </li>
                            <li>تهران، خیابان ولیعصر</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} - تمامی حقوق محفوظ است.</p>
                </div>
            </footer>
        </div>
    );
}
