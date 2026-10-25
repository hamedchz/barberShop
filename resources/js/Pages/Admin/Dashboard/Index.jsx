// resources/js/Pages/Admin/Dashboard/Index.jsx

import React, { useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import "../Assets/css/Finance.css";
import "../Assets/css/Transactions.css";
import "./Assets/css/Dashboard.css";
import DashboardChart from "./Components/DashboardChart";

import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    Calendar,
    Users,
    Star,
    CreditCard,
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle,
    ArrowRight,
    Bell,
    ChevronLeft,
    DollarSign,
    ShoppingBag,
    UserCheck,
    MessageSquare,
    Wallet,
    RefreshCw,
    ExternalLink,
    Activity,
    Award,
    Eye,
    Settings,
    Zap,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import {
    formatFullDateTime,
    formatFullDateWithoutTime,
} from "../../../utils/dateHelpers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";

// ============ آیکون و رنگ هر نوع ============
const typeConfig = {
    booking: { icon: Calendar, color: "#1e40af", bg: "#eff6ff" },
    review: { icon: Star, color: "#92400e", bg: "#fffbeb" },
    settlement: { icon: CreditCard, color: "#5b21b6", bg: "#f5f3ff" },
    dispute: { icon: AlertTriangle, color: "#991b1b", bg: "#fef2f2" },
};

const periods = [
    { value: 7, label: "۷ روز" },
    { value: 30, label: "۳۰ روز" },
    { value: 90, label: "۹۰ روز" },
    { value: 365, label: "۱ سال" },
];

export default function DashboardIndex({
    stats,
    chart,
    recent,
    topBarbers,
    attention,
    notifications,
    period,
    auth,
}) {
    // ============ تغییر دوره ============
    const setPeriod = (newPeriod) => {
        router.get(
            "/admin/dashboard",
            { period: newPeriod },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    // ============ کارت‌های آماری ============
    const statCards = [
        {
            key: "revenue",
            title: "درآمد این دوره",
            value: formatCompactNumber(stats.revenue.value),
            unit: "تومان",
            icon: DollarSign,
            color: "#065f46",
            bg: "#ecfdf5",
            border: "#a7f3d0",
            change: stats.revenue.change,
            subtitle: `از کمیسیون و جریمه`,
            href: "/admin/finance/revenue",
        },
        {
            key: "bookings",
            title: "رزروها",
            value: toPersianNumber(stats.bookings.value),
            unit: "مورد",
            icon: Calendar,
            color: "#1e40af",
            bg: "#eff6ff",
            border: "#bfdbfe",
            change: stats.bookings.change,
            subtitle: `${toPersianNumber(stats.bookings.completed)} تکمیل شده`,
            href: "/admin/bookings",
        },
        {
            key: "payments",
            title: "پرداخت‌های درگاه",
            value: formatCompactNumber(stats.payments.value),
            unit: "تومان",
            icon: CreditCard,
            color: "#5b21b6",
            bg: "#f5f3ff",
            border: "#ddd6fe",
            change: stats.payments.change,
            subtitle: "پرداخت موفق",
            href: "/admin/finance/payments",
        },
        {
            key: "users",
            title: "کاربران جدید",
            value: toPersianNumber(stats.users.value),
            unit: "نفر",
            icon: Users,
            color: "#9a3412",
            bg: "#fff7ed",
            border: "#fed7aa",
            change: stats.users.change,
            subtitle: "ثبت‌نام در این دوره",
            href: "/admin/users",
        },
    ];

    // ============ نیازمند رسیدگی ============
    const attentionItems = [
        {
            key: "disputes",
            title: "اعتراضات باز",
            value: attention.disputes,
            icon: AlertTriangle,
            color: "#991b1b",
            bg: "#fef2f2",
            href: "/admin/needs-attention?tab=disputes",
        },
        {
            key: "reviews",
            title: "نظرات در انتظار",
            value: attention.pending_reviews,
            icon: Star,
            color: "#92400e",
            bg: "#fffbeb",
            href: "/admin/reviews?status=pending",
        },
        {
            key: "settlements",
            title: "تسویه‌های در انتظار",
            value: attention.pending_settlements,
            icon: CreditCard,
            color: "#1e40af",
            bg: "#eff6ff",
            href: "/admin/finance/settlements?status=pending",
        },
        {
            key: "failed",
            title: "پرداخت‌های ناموفق امروز",
            value: attention.failed_payments,
            icon: XCircle,
            color: "#6b7280",
            bg: "#f3f4f6",
            href: "/admin/finance/payments?status=failed",
        },
    ];

    const totalAttention = attentionItems.reduce((sum, i) => sum + i.value, 0);

    return (
        <Layout>
            <Head title="داشبورد" />

            <div className="admin-dashboard">
                {/* ============ هدر ============ */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">
                            <LayoutDashboard size={28} />
                            داشبورد
                        </h1>
                        <p className="dashboard-subtitle">
                            خوش آمدید، {auth?.user?.name ?? "ادمین"}
                        </p>
                    </div>

                    <div className="dashboard-header-actions">
                        {/* دوره */}
                        <div className="dashboard-period-filter">
                            {periods.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    className={`dashboard-period-btn ${period === p.value ? "active" : ""}`}
                                    onClick={() => setPeriod(p.value)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => router.reload()}
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>

                {/* ============ کارت‌های آماری ============ */}
                <div className="dashboard-stats-grid">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        const isPositive = (card.change ?? 0) >= 0;

                        return (
                            <Link
                                key={card.key}
                                href={card.href}
                                className="dashboard-stat-card"
                                style={{
                                    "--card-color": card.color,
                                    "--card-bg": card.bg,
                                    "--card-border": card.border,
                                }}
                            >
                                <div
                                    className="dashboard-stat-icon"
                                    style={{
                                        background: card.bg,
                                        color: card.color,
                                    }}
                                >
                                    <Icon size={22} />
                                </div>

                                <div className="dashboard-stat-content">
                                    <span className="dashboard-stat-label">
                                        {card.title}
                                    </span>
                                    <div className="dashboard-stat-value">
                                        <span>{card.value}</span>
                                        <span className="dashboard-stat-unit">
                                            {card.unit}
                                        </span>
                                    </div>
                                    <div className="dashboard-stat-footer">
                                        {card.change !== undefined && (
                                            <span
                                                className={`dashboard-stat-change ${isPositive ? "positive" : "negative"}`}
                                            >
                                                {isPositive ? (
                                                    <TrendingUp size={11} />
                                                ) : (
                                                    <TrendingDown size={11} />
                                                )}
                                                {toPersianNumber(
                                                    Math.abs(card.change),
                                                )}
                                                ٪
                                            </span>
                                        )}
                                        <span className="dashboard-stat-subtitle">
                                            {card.subtitle}
                                        </span>
                                    </div>
                                </div>

                                <ChevronLeft
                                    size={16}
                                    className="dashboard-stat-arrow"
                                />
                            </Link>
                        );
                    })}
                </div>

                {/* ============ گرید اصلی ============ */}
                <div className="dashboard-main-grid">
                    {/* ============ نمودار ============ */}
                    <div className="dashboard-card dashboard-chart-card">
                        <div className="dashboard-card-header">
                            <div>
                                <h2>
                                    <Activity size={20} />
                                    نمودار درآمد و رزرو
                                </h2>
                                <p>روند {period} روز گذشته</p>
                            </div>
                        </div>

                        <DashboardChart
                            labels={chart.labels}
                            revenue={chart.revenue}
                            bookings={chart.bookings}
                        />
                    </div>

                    {/* ============ نیازمند رسیدگی ============ */}
                    <div className="dashboard-card dashboard-attention-card">
                        <div className="dashboard-card-header">
                            <div>
                                <h2>
                                    <AlertTriangle size={20} />
                                    نیازمند رسیدگی
                                </h2>
                                <p>
                                    {totalAttention > 0
                                        ? `${toPersianNumber(totalAttention)} مورد`
                                        : "همه چیز مرتب است"}
                                </p>
                            </div>

                            {totalAttention > 0 && (
                                <span className="dashboard-attention-badge">
                                    {toPersianNumber(totalAttention)}
                                </span>
                            )}
                        </div>

                        <div className="dashboard-attention-list">
                            {attentionItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.key}
                                        href={item.href}
                                        className={`dashboard-attention-item ${item.value > 0 ? "active" : ""}`}
                                    >
                                        <div
                                            className="dashboard-attention-icon"
                                            style={{
                                                background: item.bg,
                                                color: item.color,
                                            }}
                                        >
                                            <Icon size={16} />
                                        </div>
                                        <span className="dashboard-attention-label">
                                            {item.title}
                                        </span>
                                        <span className="dashboard-attention-count">
                                            {toPersianNumber(item.value)}
                                        </span>
                                        <ChevronLeft
                                            size={14}
                                            className="dashboard-attention-arrow"
                                        />
                                    </Link>
                                );
                            })}
                        </div>

                        <Link
                            href="/admin/needs-attention"
                            className="dashboard-view-all"
                        >
                            <Eye size={14} />
                            مشاهده همه
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* ============ آخرین فعالیت‌ها ============ */}
                    <div className="dashboard-card dashboard-recent-card">
                        <div className="dashboard-card-header">
                            <div>
                                <h2>
                                    <Clock size={20} />
                                    آخرین فعالیت‌ها
                                </h2>
                                <p>آخرین رخدادهای سیستم</p>
                            </div>
                        </div>

                        <div className="dashboard-recent-list">
                            {recent.length === 0 ? (
                                <div className="dashboard-empty">
                                    <Activity size={32} />
                                    <span>هیچ فعالیتی وجود ندارد</span>
                                </div>
                            ) : (
                                recent.slice(0, 7).map((item, i) => {
                                    const config =
                                        typeConfig[item.type] ??
                                        typeConfig.booking;
                                    const Icon = config.icon;

                                    return (
                                        <Link
                                            key={`${item.type}-${item.id}-${i}`}
                                            href={item.url}
                                            className="dashboard-recent-item"
                                        >
                                            <div
                                                className="dashboard-recent-icon"
                                                style={{
                                                    background: config.bg,
                                                    color: config.color,
                                                }}
                                            >
                                                <Icon size={14} />
                                            </div>
                                            <div className="dashboard-recent-content">
                                                <span className="dashboard-recent-title">
                                                    {item.title}
                                                </span>
                                                <span className="dashboard-recent-subtitle">
                                                    {item.subtitle}
                                                </span>
                                            </div>
                                            <span className="dashboard-recent-time">
                                                {formatFullDateTime(
                                                    item.created_at,
                                                )}
                                            </span>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* ============ برترین آرایشگرها ============ */}
                    <div className="dashboard-card dashboard-barbers-card">
                        <div className="dashboard-card-header">
                            <div>
                                <h2>
                                    <Award size={20} />
                                    برترین آرایشگرها
                                </h2>
                                <p>بر اساس تعداد رزرو در این دوره</p>
                            </div>
                        </div>

                        <div className="dashboard-barbers-list">
                            {topBarbers.length === 0 ? (
                                <div className="dashboard-empty">
                                    <Users size={32} />
                                    <span>آرایشگری در این دوره فعال نبوده</span>
                                </div>
                            ) : (
                                topBarbers.map((barber, index) => (
                                    <Link
                                        key={barber.id}
                                        href={`/admin/barbers/${barber.slug}/detail`}
                                        className="dashboard-barber-item"
                                    >
                                        <div className="dashboard-barber-rank">
                                            {index === 0
                                                ? "🥇"
                                                : index === 1
                                                  ? "🥈"
                                                  : index === 2
                                                    ? "🥉"
                                                    : toPersianNumber(
                                                          index + 1,
                                                      )}
                                        </div>

                                        <div className="dashboard-barber-avatar">
                                            {barber.avatar ? (
                                                <img
                                                    src={barber.avatar}
                                                    alt={barber.name}
                                                />
                                            ) : (
                                                barber.name
                                                    ?.charAt(0)
                                                    .toUpperCase()
                                            )}
                                        </div>

                                        <div className="dashboard-barber-info">
                                            <span className="dashboard-barber-name">
                                                {barber.name}
                                            </span>
                                            <div className="dashboard-barber-meta">
                                                <span className="dashboard-barber-rating">
                                                    <Star
                                                        size={10}
                                                        fill="#fbbf24"
                                                        color="#fbbf24"
                                                    />
                                                    {toPersianNumber(
                                                        barber.rating,
                                                    )}
                                                </span>
                                                <span className="dashboard-barber-bookings">
                                                    {toPersianNumber(
                                                        barber.bookings,
                                                    )}{" "}
                                                    رزرو
                                                </span>
                                            </div>
                                        </div>

                                        <ChevronLeft
                                            size={14}
                                            className="dashboard-barber-arrow"
                                        />
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
