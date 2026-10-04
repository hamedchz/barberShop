import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import "../Assets/css/styles.css"; // ایمپورت استایل‌ها
import "../../Admin/Assets/css/styles.css"; // ایمپورت استایل‌ها
import { usePage } from "@inertiajs/react";
import Swal from "sweetalert2";

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // const { toast } = useAlert();
    const { flash } = usePage().props;
    useEffect(() => {
        if (flash?.alert) {
            Swal.fire({
                icon: flash.alert["type"],
                title: flash.alert["title"],
                confirmButtonText: "باشه",
                toast: flash.alert["toast"],
                position: flash.alert["position"],
                timer: flash.alert["timer"],
                customClass: {
                    popup: "rtl-alert",
                },
            });
        }
    }, [flash]);
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
