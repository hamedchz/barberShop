import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import {
    ArrowRight,
    User,
    Phone,
    MapPin,
    Calendar,
    ShoppingBag,
    DollarSign,
    Star,
    CheckCircle,
    XCircle,
    Clock4,
    Eye,
    MessageSquare,
    TrendingUp,
    Hash,
    Award,
    Ban,
    Info,
    PhoneCall,
    Shield,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import {
    formatFullDateTime,
    formatJalaliDate,
} from "../../../utils/dateHelpers";
import RatingStars from "../../Customer/Components/RatingStars";
import Pagination from "../../Admin/Components/Pagination";
import "../Assets/css/CustomerShow.css";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";
// ============ کانفیگ وضعیت رزرو ============
const bookingStatusConfig = {
    pending: {
        label: "در انتظار",
        color: "yellow",
        icon: Clock4,
    },
    confirmed: {
        label: "تایید شده",
        color: "blue",
        icon: CheckCircle,
    },
    completed: {
        label: "تکمیل شده",
        color: "green",
        icon: CheckCircle,
    },
    cancelled: {
        label: "لغو شده",
        color: "red",
        icon: XCircle,
    },
};

export default function CustomerShow({ customer, stats, bookings, reviews }) {
    const [activeTab, setActiveTab] = useState("bookings");

    const tabs = [
        {
            key: "bookings",
            label: "رزروها",
            icon: ShoppingBag,
            count: stats.total_bookings,
        },
        {
            key: "reviews",
            label: "نظرات",
            icon: Star,
            count: stats.reviews_count,
        },
    ];

    return (
        <Layout>
            <Head title={`مشتری: ${customer.name}`} />

            <div className="barber-customer-show-page">
                {/* ============ بازگشت ============ */}
                <div className="page-header-with-back">
                    <Link
                        href={route("barber.customers.index")}
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
                            {customer.phone_verified && (
                                <span className="verified-badge">
                                    <CheckCircle size={12} />
                                    تایید شده
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
                                </a>
                            )}

                            {customer.city && (
                                <span className="contact-item">
                                    <MapPin size={14} />
                                    {customer.city}
                                </span>
                            )}
                        </div>

                        <div className="customer-profile-meta">
                            <span>
                                مشتری شما از{" "}
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

                    {/* دکمه تماس */}
                    {customer.phone && (
                        <a
                            href={`tel:${customer.phone}`}
                            className="btn-primary contact-btn"
                        >
                            <PhoneCall size={16} />
                            تماس با مشتری
                        </a>
                    )}
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
                            <span className="stat-label">مجموع درآمد</span>

                            <div className="stat-value">
                                <span>
                                    {formatCompactNumber(stats.total_earned)}
                                </span>
                                <span className="stat-currency">تومان</span>
                            </div>

                            <div className="text-sm text-gray-500 mt-1 break-words">
                                {toPersianNumber(
                                    Number(
                                        stats.total_earned || 0,
                                    ).toLocaleString("en-US"),
                                )}{" "}
                                تومان
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============ گرید اصلی ============ */}
                <div className="customer-show-grid">
                    {/* ستون اصلی */}
                    <div className="customer-show-main">
                        {/* تبها */}
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

                        {/* محتوای تب رزروها */}
                        {activeTab === "bookings" && (
                            <div className="customer-card">
                                <div className="card-header">
                                    <div className="card-icon-box blue">
                                        <ShoppingBag size={20} />
                                    </div>
                                    <h2 className="card-title">
                                        رزروهای این مشتری
                                    </h2>
                                </div>

                                {bookings.data.length === 0 ? (
                                    <div className="empty-tab">
                                        <ShoppingBag size={32} />
                                        <span>
                                            رزروی با این مشتری ثبت نشده است.
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bookings-list">
                                            {bookings.data.map((booking) => {
                                                const cfg =
                                                    bookingStatusConfig[
                                                        booking.status
                                                    ] ||
                                                    bookingStatusConfig.pending;
                                                const StatusIcon = cfg.icon;

                                                return (
                                                    <Link
                                                        key={booking.id}
                                                        href={route(
                                                            "barber.bookings.show",
                                                            booking.id,
                                                        )}
                                                        className={`booking-item status-${cfg.color}`}
                                                    >
                                                        <div
                                                            className={`booking-icon ${cfg.color}`}
                                                        >
                                                            <StatusIcon
                                                                size={16}
                                                            />
                                                        </div>

                                                        <div className="booking-content">
                                                            <div className="booking-header">
                                                                <span className="booking-id">
                                                                    <Hash
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
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
                                                                {
                                                                    booking
                                                                        .service
                                                                        ?.name
                                                                }
                                                            </span>

                                                            <div className="booking-meta">
                                                                <span>
                                                                    <Calendar
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                    {formatFullDateTime(
                                                                        booking.created_at,
                                                                    )}
                                                                </span>
                                                                {booking.service
                                                                    ?.duration && (
                                                                    <span>
                                                                        <Clock4
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                        {toPersianNumber(
                                                                            booking
                                                                                .service
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
                                                            <Eye
                                                                size={14}
                                                                className="view-icon"
                                                            />
                                                        </div>
                                                    </Link>
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
                        )}

                        {/* محتوای تب نظرات */}
                        {activeTab === "reviews" && (
                            <div className="customer-card">
                                <div className="card-header">
                                    <div className="card-icon-box yellow">
                                        <Star
                                            size={20}
                                            fill="#fbbf24"
                                            color="#fbbf24"
                                        />
                                    </div>
                                    <h2 className="card-title">
                                        نظرات این مشتری
                                    </h2>
                                    {stats.average_rating > 0 && (
                                        <span className="average-rating-badge">
                                            <Star
                                                size={12}
                                                fill="#fbbf24"
                                                color="#fbbf24"
                                            />
                                            میانگین:{" "}
                                            {toPersianNumber(
                                                stats.average_rating.toFixed(1),
                                            )}
                                        </span>
                                    )}
                                </div>

                                {reviews.data.length === 0 ? (
                                    <div className="empty-tab">
                                        <Star size={32} />
                                        <span>
                                            نظری از این مشتری ثبت نشده است.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="reviews-list">
                                        {reviews.data.map((review) => (
                                            <div
                                                key={review.id}
                                                className="review-item"
                                            >
                                                <div className="review-header">
                                                    <RatingStars
                                                        rating={review.rating}
                                                        size={16}
                                                        showNumber={false}
                                                        showTotal={false}
                                                    />
                                                    <span className="review-date">
                                                        {formatFullDateTime(
                                                            review.created_at,
                                                        )}
                                                    </span>
                                                </div>

                                                {review.comment && (
                                                    <p className="review-comment">
                                                        {review.comment}
                                                    </p>
                                                )}

                                                {review.service && (
                                                    <span className="review-service">
                                                        <Scissors size={12} />
                                                        {review.service}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Pagination
                                    links={reviews.links}
                                    only={["reviews"]}
                                />
                            </div>
                        )}
                    </div>

                    {/* سایدبار */}
                    <div className="customer-show-sidebar">
                        {/* خلاصه فعالیت */}
                        <div className="customer-card summary-card">
                            <div className="card-header">
                                <div className="card-icon-box green">
                                    <TrendingUp size={20} />
                                </div>
                                <h2 className="card-title">خلاصه فعالیت</h2>
                            </div>

                            <div className="summary-list">
                                <div className="summary-row">
                                    <span className="summary-row-label">
                                        میانگین امتیاز
                                    </span>
                                    <span className="summary-row-value rating">
                                        <Star
                                            size={14}
                                            fill="#fbbf24"
                                            color="#fbbf24"
                                        />
                                        {toPersianNumber(
                                            stats.average_rating.toFixed(1),
                                        )}
                                    </span>
                                </div>

                                <div className="summary-row">
                                    <span className="summary-row-label">
                                        تعداد نظرات
                                    </span>
                                    <span className="summary-row-value">
                                        {toPersianNumber(stats.reviews_count)}
                                    </span>
                                </div>

                                <div className="summary-divider"></div>

                                <div className="summary-row">
                                    <span className="summary-row-label">
                                        اولین رزرو
                                    </span>
                                    <span className="summary-row-value small">
                                        {stats.first_booking_at
                                            ? formatJalaliDate(
                                                  stats.first_booking_at,
                                              )
                                            : "-"}
                                    </span>
                                </div>

                                <div className="summary-row">
                                    <span className="summary-row-label">
                                        آخرین رزرو
                                    </span>
                                    <span className="summary-row-value small">
                                        {stats.last_booking_at
                                            ? formatJalaliDate(
                                                  stats.last_booking_at,
                                              )
                                            : "-"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات تماس */}
                        <div className="customer-card">
                            <div className="card-header">
                                <div className="card-icon-box blue">
                                    <User size={20} />
                                </div>
                                <h2 className="card-title">اطلاعات تماس</h2>
                            </div>

                            <div className="info-list">
                                {customer.phone && (
                                    <div className="info-row">
                                        <span className="info-label">
                                            <Phone size={12} />
                                            شماره تماس
                                        </span>
                                        <a
                                            href={`tel:${customer.phone}`}
                                            className="info-value link"
                                            dir="ltr"
                                        >
                                            {toPersianNumber(customer.phone)}
                                        </a>
                                    </div>
                                )}

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
                            </div>
                        </div>

                        {/* راهنما */}
                        <div className="customer-card info-card">
                            <div className="card-header">
                                <div className="card-icon-box gray">
                                    <Info size={20} />
                                </div>
                                <h2 className="card-title">راهنما</h2>
                            </div>

                            <ul className="info-tips">
                                <li>
                                    <CheckCircle size={14} />
                                    <span>
                                        فقط اطلاعات رزروهای این مشتری با شما
                                        نمایش داده می‌شود.
                                    </span>
                                </li>
                                <li>
                                    <Shield size={14} />
                                    <span>
                                        برای مشاهده اطلاعات بیشتر، با پشتیبانی
                                        تماس بگیرید.
                                    </span>
                                </li>
                                <li>
                                    <Ban size={14} />
                                    <span>
                                        اطلاعات حساس مشتری در دسترس شما نیست.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
