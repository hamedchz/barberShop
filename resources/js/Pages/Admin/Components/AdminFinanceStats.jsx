import {
    Wallet,
    DollarSign,
    Lock,
    CreditCard,
    TrendingUp,
    AlertTriangle,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function AdminFinanceStats({ stats, period, onPeriodChange }) {
    const periods = [
        { value: "7", label: "۷ روز" },
        { value: "30", label: "۳۰ روز" },
        { value: "90", label: "۹۰ روز" },
        { value: "365", label: "۱ سال" },
    ];

    const cards = [
        {
            label: "مجموع موجودی کیف پول ها",
            value: stats.total_balance,
            icon: Wallet,
            color: "green",
        },
        {
            label: "مبالغ قفل شده",
            value: stats.total_locked,
            icon: Lock,
            color: "orange",
        },
        {
            label: "درآمد این دوره",
            value: stats.period_revenue,
            icon: TrendingUp,
            color: "purple",
        },
        {
            label: "تسویه های در انتظار",
            value: stats.pending_settlements_amount,
            icon: AlertTriangle,
            color: "yellow",
            extra: `${toPersianNumber(stats.pending_settlements)} درخواست`,
        },
        {
            label: "مجموع شارژها",
            value: stats.total_deposits,
            icon: Wallet,
            color: "blue",
        },
        {
            label: "مجموع تسویه ها",
            value: stats.total_settlements,
            icon: CreditCard,
            color: "indigo",
        },
    ];

    return (
        <div className="finance-stats-wrapper">
            <div className="period-filter">
                {periods.map((p) => (
                    <button
                        key={p.value}
                        type="button"
                        className={`period-btn ${period === p.value ? "active" : ""}`}
                        onClick={() => onPeriodChange(p.value)}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            <div className="finance-stats-grid">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={idx}
                            className={`finance-stat-card ${card.color}`}
                        >
                            <div className="stat-icon-box">
                                <Icon size={22} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">{card.label}</span>
                                <div className="stat-value">
                                    <span>
                                        {toPersianNumber(
                                            card.value.toLocaleString(),
                                        )}
                                    </span>
                                    <span className="stat-currency">تومان</span>
                                </div>
                                {card.extra && (
                                    <span className="stat-extra">
                                        {card.extra}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
