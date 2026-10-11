import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    CreditCard,
    DollarSign,
    Users,
    Lock,
    AlertTriangle,
    Clock4,
    BarChart3,
    Receipt,
    ArrowRight,
    Eye,
    Coins,
    Ban,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../utils/dateHelpers";
import AdminRevenueChart from "../Components/AdminRevenueChart";
import AdminFinanceStats from "../Components/AdminFinanceStats";
import "../Assets/css/Finance.css";

export default function FinanceIndex({
    stats,
    dailyRevenue,
    dailyDeposits,
    dailySettlements,
    revenueByType,
    recentSettlements,
    recentTransactions,
    filters,
}) {
    const [period, setPeriod] = useState(filters.period || "30");

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        router.get(
            route("admin.finance.index"),
            { period: newPeriod },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <Layout>
            <Head title="مدیریت مالی" />

            <div className="admin-finance-page">
                {/* ============ هدر ============ */}
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div className="finance-header-icon">
                            <Coins size={28} />
                        </div>
                        <div>
                            <h1>مدیریت مالی</h1>
                            <p>نمای کلی از وضعیت مالی پلتفرم</p>
                        </div>
                    </div>

                    <div className="finance-header-actions">
                        <Link
                            href={route("admin.finance.revenue")}
                            className="btn-secondary"
                        >
                            <BarChart3 size={16} />
                            گزارش درآمد
                        </Link>
                    </div>
                </div>

                {/* ============ آمار ============ */}
                <AdminFinanceStats
                    stats={stats}
                    period={period}
                    onPeriodChange={handlePeriodChange}
                />

                {/* ============ گرید اصلی ============ */}
                <div className="finance-grid">
                    <div className="finance-main">
                        {/* نمودار درآمد */}
                        <div className="finance-card">
                            <div className="finance-card-header">
                                <div className="card-icon-box green">
                                    <TrendingUp size={20} />
                                </div>
                                <h2>نمودار درآمد پلتفرم</h2>
                            </div>
                            <AdminRevenueChart
                                revenue={dailyRevenue}
                                deposits={dailyDeposits}
                                settlements={dailySettlements}
                            />
                        </div>

                        {/* تفکیک درآمد */}
                        <div className="finance-card">
                            <div className="finance-card-header">
                                <div className="card-icon-box purple">
                                    <Coins size={20} />
                                </div>
                                <h2>تفکیک درآمد</h2>
                            </div>
                            <div className="revenue-breakdown">
                                {revenueByType.map((item) => (
                                    <div
                                        key={item.type}
                                        className="breakdown-row"
                                    >
                                        <div className="breakdown-info">
                                            <span className="breakdown-label">
                                                {item.type_label}
                                            </span>
                                            <span className="breakdown-count">
                                                {toPersianNumber(item.count)}{" "}
                                                تراکنش
                                            </span>
                                        </div>
                                        <span className="breakdown-value">
                                            {toPersianNumber(
                                                item.total.toLocaleString(),
                                            )}{" "}
                                            تومان
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* آخرین تراکنشها */}
                        <div className="finance-card">
                            <div className="finance-card-header">
                                <div className="card-icon-box blue">
                                    <Receipt size={20} />
                                </div>
                                <h2>آخرین تراکنشها</h2>
                                <Link
                                    href={route("admin.finance.transactions")}
                                    className="card-link"
                                >
                                    مشاهده همه
                                    <Eye size={14} />
                                </Link>
                            </div>
                            <div className="admin-transactions-list">
                                {recentTransactions.map((t) => (
                                    <div
                                        key={t.id}
                                        className="admin-transaction-item"
                                    >
                                        <div
                                            className={`transaction-icon ${t.direction}`}
                                        >
                                            {t.direction === "credit" ? (
                                                <TrendingUp size={14} />
                                            ) : (
                                                <TrendingDown size={14} />
                                            )}
                                        </div>
                                        <div className="transaction-content">
                                            <span className="transaction-user">
                                                {t.user?.name || "—"}
                                            </span>
                                            <span className="transaction-type">
                                                {t.type_label}
                                            </span>
                                        </div>
                                        <div className="transaction-amount">
                                            <span
                                                className={`amount ${t.direction}`}
                                            >
                                                {t.direction === "credit"
                                                    ? "+"
                                                    : "-"}
                                                {toPersianNumber(
                                                    t.amount.toLocaleString(),
                                                )}
                                            </span>
                                            <span className="amount-date">
                                                {formatFullDateTime(
                                                    t.created_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* سایدبار */}
                    <div className="finance-sidebar">
                        {/* لینکهای سریع */}
                        <div className="finance-card">
                            <div className="finance-card-header">
                                <h2>دسترسی سریع</h2>
                            </div>
                            <div className="quick-links-list">
                                <Link
                                    href={route(
                                        "admin.finance.settlements.index",
                                    )}
                                    className="quick-link-item"
                                >
                                    <div className="quick-link-icon warning">
                                        <CreditCard size={18} />
                                    </div>
                                    <div className="quick-link-content">
                                        <span className="quick-link-title">
                                            درخواستهای برداشت
                                        </span>
                                        <span className="quick-link-desc">
                                            {toPersianNumber(
                                                stats.pending_settlements,
                                            )}{" "}
                                            در انتظار
                                        </span>
                                    </div>
                                    <ArrowRight size={16} />
                                </Link>

                                <Link
                                    href={route("admin.finance.deposits")}
                                    className="quick-link-item"
                                >
                                    <div className="quick-link-icon success">
                                        <Wallet size={18} />
                                    </div>
                                    <div className="quick-link-content">
                                        <span className="quick-link-title">
                                            شارژهای کیف پول
                                        </span>
                                        <span className="quick-link-desc">
                                            مشاهده همه شارژها
                                        </span>
                                    </div>
                                    <ArrowRight size={16} />
                                </Link>

                                <Link
                                    href={route("admin.finance.transactions")}
                                    className="quick-link-item"
                                >
                                    <div className="quick-link-icon info">
                                        <Receipt size={18} />
                                    </div>
                                    <div className="quick-link-content">
                                        <span className="quick-link-title">
                                            تراکنشها
                                        </span>
                                        <span className="quick-link-desc">
                                            تمام تراکنشهای سیستم
                                        </span>
                                    </div>
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>

                        {/* تسویههای در انتظار */}
                        {stats.pending_settlements > 0 && (
                            <div className="finance-card warning-card">
                                <div className="finance-card-header">
                                    <div className="card-icon-box orange">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <h2>نیازمند بررسی</h2>
                                </div>
                                <div className="pending-alert">
                                    <div className="pending-count">
                                        {toPersianNumber(
                                            stats.pending_settlements,
                                        )}
                                    </div>
                                    <p>درخواست برداشت در انتظار بررسی</p>
                                    <div className="pending-amount">
                                        مبلغ کل:{" "}
                                        {toPersianNumber(
                                            stats.pending_settlements_amount.toLocaleString(),
                                        )}{" "}
                                        تومان
                                    </div>
                                    <Link
                                        href={route(
                                            "admin.finance.settlements.index",
                                        )}
                                        className="btn-primary full-width"
                                    >
                                        <CreditCard size={16} />
                                        بررسی درخواستها
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* آخرین تسویهها */}
                        <div className="finance-card">
                            <div className="finance-card-header">
                                <h2>آخرین تسویه ها</h2>
                            </div>
                            <div className="recent-settlements">
                                {recentSettlements.map((s) => (
                                    <Link
                                        key={s.id}
                                        href={route(
                                            "admin.finance.settlements.show",
                                            s.id,
                                        )}
                                        className="recent-settlement-item"
                                    >
                                        <div className="settlement-user">
                                            {s.user?.thumbnail && (
                                                <img
                                                    src={s.user.thumbnail}
                                                    alt={s.user.name}
                                                />
                                            )}
                                            <div className="user-info">
                                                <span className="user-name">
                                                    {s.user?.name || "—"}
                                                </span>
                                                <span className="settlement-date">
                                                    {formatFullDateTime(
                                                        s.created_at,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="settlement-amount">
                                            {toPersianNumber(
                                                s.amount.toLocaleString(),
                                            )}{" "}
                                            تومان
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
