import { Wallet, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function CustomerWalletStats({
    wallet,
    stats,
    period,
    onPeriodChange,
}) {
    const periods = [
        { value: "7", label: "۷ روز" },
        { value: "30", label: "۳۰ روز" },
        { value: "90", label: "۹۰ روز" },
        { value: "365", label: "۱ سال" },
    ];

    const cards = [
        {
            label: "موجودی کیف پول",
            value: wallet.balance,
            icon: Wallet,
            color: "green",
        },
        {
            label: "پرداخت‌های این دوره",
            value: stats.period_paid,
            icon: TrendingUp,
            color: "blue",
        },
        {
            label: "بازگشت وجه این دوره",
            value: stats.period_refunded,
            icon: TrendingDown,
            color: "purple",
        },
        {
            label: "تعداد رزروها",
            value: stats.total_bookings,
            icon: Receipt,
            color: "orange",
            isCount: true,
        },
    ];

    return (
        <div className="wallet-stats-wrapper">
            {/* فیلتر دوره */}
            <div className="period-filter">
                {periods.map((p) => (
                    <button
                        key={p.value}
                        type="button"
                        className={`period-btn ${
                            period === p.value ? "active" : ""
                        }`}
                        onClick={() => onPeriodChange(p.value)}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* کارت‌ها */}
            <div className="wallet-stats-grid">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={idx}
                            className={`wallet-stat-card ${card.color}`}
                        >
                            <div className="stat-icon-box">
                                <Icon size={20} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">{card.label}</span>
                                <div className="stat-value">
                                    <span>
                                        {toPersianNumber(
                                            card.value.toLocaleString(),
                                        )}
                                    </span>
                                    {!card.isCount && (
                                        <span className="stat-currency">
                                            تومان
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
