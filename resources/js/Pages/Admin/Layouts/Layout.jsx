import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { Menu } from "lucide-react";
import "../Assets/css/styles.css";
import { useAlert } from "../../../Components/AlertProvider";
import { usePage } from "@inertiajs/react";
import Swal from "sweetalert2";

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { site } = usePage().props;
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

    // Alert
    const { flash } = usePage().props;
    useEffect(() => {
        const alert = flash?.alert;

        if (!alert) return;

        Swal.fire({
            icon: alert.type,
            title: alert.title,
            confirmButtonText: "باشه",
            showConfirmButton: alert.showConfirmButton ?? true,
            toast: alert.toast ?? false,
            position: alert.position || "top-end",
            timer: alert.timer,
            customClass: {
                popup: "rtl-alert",
            },
        });
    }, [flash?.alert?.id]);
    // const { toast } = useAlert();
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
            <main className="main-content">
                <div className="main-content-inner">{children}</div>
            </main>
        </div>
    );
}
