import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Info, HelpCircle } from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import "../Assets/css/StatDetailModal.css";
/* ==========================================
   فرمت‌کننده مقدار — عمومی برای مدال
   ========================================== */
export const formatModalValue = (value, format) => {
    if (value === null || value === undefined || value === "—") {
        return "—";
    }

    switch (format) {
        case "currency":
            return `${toPersianNumber(
                Number(value).toLocaleString("en-US"),
            )} تومان`;
        case "number":
            return toPersianNumber(Number(value).toLocaleString("en-US"));
        case "date":
            if (typeof value === "string" || value instanceof Date) {
                try {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        return new Intl.DateTimeFormat("fa-IR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        }).format(date);
                    }
                } catch (e) {
                    return String(value);
                }
            }
            return String(value);
        case "text":
        default:
            return String(value);
    }
};

export default function StatDetailModal({ isOpen, onClose, config }) {
    // بستن با Escape + قفل اسکرول
    useEffect(() => {
        if (!isOpen) return;

        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    // جلوگیری از بسته شدن با کلیک داخل مدال
    const handleContentClick = useCallback((e) => {
        e.stopPropagation();
    }, []);

    if (!isOpen || !config) return null;

    const Icon = config.icon;
    const detailItems = config.details || [];
    const mainValueFormat = config.mainValueFormat || "currency";

    return createPortal(
        <div className="stat-modal-overlay" onClick={onClose}>
            <div
                className="stat-modal-content"
                onClick={handleContentClick}
                role="dialog"
                aria-modal="true"
                aria-labelledby="stat-modal-title"
            >
                {/* هدر مدال */}
                <div className={`stat-modal-header ${config.color || "green"}`}>
                    <div className="stat-modal-header-icon">
                        {Icon && <Icon size={22} />}
                    </div>
                    <div className="stat-modal-header-content">
                        <h3 id="stat-modal-title">
                            {config.title || config.label}
                        </h3>
                        {config.label && <p>{config.label}</p>}
                    </div>
                    <button
                        type="button"
                        className="stat-modal-close"
                        onClick={onClose}
                        aria-label="بستن"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* بدنه مدال */}
                <div className="stat-modal-body">
                    {/* مقدار اصلی */}
                    <div
                        className={`stat-modal-main-value ${
                            config.color || "green"
                        }`}
                    >
                        <span className="stat-modal-main-label">مقدار کل</span>
                        <div className="stat-modal-main-amount">
                            <span>
                                {formatModalValue(
                                    config.mainValue,
                                    mainValueFormat,
                                )}
                            </span>
                        </div>
                    </div>

                    {/* توضیحات */}
                    {config.description && (
                        <div className="stat-modal-description">
                            <Info size={16} />
                            <p>{config.description}</p>
                        </div>
                    )}

                    {/* جزئیات */}
                    {detailItems.length > 0 && (
                        <div className="stat-modal-details">
                            <h4 className="stat-modal-details-title">
                                جزئیات کامل
                            </h4>
                            <ul className="stat-modal-details-list">
                                {detailItems.map((item, idx) => {
                                    const DetailIcon = item.icon || HelpCircle;
                                    return (
                                        <li
                                            key={idx}
                                            className="stat-modal-detail-item"
                                        >
                                            <div className="stat-modal-detail-icon">
                                                <DetailIcon size={16} />
                                            </div>
                                            <div className="stat-modal-detail-content">
                                                <span className="stat-modal-detail-label">
                                                    {item.label}
                                                </span>
                                                <span className="stat-modal-detail-value">
                                                    {formatModalValue(
                                                        item.value,
                                                        item.format || "text",
                                                    )}
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {/* راهنما */}
                    {config.hint && (
                        <div className="stat-modal-hint">
                            <HelpCircle size={14} />
                            <p>{config.hint}</p>
                        </div>
                    )}
                </div>

                {/* فوتر */}
                <div className="stat-modal-footer">
                    <button
                        type="button"
                        className="stat-modal-btn-close"
                        onClick={onClose}
                    >
                        بستن
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
