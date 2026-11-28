import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { useAuthModal } from "../../../Components/AuthModalContext";
import {
    LogIn,
    Menu,
    X,
    UserRound,
    CalendarDays,
    ChevronLeft,
    ChevronDown,
} from "lucide-react";

export default function Header({ auth = null }) {
    const { props } = usePage();
    const site = props.site;
    const headerPages = props.headerPages || [];

    const { openAuthModal } = useAuthModal();

    const [menuOpen, setMenuOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(100);

    const navRef = useRef(null);
    const measureRef = useRef(null);
    const moreMeasureRef = useRef(null);
    const moreMenuRef = useRef(null);

    const user = auth?.user ?? null;

    const homeUrl = route("user.home");

    const navItems = useMemo(
        () => [
            {
                key: "home",
                label: "خانه",
                href: route("user.home"),
                type: "anchor",
            },
            // {
            //     key: "services",
            //     label: "خدمات",
            //     href: `${homeUrl}#services`,
            //     type: "anchor",
            // },
            {
                key: "barbers",
                label: "آرایشگران",
                href: route("user.services.index"),
                type: "anchor",
            },
            // {
            //     key: "features",
            //     label: "مزایای ما",
            //     href: `${homeUrl}#features`,
            //     type: "anchor",
            // },
            // {
            //     key: "reviews",
            //     label: "نظرات مشتریان",
            //     href: `${homeUrl}#reviews`,
            //     type: "anchor",
            // },
            ...headerPages.map((page) => ({
                key: `page-${page.id}`,
                label: page.title,
                href: route("user.pages.show", page.slug),
                type: "page",
            })),
        ],
        [headerPages, homeUrl],
    );

    const closeMenu = () => {
        setMenuOpen(false);
        setMoreOpen(false);
    };

    /*
     * محاسبه تعداد لینک‌هایی که واقعاً در فضای هدر جا می‌شوند.
     * عرض لینک‌ها از یک ردیف مخفی اندازه‌گیری می‌شود تا متن فارسی
     * و طول عنوان صفحات داینامیک نیز در محاسبه لحاظ شود.
     */
    useEffect(() => {
        const navElement = navRef.current;
        const measureElement = measureRef.current;

        if (!navElement || !measureElement) {
            return;
        }

        const calculateVisibleItems = () => {
            const availableWidth = navElement.clientWidth;

            if (!availableWidth) {
                return;
            }

            const measuredItems = Array.from(
                measureElement.querySelectorAll("[data-measure-item]"),
            );

            const itemWidths = measuredItems.map(
                (item) => item.getBoundingClientRect().width,
            );

            const moreWidth =
                moreMeasureRef.current?.getBoundingClientRect().width || 80;

            const styles = window.getComputedStyle(navElement);
            const gap = parseFloat(styles.columnGap || styles.gap) || 0;

            const totalWidth =
                itemWidths.reduce((sum, width) => sum + width, 0) +
                Math.max(0, itemWidths.length - 1) * gap;

            // اگر تمام لینک‌ها جا شوند، نیازی به منوی بیشتر نیست.
            if (totalWidth <= availableWidth) {
                setVisibleCount(navItems.length);
                return;
            }

            // در صورت وجود لینک اضافه، فضای دکمه «بیشتر» را رزرو می‌کنیم.
            const itemsAvailableWidth = Math.max(
                0,
                availableWidth - moreWidth - gap,
            );

            let usedWidth = 0;
            let count = 0;

            for (const width of itemWidths) {
                const nextWidth = count === 0 ? width : width + gap;

                if (usedWidth + nextWidth > itemsAvailableWidth) {
                    break;
                }

                usedWidth += nextWidth;
                count++;
            }

            setVisibleCount(count);
        };

        calculateVisibleItems();

        const resizeObserver = new ResizeObserver(calculateVisibleItems);
        resizeObserver.observe(navElement);

        window.addEventListener("resize", calculateVisibleItems);

        // بعد از بارگذاری فونت فارسی نیز اندازه‌ها دوباره محاسبه شوند.
        if (document.fonts?.ready) {
            document.fonts.ready.then(calculateVisibleItems);
        }

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", calculateVisibleItems);
        };
    }, [navItems]);

    // بستن منوی «بیشتر» با کلیک خارج از آن
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                moreMenuRef.current &&
                !moreMenuRef.current.contains(event.target)
            ) {
                setMoreOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const visibleItems = navItems.slice(0, visibleCount);
    const overflowItems = navItems.slice(visibleCount);

    const renderNavItem = (item, mobile = false) => {
        const className = mobile ? "front-mobile-nav-link" : "front-nav-link";

        if (item.type === "page") {
            return (
                <Link
                    key={item.key}
                    href={item.href}
                    className={className}
                    onClick={closeMenu}
                >
                    {item.label}
                </Link>
            );
        }

        return (
            <a
                key={item.key}
                href={item.href}
                className={className}
                onClick={closeMenu}
            >
                {item.label}
            </a>
        );
    };

    return (
        <header className="front-header">
            <div className="front-header-container">
                {/* Logo */}
                <a
                    href={`${homeUrl}#home`}
                    className="front-logo"
                    onClick={closeMenu}
                >
                    <span className="front-logo-icon">
                        {site?.logo ? (
                            <img src={site.logo} alt={site?.name || "لوگو"} />
                        ) : (
                            <span>{site?.name?.charAt(0) || "B"}</span>
                        )}
                    </span>

                    <span className="front-logo-text">
                        <strong>{site?.name || "Barber"}</strong>
                    </span>
                </a>

                {/* Desktop navigation */}
                <nav ref={navRef} className="front-nav" aria-label="منوی اصلی">
                    {visibleItems.map((item) => renderNavItem(item))}

                    {overflowItems.length > 0 && (
                        <div className="front-nav-more" ref={moreMenuRef}>
                            <button
                                type="button"
                                className={`front-nav-more-button ${
                                    moreOpen ? "is-open" : ""
                                }`}
                                onClick={() => setMoreOpen((prev) => !prev)}
                                aria-expanded={moreOpen}
                                aria-haspopup="true"
                            >
                                بیشتر
                                <ChevronDown size={15} />
                            </button>

                            {moreOpen && (
                                <div className="front-nav-more-dropdown">
                                    {overflowItems.map((item) => (
                                        <div key={item.key}>
                                            {renderNavItem(item)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* Hidden measurement row */}
                <div
                    ref={measureRef}
                    className="front-nav-measure"
                    aria-hidden="true"
                >
                    {navItems.map((item) => (
                        <span
                            key={item.key}
                            data-measure-item
                            className="front-nav-link"
                        >
                            {item.label}
                        </span>
                    ))}

                    <span
                        ref={moreMeasureRef}
                        className="front-nav-more-button"
                    >
                        بیشتر
                        <ChevronDown size={15} />
                    </span>
                </div>

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
                            <LogIn size={16} strokeWidth={2} />
                            <span>ورود</span>
                        </button>
                    )}

                    <a
                        href={route("user.services.index")}
                        className="front-header-booking"
                    >
                        <CalendarDays size={17} />
                        <span>رزرو نوبت</span>
                        <ChevronLeft size={16} />
                    </a>
                </div>

                {/* Mobile menu button */}
                <button
                    type="button"
                    className="front-mobile-menu-btn"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
                    aria-expanded={menuOpen}
                    aria-controls="front-mobile-menu"
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile navigation */}
            <div
                id="front-mobile-menu"
                className={`front-mobile-menu ${menuOpen ? "is-open" : ""}`}
            >
                <nav aria-label="منوی موبایل">
                    {navItems.map((item) => renderNavItem(item, true))}
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
                            onClick={() => {
                                closeMenu();
                                openAuthModal("login");
                            }}
                            className="front-mobile-login"
                        >
                            ورود / ثبت‌نام
                        </button>
                    )}

                    <a
                        href={`${homeUrl}#barbers`}
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
