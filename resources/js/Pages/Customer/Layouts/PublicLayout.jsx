import React, { useEffect } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../Assets/public.css"; // ایمپورت استایل‌ها
import { usePage } from "@inertiajs/react";
import Swal from "sweetalert2";

export default function PublicLayout({ children }) {
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
        <div className="public-layout">
            <Navbar />
            <main className="public-main">{children}</main>
            <Footer />
        </div>
    );
}
