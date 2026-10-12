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

export default function SettlementStats({ stats }) {
    const formatAmount = (value) =>
        toPersianNumber(Number(value || 0).toLocaleString());

    const cards = [
        {
            label: "در انتظار بررسی",
            value: stats.pending,
            amount: stats.pending_amount,
            icon: Clock4,
            color: "yellow",
            urgent: stats.pending > 0,
        },
        {
            label: "در حال پردازش",
            value: stats.processing,
            amount: stats.processing_amount,
            icon: Play,
            color: "blue",
        },
        {
            label: "تکمیل شده",
            value: stats.completed,
            amount: stats.completed_amount,
            icon: CheckCircle,
            color: "green",
        },
        {
            label: "ناموفق",
            value: stats.failed,
            amount: 0,
            icon: XCircle,
            color: "red",
        },
        {
            label: "امروز",
            value: stats.today,
            amount: stats.today_amount,
            icon: Calendar,
            color: "purple",
        },
    ];

    return (
        <div className="settlement-stats-grid">
            {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div
                        key={idx}
                        className={`settlement-stat-card ${card.color} ${
                            card.urgent ? "urgent" : ""
                        }`}
                    >
                        <div className="stat-icon-box">
                            <Icon size={22} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">{card.label}</span>
                            <div className="stat-value">
                                <span>{toPersianNumber(card.value)}</span>
                                <span className="stat-unit">مورد</span>
                            </div>
                            {card.amount > 0 && (
                                <div className="stat-amount">
                                    {formatAmount(card.amount)} تومان
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
