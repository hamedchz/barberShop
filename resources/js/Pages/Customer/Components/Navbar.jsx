import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    Scissors,
    Menu,
    X,
    User,
    LogIn,
    LogOut,
    Calendar,
    Home,
    Phone,
} from "lucide-react";

export default function Navbar() {
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    // ============ تغییر ظاهر با اسکرول ============
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { href: "/", label: "خانه", icon: Home },
        { href: "/barbers", label: "آرایشگران", icon: Scissors },
        { href: "/contact", label: "تماس با ما", icon: Phone },
    ];

    const handleLogout = () => {
        if (confirm("آیا می‌خواهید از حساب خود خارج شوید؟")) {
            window.location.href = "/logout";
        }
    };

    return (
        <nav className={`public-navbar ${isScrolled ? "scrolled" : ""}`}>
            <div className="navbar-container">
                {/* لوگو */}
                <Link href="/" className="navbar-logo">
                    <div className="navbar-logo-icon">
                        <Scissors size={20} />
                    </div>
                    <span className="navbar-logo-text">آرایشیار</span>
                </Link>

                {/* لینک‌های دسکتاپ */}
                <div className="navbar-links desktop-only">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="navbar-link"
                            >
                                <Icon size={16} />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* دکمه‌های کاربر */}
                <div className="navbar-actions desktop-only">
                    {auth?.user ? (
                        <div className="navbar-user-menu">
                            <Link
                                href="/customer/bookings"
                                className="navbar-btn outline"
                            >
                                <Calendar size={16} />
                                نوبت‌های من
                            </Link>

                            <div className="navbar-user-dropdown">
                                <div className="navbar-user-trigger">
                                    <div className="navbar-user-avatar">
                                        {auth.user.avatar ? (
                                            <img
                                                src={auth.user.thumbnail}
                                                alt={auth.user.name}
                                            />
                                        ) : (
                                            <span>
                                                {auth.user.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="navbar-user-name">
                                        {auth.user.name}
                                    </span>
                                </div>

                                <div className="navbar-user-menu-dropdown">
                                    <Link
                                        href="/profile"
                                        className="dropdown-item"
                                    >
                                        <User size={16} />
                                        پروفایل
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="dropdown-item danger"
                                    >
                                        <LogOut size={16} />
                                        خروج
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="navbar-auth">
                            <Link href="/login" className="navbar-btn outline">
                                <LogIn size={16} />
                                ورود
                            </Link>
                            <Link
                                href="/register"
                                className="navbar-btn primary"
                            >
                                ثبت‌نام
                            </Link>
                        </div>
                    )}
                </div>

                {/* دکمه موبایل */}
                <button
                    className="navbar-mobile-btn mobile-only"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* منوی موبایل */}
            {isOpen && (
                <div className="navbar-mobile-menu mobile-only">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="mobile-menu-item"
                                onClick={() => setIsOpen(false)}
                            >
                                <Icon size={18} />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}

                    <div className="mobile-menu-divider"></div>

                    {auth?.user ? (
                        <>
                            <Link
                                href="/customer/bookings"
                                className="mobile-menu-item"
                                onClick={() => setIsOpen(false)}
                            >
                                <Calendar size={18} />
                                <span>نوبت‌های من</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="mobile-menu-item danger"
                            >
                                <LogOut size={18} />
                                <span>خروج</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="mobile-menu-item"
                                onClick={() => setIsOpen(false)}
                            >
                                <LogIn size={18} />
                                <span>ورود</span>
                            </Link>
                            <Link
                                href="/register"
                                className="mobile-menu-item primary"
                                onClick={() => setIsOpen(false)}
                            >
                                ثبت‌نام
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
