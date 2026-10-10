import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import {
    ArrowUpRight,
    ArrowDownRight,
    Lock,
    Search,
    Filter,
    X,
    Wallet,
    Download,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../utils/dateHelpers";
import "../Assets/css/Wallet.css";
import PersianDatePicker from "../../../Components/PersianDatePicker";
import SearchComponent from "../../../Components/Search";
import Pagination from "../../Admin/Components/Pagination";
const directionOptions = [
    { value: "", label: "همه" },
    { value: "credit", label: "واریز" },
    { value: "debit", label: "برداشت" },
];

const statusOptions = [
    { value: "", label: "همه" },
    { value: "completed", label: "تکمیل شده" },
    { value: "pending", label: "در انتظار" },
    { value: "failed", label: "ناموفق" },
    { value: "cancelled", label: "لغو شده" },
];

export default function Transactions({
    transactions,
    filters,
    transactionTypes,
}) {
    const [localFilters, setLocalFilters] = useState({
        type: filters.type || "",
        direction: filters.direction || "",
        status: filters.status || "",
        search: filters.search || "",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
    });

    const [showFilters, setShowFilters] = useState(false);

    // ٌ

    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (value) => {
        setIsSearching(true);
        router.get(
            route("barber.finance.wallet.transactions"),
            {
                ...localFilters,
                search: value,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    // ============ اعمال فیلترها ============
    const applyFilters = (newFilters = localFilters) => {
        router.get(
            route("barber.finance.wallet.transactions"),
            {
                ...newFilters,
                search: searchTerm,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const clearFilters = () => {
        const cleared = {
            type: "",
            direction: "",
            status: "",
            date_from: "",
            date_to: "",
        };
        setLocalFilters(cleared);
        setSearchTerm("");
        router.get(
            route("barber.finance.wallet.transactions"),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    // ============ آیا فیلتری فعاله؟ ============
    const hasActiveFilters =
        Object.values(localFilters).some((v) => v) || searchTerm.trim() !== "";
    return (
        <Layout>
            <Head title="تراکنش‌ها" />

            <div className="barber-wallet-page">
                {/* ============ هدر ============ */}
                <div className="wallet-header">
                    <div className="wallet-header-content">
                        <div className="wallet-header-icon">
                            <Wallet size={28} />
                        </div>
                        <div>
                            <h1>تراکنش‌ها</h1>
                            <p>تاریخچه کامل تراکنش‌های کیف پول</p>
                        </div>
                    </div>

                    <div className="wallet-header-actions">
                        <Link
                            href={route("barber.finance.wallet.index")}
                            className="btn-secondary"
                        >
                            <Wallet size={16} />
                            کیف پول
                        </Link>
                    </div>
                </div>

                {/* ============ نوار جستجو ============ */}
                <div className="transactions-toolbar">
                    <SearchComponent
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onSearch={handleSearch}
                        placeholder="جستجو در توضیحات..."
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
                        {hasActiveFilters && <span className="filter-dot" />}
                    </button>
                </div>

                {/* ============ پنل فیلترها ============ */}
                {showFilters && (
                    <div className="filters-panel">
                        <div className="filters-grid">
                            {/* نوع */}
                            <div className="filter-group">
                                <label>نوع تراکنش</label>
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
                                    <option value="">همه</option>
                                    {transactionTypes.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* جهت */}
                            <div className="filter-group">
                                <label>جهت</label>
                                <select
                                    className="filter-select"
                                    value={localFilters.direction}
                                    onChange={(e) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            direction: e.target.value,
                                        }))
                                    }
                                >
                                    {directionOptions.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* وضعیت */}
                            <div className="filter-group">
                                <label>وضعیت</label>
                                <select
                                    className="filter-select"
                                    value={localFilters.status}
                                    onChange={(e) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            status: e.target.value,
                                        }))
                                    }
                                >
                                    {statusOptions.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* تاریخ از */}
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

                            {/* تاریخ تا */}
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
                                <Filter size={14} />
                                اعمال فیلتر
                            </button>
                        </div>
                    </div>
                )}

                {/* ============ لیست تراکنشها ============ */}
                <div className="wallet-card">
                    {transactions.data.length === 0 ? (
                        <div className="empty-state-large">
                            <Wallet size={48} />
                            <p>تراکنشی یافت نشد.</p>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    className="btn-ghost"
                                    onClick={clearFilters}
                                >
                                    پاک کردن فیلترها
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="transactions-list">
                                {transactions.data.map((t) => {
                                    const isCredit = t.direction === "credit";

                                    return (
                                        <div
                                            key={t.id}
                                            className="transaction-item detailed"
                                        >
                                            <div
                                                className={`transaction-icon ${
                                                    isCredit
                                                        ? "credit"
                                                        : "debit"
                                                }`}
                                            >
                                                {isCredit ? (
                                                    <ArrowDownRight size={16} />
                                                ) : (
                                                    <ArrowUpRight size={16} />
                                                )}
                                            </div>

                                            <div className="transaction-content">
                                                <div className="transaction-title">
                                                    <span>{t.type_label}</span>
                                                    {t.is_locked && (
                                                        <span className="lock-badge">
                                                            <Lock size={10} />
                                                            قفل‌شده
                                                        </span>
                                                    )}
                                                    <span
                                                        className={`transaction-status status-${t.status}`}
                                                    >
                                                        {t.status_label}
                                                    </span>
                                                </div>

                                                <span className="transaction-desc">
                                                    {t.description}
                                                </span>

                                                <div className="transaction-meta">
                                                    <span className="meta-id">
                                                        #{toPersianNumber(t.id)}
                                                    </span>
                                                    <span className="meta-separator">
                                                        •
                                                    </span>
                                                    <span className="meta-date">
                                                        {formatFullDateTime(
                                                            t.created_at,
                                                        )}
                                                    </span>
                                                    {t.balance_after !==
                                                        undefined && (
                                                        <>
                                                            <span className="meta-separator">
                                                                •
                                                            </span>
                                                            <span className="meta-balance">
                                                                موجودی:{" "}
                                                                {toPersianNumber(
                                                                    t.balance_after.toLocaleString(),
                                                                )}{" "}
                                                                تومان
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="transaction-amount">
                                                <span
                                                    className={`amount-value ${
                                                        isCredit
                                                            ? "credit"
                                                            : "debit"
                                                    }`}
                                                >
                                                    {isCredit ? "+" : "-"}
                                                    {toPersianNumber(
                                                        t.amount.toLocaleString(),
                                                    )}
                                                </span>
                                                <span className="amount-currency">
                                                    تومان
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ============ صفحهبندی ============ */}
                            <Pagination links={transactions.links} />
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
