import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import AdminBarberBookingCard from "../Components/AdminBarberBookingCard";
import Pagination from "../Components/Pagination";
import EmptyList from "../Components/EmptyList";
import ConfirmModal from "../Components/ConfirmModal";
import Search from "../../../Components/Search";

import PersianDatePicker from "../../../Components/PersianDatePicker";

import "../Assets/css/AdminBarberBookings.css";
import {
    ArrowRight,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Clock4,
    Star,
    Filter,
    X,
    DollarSign,
    TrendingUp,
    User,
    Phone,
    MapPin,
    Award,
    Wifi,
    WifiOff,
    BarChart2,
    Scissors,
    Eye,
    Edit,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function BarberBookings({
    auth,
    barber,
    bookings,
    stats,
    filters,
}) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [dateFrom, setDateFrom] = useState(filters?.date_from || "");
    const [dateTo, setDateTo] = useState(filters?.date_to || "");

    const bookingsList = bookings.data || [];

    const hasActiveFilters =
        filters?.status ||
        filters?.search ||
        filters?.date_from ||
        filters?.date_to;

    // ============ تب‌های وضعیت ============
    const statusTabs = [
        { id: "", label: "همه", count: stats.total, icon: Calendar },
        { id: "today", label: "امروز", count: stats.today, icon: Clock4 },
        {
            id: "pending",
            label: "در انتظار",
            count: stats.pending,
            icon: Clock,
        },
        {
            id: "confirmed",
            label: "تایید شده",
            count: stats.confirmed,
            icon: CheckCircle,
        },
        {
            id: "completed",
            label: "تکمیل شده",
            count: stats.completed,
            icon: Star,
        },
        {
            id: "cancelled",
            label: "لغو شده",
            count: stats.cancelled,
            icon: XCircle,
        },
    ];

    // ============ تغییر وضعیت ============
    const handleStatusFilter = (status) => {
        router.get(
            `/admin/barbers/${barber.id}/bookings`,
            {
                status: status,
                search: searchTerm,
                sort: filters?.sort,
                date_from: dateFrom,
                date_to: dateTo,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // ============ جستجو ============
    const handleSearch = (term) => {
        setIsSearching(true);
        router.get(
            `/admin/barbers/${barber.id}/bookings`,
            {
                status: filters?.status,
                search: term,
                sort: filters?.sort,
                date_from: dateFrom,
                date_to: dateTo,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    // ============ فیلتر تاریخ ============
    const handleDateFilter = () => {
        router.get(
            `/admin/barbers/${barber.id}/bookings`,
            {
                status: filters?.status,
                search: searchTerm,
                sort: filters?.sort,
                date_from: dateFrom,
                date_to: dateTo,
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
        setDateFrom("");
        setDateTo("");
        router.get(
            `/admin/barbers/${barber.id}/bookings`,
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
            <Head title={`رزروهای ${barber.name}`} />

            <div className="center-column">
                {/* ============ دکمه بازگشت ============ */}
                <div className="page-header-with-back">
                    <Link href="/admin/barbers" className="back-btn">
                        <ArrowRight size={20} />
                        <span>بازگشت به لیست آرایشگران</span>
                    </Link>
                </div>

                {/* ============ کارت پروفایل آرایشگر ============ */}
                <div className="barber-info-card-admin">
                    <div className="barber-info-card-header">
                        <div className="barber-info-avatar-wrapper">
                            <div className="barber-info-avatar">
                                {barber.thumbnail ? (
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
                                <span className="barber-info-online">
                                    <span className="pulse-ring"></span>
                                </span>
                            )}
                        </div>

                        <div className="barber-info-content">
                            <div className="barber-info-name-row">
                                <h2 className="barber-info-name">
                                    {barber.name}
                                </h2>

                                {barber.is_online ? (
                                    <span className="barber-info-status online">
                                        <Wifi size={12} />
                                        آنلاین
                                    </span>
                                ) : (
                                    <span className="barber-info-status offline">
                                        <WifiOff size={12} />
                                        آفلاین
                                    </span>
                                )}

                                {barber.rating > 0 && (
                                    <span className="barber-info-rating">
                                        <Star
                                            size={12}
                                            fill="#fbbf24"
                                            color="#fbbf24"
                                        />
                                        {toPersianNumber(barber.rating)}
                                        <span className="rating-count">
                                            (
                                            {toPersianNumber(
                                                barber.total_reviews,
                                            )}
                                            )
                                        </span>
                                    </span>
                                )}
                            </div>

                            <div className="barber-info-meta">
                                {barber.specialty && (
                                    <span className="meta-item">
                                        <Award size={12} />
                                        {barber.specialty}
                                    </span>
                                )}
                                {barber.city && (
                                    <span className="meta-item">
                                        <MapPin size={12} />
                                        {barber.city}
                                    </span>
                                )}
                                {barber.phone && (
                                    <span className="meta-item">
                                        <Phone size={12} />
                                        <span dir="ltr">{barber.phone}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <Link
                            href={`/admin/barbers/${barber.id}`}
                            className="barber-info-view-btn"
                        >
                            <Eye size={16} />
                            پروفایل کامل
                        </Link>
                    </div>
                </div>

                {/* ============ کارت‌های آمار ============ */}
                <div className="barber-bookings-stats-admin">
                    <div className="admin-stat-card total">
                        <div className="admin-stat-icon">
                            <BarChart2 size={20} />
                        </div>
                        <div>
                            <span className="admin-stat-value">
                                {toPersianNumber(stats.total)}
                            </span>
                            <span className="admin-stat-label">کل رزروها</span>
                        </div>
                    </div>

                    <div className="admin-stat-card today">
                        <div className="admin-stat-icon">
                            <Clock4 size={20} />
                        </div>
                        <div>
                            <span className="admin-stat-value">
                                {toPersianNumber(stats.today)}
                            </span>
                            <span className="admin-stat-label">امروز</span>
                        </div>
                    </div>

                    <div className="admin-stat-card completed">
                        <div className="admin-stat-icon">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <span className="admin-stat-value">
                                {toPersianNumber(stats.completed)}
                            </span>
                            <span className="admin-stat-label">تکمیل شده</span>
                        </div>
                    </div>

                    <div className="admin-stat-card revenue">
                        <div className="admin-stat-icon">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <span className="admin-stat-value">
                                {toPersianNumber(
                                    Math.round(stats.total_revenue / 1000),
                                )}
                                K
                            </span>
                            <span className="admin-stat-label">
                                درآمد کل (هزار)
                            </span>
                        </div>
                    </div>

                    <div className="admin-stat-card month-revenue">
                        <div className="admin-stat-icon">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <span className="admin-stat-value">
                                {toPersianNumber(
                                    Math.round(stats.month_revenue / 1000),
                                )}
                                K
                            </span>
                            <span className="admin-stat-label">
                                درآمد ماه (هزار)
                            </span>
                        </div>
                    </div>
                </div>

                {/* ============ تب‌های وضعیت ============ */}
                <div className="barber-bookings-tabs-admin">
                    {statusTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = (filters?.status || "") === tab.id;

                        return (
                            <button
                                key={tab.id}
                                className={`admin-tab ${
                                    isActive ? "active" : ""
                                }`}
                                onClick={() => handleStatusFilter(tab.id)}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className="admin-tab-count">
                                        {toPersianNumber(tab.count)}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ============ نوار ابزار ============ */}
                <div className="admin-bookings-toolbar">
                    <div className="admin-search-wrapper">
                        <Search
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={handleSearch}
                            placeholder="جستجوی نام، شماره یا ایمیل مشتری..."
                            delay={500}
                            isLoading={isSearching}
                        />
                    </div>

                    <div className="admin-toolbar-actions">
                        <button
                            className={`filter-toggle-btn ${
                                showFilters ? "active" : ""
                            }`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={16} />
                            فیلتر تاریخ
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

                {/* ============ پنل فیلتر تاریخ ============ */}
                {showFilters && (
                    <div className="admin-filters-panel">
                        <PersianDatePicker
                            label="از تاریخ"
                            value={dateFrom}
                            onChange={setDateFrom}
                            placeholder="انتخاب تاریخ شروع"
                        />

                        <PersianDatePicker
                            label="تا تاریخ"
                            value={dateTo}
                            onChange={setDateTo}
                            placeholder="انتخاب تاریخ پایان"
                            minDate={dateFrom}
                        />

                        <button
                            className="btn-primary apply-filter-btn"
                            onClick={handleDateFilter}
                        >
                            اعمال فیلتر
                        </button>
                    </div>
                )}

                {/* ============ لیست رزروها ============ */}
                {bookingsList.length === 0 ? (
                    <div className="card" style={{ padding: "3rem" }}>
                        <EmptyList
                            title={
                                hasActiveFilters
                                    ? "نتیجه‌ای یافت نشد"
                                    : "رزروی ثبت نشده است"
                            }
                            message={
                                hasActiveFilters
                                    ? "هیچ رزروی با فیلترهای انتخاب شده مطابقت ندارد."
                                    : "این آرایشگر هنوز رزروی دریافت نکرده است."
                            }
                        />
                    </div>
                ) : (
                    <div className="admin-bookings-list">
                        {bookingsList.map((booking) => (
                            <AdminBarberBookingCard
                                key={booking.id}
                                booking={booking}
                                barberId={barber.id}
                            />
                        ))}
                    </div>
                )}

                {/* ============ صفحه‌بندی ============ */}
                <Pagination links={bookings.links} />
            </div>
        </Layout>
    );
}
