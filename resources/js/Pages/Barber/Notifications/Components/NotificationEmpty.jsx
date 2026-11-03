import React from "react";
import { Link } from "@inertiajs/react";
import { Bell, ArrowRight } from "lucide-react";

export default function NotificationEmpty({ filter }) {
    const messages = {
        all: {
            title: "اعلانی ندارید",
            message: "وقتی اعلان جدیدی داشته باشید، اینجا نمایش داده می‌شود.",
        },
        unread: {
            title: "اعلان خوانده‌نشده ندارید",
            message: "همه اعلان‌های شما خوانده شده‌اند.",
        },
        read: {
            title: "اعلان خوانده‌شده ندارید",
            message: "هنوز اعلانی را نخوانده‌اید.",
        },
    };

    const content = messages[filter] || messages.all;

    return (
        <div className="notifications-empty">
            <div className="notifications-empty-icon">
                <Bell size={48} />
            </div>
            <h3>{content.title}</h3>
            <p>{content.message}</p>
            <Link href={route("barber.dashboard")} className="back-btn">
                <ArrowRight size={16} />
                بازگشت به داشبورد
            </Link>
        </div>
    );
}
