import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import BarberBookingCard from "../Components/BarberBookingCard";
import ConfirmModal from "../../Admin/Components/ConfirmModal";
import Search from "../../../Components/Search";
import EmptyList from "../../Admin/Components/EmptyList";
import Pagination from "../../Admin/Components/Pagination";
import "../Assets/css/BarberBookings.css";
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Clock4,
    Filter,
    X,
    DollarSign,
    TrendingUp,
    Users,
    Scissors,
    Star,
    Zap,
    Sun,
    Sunrise,
    CalendarDays,
    CalendarRange,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

import PersianDatePicker from "../../../Components/PersianDatePicker";

export default function BookingsIndex({ auth, bookings, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [dateFrom, setDateFrom] = useState(filters?.date_from || "");
    const [dateTo, setDateTo] = useState(filters?.date_to || "");

    const [actionModal, setActionModal] = useState({
        isOpen: false,
        type: null, // confirm | complete | cancel
        booking: null,
        isLoading: false,
    });

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
            "/barber/bookings",
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
            "/barber/bookings",
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
            "/barber/bookings",
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
            "/barber/bookings",
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // ============ تغییر وضعیت رزرو ============
    const openActionModal = (type, booking) => {
        setActionModal({
            isOpen: true,
            type: type,
            booking: booking,
            isLoading: false,
        });
    };

    const closeActionModal = () => {
        setActionModal({
            isOpen: false,
            type: null,
            booking: null,
            isLoading: false,
        });
    };

    const [dateFilter, setDateFilter] = useState("");

    const handleConfirmAction = () => {
        if (!actionModal.booking) return;

        setActionModal((prev) => ({ ...prev, isLoading: true }));

        const { type, booking } = actionModal;

        switch (type) {
            case "confirm":
                router.patch(
                    `/barber/bookings/${booking.id}/confirm`,
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: () => closeActionModal(),
                        onError: () =>
                            setActionModal((prev) => ({
                                ...prev,
                                isLoading: false,
                            })),
                    },
                );
                break;

            case "complete":
                router.patch(
                    `/barber/bookings/${booking.id}/complete`,
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: () => closeActionModal(),
                        onError: () =>
                            setActionModal((prev) => ({
                                ...prev,
                                isLoading: false,
                            })),
                    },
                );
                break;

            case "cancel":
                router.delete(`/barber/bookings/${booking.id}/cancel`, {
                    preserveScroll: true,
                    onSuccess: () => closeActionModal(),
                    onError: () =>
                        setActionModal((prev) => ({
                            ...prev,
                            isLoading: false,
                        })),
                });
                break;
        }
    };

    // ============ Modal Config ============
    const getModalConfig = () => {
        const { type, booking } = actionModal;
        if (!booking) return {};

        const configs = {
            confirm: {
                title: "تایید رزرو",
                message: `آیا از تایید رزرو مشتری "${booking.customer?.name}" در تاریخ ${booking.date} مطمئن هستید؟`,
                confirmText: "بله، تایید کن",
                type: "success",
            },
            complete: {
                title: "تکمیل رزرو",
                message: `آیا رزرو مشتری "${booking.customer?.name}" تکمیل شده است؟`,
                confirmText: "بله، تکمیل کن",
                type: "success",
            },
            cancel: {
                title: "لغو رزرو",
                message: `آیا از لغو رزرو مشتری "${booking.customer?.name}" مطمئن هستید؟ مبلغ پرداختی به مشتری بازگردانده می‌شود.`,
                confirmText: "بله، لغو کن",
                type: "danger",
            },
        };

        return configs[type] || {};
    };

    const modalConfig = getModalConfig();

    return (
        <Layout>
            <Head title="مدیریت رزروها" />

            <div className="center-column">
                {/* ============ هدر ============ */}
                <div className="roles-page-header">
                    <div>
                        <h1 className="roles-page-title">مدیریت رزروها</h1>
                        <p
                            style={{
                                color: "#6b7280",
                                fontSize: "0.875rem",
                                marginTop: "0.25rem",
                            }}
                        >
                            {stats.total > 0
                                ? `مجموع ${toPersianNumber(stats.total)} رزرو`
                                : "هنوز رزروی ثبت نشده است"}
                        </p>
                    </div>
                </div>

                {/* ============ کارت‌های آمار ============ */}
                {stats.total > 0 && (
                    <div className="barber-bookings-stats">
                        <div className="stat-card today">
                            <div className="stat-card-icon">
                                <Clock4 size={20} />
                            </div>
                            <div>
                                <span className="stat-value">
                                    {toPersianNumber(stats.today)}
                                </span>
                                <span className="stat-label">نوبت امروز</span>
                            </div>
                        </div>

                        <div className="stat-card pending">
                            <div className="stat-card-icon">
                                <Clock size={20} />
                            </div>
                            <div>
                                <span className="stat-value">
                                    {toPersianNumber(stats.pending)}
                                </span>
                                <span className="stat-label">در انتظار</span>
                            </div>
                        </div>

                        <div className="stat-card confirmed">
                            <div className="stat-card-icon">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <span className="stat-value">
                                    {toPersianNumber(stats.confirmed)}
                                </span>
                                <span className="stat-label">تایید شده</span>
                            </div>
                        </div>

                        <div className="stat-card revenue">
                            <div className="stat-card-icon">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <span className="stat-value">
                                    {toPersianNumber(
                                        Math.round(stats.today_revenue / 1000),
                                    )}
                                    K
                                </span>
                                <span className="stat-label">درآمد امروز</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============ تب‌های وضعیت ============ */}
                <div className="barber-bookings-tabs">
                    {statusTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = (filters?.status || "") === tab.id;

                        return (
                            <button
                                key={tab.id}
                                className={`bookings-tab ${
                                    isActive ? "active" : ""
                                }`}
                                onClick={() => handleStatusFilter(tab.id)}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className="tab-count">
                                        {toPersianNumber(tab.count)}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ============ نوار جستجو و فیلتر ============ */}
                <div className="barber-bookings-toolbar">
                    <div className="bookings-search-wrapper">
                        <Search
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={handleSearch}
                            placeholder="جستجوی نام یا شماره مشتری..."
                            delay={500}
                            isLoading={isSearching}
                        />
                    </div>

                    <div className="bookings-toolbar-actions">
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
                    <div className="barber-bookings-filters-panel">
                        {/* ============ دکمه‌های میانبر ============ */}
                        {/* ============ میانبرهای تاریخ ============ */}
                        <div className="date-shortcuts-wrapper">
                            <div className="date-shortcuts-header">
                                <div className="date-shortcuts-title">
                                    <Zap size={14} />
                                    <span>انتخاب سریع بازه</span>
                                </div>
                            </div>

                            <div className="date-shortcuts">
                                {/* امروز */}
                                <button
                                    type="button"
                                    className="shortcut-chip today"
                                    onClick={() => {
                                        const today = new Date();
                                        const year = today.getFullYear();
                                        const month = String(
                                            today.getMonth() + 1,
                                        ).padStart(2, "0");
                                        const day = String(
                                            today.getDate(),
                                        ).padStart(2, "0");
                                        const dateStr = `${year}-${month}-${day}`;
                                        setDateFrom(dateStr);
                                        setDateTo(dateStr);
                                    }}
                                >
                                    <Sun size={14} />
                                    <span>امروز</span>
                                </button>

                                {/* فردا */}
                                <button
                                    type="button"
                                    className="shortcut-chip tomorrow"
                                    onClick={() => {
                                        const today = new Date();
                                        const tomorrow = new Date(today);
                                        tomorrow.setDate(today.getDate() + 1);
                                        const year = tomorrow.getFullYear();
                                        const month = String(
                                            tomorrow.getMonth() + 1,
                                        ).padStart(2, "0");
                                        const day = String(
                                            tomorrow.getDate(),
                                        ).padStart(2, "0");
                                        const dateStr = `${year}-${month}-${day}`;
                                        setDateFrom(dateStr);
                                        setDateTo(dateStr);
                                    }}
                                >
                                    <Sunrise size={14} />
                                    <span>فردا</span>
                                </button>

                                {/* ۷ روز آینده */}
                                <button
                                    type="button"
                                    className="shortcut-chip next-week"
                                    onClick={() => {
                                        const today = new Date();
                                        const nextWeek = new Date(today);
                                        nextWeek.setDate(today.getDate() + 7);

                                        const formatDate = (d) => {
                                            const year = d.getFullYear();
                                            const month = String(
                                                d.getMonth() + 1,
                                            ).padStart(2, "0");
                                            const day = String(
                                                d.getDate(),
                                            ).padStart(2, "0");
                                            return `${year}-${month}-${day}`;
                                        };

                                        setDateFrom(formatDate(today));
                                        setDateTo(formatDate(nextWeek));
                                    }}
                                >
                                    <CalendarDays size={14} />
                                    <span>۷ روز آینده</span>
                                </button>

                                {/* تا پایان ماه */}
                                <button
                                    type="button"
                                    className="shortcut-chip end-month"
                                    onClick={() => {
                                        const today = new Date();
                                        const endOfMonth = new Date(
                                            today.getFullYear(),
                                            today.getMonth() + 1,
                                            0,
                                        );

                                        const formatDate = (d) => {
                                            const year = d.getFullYear();
                                            const month = String(
                                                d.getMonth() + 1,
                                            ).padStart(2, "0");
                                            const day = String(
                                                d.getDate(),
                                            ).padStart(2, "0");
                                            return `${year}-${month}-${day}`;
                                        };

                                        setDateFrom(formatDate(today));
                                        setDateTo(formatDate(endOfMonth));
                                    }}
                                >
                                    <CalendarRange size={14} />
                                    <span>تا پایان ماه</span>
                                </button>

                                {/* پاک کردن */}
                                <button
                                    type="button"
                                    className="shortcut-chip clear"
                                    onClick={() => {
                                        setDateFrom("");
                                        setDateTo("");
                                    }}
                                >
                                    <X size={14} />
                                    <span>پاک کردن</span>
                                </button>
                            </div>
                        </div>
                        {/* ============ انتخابگرهای تاریخ ============ */}
                        <div className="date-pickers-row">
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
                                minDate={dateFrom || null}
                            />

                            <button
                                type="button"
                                className="btn-primary apply-filter-btn"
                                onClick={handleDateFilter}
                            >
                                اعمال فیلتر
                            </button>
                        </div>
                    </div>
                )}

                {/* ============ لیست رزروها ============ */}
                {bookingsList.length === 0 ? (
                    <div className="card" style={{ padding: "3rem" }}>
                        <EmptyList
                            title={
                                hasActiveFilters
                                    ? "نتیجه‌ای یافت نشد"
                                    : "هنوز رزروی ثبت نشده است"
                            }
                            message={
                                hasActiveFilters
                                    ? "هیچ رزروی با فیلترهای انتخاب شده مطابقت ندارد."
                                    : "به زودی مشتریان می‌توانند از شما نوبت بگیرند."
                            }
                        />
                    </div>
                ) : (
                    <div className="barber-bookings-list">
                        {bookingsList.map((booking) => (
                            <BarberBookingCard
                                key={booking.id}
                                booking={booking}
                                onConfirmClick={(b) =>
                                    openActionModal("confirm", b)
                                }
                                onCompleteClick={(b) =>
                                    openActionModal("complete", b)
                                }
                                onCancelClick={(b) =>
                                    openActionModal("cancel", b)
                                }
                            />
                        ))}
                    </div>
                )}

                {/* ============ صفحه‌بندی ============ */}
                <Pagination links={bookings.links} />
            </div>

            {/* ============ Modal عملیات ============ */}
            <ConfirmModal
                isOpen={actionModal.isOpen}
                onClose={closeActionModal}
                onConfirm={handleConfirmAction}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                cancelText="انصراف"
                type={modalConfig.type}
                isLoading={actionModal.isLoading}
            />
        </Layout>
    );
}
