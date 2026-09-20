import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import StickyAlert from "../../../Components/StickyAlert";
import "../Assets/css/styles.css"; // ایمپورت استایل‌ها

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="admin-layout">
            <StickyAlert type="success" message={flash?.success} />

            <StickyAlert type="error" message={flash?.error} />

            <StickyAlert type="warning" message={flash?.warning} />

            <StickyAlert type="info" message={flash?.info} />
            {/* دکمه منوی موبایل */}
            <button
                className="mobile-menu-btn"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu size={24} />
            </button>

            {/* اورلی تاریک برای موبایل */}
            {isSidebarOpen && (
                <div
                    className="overlay"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* سایدبار */}
            <Sidebar
                isOpen={isSidebarOpen}
                closeSidebar={() => setIsSidebarOpen(false)}
            />

            {/* محتوای اصلی که صفحات درون آن قرار می‌گیرند */}
            <main className="main-content">{children}</main>
        </div>
    );
}
