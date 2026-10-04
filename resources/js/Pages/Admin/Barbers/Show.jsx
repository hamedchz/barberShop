import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import {
    ArrowRight,
    User,
    Phone,
    Mail,
    Calendar,
    Clock,
    Scissors,
    DollarSign,
    CheckCircle,
    XCircle,
    Shield,
    Crown,
    Activity,
    TrendingUp,
    Package,
    Users,
    Star,
    Crown as CrownIcon,
    Info,
    Wifi,
    WifiOff,
    Edit,
    BarChart2,
    Lock,
    Unlock,
    AlertCircle,
} from "lucide-react";
import { toJalaali } from "jalaali-js";
import {
    toPersianNumber,
    toPersianTime,
    toPersianTimeRange,
} from "../../../utils/persianNumbers";

import "../Assets/css/AdminBarbers.css";

// ============ توابع کمکی ============
const formatJalaliDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const { jy, jm, jd } = toJalaali(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    );
    return toPersianNumber(
        `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`,
    );
};

const formatLastLogin = (date) => {
    if (!date) return "هرگز";
    const d = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now - d) / 1000 / 60);

    if (diffInMinutes < 1) return "همین الان";
    if (diffInMinutes < 60)
        return `${toPersianNumber(diffInMinutes)} دقیقه پیش`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${toPersianNumber(diffInHours)} ساعت پیش`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${toPersianNumber(diffInDays)} روز پیش`;

    return formatJalaliDate(date);
};

const daysOfWeek = [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
];

const statusConfig = {
    active: {
        label: "فعال",
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#d1fae5",
    },
    inactive: {
        label: "غیرفعال",
        color: "#374151",
        bg: "#f3f4f6",
        border: "#e5e7eb",
    },
    suspended: {
        label: "معلق",
        color: "#9a3412",
        bg: "#fff7ed",
        border: "#ffedd5",
    },
    pending: {
        label: "در انتظار",
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#dbeafe",
    },
    banned: {
        label: "مسدود",
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fee2e2",
    },
};

const slotStatusConfig = {
    available: {
        label: "قابل رزرو",
        icon: Unlock,
        color: "#065f46",
        bg: "#ecfdf5",
    },
    booked: {
        label: "رزرو شده",
        icon: CheckCircle,
        color: "#1e40af",
        bg: "#eff6ff",
    },
    blocked: { label: "بسته", icon: Lock, color: "#991b1b", bg: "#fef2f2" },
};

