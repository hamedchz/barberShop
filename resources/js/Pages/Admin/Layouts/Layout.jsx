import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { Menu } from "lucide-react";
import "../Assets/css/styles.css";
import { usePage } from "@inertiajs/react";
import Swal from "sweetalert2";

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const { site, auth, flash, bookingSetup = {} } = usePage().props;

    // ========================================
    // بررسی تکمیل راه‌اندازی آرایشگر
    // ========================================
    const isBarber = auth?.user?.roles?.includes("آرایشگر");

    const isBookingSetupCompleted = Boolean(
        bookingSetup.workingDays &&
        bookingSetup.services &&
        bookingSetup.generatedSlots,
    );

    // تا زمان تکمیل راه‌اندازی، سایدبار مخفی باشد
    const shouldHideSidebar = isBarber && !isBookingSetupCompleted;

    // ========================================
    // بازیابی وضعیت Sidebar از localStorage
    // ========================================
    useEffect(() => {
        const saved = localStorage.getItem("sidebar_collapsed");

        if (saved === "true") {
            setIsCollapsed(true);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("sidebar_collapsed", isCollapsed);
    }, [isCollapsed]);

    // ========================================
    // بستن خودکار در موبایل
    // ========================================
    const closeSidebar = () => setIsSidebarOpen(false);

    const toggleCollapse = () => setIsCollapsed((prev) => !prev);

    // ========================================
    // بستن سایدبار هنگام مخفی شدن
    // ========================================
    useEffect(() => {
        if (shouldHideSidebar) {
            setIsSidebarOpen(false);
        }
    }, [shouldHideSidebar]);

    // ========================================
    // نمایش Alert
    // ========================================
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

    return (
        <div
            className={`admin-layout ${
                !shouldHideSidebar && isCollapsed ? "sidebar-collapsed" : ""
            } ${shouldHideSidebar ? "sidebar-hidden" : ""}`}
        >
            {/* دکمه منوی موبایل */}
            {!shouldHideSidebar && (
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="باز کردن منو"
                >
                    <Menu size={24} />
                </button>
            )}

            {/* اورلی موبایل */}
            {!shouldHideSidebar && isSidebarOpen && (
                <div className="overlay" onClick={closeSidebar} />
            )}

            {/* سایدبار */}
            {!shouldHideSidebar && (
                <Sidebar
                    isOpen={isSidebarOpen}
                    closeSidebar={closeSidebar}
                    isCollapsed={isCollapsed}
                    toggleCollapse={toggleCollapse}
                />
            )}

            {/* محتوای اصلی */}
            <main className="main-content">
                <div className="main-content-inner">{children}</div>
            </main>
        </div>
    );
}
