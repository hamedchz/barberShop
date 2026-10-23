// resources/js/Pages/Admin/NeedsAttention/Index.jsx

import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../../Layouts/Layout";
import "../Assets/css/Finance.css";
import "../Assets/css/Transactions.css";
import "../Notifications/Assets/css/Notification.css";

import {
    AlertTriangle,
    CreditCard,
    Star,
    FileText,
    RefreshCw,
    ChevronLeft,
    Info,
    CheckCircle,
    Clock,
    AlertCircle,
    ExternalLink,
    User,
    Scissors,
    DollarSign,
    TrendingUp,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../utils/dateHelpers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";

// ============ تنظیمات نوع ============
const typeConfig = {
    dispute: {
        label: "اعتراض",
        icon: AlertTriangle,
        color: "#9a3412",
        bg: "#fff7ed",
    },
    settlement: {
        label: "تسویه",
        icon: CreditCard,
        color: "#1e40af",
        bg: "#eff6ff",
    },
    review: {
        label: "نظر",
        icon: Star,
        color: "#92400e",
        bg: "#fffbeb",
    },
    report: {
        label: "گزارش",
        icon: FileText,
        color: "#991b1b",
        bg: "#fef2f2",
    },
};

const priorityConfig = {
    high: { label: "فوری", color: "#991b1b", bg: "#fef2f2" },
    medium: { label: "متوسط", color: "#92400e", bg: "#fffbeb" },
    low: { label: "کم", color: "#065f46", bg: "#ecfdf5" },
};

export default function NeedsAttentionIndex({ items, stats, filters }) {
    const activeTab = filters.tab || "all";

    const setTab = (tab) => {
        router.get(
            "/admin/needs-attention",
            { tab },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    // ============ رندر آیتم ============
    const renderItem = (item) => {
        const typeConf = typeConfig[item.type] ?? typeConfig.report;
        const TypeIcon = typeConf.icon;
        const prioConf = priorityConfig[item.priority] ?? priorityConfig.medium;

        return (
            <Link
                key={`${item.type}-${item.id}`}
                href={item.action_url}
                className="attention-item"
            >
                <div
                    className="attention-item-icon"
                    style={{ background: typeConf.bg, color: typeConf.color }}
                >
                    <TypeIcon size={20} />
                </div>

                <div className="attention-item-content">
                    <div className="attention-item-header">
                        <div className="attention-item-title">
                            {item.title}
                            <span
                                className="attention-item-priority"
                                style={{
                                    color: prioConf.color,
                                    background: prioConf.bg,
                                }}
                            >
                                {prioConf.label}
                            </span>
                            <span
                                className="attention-item-type"
                                style={{
                                    color: typeConf.color,
                                    background: typeConf.bg,
                                }}
                            >
                                {typeConf.label}
                            </span>
                        </div>
                        <span className="attention-item-date">
                            {formatFullDateTime(item.created_at)}
                        </span>
                    </div>

                    <p className="attention-item-subtitle">{item.subtitle}</p>

                    <div className="attention-item-meta">
                        {item.user && (
                            <span className="attention-item-meta-item">
                                <User size={11} />
                                {item.user.name}
                            </span>
                        )}
                        {item.barber && (
                            <span className="attention-item-meta-item">
                                <Scissors size={11} />
                                {item.barber.name}
                            </span>
                        )}
                        {item.service && (
                            <span className="attention-item-meta-item">
                                {item.service}
                            </span>
                        )}
                        {item.rating && (
                            <span className="attention-item-meta-item">
                                <Star
                                    size={11}
                                    fill="#fbbf24"
                                    color="#fbbf24"
                                />
                                {toPersianNumber(item.rating)}/۵
                            </span>
                        )}
                        {item.amount > 0 && (
                            <span className="attention-item-meta-item amount">
                                {toPersianNumber(
                                    Number(item.amount).toLocaleString("en-US"),
                                )}{" "}
                                تومان
                            </span>
                        )}
                    </div>
                </div>

                <div className="attention-item-arrow">
                    <ChevronLeft size={16} />
                </div>
            </Link>
        );
    };

    return (
        <Layout>
            <Head title="موارد نیازمند رسیدگی" />

            <div className="admin-finance-page">
                {/* هدر */}
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div
                            className="finance-header-icon"
                            style={{
                                background:
                                    "linear-gradient(135deg, #ef4444, #dc2626)",
                            }}
                        >
                            <AlertCircle size={28} />
                        </div>
                        <div>
                            <h1>موارد نیازمند رسیدگی</h1>
                            <p>اعتراضات، تسویه‌ها، نظرات و گزارش‌های باز</p>
                        </div>
                    </div>
                    <div className="finance-header-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() =>
                                router.reload({ only: ["items", "stats"] })
                            }
                        >
                            <RefreshCw size={14} />
                            بروزرسانی
                        </button>
                    </div>
                </div>

                {/* آمار */}
                <div className="finance-stats-wrapper">
                    <div className="finance-stats-grid">
                        <div className="finance-stat-card red">
                            <div className="stat-icon-box">
                                <AlertTriangle size={22} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">اعتراضات باز</span>
                                <span
                                    className="stat-value"
                                    style={{ color: "#991b1b" }}
                                >
                                    {toPersianNumber(stats.disputes ?? 0)}
                                    <span className="stat-currency">مورد</span>
                                </span>
                            </div>
                        </div>
                        <div className="finance-stat-card blue">
                            <div className="stat-icon-box">
                                <CreditCard size={22} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">
                                    تسویه‌های در انتظار
                                </span>
                                <span
                                    className="stat-value"
                                    style={{ color: "#1e40af" }}
                                >
                                    {toPersianNumber(stats.settlements ?? 0)}
                                    <span className="stat-currency">مورد</span>
                                </span>
                            </div>
                        </div>
                        <div className="finance-stat-card yellow">
                            <div className="stat-icon-box">
                                <Star size={22} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">
                                    نظرات در انتظار
                                </span>
                                <span
                                    className="stat-value"
                                    style={{ color: "#92400e" }}
                                >
                                    {toPersianNumber(stats.reviews ?? 0)}
                                    <span className="stat-currency">مورد</span>
                                </span>
                            </div>
                        </div>
                        <div className="finance-stat-card purple">
                            <div className="stat-icon-box">
                                <DollarSign size={22} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">مجموع مبالغ</span>
                                <span
                                    className="stat-value"
                                    style={{ color: "#5b21b6" }}
                                >
                                    {formatCompactNumber(
                                        stats.total_amount ?? 0,
                                    )}
                                    <span className="stat-currency">تومان</span>
                                </span>
                            </div>
                        </div>
                        <div className="finance-stat-card orange">
                            <div className="stat-icon-box">
                                <AlertTriangle size={22} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">اولویت بالا</span>
                                <span
                                    className="stat-value"
                                    style={{ color: "#9a3412" }}
                                >
                                    {toPersianNumber(stats.high_priority ?? 0)}
                                    <span className="stat-currency">مورد</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* تب‌ها */}
                <div className="status-filters">
                    <button
                        type="button"
                        className={`filter-btn ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setTab("all")}
                    >
                        همه
                        {stats.total > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.total)}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${activeTab === "disputes" ? "active" : ""}`}
                        onClick={() => setTab("disputes")}
                    >
                        <AlertTriangle size={12} />
                        اعتراضات
                        {stats.disputes > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.disputes)}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${activeTab === "settlements" ? "active" : ""}`}
                        onClick={() => setTab("settlements")}
                    >
                        <CreditCard size={12} />
                        تسویه‌ها
                        {stats.settlements > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.settlements)}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${activeTab === "reviews" ? "active" : ""}`}
                        onClick={() => setTab("reviews")}
                    >
                        <Star size={12} />
                        نظرات
                        {stats.reviews > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.reviews)}
                            </span>
                        )}
                    </button>
                    {stats.reports > 0 && (
                        <button
                            type="button"
                            className={`filter-btn ${activeTab === "reports" ? "active" : ""}`}
                            onClick={() => setTab("reports")}
                        >
                            <FileText size={12} />
                            گزارش‌ها
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.reports)}
                            </span>
                        </button>
                    )}
                </div>

                {/* لیست */}
                <div className="finance-card">
                    <div className="finance-card-header">
                        <div className="card-icon-box red">
                            <AlertCircle size={20} />
                        </div>
                        <h2>موارد نیازمند رسیدگی</h2>
                        <span className="permissions-count">
                            {toPersianNumber(items.length || 0)} مورد
                        </span>
                    </div>
                    {items.length === 0 ? (
                        <div className="empty-state-large">
                            <CheckCircle
                                size={48}
                                style={{ color: "#10b981" }}
                            />
                            <p>هیچ موردی برای رسیدگی وجود ندارد. عالیه!</p>
                        </div>
                    ) : (
                        <div className="attention-list">
                            {items.map(renderItem)}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
