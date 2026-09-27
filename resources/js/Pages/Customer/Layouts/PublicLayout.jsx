import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../Assets/public.css"; // ایمپورت استایل‌ها

export default function PublicLayout({ children }) {
    return (
        <div className="public-layout">
            <Navbar />
            <main className="public-main">{children}</main>
            <Footer />
        </div>
    );
}