export default function BarbersShow({
    auth,
    barber,
    services,
    availabilities,
    stats,
    upcomingSlots,
}) {
    const [activeTab, setActiveTab] = useState("overview");
    const statusCfg = statusConfig[barber.status] || statusConfig.inactive;

    // ============ تب‌ها ============
    const tabs = [
        { id: "overview", label: "نمای کلی", icon: Info },
        {
            id: "services",
            label: "سرویس ها",
            icon: Scissors,
            count: services.length,
        },
        {
            id: "schedule",
            label: "برنامه هفتگی",
            icon: Calendar,
            count: availabilities.length,
        },
        {
            id: "slots",
            label: "بازه‌های پیش رو",
            icon: Clock,
            count: upcomingSlots.length,
        },
    ];

    return (
        <Layout>
            <Head title={`جزئیات آرایشگر: ${barber.name}`} />

            <div className="center-column">
                {/* ============ هدر با دکمه بازگشت ============ */}
                <div className="page-header-with-back">
                    <Link href="/admin/barbers" className="back-btn">
                        <ArrowRight size={20} />
                        <span>بازگشت به لیست آرایشگران</span>
                    </Link>
                </div>

                {/* ============ کارت پروفایل آرایشگر ============ */}
                <div
                    className={`barber-profile-card ${barber.is_online ? "online" : ""}`}
                >
                    {/* نوار آنلاین */}
                    {barber.is_online && <div className="online-stripe"></div>}

                    <div className="barber-profile-header">
                        {/* آواتار */}
                        <div className="barber-profile-avatar-wrapper">
                            <div className="barber-profile-avatar">
                                {barber.avatar ? (
                                    <img
                                        src={barber.thumbnail}
                                        alt={barber.name}
                                    />
                                ) : (
                                    <span>
                                        {barber.name?.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            {barber.is_online && (
                                <span className="online-indicator">
                                    <span className="pulse-ring"></span>
                                </span>
                            )}
                        </div>

                        {/* اطلاعات */}
                        <div className="barber-profile-info">
                            <div className="barber-profile-name-row">
                                <h1 className="barber-profile-name">
                                    {barber.name}
                                </h1>

                                {/* Badge وضعیت */}
                                <span
                                    className="barber-status-badge"
                                    style={{
                                        backgroundColor: statusCfg.bg,
                                        color: statusCfg.color,
                                        borderColor: statusCfg.border,
                                    }}
                                >
                                    {statusCfg.label}
                                </span>

                                {/* Badge آنلاین */}
                                {barber.is_online ? (
                                    <span className="barber-online-badge online">
                                        <Wifi size={12} />
                                        آنلاین
                                    </span>
                                ) : (
                                    <span className="barber-online-badge offline">
                                        <WifiOff size={12} />
                                        {barber.last_activity
                                            ? formatLastLogin(
                                                  barber.last_activity,
                                              )
                                            : "آفلاین"}
                                    </span>
                                )}

                                {/* Badge نقش */}
                                {barber.roles?.map((role) => {
                                    const isSuperAdmin =
                                        role.name === "super-admin";
                                    const Icon = isSuperAdmin ? Crown : Shield;
                                    return (
                                        <span
                                            key={role.id}
                                            className={`role-badge ${
                                                isSuperAdmin ? "crown" : ""
                                            }`}
                                        >
                                            <Icon size={12} />
                                            {role.label}
                                        </span>
                                    );
                                })}
                            </div>

                            {/* تماس */}
                            <div className="barber-contact-row">
                                {barber.phone && (
                                    <div className="contact-item">
                                        <Phone size={14} />
                                        <span dir="ltr">{barber.phone}</span>
                                    </div>
                                )}
                                {barber.email && (
                                    <div className="contact-item">
                                        <Mail size={14} />
                                        <span dir="ltr">{barber.email}</span>
                                    </div>
                                )}
                                <div className="contact-item">
                                    <Calendar size={14} />
                                    <span>
                                        عضویت:{" "}
                                        {formatJalaliDate(barber.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* دکمه ویرایش */}
                        <Link
                            href={`/admin/barbers/${barber.slug}/edit`}
                            className="barber-edit-btn"
                        >
                            <Edit size={16} />
                            ویرایش
                        </Link>
                        {/* TODO:کلید ها در موبایل هم اندازه نیستند */}
                        <Link
                            href={`/admin/bookings/barber/${barber.slug}`}
                            className="barber-success-btn"
                        >
                            <Calendar size={16} />
                            مشاهده رزروها (
                            {toPersianNumber(barber.bookings_count)})
                        </Link>
                    </div>

                    {/* آمار سریع */}
                    <div className="barber-quick-stats">
                        <div className="quick-stat">
                            <div className="quick-stat-icon green">
                                <Scissors size={18} />
                            </div>
                            <div>
                                <span className="quick-stat-value">
                                    {toPersianNumber(stats.total_services)}
                                </span>
                                <span className="quick-stat-label">سرویس</span>
                            </div>
                        </div>

                        <div className="quick-stat">
                            <div className="quick-stat-icon blue">
                                <Clock size={18} />
                            </div>
                            <div>
                                <span className="quick-stat-value">
                                    {toPersianNumber(stats.total_time_slots)}
                                </span>
                                <span className="quick-stat-label">
                                    بازه زمانی
                                </span>
                            </div>
                        </div>

                        <div className="quick-stat">
                            <div className="quick-stat-icon purple">
                                <CheckCircle size={18} />
                            </div>
                            <div>
                                <span className="quick-stat-value">
                                    {toPersianNumber(stats.booked_slots)}
                                </span>
                                <span className="quick-stat-label">رزرو</span>
                            </div>
                        </div>

                        <div className="quick-stat">
                            <div className="quick-stat-icon orange">
                                <DollarSign size={18} />
                            </div>
                            <div>
                                <span className="quick-stat-value">
                                    {toPersianNumber(
                                        Math.round(stats.total_revenue / 1000),
                                    )}
                                    K
                                </span>
                                <span className="quick-stat-label">
                                    درآمد (هزار)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============ تب‌ها ============ */}
                <div className="barber-tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`barber-tab ${
                                    activeTab === tab.id ? "active" : ""
                                }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span className="tab-count">
                                        {toPersianNumber(tab.count)}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ============ محتوای تب‌ها ============ */}

                {/* تب ۱: نمای کلی */}
                {activeTab === "overview" && (
                    <div className="barber-tab-content">
                        <div className="overview-grid">
                            {/* آمار تفصیلی */}
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title">
                                        <BarChart2 size={20} />
                                        آمار تفصیلی
                                    </h2>
                                </div>
                                <div className="stats-detail-list">
                                    <div className="stats-detail-row">
                                        <span className="stats-detail-label">
                                            کل سرویس ها
                                        </span>
                                        <span className="stats-detail-value">
                                            {toPersianNumber(
                                                stats.total_services,
                                            )}
                                        </span>
                                    </div>
                                    <div className="stats-detail-row">
                                        <span className="stats-detail-label">
                                            سرویس ها فعال
                                        </span>
                                        <span className="stats-detail-value green">
                                            {toPersianNumber(
                                                stats.active_services,
                                            )}
                                        </span>
                                    </div>
                                    <div className="stats-detail-row">
                                        <span className="stats-detail-label">
                                            بازه‌های قابل رزرو
                                        </span>
                                        <span className="stats-detail-value green">
                                            {toPersianNumber(
                                                stats.available_slots,
                                            )}
                                        </span>
                                    </div>
                                    <div className="stats-detail-row">
                                        <span className="stats-detail-label">
                                            بازه‌های رزرو شده
                                        </span>
                                        <span className="stats-detail-value blue">
                                            {toPersianNumber(
                                                stats.booked_slots,
                                            )}
                                        </span>
                                    </div>
                                    <div className="stats-detail-row">
                                        <span className="stats-detail-label">
                                            بازه‌های بسته
                                        </span>
                                        <span className="stats-detail-value red">
                                            {toPersianNumber(
                                                stats.blocked_slots,
                                            )}
                                        </span>
                                    </div>
                                    <div className="stats-detail-row highlighted">
                                        <span className="stats-detail-label">
                                            کل درآمد
                                        </span>
                                        <span className="stats-detail-value primary">
                                            {toPersianNumber(
                                                stats.total_revenue.toLocaleString(),
                                            )}{" "}
                                            تومان
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* برنامه هفتگی */}
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title">
                                        <Calendar size={20} />
                                        برنامه هفتگی
                                    </h2>
                                    <span className="permissions-count">
                                        {toPersianNumber(availabilities.length)}{" "}
                                        روز
                                    </span>
                                </div>

                                {availabilities.length === 0 ? (
                                    <p className="empty-text">
                                        برنامه‌ای تعریف نشده است.
                                    </p>
                                ) : (
                                    <div className="overview-schedule">
                                        {daysOfWeek.map((day, index) => {
                                            const avail = availabilities.find(
                                                (a) => a.day_of_week === index,
                                            );
                                            return (
                                                <div
                                                    key={index}
                                                    className={`overview-day ${
                                                        avail
                                                            ? "active"
                                                            : "inactive"
                                                    }`}
                                                >
                                                    <span className="overview-day-name">
                                                        {day}
                                                    </span>
                                                    {avail ? (
                                                        <span className="overview-day-time">
                                                            {toPersianTimeRange(
                                                                avail.start_time,
                                                                avail.end_time,
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span className="overview-day-off">
                                                            تعطیل
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* تب ۲: سرویس ها */}
                {activeTab === "services" && (
                    <div className="barber-tab-content">
                        {services.length === 0 ? (
                            <div className="empty-state">
                                <Scissors size={48} />
                                <h3>هیچ سرویسی ثبت نشده است</h3>
                                <p>این آرایشگر هنوز سرویسی تعریف نکرده است.</p>
                            </div>
                        ) : (
                            <div className="services-grid">
                                {services.map((service) => (
                                    <div
                                        key={service.id}
                                        className="service-card"
                                    >
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
                                                        <CheckCircle
                                                            size={12}
                                                        />
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

                                        <h3 className="service-name">
                                            {service.name}
                                        </h3>

                                        {service.description && (
                                            <p className="service-description">
                                                {service.description}
                                            </p>
                                        )}

                                        <div className="service-meta">
                                            <div className="service-meta-item">
                                                <Clock size={14} />
                                                <span>
                                                    {toPersianNumber(
                                                        service.duration,
                                                    )}{" "}
                                                    دقیقه
                                                </span>
                                            </div>
                                            <div className="service-meta-item price">
                                                <DollarSign size={14} />
                                                <span>
                                                    {parseFloat(
                                                        service.price,
                                                    ).toLocaleString(
                                                        "fa-IR",
                                                    )}{" "}
                                                    تومان
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* تب ۳: برنامه هفتگی */}
                {activeTab === "schedule" && (
                    <div className="barber-tab-content">
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">
                                    <Calendar size={20} />
                                    برنامه هفتگی
                                </h2>
                            </div>

                            {availabilities.length === 0 ? (
                                <p className="empty-text">
                                    برنامه‌ای تعریف نشده است.
                                </p>
                            ) : (
                                <div className="schedule-grid">
                                    {daysOfWeek.map((day, index) => {
                                        const avail = availabilities.find(
                                            (a) => a.day_of_week === index,
                                        );
                                        return (
                                            <div
                                                key={index}
                                                className={`schedule-day-card ${
                                                    avail
                                                        ? "active"
                                                        : "inactive"
                                                }`}
                                            >
                                                <div className="schedule-day-header">
                                                    <span className="schedule-day-name">
                                                        {day}
                                                    </span>
                                                    {avail ? (
                                                        <span className="schedule-day-status active">
                                                            <CheckCircle
                                                                size={12}
                                                            />
                                                            فعال
                                                        </span>
                                                    ) : (
                                                        <span className="schedule-day-status inactive">
                                                            <XCircle
                                                                size={12}
                                                            />
                                                            تعطیل
                                                        </span>
                                                    )}
                                                </div>
                                                {avail ? (
                                                    <div className="schedule-day-time">
                                                        <Clock size={16} />
                                                        <span>
                                                            {toPersianTimeRange(
                                                                avail.start_time,
                                                                avail.end_time,
                                                            )}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="schedule-day-time-off">
                                                        این روز تعطیل است
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* تب ۴: بازه‌های پیش رو */}
                {activeTab === "slots" && (
                    <div className="barber-tab-content">
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">
                                    <Clock size={20} />
                                    بازه‌های پیش رو (۷ روز آینده)
                                </h2>
                                <span className="permissions-count">
                                    {toPersianNumber(upcomingSlots.length)} بازه
                                </span>
                            </div>

                            {upcomingSlots.length === 0 ? (
                                <p className="empty-text">
                                    بازه‌ای برای روزهای آینده وجود ندارد.
                                </p>
                            ) : (
                                <div className="upcoming-slots-list">
                                    {upcomingSlots.map((slot) => {
                                        const cfg =
                                            slotStatusConfig[slot.status] ||
                                            slotStatusConfig.available;
                                        const StatusIcon = cfg.icon;

                                        return (
                                            <div
                                                key={slot.id}
                                                className={`upcoming-slot-row status-${slot.status}`}
                                            >
                                                <div className="upcoming-slot-date">
                                                    <Calendar size={16} />
                                                    <span>
                                                        {formatJalaliDate(
                                                            slot.date,
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="upcoming-slot-time">
                                                    <Clock size={16} />
                                                    <span>
                                                        {toPersianTimeRange(
                                                            slot.start_time,
                                                            slot.end_time,
                                                        )}
                                                    </span>
                                                </div>

                                                {slot.service && (
                                                    <div className="upcoming-slot-service">
                                                        <Scissors size={14} />
                                                        <span>
                                                            {slot.service.name}
                                                        </span>
                                                    </div>
                                                )}

                                                <span
                                                    className="upcoming-slot-status"
                                                    style={{
                                                        backgroundColor: cfg.bg,
                                                        color: cfg.color,
                                                    }}
                                                >
                                                    <StatusIcon size={12} />
                                                    {cfg.label}
                                                </span>

                                                {slot.booked_by && (
                                                    <div className="upcoming-slot-customer">
                                                        <User size={14} />
                                                        <span>
                                                            {
                                                                slot.booked_by
                                                                    .name
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
