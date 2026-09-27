import React, { useMemo } from "react";
import { Link, usePage } from "@inertiajs/react";
import { LogOut, X, ChevronLeft, ChevronRight } from "lucide-react";
import { menuConfig } from "../../../Config/menu";

// ============ آیتم منو ============
const SidebarItem = ({ item, isActive, isCollapsed }) => {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            className={`sidebar-item ${isActive ? "active" : ""}`}
            title={isCollapsed ? item.label : ""}
        >
            <div className="sidebar-item-icon">
                <Icon size={20} />
            </div>
            {!isCollapsed && (
                <span className="sidebar-item-label">{item.label}</span>
            )}
            {isActive && !isCollapsed && (
                <span className="sidebar-item-indicator"></span>
            )}
        </Link>
    );
};

// ============ Sidebar اصلی ============
export default function Sidebar({
    isOpen,
    closeSidebar,
    isCollapsed,
    toggleCollapse,
}) {
    const { auth, scope } = usePage().props;

    // ============ بررسی دسترسی کاربر به یک permission ============
    const hasPermission = (permission) => {
        if (!auth?.user) return false;

        const userPermissions = auth.user.permissions || [];

        // اگر ادمین ارشد است، همه دسترسی‌ها را دارد
        if (auth.user.roles?.includes("super-admin")) return true;

        return userPermissions.includes(permission);
    };

    // ============ بررسی اینکه کاربر حداقل یکی از permission ها را دارد ============
    const hasAnyPermission = (permissions) => {
        if (!permissions || permissions.length === 0) return true; // اگر permission تعریف نشده، نمایش بده
        return permissions.some((p) => hasPermission(p));
    };

    // ============ فیلتر منوها بر اساس permissions ============
    const visibleItems = useMemo(() => {
        if (!auth?.user) return [];

        return menuConfig.filter((item) => {
            // اگر permissions تعریف نشده، نمایش بده (مثل داشبورد)
            if (!item.permissions || item.permissions.length === 0) {
                return true;
            }

            // در غیر این صورت، چک کن که کاربر حداقل یکی از این permission ها را دارد
            return hasAnyPermission(item.permissions);
        });
    }, [auth]);

    // ============ تشخیص منوی فعال (بر اساس scope) ============
    const isItemActive = (item) => {
        const currentScopes = scope || [];

        // اگر scope صفحه فعلی با scope منو تطابق داشت → فعال
        if (item.scopes?.some((s) => currentScopes.includes(s))) {
            return true;
        }

        // در غیر این صورت، بر اساس URL چک کن
        if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            // چک کن که path فعلی با href منو شروع می‌شود
            return (
                currentPath === item.href ||
                currentPath.startsWith(item.href + "/")
            );
        }
        return false;
    };

    // ============ خروج ============
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
            {/* ============ هدر ============ */}
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon">S</div>
                    {!isCollapsed && (
                        <span className="logo-text">SCHOOLUS</span>
                    )}
                </div>

                <button
                    className="close-sidebar-btn"
                    onClick={closeSidebar}
                    aria-label="بستن منو"
                >
                    <X size={24} />
                </button>

                <button
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

            {/* ============ منوها ============ */}
            <nav className="sidebar-nav">
                {visibleItems.length === 0 ? (
                    <p className="sidebar-empty">منویی موجود نیست.</p>
                ) : (
                    visibleItems.map((item) => (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            isActive={isItemActive(item)}
                            isCollapsed={isCollapsed}
                        />
                    ))
                )}
            </nav>

            {/* ============ خروج ============ */}
            <div className="sidebar-footer">
                <button
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
                                    src={auth.user.avatar}
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
