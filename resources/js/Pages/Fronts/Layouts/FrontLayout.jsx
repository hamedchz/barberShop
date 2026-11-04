import React from "react";
import { usePage } from "@inertiajs/react";

import Header from "../Components/Header";
import Footer from "../Components/Footer";

import "../Assets/css/front.css";

export default function FrontLayout({ children }) {
    const { theme } = usePage().props;

    const themeMode = theme?.mode === "dark" ? "dark" : "light";

    return (
        <div
            className={`front-site front-theme-${themeMode}`}
            dir="rtl"
            lang="fa"
        >
            <a href="#main" className="front-skip-link">
                رفتن به محتوای اصلی
            </a>

            <Header />

            <main className="front-main" id="main">
                {children}
            </main>

            <Footer />
        </div>
    );
}
