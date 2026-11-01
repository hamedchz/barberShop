import React from "react";
import { Link } from "@inertiajs/react";
import { Sparkles, User } from "lucide-react";

export default function WelcomeCard({ user, stats }) {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "صبح بخیر";
        if (hour < 17) return "ظهر بخیر";
        if (hour < 20) return "عصر بخیر";
        return "شب بخیر";
    };

    return (
        <div className="welcome-card">
            <div className="welcome-card-content">
                <div className="welcome-avatar-wrapper">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="welcome-avatar"
                        />
                    ) : (
                        <div className="welcome-avatar-placeholder">
                            <User size={32} />
                        </div>
                    )}
                </div>

                <div className="welcome-text">
                    <div className="welcome-greeting">
                        <Sparkles size={18} />
                        <span>{getGreeting()}</span>
                    </div>
                    <h1 className="welcome-name">{user.name} </h1>
                    <p className="welcome-subtitle">
                        {stats.active_bookings > 0
                            ? `${stats.active_bookings} رزرو فعال داری`
                            : "آماده‌ای برای یک رزرو جدید؟"}
                    </p>
                </div>
            </div>
        </div>
    );
}
