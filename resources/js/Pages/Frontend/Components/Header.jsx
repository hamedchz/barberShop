import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    Menu,
    X,
    Scissors,
    UserRound,
    CalendarDays,
    ChevronLeft,
} from "lucide-react";

export default function Header({ auth = null }) {
    const { props } = usePage();
    const { site } = props;

    const [menuOpen, setMenuOpen] = useState(false);

    const user = auth?.user ?? null;

    const navItems = [
        { label: "خانه", href: "#home" },
        { label: "خدمات", href: "#services" },
        { label: "آرایشگران", href: "#barbers" },
        { label: "مزایای ما", href: "#features" },
        { label: "نظرات مشتریان", href: "#reviews" },
    ];

    const closeMenu = () => setMenuOpen(false);

    // باز کردن مودال ورود یا ثبت‌نام
    const openAuthModal = (tab = "login") => {
        closeMenu();

        window.dispatchEvent(
            new CustomEvent("auth:open", {
                detail: { tab },
            }),
        );
    };

    return (
        <header className="front-header">
            <div className="front-header-container">
                {/* Logo */}
                <a href="#home" className="front-logo" onClick={closeMenu}>
                    <span className="front-logo-icon">
                        {/* <Scissors size={23} strokeWidth={2.2} /> */}
                        {site?.logo ? (
                            <img src={site.logo} alt={site?.name || "لوگو"} />
                        ) : (
                            <span>{site?.name?.charAt(0) || "B"}</span>
                        )}
                    </span>

                    <span className="front-logo-text">
                        <strong>{site.name}</strong>
                        {/* <span>{site.name}</span> */}
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
                        <button
                            type="button"
                            onClick={() => openAuthModal("login")}
                            className="front-login-link"
                        >
                            ورود / ثبت‌نام
                        </button>
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
                        <button
                            type="button"
                            onClick={() => openAuthModal("login")}
                            className="front-mobile-login"
                        >
                            ورود / ثبت‌نام
                        </button>
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
