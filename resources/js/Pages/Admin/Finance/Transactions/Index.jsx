import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../../Layouts/Layout";
import SearchComponent from "../../../../Components/Search";
import PersianDatePicker from "../../../../Components/PersianDatePicker";
import "../../Assets/css/Transactions.css";
import Pagination from "../../Components/Pagination";
import StatsDetailModal from "../../Components/StatsDetailModal";
import { formatFullDateTime } from "../../../../utils/dateHelpers";
import { formatCompactNumber } from "../../../../Constants/formatCompactNumber";

import {
    CreditCard,
    ArrowDownLeft,
    ArrowUpRight,
    Lock,
    CheckCircle,
    Clock,
    XCircle,
    Filter,
    X,
    User,
    Wallet,
    ExternalLink,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Receipt,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Download,
    FileSpreadsheet,
    FileText,
    Ban,
    Info,
} from "lucide-react";

import { toPersianNumber } from "../../../../utils/persianNumbers";
// در بالای کامپوننت (بعد از stateها)

// ============ تنظیمات وضعیت ============
const statusConfig = {
    completed: {
        label: "تکمیل‌شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
    },
    pending: {
        label: "در انتظار",
        icon: Clock,
        color: "#92400e",
        bg: "#fffbeb",
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
};

const directionConfig = {
    credit: {
        label: "واریز",
        icon: ArrowDownLeft,
        color: "#10b981",
        bg: "#ecfdf5",
    },
    debit: {
        label: "برداشت",
        icon: ArrowUpRight,
        color: "#ef4444",
        bg: "#fef2f2",
    },
};

const gatewayLabels = {
    zarinpal: "زرین‌پال",
    idpay: "آیدی‌پی",
    payping: "پی‌پینگ",
    nextpay: "نکست‌پی",
};

// ============ فرمت‌ها ============
const formatAmount = (amount) =>
    toPersianNumber(Number(amount || 0).toLocaleString("en-US"));

const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const jy = d.getFullYear();
    const jm = String(d.getMonth() + 1).padStart(2, "0");
    const jd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${toPersianNumber(jy)}/${toPersianNumber(jm)}/${toPersianNumber(
        jd,
    )} - ${toPersianNumber(hh)}:${toPersianNumber(mm)}`;
};

// ============ کامپوننت ============
export default function TransactionsIndex({
    auth,
    transactions,
    stats,
    filters,
    transactionTypes = [],
    transactionDirections = [],
    transactionStatuses = [],
    users = [],
    links = {},
}) {
    const statCards = [
        {
            key: "total_credit",
            variant: "green",
            title: "کل واریز",
            icon: TrendingUp,
            color: "#065f46",
            bg: "#ecfdf5",
            border: "#a7f3d0",
            amount: stats.total_credit,
            unit: "تومان",
            description: "مجموع همه واریزهای موفق به کیف پول کاربران",
            breakdown: (stats.credit_breakdown ?? []).map((b) => ({
                label: b.label,
                value: b.value,
                count: b.count,
            })),
            actionLink: {
                label: "مشاهده همه واریزها",
                href: "/admin/finance/transactions?direction=credit",
            },
        },
        {
            key: "total_debit",
            variant: "red",
            title: "کل برداشت",
            icon: TrendingDown,
            color: "#991b1b",
            bg: "#fef2f2",
            border: "#fecaca",
            amount: stats.total_debit,
            unit: "تومان",
            description: "مجموع همه برداشت‌ها از کیف پول کاربران",
            breakdown: (stats.debit_breakdown ?? []).map((b) => ({
                label: b.label,
                value: b.value,
                count: b.count,
            })),
            actionLink: {
                label: "مشاهده همه برداشت‌ها",
                href: "/admin/finance/transactions?direction=debit",
            },
        },
        {
            key: "net_amount",
            variant: "purple",
            title: "خالص",
            icon: DollarSign,
            color: "#5b21b6",
            bg: "#f5f3ff",
            border: "#ddd6fe",
            amount: stats.net_amount ?? 0,
            unit: "تومان",
            description: "تفاوت کل واریز و برداشت (درآمد خالص سیستم)",
            breakdown: [
                {
                    label: "کل واریز (+)",
                    value: stats.total_credit,
                },
                {
                    label: "کل برداشت (-)",
                    value: stats.total_debit,
                },
            ],
            actionLink: {
                label: "مشاهده تراکنش‌ها",
                href: "/admin/finance/transactions",
            },
        },
        {
            key: "locked_amount",
            variant: "orange",
            title: "قفل‌شده",
            icon: Lock,
            color: "#9a3412",
            bg: "#fff7ed",
            border: "#fed7aa",
            amount: stats.locked_amount ?? 0,
            unit: "تومان",
            description:
                "مبالغی که به دلیل دوره نگهداری هنوز قابل برداشت نیستند",
            breakdown: [
                {
                    label: "در انتظار آزادسازی",
                    value: stats.locked_amount ?? 0,
                    count: stats.locked_count,
                },
            ],
            actionLink: {
                label: "مشاهده تراکنش‌های قفل",
                href: "/admin/finance/transactions?is_locked=1",
            },
        },
        {
            key: "gateway_total",
            variant: "blue",
            title: "پرداخت درگاه",
            icon: CreditCard,
            color: "#1e40af",
            bg: "#eff6ff",
            border: "#bfdbfe",
            amount: stats.gateway_total ?? 0,
            unit: "تومان",
            description: "مجموع پرداخت‌های موفق از طریق درگاه‌های بانکی",
            breakdown: (stats.gateway_breakdown ?? []).map((g) => ({
                label: g.label, // "زرین‌پال", "آیدی‌پی", ...
                value: g.value, // مبلغ
                count: g.count, // تعداد تراکنش
            })),
            actionLink: {
                label: "مشاهده پرداخت‌های درگاه",
                href: "/admin/finance/transactions?filter=gateway_only",
            },
        },
        {
            key: "unsettled_count",
            variant: "yellow",
            title: "در انتظار تسویه",
            icon: AlertCircle,
            color: "#92400e",
            bg: "#fffbeb",
            border: "#fde68a",
            amount: stats.unsettled_count ?? 0,
            unit: "مورد",
            description: "تعداد درخواست‌های تسویه که هنوز پرداخت نشده‌اند",
            isCount: true,
            breakdown: [
                {
                    label: "تعداد تسویه‌نشده",
                    value: stats.unsettled_count ?? 0,
                    count: stats.unsettled_count,
                },
            ],
            actionLink: {
                label: "مشاهده تسویه‌ها",
                href: "/admin/finance/settlements?status=pending",
            },
        },
    ];
    const [showFilters, setShowFilters] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);

    const [localFilters, setLocalFilters] = useState({
        type: filters.type || "",
        direction: filters.direction || "",
        status: filters.status || "",
        user_id: filters.user_id || "",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
        is_locked: filters.is_locked || "",
        is_settled: filters.is_settled || "",
        filter: filters.filter || "",
    });

    // ============ شمارش فیلترهای فعال ============
    const activeFiltersCount =
        Object.values(localFilters).filter(
            (v) => v !== null && v !== "" && v !== undefined,
        ).length + (searchTerm ? 1 : 0);

    // ============ جستجو (از SearchComponent) ============
    const handleSearch = (query) => {
        setIsSearching(true);

        const merged = { ...localFilters, search: query };
        const cleaned = Object.fromEntries(
            Object.entries(merged).filter(
                ([, v]) => v !== null && v !== "" && v !== undefined,
            ),
        );

        router.get("/admin/finance/transactions", cleaned, {
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
        router.get("/admin/finance/transactions", cleaned, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    // ============ پاک کردن فیلترها ============
    const clearFilters = () => {
        const empty = {
            type: "",
            direction: "",
            status: "",
            user_id: "",
            date_from: "",
            date_to: "",
            is_locked: "",
            is_settled: "",
            filter: "",
        };
        setLocalFilters(empty);
        setSearchTerm("");
        router.get("/admin/finance/transactions", {}, { preserveScroll: true });
    };

    // ============ فیلتر سریع (تب) ============
    const quickFilter = (key, value) => {
        const next = { ...localFilters, [key]: value };
        // اگه فیلتر سریع روی direction/filter/is_locked هست، بقیه رو پاک کن
        if (key === "direction") next.filter = "";
        if (key === "filter") next.direction = "";
        setLocalFilters(next);
        applyFilters({ [key]: value });
    };

    // ============ تعیین وضعیت تب فعال ============
    const activeTab = (() => {
        if (localFilters.filter === "gateway_only") return "gateway";
        if (localFilters.is_locked === "1") return "locked";
        if (localFilters.direction === "credit") return "credit";
        if (localFilters.direction === "debit") return "debit";
        return "all";
    })();

    // ============ خروجی Export ============
    const exportUrl = (format) => {
        const merged = { ...localFilters, search: searchTerm, format };
        const params = new URLSearchParams(
            Object.fromEntries(
                Object.entries(merged).filter(
                    ([, v]) => v !== null && v !== "" && v !== undefined,
                ),
            ),
        );
        return `/admin/finance/transactions/export?${params.toString()}`;
    };

    const [selectedStat, setSelectedStat] = useState(null);

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
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.key}
                            className={`finance-stat-card ${card.variant}`}
                            onClick={() => setSelectedStat(card)}
                            style={{ cursor: "pointer" }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setSelectedStat(card);
                                }
                            }}
                            title="برای مشاهده جزئیات کلیک کنید"
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
                                {card.key === "total_credit" && (
                                    <span className="stat-extra">
                                        {toPersianNumber(
                                            stats.total_count || 0,
                                        )}{" "}
                                        تراکنش
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // ============ رندر یک تراکنش ============
    const renderTransaction = (tx) => {
        const dirConfig =
            directionConfig[tx.direction] ?? directionConfig.credit;
        const DirIcon = dirConfig.icon;

        const statConfig = statusConfig[tx.status] ?? statusConfig.completed;
        const StatIcon = statConfig.icon;

        return (
            <div key={tx.id} className="admin-transaction-item">
                <div className={`transaction-icon ${tx.direction}`}>
                    <DirIcon size={18} />
                </div>

                <div className="transaction-content">
                    <div className="transaction-user">
                        {tx.user?.name ?? "—"}

                        <span
                            className={`transaction-status-badge ${tx.status}`}
                        >
                            <StatIcon size={10} />
                            {statConfig.label}
                        </span>

                        {tx.is_locked && (
                            <span className="transaction-flag locked">
                                <Lock size={10} />
                                قفل
                            </span>
                        )}

                        {tx.is_settled && (
                            <span className="transaction-flag settled">
                                <CheckCircle size={10} />
                                تسویه
                            </span>
                        )}
                    </div>

                    <div className="transaction-type">
                        {tx.type_label || tx.type}
                        {tx.description && <span>• {tx.description}</span>}
                        {tx.reference?.kind === "payment" && (
                            <span style={{ color: "#3b82f6", fontWeight: 700 }}>
                                •{" "}
                                {gatewayLabels[tx.reference.gateway] ||
                                    tx.reference.gateway}
                            </span>
                        )}
                    </div>

                    <div className="transaction-meta">
                        <span className="transaction-meta-item">
                            <Wallet size={10} />
                            موجودی: {formatAmount(tx.balance_after)} تومان
                        </span>
                        <span className="transaction-meta-item">
                            <Clock size={10} />
                            {formatFullDateTime(tx.created_at)}
                        </span>
                        {tx.reference?.transaction_id && (
                            <span className="transaction-meta-item ltr">
                                <Receipt size={10} />
                                {tx.reference.transaction_id}
                            </span>
                        )}
                    </div>
                </div>

                <div className="transaction-amount">
                    <span className={`amount ${tx.direction}`}>
                        {tx.direction === "credit" ? "+" : "-"}
                        {formatAmount(tx.amount)}
                    </span>
                    <span className="amount-date">تومان</span>
                </div>

                <div className="transaction-actions">
                    {tx.user?.profile_url && (
                        <Link
                            href={tx.user.profile_url}
                            className="btn-ghost"
                            title={
                                tx.user.roles?.length > 1
                                    ? `نقش‌ها: ${tx.user.roles.join(", ")}`
                                    : tx.user.profile_label
                            }
                        >
                            <User size={10} />
                            {tx.user.profile_label}
                        </Link>
                    )}

                    {tx.reference?.url && (
                        <a href={tx.reference.url} className="btn-ghost">
                            <ExternalLink size={10} />
                            {tx.reference.label}
                        </a>
                    )}
                </div>
            </div>
        );
    };

    // ============ State جدید: Modal جزئیات مالی ============

    return (
        <Layout>
            <Head title="تراکنش‌های مالی" />

            <div className="admin-finance-page">
                {/* ============ هدر ============ */}
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div className="finance-header-icon">
                            <CreditCard size={28} />
                        </div>
                        <div>
                            <h1>تراکنش‌های مالی</h1>
                            <p>مدیریت و پیگیری همه گردش‌های مالی سیستم</p>
                        </div>
                    </div>

                    <div className="finance-header-actions"></div>
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
                                direction: "",
                                filter: "",
                                is_locked: "",
                            });
                            applyFilters({
                                direction: "",
                                filter: "",
                                is_locked: "",
                            });
                        }}
                    >
                        همه
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${
                            activeTab === "credit" ? "active" : ""
                        }`}
                        onClick={() => quickFilter("direction", "credit")}
                    >
                        <ArrowDownLeft size={12} />
                        واریز
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${
                            activeTab === "debit" ? "active" : ""
                        }`}
                        onClick={() => quickFilter("direction", "debit")}
                    >
                        <ArrowUpRight size={12} />
                        برداشت
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${
                            activeTab === "gateway" ? "active" : ""
                        }`}
                        onClick={() => quickFilter("filter", "gateway_only")}
                    >
                        <CreditCard size={12} />
                        پرداخت درگاه
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${
                            activeTab === "locked" ? "active" : ""
                        }`}
                        onClick={() => quickFilter("is_locked", "1")}
                    >
                        <Lock size={12} />
                        قفل‌شده
                    </button>
                </div>

                {/* ============ Toolbar ============ */}
                <div className="transactions-toolbar">
                    <SearchComponent
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onSearch={handleSearch}
                        placeholder="جستجو در نام، شماره کارت، شماره پیگیری..."
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
                                <label>نوع تراکنش</label>
                                <select
                                    className="filter-select"
                                    value={localFilters.type}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            type: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">همه</option>
                                    {transactionTypes.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>جهت</label>
                                <select
                                    className="filter-select"
                                    value={localFilters.direction}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            direction: e.target.value,
                                            filter: "",
                                        })
                                    }
                                >
                                    <option value="">همه</option>
                                    {transactionDirections.length > 0 ? (
                                        transactionDirections.map((d) => (
                                            <option
                                                key={d.value}
                                                value={d.value}
                                            >
                                                {d.label}
                                            </option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="credit">
                                                واریز
                                            </option>
                                            <option value="debit">
                                                برداشت
                                            </option>
                                        </>
                                    )}
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
                                    {transactionStatuses.length > 0 ? (
                                        transactionStatuses.map((s) => (
                                            <option
                                                key={s.value}
                                                value={s.value}
                                            >
                                                {s.label}
                                            </option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="completed">
                                                تکمیل‌شده
                                            </option>
                                            <option value="pending">
                                                در انتظار
                                            </option>
                                            <option value="failed">
                                                ناموفق
                                            </option>
                                            <option value="cancelled">
                                                لغو شده
                                            </option>
                                        </>
                                    )}
                                </select>
                            </div>
                            {/* 
                            <div className="filter-group">
                                <label>کاربر</label>
                                <select
                                    className="filter-select"
                                    value={localFilters.user_id}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            user_id: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">همه</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name}
                                            {u.phone ? ` — ${u.phone}` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div> */}

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

                            {/* <div className="filter-group">
                                <label>قفل</label>
                                <select
                                    className="filter-select"
                                    value={localFilters.is_locked}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            is_locked: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">همه</option>
                                    <option value="1">قفل‌شده</option>
                                    <option value="0">آزاد</option>
                                </select>
                            </div> */}

                            {/* <div className="filter-group">
                                <label>تسویه</label>
                                <select
                                    className="filter-select"
                                    value={localFilters.is_settled}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            is_settled: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">همه</option>
                                    <option value="1">تسویه‌شده</option>
                                    <option value="0">تسویه‌نشده</option>
                                </select>
                            </div> */}
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

                {/* ============ لیست تراکنش‌ها ============ */}
                <div className="finance-card">
                    <div className="finance-card-header">
                        <div className="card-icon-box purple">
                            <Receipt size={20} />
                        </div>
                        <h2>تراکنش‌ها</h2>
                        <span className="permissions-count">
                            {toPersianNumber(transactions.total || 0)} مورد
                        </span>
                    </div>

                    {transactions.data.length === 0 ? (
                        <div className="empty-state-large">
                            <CreditCard size={48} />
                            <p>هیچ تراکنشی با این فیلترها یافت نشد</p>
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
                                {transactions.data.map(renderTransaction)}
                            </div>

                            <Pagination
                                links={transactions.links}
                                only={["transactions"]}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* ============ Modal جزئیات آمار ============ */}

            <StatsDetailModal
                isOpen={!!selectedStat}
                onClose={() => setSelectedStat(null)}
                config={selectedStat}
            />
        </Layout>
    );
}
