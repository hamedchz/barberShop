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
    Percent,
    Award,
    ArrowUpRight,
    X,
    RotateCcw,
    Search,
    ChevronDown,
    FileSpreadsheet,
    FileText,
    Info,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatCompactNumber } from "../../../../Constants/formatCompactNumber";
import AdminRevenueChart from "../../Components/AdminRevenueChart";
import AdminRevenuePie from "../../Components/AdminRevenuePie";
import SearchComponent from "../../../../Components/Search";
import PersianDatePicker from "../../../../Components/PersianDatePicker";
import Select2 from "../../Components/Select2";
import RevenueDetailModal from "./Components/RevenueDetailModal";
import "../../Assets/css/Finance.css";
import "../../Assets/css/RevenuePage.css";

const periodOptions = [
    { value: "today", label: "امروز" },
    { value: "yesterday", label: "دیروز" },
    { value: "7", label: "۷ روز" },
    { value: "30", label: "۳۰ روز" },
    { value: "90", label: "۹۰ روز" },
    { value: "365", label: "۱ سال" },
    { value: "custom", label: "دلخواه" },
];

const typeOptions = [
    { value: "", label: "همه" },
    { value: "commission", label: "کمیسیون" },
    { value: "penalty", label: "جریمه" },
];

export default function RevenueIndex({
    barbers = [],
    totalCommission,
    dailyCommission,
    byBarber,
    revenueByType = [],
    dailyRevenue = [],
    revenueByUser = [],
    stats = {},

    filters = {},
}) {
    const [selectedCard, setSelectedCard] = useState(null);
    // ... آمار کارت‌ها
    const commission = revenueByType.find((r) => r.type === "commission");
    const penalty = revenueByType.find((r) => r.type === "penalty");
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [period, setPeriod] = useState(filters.period || "30");
    const [localFilters, setLocalFilters] = useState({
        type: filters.type || "",
        user_id: filters.user_id || "",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
        min_amount: filters.min_amount || "",
        max_amount: filters.max_amount || "",
    });
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);

    const totalRevenue = revenueByType.reduce(
        (sum, item) => sum + item.total,
        0,
    );

    const barberOptions = [
        { value: "", label: "همه آرایشگرها" },
        ...barbers.map((b) => ({
            value: b.id.toString(),
            label: b.name,
        })),
    ];

    // ============ تغییر دوره ============
    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);

        if (newPeriod === "custom") {
            setShowFilters(true);
            return;
        }

        router.get(
            route("admin.finance.revenue"),
            {
                ...localFilters,
                period: newPeriod,
                search: searchTerm,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    // ============ اعمال فیلترها ============
    const applyFilters = (newFilters = localFilters) => {
        router.get(
            route("admin.finance.revenue"),
            {
                ...newFilters,
                period: period === "custom" ? "custom" : period,
                search: searchTerm,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    // ============ پاک کردن فیلترها ============
    const clearFilters = () => {
        const cleared = {
            type: "",
            user_id: "",
            date_from: "",
            date_to: "",
            min_amount: "",
            max_amount: "",
        };
        setLocalFilters(cleared);
        setSearchTerm("");
        setPeriod("30");

        router.get(
            route("admin.finance.revenue"),
            { period: "30" },
            { preserveScroll: true, preserveState: true },
        );
    };

    // ============ جستجو ============
    const handleSearch = (value) => {
        setIsSearching(true);
        router.get(
            route("admin.finance.revenue"),
            {
                ...localFilters,
                period: period === "custom" ? "custom" : period,
                search: value,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    // ============ آیا فیلتر فعاله؟ ============
    const hasActiveFilters =
        Object.values(localFilters).some((v) => v) ||
        searchTerm.trim() !== "" ||
        period === "custom";

    // ============ تعداد فیلترهای فعال ============
    const activeFiltersCount = Object.values(localFilters).filter(
        (v) => v !== "",
    ).length;

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

                        {/*  دکمه Export */}
                        <div className="export-dropdown">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() =>
                                    setShowExportMenu(!showExportMenu)
                                }
                            >
                                <Download size={16} />
                                خروجی
                                <ChevronDown size={14} />
                            </button>

                            {showExportMenu && (
                                <div className="export-menu">
                                    <a
                                        href={route(
                                            "admin.finance.export.revenue",
                                            {
                                                period,
                                                ...localFilters,
                                                search: searchTerm,
                                            },
                                        )}
                                        className="export-item"
                                    >
                                        <FileSpreadsheet size={16} />
                                        <div>
                                            <span>Excel (CSV)</span>
                                            <small>
                                                فرمت قابل باز شدن در Excel
                                            </small>
                                        </div>
                                    </a>

                                    <button
                                        type="button"
                                        className="export-item"
                                        onClick={() => window.print()}
                                    >
                                        <FileText size={16} />
                                        <div>
                                            <span>چاپ / PDF</span>
                                            <small>ذخیره به‌صورت PDF</small>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============ نوار جستجو + فیلتر ============ */}
                <div className="revenue-toolbar">
                    <div className="revenue-toolbar-search">
                        <SearchComponent
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={handleSearch}
                            placeholder="جستجو در توضیحات یا نام آرایشگر..."
                            delay={500}
                            isLoading={isSearching}
                        />
                    </div>

                    <button
                        type="button"
                        className={`filter-toggle ${showFilters ? "active" : ""}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={14} />
                        <span>فیلتر پیشرفته</span>
                        {activeFiltersCount > 0 && (
                            <span className="filter-count">
                                {toPersianNumber(activeFiltersCount)}
                            </span>
                        )}
                    </button>
                </div>

                {/* ============ پنل فیلترهای پیشرفته ============ */}
                {showFilters && (
                    <div className="filters-panel">
                        {/* ردیف اول */}
                        <div className="filters-grid filters-grid-2">
                            <div className="filter-group">
                                <label className="filter-label">
                                    <span className="label-icon">
                                        <Calendar size={14} />
                                    </span>
                                    <span className="label-text">
                                        دوره زمانی
                                    </span>
                                </label>
                                <select
                                    className="filter-select"
                                    value={period}
                                    onChange={(e) =>
                                        handlePeriodChange(e.target.value)
                                    }
                                >
                                    {periodOptions.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">
                                    <span className="label-icon">
                                        <Coins size={14} />
                                    </span>
                                    <span className="label-text">
                                        نوع درآمد
                                    </span>
                                </label>
                                <select
                                    className="filter-select"
                                    value={localFilters.type}
                                    onChange={(e) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            type: e.target.value,
                                        }))
                                    }
                                >
                                    {typeOptions.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* ردیف دوم */}
                        {period === "custom" && (
                            <div className="filters-grid filters-grid-2">
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
                                    minDate={localFilters.date_from || null}
                                />
                            </div>
                        )}

                        {/* ردیف سوم */}
                        <div className="filters-grid filters-grid-3">
                            <div className="filter-group">
                                <label className="filter-label">
                                    <span className="label-icon">
                                        <Users size={14} />
                                    </span>
                                    <span className="label-text">آرایشگر</span>
                                </label>

                                <Select2
                                    options={[
                                        { value: "", label: "همه آرایشگرها" },
                                        ...barbers.map((b) => ({
                                            value: b.id.toString(),
                                            label: b.name,
                                        })),
                                    ]}
                                    value={localFilters.user_id}
                                    onChange={(value) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            user_id: value,
                                        }))
                                    }
                                    placeholder="جستجو و انتخاب آرایشگر..."
                                    isRtl
                                    isSearchable
                                />
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">
                                    <span className="label-icon">
                                        <ArrowUpRight size={14} />
                                    </span>
                                    <span className="label-text">
                                        حداقل مبلغ (تومان)
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    className="filter-input"
                                    value={localFilters.min_amount}
                                    onChange={(e) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            min_amount: e.target.value,
                                        }))
                                    }
                                    placeholder="مثلاً ۱۰,۰۰۰"
                                />
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">
                                    <span className="label-icon">
                                        <ArrowRight size={14} />
                                    </span>
                                    <span className="label-text">
                                        حداکثر مبلغ (تومان)
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    className="filter-input"
                                    value={localFilters.max_amount}
                                    onChange={(e) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            max_amount: e.target.value,
                                        }))
                                    }
                                    placeholder="مثلاً ۱,۰۰۰,۰۰۰"
                                />
                            </div>
                        </div>

                        {/* اکشنها */}
                        <div className="filters-actions">
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={clearFilters}
                            >
                                <RotateCcw size={14} />
                                پاک کردن
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => applyFilters()}
                            >
                                <Filter size={14} />
                                اعمال فیلتر
                            </button>
                        </div>
                    </div>
                )}

                {/* ============ فیلتر سریع دوره ============ */}
                {!showFilters && (
                    <div className="revenue-filters">
                        <div className="period-filter">
                            {periodOptions
                                .filter((p) => p.value !== "custom")
                                .map((p) => (
                                    <button
                                        key={p.value}
                                        type="button"
                                        className={`period-btn ${
                                            period === p.value ? "active" : ""
                                        }`}
                                        onClick={() =>
                                            handlePeriodChange(p.value)
                                        }
                                    >
                                        {p.label}
                                    </button>
                                ))}
                        </div>
                    </div>
                )}
                <div className="finance-stats-hint">
                    <Info size={14} />
                    <span>
                        برای مشاهده مبلغ دقیق و جزئیات، روی هر کارت کلیک کنید
                    </span>
                </div>
                {/* ============ کارت‌های آماری ============ */}
                <div className="revenue-stats-grid">
                    {/* درآمد کل */}
                    <div
                        className="revenue-stat-card primary has-hint"
                        onClick={() => setSelectedCard("total")}
                        data-hint="کلیک کنید تا جزئیات کامل را ببینید"
                        style={{ cursor: "pointer" }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedCard("total");
                            }
                        }}
                    >
                        <div className="stat-icon-wrapper">
                            <Coins size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">
                                درآمد کل این دوره
                            </span>
                            <div className="stat-value">
                                <span>{formatCompactNumber(totalRevenue)}</span>
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
                    <div
                        className="revenue-stat-card commission has-hint"
                        onClick={() => setSelectedCard("commission")}
                        data-hint="کلیک کنید تا جزئیات کامل را ببینید"
                        style={{ cursor: "pointer" }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedCard("commission");
                            }
                        }}
                    >
                        <div className="stat-icon-wrapper">
                            <Percent size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">کمیسیون</span>
                            <div className="stat-value">
                                <span>
                                    {formatCompactNumber(
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
                    <div
                        className="revenue-stat-card penalty has-hint"
                        onClick={() => setSelectedCard("penalty")}
                        data-hint="کلیک کنید تا جزئیات کامل را ببینید"
                        style={{ cursor: "pointer" }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedCard("penalty");
                            }
                        }}
                    >
                        <div className="stat-icon-wrapper">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">جریمه‌ها</span>
                            <div className="stat-value">
                                <span>
                                    {formatCompactNumber(
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
                    <div
                        className="revenue-stat-card average has-hint"
                        onClick={() => setSelectedCard("average")}
                        data-hint="کلیک کنید تا جزئیات کامل را ببینید"
                        style={{ cursor: "pointer" }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedCard("average");
                            }
                        }}
                    >
                        <div className="stat-icon-wrapper">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">
                                میانگین درآمد روزانه
                            </span>
                            <div className="stat-value">
                                <span>
                                    {formatCompactNumber(
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
                                {/* <span className="card-subtitle">
                                    درآمد روزانه پلتفرم
                                </span> */}
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
                                                    {formatCompactNumber(
                                                        item.total,
                                                    )}{" "}
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
                                    <span>داده‌ای برای نمایش وجود ندارد</span>
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
                                                    {toPersianNumber(
                                                        Number(
                                                            item.total ?? 0,
                                                        ).toLocaleString(
                                                            "fa-IR",
                                                        ),
                                                    )}
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
                        {/* نمودار دایره‌ای */}
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
                                        {formatCompactNumber(totalRevenue)}{" "}
                                        تومان
                                    </span>
                                </div>

                                <div className="summary-divider" />

                                <div className="summary-row">
                                    <span className="summary-label">
                                        کمیسیون
                                    </span>
                                    <span className="summary-value green">
                                        {formatCompactNumber(
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
                                        {formatCompactNumber(
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
                                        {formatCompactNumber(
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

            {/* ============ Modal ============ */}
            <RevenueDetailModal
                isOpen={!!selectedCard}
                onClose={() => setSelectedCard(null)}
                cardKey={selectedCard}
                amount={
                    selectedCard === "total"
                        ? totalRevenue
                        : selectedCard === "commission"
                          ? (commission?.total ?? 0)
                          : selectedCard === "penalty"
                            ? (penalty?.total ?? 0)
                            : selectedCard === "average"
                              ? Math.round(
                                    totalRevenue / (dailyRevenue.length || 1),
                                )
                              : 0
                }
                stats={stats}
                revenueByType={revenueByType}
                dailyRevenue={dailyRevenue}
                revenueByUser={revenueByUser}
                period={filters.period ?? "30"}
            />
        </Layout>
    );
}
