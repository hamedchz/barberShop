import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../../Layouts/Layout";
import SearchComponent from "../../../../Components/Search";
import PersianDatePicker from "../../../../Components/PersianDatePicker";
import "../../Assets/css/Finance.css";
import "../../Assets/css/Transactions.css";
import Pagination from "../../Components/Pagination";
import StatsDetailModal from "../../Components/StatsDetailModal";

import {
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    Filter,
    X,
    User,
    ExternalLink,
    RefreshCw,
    TrendingUp,
    DollarSign,
    Receipt,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Download,
    FileSpreadsheet,
    FileText,
    Ban,
    Calendar,
    Hash,
    Wallet,
    Info,
    Banknote,
    ShieldCheck,
    Percent,
    ArrowDownLeft,
    ArrowUpRight,
} from "lucide-react";

import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../../utils/dateHelpers";
import { formatCompactNumber } from "../../../../Constants/formatCompactNumber";

// ============ تنظیمات وضعیت ============
const statusConfig = {
    pending: {
        label: "در انتظار",
        icon: Clock,
        color: "#92400e",
        bg: "#fffbeb",
    },
    success: {
        label: "موفق",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
    },
    failed: {
        label: "ناموفق",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
    },
    cancelled: {
        label: "لغو شده",
        icon: Ban,
        color: "#6b7280",
        bg: "#f3f4f6",
    },
    refunded: {
        label: "برگشت داده شده",
        icon: ArrowDownLeft,
        color: "#5b21b6",
        bg: "#f5f3ff",
    },
};

const gatewayConfig = {
    zarinpal: { label: "زرین‌پال", color: "#fbbf24", bg: "#fef3c7" },
    idpay: { label: "آیدی‌پی", color: "#3b82f6", bg: "#dbeafe" },
    payping: { label: "پی‌پینگ", color: "#10b981", bg: "#d1fae5" },
    nextpay: { label: "نکست‌پی", color: "#8b5cf6", bg: "#ede9fe" },
};

