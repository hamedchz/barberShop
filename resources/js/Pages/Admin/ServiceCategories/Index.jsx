import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import {
    Plus,
    Search,
    X,
    Edit3,
    Trash2,
    Power,
    PowerOff,
    Package,
    Scissors,
    Palette,
    Sparkles,
    Brush,
    Droplet,
    Flower,
    Crown,
    Star,
    Wind,
    Sun,
    Zap,
    Heart,
    Clock,
    DollarSign,
    AlertCircle,
    LayoutGrid,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import ConfirmModal from "../Components/ConfirmModal";
import "./Assets/css/Index.css";
import ComponentSearch from "../../../Components/Search";
const ICON_MAP = {
    Scissors,
    Palette,
    Sparkles,
    Brush,
    Droplet,
    Flower,
    Crown,
    Star,
    Wind,
    Sun,
    Zap,
    Heart,
};

export default function ServiceCategoriesIndex({ categories, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        category: null,
    });

    // ============ همگام‌سازی با فیلتر سرور ============
    useEffect(() => {
        setSearchTerm(filters.search || "");
    }, [filters.search]);

    // ============ جستجو با کامپوننت Search ============
    const handleSearch = (term) => {
        setIsSearching(true);

        router.get(
            route("admin.service-categories.index"),
            {
                ...filters,
                search: term || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["categories", "filters"],
                onFinish: () => setIsSearching(false),
            },
        );
    };

    // ============ فیلتر وضعیت ============
    const handleStatusFilter = (status) => {
        router.get(
            route("admin.service-categories.index"),
            { ...filters, status: status || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    // ============ تغییر وضعیت ============
    const handleToggleStatus = (category) => {
        router.patch(
            route("admin.service-categories.toggle-status", category.id),
            {},
            { preserveScroll: true },
        );
    };

    // ============ حذف ============
    const handleDelete = (category) => {
        setDeleteModal({ isOpen: true, category });
    };
    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            role: null,
            isLoading: false,
        });
    };
    const handleConfirmDelete = () => {
        if (!deleteModal.category) return;

        setDeleteModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(
            `/admin/service-categories/${deleteModal.category.id}/destroy`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Modal بعد از موفقیت بسته می‌شود
                    closeDeleteModal();
                },
                onError: () => {
                    // در صورت خطا، حالت Loading را برمی‌گردانیم
                    setDeleteModal((prev) => ({ ...prev, isLoading: false }));
                },
            },
        );
    };

    const clearFilters = () => {
        setSearchQuery("");
        router.get(route("admin.service-categories.index"));
    };

    const hasActiveFilters = filters.search || filters.status;

    return (
        <Layout>
            <Head title="مدیریت دسته‌بندی خدمات" />

            <div className="service-categories-page">
                {/* ============ Header ============ */}
                <div className="sc-header">
                    <div className="sc-header-content">
                        <div className="sc-header-icon">
                            <LayoutGrid size={28} />
                        </div>
                        <div>
                            <h1>مدیریت دسته‌بندی خدمات</h1>
                            <p>تعریف و مدیریت دسته‌بندی‌های خدمات آرایشگاه</p>
                        </div>
                    </div>

                    <Link
                        href={route("admin.service-categories.create")}
                        className="sc-create-btn"
                    >
                        <Plus size={18} />
                        دسته‌بندی جدید
                    </Link>
                </div>

                {/* ============ Stats ============ */}
                <div className="sc-stats-grid">
                    <div className="sc-stat-card green">
                        <div className="sc-stat-icon">
                            <LayoutGrid size={20} />
                        </div>
                        <div className="sc-stat-content">
                            <span className="sc-stat-label">
                                کل دسته‌بندی‌ها
                            </span>
                            <span className="sc-stat-value">
                                {toPersianNumber(stats.total)}
                            </span>
                        </div>
                    </div>

                    <div className="sc-stat-card primary">
                        <div className="sc-stat-icon">
                            <Power size={20} />
                        </div>
                        <div className="sc-stat-content">
                            <span className="sc-stat-label">فعال</span>
                            <span className="sc-stat-value">
                                {toPersianNumber(stats.active)}
                            </span>
                        </div>
                    </div>

                    <div className="sc-stat-card gray">
                        <div className="sc-stat-icon">
                            <PowerOff size={20} />
                        </div>
                        <div className="sc-stat-content">
                            <span className="sc-stat-label">غیرفعال</span>
                            <span className="sc-stat-value">
                                {toPersianNumber(stats.inactive)}
                            </span>
                        </div>
                    </div>

                    <div className="sc-stat-card blue">
                        <div className="sc-stat-icon">
                            <Package size={20} />
                        </div>
                        <div className="sc-stat-content">
                            <span className="sc-stat-label">کل خدمات</span>
                            <span className="sc-stat-value">
                                {toPersianNumber(stats.total_services)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ============ Toolbar ============ */}
                <div className="sc-toolbar">
                    {/* ✅ کامپوننت Search */}
                    <div className="sc-search-wrapper-custom">
                        <ComponentSearch
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={handleSearch}
                            placeholder="جستجو در نام دسته‌بندی یا توضیحات..."
                            delay={500}
                            isLoading={isSearching}
                        />
                    </div>

                    <div className="sc-filters">
                        <button
                            type="button"
                            className={`sc-filter-btn ${
                                !filters.status ? "active" : ""
                            }`}
                            onClick={() => handleStatusFilter("")}
                        >
                            همه
                        </button>
                        <button
                            type="button"
                            className={`sc-filter-btn ${
                                filters.status === "active" ? "active" : ""
                            }`}
                            onClick={() => handleStatusFilter("active")}
                        >
                            فعال
                        </button>
                        <button
                            type="button"
                            className={`sc-filter-btn ${
                                filters.status === "inactive" ? "active" : ""
                            }`}
                            onClick={() => handleStatusFilter("inactive")}
                        >
                            غیرفعال
                        </button>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                className="sc-filter-btn clear"
                                onClick={clearFilters}
                            >
                                <X size={14} />
                                پاک کردن
                            </button>
                        )}
                    </div>
                </div>

                {/* ============ Grid ============ */}
                {categories.data.length > 0 ? (
                    <>
                        <div className="sc-grid">
                            {categories.data.map((category) => {
                                const Icon =
                                    ICON_MAP[category.icon] || Scissors;
                                return (
                                    <div
                                        key={category.id}
                                        className={`sc-card ${
                                            category.is_active
                                                ? "active"
                                                : "inactive"
                                        } ${category.color}`}
                                    >
                                        {/* نوار رنگی */}
                                        <div className="sc-card-stripe" />

                                        {/* Header */}
                                        <div className="sc-card-header">
                                            <div
                                                className={`sc-card-icon ${category.color}`}
                                            >
                                                <Icon size={22} />
                                            </div>

                                            <div className="sc-card-status">
                                                {category.is_active ? (
                                                    <span className="sc-badge active">
                                                        <Power size={10} />
                                                        فعال
                                                    </span>
                                                ) : (
                                                    <span className="sc-badge inactive">
                                                        <PowerOff size={10} />
                                                        غیرفعال
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Image */}
                                        {category.image_url && (
                                            <div className="sc-card-image">
                                                <img
                                                    src={category.image_url}
                                                    alt={category.name}
                                                />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="sc-card-content">
                                            <h3 className="sc-card-title">
                                                {category.name}
                                            </h3>
                                            {category.description && (
                                                <p className="sc-card-description">
                                                    {category.description}
                                                </p>
                                            )}

                                            {/* Meta */}
                                            <div className="sc-card-meta">
                                                {(category.min_price ||
                                                    category.max_price) && (
                                                    <div className="sc-meta-item price">
                                                        <DollarSign size={12} />
                                                        {category.min_price &&
                                                        category.max_price
                                                            ? `${toPersianNumber(
                                                                  category.min_price.toLocaleString(),
                                                              )} - ${toPersianNumber(
                                                                  category.max_price.toLocaleString(),
                                                              )}`
                                                            : category.min_price
                                                              ? `از ${toPersianNumber(
                                                                    category.min_price.toLocaleString(),
                                                                )}`
                                                              : `تا ${toPersianNumber(
                                                                    category.max_price.toLocaleString(),
                                                                )}`}{" "}
                                                        تومان
                                                    </div>
                                                )}

                                                {category.suggested_duration && (
                                                    <div className="sc-meta-item">
                                                        <Clock size={12} />
                                                        {toPersianNumber(
                                                            category.suggested_duration,
                                                        )}{" "}
                                                        دقیقه
                                                    </div>
                                                )}
                                            </div>

                                            {/* Services count */}
                                            <div className="sc-card-services">
                                                <Package size={14} />
                                                <span>
                                                    {toPersianNumber(
                                                        category.services_count,
                                                    )}{" "}
                                                    خدمت
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="sc-card-actions">
                                            <Link
                                                href={route(
                                                    "admin.service-categories.edit",
                                                    category.id,
                                                )}
                                                className="sc-action-btn edit"
                                            >
                                                <Edit3 size={14} />
                                                ویرایش
                                            </Link>

                                            <button
                                                type="button"
                                                className="sc-action-btn toggle"
                                                onClick={() =>
                                                    handleToggleStatus(category)
                                                }
                                                title={
                                                    category.is_active
                                                        ? "غیرفعال کردن"
                                                        : "فعال کردن"
                                                }
                                            >
                                                {category.is_active ? (
                                                    <PowerOff size={14} />
                                                ) : (
                                                    <Power size={14} />
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                className="sc-action-btn delete"
                                                onClick={() =>
                                                    handleDelete(category)
                                                }
                                                title="حذف"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {categories.last_page > 1 && (
                            <div className="sc-pagination">
                                {categories.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || "#"}
                                        className={`sc-page-item ${
                                            link.active ? "active" : ""
                                        } ${!link.url ? "disabled" : ""}`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="sc-empty">
                        <LayoutGrid size={64} />
                        <h3>
                            {hasActiveFilters
                                ? "دسته‌بندی‌ای یافت نشد"
                                : "هنوز دسته‌بندی ایجاد نکرده‌اید"}
                        </h3>
                        <p>
                            {hasActiveFilters
                                ? "فیلترها را تغییر دهید یا پاک کنید."
                                : "برای شروع، اولین دسته‌بندی خدمت را ایجاد کنید."}
                        </p>
                        {hasActiveFilters ? (
                            <button
                                type="button"
                                className="sc-create-btn"
                                onClick={clearFilters}
                            >
                                <X size={16} />
                                پاک کردن فیلترها
                            </button>
                        ) : (
                            <Link
                                href={route("admin.service-categories.create")}
                                className="sc-create-btn"
                            >
                                <Plus size={16} />
                                ایجاد اولین دسته‌بندی
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() =>
                    setDeleteModal({ isOpen: false, category: null })
                }
                category={deleteModal.category}
                onConfirm={handleConfirmDelete}
                title="حذف سرویس"
                message={
                    deleteModal.category
                        ? `آیا از حذف سرویس "${deleteModal.category.name}" مطمئن هستید؟ این عملیات قابل بازگشت نیست و تمام دسترسی‌های مرتبط نیز حذف خواهند شد.`
                        : ""
                }
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                type="danger"
                isLoading={deleteModal.isLoading}
            />
        </Layout>
    );
}
