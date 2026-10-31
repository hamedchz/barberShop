import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../../Admin/Layouts/Layout";
import "./Assets/css/BarberDashboard.css";

import {
    LayoutDashboard,
    Calendar,
    Clock,
    User,
    Star,
    Wallet,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowRight,
    ChevronLeft,
    Scissors,
    DollarSign,
    Lock,
    CreditCard,
    MessageSquare,
    Phone,
    Activity,
    Users,
    Eye,
    RefreshCw,
    Plus,
    Settings,
    Sun,
    Moon,
    Coffee,
    Briefcase,
    Award,
    Zap,
    Info,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import {
    formatFullDateTime,
    formatFullDateWithoutTime,
    formatTime,
} from "../../../utils/dateHelpers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";
import BarberChart from "./Components/BarberChart";
import BarberStatModal from "./Components/BarberStatModal";
const statusConfig = {
    pending: {
        label: "در انتظار",
        icon: Clock,
        color: "#92400e",
        bg: "#fffbeb",
    },
    confirmed: {
        label: "تایید شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
    },
    completed: {
        label: "تکمیل شده",
        icon: CheckCircle,
        color: "#1e40af",
        bg: "#eff6ff",
    },
    cancelled: {
        label: "لغو شده",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
    },
};

const dayIcons = {
    0: Sun,
    1: Sun,
    2: Sun,
    3: Sun,
    4: Sun,
    5: Moon,
    6: Coffee,
};

const periods = [
    { value: 7, label: "۷ روز" },
    { value: 30, label: "۳۰ روز" },
    { value: 90, label: "۹۰ روز" },
];

export default function BarberDashboardIndex({
    auth,
    stats,
    chart,
    todayBookings,
    upcomingBookings,
    recentReviews,
    topServices,
    weeklySchedule,
    recentTransactions,
    period,
}) {
    const [chartMode, setChartMode] = useState("both");
    const [selectedStat, setSelectedStat] = useState(null);
    const setPeriod = (newPeriod) => {
        router.get(
            "/barber/dashboard",
            { period: newPeriod },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const userName = auth?.user?.name ?? "آرایشگر";
    const firstName = userName.split(" ")[0];

    return (
        <Layout>
            <Head title="داشبورد آرایشگر" />

            <div className="barber-dashboard">
                {/* ============ هدر خوش‌آمد ============ */}
                <div className="barber-hero">
                    <div className="barber-hero-content">
                        <div className="barber-hero-greeting">
                            <span className="greeting-time">
                                {new Date().getHours() < 12
                                    ? "صبح بخیر"
                                    : new Date().getHours() < 17
                                      ? "وقت بخیر"
                                      : "عصر بخیر"}
                                ،
                            </span>
                            <h1 className="greeting-name">{firstName} </h1>
                        </div>
                        <p className="barber-hero-subtitle">
                            امروز {toPersianNumber(stats.bookings.today)} رزرو
                            داری و درآمد این دوره{" "}
                            <strong>
                                {formatCompactNumber(stats.earnings.value)}{" "}
                                تومان
                            </strong>{" "}
                            بوده است.
                        </p>
                    </div>

                    <div className="barber-hero-actions">
                        <div className="barber-period-filter">
                            {periods.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    className={`barber-period-btn ${period === p.value ? "active" : ""}`}
                                    onClick={() => setPeriod(p.value)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <Link
                            href="/barber/bookings"
                            className="barber-hero-btn"
                        >
                            <Calendar size={16} />
                            رزروها
                        </Link>
                    </div>
                </div>
                <div className="finance-stats-hint">
                    <Info size={14} />
                    <span>
                        برای مشاهده مبلغ دقیق و جزئیات، روی هر کارت کلیک کنید
                    </span>
                </div>
                {/* ============ کارت‌های آماری ============ */}
                <div className="barber-stats-grid">
                    {/* درآمد */}
                    <div
                        className="barber-stat-card revenue"
                        onClick={() =>
                            setSelectedStat({
                                title: "درآمد این دوره",
                                icon: DollarSign,
                                color: "#065f46",
                                bg: "#ecfdf5",
                                amount: stats.earnings.value,
                                unit: "تومان",
                                description: `درآمد خالص شما در ${period} روز گذشته`,
                                change: stats.earnings.change,
                                breakdown: [
                                    {
                                        label: "رزروهای تکمیل‌شده",
                                        value: stats.bookings.completed,
                                        isCount: true,
                                        hint: "تعداد رزروهای انجام‌شده",
                                    },
                                    {
                                        label: "میانگین درآمد هر رزرو",
                                        value:
                                            stats.bookings.completed > 0
                                                ? stats.earnings.value /
                                                  stats.bookings.completed
                                                : 0,
                                    },
                                ],
                                actionLink: {
                                    label: "مشاهده کیف پول",
                                    href: "/barber/finance/wallet",
                                },
                            })
                        }
                        style={{ cursor: "pointer" }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                            }
                        }}
                    >
                        <div className="barber-stat-icon revenue">
                            <DollarSign size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">
                                درآمد این دوره
                            </span>
                            <div className="barber-stat-value">
                                {formatCompactNumber(stats.earnings.value)}
                                <span className="barber-stat-unit">تومان</span>
                            </div>
                            <div className="barber-stat-footer">
                                {stats.earnings.change !== undefined && (
                                    <span
                                        className={`barber-stat-change ${stats.earnings.change >= 0 ? "positive" : "negative"}`}
                                    >
                                        {stats.earnings.change >= 0 ? (
                                            <TrendingUp size={11} />
                                        ) : (
                                            <TrendingDown size={11} />
                                        )}
                                        {toPersianNumber(
                                            Math.abs(stats.earnings.change),
                                        )}
                                        ٪
                                    </span>
                                )}
                                <span className="barber-stat-subtitle">
                                    نسبت به دوره قبل
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* رزروها */}
                    <div className="barber-stat-card bookings">
                        <div className="barber-stat-icon bookings">
                            <Calendar size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">رزروها</span>
                            <div className="barber-stat-value">
                                {toPersianNumber(stats.bookings.value)}
                                <span className="barber-stat-unit">مورد</span>
                            </div>
                            <div className="barber-stat-footer">
                                <span className="barber-stat-subtitle">
                                    {toPersianNumber(stats.bookings.completed)}{" "}
                                    تکمیل شده •{" "}
                                    {toPersianNumber(stats.bookings.pending)} در
                                    انتظار
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* کیف پول */}
                    <div
                        className="barber-stat-card wallet"
                        onClick={() =>
                            setSelectedStat({
                                title: "کیف پول",
                                icon: Wallet,
                                color: "#5b21b6",
                                bg: "#f5f3ff",
                                amount: stats.wallet.available,
                                unit: "تومان",
                                description: "موجودی قابل برداشت شما",
                                breakdown: [
                                    {
                                        label: "موجودی کل",
                                        value:
                                            stats.wallet.available +
                                            stats.wallet.locked,
                                        hint: "شامل مبالغ قفل‌شده",
                                    },
                                    {
                                        label: "مبالغ قفل‌شده",
                                        value: stats.wallet.locked,
                                        hint: "در انتظار آزادسازی",
                                    },
                                    {
                                        label: "قابل برداشت",
                                        value: stats.wallet.available,
                                        hint: "آماده تسویه",
                                    },
                                ],
                                actionLink: {
                                    label: "مشاهده تراکنش‌ها",
                                    href: "/barber/finance/wallet",
                                },
                            })
                        }
                        style={{ cursor: "pointer" }}
                    >
                        <div className="barber-stat-icon wallet">
                            <Wallet size={24} />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">
                                موجودی کیف پول
                            </span>
                            <div className="barber-stat-value">
                                {formatCompactNumber(stats.wallet.available)}
                                <span className="barber-stat-unit">تومان</span>
                            </div>
                            <div className="barber-stat-footer">
                                {stats.wallet.locked > 0 && (
                                    <span className="barber-stat-subtitle">
                                        <Lock
                                            size={10}
                                            style={{
                                                display: "inline",
                                                marginLeft: "0.25rem",
                                            }}
                                        />
                                        {formatCompactNumber(
                                            stats.wallet.locked,
                                        )}{" "}
                                        قفل‌شده
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* امتیاز */}
                    <div className="barber-stat-card rating">
                        <div className="barber-stat-icon rating">
                            <Star size={24} fill="#fbbf24" color="#fbbf24" />
                        </div>
                        <div className="barber-stat-content">
                            <span className="barber-stat-label">
                                امتیاز شما
                            </span>
                            <div className="barber-stat-value">
                                {toPersianNumber(stats.reviews.avg_rating)}
                                <span className="barber-stat-unit">از ۵</span>
                            </div>
                            <div className="barber-stat-footer">
                                <span className="barber-stat-subtitle">
                                    {toPersianNumber(stats.reviews.total)} نظر
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============ رزروهای امروز ============ */}
                <div className="barber-card barber-today-card">
                    <div className="barber-card-header">
                        <div className="barber-card-header-icon green">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h2>رزروهای امروز</h2>
                            <p>
                                {toPersianNumber(todayBookings.length)} رزرو
                                برای امروز
                            </p>
                        </div>
                        <Link
                            href="/barber/bookings?status=today"
                            className="barber-card-link"
                        >
                            مشاهده همه
                            <ChevronLeft size={14} />
                        </Link>
                    </div>

                    {todayBookings.length === 0 ? (
                        <div className="barber-empty-state">
                            <Calendar size={40} />
                            <p>امروز رزروی نداری</p>
                            {/* <span>وقت استراحت! ☕</span> */}
                        </div>
                    ) : (
                        <div className="barber-today-list">
                            {todayBookings.map((booking) => {
                                const config =
                                    statusConfig[booking.status] ??
                                    statusConfig.pending;
                                const StatusIcon = config.icon;

                                return (
                                    <Link
                                        key={booking.id}
                                        href={`/barber/bookings/${booking.id}`}
                                        className="barber-today-item"
                                    >
                                        <div className="barber-today-time">
                                            <span className="time-start">
                                                {toPersianNumber(
                                                    booking.time?.start?.substring(
                                                        0,
                                                        5,
                                                    ),
                                                )}
                                            </span>
                                            <span className="time-separator">
                                                —
                                            </span>
                                            <span className="time-end">
                                                {toPersianNumber(
                                                    booking.time?.end?.substring(
                                                        0,
                                                        5,
                                                    ),
                                                )}
                                            </span>
                                        </div>

                                        <div className="barber-today-avatar">
                                            {booking.customer?.avatar ? (
                                                <img
                                                    src={
                                                        booking.customer.avatar
                                                    }
                                                    alt={booking.customer.name}
                                                />
                                            ) : (
                                                booking.customer?.name
                                                    ?.charAt(0)
                                                    .toUpperCase() || "؟"
                                            )}
                                        </div>

                                        <div className="barber-today-info">
                                            <span className="barber-today-name">
                                                {booking.customer?.name ?? "—"}
                                            </span>
                                            <span className="barber-today-service">
                                                <Scissors size={11} />
                                                {booking.service?.name}
                                            </span>
                                        </div>

                                        <div className="barber-today-meta">
                                            <span
                                                className="barber-today-status"
                                                style={{
                                                    color: config.color,
                                                    background: config.bg,
                                                }}
                                            >
                                                <StatusIcon size={10} />
                                                {config.label}
                                            </span>
                                            <span className="barber-today-amount">
                                                {formatCompactNumber(
                                                    booking.amount,
                                                )}{" "}
                                                تومان
                                            </span>
                                        </div>

                                        <ChevronLeft
                                            size={16}
                                            className="barber-today-arrow"
                                        />
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ============ گرید اصلی ============ */}
                <div className="barber-main-grid">
                    {/* ============ نمودار ============ */}
                    <div className="barber-card barber-chart-card">
                        <div className="barber-card-header">
                            <div className="barber-card-header-icon purple">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h2>روند کاری</h2>
                                <p>{toPersianNumber(period)} روز گذشته</p>
                            </div>

                            <div className="barber-chart-tabs">
                                <button
                                    type="button"
                                    className={`barber-chart-tab ${chartMode === "both" ? "active" : ""}`}
                                    onClick={() => setChartMode("both")}
                                >
                                    هر دو
                                </button>
                                <button
                                    type="button"
                                    className={`barber-chart-tab ${chartMode === "earnings" ? "active" : ""}`}
                                    onClick={() => setChartMode("earnings")}
                                >
                                    درآمد
                                </button>
                                <button
                                    type="button"
                                    className={`barber-chart-tab ${chartMode === "bookings" ? "active" : ""}`}
                                    onClick={() => setChartMode("bookings")}
                                >
                                    رزرو
                                </button>
                            </div>
                        </div>

                        <BarberChart
                            labels={chart.labels}
                            earnings={chart.earnings}
                            bookings={chart.bookings}
                            mode={chartMode}
                        />
                    </div>

                    {/* ============ برنامه هفتگی ============ */}
                    <div className="barber-card barber-schedule-card">
                        <div className="barber-card-header">
                            <div className="barber-card-header-icon blue">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h2>برنامه هفتگی</h2>
                                <p>ساعات کاری شما</p>
                            </div>
                            <Link
                                href="/barber/availabilities"
                                className="barber-card-link"
                            >
                                ویرایش
                                <ChevronLeft size={14} />
                            </Link>
                        </div>

                        <div className="barber-schedule-list">
                            {weeklySchedule.map((day) => {
                                const DayIcon = dayIcons[day.day] ?? Sun;

                                return (
                                    <div
                                        key={day.day}
                                        className={`barber-schedule-item ${day.is_active ? "active" : "inactive"}`}
                                    >
                                        <div
                                            className={`barber-schedule-day-icon ${day.is_active ? "active" : "inactive"}`}
                                        >
                                            <DayIcon size={16} />
                                        </div>
                                        <span className="barber-schedule-day-name">
                                            {day.day_name}
                                        </span>
                                        <div className="barber-schedule-shifts">
                                            {day.is_active ? (
                                                day.shifts.map((shift, i) => (
                                                    <span
                                                        key={i}
                                                        className="barber-schedule-shift"
                                                    >
                                                        {toPersianNumber(
                                                            shift.start.substring(
                                                                0,
                                                                5,
                                                            ),
                                                        )}
                                                        {" - "}
                                                        {toPersianNumber(
                                                            shift.end.substring(
                                                                0,
                                                                5,
                                                            ),
                                                        )}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="barber-schedule-off">
                                                    تعطیل
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ============ نظرات اخیر ============ */}
                    <div className="barber-card barber-reviews-card">
                        <div className="barber-card-header">
                            <div className="barber-card-header-icon yellow">
                                <Star
                                    size={20}
                                    fill="#fbbf24"
                                    color="#fbbf24"
                                />
                            </div>
                            <div>
                                <h2>نظرات اخیر</h2>
                                <p>
                                    {toPersianNumber(stats.reviews.this_period)}{" "}
                                    نظر جدید
                                </p>
                            </div>
                            <Link
                                href="/barber/reviews"
                                className="barber-card-link"
                            >
                                همه
                                <ChevronLeft size={14} />
                            </Link>
                        </div>

                        {recentReviews.length === 0 ? (
                            <div className="barber-empty-state small">
                                <MessageSquare size={32} />
                                <p>هنوز نظری نداری</p>
                            </div>
                        ) : (
                            <div className="barber-reviews-list">
                                {recentReviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="barber-review-item"
                                    >
                                        <div className="barber-review-header">
                                            <div className="barber-review-avatar">
                                                {review.customer?.avatar ? (
                                                    <img
                                                        src={
                                                            review.customer
                                                                .avatar
                                                        }
                                                        alt={
                                                            review.customer.name
                                                        }
                                                    />
                                                ) : (
                                                    review.customer?.name
                                                        ?.charAt(0)
                                                        .toUpperCase() || "؟"
                                                )}
                                            </div>
                                            <div className="barber-review-info">
                                                <span className="barber-review-name">
                                                    {review.customer?.name ??
                                                        "—"}
                                                </span>
                                                <div className="barber-review-stars">
                                                    {[1, 2, 3, 4, 5].map(
                                                        (i) => (
                                                            <Star
                                                                key={i}
                                                                size={11}
                                                                fill={
                                                                    i <=
                                                                    review.rating
                                                                        ? "#fbbf24"
                                                                        : "#e5e7eb"
                                                                }
                                                                color={
                                                                    i <=
                                                                    review.rating
                                                                        ? "#fbbf24"
                                                                        : "#e5e7eb"
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                            <span className="barber-review-date">
                                                {formatFullDateWithoutTime(
                                                    review.created_at,
                                                )}
                                            </span>
                                        </div>
                                        {review.comment && (
                                            <p className="barber-review-comment">
                                                "{review.comment}"
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ============ خدمات برتر ============ */}
                    <div className="barber-card barber-services-card">
                        <div className="barber-card-header">
                            <div className="barber-card-header-icon purple">
                                <Scissors size={20} />
                            </div>
                            <div>
                                <h2>خدمات برتر</h2>
                                <p>پرطرفدارترین خدمات شما</p>
                            </div>
                        </div>

                        {topServices.length === 0 ? (
                            <div className="barber-empty-state small">
                                <Scissors size={32} />
                                <p>هنوز سرویسی ثبت نکردی</p>
                            </div>
                        ) : (
                            <div className="barber-services-list">
                                {topServices.map((service, index) => (
                                    <div
                                        key={service.service_id}
                                        className="barber-service-item"
                                    >
                                        <div
                                            className={`barber-service-rank rank-${index + 1}`}
                                        >
                                            {index === 0
                                                ? "🥇"
                                                : index === 1
                                                  ? "🥈"
                                                  : index === 2
                                                    ? "🥉"
                                                    : toPersianNumber(
                                                          index + 1,
                                                      )}
                                        </div>
                                        <div className="barber-service-info">
                                            <span className="barber-service-name">
                                                {service.name}
                                            </span>
                                            <span className="barber-service-count">
                                                {toPersianNumber(service.count)}{" "}
                                                رزرو
                                            </span>
                                        </div>
                                        <span className="barber-service-price">
                                            {formatCompactNumber(service.price)}
                                            <span className="currency">
                                                تومان
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ============ رزروهای آینده ============ */}
                {upcomingBookings.length > 0 && (
                    <div className="barber-card">
                        <div className="barber-card-header">
                            <div className="barber-card-header-icon blue">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h2>رزروهای آینده</h2>
                                <p>برنامه‌های پیش رو</p>
                            </div>
                        </div>

                        <div className="barber-upcoming-list">
                            {upcomingBookings.map((booking) => {
                                const config =
                                    statusConfig[booking.status] ??
                                    statusConfig.pending;
                                const StatusIcon = config.icon;

                                return (
                                    <Link
                                        key={booking.id}
                                        href={`/barber/bookings/${booking.id}`}
                                        className="barber-upcoming-item"
                                    >
                                        <div className="barber-upcoming-date">
                                            <Calendar size={14} />
                                            <span>
                                                {formatFullDateWithoutTime(
                                                    booking.date,
                                                )}
                                            </span>
                                        </div>
                                        <div className="barber-upcoming-time">
                                            <Clock size={14} />
                                            <span>
                                                {toPersianNumber(
                                                    booking.time?.start?.substring(
                                                        0,
                                                        5,
                                                    ),
                                                )}
                                                {" - "}
                                                {toPersianNumber(
                                                    booking.time?.end?.substring(
                                                        0,
                                                        5,
                                                    ),
                                                )}
                                            </span>
                                        </div>
                                        <div className="barber-upcoming-customer">
                                            {booking.customer?.avatar ? (
                                                <img
                                                    src={
                                                        booking.customer.avatar
                                                    }
                                                    alt={booking.customer.name}
                                                />
                                            ) : (
                                                booking.customer?.name
                                                    ?.charAt(0)
                                                    .toUpperCase() || "؟"
                                            )}
                                            <span>
                                                {booking.customer?.name ?? "—"}
                                            </span>
                                        </div>
                                        <div className="barber-upcoming-service">
                                            {booking.service}
                                        </div>
                                        <span
                                            className="barber-upcoming-status"
                                            style={{
                                                color: config.color,
                                                background: config.bg,
                                            }}
                                        >
                                            <StatusIcon size={10} />
                                            {config.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ============ تراکنش‌های اخیر ============ */}
                <div className="barber-card">
                    <div className="barber-card-header">
                        <div className="barber-card-header-icon green">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <h2>تراکنش‌های اخیر</h2>
                            <p>آخرین گردش‌های مالی</p>
                        </div>
                        <Link
                            href="/barber/finance/wallet"
                            className="barber-card-link"
                        >
                            کیف پول
                            <ChevronLeft size={14} />
                        </Link>
                    </div>

                    {recentTransactions.length === 0 ? (
                        <div className="barber-empty-state small">
                            <Wallet size={32} />
                            <p>هنوز تراکنشی نداری</p>
                        </div>
                    ) : (
                        <div className="barber-transactions-list">
                            {recentTransactions.map((tx) => {
                                const isCredit = tx.direction === "credit";
                                const typeLabels = {
                                    earning: "درآمد",
                                    commission: "کمیسیون",
                                    settlement: "تسویه",
                                };

                                return (
                                    <div
                                        key={tx.id}
                                        className="barber-transaction-item"
                                    >
                                        <div
                                            className={`barber-transaction-icon ${isCredit ? "credit" : "debit"}`}
                                        >
                                            {isCredit ? (
                                                <TrendingUp size={16} />
                                            ) : (
                                                <TrendingDown size={16} />
                                            )}
                                        </div>
                                        <div className="barber-transaction-info">
                                            <span className="barber-transaction-type">
                                                {typeLabels[tx.type] ?? tx.type}
                                            </span>
                                            <span className="barber-transaction-desc">
                                                {tx.description}
                                            </span>
                                        </div>
                                        <div className="barber-transaction-amount">
                                            <span
                                                className={`amount ${isCredit ? "credit" : "debit"}`}
                                            >
                                                {isCredit ? "+" : "-"}
                                                {formatCompactNumber(tx.amount)}
                                            </span>
                                            <span className="amount-date">
                                                {formatFullDateWithoutTime(
                                                    tx.created_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ============ لینک‌های سریع ============ */}
                <div className="barber-quick-links">
                    <Link href="/barber/bookings" className="barber-quick-link">
                        <Calendar size={20} />
                        <span>رزروها</span>
                    </Link>
                    <Link
                        href="/barber/availabilities"
                        className="barber-quick-link"
                    >
                        <Clock size={20} />
                        <span>برنامه کاری</span>
                    </Link>
                    <Link href="/barber/services" className="barber-quick-link">
                        <Scissors size={20} />
                        <span>خدمات</span>
                    </Link>
                    <Link href="/barber/reviews" className="barber-quick-link">
                        <Star size={20} />
                        <span>نظرات</span>
                    </Link>
                    <Link href="/barber/wallet" className="barber-quick-link">
                        <Wallet size={20} />
                        <span>کیف پول</span>
                    </Link>
                    <Link
                        href="/barber/settlements"
                        className="barber-quick-link"
                    >
                        <CreditCard size={20} />
                        <span>تسویه</span>
                    </Link>
                </div>
            </div>

            {/* ============ Modal آمار ============ */}
            <BarberStatModal
                isOpen={!!selectedStat}
                onClose={() => setSelectedStat(null)}
                config={selectedStat}
            />
        </Layout>
    );
}
