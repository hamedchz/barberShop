import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { Menu } from "lucide-react";
import "../Assets/css/styles.css";
import { useAlert } from "../../../Components/AlertProvider";

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // ============ بازیابی وضعیت از localStorage ============
    useEffect(() => {
        const saved = localStorage.getItem("sidebar_collapsed");
        if (saved === "true") setIsCollapsed(true);
    }, []);

    useEffect(() => {
        localStorage.setItem("sidebar_collapsed", isCollapsed);
    }, [isCollapsed]);

    // ============ بستن خودکار در موبایل ============
    const closeSidebar = () => setIsSidebarOpen(false);
    const toggleCollapse = () => setIsCollapsed((prev) => !prev);
    const { toast } = useAlert();
    return (
        <div
            className={`admin-layout ${isCollapsed ? "sidebar-collapsed" : ""}`}
        >
            {/* دکمه منوی موبایل */}
            <button
                className="mobile-menu-btn"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="باز کردن منو"
            >
                <Menu size={24} />
            </button>

            {/* اورلی موبایل */}
            {isSidebarOpen && (
                <div className="overlay" onClick={closeSidebar}></div>
            )}

            {/* سایدبار */}
            <Sidebar
                isOpen={isSidebarOpen}
                closeSidebar={closeSidebar}
                isCollapsed={isCollapsed}
                toggleCollapse={toggleCollapse}
            />

            {/* محتوای اصلی که صفحات درون آن قرار می‌گیرند */}
            <main className="main-content">{children}</main>
        </div>
    );
}
