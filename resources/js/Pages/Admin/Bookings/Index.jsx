// resources/js/Pages/Admin/Bookings/Index.jsx

import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import SearchComponent from "../../../Components/Search";
import PersianDatePicker from "../../../Components/PersianDatePicker";
import StatDetailModal from "../Components/StatsDetailModal";
import Pagination from "../Components/Pagination";

import "../Assets/css/Finance.css";
import "../Assets/css/Transactions.css";

import {
    Calendar,
    Clock,
    User,
    Scissors,
    Hash,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
    RefreshCw,
    Info,
    Coins,
    TrendingUp,
    Users,
    DollarSign,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import {
    formatFullDateTime,
    formatFullDateWithoutTime,
} from "../../../utils/dateHelpers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";

// ============ وضعیت‌ها ============
const statusConfig = {
    pending: {
        label: "در انتظار",
        icon: Clock,
        color: "#92400e",
        bg: "#fffbeb",
    },
    confirmed: {
        label: "تایید شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
    },
    completed: {
        label: "تکمیل شده",
        icon: CheckCircle,
        color: "#1e40af",
        bg: "#eff6ff",
    },
    cancelled: {
        label: "لغو شده",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
    },
};

export default function BookingsIndex({
    bookings,
    filters,
    stats,
    statuses = [],
    barbers = [],
}) {
    const [showFilters, setShowFilters] = useState(false);
    const [selectedStat, setSelectedStat] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);

    const [localFilters, setLocalFilters] = useState({
        status: filters.status || "",
        barber_id: filters.barber_id || "",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
        min_amount: filters.min_amount || "",
        max_amount: filters.max_amount || "",
    });

    useEffect(() => {
        setLocalFilters({
            status: filters.status || "",
            barber_id: filters.barber_id || "",
            date_from: filters.date_from || "",
            date_to: filters.date_to || "",
            min_amount: filters.min_amount || "",
            max_amount: filters.max_amount || "",
        });
        setSearchTerm(filters.search || "");
    }, [filters]);

    const activeFiltersCount =
        Object.values(localFilters).filter(
            (v) => v !== null && v !== "" && v !== undefined,
        ).length + (searchTerm ? 1 : 0);

    const handleSearch = (query) => {
        setIsSearching(true);
        const merged = { ...localFilters, search: query };
        const cleaned = Object.fromEntries(
            Object.entries(merged).filter(
                ([, v]) => v !== null && v !== "" && v !== undefined,
            ),
        );
        router.get("/admin/bookings", cleaned, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
    };

    const applyFilters = (overrides = {}) => {
        const merged = { ...localFilters, search: searchTerm, ...overrides };
        const cleaned = Object.fromEntries(
            Object.entries(merged).filter(
                ([, v]) => v !== null && v !== "" && v !== undefined,
            ),
        );
        router.get("/admin/bookings", cleaned, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const clearFilters = () => {
        const empty = {
            status: "",
            barber_id: "",
            date_from: "",
            date_to: "",
            min_amount: "",
            max_amount: "",
        };
        setLocalFilters(empty);
        setSearchTerm("");
        router.get("/admin/bookings", {}, { preserveScroll: true });
    };

    const activeTab = localFilters.status || "all";
    const quickFilter = (status) => {
        setLocalFilters((prev) => ({ ...prev, status }));
        applyFilters({ status });
    };

    // ============ آمار ============
    const statCards = [
        {
            key: "total",
            variant: "purple",
            title: "کل رزروها",
            icon: Calendar,
            color: "#5b21b6",
            bg: "#f5f3ff",
            border: "#ddd6fe",
            amount: stats.total ?? 0,
            unit: "مورد",
            isCount: true,
            description: "تعداد همه رزروها",
            breakdown: [],
            actionLink: { label: "مشاهده همه", href: "/admin/bookings" },
        },
        {
            key: "pending",
            variant: "yellow",
            title: "در انتظار",
            icon: Clock,
            color: "#92400e",
            bg: "#fffbeb",
            border: "#fde68a",
            amount: stats.pending ?? 0,
            unit: "مورد",
            isCount: true,
            description: "رزروهای در انتظار تایید آرایشگر",
            breakdown: [],
            actionLink: {
                label: "مشاهده در انتظار",
                href: "/admin/bookings?status=pending",
            },
        },
        {
            key: "confirmed",
            variant: "green",
            title: "تایید شده",
            icon: CheckCircle,
            color: "#065f46",
            bg: "#ecfdf5",
            border: "#a7f3d0",
            amount: stats.confirmed ?? 0,
            unit: "مورد",
            isCount: true,
            description: "رزروهای تایید‌شده",
            breakdown: [],
            actionLink: {
                label: "مشاهده تاییدشده",
                href: "/admin/bookings?status=confirmed",
            },
        },
        {
            key: "completed",
            variant: "blue",
            title: "تکمیل شده",
            icon: CheckCircle,
            color: "#1e40af",
            bg: "#eff6ff",
            border: "#bfdbfe",
            amount: stats.completed ?? 0,
            unit: "مورد",
            isCount: true,
            description: "رزروهای تکمیل‌شده",
            breakdown: [
                {
                    label: "مجموع مبلغ",
                    value: Number(stats.total_amount ?? 0), // ← عدد خام
                    isCount: false, // ← مبلغ
                    unit: "تومان", // ← واحد مستقل
                },
            ],
            actionLink: {
                label: "مشاهده تکمیل‌شده",
                href: "/admin/bookings?status=completed",
            },
        },
        {
            key: "cancelled",
            variant: "red",
            title: "لغو شده",
            icon: XCircle,
            color: "#991b1b",
            bg: "#fef2f2",
            border: "#fecaca",
            amount: stats.cancelled ?? 0,
            unit: "مورد",
            isCount: true,
            description: "رزروهای لغو‌شده",
            breakdown: [],
            actionLink: {
                label: "مشاهده لغو‌شده",
                href: "/admin/bookings?status=cancelled",
            },
        },
        {
            key: "disputed",
            variant: "orange",
            title: "دارای اعتراض",
            icon: AlertCircle,
            color: "#9a3412",
            bg: "#fff7ed",
            border: "#fed7aa",
            amount: stats.disputed ?? 0,
            unit: "مورد",
            isCount: true,
            description: "رزروهایی که اعتراض دارند",
            breakdown: [],
            actionLink: null,
        },
    ];

    const renderStats = () => (
        <div className="finance-stats-wrapper">
            <div className="finance-stats-hint">
                <Info size={14} />
                <span>برای مشاهده جزئیات، روی هر کارت کلیک کنید</span>
            </div>
            <div className="finance-stats-grid">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.key}
                            className={`finance-stat-card ${card.variant} has-hint`}
                            onClick={() => setSelectedStat(card)}
                            data-hint="کلیک کنید تا جزئیات را ببینید"
                            style={{ cursor: "pointer" }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setSelectedStat(card);
                                }
                            }}
                        >
                            <div
                                className="stat-icon-box"
                                style={{
                                    background: card.bg,
                                    color: card.color,
                                }}
                            >
                                <Icon size={22} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">{card.title}</span>
                                <span
                                    className="stat-value"
                                    style={{ color: card.color }}
                                >
                                    {card.isCount
                                        ? toPersianNumber(card.amount)
                                        : formatCompactNumber(card.amount)}
                                    <span className="stat-currency">
                                        {card.unit}
                                    </span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // ============ رندر هر رزرو ============
    const renderBooking = (b) => {
        const statConfig = statusConfig[b.status] ?? statusConfig.pending;
        const StatIcon = statConfig.icon;

        return (
            <Link
                key={b.id}
                href={`/admin/bookings/${b.id}/detail`}
                className="admin-transaction-item"
                style={{ textDecoration: "none", cursor: "pointer" }}
            >
                <div
                    className="transaction-icon"
                    style={{
                        background: statConfig.bg,
                        color: statConfig.color,
                    }}
                >
                    <StatIcon size={18} />
                </div>

                <div className="transaction-content">
                    <div className="transaction-user">
                        {b.user?.name ?? "—"}
                        <span
                            className={`transaction-status-badge ${b.status}`}
                        >
                            <StatIcon size={10} />
                            {statConfig.label}
                        </span>
                        {b.has_disputes && (
                            <span className="transaction-flag locked">
                                <AlertCircle size={10} />
                                اعتراض ({toPersianNumber(b.disputes_count)})
                            </span>
                        )}
                    </div>

                    <div className="transaction-type">
                        <Scissors
                            size={11}
                            style={{ display: "inline", marginLeft: "0.25rem" }}
                        />
                        {b.service?.name ?? "—"}
                        <span style={{ marginRight: "0.5rem" }}>
                            با {b.barber?.name ?? "—"}
                        </span>
                    </div>

                    <div className="transaction-meta">
                        {b.time_slot && (
                            <span className="transaction-meta-item">
                                <Calendar size={10} />
                                {formatFullDateWithoutTime(b.time_slot.date)}
                            </span>
                        )}
                        {b.time_slot && (
                            <span className="transaction-meta-item">
                                <Clock size={10} />
                                {b.time_slot.start_time} -{" "}
                                {b.time_slot.end_time}
                            </span>
                        )}
                        <span className="transaction-meta-item ltr">
                            <Hash size={10} />#{b.id}
                        </span>
                    </div>
                </div>

                <div className="transaction-amount">
                    <span className="amount credit">
                        {toPersianNumber(
                            Number(b.amount || 0).toLocaleString("en-US"),
                        )}
                    </span>
                    <span className="amount-date">تومان</span>
                </div>

                <div className="transaction-actions">
                    <span className="btn-ghost">
                        <ChevronLeft size={12} />
                        جزئیات
                    </span>
                </div>
            </Link>
        );
    };

    return (
        <Layout>
            <Head title="مدیریت رزروها" />

            <div className="admin-finance-page">
                {/* هدر */}
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div className="finance-header-icon">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <h1>مدیریت رزروها</h1>
                            <p>مشاهده و پیگیری همه رزروهای سیستم</p>
                        </div>
                    </div>
                    <div className="finance-header-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() =>
                                router.reload({ only: ["bookings", "stats"] })
                            }
                        >
                            <RefreshCw size={14} />
                            بروزرسانی
                        </button>
                    </div>
                </div>

                {/* آمار */}
                {renderStats()}

                {/* تب‌های سریع */}
                <div className="status-filters">
                    <button
                        type="button"
                        className={`filter-btn ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => quickFilter("")}
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
                        className={`filter-btn ${activeTab === "pending" ? "active" : ""}`}
                        onClick={() => quickFilter("pending")}
                    >
                        <Clock size={12} />
                        در انتظار
                        {stats.pending > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.pending)}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${activeTab === "confirmed" ? "active" : ""}`}
                        onClick={() => quickFilter("confirmed")}
                    >
                        <CheckCircle size={12} />
                        تایید شده
                        {stats.confirmed > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.confirmed)}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${activeTab === "completed" ? "active" : ""}`}
                        onClick={() => quickFilter("completed")}
                    >
                        <CheckCircle size={12} />
                        تکمیل شده
                        {stats.completed > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.completed)}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${activeTab === "cancelled" ? "active" : ""}`}
                        onClick={() => quickFilter("cancelled")}
                    >
                        <XCircle size={12} />
                        لغو شده
                        {stats.cancelled > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.cancelled)}
                            </span>
                        )}
                    </button>
                </div>

                {/* Toolbar */}
                <div className="transactions-toolbar">
                    <SearchComponent
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onSearch={handleSearch}
                        placeholder="جستجو در نام مشتری، آرایشگر، شماره رزرو..."
                        delay={500}
                        isLoading={isSearching}
                    />
                    <button
                        type="button"
                        className={`filter-toggle ${showFilters ? "active" : ""}`}
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

                {/* پنل فیلتر */}
                {showFilters && (
                    <div className="filters-panel">
                        <div className="filters-grid">
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
                                        setLocalFilters((p) => ({
                                            ...p,
                                            date_from: value,
                                        }))
                                    }
                                    placeholder="تاریخ شروع"
                                />
                            </div>
                            <div className="filter-group">
                                <PersianDatePicker
                                    label="تا تاریخ"
                                    value={localFilters.date_to}
                                    onChange={(value) =>
                                        setLocalFilters((p) => ({
                                            ...p,
                                            date_to: value,
                                        }))
                                    }
                                    placeholder="تاریخ پایان"
                                    minDate={localFilters.date_from || null}
                                />
                            </div>
                            <div className="filter-group">
                                <label>حداقل مبلغ</label>
                                <input
                                    type="number"
                                    className="filter-input"
                                    value={localFilters.min_amount}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            min_amount: e.target.value,
                                        })
                                    }
                                    placeholder="تومان"
                                />
                            </div>
                            <div className="filter-group">
                                <label>حداکثر مبلغ</label>
                                <input
                                    type="number"
                                    className="filter-input"
                                    value={localFilters.max_amount}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            max_amount: e.target.value,
                                        })
                                    }
                                    placeholder="تومان"
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

                {/* لیست */}
                <div className="finance-card">
                    <div className="finance-card-header">
                        <div className="card-icon-box blue">
                            <Calendar size={20} />
                        </div>
                        <h2>رزروها</h2>
                        <span className="permissions-count">
                            {toPersianNumber(bookings.total || 0)} مورد
                        </span>
                    </div>
                    {bookings.data.length === 0 ? (
                        <div className="empty-state-large">
                            <Calendar size={48} />
                            <p>هیچ رزروی با این فیلترها یافت نشد</p>
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
                                {bookings.data.map(renderBooking)}
                            </div>
                            <Pagination
                                links={bookings.links}
                                only={["bookings"]}
                            />
                        </>
                    )}
                </div>
            </div>

            <StatDetailModal
                isOpen={!!selectedStat}
                onClose={() => setSelectedStat(null)}
                config={selectedStat}
            />
        </Layout>
    );
}
