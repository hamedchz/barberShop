import React, { useState, useRef, useEffect } from "react";
import { Link } from "@inertiajs/react";
import {
    X,
    Copy,
    Check,
    ExternalLink,
    TrendingUp,
    TrendingDown,
    Minus,
    Info,
    ChevronLeft,
    Calendar,
    User,
    Clock,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import "../../Assets/css/CardDetailModal.css";
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

export default function CardDetailModal({ isOpen, onClose, config }) {
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

    if (!isOpen || !config) return null;

    const {
        title,
        label,
        icon: Icon,
        color = "#5b21b6",
        bg = "#f5f3ff",
        border = "#ddd6fe",
        amount,
        unit = "تومان",
        isCount = false,
        description,
        breakdown = [], // [{label, value, isCount}]
        trend, // {value: 12.5, direction: "up"|"down"|"flat"}
        stats = [], // [{label, value, isCount, color?}]
        recentItems = [], // [{id, title, subtitle, amount, date, url}]
        actionLinks = [], // [{label, href, variant}]
    } = config;

    const headerTitle = title ?? label ?? "جزئیات";

    const handleCopy = async (key, value) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        const ok = await copyToClipboard(Number(value || 0).toString());
        if (ok) {
            setCopied(key);
            timeoutRef.current = setTimeout(() => setCopied(null), 1500);
        }
    };

    // ============ آیکون ترند ============
    const TrendIcon =
        trend?.direction === "up"
            ? TrendingUp
            : trend?.direction === "down"
              ? TrendingDown
              : Minus;

    const trendColor =
        trend?.direction === "up"
            ? "#10b981"
            : trend?.direction === "down"
              ? "#ef4444"
              : "#6b7280";

    return (
        <div className="card-detail-overlay" onClick={onClose}>
            <div
                className="card-detail-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ============ هدر ============ */}
                <div
                    className="card-detail-header"
                    style={{ background: bg, borderColor: border }}
                >
                    <div
                        className="card-detail-icon"
                        style={{ background: color, color: "#fff" }}
                    >
                        {Icon && <Icon size={26} />}
                    </div>

                    <div className="card-detail-header-content">
                        <h3 style={{ color }}>{headerTitle}</h3>
                        {description && (
                            <p className="card-detail-desc">{description}</p>
                        )}
                    </div>

                    <button
                        type="button"
                        className="card-detail-close"
                        onClick={onClose}
                        aria-label="بستن"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ============ مبلغ اصلی + ترند ============ */}
                <div className="card-detail-amount-section">
                    <div className="card-detail-amount-label">
                        {isCount ? "تعداد دقیق" : "مبلغ دقیق"}
                    </div>

                    <div className="card-detail-amount-row">
                        <span
                            className="card-detail-amount-value"
                            style={{ color }}
                        >
                            {isCount
                                ? toPersianNumber(amount)
                                : formatFullAmount(amount)}
                        </span>
                        <span className="card-detail-amount-unit">{unit}</span>

                        <button
                            type="button"
                            className={`card-detail-copy ${
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

                    {/* ترند */}
                    {trend && (
                        <div
                            className="card-detail-trend"
                            style={{
                                color: trendColor,
                                background: `${trendColor}15`,
                            }}
                        >
                            <TrendIcon size={14} />
                            <span className="trend-value">
                                {toPersianNumber(Math.abs(trend.value))}٪
                            </span>
                            <span className="trend-label">
                                {trend.direction === "up"
                                    ? "افزایش"
                                    : trend.direction === "down"
                                      ? "کاهش"
                                      : "بدون تغییر"}{" "}
                                نسبت به دوره قبل
                            </span>
                        </div>
                    )}
                </div>

                {/* ============ آمار تفصیلی ============ */}
                {stats.length > 0 && (
                    <div className="card-detail-section">
                        <h4 className="card-detail-section-title">
                            <Info size={14} />
                            آمار تفصیلی
                        </h4>

                        <div className="card-detail-stats-grid">
                            {stats.map((stat, i) => (
                                <div
                                    key={i}
                                    className="card-detail-stat"
                                    style={{
                                        borderColor: stat.color
                                            ? `${stat.color}40`
                                            : "#e5e7eb",
                                    }}
                                >
                                    <span className="card-detail-stat-label">
                                        {stat.label}
                                    </span>
                                    <span
                                        className="card-detail-stat-value"
                                        style={{
                                            color: stat.color ?? color,
                                        }}
                                    >
                                        {stat.isCount
                                            ? toPersianNumber(stat.value)
                                            : formatFullAmount(stat.value)}
                                        <span className="stat-unit">
                                            {stat.isCount ? "مورد" : unit}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ============ Breakdown ============ */}
                {breakdown.length > 0 && (
                    <div className="card-detail-section">
                        <h4 className="card-detail-section-title">
                            تفکیک بر اساس نوع
                        </h4>

                        <div className="card-detail-breakdown-list">
                            {breakdown.map((item, i) => {
                                const percent =
                                    amount > 0
                                        ? (Number(item.value) / amount) * 100
                                        : 0;
                                const isItemCount = item.isCount;

                                return (
                                    <div
                                        key={i}
                                        className="card-detail-breakdown-row"
                                    >
                                        <div className="breakdown-info">
                                            <span className="breakdown-label">
                                                {item.label}
                                            </span>
                                            {percent > 0 && (
                                                <span
                                                    className="breakdown-percent"
                                                    style={{
                                                        color,
                                                        background: bg,
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
                                            <span style={{ color }}>
                                                {isItemCount
                                                    ? toPersianNumber(
                                                          item.value,
                                                      )
                                                    : formatFullAmount(
                                                          item.value,
                                                      )}
                                            </span>
                                            <span className="breakdown-unit">
                                                {isItemCount ? "مورد" : unit}
                                            </span>
                                        </div>

                                        {/* نوار درصد */}
                                        {percent > 0 && (
                                            <div className="breakdown-bar">
                                                <div
                                                    className="breakdown-bar-fill"
                                                    style={{
                                                        width: `${Math.min(
                                                            percent,
                                                            100,
                                                        )}%`,
                                                        background: color,
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
                    <div className="card-detail-section">
                        <h4 className="card-detail-section-title">
                            <Clock size={14} />
                            آخرین موارد
                        </h4>

                        <div className="card-detail-recent-list">
                            {recentItems.map((item, i) => (
                                <Link
                                    key={item.id ?? i}
                                    href={item.url ?? "#"}
                                    className="card-detail-recent-item"
                                >
                                    <div className="recent-item-icon">
                                        {item.icon ? (
                                            item.icon
                                        ) : (
                                            <User size={14} />
                                        )}
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
                                        {item.date && (
                                            <span className="recent-item-date">
                                                <Calendar size={10} />
                                                {item.date}
                                            </span>
                                        )}
                                    </div>

                                    <ChevronLeft
                                        size={14}
                                        className="recent-item-arrow"
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* ============ دکمه‌های عملیات ============ */}
                {(actionLinks.length > 0 || true) && (
                    <div className="card-detail-footer">
                        {actionLinks.map((link, i) => (
                            <Link
                                key={i}
                                href={link.href}
                                className={
                                    link.variant === "secondary"
                                        ? "btn-secondary"
                                        : "btn-primary"
                                }
                                onClick={onClose}
                            >
                                <ExternalLink size={14} />
                                {link.label}
                            </Link>
                        ))}

                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                        >
                            بستن
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
