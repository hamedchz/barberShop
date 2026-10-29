import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import SearchComponent from "../../../Components/Search";
import Pagination from "../../Admin/Components/Pagination";
import "../Dashboard/Assets/css/BarberDashboard.css";
import "./Assets/css/BarberCustomers.css";

import {
    Users,
    User,
    Search,
    Filter,
    X,
    Phone,
    Mail,
    Calendar,
    Star,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Eye,
    RefreshCw,
    Info,
    Award,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    Scissors,
    ArrowRight,
    UserCheck,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import {
    formatFullDateWithoutTime,
    formatFullDateTime,
} from "../../../utils/dateHelpers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";

const sortOptions = [
    { value: "latest", label: "آخرین رزرو" },
    { value: "most_bookings", label: "بیشترین رزرو" },
    { value: "most_spent", label: "بیشترین خرید" },
    { value: "name", label: "نام (الفبا)" },
];

export default function BarberCustomersIndex({
    customers,
    stats,
    filters = {},
}) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (query) => {
        setIsSearching(true);
        router.get(
            "/barber/customers",
            { ...filters, search: query, page: 1 },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    const handleSort = (sort) => {
        router.get(
            "/barber/customers",
            { ...filters, sort, page: 1 },
            { preserveScroll: true, preserveState: true },
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        router.get("/barber/customers", {}, { preserveScroll: true });
    };

    const renderCustomer = (customer) => {
        const completionRate =
            customer.total_bookings > 0
                ? Math.round(
                      (customer.completed_bookings / customer.total_bookings) *
                          100,
                  )
                : 0;

        return (
            <Link
                key={customer.id}
                href={`/barber/customers/${customer.id}`}
                className="barber-customer-card"
            >
                {/* آواتار */}
                <div className="barber-customer-card-avatar">
                    {customer.avatar ? (
                        <img src={customer.avatar} alt={customer.name} />
                    ) : (
                        customer.name?.charAt(0).toUpperCase() || "؟"
                    )}
                </div>

                {/* اطلاعات اصلی */}
                <div className="barber-customer-card-content">
                    <div className="barber-customer-card-header">
                        <h3 className="barber-customer-card-name">
                            {customer.name}
                        </h3>
                        {customer.completed_bookings >= 3 && (
                            <span className="barber-customer-card-vip">
                                <Award size={10} />
                                مشتری وفادار
                            </span>
                        )}
                    </div>

                    <div className="barber-customer-card-contact">
                        {customer.phone && (
                            <span className="barber-customer-card-contact-item">
                                <Phone size={11} />
                                {toPersianNumber(customer.phone)}
                            </span>
                        )}
                        {customer.email && (
                            <span className="barber-customer-card-contact-item">
                                <Mail size={11} />
                                {customer.email}
                            </span>
                        )}
                    </div>

                    {/* آمار */}
                    <div className="barber-customer-card-stats">
                        <div className="barber-customer-card-stat">
                            <Calendar size={12} />
                            <span className="stat-value">
                                {toPersianNumber(customer.total_bookings)}
                            </span>
                            <span className="stat-label">رزرو</span>
                        </div>
                        <div className="barber-customer-card-stat amount">
                            <DollarSign size={12} />
                            <span className="stat-value">
                                {formatCompactNumber(customer.total_spent)}
                            </span>
                            <span className="stat-label">تومان</span>
                        </div>
                        {customer.last_review && (
                            <div className="barber-customer-card-stat rating">
                                <Star
                                    size={12}
                                    fill="#fbbf24"
                                    color="#fbbf24"
                                />
                                <span className="stat-value">
                                    {toPersianNumber(
                                        customer.last_review.rating,
                                    )}
                                </span>
                                <span className="stat-label">امتیاز</span>
                            </div>
                        )}
                    </div>

                    {/* آخرین رزرو */}
                    {customer.last_booking && (
                        <div className="barber-customer-card-last-booking">
                            <span className="last-booking-label">
                                آخرین رزرو:
                            </span>
                            <span className="last-booking-service">
                                <Scissors size={10} />
                                {customer.last_booking.service}
                            </span>
                            {customer.last_booking.date && (
                                <span className="last-booking-date">
                                    <Calendar size={10} />
                                    {formatFullDateWithoutTime(
                                        customer.last_booking.date,
                                    )}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* نرخ تکمیل */}
                <div className="barber-customer-card-completion">
                    <div className="completion-ring">
                        <svg
                            viewBox="0 0 36 36"
                            className="completion-ring-svg"
                        >
                            <circle
                                cx="18"
                                cy="18"
                                r="15.9"
                                fill="none"
                                stroke="var(--color-border, #e5e7eb)"
                                strokeWidth="3"
                            />
                            <circle
                                cx="18"
                                cy="18"
                                r="15.9"
                                fill="none"
                                stroke="var(--color-primary, #10b981)"
                                strokeWidth="3"
                                strokeDasharray={`${completionRate}, 100`}
                                strokeLinecap="round"
                                transform="rotate(-90 18 18)"
                            />
                        </svg>
                        <span className="completion-ring-text">
                            {toPersianNumber(completionRate)}٪
                        </span>
                    </div>
                    <span className="completion-label">تکمیل</span>
                </div>

                {/* فلش */}
                <ChevronLeft size={18} className="barber-customer-card-arrow" />
            </Link>
        );
    };

    return (
        <Layout>
            <Head title="مشتریان من" />

            <div className="barber-dashboard">
                {/* هدر */}
                <div className="barber-hero">
                    <div className="barber-hero-content">
                        <div className="barber-hero-greeting">
                            <h1 className="greeting-name"> مشتریان من</h1>
                        </div>
                        <p className="barber-hero-subtitle">
                            {toPersianNumber(stats.total_customers)} مشتری —{" "}
                            <strong>
                                {toPersianNumber(stats.returning_customers)}
                            </strong>{" "}
                            مشتری وفادار
                        </p>
                    </div>

                    <div className="barber-hero-actions">
                        <button
                            type="button"
                            className="barber-hero-btn"
                            onClick={() =>
                                router.reload({ only: ["customers", "stats"] })
                            }
                        >
                            <RefreshCw size={16} />
                            بروزرسانی
                        </button>
                    </div>
                </div>

                {/* آمار */}
                <div className="barber-stats-grid">
                    <div className="barber-stat-card bookings">
                        <div className="barber-stat-icon bookings">
                            <Users size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">
                                کل مشتریان
                            </span>
                            <div className="barber-stat-value">
                                {toPersianNumber(stats.total_customers)}
                                <span className="barber-stat-unit">نفر</span>
                            </div>
                        </div>
                    </div>

                    <div className="barber-stat-card revenue">
                        <div className="barber-stat-icon revenue">
                            <UserCheck size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">
                                مشتریان بازگشتی
                            </span>
                            <div className="barber-stat-value">
                                {toPersianNumber(stats.returning_customers)}
                                <span className="barber-stat-unit">نفر</span>
                            </div>
                        </div>
                    </div>

                    <div className="barber-stat-card wallet">
                        <div className="barber-stat-icon wallet">
                            <Calendar size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">
                                مشتریان این ماه
                            </span>
                            <div className="barber-stat-value">
                                {toPersianNumber(stats.this_month_customers)}
                                <span className="barber-stat-unit">نفر</span>
                            </div>
                        </div>
                    </div>

                    <div className="barber-stat-card rating">
                        <div className="barber-stat-icon rating">
                            <TrendingUp size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">
                                میانگین رزرو
                            </span>
                            <div className="barber-stat-value">
                                {toPersianNumber(
                                    stats.avg_bookings_per_customer,
                                )}
                                <span className="barber-stat-unit">
                                    رزرو/نفر
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="barber-customers-toolbar">
                    <SearchComponent
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onSearch={handleSearch}
                        placeholder="جستجو در نام، شماره تلفن، ایمیل..."
                        delay={500}
                        isLoading={isSearching}
                    />

                    <div className="barber-customers-sort">
                        <Filter size={14} />
                        <select
                            className="barber-customers-sort-select"
                            value={filters.sort || "latest"}
                            onChange={(e) => handleSort(e.target.value)}
                        >
                            {sortOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* لیست */}
                <div className="barber-card">
                    <div className="barber-card-header">
                        <div className="barber-card-header-icon purple">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2>لیست مشتریان</h2>
                            <p>{toPersianNumber(customers.total)} مشتری</p>
                        </div>
                    </div>

                    {customers.data.length === 0 ? (
                        <div className="barber-empty-state">
                            <div className="barber-empty-state-icon">
                                <Users size={48} />
                            </div>
                            <h3>هنوز مشتری‌ای نداری</h3>
                            <p>
                                وقتی مشتری‌ها از شما رزرو کنند، اینجا نمایش داده
                                می‌شوند.
                            </p>
                            <Link
                                href="/barber/bookings"
                                className="barber-empty-state-btn"
                            >
                                <Calendar size={14} />
                                مشاهده رزروها
                            </Link>
                        </div>
                    ) : (
                        <div className="barber-customers-list">
                            {customers.data.map(renderCustomer)}
                        </div>
                    )}

                    <Pagination links={customers.links} only={customers} />
                </div>
            </div>
        </Layout>
    );
}
