import React, { useEffect } from "react";
import { AlertTriangle, X, Trash2, CheckCircle, Info } from "lucide-react";

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "آیا مطمئن هستید؟",
    message = "این عملیات قابل بازگشت نیست.",
    confirmText = "بله، ادامه بده",
    cancelText = "انصراف",
    type = "danger", // danger | warning | info | success
    isLoading = false,
    icon: CustomIcon,
}) {
    // جلوگیری از اسکرول صفحه وقتی Modal باز است
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // بستن با کلید Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen && !isLoading) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    // تنظیمات ظاهری بر اساس type
    const typeConfig = {
        danger: {
            icon: Trash2,
            color: "#ef4444",
            bgColor: "#fef2f2",
            borderColor: "#fee2e2",
            buttonColor: "#ef4444",
            buttonHoverColor: "#dc2626",
            shadowColor: "rgba(239, 68, 68, 0.2)",
        },
        warning: {
            icon: AlertTriangle,
            color: "#f59e0b",
            bgColor: "#fffbeb",
            borderColor: "#fef3c7",
            buttonColor: "#f59e0b",
            buttonHoverColor: "#d97706",
            shadowColor: "rgba(245, 158, 11, 0.2)",
        },
        info: {
            icon: Info,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            borderColor: "#dbeafe",
            buttonColor: "#3b82f6",
            buttonHoverColor: "#2563eb",
            shadowColor: "rgba(59, 130, 246, 0.2)",
        },
        success: {
            icon: CheckCircle,
            color: "#10b981",
            bgColor: "#ecfdf5",
            borderColor: "#d1fae5",
            buttonColor: "#10b981",
            buttonHoverColor: "#059669",
            shadowColor: "rgba(16, 185, 129, 0.2)",
        },
    };

    const config = typeConfig[type] || typeConfig.danger;
    const IconComponent = CustomIcon || config.icon;

    return (
        <div
            className="modal-overlay"
            onClick={() => !isLoading && onClose()}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: "modalSlideUp 0.3s ease" }}
            >
                {/* هدر با آیکون */}
                <div className="modal-header">
                    <div
                        className="modal-icon-wrapper"
                        style={{
                            backgroundColor: config.bgColor,
                            color: config.color,
                            border: `1px solid ${config.borderColor}`,
                        }}
                    >
                        <IconComponent size={28} />
                    </div>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        disabled={isLoading}
                        aria-label="بستن"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* محتوا */}
                <div className="modal-body">
                    <h3 className="modal-title">{title}</h3>
                    <p className="modal-message">{message}</p>
                </div>

                {/* دکمه‌های عملیات */}
                <div className="modal-actions">
                    <button
                        type="button"
                        className="modal-btn modal-btn-cancel"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className="modal-btn modal-btn-confirm"
                        onClick={onConfirm}
                        disabled={isLoading}
                        style={{
                            backgroundColor: config.buttonColor,
                            boxShadow: `0 4px 12px ${config.shadowColor}`,
                        }}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                در حال انجام...
                            </>
                        ) : (
                            <>
                                <IconComponent size={16} />
                                {confirmText}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
