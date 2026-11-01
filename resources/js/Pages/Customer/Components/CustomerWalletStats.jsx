import { useState } from "react";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Receipt,
    ArrowUpRight,
    Info,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import StatDetailModal from "../Wallet/Components/StatsCardModal";
import { buildCustomerModalConfig } from "../Wallet/Components/customerModalConfig";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";

export default function CustomerWalletStats({
    wallet,
    stats,
    period,
    onPeriodChange,
}) {
    const [activeCardKey, setActiveCardKey] = useState(null);

    const periods = [
        { value: "7", label: "۷ روز" },
        { value: "30", label: "۳۰ روز" },
        { value: "90", label: "۹۰ روز" },
        { value: "365", label: "۱ سال" },
    ];

    const cards = [
        {
            key: "balance",
            label: "موجودی کیف پول",
            value: wallet.balance,
            icon: Wallet,
            color: "green",
        },
        {
            key: "paid",
            label: "پرداخت‌های این دوره",
            value: stats.period_paid,
            icon: TrendingUp,
            color: "blue",
        },
        {
            key: "refunded",
            label: "بازگشت وجه این دوره",
            value: stats.period_refunded,
            icon: TrendingDown,
            color: "purple",
        },
        {
            key: "bookings",
            label: "تعداد رزروها",
            value: stats.total_bookings,
            icon: Receipt,
            color: "orange",
            isCount: true,
        },
    ];

    const handleCardClick = (card) => {
        setActiveCardKey(card.key);
    };

    const closeModal = () => {
        setActiveCardKey(null);
    };

    const modalConfig =
        activeCardKey &&
        buildCustomerModalConfig(activeCardKey, wallet, stats, period);

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
                <div className="finance-stats-hint">
                    <Info size={14} />
                    <span>
                        برای مشاهده مبلغ دقیق و جزئیات، روی هر کارت کلیک کنید
                    </span>
                </div>
                {/* کارت‌ها */}
                <div className="wallet-stats-grid">
                    {cards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <button
                                key={idx}
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
                                        {!card.isCount && (
                                            <span className="stat-currency">
                                                تومان
                                            </span>
                                        )}
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
