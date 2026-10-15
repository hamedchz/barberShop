import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import {
    Users,
    Search,
    Eye,
    UserX,
    UserCheck,
    Phone,
    Mail,
    AlertTriangle,
    Calendar,
    Filter,
    RotateCcw,
    ShoppingBag,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../utils/dateHelpers";
import SearchComponent from "../../../Components/Search";
import Pagination from "../../Admin/Components/Pagination";
import "../Assets/css/Customers.css";

export default function CustomersIndex({ customers, stats, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        is_active: filters.is_active || "",
        sort: filters.sort || "latest",
    });

    // ============ اعمال فیلترها ============
    const applyFilters = (newFilters = localFilters, search = searchTerm) => {
        router.get(
            route("admin.customers.index"),
            { ...newFilters, search: search || "" },
            { preserveScroll: true, preserveState: true },
        );
    };

    // ============ جستجو ============
    const handleSearch = (value) => {
        setIsSearching(true);
        router.get(
            route("admin.customers.index"),
            { ...localFilters, search: value },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    // ============ پاک کردن فیلترها ============
    const clearFilters = () => {
        const cleared = { is_active: "", sort: "latest" };
        setLocalFilters(cleared);
        setSearchTerm("");
        router.get(
            route("admin.customers.index"),
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    // ============ فعال/غیرفعال ============
    const handleToggleStatus = (customer) => {
        router.patch(
            route("admin.customers.toggle", customer.id),
            {},
            { preserveScroll: true },
        );
    };

    const hasActiveFilters =
        Object.values(localFilters).some((v) => v && v !== "latest") ||
        searchTerm.trim() !== "";

    return (
        <Layout>
            <Head title="مدیریت مشتریان" />

            <div className="admin-customers-page">
                {/* ============ هدر ============ */}
                <div className="customers-header">
                    <div className="customers-header-content">
                        <div className="customers-header-icon">
                            <Users size={28} />
                        </div>
                        <div>
                            <h1>مدیریت مشتریان</h1>
                            <p>لیست و مدیریت مشتریان پلتفرم</p>
                        </div>
                    </div>
                </div>

                {/* ============ آمار ============ */}
                <div className="customers-stats-grid">
                    <div className="customer-stat-card blue">
                        <div className="stat-icon-box">
                            <Users size={20} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">کل مشتریان</span>
                            <span className="stat-value">
                                {toPersianNumber(stats.total)}
                            </span>
                        </div>
                    </div>

                    <div className="customer-stat-card green">
                        <div className="stat-icon-box">
                            <UserCheck size={20} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">فعال</span>
                            <span className="stat-value">
                                {toPersianNumber(stats.active)}
                            </span>
                        </div>
                    </div>

                    <div className="customer-stat-card gray">
                        <div className="stat-icon-box">
                            <UserX size={20} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">غیرفعال</span>
                            <span className="stat-value">
                                {toPersianNumber(stats.inactive)}
                            </span>
                        </div>
                    </div>

                    <div className="customer-stat-card red">
                        <div className="stat-icon-box">
                            <AlertTriangle size={20} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">دارای اخطار</span>
                            <span className="stat-value">
                                {toPersianNumber(stats.banned)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ============ نوار ابزار ============ */}
                <div className="customers-toolbar">
                    <SearchComponent
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onSearch={handleSearch}
                        placeholder="جستجو در نام، ایمیل یا شماره..."
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
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label>وضعیت حساب</label>
                                <select
                                    className="filter-select"
                                    value={localFilters.is_active}
                                    onChange={(e) =>
                                        setLocalFilters((p) => ({
                                            ...p,
                                            is_active: e.target.value,
                                        }))
                                    }
                                >
                                    <option value="">همه</option>
                                    <option value="1">فعال</option>
                                    <option value="0">غیرفعال</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>مرتب‌سازی</label>
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
                                    <option value="oldest">قدیمی‌ترین</option>
                                    <option value="most_bookings">
                                        بیشترین رزرو
                                    </option>
                                    <option value="most_warnings">
                                        بیشترین اخطار
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

                {/* ============ لیست ============ */}
                <div className="customers-list-card">
                    {customers.data.length === 0 ? (
                        <div className="empty-state">
                            <Users size={48} />
                            <p>مشتری‌ای یافت نشد.</p>
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
                        <>
                            <div className="customers-list">
                                {customers.data.map((customer) => (
                                    <div
                                        key={customer.id}
                                        className={`customer-item ${
                                            !customer.is_active
                                                ? "inactive"
                                                : ""
                                        }`}
                                    >
                                        {/* آواتار */}
                                        <div className="customer-avatar-wrapper">
                                            {customer.thumbnail ? (
                                                <img
                                                    src={customer.thumbnail}
                                                    alt={customer.name}
                                                />
                                            ) : (
                                                <span>
                                                    {customer.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        {/* محتوا */}
                                        <div className="customer-content">
                                            <div className="customer-header">
                                                <span className="customer-name">
                                                    {customer.name}
                                                </span>
                                                <span
                                                    className={`customer-status ${
                                                        customer.is_active
                                                            ? "active"
                                                            : "inactive"
                                                    }`}
                                                >
                                                    {customer.is_active
                                                        ? "فعال"
                                                        : "غیرفعال"}
                                                </span>
                                                {customer.total_warnings >
                                                    0 && (
                                                    <span className="customer-warning-badge">
                                                        <AlertTriangle
                                                            size={10}
                                                        />
                                                        {toPersianNumber(
                                                            customer.total_warnings,
                                                        )}{" "}
                                                        اخطار
                                                    </span>
                                                )}
                                            </div>

                                            <div className="customer-contact">
                                                {customer.phone && (
                                                    <span
                                                        className="contact-item"
                                                        dir="ltr"
                                                    >
                                                        <Phone size={12} />
                                                        {toPersianNumber(
                                                            customer.phone,
                                                        )}
                                                    </span>
                                                )}
                                                {customer.email && (
                                                    <span
                                                        className="contact-item"
                                                        dir="ltr"
                                                    >
                                                        <Mail size={12} />
                                                        {customer.email}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="customer-meta">
                                                <span className="meta-item">
                                                    <ShoppingBag size={12} />
                                                    {toPersianNumber(
                                                        customer.total_bookings,
                                                    )}{" "}
                                                    رزرو
                                                </span>
                                                <span className="meta-separator">
                                                    •
                                                </span>
                                                <span className="meta-item">
                                                    <Calendar size={12} />
                                                    {formatFullDateTime(
                                                        customer.created_at,
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* عملیات */}
                                        <div className="customer-actions">
                                            <button
                                                type="button"
                                                className="action-btn toggle"
                                                onClick={() =>
                                                    handleToggleStatus(customer)
                                                }
                                                title={
                                                    customer.is_active
                                                        ? "غیرفعال کردن"
                                                        : "فعال کردن"
                                                }
                                            >
                                                {customer.is_active ? (
                                                    <UserX size={14} />
                                                ) : (
                                                    <UserCheck size={14} />
                                                )}
                                            </button>

                                            <Link
                                                href={route(
                                                    "admin.customers.show",
                                                    customer.id,
                                                )}
                                                className="action-btn view"
                                                title="مشاهده جزئیات"
                                            >
                                                <Eye size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Pagination
                                links={customers.links}
                                only={["customers"]}
                            />
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
