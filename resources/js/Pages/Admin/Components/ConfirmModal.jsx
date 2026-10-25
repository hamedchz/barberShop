import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, Trash2, CheckCircle, Info } from "lucide-react";
import "../Assets/css/confirm-modal.css";

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "آیا مطمئن هستید؟",
    message = "این عملیات قابل بازگشت نیست.",
    confirmText = "بله، ادامه بده",
    cancelText = "انصراف",
    type = "danger",
    isLoading = false,
    icon: CustomIcon,
    children,
}) {
    // جلوگیری از اسکرول صفحه هنگام باز بودن مدال
    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    // بستن مدال با Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e) => {
            if (e.key === "Escape" && !isLoading) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    const typeConfig = {
        danger: {
            icon: Trash2,
            color: "#ef4444",
            bgColor: "#fef2f2",
            borderColor: "#fee2e2",
            buttonColor: "#ef4444",
            shadowColor: "rgba(239, 68, 68, 0.2)",
        },
        warning: {
            icon: AlertTriangle,
            color: "#f59e0b",
            bgColor: "#fffbeb",
            borderColor: "#fef3c7",
            buttonColor: "#f59e0b",
            shadowColor: "rgba(245, 158, 11, 0.2)",
        },
        info: {
            icon: Info,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            borderColor: "#dbeafe",
            buttonColor: "#3b82f6",
            shadowColor: "rgba(59, 130, 246, 0.2)",
        },
        success: {
            icon: CheckCircle,
            color: "#10b981",
            bgColor: "#ecfdf5",
            borderColor: "#d1fae5",
            buttonColor: "#10b981",
            shadowColor: "rgba(16, 185, 129, 0.2)",
        },
    };

    const config = typeConfig[type] || typeConfig.danger;
    const IconComponent = CustomIcon || config.icon;

    return createPortal(
        <div
            className="modal-overlay"
            onClick={() => !isLoading && onClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: "modalSlideUp 0.3s ease" }}
            >
                {/* هدر */}
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
                        type="button"
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
                    <h3 id="confirm-modal-title" className="modal-title">
                        {title}
                    </h3>

                    {message && <p className="modal-message">{message}</p>}

                    {children && (
                        <div className="modal-children">{children}</div>
                    )}
                </div>

                {/* دکمه‌ها */}
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
                                <span className="spinner" />
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
        </div>,
        document.body,
    );
}
