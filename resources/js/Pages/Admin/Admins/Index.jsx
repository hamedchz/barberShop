import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import EmptyList from "../Components/EmptyList";
import ConfirmModal from "../Components/ConfirmModal";
import Search from "../../../Components/Search";
import Select2 from "../Components/Select2";
import { toJalaali } from "jalaali-js";
import Pagination from "../Components/Pagination";

import {
    UserPlus,
    Edit,
    Trash2,
    Shield,
    Phone,
    Calendar,
    CheckCircle,
    XCircle,
    Crown,
    UserCog,
    Clock,
    Filter,
    X,
    LogIn,
    Mail,
} from "lucide-react";

// ============ تبدیل تاریخ به شمسی ============
const formatJalaliDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const { jy, jm, jd } = toJalaali(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    );
    return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
};

// ============ نمایش زمان آخرین ورود ============
const formatLastLogin = (date) => {
    if (!date) return "هرگز";
    const d = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now - d) / 1000 / 60);

    if (diffInMinutes < 1) return "همین الان";
    if (diffInMinutes < 60) return `${diffInMinutes} دقیقه پیش`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ساعت پیش`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} روز پیش`;

    return formatJalaliDate(date);
};

// ============ آیکون و رنگ نقش ============
const getRoleConfig = (roleName) => {
    const configs = {
        "super-admin": {
            icon: Crown,
            color: "#f59e0b",
            bg: "#fffbeb",
            border: "#fef3c7",
        },
        admin: {
            icon: Shield,
            color: "#10b981",
            bg: "#ecfdf5",
            border: "#d1fae5",
        },
        teacher: {
            icon: UserCog,
            color: "#3b82f6",
            bg: "#eff6ff",
            border: "#dbeafe",
        },
    };
    return (
        configs[roleName] || {
            icon: UserCog,
            color: "#6b7280",
            bg: "#f3f4f6",
            border: "#e5e7eb",
        }
    );
};

