import React from "react";
import { Link } from "@inertiajs/react";
import { Bell, BellOff, CheckCircle2 } from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";

export default function NotificationFilters({ filter, counts }) {
    const filters = [
        {
            key: "all",
            label: "همه",
            icon: Bell,
            count: counts.all,
        },
        {
            key: "unread",
            label: "خوانده‌نشده",
            icon: BellOff,
            count: counts.unread,
        },
        {
            key: "read",
            label: "خوانده‌شده",
            icon: CheckCircle2,
            count: counts.read,
        },
    ];

    return (
        <div className="notifications-filters">
            {filters.map((f) => {
                const Icon = f.icon;
                return (
                    <Link
                        key={f.key}
                        href={route("customer.notifications.index", {
                            filter: f.key,
                        })}
                        className={`filter-tab ${
                            filter === f.key ? "active" : ""
                        }`}
                    >
                        <Icon size={16} />
                        <span>{f.label}</span>
                        <span className="filter-count">
                            {toPersianNumber(f.count)}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
