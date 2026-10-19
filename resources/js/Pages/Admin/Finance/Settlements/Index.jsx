import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../../Layouts/Layout";
import {
    CreditCard,
    Filter,
    ArrowRight,
    Eye,
    Play,
    CheckCircle,
    XCircle,
    Ban,
    RotateCcw,
    Download,
    Clock4,
    TrendingUp,
    AlertTriangle,
    Users,
    Wallet,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../../utils/dateHelpers";
import SearchComponent from "../../../../Components/Search";
import PersianDatePicker from "../../../../Components/PersianDatePicker";
import Pagination from "../../Components/Pagination";
import SettlementStats from "../../Components/SettlementStats";
import SettlementCard from "../../Components/SettlementCard";
import ProcessModal from "../../Components/ProcessModal";
import CompleteModal from "../../Components/CompleteModal";
import RejectModal from "../../Components/RejectModal";
import "../../Assets/css/SettlementsAdmin.css";

const statusOptions = [
    { value: "", label: "همه" },
    { value: "pending", label: "در انتظار" },
    { value: "processing", label: "در حال پردازش" },
    { value: "completed", label: "تکمیل شده" },
    { value: "failed", label: "ناموفق" },
    { value: "cancelled", label: "لغو شده" },
];

const typeOptions = [
    { value: "", label: "همه" },
    { value: "barber_payout", label: "واریز به آرایشگر" },
    { value: "customer_refund", label: "بازگشت به مشتری" },
];

export default function SettlementsIndex({ settlements, stats, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const [localFilters, setLocalFilters] = useState({
        status: filters.status || "",
        type: filters.type || "",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
        min_amount: filters.min_amount || "",
        max_amount: filters.max_amount || "",
        sort: filters.sort || "latest",
    });

    // مودالها
    const [processModal, setProcessModal] = useState({
        isOpen: false,
        settlement: null,
        isLoading: false,
    });
    const [completeModal, setCompleteModal] = useState({
        isOpen: false,
        settlement: null,
        isLoading: false,
    });
    const [rejectModal, setRejectModal] = useState({
        isOpen: false,
        settlement: null,
        isLoading: false,
    });

    const formatAmount = (value) =>
        toPersianNumber(Number(value || 0).toLocaleString());

    // ============ اعمال فیلترها ============
    const applyFilters = (newFilters = localFilters, search = searchTerm) => {
        router.get(
            route("admin.finance.settlements.index"),
            { ...newFilters, search: search || "" },
            { preserveScroll: true, preserveState: true },
        );
    };

    // ============ جستجو ============
    const handleSearch = (value) => {
        setIsSearching(true);
        router.get(
            route("admin.finance.settlements.index"),
            { ...localFilters, search: value || "" },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    // ============ پاک کردن فیلترها ============
    const clearFilters = () => {
        const cleared = {
            status: "",
            type: "",
            date_from: "",
            date_to: "",
            min_amount: "",
            max_amount: "",
            sort: "latest",
        };
        setLocalFilters(cleared);
        setSearchTerm("");
        router.get(
            route("admin.finance.settlements.index"),
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    // ============ انتخاب دستهجمعی ============
    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const toggleSelectAll = () => {
        const pendingIds = settlements.data
            .filter((s) => s.status === "pending")
            .map((s) => s.id);

        if (selectedIds.length === pendingIds.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pendingIds);
        }
    };

    // ============ پردازش دستهجمعی ============
    const handleBulkProcess = () => {
        if (selectedIds.length === 0) return;

        router.post(
            route("admin.finance.settlements.bulk-process"),
            { ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedIds([]),
            },
        );
    };

    const hasActiveFilters =
        Object.values(localFilters).some((v) => v && v !== "latest") ||
        searchTerm.trim() !== "";

    const activeFiltersCount = Object.values(localFilters).filter(
        (v) => v && v !== "latest",
    ).length;

    const pendingCount = settlements.data.filter(
        (s) => s.status === "pending",
    ).length;

    // ============ تب‌های فیلتر سریع ============
    const statusTabs = [
        { value: "", label: "همه", icon: CreditCard },
        { value: "pending", label: "در انتظار", icon: Clock4 },
        { value: "processing", label: "در حال پردازش", icon: Play },
        { value: "completed", label: "تکمیل شده", icon: CheckCircle },
        { value: "failed", label: "ناموفق", icon: XCircle },
        { value: "cancelled", label: "لغو شده", icon: Ban },
    ];

    const applyQuickFilter = (status) => {
        setLocalFilters((prev) => ({ ...prev, status }));
        router.get(
            route("admin.finance.settlements.index"),
            { ...localFilters, status, search: searchTerm || "" },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <Layout>
            <Head title="مدیریت تسویه ها" />

            <div className="admin-settlements-page">
                {/* ============ هدر ============ */}
                <div className="settlements-header">
                    <div className="settlements-header-content">
                        <div className="settlements-header-icon">
                            <CreditCard size={28} />
                        </div>
                        <div>
                            <h1>مدیریت تسویه ها</h1>
                            <p>بررسی و پردازش درخواستهای برداشت کاربران</p>
                        </div>
                    </div>

                    <div className="settlements-header-actions">
                        <Link
                            href={route("admin.finance.index")}
                            className="btn-secondary"
                        >
                            <TrendingUp size={16} />
                            داشبورد مالی
                        </Link>
                    </div>
                </div>

                {/* ============ آمار ============ */}
                <SettlementStats stats={stats} />
                {/* ============ تب‌های فیلتر سریع وضعیت ============ */}
                <div className="status-filters">
                    {statusTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = localFilters.status === tab.value;
                        const count = tab.value
                            ? (stats[`${tab.value}_count`] ?? 0)
                            : (stats.total_count ?? 0);

                        return (
                            <button
                                key={tab.value || "all"}
                                type="button"
                                className={`filter-btn ${isActive ? "active" : ""}`}
                                onClick={() => applyQuickFilter(tab.value)}
                            >
                                <Icon size={12} />
                                {tab.label}
                                {count > 0 && (
                                    <span className="filter-count-badge">
                                        {toPersianNumber(count)}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
                {/* ============ نوار ابزار ============ */}
                <div className="settlements-toolbar">
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
                        className={`filter-toggle ${showFilters ? "active" : ""}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={14} />
                        فیلتر پیشرفته
                        {activeFiltersCount > 0 && (
                            <span className="filter-count">
                                {toPersianNumber(activeFiltersCount)}
                            </span>
                        )}
                    </button>

                    {selectedIds.length > 0 && (
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleBulkProcess}
                        >
                            <Play size={14} />
                            پردازش {toPersianNumber(selectedIds.length)} مورد
                        </button>
                    )}
                </div>

                {/* ============ پنل فیلترها ============ */}
                {showFilters && (
                    <div className="filters-panel">
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label className="filter-label">
                                    <span className="label-icon">
                                        <Clock4 size={14} />
                                    </span>
                                    <span className="label-text">وضعیت</span>
                                </label>
                                <select
                                    className="filter-select"
                                    value={localFilters.status}
                                    onChange={(e) =>
                                        setLocalFilters((p) => ({
                                            ...p,
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

                            <div className="filter-group">
                                <label className="filter-label">
                                    <span className="label-icon">
                                        <Wallet size={14} />
                                    </span>
                                    <span className="label-text">نوع</span>
                                </label>
                                <select
                                    className="filter-select"
                                    value={localFilters.type}
                                    onChange={(e) =>
                                        setLocalFilters((p) => ({
                                            ...p,
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

                            <div className="filter-group">
                                <label className="filter-label">
                                    <span className="label-icon">
                                        <TrendingUp size={14} />
                                    </span>
                                    <span className="label-text">
                                        حداقل مبلغ
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    className="filter-input"
                                    value={localFilters.min_amount}
                                    onChange={(e) =>
                                        setLocalFilters((p) => ({
                                            ...p,
                                            min_amount: e.target.value,
                                        }))
                                    }
                                    placeholder="تومان"
                                />
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">
                                    <span className="label-icon">
                                        <TrendingUp size={14} />
                                    </span>
                                    <span className="label-text">
                                        حداکثر مبلغ
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    className="filter-input"
                                    value={localFilters.max_amount}
                                    onChange={(e) =>
                                        setLocalFilters((p) => ({
                                            ...p,
                                            max_amount: e.target.value,
                                        }))
                                    }
                                    placeholder="تومان"
                                />
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">
                                    <span className="label-icon">
                                        <ArrowRight size={14} />
                                    </span>
                                    <span className="label-text">مرتبسازی</span>
                                </label>
                                <select
                                    className="filter-select"
                                    value={localFilters.sort}
                                    onChange={(e) =>
                                        setLocalFilters((p) => ({
                                            ...p,
                                            sort: e.target.value,
                                        }))
                                    }
                                >
                                    <option value="latest">جدیدترین</option>
                                    <option value="oldest">قدیمیترین</option>
                                    <option value="amount_high">
                                        بیشترین مبلغ
                                    </option>
                                    <option value="amount_low">
                                        کمترین مبلغ
                                    </option>
                                    <option value="priority">
                                        اولویت (در انتظار اول)
                                    </option>
                                </select>
                            </div>
                        </div>

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

                {/* ============ انتخاب همه ============ */}
                {pendingCount > 0 && (
                    <div className="bulk-select-bar">
                        <label className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                checked={
                                    selectedIds.length === pendingCount &&
                                    pendingCount > 0
                                }
                                onChange={toggleSelectAll}
                            />
                            <span className="checkbox-label">
                                انتخاب همه «در انتظار» (
                                {toPersianNumber(pendingCount)})
                            </span>
                        </label>

                        {selectedIds.length > 0 && (
                            <span className="selected-count">
                                {toPersianNumber(selectedIds.length)} مورد
                                انتخاب شده
                            </span>
                        )}
                    </div>
                )}

                {/* ============ لیست ============ */}
                <div className="settlements-list-wrapper">
                    {settlements.data.length === 0 ? (
                        <div className="empty-state-large">
                            <CreditCard size={48} />
                            <p>تسویهای یافت نشد.</p>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    className="btn-ghost"
                                    onClick={clearFilters}
                                >
                                    <RotateCcw size={14} />
                                    پاک کردن فیلترها
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="settlements-list">
                            {settlements.data.map((s) => (
                                <SettlementCard
                                    key={s.id}
                                    settlement={s}
                                    isSelected={selectedIds.includes(s.id)}
                                    onSelect={() => toggleSelect(s.id)}
                                    onProcess={() =>
                                        setProcessModal({
                                            isOpen: true,
                                            settlement: s,
                                            isLoading: false,
                                        })
                                    }
                                    onComplete={() =>
                                        setCompleteModal({
                                            isOpen: true,
                                            settlement: s,
                                            isLoading: false,
                                        })
                                    }
                                    onReject={() =>
                                        setRejectModal({
                                            isOpen: true,
                                            settlement: s,
                                            isLoading: false,
                                        })
                                    }
                                />
                            ))}
                        </div>
                    )}

                    <Pagination
                        links={settlements.links}
                        only={["settlements"]}
                    />
                </div>
            </div>

            {/* ============ مودالها ============ */}
            <ProcessModal
                isOpen={processModal.isOpen}
                settlement={processModal.settlement}
                isLoading={processModal.isLoading}
                onClose={() =>
                    setProcessModal({
                        isOpen: false,
                        settlement: null,
                        isLoading: false,
                    })
                }
            />

            <CompleteModal
                isOpen={completeModal.isOpen}
                settlement={completeModal.settlement}
                isLoading={completeModal.isLoading}
                onClose={() =>
                    setCompleteModal({
                        isOpen: false,
                        settlement: null,
                        isLoading: false,
                    })
                }
            />

            <RejectModal
                isOpen={rejectModal.isOpen}
                settlement={rejectModal.settlement}
                isLoading={rejectModal.isLoading}
                onClose={() =>
                    setRejectModal({
                        isOpen: false,
                        settlement: null,
                        isLoading: false,
                    })
                }
            />
        </Layout>
    );
}