// ============ کامپوننت ============
export default function PaymentsIndex({
    auth,
    payments,
    stats,
    filters,
    gateways = [],
    statuses = [],
    users = [],
}) {
    const [selectedStat, setSelectedStat] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);

    const [localFilters, setLocalFilters] = useState({
        gateway: filters.gateway || "",
        status: filters.status || "",
        user_id: filters.user_id || "",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
    });

    // ============ شمارش فیلترهای فعال ============
    const activeFiltersCount =
        Object.values(localFilters).filter(
            (v) => v !== null && v !== "" && v !== undefined,
        ).length + (searchTerm ? 1 : 0);

    // ============ جستجو ============
    const handleSearch = (query) => {
        setIsSearching(true);
        const merged = { ...localFilters, search: query };
        const cleaned = Object.fromEntries(
            Object.entries(merged).filter(
                ([, v]) => v !== null && v !== "" && v !== undefined,
            ),
        );
        router.get("/admin/finance/payments", cleaned, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
    };

    // ============ اعمال فیلتر ============
    const applyFilters = (overrides = {}) => {
        const merged = { ...localFilters, search: searchTerm, ...overrides };
        const cleaned = Object.fromEntries(
            Object.entries(merged).filter(
                ([, v]) => v !== null && v !== "" && v !== undefined,
            ),
        );
        router.get("/admin/finance/payments", cleaned, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    // ============ پاک کردن فیلترها ============
    const clearFilters = () => {
        const empty = {
            gateway: "",
            status: "",
            user_id: "",
            date_from: "",
            date_to: "",
        };
        setLocalFilters(empty);
        setSearchTerm("");
        router.get("/admin/finance/payments", {}, { preserveScroll: true });
    };

    // ============ تب فعال ============
    const activeTab = (() => {
        if (localFilters.status === "success") return "success";
        if (localFilters.status === "failed") return "failed";
        if (localFilters.status === "pending") return "pending";
        if (localFilters.status === "refunded") return "refunded";
        return "all";
    })();

    // ============ خروجی ============
    const exportUrl = (format) => {
        const merged = { ...localFilters, search: searchTerm, format };
        const params = new URLSearchParams(
            Object.fromEntries(
                Object.entries(merged).filter(
                    ([, v]) => v !== null && v !== "" && v !== undefined,
                ),
            ),
        );
        return `/admin/finance/payments/export?${params.toString()}`;
    };

    // ============ رندر آمار ============
    const renderStats = () => (
        <div className="finance-stats-wrapper">
            <div className="finance-stats-hint">
                <Info size={14} />
                <span>
                    برای مشاهده مبلغ دقیق و جزئیات، روی هر کارت کلیک کنید
                </span>
            </div>
            <div className="finance-stats-grid">
                {/* مجموع مبلغ */}
                <div
                    className="finance-stat-card green"
                    onClick={() =>
                        setSelectedStat({
                            key: "total_amount",
                            title: "مجموع مبلغ موفق",
                            icon: TrendingUp,
                            color: "#065f46",
                            bg: "#ecfdf5",
                            border: "#a7f3d0",
                            amount: stats.total_amount ?? 0,
                            unit: "تومان",
                            description:
                                "مجموع پرداخت‌های موفق از طریق درگاه‌های بانکی",
                            breakdown: (stats.gateway_breakdown ?? []).map(
                                (g) => ({
                                    label: g.label,
                                    value: g.value,
                                    count: g.count,
                                }),
                            ),
                            actionLink: {
                                label: "مشاهده پرداخت‌های موفق",
                                href: "/admin/finance/payments?status=success",
                            },
                        })
                    }
                    style={{ cursor: "pointer" }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            // همون منطق onClick
                        }
                    }}
                    title="برای مشاهده مبلغ دقیق کلیک کنید"
                >
                    <div className="stat-icon-box">
                        <TrendingUp size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">مجموع مبلغ موفق</span>
                        <span className="stat-value">
                            {formatCompactNumber(stats.total_amount ?? 0)}
                            <span className="stat-currency">تومان</span>
                        </span>
                        <span className="stat-extra">
                            {toPersianNumber(stats.success_count ?? 0)} پرداخت
                            موفق
                        </span>
                    </div>
                </div>

                {/* تعداد کل */}
                <div className="finance-stat-card blue">
                    <div className="stat-icon-box">
                        <Receipt size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">کل تراکنش‌های درگاه</span>
                        <span className="stat-value">
                            {toPersianNumber(stats.total_count ?? 0)}
                            <span className="stat-currency">مورد</span>
                        </span>
                        <span className="stat-extra">از همه درگاه‌ها</span>
                    </div>
                </div>

                {/* موفق */}
                <div className="finance-stat-card green">
                    <div className="stat-icon-box">
                        <CheckCircle size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">موفق</span>
                        <span className="stat-value">
                            {toPersianNumber(stats.success_count ?? 0)}
                            <span className="stat-currency">مورد</span>
                        </span>
                    </div>
                </div>

                {/* ناموفق */}
                <div className="finance-stat-card red">
                    <div className="stat-icon-box">
                        <XCircle size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">ناموفق</span>
                        <span className="stat-value">
                            {toPersianNumber(stats.failed_count ?? 0)}
                            <span className="stat-currency">مورد</span>
                        </span>
                    </div>
                </div>

                {/* در انتظار */}
                <div className="finance-stat-card orange">
                    <div className="stat-icon-box">
                        <Clock size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">در انتظار</span>
                        <span className="stat-value">
                            {toPersianNumber(stats.pending_count ?? 0)}
                            <span className="stat-currency">مورد</span>
                        </span>
                    </div>
                </div>

                {/* نرخ موفقیت */}
                <div className="finance-stat-card purple">
                    <div className="stat-icon-box">
                        <Percent size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">نرخ موفقیت</span>
                        <span className="stat-value">
                            {toPersianNumber(stats.success_rate ?? 0)}
                            <span className="stat-currency">٪</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    // ============ رندر یک پرداخت ============
    const renderPayment = (payment) => {
        const statConfig = statusConfig[payment.status] ?? statusConfig.pending;
        const StatIcon = statConfig.icon;

        const gwConfig = gatewayConfig[payment.gateway] ?? {
            label: payment.gateway ?? "نامشخص",
            color: "#6b7280",
            bg: "#f3f4f6",
        };

        return (
            <div key={payment.id} className="admin-transaction-item">
                {/* آیکون درگاه */}
                <div
                    className="transaction-icon"
                    style={{
                        background: gwConfig.bg,
                        color: gwConfig.color,
                    }}
                >
                    <CreditCard size={18} />
                </div>

                {/* محتوا */}
                <div className="transaction-content">
                    <div className="transaction-user">
                        {payment.user?.name ?? "—"}

                        <span
                            className={`transaction-status-badge ${payment.status}`}
                        >
                            <StatIcon size={10} />
                            {statConfig.label}
                        </span>

                        <span
                            className="transaction-flag"
                            style={{
                                background: gwConfig.bg,
                                color: gwConfig.color,
                            }}
                        >
                            {gwConfig.label}
                        </span>
                    </div>

                    <div className="transaction-type">
                        {payment.booking_id ? (
                            <>
                                پرداخت رزرو #
                                {toPersianNumber(payment.booking_id)}
                            </>
                        ) : (
                            "پرداخت بدون رزرو"
                        )}
                        {payment.transaction_id && (
                            <span
                                style={{
                                    marginRight: "0.5rem",
                                    direction: "ltr",
                                    fontFamily: "monospace",
                                    fontSize: "0.625rem",
                                }}
                            >
                                {payment.transaction_id}
                            </span>
                        )}
                    </div>

                    <div className="transaction-meta">
                        {payment.paid_at && (
                            <span className="transaction-meta-item">
                                <Calendar size={10} />
                                {formatFullDateTime(payment.paid_at)}
                            </span>
                        )}
                        {payment.authority && (
                            <span className="transaction-meta-item ltr">
                                <Hash size={10} />
                                {payment.authority.substring(0, 16)}...
                            </span>
                        )}
                        {payment.created_at && !payment.paid_at && (
                            <span className="transaction-meta-item">
                                <Clock size={10} />
                                ایجاد: {formatFullDateTime(payment.created_at)}
                            </span>
                        )}
                    </div>
                </div>

                {/* مبلغ */}
                <div className="transaction-amount">
                    <span
                        className={`amount ${payment.status === "success" ? "credit" : "debit"}`}
                    >
                        {payment.status === "success" ? "+" : ""}
                        {toPersianNumber(
                            Number(payment.amount ?? 0).toLocaleString("fa-IR"),
                        )}
                    </span>
                    <span className="amount-date">تومان</span>
                </div>

                {/* اکشن‌ها */}
                <div className="transaction-actions">
                    {payment.user?.profile_url && (
                        <Link
                            href={payment.user.profile_url}
                            className="btn-ghost"
                            title={payment.user.profile_label}
                        >
                            <User size={10} />
                            {payment.user.profile_label ?? "کاربر"}
                        </Link>
                    )}

                    {payment.booking_id && (
                        <Link
                            href={`/admin/bookings/${payment.booking.barber_id}/barber/${payment.booking_id}`}
                            className="btn-ghost"
                        >
                            <Calendar size={10} />
                            رزرو
                        </Link>
                    )}

                    {payment.gateway_url && (
                        <a
                            href={payment.gateway_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ghost"
                        >
                            <ExternalLink size={10} />
                            درگاه
                        </a>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <Head title="پرداخت‌های درگاه" />

            <div className="admin-finance-page">
                {/* ============ هدر ============ */}
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div className="finance-header-icon">
                            <Banknote size={28} />
                        </div>
                        <div>
                            <h1>پرداخت‌های درگاه</h1>
                            <p>
                                مدیریت پرداخت‌های آنلاین از طریق درگاه‌های بانکی
                            </p>
                        </div>
                    </div>

                    <div className="finance-header-actions">
                        <div className="export-dropdown">
                            {showExport && (
                                <>
                                    <div
                                        className="export-overlay"
                                        onClick={() => setShowExport(false)}
                                    />
                                    <div className="export-menu">
                                        <a
                                            href={exportUrl("csv")}
                                            className="export-item"
                                            onClick={() => setShowExport(false)}
                                        >
                                            <FileSpreadsheet size={18} />
                                            <div>
                                                <span>خروجی CSV</span>
                                                <small>
                                                    برای اکسل و گوگل شیتس
                                                </small>
                                            </div>
                                        </a>
                                        <a
                                            href={exportUrl("excel")}
                                            className="export-item"
                                            onClick={() => setShowExport(false)}
                                        >
                                            <FileText size={18} />
                                            <div>
                                                <span>خروجی Excel</span>
                                                <small>
                                                    فایل xlsx با فرمت کامل
                                                </small>
                                            </div>
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============ آمار ============ */}
                {renderStats()}

                {/* ============ تب‌های فیلتر سریع ============ */}
                <div className="status-filters">
                    <button
                        type="button"
                        className={`filter-btn ${
                            activeTab === "all" ? "active" : ""
                        }`}
                        onClick={() => {
                            setLocalFilters({
                                ...localFilters,
                                status: "",
                            });
                            applyFilters({ status: "" });
                        }}
                    >
                        همه
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${
                            activeTab === "success" ? "active" : ""
                        }`}
                        onClick={() => {
                            setLocalFilters({
                                ...localFilters,
                                status: "success",
                            });
                            applyFilters({ status: "success" });
                        }}
                    >
                        <CheckCircle size={12} />
                        موفق
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${
                            activeTab === "failed" ? "active" : ""
                        }`}
                        onClick={() => {
                            setLocalFilters({
                                ...localFilters,
                                status: "failed",
                            });
                            applyFilters({ status: "failed" });
                        }}
                    >
                        <XCircle size={12} />
                        ناموفق
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${
                            activeTab === "pending" ? "active" : ""
                        }`}
                        onClick={() => {
                            setLocalFilters({
                                ...localFilters,
                                status: "pending",
                            });
                            applyFilters({ status: "pending" });
                        }}
                    >
                        <Clock size={12} />
                        در انتظار
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${activeTab === "refunded" ? "active" : ""}`}
                        onClick={() => {
                            setLocalFilters({
                                ...localFilters,
                                status: "refunded",
                            });
                            applyFilters({ status: "refunded" });
                        }}
                    >
                        <ArrowDownLeft size={12} />
                        بازگشت وجه
                    </button>
                </div>

                {/* ============ Toolbar ============ */}
                <div className="transactions-toolbar">
                    <SearchComponent
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onSearch={handleSearch}
                        placeholder="جستجو در نام کاربر، شماره تراکنش، شماره پیگیری..."
                        delay={500}
                        isLoading={isSearching}
                    />

                    <button
                        type="button"
                        className={`filter-toggle ${
                            showFilters ? "active" : ""
                        }`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={14} />
                        فیلترها
                        {activeFiltersCount > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(activeFiltersCount)}
                            </span>
                        )}
                    </button>
                </div>

                {/* ============ پنل فیلترها ============ */}
                {showFilters && (
                    <div className="filters-panel">
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label>درگاه پرداخت</label>
                                <select
                                    className="filter-select"
                                    value={localFilters.gateway}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            gateway: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">همه</option>
                                    {gateways.map((g) => (
                                        <option key={g.value} value={g.value}>
                                            {g.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>وضعیت</label>
                                <select
                                    className="filter-select"
                                    value={localFilters.status}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            status: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">همه</option>
                                    {statuses.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <PersianDatePicker
                                    label="از تاریخ"
                                    value={localFilters.date_from}
                                    onChange={(value) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            date_from: value,
                                        }))
                                    }
                                    placeholder="انتخاب تاریخ شروع"
                                />
                            </div>

                            <div className="filter-group">
                                <PersianDatePicker
                                    label="تا تاریخ"
                                    value={localFilters.date_to}
                                    onChange={(value) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            date_to: value,
                                        }))
                                    }
                                    placeholder="انتخاب تاریخ پایان"
                                />
                            </div>
                        </div>

                        <div className="filters-actions">
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={clearFilters}
                            >
                                <X size={14} />
                                پاک کردن
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => applyFilters()}
                            >
                                <CheckCircle size={14} />
                                اعمال فیلتر
                            </button>
                        </div>
                    </div>
                )}

                {/* ============ لیست پرداخت‌ها ============ */}
                <div className="finance-card">
                    <div className="finance-card-header">
                        <div className="card-icon-box blue">
                            <CreditCard size={20} />
                        </div>
                        <h2>پرداخت‌ها</h2>
                        <span className="permissions-count">
                            {toPersianNumber(payments.total || 0)} مورد
                        </span>
                    </div>

                    {payments.data.length === 0 ? (
                        <div className="empty-state-large">
                            <CreditCard size={48} />
                            <p>هیچ پرداختی با این فیلترها یافت نشد</p>
                            {activeFiltersCount > 0 && (
                                <button
                                    type="button"
                                    className="btn-ghost"
                                    onClick={clearFilters}
                                >
                                    <X size={14} />
                                    پاک کردن فیلترها
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="admin-transactions-list">
                                {payments.data.map(renderPayment)}
                            </div>

                            <Pagination
                                links={payments.links}
                                only={["payments"]}
                            />
                        </>
                    )}
                </div>
            </div>
            <StatsDetailModal
                isOpen={!!selectedStat}
                onClose={() => setSelectedStat(null)}
                config={selectedStat}
            />
        </Layout>
    );
}
