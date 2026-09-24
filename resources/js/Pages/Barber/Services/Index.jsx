import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import ConfirmModal from "../../Admin/Components/ConfirmModal";
import EmptyList from "../../Admin/Components/EmptyList";
import Pagination from "../../Admin/Components/Pagination";
import Search from "../../../Components/Search";

import {
    Plus,
    Scissors,
    Clock,
    DollarSign,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Filter,
    X,
} from "lucide-react";

export default function ServicesIndex({ auth, services, filters }) {
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        service: null,
        isLoading: false,
    });

    // ============ State جستجو ============
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const servicesList = services.data || [];

    // ============ بررسی فیلتر فعال ============
    const hasActiveFilters = filters?.search || filters?.status;

    // ============ حذف ============
    const openDeleteModal = (service) =>
        setDeleteModal({ isOpen: true, service, isLoading: false });
    const closeDeleteModal = () =>
        setDeleteModal({ isOpen: false, service: null, isLoading: false });

    const handleConfirmDelete = () => {
        if (!deleteModal.service) return;
        setDeleteModal((prev) => ({ ...prev, isLoading: true }));
        router.delete(`/barber/services/${deleteModal.service.id}`, {
            preserveScroll: true,
            onSuccess: () => closeDeleteModal(),
            onError: () =>
                setDeleteModal((prev) => ({ ...prev, isLoading: false })),
        });
    };

    // ============ جستجو ============
    const handleSearch = (term) => {
        setIsSearching(true);
        router.get(
            "/barber/services",
            {
                search: term,
                status: filters?.status,
            },
            {
                preserveState: false,
                // preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    // ============ فیلتر وضعیت ============
    const handleStatusFilter = (status) => {
        router.get(
            "/barber/services",
            {
                search: searchTerm,
                status,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // ============ پاک کردن فیلترها ============
    const handleClearFilters = () => {
        setSearchTerm("");
        router.get(
            "/barber/services",
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <Layout>
            <Head title="مدیریت سرویس ها" />

            <div className="center-column">
                {/* هدر */}
                <div className="roles-page-header">
                    <div>
                        <h1 className="roles-page-title">مدیریت سرویس ها</h1>
                        <p
                            style={{
                                color: "#6b7280",
                                fontSize: "0.875rem",
                                marginTop: "0.25rem",
                            }}
                        >
                            {services.total} سرویس تعریف شده است
                        </p>
                    </div>
                    <Link
                        href="/barber/services/create"
                        className="btn-primary"
                        style={{
                            width: "auto",
                            padding: "0.5rem 1.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            textDecoration: "none",
                        }}
                    >
                        <Plus size={18} /> سرویس جدید
                    </Link>
                </div>

                {/* ============ نوار ابزار جستجو ============ */}
                <div className="services-toolbar">
                    {/* ============ سمت راست: جستجو ============ */}
                    <div className="services-search-wrapper">
                        <Search
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={handleSearch}
                            placeholder="جستجو در نام یا توضیحات سرویس..."
                            delay={500}
                            isLoading={isSearching}
                        />
                    </div>

                    {/* ============ سمت چپ: فیلترها ============ */}
                    <div className="services-toolbar-actions">
                        <button
                            className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={16} />
                            فیلترها
                            {filters?.status && (
                                <span className="filter-count-badge">1</span>
                            )}
                        </button>

                        {hasActiveFilters && (
                            <button
                                className="clear-filters-btn"
                                onClick={handleClearFilters}
                            >
                                <X size={16} />
                                پاک کردن
                            </button>
                        )}
                    </div>
                </div>

                {/* ============ پنل فیلترها — اینجا باید باشد ============ */}
                {showFilters && (
                    <div className="services-filters-panel">
                        <div className="filter-group">
                            <label className="filter-label">وضعیت</label>
                            <div className="status-filter-buttons">
                                <button
                                    className={`status-filter-btn ${!filters?.status ? "active" : ""}`}
                                    onClick={() => handleStatusFilter("")}
                                >
                                    همه
                                </button>
                                <button
                                    className={`status-filter-btn ${filters?.status === "active" ? "active" : ""}`}
                                    onClick={() => handleStatusFilter("active")}
                                >
                                    <CheckCircle size={14} />
                                    فعال
                                </button>
                                <button
                                    className={`status-filter-btn ${filters?.status === "inactive" ? "active" : ""}`}
                                    onClick={() =>
                                        handleStatusFilter("inactive")
                                    }
                                >
                                    <XCircle size={14} />
                                    غیرفعال
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* گرید سرویس ها */}
                {servicesList.length === 0 ? (
                    <div
                        className="card"
                        style={{ textAlign: "center", padding: "3rem" }}
                    >
                        <EmptyList
                            title={
                                filters?.only_online
                                    ? "هیچ سرویسی وجود ندارد "
                                    : hasActiveFilters
                                      ? "نتیجه‌ای یافت نشد"
                                      : "سرویسی پیدا نشد"
                            }
                            message={
                                filters?.only_online
                                    ? "در حال حاضر هیچ سرویسی نیست."
                                    : hasActiveFilters
                                      ? "هیچ سرویسی با فیلترهای انتخاب شده مطابقت ندارد."
                                      : "در حال حاضر هیچ سرویسی در سیستم ثبت نشده است."
                            }
                        />
                    </div>
                ) : (
                    <div className="services-grid">
                        {servicesList.map((service) => (
                            <div key={service.id} className="service-card">
                                {/* ============ تصویر سرویس ============ */}
                                <div className="service-card-image-wrapper">
                                    {service.image ? (
                                        <img
                                            src={service.image}
                                            alt={service.name}
                                            className="service-card-image"
                                        />
                                    ) : (
                                        <div className="service-card-image-placeholder">
                                            <Scissors size={40} />
                                        </div>
                                    )}
                                    <span
                                        className={`service-status-badge ${
                                            service.is_active
                                                ? "active"
                                                : "inactive"
                                        }`}
                                    >
                                        {service.is_active ? (
                                            <>
                                                <CheckCircle size={12} />
                                                فعال
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={12} />
                                                غیرفعال
                                            </>
                                        )}
                                    </span>
                                </div>

                                {/* نام */}
                                <h3 className="service-name">{service.name}</h3>

                                {/* توضیحات */}
                                {service.description && (
                                    <p className="service-description">
                                        {service.description}
                                    </p>
                                )}

                                {/* مدت و قیمت */}
                                <div className="service-meta">
                                    <div className="service-meta-item">
                                        <Clock size={14} />
                                        <span>
                                            {service.duration.toLocaleString(
                                                "fa-IR",
                                            )}{" "}
                                            دقیقه
                                        </span>
                                    </div>
                                    <div className="service-meta-item price">
                                        <DollarSign size={14} />
                                        <span>
                                            {parseFloat(
                                                service.price,
                                            ).toLocaleString("fa-IR")}{" "}
                                            تومان
                                        </span>
                                    </div>
                                </div>

                                {/* دکمه‌ها */}
                                <div className="service-card-actions">
                                    <Link
                                        href={`/barber/services/${service.id}/edit`}
                                        className="admin-card-btn edit"
                                    >
                                        <Edit size={16} />
                                        ویرایش
                                    </Link>
                                    <button
                                        className="admin-card-btn delete"
                                        onClick={() => openDeleteModal(service)}
                                    >
                                        <Trash2 size={16} />
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* صفحه‌بندی */}
                <Pagination links={services.links} />
            </div>

            {/* Modal حذف */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="حذف سرویس"
                message={
                    deleteModal.service
                        ? `آیا از حذف سرویس "${deleteModal.service.name}" مطمئن هستید؟`
                        : ""
                }
                confirmText="بله، حذف کن"
                type="danger"
                isLoading={deleteModal.isLoading}
            />
        </Layout>
    );
}
