import React, { useState, useRef, useEffect } from "react";
import {
    X,
    Copy,
    Check,
    Coins,
    Percent,
    AlertTriangle,
    TrendingUp,
    Calendar,
    User,
    ExternalLink,
    Clock,
} from "lucide-react";
import { Link } from "@inertiajs/react";
import { toPersianNumber } from "../../../../../utils/persianNumbers";
import { formatFullDateWithoutTime } from "../../../../../utils/dateHelpers";
import "../Assets/css/RevenueDetailModal.css";
const formatFullAmount = (amount) =>
    toPersianNumber(Number(amount || 0).toLocaleString("en-US"));

const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return toPersianNumber(
        `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
            d.getDate(),
        ).padStart(2, "0")}`,
    );
};

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

// ============ تنظیمات هر کارت ============
const cardConfigs = {
    total: {
        title: "درآمد کل این دوره",
        icon: Coins,
        color: "#5b21b6",
        bg: "#f5f3ff",
        border: "#ddd6fe",
        unit: "تومان",
        description: "مجموع کمیسیون و جریمه‌ها در دوره انتخابی",
    },
    commission: {
        title: "کمیسیون",
        icon: Percent,
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#bfdbfe",
        unit: "تومان",
        description: "درآمد پلتفرم از کمیسیون تراکنش‌ها",
    },
    penalty: {
        title: "جریمه‌ها",
        icon: AlertTriangle,
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fecaca",
        unit: "تومان",
        description: "درآمد پلتفرم از جریمه‌های اعمال‌شده",
    },
    average: {
        title: "میانگین درآمد روزانه",
        icon: TrendingUp,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#a7f3d0",
        unit: "تومان",
        description: "میانگین درآمد روزانه در دوره انتخابی",
    },
};

