import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import {
    ArrowRight,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Shield,
    AlertTriangle,
    ShoppingBag,
    Wallet,
    TrendingUp,
    TrendingDown,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock4,
    UserX,
    UserCheck,
    Ban,
    Eye,
    FileText,
    Percent,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import {
    formatFullDateTime,
    formatFullDateWithoutTime,
} from "../../../utils/dateHelpers";
import "../Assets/css/Customers.css";
import "../Assets/css/CustomerShow.css";
import {
    BookingStatus,
    getBookingStatusLabel,
} from "../../../Enums/BookingStatus";

import {
    UserWarningType,
    getUserWarningTypeLabel,
} from "../../../Enums/UserWarningType";
import Pagination from "../Components/Pagination";
import CustomerStatusCard from "./CustomerStatusCard";

export default function CustomerShow({
    customer,
    stats,
    recentBookings,
    warnings,
    transactions,
    disputes,
    wallet,
}) {
    const [activeTab, setActiveTab] = useState("bookings");

    const tabs = [
        {
            key: "bookings",
            label: "رزروها",
            icon: ShoppingBag,
            count: stats.total_bookings,
        },
        {
            key: "warnings",
            label: "اخطارها",
            icon: AlertTriangle,
            count: stats.warnings_count,
        },
        {
            key: "disputes",
            label: "اعتراضات",
            icon: Shield,
            count: stats.disputes_count,
        },
        { key: "transactions", label: "تراکنش‌ها", icon: Wallet },
    ];

    const handleToggleStatus = () => {
        router.patch(
            route("admin.customers.toggle", customer.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <Layout>
            <Head title={`مشتری: ${customer.name}`} />

            <div className="admin-customer-show-page">
                {/* ============ بازگشت ============ */}
                <div className="page-header-with-back">
                    <Link
                        href={route("admin.customers.index")}
                        className="back-btn"
                    >
                        <ArrowRight size={20} />
                        <span>بازگشت به لیست مشتریان</span>
                    </Link>
                </div>

                {/* ============ پروفایل ============ */}
                <div className="customer-profile-card">
                    <div className="customer-profile-avatar">
                        {customer.thumbnail ? (
                            <img src={customer.thumbnail} alt={customer.name} />
                        ) : (
                            <span>
                                {customer.name?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="customer-profile-info">
                        <div className="customer-profile-header">
                            <h1>{customer.name}</h1>
                            <span
                                className={`customer-status-badge ${
                                    customer.is_active ? "active" : "inactive"
                                }`}
                            >
                                {customer.is_active ? "فعال" : "غیرفعال"}
                            </span>
                            {stats.warnings_count > 0 && (
                                <span className="customer-warning-badge-large">
                                    <AlertTriangle size={12} />
                                    {toPersianNumber(stats.warnings_count)}{" "}
                                    اخطار فعال
                                </span>
                            )}
                        </div>

                        <div className="customer-profile-contact">
                            {customer.phone && (
                                <a
                                    href={`tel:${customer.phone}`}
                                    className="contact-item"
                                    dir="ltr"
                                >
                                    <Phone size={14} />
                                    {toPersianNumber(customer.phone)}
                                    {customer.phone_verified && (
                                        <CheckCircle
                                            size={12}
                                            className="verified"
                                        />
                                    )}
                                </a>
                            )}

                            {customer.email && (
                                <a
                                    href={`mailto:${customer.email}`}
                                    className="contact-item"
                                    dir="ltr"
                                >
                                    <Mail size={14} />
                                    {customer.email}
                                </a>
                            )}
                        </div>

                        <div className="customer-profile-meta">
                            <span>
                                عضویت از{" "}
                                {formatFullDateTime(customer.created_at)}
                            </span>
                            {customer.last_seen_at && (
                                <>
                                    <span className="separator">•</span>
                                    <span>
                                        آخرین بازدید:{" "}
                                        {formatFullDateTime(
                                            customer.last_seen_at,
                                        )}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============ آمار ============ */}
                <div className="customer-stats-grid">
                    <div className="customer-stat-card blue">
                        <div className="stat-icon-box">
                            <ShoppingBag size={20} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">کل رزروها</span>
                            <span className="stat-value">
                                {toPersianNumber(stats.total_bookings)}
                            </span>
                        </div>
                    </div>

                    <div className="customer-stat-card green">
                        <div className="stat-icon-box">
                            <CheckCircle size={20} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">تکمیل شده</span>
                            <span className="stat-value">
                                {toPersianNumber(stats.completed_bookings)}
                            </span>
                        </div>
                    </div>

                    <div className="customer-stat-card red">
                        <div className="stat-icon-box">
                            <XCircle size={20} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">لغو شده</span>
                            <span className="stat-value">
                                {toPersianNumber(stats.cancelled_bookings)}
                            </span>
                        </div>
                    </div>

                    <div className="customer-stat-card purple">
                        <div className="stat-icon-box">
                            <DollarSign size={20} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">مجموع پرداختی</span>
                            <div className="stat-value">
                                <span>
                                    {toPersianNumber(
                                        stats.total_paid.toLocaleString(),
                                    )}
                                </span>
                                <span className="stat-currency">تومان</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============ گرید ============ */}
                <div className="customer-show-grid">
                    {/* ستون اصلی */}
                    <div className="customer-show-main">
                        {/* تب‌ها */}
                        <div className="customer-tabs">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        className={`customer-tab ${
                                            activeTab === tab.key
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => setActiveTab(tab.key)}
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

                        {/* محتوا */}
                        <div className="customer-tab-content">
                            {/* رزروها */}

                            {activeTab === "bookings" && (
                                <div className="customer-card">
                                    {recentBookings.length === 0 ? (
                                        <div className="empty-tab">
                                            <ShoppingBag size={32} />
                                            <span>رزروی ثبت نشده است.</span>
                                        </div>
                                    ) : (
                                        <div className="customer-bookings-list">
                                            {recentBookings.data.map(
                                                (booking) => (
                                                    <div
                                                        key={booking.id}
                                                        className="customer-booking-item"
                                                    >
                                                        <div className="booking-icon">
                                                            <ShoppingBag
                                                                size={16}
                                                            />
                                                        </div>
                                                        <div className="booking-content">
                                                            <div className="booking-header">
                                                                <span className="booking-id">
                                                                    #
                                                                    {toPersianNumber(
                                                                        booking.id,
                                                                    )}
                                                                </span>
                                                                <span
                                                                    className={`booking-status status-${booking.status}`}
                                                                >
                                                                    {getBookingStatusLabel(
                                                                        booking.status,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <span className="booking-service">
                                                                {
                                                                    booking
                                                                        .service
                                                                        ?.name
                                                                }
                                                            </span>
                                                            {booking.barber && (
                                                                <span className="booking-barber">
                                                                    آرایشگر:{" "}
                                                                    {
                                                                        booking
                                                                            .barber
                                                                            .name
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="booking-amount">
                                                            <span className="amount">
                                                                {toPersianNumber(
                                                                    booking.amount.toLocaleString(),
                                                                )}{" "}
                                                                تومان
                                                            </span>
                                                            <span className="date">
                                                                {formatFullDateTime(
                                                                    booking.created_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                            <Pagination
                                                links={recentBookings.links}
                                                only={["recentBookings"]}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* اخطارها */}
                            {activeTab === "warnings" && (
                                <div className="customer-card">
                                    {warnings.length === 0 ? (
                                        <div className="empty-tab">
                                            <AlertTriangle size={32} />
                                            <span>اخطاری ثبت نشده است.</span>
                                        </div>
                                    ) : (
                                        <div className="customer-warnings-list">
                                            {warnings.data.map((warning) => (
                                                <div
                                                    key={warning.id}
                                                    className={`warning-item ${
                                                        warning.is_active
                                                            ? "active"
                                                            : "expired"
                                                    }`}
                                                >
                                                    <div className="warning-icon">
                                                        <AlertTriangle
                                                            size={14}
                                                        />
                                                    </div>
                                                    <div className="warning-content">
                                                        <span className="warning-type">
                                                            {getUserWarningTypeLabel(
                                                                warning.type,
                                                            )}
                                                        </span>
                                                        <p className="warning-reason">
                                                            {warning.reason}
                                                        </p>
                                                        <div className="warning-meta">
                                                            {warning.issued_by && (
                                                                <span>
                                                                    توسط:{" "}
                                                                    {
                                                                        warning
                                                                            .issued_by
                                                                            .name
                                                                    }
                                                                </span>
                                                            )}
                                                            {warning.expires_at && (
                                                                <span>
                                                                    انقضا:{" "}
                                                                    {formatFullDateTime(
                                                                        warning.expires_at,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`warning-status ${warning.is_active ? "active" : "expired"}`}
                                                    >
                                                        {warning.is_active
                                                            ? "فعال"
                                                            : "منقضی"}
                                                    </span>
                                                </div>
                                            ))}
                                            <Pagination
                                                links={warnings.links}
                                                only={["warnings"]}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* اعتراضات */}
                            {activeTab === "disputes" && (
                                <div className="customer-card">
                                    {disputes.length === 0 ? (
                                        <div className="empty-tab">
                                            <Shield size={32} />
                                            <span>اعتراضی ثبت نشده است.</span>
                                        </div>
                                    ) : (
                                        <div className="customer-disputes-list">
                                            {disputes.data.map((dispute) => (
                                                <div
                                                    key={dispute.id}
                                                    className="dispute-item"
                                                >
                                                    <div className="dispute-icon">
                                                        <Shield size={14} />
                                                    </div>
                                                    <div className="dispute-content">
                                                        <span className="dispute-type">
                                                            {
                                                                dispute.dispute_type_label
                                                            }
                                                        </span>
                                                        <p className="dispute-reason">
                                                            {dispute.reason}
                                                        </p>
                                                        {dispute.barber && (
                                                            <span className="dispute-barber">
                                                                آرایشگر:{" "}
                                                                {
                                                                    dispute
                                                                        .barber
                                                                        .name
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`dispute-status status-${dispute.status}`}
                                                    >
                                                        {dispute.status_label}
                                                    </span>
                                                </div>
                                            ))}
                                            <Pagination
                                                links={disputes.links}
                                                only={["disputes"]}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* تراکنش‌ها */}
                            {activeTab === "transactions" && (
                                <div className="customer-card">
                                    {transactions.length === 0 ? (
                                        <div className="empty-tab">
                                            <Wallet size={32} />
                                            <span>تراکنشی ثبت نشده است.</span>
                                        </div>
                                    ) : (
                                        <div className="customer-transactions-list">
                                            {transactions.data.map((t) => {
                                                const isCredit =
                                                    t.direction === "credit";
                                                return (
                                                    <div
                                                        key={t.id}
                                                        className="transaction-item"
                                                    >
                                                        <div
                                                            className={`transaction-icon ${isCredit ? "credit" : "debit"}`}
                                                        >
                                                            {isCredit ? (
                                                                <TrendingUp
                                                                    size={14}
                                                                />
                                                            ) : (
                                                                <TrendingDown
                                                                    size={14}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="transaction-content">
                                                            <span className="transaction-type">
                                                                {t.type_label}
                                                            </span>
                                                            <span className="transaction-desc">
                                                                {t.description}
                                                            </span>
                                                        </div>
                                                        <div className="transaction-amount">
                                                            <span
                                                                className={`amount ${isCredit ? "credit" : "debit"}`}
                                                            >
                                                                {isCredit
                                                                    ? "+"
                                                                    : "-"}
                                                                {toPersianNumber(
                                                                    t.amount.toLocaleString(),
                                                                )}
                                                            </span>
                                                            <span className="date">
                                                                {formatFullDateTime(
                                                                    t.created_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <Pagination
                                        links={transactions.links}
                                        only={["transactions"]}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* سایدبار */}
                    <div className="customer-show-sidebar">
                        {/* کیف پول */}
                        <div className="customer-card wallet-card">
                            <div className="card-header">
                                <div className="card-icon-box green">
                                    <Wallet size={20} />
                                </div>
                                <h2 className="card-title">کیف پول</h2>
                            </div>

                            <div className="wallet-summary">
                                <div className="wallet-row">
                                    <span className="wallet-label">موجودی</span>
                                    <span className="wallet-value">
                                        {toPersianNumber(
                                            wallet.balance.toLocaleString(),
                                        )}{" "}
                                        تومان
                                    </span>
                                </div>
                                {wallet.locked_balance > 0 && (
                                    <div className="wallet-row">
                                        <span className="wallet-label">
                                            قفل‌شده
                                        </span>
                                        <span className="wallet-value warning">
                                            {toPersianNumber(
                                                wallet.locked_balance.toLocaleString(),
                                            )}{" "}
                                            تومان
                                        </span>
                                    </div>
                                )}
                                <div className="wallet-row total">
                                    <span className="wallet-label">
                                        قابل استفاده
                                    </span>
                                    <span className="wallet-value success">
                                        {toPersianNumber(
                                            wallet.available.toLocaleString(),
                                        )}{" "}
                                        تومان
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات */}
                        <div className="customer-card">
                            <div className="card-header">
                                <div className="card-icon-box blue">
                                    <User size={20} />
                                </div>
                                <h2 className="card-title">اطلاعات</h2>
                            </div>

                            <div className="info-list">
                                {customer.city && (
                                    <div className="info-row">
                                        <span className="info-label">
                                            <MapPin size={12} />
                                            شهر
                                        </span>
                                        <span className="info-value">
                                            {customer.city}
                                        </span>
                                    </div>
                                )}

                                {customer.address && (
                                    <div className="info-row">
                                        <span className="info-label">
                                            <MapPin size={12} />
                                            آدرس
                                        </span>
                                        <span className="info-value">
                                            {customer.address}
                                        </span>
                                    </div>
                                )}

                                {customer.birth_date && (
                                    <div className="info-row">
                                        <span className="info-label">
                                            <Calendar size={12} />
                                            تاریخ تولد
                                        </span>
                                        <span className="info-value">
                                            {formatFullDateWithoutTime(
                                                customer.birth_date,
                                            )}
                                        </span>
                                    </div>
                                )}

                                {customer.gender && (
                                    <div className="info-row">
                                        <span className="info-label">
                                            جنسیت
                                        </span>
                                        <span className="info-value">
                                            {customer.gender === "male"
                                                ? "مرد"
                                                : customer.gender === "female"
                                                  ? "زن"
                                                  : "سایر"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* <CustomerStatusSelector customer={customer} /> */}
                        <CustomerStatusCard customer={customer} />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
