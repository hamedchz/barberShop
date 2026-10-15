import React from "react";
import { Head, Link } from "@inertiajs/react";
import Layout from "../../Layouts/Layout";
import {
    ArrowRight,
    User,
    Phone,
    ShoppingBag,
    Calendar,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock4,
    Hash,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../utils/dateHelpers";
import Pagination from "../../../Components/Pagination";
import "../../Assets/Barber/Customers.css";

const statusConfig = {
    pending: { label: "در انتظار", color: "yellow", icon: Clock4 },
    confirmed: { label: "تایید شده", color: "blue", icon: CheckCircle },
    completed: { label: "تکمیل شده", color: "green", icon: CheckCircle },
    cancelled: { label: "لغو شده", color: "red", icon: XCircle },
};

export default function BarberCustomerShow({ customer, stats, bookings }) {
    return (
        <Layout>
            <Head title={`مشتری: ${customer.name}`} />

            <div className="barber-customer-show-page">
                {/* بازگشت */}
                <div className="page-header-with-back">
                    <Link
                        href={route("barber.customers.index")}
                        className="back-btn"
                    >
                        <ArrowRight size={20} />
                        <span>بازگشت به لیست مشتریان</span>
                    </Link>
                </div>

                {/* پروفایل */}
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
                        <h1>{customer.name}</h1>

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

                        <div className="customer-profile-meta">
                            <span>
                                مشتری از{" "}
                                {formatFullDateTime(customer.created_at)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* آمار */}
                <div className="customer-stats-grid">
                    <div className="customer-stat-card blue">
                        <div className="stat-icon-box">
                            <ShoppingBag size={20} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">کل رزروها با شما</span>
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
                            <span className="stat-label">مجموع درآمد</span>
                            <div className="stat-value">
                                <span>
                                    {toPersianNumber(
                                        stats.total_earned.toLocaleString(),
                                    )}
                                </span>
                                <span className="stat-currency">تومان</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* لیست رزروها */}
                <div className="customer-card">
                    <div className="card-header">
                        <div className="card-icon-box blue">
                            <ShoppingBag size={20} />
                        </div>
                        <h2 className="card-title">رزروهای این مشتری</h2>
                    </div>

                    {bookings.data.length === 0 ? (
                        <div className="empty-tab">
                            <ShoppingBag size={32} />
                            <span>رزروی با این مشتری ثبت نشده است.</span>
                        </div>
                    ) : (
                        <>
                            <div className="bookings-list">
                                {bookings.data.map((booking) => {
                                    const cfg =
                                        statusConfig[booking.status] ||
                                        statusConfig.pending;
                                    const Icon = cfg.icon;

                                    return (
                                        <div
                                            key={booking.id}
                                            className={`booking-item status-${cfg.color}`}
                                        >
                                            <div
                                                className={`booking-icon ${cfg.color}`}
                                            >
                                                <Icon size={16} />
                                            </div>

                                            <div className="booking-content">
                                                <div className="booking-header">
                                                    <span className="booking-id">
                                                        <Hash size={12} />
                                                        {toPersianNumber(
                                                            booking.id,
                                                        )}
                                                    </span>
                                                    <span
                                                        className={`booking-status ${cfg.color}`}
                                                    >
                                                        {cfg.label}
                                                    </span>
                                                </div>

                                                <span className="booking-service">
                                                    {booking.service?.name}
                                                </span>

                                                <div className="booking-meta">
                                                    <span>
                                                        <Calendar size={12} />
                                                        {formatFullDateTime(
                                                            booking.created_at,
                                                        )}
                                                    </span>
                                                    {booking.service
                                                        ?.duration && (
                                                        <span>
                                                            <Clock4 size={12} />
                                                            {toPersianNumber(
                                                                booking.service
                                                                    .duration,
                                                            )}{" "}
                                                            دقیقه
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="booking-amount">
                                                <span className="amount">
                                                    {toPersianNumber(
                                                        booking.amount.toLocaleString(),
                                                    )}{" "}
                                                    تومان
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Pagination
                                links={bookings.links}
                                only={["bookings"]}
                            />
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
