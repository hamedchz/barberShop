import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PublicLayout from "../Layouts/PublicLayout";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Receipt,
    RefreshCw,
    ArrowUpRight,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import CustomerWalletStats from "../Components/CustomerWalletStats";
import CustomerPaymentsChart from "../Components/CustomerPaymentsChart";
import RecentTransactions from "../Components/RecentTransactions";
import WithdrawSection from "../Components/WithdrawSection";
import "../Assets/Wallet.css";

export default function WalletIndex({
    wallet,
    stats,
    dailyPayments,
    recentTransactions,
    pendingSettlements,
    filters,
}) {
    const [period, setPeriod] = useState(filters.period || "30");

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        router.get(
            route("customer.finance.wallet.index"),
            { period: newPeriod },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <PublicLayout>
            <Head title="مالی من" />

            <div className="customer-wallet-page">
                {/* ============ هدر ============ */}
                <div className="wallet-header">
                    <div className="wallet-header-content">
                        <div className="wallet-header-icon">
                            <Wallet size={28} />
                        </div>
                        <div>
                            <h1>مالی من</h1>
                            <p>مدیریت پرداختها، بازگشت وجه و کیف پول</p>
                        </div>
                    </div>

                    <div className="wallet-header-actions">
                        <Link
                            href={route("customer.finance.wallet.payments")}
                            className="btn-secondary"
                        >
                            <Receipt size={16} />
                            پرداختهای من
                        </Link>
                        <Link
                            href={route("customer.finance.wallet.transactions")}
                            className="btn-secondary"
                        >
                            <RefreshCw size={16} />
                            تراکنشها
                        </Link>
                    </div>
                </div>

                {/* ============ آمار ============ */}
                <CustomerWalletStats
                    wallet={wallet}
                    stats={stats}
                    period={period}
                    onPeriodChange={handlePeriodChange}
                />

                {/* ============ گرید ============ */}
                <div className="wallet-grid">
                    <div className="wallet-main">
                        <div className="wallet-card">
                            <div className="wallet-card-header">
                                <h2>نمودار پرداختهای من</h2>
                            </div>
                            <CustomerPaymentsChart data={dailyPayments} />
                        </div>

                        <RecentTransactions transactions={recentTransactions} />
                    </div>

                    <div className="wallet-sidebar">
                        <WithdrawSection
                            wallet={wallet}
                            pendingSettlements={pendingSettlements}
                        />
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
