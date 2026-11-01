import React from "react";
import { Wallet, Calendar, CheckCircle, Star } from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";

export default function QuickStats({ stats }) {
    const cards = [
        {
            key: "balance",
            label: "موجودی کیف پول",
            value: toPersianNumber(stats.balance.toLocaleString()),
            unit: "تومان",
            icon: Wallet,
            color: "green",
            link: route("customer.finance.wallet.index"),
        },
        {
            key: "active",
            label: "رزروهای فعال",
            value: toPersianNumber(stats.active_bookings),
            unit: "رزرو",
            icon: Calendar,
            color: "blue",
            link: route("customer.bookings.index"),
        },
        {
            key: "completed",
            label: "رزروهای تکمیل‌شده",
            value: toPersianNumber(stats.completed_bookings),
            unit: "رزرو",
            icon: CheckCircle,
            color: "purple",
            link: route("customer.bookings.index", { status: "completed" }),
        },
        {
            key: "rating",
            label: "میانگین امتیاز",
            value: toPersianNumber(stats.average_rating.toFixed(1)),
            unit: "از ۵",
            icon: Star,
            color: "orange",
            link: "",
        },
    ];

    return (
        <div className="quick-stats-grid">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <a
                        key={card.key}
                        href={card.link}
                        className={`quick-stat-card ${card.color}`}
                    >
                        <div className="quick-stat-icon">
                            <Icon size={22} />
                        </div>
                        <div className="quick-stat-content">
                            <span className="quick-stat-label">
                                {card.label}
                            </span>
                            <div className="quick-stat-value">
                                <span>{card.value}</span>
                                <span className="quick-stat-unit">
                                    {card.unit}
                                </span>
                            </div>
                        </div>
                    </a>
                );
            })}
        </div>
    );
}
