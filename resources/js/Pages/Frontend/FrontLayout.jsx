import React from "react";
import { usePage } from "@inertiajs/react";

import Header from "./Components/Header";
import AuthModal from "@/Components/AuthModal";

import "./Assets/css/home.css";

export default function FrontLayout({ children, auth = null }) {
    const { props } = usePage();
    const { site } = props;

    return (
        <div className="front-site" dir="rtl">
            <Header auth={auth} />

            <main className="front-main">{children}</main>

            <AuthModal site={site} />
        </div>
    );
}
