// Components/NotificationBell.jsx
import React, { useState, useEffect } from "react";
import { Bell, ClockCheck, Star, AlertCircle } from "lucide-react";
import { router } from "@inertiajs/react";

const iconMap = {
    "clock-check": ClockCheck,
    star: Star,
    alert: AlertCircle,
};

const colorMap = {
    success: { bg: "#ecfdf5", color: "#10b981" },
    warning: { bg: "#fffbeb", color: "#f59e0b" },
    info: { bg: "#eff6ff", color: "#3b82f6" },
    danger: { bg: "#fef2f2", color: "#ef4444" },
};

export default function NotificationBell({ notifications, unreadCount }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="notification-bell-wrapper">
            <button
                className="notification-bell-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                        <h3>اعلان‌ها</h3>
                        <button className="mark-all-read-btn">
                            علامت‌گذاری همه
                        </button>
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <p className="empty-notifications">
                                اعلان جدیدی ندارید
                            </p>
                        ) : (
                            notifications.map((notif) => {
                                const Icon = iconMap[notif.data.icon] || Bell;
                                const colors =
                                    colorMap[notif.data.color] || colorMap.info;

                                return (
                                    <div
                                        key={notif.id}
                                        className={`notification-item ${
                                            notif.read_at ? "read" : "unread"
                                        }`}
                                        onClick={() => {
                                            router.visit(notif.data.url);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div
                                            className="notification-icon"
                                            style={{
                                                backgroundColor: colors.bg,
                                                color: colors.color,
                                            }}
                                        >
                                            <Icon size={16} />
                                        </div>
                                        <div className="notification-content">
                                            <h4>{notif.data.title}</h4>
                                            <p>{notif.data.message}</p>
                                            <span className="notification-time">
                                                {formatTimeAgo(
                                                    notif.created_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
