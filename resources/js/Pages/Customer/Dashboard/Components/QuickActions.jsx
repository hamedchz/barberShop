import React from "react";
import { Link } from "@inertiajs/react";
import { Plus, Wallet, Search, User } from "lucide-react";

export default function QuickActions() {
    const actions = [
        {
            label: "رزرو جدید",
            icon: Plus,
            link: route("user.barbers.index"),
            color: "green",
        },
        {
            label: "شارژ کیف پول",
            icon: Wallet,
            link: route("customer.finance.deposit.index"),
            color: "blue",
        },
        {
            label: "جستجوی آرایشگر",
            icon: Search,
            link: route("user.barbers.index"),
            color: "purple",
        },
        {
            label: "پروفایل من",
            icon: User,
            link: route("customer.profile.edit"),
            color: "orange",
        },
    ];

    return (
        <div className="quick-actions-grid">
            {actions.map((action) => {
                const Icon = action.icon;
                return (
                    <Link
                        key={action.label}
                        href={action.link}
                        className={`quick-action-btn ${action.color}`}
                    >
                        <div className="quick-action-icon">
                            <Icon size={20} />
                        </div>
                        <span>{action.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
