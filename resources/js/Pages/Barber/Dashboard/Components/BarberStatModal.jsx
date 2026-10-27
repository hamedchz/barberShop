import React from "react";
import {
    X,
    Copy,
    Check,
    TrendingUp,
    TrendingDown,
    Info,
    ArrowRight,
} from "lucide-react";
import { Link } from "@inertiajs/react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatCompactNumber } from "../../../../Constants/formatCompactNumber";
import "../Assets/css/BarberStatModal.css";
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

export default function BarberStatModal({ isOpen, onClose, config }) {
    const [copied, setCopied] = React.useState(null);

    if (!isOpen || !config) return null;

    const {
        title,
        icon: Icon,
        color,
        bg,
        amount,
        unit = "تومان",
        description,
        change,
        breakdown = [],
        actionLink,
        isCount = false,
    } = config;

    const handleCopy = async (key, value) => {
        const ok = await copyToClipboard(Number(value || 0).toString());
        if (ok) {
            setCopied(key);
            setTimeout(() => setCopied(null), 1500);
        }
    };

    return (
        <div className="barber-stat-modal-overlay" onClick={onClose}>
            <div
                className="barber-stat-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* هدر */}
                <div
                    className="barber-stat-modal-header"
                    style={{
                        background: `linear-gradient(135deg, ${bg} 0%, #ffffff 100%)`,
                        borderColor: color,
                    }}
                >
                    <div
                        className="barber-stat-modal-icon"
                        style={{ background: color, color: "#fff" }}
                    >
                        {Icon && <Icon size={24} />}
                    </div>
                    <div className="barber-stat-modal-header-content">
                        <h3 style={{ color }}>{title}</h3>
                        {description && (
                            <p className="barber-stat-modal-desc">
                                {description}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        className="barber-stat-modal-close"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* مبلغ دقیق */}
                <div className="barber-stat-modal-amount-box">
                    <span className="barber-stat-modal-amount-label">
                        {isCount ? "تعداد دقیق" : "مبلغ دقیق"}
                    </span>
                    <div className="barber-stat-modal-amount-value">
                        <span style={{ color }}>
                            {isCount
                                ? toPersianNumber(amount)
                                : formatFullAmount(amount)}
                        </span>
                        <span className="barber-stat-modal-unit">{unit}</span>
                        <button
                            type="button"
                            className={`barber-stat-modal-copy ${
                                copied === "main" ? "copied" : ""
                            }`}
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

                    {/* تغییر نسبت به دوره قبل */}
                    {change !== undefined && (
                        <div
                            className={`barber-stat-modal-change ${
                                change >= 0 ? "positive" : "negative"
                            }`}
                        >
                            {change >= 0 ? (
                                <TrendingUp size={14} />
                            ) : (
                                <TrendingDown size={14} />
                            )}
                            <span>
                                {toPersianNumber(Math.abs(change))}٪{" "}
                                {change >= 0 ? "افزایش" : "کاهش"} نسبت به دوره
                                قبل
                            </span>
                        </div>
                    )}
                </div>

                {/* Breakdown */}
                {breakdown.length > 0 && (
                    <div className="barber-stat-modal-breakdown">
                        <h4 className="barber-stat-modal-section-title">
                            جزئیات
                        </h4>
                        <div className="barber-stat-modal-breakdown-list">
                            {breakdown.map((item, i) => {
                                const key = `b-${i}`;
                                const isItemCount = item.isCount;
                                const itemUnit =
                                    item.unit ?? (isItemCount ? "مورد" : unit);
                                return (
                                    <div
                                        key={i}
                                        className="barber-stat-modal-breakdown-row"
                                    >
                                        <div className="barber-stat-modal-breakdown-info">
                                            <span className="barber-stat-modal-breakdown-label">
                                                {item.label}
                                            </span>
                                            {item.hint && (
                                                <span className="barber-stat-modal-breakdown-hint">
                                                    {item.hint}
                                                </span>
                                            )}
                                        </div>
                                        <div className="barber-stat-modal-breakdown-value">
                                            <span style={{ color }}>
                                                {isItemCount
                                                    ? toPersianNumber(
                                                          item.value,
                                                      )
                                                    : formatFullAmount(
                                                          item.value,
                                                      )}
                                            </span>
                                            <span className="barber-stat-modal-unit">
                                                {itemUnit}
                                            </span>
                                            <button
                                                type="button"
                                                className="barber-stat-modal-copy small"
                                                onClick={() =>
                                                    handleCopy(key, item.value)
                                                }
                                                title="کپی"
                                            >
                                                {copied === key ? (
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
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* فوتر */}
                <div className="barber-stat-modal-footer">
                    {actionLink && (
                        <Link
                            href={actionLink.href}
                            className="barber-stat-modal-btn primary"
                            onClick={onClose}
                        >
                            <ArrowRight size={14} />
                            {actionLink.label}
                        </Link>
                    )}
                    <button
                        type="button"
                        className="barber-stat-modal-btn secondary"
                        onClick={onClose}
                    >
                        بستن
                    </button>
                </div>
            </div>
        </div>
    );
}