export default function RevenueDetailModal({
    isOpen,
    onClose,
    cardKey, // "total" | "commission" | "penalty" | "average"
    amount, // مبلغ اصلی
    stats = {}, // stats از بک‌اند
    revenueByType = [],
    dailyRevenue = [],
    revenueByUser = [],
    period = "30",
}) {
    const [copied, setCopied] = useState(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) setCopied(null);
    }, [isOpen]);

    if (!isOpen || !cardKey) return null;

    const config = cardConfigs[cardKey] ?? cardConfigs.total;
    const Icon = config.icon;

    const handleCopy = async (key, value) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        const ok = await copyToClipboard(Number(value || 0).toString());
        if (ok) {
            setCopied(key);
            timeoutRef.current = setTimeout(() => setCopied(null), 1500);
        }
    };

    // ============ آمار تفصیلی بر اساس نوع کارت ============
    const getStats = () => {
        if (cardKey === "total") {
            const commission = revenueByType.find(
                (r) => r.type === "commission",
            );
            const penalty = revenueByType.find((r) => r.type === "penalty");

            return [
                {
                    label: "از کمیسیون",
                    value: commission?.total ?? 0,
                    count: commission?.count ?? 0,
                    color: "#1e40af",
                },
                {
                    label: "از جریمه‌ها",
                    value: penalty?.total ?? 0,
                    count: penalty?.count ?? 0,
                    color: "#991b1b",
                },
            ];
        }

        if (cardKey === "commission") {
            const commission = revenueByType.find(
                (r) => r.type === "commission",
            );
            return [
                {
                    label: "تعداد تراکنش",
                    value: commission?.count ?? 0,
                    isCount: true,
                    color: "#1e40af",
                },
            ];
        }

        if (cardKey === "penalty") {
            const penalty = revenueByType.find((r) => r.type === "penalty");
            return [
                {
                    label: "تعداد تراکنش",
                    value: penalty?.count ?? 0,
                    isCount: true,
                    color: "#991b1b",
                },
            ];
        }

        if (cardKey === "average") {
            return [
                {
                    label: "تعداد روزهای دوره",
                    value: dailyRevenue.length,
                    isCount: true,
                    color: "#065f46",
                },
                {
                    label: "بیشترین درآمد روزانه",
                    value: Math.max(
                        ...dailyRevenue.map((d) => Number(d.total ?? 0)),
                        0,
                    ),
                    color: "#5b21b6",
                },
                {
                    label: "کمترین درآمد روزانه",
                    value: Math.min(
                        ...dailyRevenue
                            .filter((d) => Number(d.total) > 0)
                            .map((d) => Number(d.total)),
                        0,
                    ),
                    color: "#9a3412",
                },
            ];
        }

        return [];
    };

    // ============ Breakdown ============
    const getBreakdown = () => {
        if (cardKey === "total") {
            return revenueByType.map((r) => ({
                label: r.type_label,
                value: r.total,
                count: r.count,
            }));
        }

        if (cardKey === "commission") {
            return revenueByType
                .filter((r) => r.type === "commission")
                .map((r) => ({
                    label: r.type_label,
                    value: r.total,
                    count: r.count,
                }));
        }

        if (cardKey === "penalty") {
            return revenueByType
                .filter((r) => r.type === "penalty")
                .map((r) => ({
                    label: r.type_label,
                    value: r.total,
                    count: r.count,
                }));
        }

        if (cardKey === "average") {
            return dailyRevenue
                .filter((d) => Number(d.total) > 0)
                .slice(-7) // ۷ روز آخر
                .map((d) => ({
                    label: formatFullDateWithoutTime(d.date),
                    value: Number(d.total),
                }));
        }

        return [];
    };

    // ============ آیتم‌های اخیر (آرایشگرها) ============
    const getRecentItems = () => {
        if (cardKey === "commission" && revenueByUser.length > 0) {
            return revenueByUser.slice(0, 5).map((item) => ({
                id: item.user_id,
                title: item.user?.name ?? "ناشناس",
                subtitle: `${toPersianNumber(item.count)} تراکنش`,
                amount: item.total,
                icon: item.user?.thumbnail ? (
                    <img
                        src={item.user.thumbnail}
                        alt={item.user.name}
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "0.5rem",
                            objectFit: "cover",
                        }}
                    />
                ) : (
                    <User size={14} />
                ),
                url: `/admin/users/${item.user_id}`,
            }));
        }

        return [];
    };

    const statItems = getStats();
    const breakdownItems = getBreakdown();
    const recentItems = getRecentItems();

    return (
        <div className="revenue-detail-overlay" onClick={onClose}>
            <div
                className="revenue-detail-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ============ هدر ============ */}
                <div
                    className="revenue-detail-header"
                    style={{
                        background: config.bg,
                        borderColor: config.border,
                    }}
                >
                    <div
                        className="revenue-detail-icon"
                        style={{ background: config.color, color: "#fff" }}
                    >
                        <Icon size={26} />
                    </div>

                    <div className="revenue-detail-header-content">
                        <h3 style={{ color: config.color }}>{config.title}</h3>
                        <p className="revenue-detail-desc">
                            {config.description}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="revenue-detail-close"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ============ مبلغ دقیق ============ */}
                <div className="revenue-detail-amount-section">
                    <div className="revenue-detail-amount-label">مبلغ دقیق</div>
                    <div className="revenue-detail-amount-row">
                        <span
                            className="revenue-detail-amount-value"
                            style={{ color: config.color }}
                        >
                            {formatFullAmount(amount)}
                        </span>
                        <span className="revenue-detail-amount-unit">
                            {config.unit}
                        </span>
                        <button
                            type="button"
                            className={`revenue-detail-copy ${
                                copied === "main" ? "copied" : ""
                            }`}
                            onClick={() => handleCopy("main", amount)}
                            title="کپی مبلغ"
                        >
                            {copied === "main" ? (
                                <Check size={14} style={{ color: "#10b981" }} />
                            ) : (
                                <Copy size={14} />
                            )}
                        </button>
                    </div>

                    {/* ترند (فقط برای total) */}
                    {cardKey === "total" &&
                        stats?.revenue_growth !== undefined && (
                            <div
                                className={`revenue-detail-trend ${
                                    stats.revenue_growth >= 0
                                        ? "positive"
                                        : "negative"
                                }`}
                            >
                                <TrendingUp size={14} />
                                <span className="trend-value">
                                    {toPersianNumber(
                                        Math.abs(stats.revenue_growth),
                                    )}
                                    ٪
                                </span>
                                <span className="trend-label">
                                    {stats.revenue_growth >= 0
                                        ? "افزایش"
                                        : "کاهش"}{" "}
                                    نسبت به دوره قبل
                                </span>
                            </div>
                        )}
                </div>

                {/* ============ آمار تفصیلی ============ */}
                {statItems.length > 0 && (
                    <div className="revenue-detail-section">
                        <h4 className="revenue-detail-section-title">
                            آمار تفصیلی
                        </h4>
                        <div className="revenue-detail-stats-grid">
                            {statItems.map((stat, i) => (
                                <div
                                    key={i}
                                    className="revenue-detail-stat"
                                    style={{
                                        borderColor: stat.color
                                            ? `${stat.color}40`
                                            : "#e5e7eb",
                                    }}
                                >
                                    <span className="revenue-detail-stat-label">
                                        {stat.label}
                                    </span>
                                    <span
                                        className="revenue-detail-stat-value"
                                        style={{ color: stat.color }}
                                    >
                                        {stat.isCount
                                            ? toPersianNumber(stat.value)
                                            : formatFullAmount(stat.value)}
                                        <span className="stat-unit">
                                            {stat.isCount
                                                ? "مورد"
                                                : config.unit}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ============ Breakdown ============ */}
                {breakdownItems.length > 0 && (
                    <div className="revenue-detail-section">
                        <h4 className="revenue-detail-section-title">
                            {cardKey === "average"
                                ? "درآمد ۷ روز آخر"
                                : "تفکیک"}
                        </h4>
                        <div className="revenue-detail-breakdown-list">
                            {breakdownItems.map((item, i) => {
                                const percent =
                                    amount > 0
                                        ? (Number(item.value) / amount) * 100
                                        : 0;

                                return (
                                    <div
                                        key={i}
                                        className="revenue-detail-breakdown-row"
                                    >
                                        <div className="breakdown-info">
                                            <span className="breakdown-label">
                                                {item.label}
                                            </span>
                                            {item.count !== undefined && (
                                                <span className="breakdown-count">
                                                    {toPersianNumber(
                                                        item.count,
                                                    )}{" "}
                                                    تراکنش
                                                </span>
                                            )}
                                            {percent > 0 &&
                                                cardKey !== "average" && (
                                                    <span
                                                        className="breakdown-percent"
                                                        style={{
                                                            color: config.color,
                                                            background:
                                                                config.bg,
                                                        }}
                                                    >
                                                        {toPersianNumber(
                                                            percent.toFixed(1),
                                                        )}
                                                        ٪
                                                    </span>
                                                )}
                                        </div>
                                        <div className="breakdown-value">
                                            <span
                                                style={{
                                                    color: config.color,
                                                }}
                                            >
                                                {formatFullAmount(item.value)}
                                            </span>
                                            <span className="breakdown-unit">
                                                {config.unit}
                                            </span>
                                        </div>
                                        {percent > 0 &&
                                            cardKey !== "average" && (
                                                <div className="breakdown-bar">
                                                    <div
                                                        className="breakdown-bar-fill"
                                                        style={{
                                                            width: `${Math.min(
                                                                percent,
                                                                100,
                                                            )}%`,
                                                            background:
                                                                config.color,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ============ آیتم‌های اخیر ============ */}
                {recentItems.length > 0 && (
                    <div className="revenue-detail-section">
                        <h4 className="revenue-detail-section-title">
                            <User size={14} />
                            آرایشگرهای برتر (کمیسیون)
                        </h4>
                        <div className="revenue-detail-recent-list">
                            {recentItems.map((item, i) => (
                                <Link
                                    key={item.id ?? i}
                                    href={item.url}
                                    className="revenue-detail-recent-item"
                                >
                                    <div className="recent-item-icon">
                                        {item.icon}
                                    </div>
                                    <div className="recent-item-content">
                                        <span className="recent-item-title">
                                            {item.title}
                                        </span>
                                        {item.subtitle && (
                                            <span className="recent-item-subtitle">
                                                {item.subtitle}
                                            </span>
                                        )}
                                    </div>
                                    <div className="recent-item-meta">
                                        <span className="recent-item-amount">
                                            {formatFullAmount(item.amount)}
                                        </span>
                                        <span className="recent-item-unit">
                                            {config.unit}
                                        </span>
                                    </div>
                                    <ExternalLink
                                        size={12}
                                        className="recent-item-arrow"
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* ============ فوتر ============ */}
                <div className="revenue-detail-footer">
                    <Link
                        href={`/admin/finance/revenue?period=${period}${
                            cardKey === "commission"
                                ? "&type=commission"
                                : cardKey === "penalty"
                                  ? "&type=penalty"
                                  : ""
                        }`}
                        className="btn-primary"
                        onClick={onClose}
                    >
                        <ExternalLink size={14} />
                        مشاهده لیست کامل
                    </Link>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onClose}
                    >
                        بستن
                    </button>
                </div>
            </div>
        </div>
    );
}
