import React, { useState } from "react";
import {
    CreditCard,
    Clock4,
    Play,
    CheckCircle,
    XCircle,
    TrendingUp,
    Coins,
    Calendar,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";

import StatsDetailModal from "../Components/StatsDetailModal";

export default function SettlementStats({ stats }) {
    const [selectedStat, setSelectedStat] = useState(null);

    const cards = [
        {
            key: "pending",
            title: "در انتظار بررسی",
            value: stats.pending,
            amount: stats.pending_amount,
            icon: Clock4,
            color: "yellow",
            urgent: stats.pending > 0,
            description: "درخواست‌های تسویه که هنوز توسط ادمین بررسی نشده‌اند",
            countKey: "pending",
            unit: "مورد",
        },
        {
            key: "processing",
            title: "در حال پردازش",
            value: stats.processing,
            amount: stats.processing_amount,
            icon: Play,
            color: "blue",
            description: "تسویه‌هایی که در حال واریز به حساب کاربران هستند",
            countKey: "processing",
            unit: "مورد",
        },
        {
            key: "completed",
            title: "تکمیل شده",
            value: stats.completed,
            amount: stats.completed_amount,
            icon: CheckCircle,
            color: "green",
            description:
                "تسویه‌هایی که با موفقیت به حساب کاربران واریز شده‌اند",
            countKey: "completed",
            unit: "مورد",
        },
        {
            key: "failed",
            title: "ناموفق",
            value: stats.failed,
            amount: 0,
            icon: XCircle,
            color: "red",
            description:
                "تسویه‌هایی که به دلیل خطا یا اطلاعات بانکی نادرست ناموفق بوده‌اند",
            countKey: "failed",
            unit: "مورد",
        },
        {
            key: "today",
            title: "امروز",
            value: stats.today,
            amount: stats.today_amount,
            icon: Calendar,
            color: "purple",
            description: "تسویه‌های ثبت‌شده در امروز",
            countKey: "today",
            unit: "مورد",
        },
    ];

    return (
        <>
            <div className="settlement-stats-grid">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={idx}
                            className={`settlement-stat-card ${card.color} ${
                                card.urgent ? "urgent" : ""
                            }`}
                            onClick={() =>
                                setSelectedStat({
                                    key: card.key,
                                    title: card.title,
                                    icon: card.icon,
                                    description: card.description,
                                    amount: card.amount ?? 0,
                                    unit: "تومان",
                                    color: "#5b21b6",
                                    bg: "#f5f3ff",
                                    border: "#ddd6fe",
                                    breakdown: [
                                        {
                                            label: "تعداد",
                                            value: card.value,
                                            count: card.value,
                                            isCount: true,
                                        },
                                        ...(card.amount > 0
                                            ? [
                                                  {
                                                      label: "مبلغ کل",
                                                      value: card.amount,
                                                  },
                                              ]
                                            : []),
                                    ],
                                    actionLink: {
                                        label: "مشاهده لیست",
                                        href: `/admin/finance/settlements?status=${card.key === "today" ? "" : card.key}`,
                                    },
                                })
                            }
                            style={{ cursor: "pointer" }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                }
                            }}
                            title="برای مشاهده جزئیات کلیک کنید"
                        >
                            <div className="stat-icon-box">
                                <Icon size={22} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">{card.title}</span>
                                <div className="stat-value">
                                    <span>{toPersianNumber(card.value)}</span>
                                    <span className="stat-unit">مورد</span>
                                </div>
                                {card.amount > 0 && (
                                    <div className="stat-amount">
                                        {formatCompactNumber(card.amount)} تومان
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <StatsDetailModal
                isOpen={!!selectedStat}
                onClose={() => setSelectedStat(null)}
                config={selectedStat}
            />
        </>
    );
}