export default function AdminsIndex({ auth, admins, roles, filters, scope }) {
    // ============ State ============
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        admin: null,
        isLoading: false,
    });

    const [toggleModal, setToggleModal] = useState({
        isOpen: false,
        admin: null,
        isLoading: false,
    });

    const adminsList = admins.data || [];

    // ============ گزینه‌های نقش ============
    const roleOptions = useMemo(
        () =>
            roles.map((role) => ({
                value: role.id,
                label: role.label,
            })),
        [roles],
    );

    const selectedRole = useMemo(() => {
        if (!filters?.role) return null;
        return roleOptions.find((opt) => opt.value == filters.role);
    }, [filters?.role, roleOptions]);

    const hasActiveFilters =
        filters?.status || filters?.role || filters?.search;

    // ============ جستجو ============
    const handleSearch = (term) => {
        setIsSearching(true);
        router.get(
            "/admin/admins",
            { search: term, status: filters?.status, role: filters?.role },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    const handleStatusFilter = (status) => {
        router.get(
            "/admin/admins",
            { search: searchTerm, status, role: filters?.role },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleRoleFilter = (selectedOption) => {
        router.get(
            "/admin/admins",
            {
                search: searchTerm,
                status: filters?.status,
                role: selectedOption ? selectedOption.value : "",
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        router.get(
            "/admin/admins",
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // ============ Modal حذف ============
    const openDeleteModal = (admin) =>
        setDeleteModal({ isOpen: true, admin, isLoading: false });
    const closeDeleteModal = () =>
        setDeleteModal({ isOpen: false, admin: null, isLoading: false });

    const handleConfirmDelete = () => {
        if (!deleteModal.admin) return;
        setDeleteModal((prev) => ({ ...prev, isLoading: true }));
        router.delete(`/admin/admins/${deleteModal.admin.id}`, {
            preserveScroll: true,
            onSuccess: () => closeDeleteModal(),
            onError: () =>
                setDeleteModal((prev) => ({ ...prev, isLoading: false })),
        });
    };

    // ============ Modal تغییر وضعیت ============
    const openToggleModal = (admin) =>
        setToggleModal({ isOpen: true, admin, isLoading: false });
    const closeToggleModal = () =>
        setToggleModal({ isOpen: false, admin: null, isLoading: false });

    const handleConfirmToggle = () => {
        if (!toggleModal.admin) return;
        setToggleModal((prev) => ({ ...prev, isLoading: true }));
        router.patch(
            `/admin/admins/${toggleModal.admin.id}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => closeToggleModal(),
                onError: () =>
                    setToggleModal((prev) => ({ ...prev, isLoading: false })),
            },
        );
    };

    return (
        <Layout>
            <Head title="مدیریت ادمین‌ها" />

            <div className="center-column">
                {/* ============ هدر صفحه ============ */}
                <div className="roles-page-header">
                    <div>
                        <h1 className="roles-page-title">مدیریت ادمین‌ها</h1>
                        <p
                            style={{
                                color: "#6b7280",
                                fontSize: "0.875rem",
                                marginTop: "0.25rem",
                            }}
                        >
                            {hasActiveFilters
                                ? `${admins.total} نتیجه یافت شد`
                                : `${admins.total} ادمین در سیستم`}
                        </p>
                    </div>
                    <Link
                        href="/admin/admins/create"
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
                        <UserPlus size={18} /> ادمین جدید
                    </Link>
                </div>

                {/* ============ نوار ابزار ============ */}
                <div className="admins-toolbar">
                    <div className="admins-search-wrapper">
                        <Search
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={handleSearch}
                            placeholder="جستجو در نام، شماره تماس یا ایمیل..."
                            delay={500}
                            isLoading={isSearching}
                        />
                    </div>

                    <div className="admins-toolbar-actions">
                        <button
                            className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={16} />
                            فیلترها
                            {hasActiveFilters && (
                                <span className="filter-count-badge">
                                    {
                                        [filters?.status, filters?.role].filter(
                                            Boolean,
                                        ).length
                                    }
                                </span>
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

                {/* ============ پنل فیلترها ============ */}
                {showFilters && (
                    <div className="admins-filters-panel">
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

                        <div className="filter-group">
                            <label className="filter-label">نقش</label>
                            <Select2
                                options={roleOptions}
                                value={selectedRole}
                                onChange={handleRoleFilter}
                                placeholder="همه نقش‌ها"
                                isMulti={false}
                                isClearable={true}
                                isRtl={true}
                            />
                        </div>
                    </div>
                )}

                {/* ============ حالت خالی ============ */}
                {adminsList.length === 0 && (
                    <div className="card" style={{ padding: "3rem" }}>
                        <EmptyList
                            title={
                                hasActiveFilters
                                    ? "نتیجه‌ای یافت نشد"
                                    : "ادمینی پیدا نشد"
                            }
                            message={
                                hasActiveFilters
                                    ? "هیچ ادمینی با فیلترهای انتخاب شده مطابقت ندارد."
                                    : "در حال حاضر هیچ ادمینی در سیستم ثبت نشده است."
                            }
                        />
                    </div>
                )}

                {/* ============ گرید کارت‌های ادمین ============ */}
                {adminsList.length > 0 && (
                    <div className="admins-cards-grid">
                        {adminsList.map((admin) => (
                            <div key={admin.id} className="admin-card">
                                {/* نوار بالای کارت */}
                                <div
                                    className={`admin-card-stripe ${
                                        admin.is_active ? "active" : "inactive"
                                    }`}
                                ></div>

                                {/* بخش بالایی: آواتار و وضعیت */}
                                <div className="admin-card-top">
                                    <div className="admin-card-avatar-wrapper">
                                        <div className="admin-card-avatar">
                                            {admin.avatar ? (
                                                <img
                                                    src={admin.avatar}
                                                    alt={admin.name}
                                                />
                                            ) : (
                                                <span>
                                                    {admin.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <span
                                            className={`admin-card-avatar-status ${
                                                admin.is_active
                                                    ? "online"
                                                    : "offline"
                                            }`}
                                            title={
                                                admin.is_active
                                                    ? "فعال"
                                                    : "غیرفعال"
                                            }
                                        ></span>
                                    </div>

                                    <button
                                        className={`admin-card-status-btn ${
                                            admin.is_active
                                                ? "active"
                                                : "inactive"
                                        }`}
                                        onClick={() => openToggleModal(admin)}
                                        title="تغییر وضعیت"
                                    >
                                        {admin.is_active ? (
                                            <>
                                                <CheckCircle size={13} />
                                                فعال
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={13} />
                                                غیرفعال
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* نام و شناسه */}
                                <div className="admin-card-name-wrapper">
                                    <h3 className="admin-card-name">
                                        {admin.name}
                                    </h3>
                                    <p className="admin-card-id">
                                        شناسه: #{admin.id}
                                    </p>
                                </div>

                                {/* Badgeهای نقش */}
                                <div className="admin-card-roles">
                                    {admin.roles?.length > 0 ? (
                                        admin.roles.map((role) => {
                                            const config = getRoleConfig(
                                                role.name,
                                            );
                                            const IconComponent = config.icon;
                                            return (
                                                <span
                                                    key={role.id}
                                                    className="role-badge"
                                                    style={{
                                                        backgroundColor:
                                                            config.bg,
                                                        color: config.color,
                                                        border: `1px solid ${config.border}`,
                                                    }}
                                                >
                                                    <IconComponent size={12} />
                                                    {role.name}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="no-role-text">
                                            بدون نقش
                                        </span>
                                    )}
                                </div>

                                {/* اطلاعات تماس و تاریخ */}
                                <div className="admin-card-info">
                                    <div className="admin-card-info-row">
                                        <Phone size={14} />
                                        <span dir="ltr">
                                            {admin.phone || "-"}
                                        </span>
                                    </div>

                                    {admin.email && (
                                        <div className="admin-card-info-row">
                                            <Mail size={14} />
                                            <span dir="ltr">{admin.email}</span>
                                        </div>
                                    )}

                                    <div className="admin-card-info-row">
                                        <Calendar size={14} />
                                        <span>
                                            عضویت:{" "}
                                            {formatJalaliDate(admin.created_at)}
                                        </span>
                                    </div>

                                    <div className="admin-card-info-row">
                                        <Clock size={14} />
                                        <span>
                                            آخرین ورود:{" "}
                                            {formatLastLogin(
                                                admin.last_login_at,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* دکمه‌های عملیات */}
                                <div className="admin-card-actions">
                                    <Link
                                        href={`/admin/admins/${admin.slug}/edit`}
                                        className="admin-card-btn edit"
                                        title="ویرایش"
                                    >
                                        <Edit size={16} />
                                        ویرایش
                                    </Link>
                                    <button
                                        className="admin-card-btn delete"
                                        onClick={() => openDeleteModal(admin)}
                                        title="حذف"
                                    >
                                        <Trash2 size={16} />
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ============ صفحه‌بندی ============ */}
                {admins.links && admins.links.length > 3 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "0.5rem",
                            marginTop: "1.5rem",
                            flexWrap: "wrap",
                            direction: "ltr",
                        }}
                    >
                        {admins.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || "#"}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`btn-outline ${link.active ? "active" : ""}`}
                                style={{
                                    padding: "0.5rem 1rem",
                                    fontSize: "0.875rem",
                                    textDecoration: "none",
                                    opacity: link.url ? 1 : 0.5,
                                    pointerEvents: link.url ? "auto" : "none",
                                    backgroundColor: link.active
                                        ? "var(--primary)"
                                        : "transparent",
                                    color: link.active
                                        ? "white"
                                        : "var(--primary)",
                                    width: "auto",
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ============ Modal حذف ============ */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="حذف ادمین"
                message={
                    deleteModal.admin
                        ? `آیا از حذف ادمین "${deleteModal.admin.name}" مطمئن هستید؟ این عملیات قابل بازگشت نیست و تمام دسترسی‌های این کاربر حذف خواهند شد.`
                        : ""
                }
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                type="danger"
                isLoading={deleteModal.isLoading}
            />

            {/* ============ Modal تغییر وضعیت ============ */}
            <ConfirmModal
                isOpen={toggleModal.isOpen}
                onClose={closeToggleModal}
                onConfirm={handleConfirmToggle}
                title={
                    toggleModal.admin?.is_active
                        ? "غیرفعال کردن ادمین"
                        : "فعال کردن ادمین"
                }
                message={
                    toggleModal.admin
                        ? toggleModal.admin.is_active
                            ? `آیا می‌خواهید ادمین "${toggleModal.admin.name}" را غیرفعال کنید؟ این کاربر دیگر نمی‌تواند وارد سیستم شود.`
                            : `آیا می‌خواهید ادمین "${toggleModal.admin.name}" را فعال کنید؟`
                        : ""
                }
                confirmText="بله، تغییر بده"
                cancelText="انصراف"
                type={toggleModal.admin?.is_active ? "warning" : "success"}
                isLoading={toggleModal.isLoading}
            />
        </Layout>
    );
}
