import React from "react";
import Header from "./Components/Header";
import "./Assets/css/home.css";

export default function FrontLayout({ children, auth = null }) {
    return (
        <div className="front-site" dir="rtl">
            <Header auth={auth} />

            <main className="front-main">{children}</main>
        </div>
    );
}
