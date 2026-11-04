import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    Menu,
    X,
    Scissors,
    ChevronDown,
    UserRound,
    CalendarDays,
    LogIn,
} from "lucide-react";

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { auth } = usePage().props;
    const user = auth?.user;

    const navItems = [
        { label: "صفحه اصلی", href: "#home" },
        { label: "خدمات", href: "#services" },
        { label: "آرایشگران", href: "#barbers" },
        { label: "درباره ما", href: "#about" },
        { label: "تماس با ما", href: "#contact" },
    ];

    const closeMenu = () => setMobileMenuOpen(false);

    return (
        <header className="front-header">
            <div className="front-container">
                <div className="front-header-inner">
                    <Link
                        href="/"
                        className="front-brand"
                        aria-label="صفحه اصلی"
                        onClick={closeMenu}
                    >
                        <span className="front-brand-icon">
                            <Scissors size={23} strokeWidth={1.8} />
                        </span>

                        <span className="front-brand-text">
                            <strong>BARBER</strong>
                            <small>STUDIO</small>
                        </span>
                    </Link>

                    <nav className="front-desktop-nav">
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

                    <div className="front-header-actions">
                        {user ? (
                            <Link
                                href="/customer"
                                className="front-account-link"
                            >
                                <UserRound size={18} />
                                <span>حساب کاربری</span>
                            </Link>
                        ) : (
                            <a href="/auth/login" className="front-login-link">
                                <LogIn size={17} />
                                <span>ورود</span>
                            </a>
                        )}

                        <a href="#booking" className="front-header-cta">
                            <CalendarDays size={17} />
                            <span>رزرو نوبت</span>
                        </a>

                        <button
                            type="button"
                            className="front-mobile-toggle"
                            onClick={() =>
                                setMobileMenuOpen((previous) => !previous)
                            }
                            aria-label={
                                mobileMenuOpen ? "بستن منو" : "باز کردن منو"
                            }
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? (
                                <X size={23} />
                            ) : (
                                <Menu size={23} />
                            )}
                        </button>
                    </div>
                </div>

                <div
                    className={`front-mobile-menu ${
                        mobileMenuOpen ? "is-open" : ""
                    }`}
                >
                    <nav>
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="front-mobile-nav-link"
                                onClick={closeMenu}
                            >
                                {item.label}
                                <ChevronDown size={15} />
                            </a>
                        ))}
                    </nav>

                    <div className="front-mobile-menu-actions">
                        {user ? (
                            <Link
                                href="/customer"
                                className="front-mobile-account"
                                onClick={closeMenu}
                            >
                                <UserRound size={18} />
                                حساب کاربری
                            </Link>
                        ) : (
                            <a
                                href="/auth/login"
                                className="front-mobile-account"
                                onClick={closeMenu}
                            >
                                <LogIn size={18} />
                                ورود به حساب
                            </a>
                        )}

                        <a
                            href="#booking"
                            className="front-header-cta front-mobile-cta"
                            onClick={closeMenu}
                        >
                            <CalendarDays size={17} />
                            رزرو نوبت
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
}
