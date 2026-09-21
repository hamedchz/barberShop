import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import "../Assets/css/styles.css"; // ایمپورت استایل‌ها
import { useAlert } from "../../../Components/AlertProvider";

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { toast } = useAlert();
    return (
        <div className="admin-layout">
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
