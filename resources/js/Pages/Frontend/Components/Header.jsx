import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
    Menu,
    X,
    Scissors,
    UserRound,
    CalendarDays,
    ChevronLeft,
} from "lucide-react";

export default function Header({ auth = null }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const user = auth?.user ?? auth;

    const navItems = [
        { label: "خانه", href: "#home" },
        { label: "خدمات", href: "#services" },
        { label: "آرایشگران", href: "#barbers" },
        { label: "مزایای ما", href: "#features" },
        { label: "نظرات مشتریان", href: "#reviews" },
    ];

    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="front-header">
            <div className="front-header-container">
                {/* Logo */}
                <a href="#home" className="front-logo" onClick={closeMenu}>
                    <span className="front-logo-icon">
                        <Scissors size={23} strokeWidth={2.2} />
                    </span>

                    <span className="front-logo-text">
                        <strong>barber</strong>
                        <span>App</span>
                    </span>
                </a>

                {/* Desktop navigation */}
                <nav className="front-nav">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="front-nav-link"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                {/* Header actions */}
                <div className="front-header-actions">
                    {user ? (
                        <Link href="/" className="front-account-link">
                            <UserRound size={18} />
                            <span>حساب کاربری</span>
                        </Link>
                    ) : (
                        <Link href="/login" className="front-login-link">
                            ورود / ثبت‌نام
                        </Link>
                    )}

                    <a href="#barbers" className="front-header-booking">
                        <CalendarDays size={17} />
                        <span>رزرو نوبت</span>
                        <ChevronLeft size={16} />
                    </a>
                </div>

                {/* Mobile menu button */}
                <button
                    type="button"
                    className="front-mobile-menu-btn"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile navigation */}
            <div className={`front-mobile-menu ${menuOpen ? "is-open" : ""}`}>
                <nav>
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={closeMenu}
                            className="front-mobile-nav-link"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="front-mobile-menu-actions">
                    {user ? (
                        <Link
                            href="/"
                            onClick={closeMenu}
                            className="front-mobile-account"
                        >
                            <UserRound size={18} />
                            حساب کاربری
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            onClick={closeMenu}
                            className="front-mobile-login"
                        >
                            ورود / ثبت‌نام
                        </Link>
                    )}

                    <a
                        href="#barbers"
                        onClick={closeMenu}
                        className="front-mobile-booking"
                    >
                        <CalendarDays size={18} />
                        مشاهده آرایشگران
                    </a>
                </div>
            </div>
        </header>
    );
}
