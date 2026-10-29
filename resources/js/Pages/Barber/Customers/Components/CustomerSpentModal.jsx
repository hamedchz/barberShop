import React, { useState } from "react";
import {
    X,
    Copy,
    Check,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Info,
    ArrowRight,
    Calendar,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
} from "lucide-react";
import { Link } from "@inertiajs/react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatFullDateWithoutTime } from "../../../../utils/dateHelpers";
import { formatCompactNumber } from "../../../../Constants/formatCompactNumber";
import "../Assets/css/CustomerSpentModal.css";
const formatFullAmount = (amount) =>
    toPersianNumber(Number(amount || 0).toLocaleString("en-US"));

const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {}
    }
    try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
    } catch (e) {
        return false;
    }
};

const paymentStatusConfig = {
    success: {
        label: "موفق",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
    },
    pending: {
        label: "در انتظار",
        icon: Clock,
        color: "#92400e",
        bg: "#fffbeb",
    },
    failed: { label: "ناموفق", icon: XCircle, color: "#991b1b", bg: "#fef2f2" },
    refunded: {
        label: "برگشت داده شده",
        icon: TrendingDown,
        color: "#5b21b6",
        bg: "#f5f3ff",
    },
};

export default function CustomerSpentModal({
    isOpen,
    onClose,
    customer,
    stats,
    bookings,
}) {
    const [copied, setCopied] = useState(null);

    if (!isOpen) return null;

    // ============ محاسبات ============
    const completedBookings =
        bookings?.filter((b) => b.status === "completed") || [];
    const avgPerBooking =
        completedBookings.length > 0
            ? stats.total_spent / completedBookings.length
            : 0;
    const avgPerMonth =
        stats.total_bookings > 0
            ? stats.total_spent /
              Math.max(1, Math.ceil(stats.total_bookings / 4))
            : 0;

    // ============ تفکیک بر اساس نوع پرداخت ============
    const paymentBreakdown = completedBookings.reduce((acc, b) => {
        if (b.payment) {
            const key = b.payment.gateway || "unknown";
            if (!acc[key]) acc[key] = { count: 0, total: 0 };
            acc[key].count += 1;
            acc[key].total += b.payment.amount || 0;
        }
        return acc;
    }, {});

    const handleCopy = async (key, value) => {
        const ok = await copyToClipboard(Number(value || 0).toString());
        if (ok) {
            setCopied(key);
            setTimeout(() => setCopied(null), 1500);
        }
    };

    return (
        <div className="customer-spent-modal-overlay" onClick={onClose}>
            <div
                className="customer-spent-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ============ هدر ============ */}
                <div className="customer-spent-modal-header">
                    <div className="customer-spent-modal-icon">
                        <DollarSign size={24} />
                    </div>
                    <div className="customer-spent-modal-header-content">
                        <h3>مجموع خرید</h3>
                        <p>جزئیات خرید مشتری با شما</p>
                    </div>
                    <button
                        type="button"
                        className="customer-spent-modal-close"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ============ مبلغ دقیق ============ */}
                <div className="customer-spent-modal-amount-box">
                    <span className="customer-spent-modal-amount-label">
                        مجموع کل خرید
                    </span>
                    <div className="customer-spent-modal-amount-value">
                        <span>{formatFullAmount(stats.total_spent)}</span>
                        <span className="customer-spent-modal-unit">تومان</span>
                        <button
                            type="button"
                            className={`customer-spent-modal-copy ${copied === "main" ? "copied" : ""}`}
                            onClick={() =>
                                handleCopy("main", stats.total_spent)
                            }
                            title="کپی"
                        >
                            {copied === "main" ? (
                                <Check size={14} style={{ color: "#10b981" }} />
                            ) : (
                                <Copy size={14} />
                            )}
                        </button>
                    </div>
                    <p className="customer-spent-modal-note">
                        <Info size={12} />
                        این مبلغ شامل رزروهای تکمیل‌شده است (لغو‌شده‌ها محاسبه
                        نمی‌شوند).
                    </p>
                </div>

                {/* ============ آمار تفصیلی ============ */}
                <div className="customer-spent-modal-section">
                    <h4 className="customer-spent-modal-section-title">
                        آمار خرید
                    </h4>
                    <div className="customer-spent-modal-stats-grid">
                        <div className="customer-spent-modal-stat">
                            <Calendar size={18} />
                            <div>
                                <span className="stat-label">تعداد خرید</span>
                                <span className="stat-value">
                                    {toPersianNumber(completedBookings.length)}{" "}
                                    رزرو
                                </span>
                            </div>
                        </div>
                        <div className="customer-spent-modal-stat">
                            <TrendingUp size={18} />
                            <div>
                                <span className="stat-label">
                                    میانگین هر خرید
                                </span>
                                <span className="stat-value">
                                    {formatCompactNumber(avgPerBooking)} تومان
                                </span>
                            </div>
                        </div>
                        <div className="customer-spent-modal-stat">
                            <DollarSign size={18} />
                            <div>
                                <span className="stat-label">
                                    میانگین ماهانه
                                </span>
                                <span className="stat-value">
                                    {formatCompactNumber(avgPerMonth)} تومان
                                </span>
                            </div>
                        </div>
                        <div className="customer-spent-modal-stat">
                            <CheckCircle size={18} />
                            <div>
                                <span className="stat-label">
                                    تعداد کل رزرو
                                </span>
                                <span className="stat-value">
                                    {toPersianNumber(stats.total_bookings)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============ تفکیک بر اساس درگاه ============ */}
                {Object.keys(paymentBreakdown).length > 0 && (
                    <div className="customer-spent-modal-section">
                        <h4 className="customer-spent-modal-section-title">
                            تفکیک بر اساس درگاه پرداخت
                        </h4>
                        <div className="customer-spent-modal-breakdown-list">
                            {Object.entries(paymentBreakdown).map(
                                ([gateway, data]) => {
                                    const percent =
                                        stats.total_spent > 0
                                            ? (data.total / stats.total_spent) *
                                              100
                                            : 0;

                                    return (
                                        <div
                                            key={gateway}
                                            className="customer-spent-modal-breakdown-row"
                                        >
                                            <div className="customer-spent-modal-breakdown-info">
                                                <span className="customer-spent-modal-breakdown-label">
                                                    {gateway}
                                                </span>
                                                <span className="customer-spent-modal-breakdown-count">
                                                    {toPersianNumber(
                                                        data.count,
                                                    )}{" "}
                                                    خرید
                                                </span>
                                            </div>
                                            <div className="customer-spent-modal-breakdown-value">
                                                <span>
                                                    {formatFullAmount(
                                                        data.total,
                                                    )}
                                                </span>
                                                <span className="customer-spent-modal-unit">
                                                    تومان
                                                </span>
                                                <span className="breakdown-percent">
                                                    {toPersianNumber(
                                                        percent.toFixed(1),
                                                    )}
                                                    ٪
                                                </span>
                                            </div>
                                            <div className="customer-spent-modal-progress">
                                                <div
                                                    className="customer-spent-modal-progress-bar"
                                                    style={{
                                                        width: `${Math.min(percent, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
