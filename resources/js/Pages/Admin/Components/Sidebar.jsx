import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import {
    LogOut,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
} from "lucide-react";

import { menuConfig } from "../../../Config/menu";
import "../Assets/css/SideBar.css";
import ConfirmModal from "../../Admin/Components/ConfirmModal";
import { toPersianNumber } from "../../../utils/persianNumbers";
// ========================================
// فیلتر منوها بر اساس دسترسی
// ========================================

const filterMenuItems = (items, hasPermission) => {
    return items.reduce((result, item) => {
        const hasChildren = Array.isArray(item.children);

        // ابتدا فرزندان را فیلتر می‌کنیم
        const children = hasChildren
            ? filterMenuItems(item.children, hasPermission)
            : [];

        // بررسی مجوز خود منو
        const hasOwnPermission =
            Array.isArray(item.permissions) &&
            item.permissions.length > 0 &&
            item.permissions.some(hasPermission);

        // منوی والد تنها در صورت داشتن فرزند مجاز نمایش داده می‌شود
        const canShow = hasChildren
            ? children.length > 0
            : hasOwnPermission || item.alwaysVisible;

        if (!canShow) return result;

        result.push({
            ...item,
            ...(hasChildren ? { children } : {}),
        });

        return result;
    }, []);
};

// ========================================
// نرمال‌سازی مسیر
// ========================================
const normalizePath = (path = "") => {
    return `/${path}`.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
};

// ========================================
// نرمال‌سازی نقش‌ها و مجوزها
// ========================================
const normalizeAccessNames = (items) => {
    if (!Array.isArray(items)) return [];

    return items
        .map((item) => {
            if (typeof item === "string") {
                return item.trim();
            }

            return (item?.name || item?.slug || item?.permission || "").trim();
        })
        .filter(Boolean);
};

// ========================================
// تشخیص فعال بودن منو
// ========================================
const checkItemActive = (item, scope, currentPath) => {
    const path = normalizePath(currentPath);

    // آیتم دارای مسیر
    if (item.href) {
        const href = normalizePath(item.href);

        // صفحات اصلی مالی فقط با تطبیق دقیق مسیر فعال شوند
        const exactMatchItems = [
            "barber-finance-index",
            "finance-index",
            "customer-finance-index",
        ];

        if (exactMatchItems.includes(item.id)) {
            return path === href;
        }

        // سایر صفحات
        return path === href || path.startsWith(`${href}/`);
    }

    // آیتم بدون مسیر: بررسی Scope
    if (item.scopes?.some((s) => (scope || []).includes(s))) {
        return true;
    }

    // بررسی فرزندان برای فعال شدن والد
    return (
        item.children?.some((child) =>
            checkItemActive(child, scope, currentPath),
        ) ?? false
    );
};

