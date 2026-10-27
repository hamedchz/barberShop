import React, { useState, useEffect } from "react";
import Sidebar from "../../Admin/Components/Sidebar";
import { Menu } from "lucide-react";
import "../Assets/css/styles.css";
import "../../Admin/Assets/css/styles.css";
import { usePage } from "@inertiajs/react";
import Swal from "sweetalert2";

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // const { toast } = useAlert();
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
            <main className="main-content">
                <div className="main-content-inner">{children}</div>
            </main>
        </div>
    );
}
