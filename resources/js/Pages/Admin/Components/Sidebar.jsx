import React, { useMemo, useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LogOut,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
} from "lucide-react";
import { menuConfig } from "../../../Config/menu";
import "../Assets/css/SideBar.css";
// ============ فیلتر منوها بر اساس دسترسی ============
const filterMenuItems = (items, hasPermission) => {
    return items.reduce((result, item) => {
        const hasChildren = Array.isArray(item.children);

        // ابتدا فرزندان را مستقل بر اساس Permission فیلتر کن
        const children = hasChildren
            ? filterMenuItems(item.children, hasPermission)
            : [];

        // دسترسی مستقیم خود آیتم
        const hasOwnPermission =
            !item.permissions?.length || item.permissions.some(hasPermission);

        // دسترسی والد از طریق Permissionهای تعریف‌شده برای فرزندان
        const hasChildrenPermission =
            item.childrenPermissions?.some(hasPermission) ?? false;

        // والد فقط با دسترسی خودش یا یکی از دسترسی‌های مجاز فرزندان نمایش داده شود
        const canShow = hasOwnPermission || hasChildrenPermission;

        if (!canShow) {
            return result;
        }

        // اگر والد زیرمنو دارد ولی هیچ زیرمنویی قابل‌نمایش نیست،
        // والد را نیز نمایش نده
        if (hasChildren && children.length === 0) {
            return result;
        }

        result.push({
            ...item,
            ...(hasChildren ? { children } : {}),
        });

        return result;
    }, []);
};

const checkItemActive = (item, scope, currentPath) => {
    const normalizePath = (path = "") =>
        `/${path}`.replace(/\/+/g, "/").replace(/\/$/, "") || "/";

    const path = normalizePath(currentPath);

    // آیتم دارای مسیر: ابتدا تطبیق مسیر
    if (item.href) {
        const href = normalizePath(item.href);

        // برای منوی مالی، مسیر دقیق بررسی شود
        if (item.id === "finance-index") {
            return path === href;
        }

        if (path === href || path.startsWith(`${href}/`)) {
            return true;
        }

        return false;
    }

    // آیتم بدون مسیر: Scope یا فرزندان
    if (item.scopes?.some((s) => (scope || []).includes(s))) {
        return true;
    }

    return (
        item.children?.some((child) =>
            checkItemActive(child, scope, currentPath),
        ) ?? false
    );
};

// ============ آیتم منو و زیرمنوها ============
const SidebarItem = ({ item, isCollapsed, isActive, scope, currentPath }) => {
    const Icon = item.icon;
    const hasChildren = item.children?.length > 0;

    const active = isActive(item);
    const [isExpanded, setIsExpanded] = useState(active);

    // با تغییر صفحه، والد منوی فعال باز شود
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
                >
                    <div className="sidebar-item-icon">
                        {Icon && <Icon size={20} />}
                    </div>

                    {!isCollapsed && (
                        <span className="sidebar-item-label">{item.label}</span>
                    )}

                    {active && !isCollapsed && (
                        <span className="sidebar-item-indicator" />
                    )}
                </Link>
            )}

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
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ============ Sidebar اصلی ============
export default function Sidebar({
    isOpen,
    closeSidebar,
    isCollapsed,
    toggleCollapse,
}) {
    const { auth, scopes: scope } = usePage().props;
    const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";

    // بررسی Permission
    const hasPermission = (permission) => {
        if (!auth?.user) return false;

        if (auth.user.roles?.includes("super-admin")) {
            return true;
        }

        return (auth.user.permissions || []).includes(permission);
    };

    // فیلتر منوها و زیرمنوها
    const visibleItems = useMemo(() => {
        if (!auth?.user) return [];

        return filterMenuItems(menuConfig, hasPermission);
    }, [auth]);

    // تشخیص فعال بودن یک منو، با توجه به زیرمنوهای آن
    const isItemActive = (item) => checkItemActive(item, scope, currentPath);

    // خروج
    const handleLogout = () => {
        if (confirm("آیا می‌خواهید از حساب خود خارج شوید؟")) {
            window.location.href = "/logout";
        }
    };

    return (
        <aside
            className={`sidebar ${isOpen ? "open" : ""} ${
                isCollapsed ? "collapsed" : ""
            }`}
        >
            {/* هدر */}
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon">S</div>

                    {!isCollapsed && (
                        <span className="logo-text">SCHOOLUS</span>
                    )}
                </div>

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
                                    src={auth.user.avatarUrl}
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
        </aside>
    );
}
