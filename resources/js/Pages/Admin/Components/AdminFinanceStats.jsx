import { useState } from "react";
import {
    Wallet,
    DollarSign,
    Lock,
    CreditCard,
    TrendingUp,
    AlertTriangle,
    Info,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";
import CardDetailModal from "../Finance/Components/CardDetailModal";
export default function AdminFinanceStats({ stats, period, onPeriodChange }) {
    const [selectedStat, setSelectedStat] = useState(null);

    const periods = [
        { value: "7", label: "۷ روز" },
        { value: "30", label: "۳۰ روز" },
        { value: "90", label: "۹۰ روز" },
        { value: "365", label: "۱ سال" },
    ];

    const cards = [
        {
            key: "total_balance",
            label: "مجموع موجودی کیف پول‌ها",
            amount: stats.total_balance ?? 0,
            unit: "تومان",
            isCount: false,
            icon: Wallet,
            color: "green",
            description: "مجموع موجودی قابل برداشت همه کیف پول‌های کاربران",
        },
        {
            key: "total_locked",
            label: "مبالغ قفل‌شده",
            amount: stats.total_locked ?? 0,
            unit: "تومان",
            isCount: false,
            icon: Lock,
            color: "orange",
            description:
                "مبالغی که به دلیل دوره نگهداری (release_at) هنوز قابل برداشت نیستند",
        },
        {
            key: "period_revenue",
            label: "درآمد این دوره",
            amount: stats.period_revenue ?? 0,
            unit: "تومان",
            isCount: false,
            icon: TrendingUp,
            color: "purple",
            description: `مجموع درآمد پلتفرم در ${period} روز گذشته`,
        },
        {
            key: "pending_settlements_amount",
            label: "تسویه‌های در انتظار",
            amount: stats.pending_settlements_amount ?? 0,
            unit: "تومان",
            isCount: false,
            icon: AlertTriangle,
            color: "yellow",
            extra: `${toPersianNumber(stats.pending_settlements ?? 0)} درخواست`,
            description: "مبلغ درخواست‌های تسویه که هنوز پرداخت نشده‌اند",
            breakdown: [
                {
                    label: "تعداد درخواست",
                    value: stats.pending_settlements ?? 0,
                    isCount: true,
                },
            ],
        },
        {
            key: "total_deposits",
            label: "مجموع شارژها",
            amount: stats.total_deposits ?? 0,
            unit: "تومان",
            isCount: false,
            icon: Wallet,
            color: "blue",
            description: "مجموع شارژهای موفق کیف پول کاربران",
        },
        {
            key: "total_settlements",
            label: "مجموع تسویه‌ها",
            amount: stats.total_settlements ?? 0,
            unit: "تومان",
            isCount: false,
            icon: CreditCard,
            color: "indigo",
            description: "مجموع تسویه‌های انجام‌شده به کاربران",
        },
    ];

    const handleCardClick = (card) => {
        setSelectedStat(card);
    };

    return (
        <>
            <div className="finance-stats-wrapper">
                <div className="finance-stats-hint">
                    <Info size={14} />
                    <span>
                        برای مشاهده مبلغ دقیق و جزئیات، روی هر کارت کلیک کنید
                    </span>
                </div>

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

                <div className="finance-stats-grid">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.key}
                                className={`finance-stat-card ${card.color} has-hint`}
                                onClick={() => handleCardClick(card)}
                                data-hint="کلیک کنید تا مبلغ دقیق را ببینید"
                                style={{ cursor: "pointer" }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        handleCardClick(card);
                                    }
                                }}
                            >
                                <div className="stat-icon-box">
                                    <Icon size={22} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-label">
                                        {card.label}
                                        {/* <Info
                                            size={11}
                                            className="stat-label-hint-icon"
                                        /> */}
                                    </span>
                                    <div className="stat-value">
                                        <span>
                                            {formatCompactNumber(card.amount)}
                                        </span>
                                        <span className="stat-currency">
                                            {card.unit}
                                        </span>
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

            {/* ============ Modal جزئیات ============ */}
            <CardDetailModal
                isOpen={!!selectedStat}
                onClose={() => setSelectedStat(null)}
                config={selectedStat}
            />
        </>
    );
}
