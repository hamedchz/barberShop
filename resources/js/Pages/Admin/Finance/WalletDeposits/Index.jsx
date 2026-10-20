import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../../Layouts/Layout";
import SearchComponent from "../../../../Components/Search";
import PersianDatePicker from "../../../../Components/PersianDatePicker";
import StatDetailModal from "../../Components/StatsDetailModal";
import Pagination from "../../Components/Pagination";
import Select2 from "../../Components/Select2";
import "../../Assets/css/Finance.css";
import "../../Assets/css/Transactions.css";
import "../../Assets/css/CreateDepositCustom.css";
import CreateDepositModal from "./Components/CreateDepositModal";

import {
    Wallet,
    Plus,
    Filter,
    X,
    User,
    RefreshCw,
    TrendingUp,
    CheckCircle,
    Clock,
    XCircle,
    Download,
    FileSpreadsheet,
    FileText,
    Calendar,
    Info,
    Hash,
    Coins,
    Percent,
    AlertTriangle,
    Ban,
} from "lucide-react";

import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatCompactNumber } from "../../../../Constants/formatCompactNumber";
import { formatFullDateTime } from "../../../../utils/dateHelpers";

// ============ تنظیمات وضعیت شارژ ============
const statusConfig = {
    paid: {
        label: "پرداخت‌شده",
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
    expired: {
        label: "منقضی شده",
        icon: AlertTriangle,
        color: "#6b7280",
        bg: "#f3f4f6",
    },
    cancelled: {
        label: "لغو شده",
        icon: Ban,
        color: "#6b7280",
        bg: "#f3f4f6",
    },
};

const gatewayLabels = {
    zarinpal: "زرین‌پال",
    idpay: "آیدی‌پی",
    payping: "پی‌پینگ",
    nextpay: "نکست‌پی",
    manual: "دستی (ادمین)",
};

// ============ صفحه اصلی ============
export default function WalletDepositsIndex({
    auth,
    deposits,
    stats,
    filters,
    statuses = [],
    gateways = [],
    userOptions = [],
}) {
    const [userId, setUserId] = useState(null);
    const [userSearchOptions, setUserSearchOptions] =
        React.useState(userOptions);

    console.log("User search options:", userSearchOptions);
    const handleUserSearchChange = async (search) => {
        try {
            const response = await fetch(
                `${route("admin.search.users.search")}?search=${encodeURIComponent(search)}&limit=1`,
                {
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    credentials: "same-origin",
                },
            );

            if (!response.ok) {
                throw new Error("خطا در دریافت کاربران");
            }

            const result = await response.json();

            setUserSearchOptions(
                Array.isArray(result.options) ? result.options : [],
            );
        } catch (error) {
            console.error("خطا در جستجوی کاربران:", error);
            setUserSearchOptions([]);
        }
    };
    const [showFilters, setShowFilters] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedStat, setSelectedStat] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);

    const [localFilters, setLocalFilters] = useState({
        status: filters.status || "",
        gateway: filters.gateway || "",
        user_id: filters.user_id || "",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
        min_amount: filters.min_amount || "",
        max_amount: filters.max_amount || "",
    });

    useEffect(() => {
        setLocalFilters({
            status: filters.status || "",
            gateway: filters.gateway || "",
            user_id: filters.user_id || "",
            date_from: filters.date_from || "",
            date_to: filters.date_to || "",
            min_amount: filters.min_amount || "",
            max_amount: filters.max_amount || "",
        });

        setSearchTerm(filters.search || "");
    }, [filters]);

    const activeFiltersCount =
        Object.values(localFilters).filter(
            (value) => value !== null && value !== "" && value !== undefined,
        ).length + (searchTerm ? 1 : 0);

    // ============ جستجو ============
    const handleSearch = (query) => {
        setIsSearching(true);

        const merged = {
            ...localFilters,
            search: query,
        };

        const cleaned = Object.fromEntries(
            Object.entries(merged).filter(
                ([, value]) =>
                    value !== null && value !== "" && value !== undefined,
            ),
        );

        router.get("/admin/finance/wallet/deposits", cleaned, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
    };

    // ============ اعمال فیلترها ============
    const applyFilters = (overrides = {}) => {
        const merged = {
            ...localFilters,
            search: searchTerm,
            ...overrides,
        };

        const cleaned = Object.fromEntries(
            Object.entries(merged).filter(
                ([, value]) =>
                    value !== null && value !== "" && value !== undefined,
            ),
        );

        router.get("/admin/finance/wallet/deposits", cleaned, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    // ============ پاک کردن فیلترها ============
    const clearFilters = () => {
        const empty = {
            status: "",
            gateway: "",
            user_id: "",
            date_from: "",
            date_to: "",
            min_amount: "",
            max_amount: "",
        };

        setLocalFilters(empty);
        setSearchTerm("");

        router.get(
            "/admin/finance/wallet/deposits",
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const activeTab = localFilters.status || "all";

    const quickFilter = (status) => {
        setLocalFilters((prev) => ({
            ...prev,
            status,
        }));

        applyFilters({ status });
    };

    // ============ لینک خروجی ============
    const exportUrl = (format) => {
        const merged = {
            ...localFilters,
            search: searchTerm,
            format,
        };

        const params = new URLSearchParams(
            Object.fromEntries(
                Object.entries(merged).filter(
                    ([, value]) =>
                        value !== null && value !== "" && value !== undefined,
                ),
            ),
        );

        return `/admin/finance/wallet/deposits/export?${params.toString()}`;
    };

    // ============ کارت‌های آمار ============
    const statCards = [
        {
            key: "total_paid_amount",
            variant: "green",
            title: "مجموع شارژهای موفق",
            icon: TrendingUp,
            color: "#065f46",
            bg: "#ecfdf5",
            border: "#a7f3d0",
            amount: stats.total_paid_amount ?? 0,
            unit: "تومان",
            isCount: false,
            description: "مجموع همه شارژهای پرداخت‌شده",
            breakdown: [
                {
                    label: "تعداد پرداخت‌شده",
                    value: stats.paid_count ?? 0,
                    isCount: true,
                },
                {
                    label: "میانگین هر شارژ",
                    value: stats.avg_amount ?? 0,
                    isCount: false,
                },
            ],
            actionLink: {
                label: "مشاهده همه",
                href: "/admin/finance/wallet/deposits?status=paid",
            },
        },
        {
            key: "pending_count",
            variant: "orange",
            title: "در انتظار پرداخت",
            icon: Clock,
            color: "#92400e",
            bg: "#fffbeb",
            border: "#fde68a",
            amount: stats.pending_count ?? 0,
            unit: "مورد",
            isCount: true,
            description: "درخواست‌های شارژ که هنوز پرداخت نشده‌اند",
            breakdown: [],
            actionLink: {
                label: "مشاهده در انتظار",
                href: "/admin/finance/wallet/deposits?status=pending",
            },
        },
        {
            key: "failed_count",
            variant: "red",
            title: "ناموفق",
            icon: XCircle,
            color: "#991b1b",
            bg: "#fef2f2",
            border: "#fecaca",
            amount: stats.failed_count ?? 0,
            unit: "مورد",
            isCount: true,
            description: "شارژهای ناموفق",
            breakdown: [],
            actionLink: {
                label: "مشاهده ناموفق‌ها",
                href: "/admin/finance/wallet/deposits?status=failed",
            },
        },
        {
            key: "today_paid_amount",
            variant: "purple",
            title: "شارژهای امروز",
            icon: Calendar,
            color: "#5b21b6",
            bg: "#f5f3ff",
            border: "#ddd6fe",
            amount: stats.today_paid_amount ?? 0,
            unit: "تومان",
            isCount: false,
            description: "مجموع شارژهای موفق امروز",
            breakdown: [
                {
                    label: "تعداد",
                    value: stats.today_paid_count ?? 0,
                    isCount: true,
                },
            ],
            actionLink: null,
        },
        {
            key: "success_rate",
            variant: "blue",
            title: "نرخ موفقیت",
            icon: Percent,
            color: "#1e40af",
            bg: "#eff6ff",
            border: "#bfdbfe",
            amount: stats.success_rate ?? 0,
            unit: "٪",
            isCount: true,
            description: "درصد شارژهای موفق",
            breakdown: [
                {
                    label: "موفق",
                    value: stats.paid_count ?? 0,
                    isCount: true,
                },
                {
                    label: "ناموفق",
                    value: stats.failed_count ?? 0,
                    isCount: true,
                },
                {
                    label: "در انتظار",
                    value: stats.pending_count ?? 0,
                    isCount: true,
                },
            ],
            actionLink: null,
        },
    ];

    // ============ رندر کارت‌های آمار ============
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
                            className={`finance-stat-card ${card.variant} has-hint`}
                            onClick={() => setSelectedStat(card)}
                            data-hint="کلیک کنید تا جزئیات را ببینید"
                            style={{ cursor: "pointer" }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                ) {
                                    event.preventDefault();
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
                                <span className="stat-label">
                                    {card.title}
                                    <Info
                                        size={11}
                                        className="stat-label-hint-icon"
                                    />
                                </span>

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

    // ============ رندر یک شارژ ============
    const renderDeposit = (deposit) => {
        const config = statusConfig[deposit.status] ?? statusConfig.pending;

        const StatusIcon = config.icon;

        const gatewayLabel =
            gatewayLabels[deposit.gateway] ?? deposit.gateway ?? "نامشخص";

        return (
            <div key={deposit.id} className="admin-transaction-item">
                <div className="transaction-icon credit">
                    <Coins size={18} />
                </div>

                <div className="transaction-content">
                    <div className="transaction-user">
                        {deposit.user?.name ?? "—"}

                        <span
                            className={`transaction-status-badge ${deposit.status}`}
                        >
                            <StatusIcon size={10} />
                            {config.label}
                        </span>

                        <span
                            className="transaction-flag"
                            style={{
                                background: "#f3f4f6",
                                color: "#4b5563",
                            }}
                        >
                            {gatewayLabel}
                        </span>
                    </div>

                    <div className="transaction-type">
                        شارژ کیف پول
                        {deposit.tracking_code && (
                            <span
                                style={{
                                    marginRight: "0.5rem",
                                    direction: "ltr",
                                    fontSize: "0.625rem",
                                    fontFamily: "monospace",
                                }}
                            >
                                {deposit.tracking_code}
                            </span>
                        )}
                    </div>

                    <div className="transaction-meta">
                        {deposit.paid_at && (
                            <span className="transaction-meta-item">
                                <Calendar size={10} />
                                پرداخت: {formatFullDateTime(deposit.paid_at)}
                            </span>
                        )}

                        {!deposit.paid_at && deposit.created_at && (
                            <span className="transaction-meta-item">
                                <Clock size={10} />
                                ایجاد: {formatFullDateTime(deposit.created_at)}
                            </span>
                        )}

                        {deposit.gateway_transaction_id && (
                            <span className="transaction-meta-item ltr">
                                <Hash size={10} />
                                {deposit.gateway_transaction_id}
                            </span>
                        )}

                        {deposit.failure_reason && (
                            <span
                                className="transaction-meta-item"
                                style={{ color: "#991b1b" }}
                            >
                                <AlertTriangle size={10} />
                                {deposit.failure_reason}
                            </span>
                        )}
                    </div>
                </div>

                <div className="transaction-amount">
                    <span
                        className={`amount ${
                            deposit.status === "paid" ? "credit" : "debit"
                        }`}
                    >
                        {deposit.status === "paid" ? "+" : ""}
                        {formatCompactNumber(
                            deposit.paid_amount || deposit.amount,
                        )}
                    </span>

                    <span className="amount-date">تومان</span>
                </div>

                <div className="transaction-actions">
                    {deposit.user?.profile_url && (
                        <Link
                            href={deposit.user.profile_url}
                            className="btn-ghost"
                            title={deposit.user.profile_label}
                        >
                            <User size={10} />
                            {deposit.user.profile_label ?? "کاربر"}
                        </Link>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <Head title="مدیریت شارژ کیف پول" />

            <div className="admin-finance-page">
                {/* هدر */}
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div className="finance-header-icon">
                            <Coins size={28} />
                        </div>

                        <div>
                            <h1>مدیریت شارژ کیف پول</h1>
                            <p>
                                مشاهده و مدیریت درخواست‌های شارژ کیف پول کاربران
                            </p>
                        </div>
                    </div>

                    <div className="finance-header-actions">
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <Plus size={14} />
                            شارژ دستی
                        </button>

                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() =>
                                router.reload({
                                    only: ["deposits", "stats"],
                                })
                            }
                        >
                            <RefreshCw size={14} />
                            بروزرسانی
                        </button>

                        <div className="export-dropdown">
                            {/* محل قرارگیری منوی خروجی */}
                        </div>
                    </div>
                </div>

                {/* آمار */}
                {renderStats()}

                {/* فیلتر سریع وضعیت */}
                <div className="status-filters">
                    <button
                        type="button"
                        className={`filter-btn ${
                            activeTab === "all" ? "active" : ""
                        }`}
                        onClick={() => quickFilter("")}
                    >
                        همه
                        {stats.total_count > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.total_count)}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        className={`filter-btn ${
                            activeTab === "paid" ? "active" : ""
                        }`}
                        onClick={() => quickFilter("paid")}
                    >
                        <CheckCircle size={12} />
                        پرداخت‌شده
                        {stats.paid_count > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.paid_count)}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        className={`filter-btn ${
                            activeTab === "pending" ? "active" : ""
                        }`}
                        onClick={() => quickFilter("pending")}
                    >
                        <Clock size={12} />
                        در انتظار
                        {stats.pending_count > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.pending_count)}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        className={`filter-btn ${
                            activeTab === "failed" ? "active" : ""
                        }`}
                        onClick={() => quickFilter("failed")}
                    >
                        <XCircle size={12} />
                        ناموفق
                        {stats.failed_count > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(stats.failed_count)}
                            </span>
                        )}
                    </button>
                </div>

                {/* نوار جستجو */}
                <div className="transactions-toolbar">
                    <SearchComponent
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onSearch={handleSearch}
                        placeholder="جستجو در نام، کد رهگیری، شماره تراکنش..."
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

                {/* پنل فیلتر */}
                {showFilters && (
                    <div className="filters-panel">
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label>وضعیت</label>

                                <select
                                    className="filter-select"
                                    value={localFilters.status}
                                    onChange={(event) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            status: event.target.value,
                                        }))
                                    }
                                >
                                    <option value="">همه</option>

                                    {statuses.map((status) => (
                                        <option
                                            key={status.value}
                                            value={status.value}
                                        >
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>درگاه</label>

                                <select
                                    className="filter-select"
                                    value={localFilters.gateway}
                                    onChange={(event) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            gateway: event.target.value,
                                        }))
                                    }
                                >
                                    <option value="">همه</option>

                                    {gateways.map((gateway) => (
                                        <option
                                            key={gateway.value}
                                            value={gateway.value}
                                        >
                                            {gateway.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* انتخاب کاربر برای فیلتر */}
                            <div className="filter-group">
                                <label>کاربر</label>
                                {/* <Select2
                                    isAsync={false}
                                    serverFilteredOptions={true}
                                    options={userSearchOptions}
                                    initialOptions={userOptions}
                                    value={form.user_id}
                                    onChange={handleUsersChange}
                                    onSearchChange={handleUserSearchChange}
                                    placeholder="جستجو و انتخاب کاربر..."
                                    isMulti={false}
                                    isSearchable={true}
                                    isClearable={true}
                                    closeMenuOnSelect={true}
                                    noOptionsMessage="کاربری یافت نشد"
                                /> */}

                                <Select2
                                    value={userId}
                                    onChange={setUserId}
                                    options={[]}
                                    initialOptions={[]}
                                    isAsync={true}
                                    asyncUrl="/admin/search/users"
                                    asyncMethod="GET"
                                    asyncDelay={400}
                                    searchParam="search"
                                    isSearchable={true}
                                    isClearable={true}
                                    isMulti={false}
                                    placeholder="نام یا شماره تلفن کاربر را جست‌وجو کنید..."
                                    noOptionsMessage="کاربری یافت نشد"
                                    loadingMessage="در حال جست‌وجوی کاربران..."
                                    closeMenuOnSelect={true}
                                />
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
                                    placeholder="تاریخ شروع"
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
                                    onChange={(event) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            min_amount: event.target.value,
                                        }))
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
                                    onChange={(event) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            max_amount: event.target.value,
                                        }))
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

                {/* فهرست شارژها */}
                <div className="finance-card">
                    <div className="finance-card-header">
                        <div className="card-icon-box green">
                            <Wallet size={20} />
                        </div>

                        <h2>شارژهای کیف پول</h2>

                        <span className="permissions-count">
                            {toPersianNumber(deposits.total || 0)} مورد
                        </span>
                    </div>

                    {deposits.data.length === 0 ? (
                        <div className="empty-state-large">
                            <Wallet size={48} />
                            <p>هیچ شارژی با این فیلترها یافت نشد</p>

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
                                {deposits.data.map(renderDeposit)}
                            </div>

                            <Pagination
                                links={deposits.links}
                                only={["deposits"]}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* جزئیات آمار */}
            <StatDetailModal
                isOpen={!!selectedStat}
                onClose={() => setSelectedStat(null)}
                config={selectedStat}
            />

            {/* مودال شارژ دستی */}
            {showCreateModal && (
                <CreateDepositModal
                    userOptions={userOptions}
                    onClose={() => setShowCreateModal(false)}
                />
            )}
        </Layout>
    );
}

// ============ مودال شارژ دستی ============
