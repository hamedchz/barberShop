import React, { useState, useEffect, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import EmptyList from "../Components/EmptyList";
import ConfirmModal from "../Components/ConfirmModal";
import Search from "../../../Components/Search";
import Select2 from "../Components/Select2";
import axios from "axios";
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
    Wifi,
    WifiOff,
    Activity,
    Lock,
} from "lucide-react";

// ============ نقشه وضعیت کاربران ============
const statusConfig = {
    active: {
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#d1fae5",
        label: "فعال",
    },
    inactive: {
        icon: XCircle,
        color: "#374151",
        bg: "#f3f4f6",
        border: "#e5e7eb",
        label: "غیرفعال",
    },
    suspended: {
        icon: Clock,
        color: "#9a3412",
        bg: "#fff7ed",
        border: "#ffedd5",
        label: "معلق",
    },
    pending: {
        icon: Clock,
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#dbeafe",
        label: "در انتظار تایید",
    },
    banned: {
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fee2e2",
        label: "مسدود",
    },
};

// تابع کمکی برای گرفتن تنظیمات وضعیت
const getStatusConfig = (status) =>
    statusConfig[status] || statusConfig.inactive;

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

export default function AdminsIndex({
    auth,
    barbers,
    filters,
    totalOnline: initialTotalOnline,
    scope,
}) {
    const currentUserId = auth?.user?.id;
    // ============ State ============
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // ============ State آنلاین ============
    const [onlineStatuses, setOnlineStatuses] = useState({});
    const [totalOnline, setTotalOnline] = useState(initialTotalOnline || 0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        barber: null,
        isLoading: false,
    });

    const barbersList = barbers.data || [];

    // ============ مقداردهی اولیه وضعیت آنلاین ============
    useEffect(() => {
        const statuses = {};
        barbersList.forEach((barber) => {
            statuses[barber.id] = {
                is_online: barber.is_online,
                last_activity: barber.last_activity,
            };
        });
        setOnlineStatuses(statuses);
    }, [barbersList]);

    // ============ Polling هر ۳۰ ثانیه ============
    useEffect(() => {
        const fetchOnlineStatus = async () => {
            try {
                setIsRefreshing(true);
                const response = await axios.get(
                    "/admin/barbers/online-status",
                );
                const statuses = {};
                response.data.barbers.forEach((barber) => {
                    statuses[barber.id] = {
                        is_online: barber.is_online,
                        last_activity: barber.last_activity,
                    };
                });
                setOnlineStatuses(statuses);
                setTotalOnline(response.data.total_online);
                setLastUpdate(new Date());
            } catch (error) {
                console.error("Failed to fetch online status:", error);
            } finally {
                setIsRefreshing(false);
            }
        };

        // اولین بار بعد از ۱۰ ثانیه
        const initialTimeout = setTimeout(fetchOnlineStatus, 10000);

        // سپس هر ۳۰ ثانیه
        const interval = setInterval(fetchOnlineStatus, 30000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    // ============ تابع کمکی ============
    const getOnlineStatus = (barberId) => {
        return (
            onlineStatuses[barberId] || {
                is_online: false,
                last_activity: null,
            }
        );
    };

    const hasActiveFilters =
        filters?.status || filters?.search || filters?.only_online;

    // ============ جستجو و فیلترها ============
    const handleSearch = (term) => {
        setIsSearching(true);
        router.get(
            "/admin/barbers",
            {
                search: term,
                status: filters?.status,
                only_online: filters?.only_online ? 1 : 0,
            },
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
            "/admin/barbers",
            {
                search: searchTerm,
                status,
                only_online: filters?.only_online ? 1 : 0,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // ============ فیلتر فقط آنلاین ============
    const handleOnlyOnlineToggle = () => {
        router.get(
            "/admin/barbers",
            {
                search: searchTerm,
                status: filters?.status,
                only_online: filters?.only_online ? 0 : 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        router.get(
            "/admin/barbers",
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // ============ Modalها ============
    const [toggleModal, setToggleModal] = useState({
        isOpen: false,
        barber: null,
        isLoading: false,
    });

    const openDeleteModal = (barber) =>
        setDeleteModal({ isOpen: true, barber, isLoading: false });
    const closeDeleteModal = () =>
        setDeleteModal({ isOpen: false, barber: null, isLoading: false });

    const handleConfirmDelete = () => {
        if (!deleteModal.barber) return;
        setDeleteModal((prev) => ({ ...prev, isLoading: true }));
        router.delete(`/admin/barbers/${deleteModal.barber.id}/destroy`, {
            preserveScroll: true,
            onSuccess: () => closeDeleteModal(),
            onError: () =>
                setDeleteModal((prev) => ({ ...prev, isLoading: false })),
        });
    };

    const openToggleModal = (barber) =>
        setToggleModal({ isOpen: true, barber, isLoading: false });
    const closeToggleModal = () =>
        setToggleModal({ isOpen: false, barber: null, isLoading: false });

    const handleConfirmToggle = () => {
        if (!toggleModal.barber) return;
        setToggleModal((prev) => ({ ...prev, isLoading: true }));
        router.patch(
            `/admin/barbers/${toggleModal.barber.id}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => closeToggleModal(),
                onError: () =>
                    setToggleModal((prev) => ({ ...prev, isLoading: false })),
            },
        );
    };

    // ============ مرتب‌سازی: آنلاین‌ها اول ============
    const sortedBarbers = useMemo(() => {
        return [...barbersList].sort((a, b) => {
            const aOnline = getOnlineStatus(a.id).is_online;
            const bOnline = getOnlineStatus(b.id).is_online;
            if (aOnline === bOnline) return 0;
            return aOnline ? -1 : 1;
        });
    }, [barbersList, onlineStatuses]);

    return (
        <Layout>
            <Head title="مدیریت آرایشگرها" />

            <div className="center-column">
                {/* ============ هدر با شمارنده آنلاین ============ */}
                <div className="roles-page-header">
                    <div>
                        <h1 className="roles-page-title">مدیریت آرایشگرها</h1>
                        <div className="header-stats">
                            <p className="stats-text">
                                {barbers.total} آرایشگر در سیستم
                            </p>

                            {/* شمارنده آنلاین‌ها */}
                            <div className="online-counter-badge">
                                <span className="online-dot pulse"></span>
                                <span className="online-counter-text">
                                    {totalOnline} آنلاین
                                </span>
                                {isRefreshing && (
                                    <span className="refreshing-indicator"></span>
                                )}
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/admin/barbers/create"
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
                        <UserPlus size={18} /> آرایشگر جدید
                    </Link>
                </div>

                {/* ============ نوار ابزار ============ */}
                <div className="admins-toolbar">
                    <div className="admins-search-wrapper">
                        <Search
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={handleSearch}
                            placeholder="جستجو در نام، شماره تماس یا ..."
                            delay={500}
                            isLoading={isSearching}
                        />
                    </div>

                    <div className="admins-toolbar-actions">
                        {/* دکمه فقط آنلاین‌ها */}
                        <button
                            className={`only-online-btn ${
                                filters?.only_online ? "active" : ""
                            }`}
                            onClick={handleOnlyOnlineToggle}
                            title="فقط آرایشگرهای آنلاین"
                        >
                            <Wifi size={16} />
                            فقط آنلاین
                            {filters?.only_online && (
                                <span className="active-dot"></span>
                            )}
                        </button>

                        <button
                            className={`filter-toggle-btn ${
                                showFilters ? "active" : ""
                            }`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={16} />
                            فیلترها
                            {hasActiveFilters && (
                                <span className="filter-count-badge">
                                    {
                                        [
                                            filters?.status,

                                            filters?.only_online,
                                        ].filter(Boolean).length
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
                                    className={`status-filter-btn ${
                                        !filters?.status ? "active" : ""
                                    }`}
                                    onClick={() => handleStatusFilter("")}
                                >
                                    همه
                                </button>
                                {Object.entries(statusConfig).map(
                                    ([key, config]) => {
                                        const StatusIcon = config.icon;
                                        return (
                                            <button
                                                key={key}
                                                className={`status-filter-btn ${
                                                    filters?.status === key
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleStatusFilter(key)
                                                }
                                            >
                                                <StatusIcon size={14} />
                                                {config.label}
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ============ حالت خالی ============ */}
                {sortedBarbers.length === 0 && (
                    <div className="card" style={{ padding: "3rem" }}>
                        <EmptyList
                            title={
                                filters?.only_online
                                    ? "هیچ آرایشگری آنلاین نیست"
                                    : hasActiveFilters
                                      ? "نتیجه‌ای یافت نشد"
                                      : "آرایشگری پیدا نشد"
                            }
                            message={
                                filters?.only_online
                                    ? "در حال حاضر هیچ آرایشگری آنلاین نیست."
                                    : hasActiveFilters
                                      ? "هیچ آرایشگری با فیلترهای انتخاب شده مطابقت ندارد."
                                      : "در حال حاضر هیچ آرایشگری در سیستم ثبت نشده است."
                            }
                        />
                    </div>
                )}

                {/* ============ گرید کارت‌ها ============ */}
                {sortedBarbers.length > 0 && (
                    <div className="admins-cards-grid">
                        {sortedBarbers.map((admin) => {
                            const onlineData = getOnlineStatus(admin.id);
                            const statusCfg = getStatusConfig(admin.status);
                            const StatusIcon = statusCfg.icon;

                            return (
                                <div
                                    key={admin.id}
                                    className={`admin-card ${
                                        onlineData.is_online
                                            ? "admin-card-online"
                                            : ""
                                    }`}
                                >
                                    {/* نوار بالا */}
                                    <div
                                        className={`admin-card-stripe status-${admin.status}`}
                                    ></div>

                                    {/* بخش بالایی: آواتار + دکمه وضعیت */}
                                    <div className="admin-card-top">
                                        <div className="admin-card-avatar-wrapper">
                                            <div className="admin-card-avatar">
                                                {admin.avatar ? (
                                                    <img
                                                        src={admin.thumbnail}
                                                        alt={admin.name}
                                                    />
                                                ) : (
                                                    <span>
                                                        {admin.name
                                                            ?.charAt(0)
                                                            .toUpperCase()}

                                                        {admin.avatar}
                                                    </span>
                                                )}
                                            </div>

                                            {/* نشانگر آنلاین روی آواتار */}
                                            <span
                                                className={`admin-card-avatar-status ${
                                                    onlineData.is_online
                                                        ? "online"
                                                        : "offline"
                                                }`}
                                                title={
                                                    onlineData.is_online
                                                        ? "آنلاین"
                                                        : onlineData.last_activity
                                                          ? `آخرین فعالیت: ${formatLastLogin(
                                                                onlineData.last_activity,
                                                            )}`
                                                          : "آفلاین"
                                                }
                                            >
                                                {onlineData.is_online && (
                                                    <span className="pulse-ring"></span>
                                                )}
                                            </span>
                                        </div>

                                        <button
                                            className={`admin-card-status-btn status-${admin.status}`}
                                            style={{
                                                backgroundColor: statusCfg.bg,
                                                color: statusCfg.color,
                                                borderColor: statusCfg.border,
                                            }}
                                        >
                                            <StatusIcon size={13} />
                                            {statusCfg.label}
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

                                    {/* نشانگر آنلاین متنی */}
                                    <div className="admin-card-online-indicator">
                                        {onlineData.is_online ? (
                                            <div className="online-badge online">
                                                <span className="online-dot"></span>
                                                <span>آنلاین</span>
                                            </div>
                                        ) : (
                                            <div className="online-badge offline">
                                                <WifiOff size={12} />
                                                <span>
                                                    {onlineData.last_activity
                                                        ? `آخرین فعالیت: ${formatLastLogin(
                                                              onlineData.last_activity,
                                                          )}`
                                                        : "آفلاین"}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Badgeهای نقش */}
                                    <div className="admin-card-roles">
                                        {admin.roles?.map((role) => {
                                            const config = getRoleConfig(
                                                role.name,
                                            );
                                            const RoleIcon = config.icon;
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
                                                    <RoleIcon size={12} />
                                                    {role.name}
                                                </span>
                                            );
                                        })}
                                    </div>

                                    {/* اطلاعات */}
                                    <div className="admin-card-info">
                                        <div className="admin-card-info-row">
                                            <Phone size={14} />
                                            <span dir="ltr">
                                                {admin.phone || "-"}
                                            </span>
                                        </div>
                                        <div className="admin-card-info-row">
                                            <Calendar size={14} />
                                            <span>
                                                عضویت:{" "}
                                                {formatJalaliDate(
                                                    admin.created_at,
                                                )}
                                            </span>
                                        </div>
                                        <div className="admin-card-info-row">
                                            <Calendar size={14} />
                                            <span>
                                                آخرین تاریخ ورود:{" "}
                                                {formatJalaliDate(
                                                    admin.last_login_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* دکمه‌های عملیات */}
                                    <div className="admin-card-actions">
                                        <Link
                                            href={`/admin/barbers/${admin.slug}/edit`}
                                            className="admin-card-btn edit"
                                        >
                                            <Edit size={16} />
                                            ویرایش
                                        </Link>
                                        {currentUserId === admin.id ? (
                                            <button
                                                className="admin-card-btn delete disabled"
                                                disabled
                                                title="نمی‌توانید حساب خودتان را حذف کنید"
                                                style={{
                                                    cursor: "not-allowed",
                                                    opacity: 0.5,
                                                }}
                                            >
                                                <Lock size={16} />
                                                حذف
                                            </button>
                                        ) : (
                                            <button
                                                className="admin-card-btn delete"
                                                onClick={() =>
                                                    openDeleteModal(admin)
                                                }
                                            >
                                                <Trash2 size={16} />
                                                حذف
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* صفحه‌بندی */}
                <Pagination links={barbers.links} />
            </div>

            {/* Modalها */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="حذف آرایشگر"
                message={
                    deleteModal.barber
                        ? `آیا از حذف آرایشگر "${deleteModal.barber.name}" مطمئن هستید؟`
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
