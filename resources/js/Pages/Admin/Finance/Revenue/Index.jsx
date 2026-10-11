import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../../Layouts/Layout";
import {
    TrendingUp,
    ArrowRight,
    Coins,
    AlertTriangle,
    Users,
    Calendar,
    Download,
    Filter,
    Eye,
    BarChart3,
    PieChart,
    DollarSign,
    Percent,
    Award,
    ArrowUpRight,
    RefreshCw,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../../utils/dateHelpers";
import AdminRevenueChart from "../../Components/AdminRevenueChart";
import AdminRevenuePie from "../../Components/AdminRevenuePie";
import "../../Assets/css/Finance.css";
import "../../Assets/css/RevenuePage.css";

export default function RevenueIndex({
    revenueByType,
    dailyRevenue,
    revenueByUser,
    topBarbers,
    stats,
    filters,
}) {
    const [period, setPeriod] = useState(filters.period || "30");

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        router.get(
            route("admin.finance.revenue"),
            { period: newPeriod },
            { preserveScroll: true, preserveState: true },
        );
    };

    const formatAmount = (value) =>
        toPersianNumber(Number(value || 0).toLocaleString());

    const totalRevenue = revenueByType.reduce(
        (sum, item) => sum + item.total,
        0,
    );

    return (
        <Layout>
            <Head title="گزارش درآمد" />

            <div className="admin-finance-page">
                {/* ============ هدر ============ */}
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div className="finance-header-icon">
                            <BarChart3 size={28} />
                        </div>
                        <div>
                            <h1>گزارش درآمد پلتفرم</h1>
                            <p>تحلیل دقیق درآمد از کمیسیون و جریمه</p>
                        </div>
                    </div>

                    <div className="finance-header-actions">
                        <Link
                            href={route("admin.finance.index")}
                            className="btn-secondary"
                        >
                            <ArrowRight size={16} />
                            داشبورد مالی
                        </Link>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => window.print()}
                        >
                            <Download size={16} />
                            چاپ گزارش
                        </button>
                    </div>
                </div>

                {/* ============ فیلتر دوره ============ */}
                <div className="revenue-filters">
                    <div className="period-filter">
                        {[
                            { value: "7", label: "۷ روز" },
                            { value: "30", label: "۳۰ روز" },
                            { value: "90", label: "۹۰ روز" },
                            { value: "365", label: "۱ سال" },
                        ].map((p) => (
                            <button
                                key={p.value}
                                type="button"
                                className={`period-btn ${
                                    period === p.value ? "active" : ""
                                }`}
                                onClick={() => handlePeriodChange(p.value)}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ============ کارتهای آماری ============ */}
                <div className="revenue-stats-grid">
                    {/* درآمد کل */}
                    <div className="revenue-stat-card primary">
                        <div className="stat-icon-wrapper">
                            <Coins size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">
                                درآمد کل این دوره
                            </span>
                            <div className="stat-value">
                                <span>{formatAmount(totalRevenue)}</span>
                                <span className="stat-currency">تومان</span>
                            </div>
                            {stats?.revenue_growth !== undefined && (
                                <div
                                    className={`stat-growth ${
                                        stats.revenue_growth >= 0
                                            ? "positive"
                                            : "negative"
                                    }`}
                                >
                                    {stats.revenue_growth >= 0 ? (
                                        <ArrowUpRight size={12} />
                                    ) : (
                                        <ArrowRight size={12} />
                                    )}
                                    <span>
                                        {toPersianNumber(
                                            Math.abs(stats.revenue_growth),
                                        )}
                                        ٪ نسبت به دوره قبل
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* کمیسیون */}
                    <div className="revenue-stat-card commission">
                        <div className="stat-icon-wrapper">
                            <Percent size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">کمیسیون</span>
                            <div className="stat-value">
                                <span>
                                    {formatAmount(
                                        revenueByType.find(
                                            (r) => r.type === "commission",
                                        )?.total || 0,
                                    )}
                                </span>
                                <span className="stat-currency">تومان</span>
                            </div>
                            <span className="stat-extra">
                                {toPersianNumber(
                                    revenueByType.find(
                                        (r) => r.type === "commission",
                                    )?.count || 0,
                                )}{" "}
                                تراکنش
                            </span>
                        </div>
                    </div>

                    {/* جریمه */}
                    <div className="revenue-stat-card penalty">
                        <div className="stat-icon-wrapper">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">جریمه ها</span>
                            <div className="stat-value">
                                <span>
                                    {formatAmount(
                                        revenueByType.find(
                                            (r) => r.type === "penalty",
                                        )?.total || 0,
                                    )}
                                </span>
                                <span className="stat-currency">تومان</span>
                            </div>
                            <span className="stat-extra">
                                {toPersianNumber(
                                    revenueByType.find(
                                        (r) => r.type === "penalty",
                                    )?.count || 0,
                                )}{" "}
                                تراکنش
                            </span>
                        </div>
                    </div>

                    {/* میانگین درآمد روزانه */}
                    <div className="revenue-stat-card average">
                        <div className="stat-icon-wrapper">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">
                                میانگین درآمد روزانه
                            </span>
                            <div className="stat-value">
                                <span>
                                    {formatAmount(
                                        Math.round(
                                            totalRevenue /
                                                (dailyRevenue.length || 1),
                                        ),
                                    )}
                                </span>
                                <span className="stat-currency">تومان</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============ گرید اصلی ============ */}
                <div className="revenue-grid">
                    {/* ستون اصلی */}
                    <div className="revenue-main">
                        {/* نمودار درآمد */}
                        <div className="finance-card">
                            <div className="finance-card-header">
                                <div className="card-icon-box green">
                                    <TrendingUp size={20} />
                                </div>
                                <h2>روند درآمد</h2>
                                <span className="card-subtitle">
                                    درآمد روزانه پلتفرم
                                </span>
                            </div>
                            <AdminRevenueChart
                                revenue={dailyRevenue}
                                deposits={[]}
                                settlements={[]}
                                showOnlyRevenue
                            />
                        </div>

                        {/* تفکیک درآمد */}
                        <div className="finance-card">
                            <div className="finance-card-header">
                                <div className="card-icon-box purple">
                                    <PieChart size={20} />
                                </div>
                                <h2>تفکیک درآمد</h2>
                            </div>

                            <div className="revenue-detail-list">
                                {revenueByType.map((item) => {
                                    const percentage =
                                        totalRevenue > 0
                                            ? (item.total / totalRevenue) * 100
                                            : 0;

                                    const typeColors = {
                                        commission: "green",
                                        penalty: "red",
                                    };
                                    const color =
                                        typeColors[item.type] || "gray";

                                    return (
                                        <div
                                            key={item.type}
                                            className="revenue-detail-row"
                                        >
                                            <div className="detail-header">
                                                <div
                                                    className={`detail-icon ${color}`}
                                                >
                                                    {item.type ===
                                                    "commission" ? (
                                                        <Percent size={16} />
                                                    ) : (
                                                        <AlertTriangle
                                                            size={16}
                                                        />
                                                    )}
                                                </div>
                                                <div className="detail-info">
                                                    <span className="detail-label">
                                                        {item.type_label}
                                                    </span>
                                                    <span className="detail-count">
                                                        {toPersianNumber(
                                                            item.count,
                                                        )}{" "}
                                                        تراکنش
                                                    </span>
                                                </div>
                                                <span className="detail-amount">
                                                    {formatAmount(item.total)}{" "}
                                                    تومان
                                                </span>
                                            </div>

                                            <div className="detail-bar-wrapper">
                                                <div
                                                    className={`detail-bar ${color}`}
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>

                                            <div className="detail-percentage">
                                                {toPersianNumber(
                                                    Math.round(percentage),
                                                )}
                                                ٪ از کل درآمد
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* برترین آرایشگرها */}
                        <div className="finance-card">
                            <div className="finance-card-header">
                                <div className="card-icon-box yellow">
                                    <Award size={20} />
                                </div>
                                <h2>برترین آرایشگرها (بیشترین کمیسیون)</h2>
                            </div>

                            {revenueByUser.length === 0 ? (
                                <div className="empty-state">
                                    <Users size={32} />
                                    <span>دادهای برای نمایش وجود ندارد</span>
                                </div>
                            ) : (
                                <div className="top-barbers-list">
                                    {revenueByUser.map((item, index) => (
                                        <div
                                            key={item.user_id}
                                            className="top-barber-item"
                                        >
                                            <div
                                                className={`rank-badge rank-${
                                                    index + 1
                                                }`}
                                            >
                                                {toPersianNumber(index + 1)}
                                            </div>

                                            <div className="barber-info">
                                                {item.user?.thumbnail && (
                                                    <img
                                                        src={
                                                            item.user.thumbnail
                                                        }
                                                        alt={item.user.name}
                                                    />
                                                )}
                                                <div className="barber-details">
                                                    <span className="barber-name">
                                                        {item.user?.name ||
                                                            "نامشخص"}
                                                    </span>
                                                    <span className="barber-stats">
                                                        {toPersianNumber(
                                                            item.count,
                                                        )}{" "}
                                                        تراکنش
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="barber-revenue">
                                                <span className="revenue-amount">
                                                    {formatAmount(item.total)}
                                                </span>
                                                <span className="revenue-currency">
                                                    تومان
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* سایدبار */}
                    <div className="revenue-sidebar">
                        {/* نمودار دایرهای */}
                        <div className="finance-card">
                            <div className="finance-card-header">
                                <div className="card-icon-box purple">
                                    <PieChart size={20} />
                                </div>
                                <h2>نمای کلی</h2>
                            </div>
                            <AdminRevenuePie data={revenueByType} />
                        </div>

                        {/* خلاصه درآمد */}
                        <div className="finance-card revenue-summary-card">
                            <div className="finance-card-header">
                                <h2>خلاصه درآمد</h2>
                            </div>

                            <div className="summary-list">
                                <div className="summary-row">
                                    <span className="summary-label">
                                        درآمد کل
                                    </span>
                                    <span className="summary-value">
                                        {formatAmount(totalRevenue)} تومان
                                    </span>
                                </div>

                                <div className="summary-divider" />

                                <div className="summary-row">
                                    <span className="summary-label">
                                        کمیسیون
                                    </span>
                                    <span className="summary-value green">
                                        {formatAmount(
                                            revenueByType.find(
                                                (r) => r.type === "commission",
                                            )?.total || 0,
                                        )}{" "}
                                        تومان
                                    </span>
                                </div>

                                <div className="summary-row">
                                    <span className="summary-label">جریمه</span>
                                    <span className="summary-value red">
                                        {formatAmount(
                                            revenueByType.find(
                                                (r) => r.type === "penalty",
                                            )?.total || 0,
                                        )}{" "}
                                        تومان
                                    </span>
                                </div>

                                <div className="summary-divider" />

                                <div className="summary-row total">
                                    <span className="summary-label">
                                        میانگین روزانه
                                    </span>
                                    <span className="summary-value">
                                        {formatAmount(
                                            Math.round(
                                                totalRevenue /
                                                    (dailyRevenue.length || 1),
                                            ),
                                        )}{" "}
                                        تومان
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* راهنما */}
                        <div className="finance-card revenue-tips-card">
                            <div className="finance-card-header">
                                <h2>نکات مهم</h2>
                            </div>
                            <ul className="revenue-tips-list">
                                <li>
                                    <Percent size={14} />
                                    <span>
                                        کمیسیون از هر رزرو تکمیل‌شده کسر می‌شود.
                                    </span>
                                </li>
                                <li>
                                    <AlertTriangle size={14} />
                                    <span>
                                        جریمه‌ها از اعتراضات تاییدشده به نفع
                                        مشتری محاسبه می‌شوند.
                                    </span>
                                </li>
                                <li>
                                    <TrendingUp size={14} />
                                    <span>
                                        درآمد روزانه به‌صورت خودکار در نیمه‌شب
                                        محاسبه می‌شود.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
