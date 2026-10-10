import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PublicLayout from "../Layouts/Layout";
import {
    Receipt,
    Search,
    Filter,
    ArrowRight,
    CreditCard,
    Calendar,
    Scissors,
    X,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../utils/dateHelpers";
import "../Assets/Wallet.css";
import Pagination from "../../Admin/Components/Pagination";
import SearchComponent from "../../../Components/Search";
import PersianDatePicker from "../../../Components/PersianDatePicker";
import "../Assets/Payments.css";
const statusConfig = {
    pending: { label: "در انتظار پرداخت", color: "yellow" },
    success: { label: "موفق", color: "green" },
    failed: { label: "ناموفق", color: "red" },
    refunded: { label: "برگشت داده شده", color: "purple" },
};

const statusOptions = [
    { value: "", label: "همه" },
    { value: "success", label: "موفق" },
    { value: "pending", label: "در انتظار پرداخت" },
    { value: "failed", label: "ناموفق" },
    { value: "refunded", label: "برگشت داده شده" },
];

export default function Payments({ payments, filters = {} }) {
    const [localFilters, setLocalFilters] = useState({
        status: filters.status || "",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
    });
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    // const applyFilters = () => {
    //     router.get(route("customer.finance.wallet.payments"), localFilters, {
    //         preserveScroll: true,
    //         preserveState: true,
    //     });
    // };
    // ============ اعمال فیلترها ============
    const applyFilters = (newFilters = localFilters, search = searchTerm) => {
        router.get(
            route("customer.finance.wallet.payments"),
            {
                ...newFilters,
                search: search || "",
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    // ============ جستجو ============
    const handleSearch = (value) => {
        setIsSearching(true);
        router.get(
            route("customer.finance.wallet.payments"),
            {
                ...localFilters,
                search: value || "",
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    // ============ تغییر وضعیت (سریع) ============
    const handleStatusChange = (status) => {
        const newFilters = { ...localFilters, status };
        setLocalFilters(newFilters);
        applyFilters(newFilters);
    };

    // ============ پاک کردن فیلترها ============
    const clearFilters = () => {
        const cleared = {
            status: "",
            date_from: "",
            date_to: "",
        };
        setLocalFilters(cleared);
        setSearchTerm("");
        router.get(
            route("customer.finance.wallet.payments"),
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
        <PublicLayout>
            <Head title="پرداخت‌های من" />

            <div className="customer-wallet-page">
                {/* ============ هدر ============ */}
                <div className="wallet-header">
                    <div className="wallet-header-content">
                        <div className="wallet-header-icon">
                            <Receipt size={28} />
                        </div>
                        <div>
                            <h1>پرداخت‌های من</h1>
                            <p>تاریخچه پرداخت‌های شما در رزروها</p>
                        </div>
                    </div>

                    <div className="wallet-header-actions">
                        <Link
                            href={route("customer.finance.wallet.index")}
                            className="btn-secondary"
                        >
                            <ArrowRight size={16} />
                            بازگشت به کیف پول
                        </Link>
                    </div>
                </div>

                {/* ============ نوار جستجو + فیلتر ============ */}
                <div className="transactions-toolbar">
                    <SearchComponent
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onSearch={handleSearch}
                        placeholder="جستجو در نام آرایشگر ، نام خدمت ، شماره تراکنش..."
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
                        {hasActiveFilters && <span className="filter-dot" />}
                    </button>
                </div>

                {/* ============ پنل فیلترها ============ */}
                {showFilters && (
                    <div className="filters-panel">
                        {/* فیلتر وضعیت (سریع) */}
                        <div className="status-filters">
                            {statusOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`filter-btn ${
                                        localFilters.status === opt.value
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleStatusChange(opt.value)
                                    }
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* فیلتر تاریخ */}
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

                        {/* دکمه‌ها */}
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

                {/* ============ لیست پرداخت‌ها ============ */}
                <div className="wallet-card">
                    {payments.data.length === 0 ? (
                        <div className="empty-state-large">
                            <Receipt size={48} />
                            <p>پرداختی یافت نشد.</p>
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
                            <div className="payments-list">
                                {payments.data.map((p) => {
                                    const cfg = p.payment
                                        ? statusConfig[p.payment.status] ||
                                          statusConfig.pending
                                        : statusConfig.pending;

                                    return (
                                        <div
                                            key={p.id}
                                            className="payment-card"
                                        >
                                            <div className="payment-header">
                                                <div className="payment-barber">
                                                    {p.barber?.thumbnail && (
                                                        <img
                                                            src={
                                                                p.barber
                                                                    .thumbnail
                                                            }
                                                            alt={p.barber.name}
                                                        />
                                                    )}
                                                    <div className="barber-info">
                                                        <span className="barber-name">
                                                            {p.barber?.name ||
                                                                "نامشخص"}
                                                        </span>
                                                        <span className="service-name">
                                                            <Scissors
                                                                size={11}
                                                            />
                                                            {p.service?.name}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`payment-status ${cfg.color}`}
                                                >
                                                    {cfg.label}
                                                </span>
                                            </div>

                                            <div className="payment-body">
                                                <div className="payment-info">
                                                    <span className="payment-label">
                                                        مبلغ
                                                    </span>
                                                    <span className="payment-value">
                                                        {toPersianNumber(
                                                            p.amount.toLocaleString(),
                                                        )}{" "}
                                                        تومان
                                                    </span>
                                                </div>
                                                {p.payment?.paid_at && (
                                                    <div className="payment-info">
                                                        <span className="payment-label">
                                                            تاریخ پرداخت
                                                        </span>
                                                        <span className="payment-value small">
                                                            {formatFullDateTime(
                                                                p.payment
                                                                    .paid_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {p.payment?.transaction_id && (
                                                    <div className="payment-info">
                                                        <span className="payment-label">
                                                            شماره تراکنش
                                                        </span>
                                                        <span
                                                            className="payment-value mono small"
                                                            dir="ltr"
                                                        >
                                                            {
                                                                p.payment
                                                                    .transaction_id
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ============ صفحه‌بندی ============ */}
                            <Pagination links={payments.links} />
                        </>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
