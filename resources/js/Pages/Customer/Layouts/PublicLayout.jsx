import React, { useEffect } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../Assets/public.css";
import { usePage } from "@inertiajs/react";
import Swal from "sweetalert2";

export default function PublicLayout({ children }) {
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
        <div className="public-layout">
            <Navbar />
            <main className="public-main">{children}</main>
            <Footer />
        </div>
    );
}
