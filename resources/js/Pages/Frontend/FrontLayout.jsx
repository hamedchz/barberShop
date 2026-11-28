import React from "react";
import { usePage } from "@inertiajs/react";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import { AuthModalProvider } from "../../Components/AuthModalContext";
import "./Assets/css/home.css";

export default function FrontLayout({ children }) {
    const { props } = usePage();

    return (
        <AuthModalProvider site={props.site}>
            <div className="front-site" dir="rtl">
                <Header auth={props.auth} />

                <main className="front-main">{children}</main>

                <Footer />
            </div>
        </AuthModalProvider>
    );
}
