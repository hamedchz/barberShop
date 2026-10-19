import React, { useState, useRef, useEffect } from "react";
import { X, Copy, Check, ExternalLink, PieChart } from "lucide-react";
import { Link } from "@inertiajs/react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import "../Assets/css/StatsDetailModal.css";

const formatFullAmount = (amount) =>
    toPersianNumber(Number(amount || 0).toLocaleString("en-US"));

// ============ تابع کپی با fallback ============
const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.warn("clipboard API failed, using fallback:", err);
        }
    }
    // Fallback برای HTTP یا مرورگرهای قدیمی
    try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        textarea.style.left = "-9999px";
        textarea.setAttribute("readonly", "");
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        return ok;
    } catch (err) {
        console.error("Copy failed:", err);
        return false;
    }
};

export default function StatDetailModal({ isOpen, onClose, config }) {
    const [copied, setCopied] = useState(null);
    const [copyError, setCopyError] = useState(false);
    const timeoutRef = useRef(null);

    // پاک کردن timeout در unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // ریست state وقتی Modal بسته می‌شه
    useEffect(() => {
        if (!isOpen) {
            setCopied(null);
            setCopyError(false);
        }
    }, [isOpen]);

    if (!isOpen || !config) return null;

    const {
        title,
        icon: Icon,
        color,
        bg,
        border,
        amount,
        unit = "تومان",
        description,
        breakdown = [],
        actionLink,
        isCount = false,
    } = config;

    // ============ محاسبه مجموع برای درصد ============
    const breakdownTotal = breakdown.reduce(
        (sum, item) => sum + Number(item.value || 0),
        0,
    );

    const handleCopy = async (key, value) => {
        // ریست timeout قبلی
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setCopyError(false);

        // مقدار عددی خالص برای کپی (بدون جداکننده)
        const text = Number(value || 0).toString();

        const ok = await copyToClipboard(text);

        if (ok) {
            setCopied(key);
            timeoutRef.current = setTimeout(() => setCopied(null), 2000);
        } else {
            setCopyError(true);
            timeoutRef.current = setTimeout(() => setCopyError(false), 2000);
        }
    };

    return (
        <div className="stat-detail-overlay" onClick={onClose}>
            <div
                className="stat-detail-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ============ Header ============ */}
                <div
                    className="stat-detail-header"
                    style={{ background: bg, borderColor: border }}
                >
                    <div
                        className="stat-detail-icon"
                        style={{ background: color, color: "#fff" }}
                    >
                        {Icon && <Icon size={24} />}
                    </div>
                    <div className="stat-detail-header-content">
                        <h3 style={{ color }}>{title}</h3>
                        {description && (
                            <p className="stat-detail-desc">{description}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        className="stat-detail-close"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ============ مبلغ اصلی ============ */}
                <div className="stat-detail-amount-box">
                    <span className="stat-detail-amount-label">
                        {isCount ? "تعداد کل" : "مبلغ کل"}
                    </span>
                    <div className="stat-detail-amount-value">
                        <span style={{ color }}>
                            {isCount
                                ? toPersianNumber(amount)
                                : formatFullAmount(amount)}
                        </span>
                        <span className="stat-detail-unit">{unit}</span>
                        <button
                            type="button"
                            className="stat-detail-copy"
                            onClick={() => handleCopy("main", amount)}
                            title="کپی"
                        >
                            {copied === "main" ? (
                                <Check size={14} style={{ color: "#10b981" }} />
                            ) : (
                                <Copy size={14} />
                            )}
                        </button>
                    </div>
                </div>

                {/* ============ Breakdown ============ */}
                {breakdown.length > 0 && (
                    <div className="stat-detail-breakdown">
                        <div className="stat-detail-section-header">
                            <PieChart size={14} />
                            <h4 className="stat-detail-section-title">
                                تفکیک بر اساس{" "}
                                {config.key === "gateway_total"
                                    ? "درگاه پرداخت"
                                    : config.key === "total_credit" ||
                                        config.key === "total_debit"
                                      ? "نوع تراکنش"
                                      : "جزئیات"}
                            </h4>
                        </div>

                        <div className="stat-detail-breakdown-list">
                            {breakdown.map((item, i) => {
                                const percent =
                                    breakdownTotal > 0
                                        ? (Number(item.value) /
                                              breakdownTotal) *
                                          100
                                        : 0;

                                return (
                                    <div
                                        key={i}
                                        className="stat-detail-breakdown-row"
                                    >
                                        <div className="stat-detail-breakdown-info">
                                            <div className="stat-detail-breakdown-title-row">
                                                <span className="stat-detail-breakdown-label">
                                                    {item.label}
                                                </span>
                                                {percent > 0 && (
                                                    <span
                                                        className="stat-detail-breakdown-percent"
                                                        style={{
                                                            color: color,
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

                                            {item.count !== undefined &&
                                                !isCount && (
                                                    <span className="stat-detail-breakdown-count">
                                                        {toPersianNumber(
                                                            item.count,
                                                        )}{" "}
                                                        تراکنش
                                                    </span>
                                                )}
                                        </div>

                                        <div className="stat-detail-breakdown-value">
                                            <span style={{ color }}>
                                                {isCount
                                                    ? toPersianNumber(
                                                          item.value,
                                                      )
                                                    : formatFullAmount(
                                                          item.value,
                                                      )}
                                            </span>
                                            <span className="stat-detail-unit">
                                                {unit}
                                            </span>
                                            <button
                                                type="button"
                                                className="stat-detail-copy small"
                                                onClick={() =>
                                                    handleCopy(
                                                        `b-${i}`,
                                                        item.value,
                                                    )
                                                }
                                                title="کپی"
                                            >
                                                {copied === `b-${i}` ? (
                                                    <Check
                                                        size={12}
                                                        style={{
                                                            color: "#10b981",
                                                        }}
                                                    />
                                                ) : (
                                                    <Copy size={12} />
                                                )}
                                            </button>
                                        </div>

                                        {/* نوار درصد */}
                                        {percent > 0 && (
                                            <div className="stat-detail-progress">
                                                <div
                                                    className="stat-detail-progress-bar"
                                                    style={{
                                                        width: `${percent}%`,
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

                {/* ============ Footer ============ */}
                <div className="stat-detail-footer">
                    {actionLink && (
                        <Link
                            href={actionLink.href}
                            className="btn-primary"
                            onClick={onClose}
                        >
                            <ExternalLink size={14} />
                            {actionLink.label}
                        </Link>
                    )}
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