// ========================================
// کامپوننت آیتم منو
// ========================================
const SidebarItem = ({
    item,
    isCollapsed,
    isActive,
    scope,
    currentPath,
    unreadCount,
}) => {
    const Icon = item.icon;
    const hasChildren = item.children?.length > 0;

    const active = isActive(item);

    const [isExpanded, setIsExpanded] = useState(active);
    const showBadge =
        item.badge === "unread_notifications_count" && unreadCount > 0;
    // باز شدن خودکار والد هنگام تغییر مسیر
    useEffect(() => {
        if (active) {
            setIsExpanded(true);
        }
    }, [active, currentPath]);

    const toggleChildren = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <div className="sidebar-menu-group">
            {hasChildren ? (
                <button
                    type="button"
                    className={`sidebar-item sidebar-parent ${
                        active ? "active" : ""
                    } ${isExpanded ? "expanded" : ""}`}
                    onClick={toggleChildren}
                    title={isCollapsed ? item.label : ""}
                    aria-expanded={isExpanded}
                >
                    <div className="sidebar-item-icon">
                        {Icon && <Icon size={20} />}
                    </div>

                    {!isCollapsed && (
                        <>
                            <span className="sidebar-item-label">
                                {item.label}
                            </span>

                            <ChevronDown
                                size={16}
                                className={`sidebar-submenu-chevron ${
                                    isExpanded ? "rotated" : ""
                                }`}
                            />
                        </>
                    )}
                </button>
            ) : (
                <Link
                    href={item.href}
                    className={`sidebar-item ${active ? "active" : ""}`}
                    title={isCollapsed ? item.label : ""}
                    preserveScroll
                >
                    <div className="sidebar-item-icon">
                        {Icon && <Icon size={20} />}
                        {isCollapsed && (showBadge || item.badgeText) && (
                            <span
                                className={`sidebar-badge-dot ${
                                    item.bookingSetupOnly
                                        ? "sidebar-setup-badge-dot"
                                        : ""
                                }`}
                            />
                        )}
                    </div>

                    {!isCollapsed && (
                        <span className="sidebar-item-label">{item.label}</span>
                    )}

                    {!isCollapsed && (showBadge || item.badgeText) && (
                        <span
                            className={`sidebar-badge ${
                                item.bookingSetupOnly
                                    ? "sidebar-setup-badge"
                                    : ""
                            }`}
                        >
                            {item.badgeText ||
                                (unreadCount > 99
                                    ? "۹۹+"
                                    : toPersianNumber(unreadCount))}
                        </span>
                    )}

                    {active && !isCollapsed && !showBadge && (
                        <span className="sidebar-item-indicator" />
                    )}
                </Link>
            )}

            {/* زیرمنوها */}
            {hasChildren && !isCollapsed && isExpanded && (
                <div className="sidebar-submenu">
                    {item.children.map((child) => (
                        <SidebarItem
                            key={child.id}
                            item={child}
                            isCollapsed={false}
                            isActive={isActive}
                            scope={scope}
                            currentPath={currentPath}
                            unreadCount={unreadCount}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ========================================
// Sidebar اصلی
// ========================================
export default function Sidebar({
    isOpen,
    closeSidebar,
    isCollapsed,
    toggleCollapse,
}) {
    const { props, url } = usePage();

    const { site, auth, scopes: scope, bookingSetup = {} } = props;
    // مسیر فعلی از Inertia
    const currentPath = normalizePath(url.split("?")[0]);
    const unreadNotifications = auth?.user?.unread_notifications_count || 0;

    // ========================================
    // بررسی Permission و تشخیص پنل کاربر
    // ========================================

    const userPermissions = useMemo(
        () => normalizeAccessNames(auth?.user?.permissions),
        [auth?.user?.permissions],
    );

    const userRoles = useMemo(
        () => normalizeAccessNames(auth?.user?.roles),
        [auth?.user?.roles],
    );

    // تشخیص سوپر ادمین
    const isSuperAdmin = userRoles.some((role) => {
        const normalizedRole = role.toLowerCase();

        return [
            "سوپر ادمین",
            "super admin",
            "super-admin",
            "super_admin",
        ].includes(normalizedRole);
    });

    // تشخیص پنل فعال کاربر
    const userPanel = useMemo(() => {
        // سوپر ادمین همیشه پنل ادمین
        if (isSuperAdmin) {
            return "admin";
        }

        // ابتدا ادمین را تشخیص می‌دهیم
        const hasAdminPermissions = userPermissions.some((permission) =>
            permission.startsWith("manage-"),
        );

        if (hasAdminPermissions) {
            return "admin";
        }

        // آرایشگر
        if (userPermissions.includes("barber-dashboard-panel")) {
            return "barber";
        }

        // مشتری
        if (userPermissions.includes("customer-dashboard-panel")) {
            return "customer";
        }

        return null;
    }, [isSuperAdmin, userPermissions]);

    // بررسی دسترسی
    const hasPermission = useCallback(
        (permission) => {
            if (isSuperAdmin) {
                return true;
            }

            return userPermissions.includes(permission);
        },
        [isSuperAdmin, userPermissions],
    );

    // ========================================
    // وضعیت تکمیل راه‌اندازی نوبت‌دهی
    // ========================================
    const isBookingSetupCompleted = Boolean(
        bookingSetup.workingDays &&
        bookingSetup.services &&
        bookingSetup.generatedSlots,
    );

    // ========================================
    // فیلتر منوها بر اساس پنل و Permission
    // ========================================

    const visibleItems = useMemo(() => {
        if (!auth?.user || !userPanel) {
            return [];
        }

        // انتخاب منوهای پنل کاربر
        const panelItems = menuConfig.filter(
            (item) => item.panel === userPanel,
        );

        // فیلتر Permission
        const filteredItems = filterMenuItems(panelItems, hasPermission);

        // قوانین راه‌اندازی فقط برای آرایشگر
        if (userPanel !== "barber") {
            return filteredItems;
        }

        return filteredItems.filter((item) => {
            // راه‌اندازی نوبت‌دهی تا زمان تکمیل نمایش داده شود
            if (item.bookingSetupOnly) {
                return !isBookingSetupCompleted;
            }

            // داشبورد، اعلان‌ها و پروفایل همیشه نمایش داده شوند
            if (item.alwaysVisible) {
                return true;
            }

            // سایر منوها بعد از تکمیل راه‌اندازی نمایش داده شوند
            return isBookingSetupCompleted;
        });
    }, [auth?.user, userPanel, hasPermission, isBookingSetupCompleted]);

    // ========================================
    // تشخیص فعال بودن منو
    // ========================================
    const isItemActive = (item) => {
        return checkItemActive(item, scope, currentPath);
    };

    // ========================================
    // خروج از حساب
    // ========================================
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = () => {
        setLogoutModalOpen(true);
    };

    const closeLogoutModal = () => {
        if (isLoggingOut) return;

        setLogoutModalOpen(false);
    };

    const handleConfirmLogout = () => {
        setIsLoggingOut(true);

        router.post(
            route("auth.logout"),
            {},
            {
                onFinish: () => {
                    setIsLoggingOut(false);
                },
            },
        );
    };

    return (
        <aside
            className={`sidebar ${isOpen ? "open" : ""} ${
                isCollapsed ? "collapsed" : ""
            }`}
        >
            {/* هدر */}
            <div className="sidebar-header">
                <Link href="/" className="logo-container" preserveScroll>
                    <div className="logo-icon">
                        {site.logo ? (
                            <img src={site.logo} alt={site.name} />
                        ) : (
                            site.name?.charAt(0) || "آ"
                        )}
                    </div>

                    <span className="logo-text">{site.name}</span>
                </Link>

                <button
                    type="button"
                    className="close-sidebar-btn"
                    onClick={closeSidebar}
                    aria-label="بستن منو"
                >
                    <X size={24} />
                </button>

                <button
                    type="button"
                    className="collapse-sidebar-btn"
                    onClick={toggleCollapse}
                    aria-label={isCollapsed ? "باز کردن" : "جمع کردن"}
                >
                    {isCollapsed ? (
                        <ChevronLeft size={18} />
                    ) : (
                        <ChevronRight size={18} />
                    )}
                </button>
            </div>

            {/* منوها */}
            <nav className="sidebar-nav">
                {visibleItems.length === 0 ? (
                    <p className="sidebar-empty">منویی موجود نیست.</p>
                ) : (
                    visibleItems.map((item) => (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            isActive={isItemActive}
                            isCollapsed={isCollapsed}
                            scope={scope}
                            currentPath={currentPath}
                            unreadCount={unreadNotifications}
                        />
                    ))
                )}
            </nav>

            {/* فوتر */}
            <div className="sidebar-footer">
                <button
                    type="button"
                    className="logout-btn"
                    onClick={handleLogout}
                    title={isCollapsed ? "خروج" : ""}
                >
                    <LogOut size={20} />

                    {!isCollapsed && <span>خروج</span>}
                </button>

                {!isCollapsed && auth?.user && (
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">
                            {auth.user.avatar ? (
                                <img
                                    src={auth.user.thumbnail}
                                    alt={auth.user.name}
                                />
                            ) : (
                                <span>
                                    {auth.user.name?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">
                                {auth.user.name}
                            </span>

                            <span className="sidebar-user-role">
                                {auth.user.roles?.[0] || "کاربر"}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* مدال خروج */}
            <ConfirmModal
                isOpen={logoutModalOpen}
                onClose={closeLogoutModal}
                onConfirm={handleConfirmLogout}
                title="خروج از حساب کاربری"
                message="آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟"
                confirmText="بله، خارج شو"
                cancelText="انصراف"
                type="danger"
                isLoading={isLoggingOut}
            />
        </aside>
    );
}
