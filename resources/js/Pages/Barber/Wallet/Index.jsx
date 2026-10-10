import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Lock,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Clock4,
    Plus,
    RefreshCw,
    CreditCard,
    BarChart3,
    History,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import StatsCards from "../Components/StatsCards";
import EarningsChart from "../Components/EarningsChart";
import EarningsBreakdown from "../Components/EarningsBreakdown";
import RecentTransactions from "../Components/RecentTransactions";
import WithdrawSection from "../Components/WithdrawSection";
import PendingSettlements from "../Components/PendingSettlements";
import "../Assets/css/Wallet.css";

export default function WalletIndex({
    wallet,
    stats,
    dailyEarnings,
    earningsByType,
    recentTransactions,
    pendingSettlements,
    bankInfo,
    filters,
}) {
    const [period, setPeriod] = useState(filters.period || "30");

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        router.get(
            route("barber.finance.wallet.index"),
            { period: newPeriod },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <Layout>
            <Head title="مالی من" />

            <div className="barber-wallet-page">
                {/* ============ هدر ============ */}
                <div className="wallet-header">
                    <div className="wallet-header-content">
                        <div className="wallet-header-icon">
                            <Wallet size={28} />
                        </div>
                        <div>
                            <h1>مالی من</h1>
                            <p>مدیریت درآمد، تراکنشها و برداشتها</p>
                        </div>
                    </div>

                    <div className="wallet-header-actions">
                        <Link
                            href={route("barber.finance.wallet.transactions")}
                            className="btn-secondary"
                        >
                            <History size={16} />
                            تراکنشها
                        </Link>
                        <Link
                            href={route("barber.finance.wallet.settlements")}
                            className="btn-secondary"
                        >
                            <CreditCard size={16} />
                            تسویه ها
                        </Link>
                    </div>
                </div>

                {/* ============ کارتهای آماری ============ */}
                <StatsCards
                    wallet={wallet}
                    stats={stats}
                    period={period}
                    onPeriodChange={handlePeriodChange}
                />

                {/* ============ گرید اصلی ============ */}
                <div className="wallet-grid">
                    {/* ستون راست */}
                    <div className="wallet-main">
                        {/* نمودار درآمد */}
                        <div className="wallet-card">
                            <div className="wallet-card-header">
                                <div className="card-icon-box blue">
                                    <BarChart3 size={20} />
                                </div>
                                <h2>نمودار درآمد</h2>
                                <span className="card-subtitle">
                                    {period === "7" && "۷ روز اخیر"}
                                    {period === "30" && "۳۰ روز اخیر"}
                                    {period === "90" && "۹۰ روز اخیر"}
                                    {period === "365" && "یک سال اخیر"}
                                </span>
                            </div>
                            <EarningsChart data={dailyEarnings} />
                        </div>

                        {/* تفکیک درآمد */}
                        <EarningsBreakdown data={earningsByType} />

                        {/* آخرین تراکنشها */}
                        <RecentTransactions transactions={recentTransactions} />
                    </div>

                    {/* ستون چپ */}
                    <div className="wallet-sidebar">
                        {/* برداشت */}
                        <WithdrawSection
                            wallet={wallet}
                            bankInfo={bankInfo}
                            pendingSettlements={pendingSettlements}
                        />

                        {/* تسویههای در انتظار */}
                        <PendingSettlements settlements={pendingSettlements} />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
