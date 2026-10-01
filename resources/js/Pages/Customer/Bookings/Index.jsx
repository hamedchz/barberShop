import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PublicLayout from "../Layouts/PublicLayout";
import BookingCard from "../Components/BookingCard";
import ConfirmModal from "../../Admin/Components/ConfirmModal";
import Search from "../../../Components/Search";
import EmptyList from "../../Admin/Components/EmptyList";
import Pagination from "../../Admin/Components/Pagination";
import "../Assets/Bookings.css";
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Search as SearchIcon,
    Filter,
    X,
    TrendingUp,
    Scissors,
    Star,
    Clock4,
    ChevronDown,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function BookingsIndex({ auth, bookings, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const [cancelModal, setCancelModal] = useState({
        isOpen: false,
        booking: null,
        isLoading: false,
    });

    const bookingsList = bookings.data || [];

    const hasActiveFilters = filters?.status || filters?.search;

    // ============ تب‌های وضعیت ============
    const statusTabs = [
        { id: "", label: "همه", count: stats.total, icon: Calendar },
        {
            id: "upcoming",
            label: "آینده",
            count: stats.pending + stats.confirmed,
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
            "/customer/bookings",
            {
                status: status,
                search: searchTerm,
                sort: filters?.sort,
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
            "/customer/bookings",
            {
                status: filters?.status,
                search: term,
                sort: filters?.sort,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    // ============ پاک کردن فیلترها ============
    const handleClearFilters = () => {
        setSearchTerm("");
        router.get(
            "/customer/bookings",
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // ============ Modal لغو ============
    const openCancelModal = (booking) => {
        setCancelModal({ isOpen: true, booking, isLoading: false });
    };

    const closeCancelModal = () => {
        setCancelModal({ isOpen: false, booking: null, isLoading: false });
    };

    const handleConfirmCancel = () => {
        if (!cancelModal.booking) return;
        setCancelModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(`/customer/bookings/${cancelModal.booking.id}/cancel`, {
            preserveScroll: true,
            onSuccess: () => closeCancelModal(),
            onError: () =>
                setCancelModal((prev) => ({
                    ...prev,
                    isLoading: false,
                })),
        });
    };

    // ============ Modal نظر ============
    const handleReviewClick = (booking) => {
        // به صفحه ثبت نظر برو
        window.location.href = `/customer/bookings/${booking.id}/review`;
    };

    return (
        <PublicLayout>
            <Head title="نوبت‌های من" />

            <div className="bookings-page">
                {/* ============ هدر ============ */}
                <div className="bookings-header">
                    <div>
                        <h1 className="bookings-title">نوبت‌های من</h1>
                        <p className="bookings-subtitle">
                            {stats.total > 0
                                ? `مجموع ${toPersianNumber(
                                      stats.total,
                                  )} نوبت ثبت شده است`
                                : "هنوز نوبتی ثبت نکرده‌اید"}
                        </p>
                    </div>

                    <Link href="/barbers" className="bookings-new-btn">
                        <Scissors size={16} />
                        رزرو نوبت جدید
                    </Link>
                </div>

                {/* ============ کارت‌های آمار ============ */}
                {stats.total > 0 && (
                    <div className="bookings-stats">
                        <div className="stat-card total">
                            <div className="stat-card-icon">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <span className="stat-value">
                                    {toPersianNumber(stats.total)}
                                </span>
                                <span className="stat-label">کل نوبت‌ها</span>
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

                        <div className="stat-card completed">
                            <div className="stat-card-icon">
                                <Star
                                    size={20}
                                    fill="#3b82f6"
                                    color="#3b82f6"
                                />
                            </div>
                            <div>
                                <span className="stat-value">
                                    {toPersianNumber(stats.completed)}
                                </span>
                                <span className="stat-label">تکمیل شده</span>
                            </div>
                        </div>

                        <div className="stat-card cancelled">
                            <div className="stat-card-icon">
                                <XCircle size={20} />
                            </div>
                            <div>
                                <span className="stat-value">
                                    {toPersianNumber(stats.cancelled)}
                                </span>
                                <span className="stat-label">لغو شده</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============ تب‌های وضعیت ============ */}
                <div className="bookings-tabs">
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

                {/* ============ نوار جستجو ============ */}
                <div className="bookings-toolbar">
                    <div className="bookings-search-wrapper">
                        <Search
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={handleSearch}
                            placeholder="جستجوی نام آرایشگر یا خدمت..."
                            delay={500}
                            isLoading={isSearching}
                        />
                    </div>

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

                {/* ============ لیست نوبت‌ها ============ */}
                {bookingsList.length === 0 ? (
                    <div className="bookings-empty">
                        <div className="empty-icon">
                            <Calendar size={48} />
                        </div>
                        <h3>
                            {hasActiveFilters
                                ? "نتیجه‌ای یافت نشد"
                                : "هنوز نوبتی ثبت نکرده‌اید"}
                        </h3>
                        <p>
                            {hasActiveFilters
                                ? "هیچ نوبتی با فیلترهای انتخاب شده مطابقت ندارد."
                                : "برای شروع، از بین آرایشگران یک نفر را انتخاب کنید و نوبت بگیرید."}
                        </p>
                        {hasActiveFilters ? (
                            <button
                                className="clear-filters-btn-primary"
                                onClick={handleClearFilters}
                            >
                                پاک کردن فیلترها
                            </button>
                        ) : (
                            <Link href="/barbers" className="empty-cta">
                                <Scissors size={16} />
                                مشاهده آرایشگران
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="bookings-list">
                        {bookingsList.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onCancelClick={openCancelModal}
                                onReviewClick={handleReviewClick}
                            />
                        ))}
                    </div>
                )}

                {/* ============ صفحه‌بندی ============ */}
                <Pagination links={bookings.links} />
            </div>

            {/* ============ Modal لغو رزرو ============ */}
            <ConfirmModal
                isOpen={cancelModal.isOpen}
                onClose={closeCancelModal}
                onConfirm={handleConfirmCancel}
                title="لغو نوبت"
                message={
                    cancelModal.booking
                        ? `آیا از لغو نوبت خود در تاریخ ${formatJalaliDate(
                              cancelModal.booking.date,
                          )} مطمئن هستید؟ در صورت لغو، مبلغ پرداخت شده به حساب شما بازگردانده می‌شود.`
                        : ""
                }
                confirmText="بله، لغو کن"
                cancelText="انصراف"
                type="danger"
                isLoading={cancelModal.isLoading}
            />
        </PublicLayout>
    );
}
