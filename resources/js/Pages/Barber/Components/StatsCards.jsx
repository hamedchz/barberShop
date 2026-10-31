import { useState } from "react";
import {
    Wallet,
    Lock,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
} from "lucide-react";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";
import StatDetailModal from "../Wallet/Components/StatsCardModal";
import { buildModalConfig } from "../Wallet/Components/statModalConfig";

export default function StatsCards({ wallet, stats, period, onPeriodChange }) {
    const [activeCardKey, setActiveCardKey] = useState(null);

    const periods = [
        { value: "7", label: "۷ روز" },
        { value: "30", label: "۳۰ روز" },
        { value: "90", label: "۹۰ روز" },
        { value: "365", label: "۱ سال" },
    ];

    // فقط اطلاعات نمایشی کارت (نه جزئیات مدال)
    const cards = [
        {
            key: "balance",
            label: "موجودی قابل برداشت",
            value: wallet.balance,
            icon: Wallet,
            color: "green",
        },
        {
            key: "locked",
            label: "در انتظار آزادسازی",
            value: wallet.locked_balance,
            icon: Lock,
            color: "orange",
        },
        {
            key: "earnings",
            label: "درآمد این دوره",
            value: stats.period_earnings,
            icon: TrendingUp,
            color: "blue",
        },
        {
            key: "penalties",
            label: "جریمه‌های این دوره",
            value: stats.period_penalties,
            icon: TrendingDown,
            color: "red",
        },
    ];

    const handleCardClick = (card) => {
        setActiveCardKey(card.key);
    };

    const closeModal = () => {
        setActiveCardKey(null);
    };

    // ساخت config مدال بر اساس کارت فعال
    const modalConfig =
        activeCardKey &&
        buildModalConfig({ key: activeCardKey }, wallet, stats, period);

    return (
        <>
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
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <button
                                key={card.key}
                                type="button"
                                className={`wallet-stat-card ${card.color} clickable`}
                                onClick={() => handleCardClick(card)}
                                title="برای مشاهده جزئیات کلیک کنید"
                            >
                                <div className="stat-icon-box">
                                    <Icon size={20} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-label">
                                        {card.label}
                                    </span>
                                    <div className="stat-value">
                                        <span>
                                            {formatCompactNumber(card.value)}
                                        </span>
                                        <span className="stat-currency">
                                            تومان
                                        </span>
                                    </div>
                                </div>
                                <div className="stat-card-chevron">
                                    <ArrowUpRight size={16} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* مدال جزئیات */}
            <StatDetailModal
                isOpen={!!activeCardKey}
                onClose={closeModal}
                config={modalConfig}
            />
        </>
    );
}
