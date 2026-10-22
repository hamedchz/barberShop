import React, { useState } from "react";
import { router } from "@inertiajs/react";
import {
    X,
    RotateCcw,
    AlertTriangle,
    Star,
    MessageSquare,
    CheckCircle,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import "../Assets/css/RestoreReviewModal.css";

export default function RestoreReviewModal({
    isOpen,
    review,
    isLoading,
    onClose,
    setIsLoading,
}) {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [errors, setErrors] = useState({});

    if (!isOpen || !review) return null;

    const handleRestore = () => {
        if (!isConfirmed) return;

        setIsLoading(true);
        setErrors({});

        router.patch(
            `/admin/reviews/${review.id}/restore`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    setIsConfirmed(false);
                },
                onError: (err) => {
                    setErrors(err);
                    setIsLoading(false);
                },
            },
        );
    };

    return (
        <div
            className="restore-modal-overlay"
            onClick={() => !isLoading && onClose()}
        >
            <div className="restore-modal" onClick={(e) => e.stopPropagation()}>
                {/* ============ هدر ============ */}
                <div className="restore-modal-header">
                    <div className="restore-modal-icon">
                        <RotateCcw size={24} />
                    </div>
                    <div className="restore-modal-header-content">
                        <h3>بازیابی نظر</h3>
                        <p className="restore-modal-desc">
                            نظر به حالت قبلی خود بازمی‌گردد و در صورت تایید،
                            دوباره نمایش داده می‌شود
                        </p>
                    </div>
                    <button
                        type="button"
                        className="restore-modal-close"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="restore-modal-body">
                    {/* ============ هشدار ============ */}
                    <div className="restore-info-box">
                        <CheckCircle size={16} />
                        <span>
                            این نظر در سبد حذف‌شده‌ها بود. با بازیابی، به لیست
                            نظرات فعال برمی‌گردد. توجه: بعد از بازیابی، نظر
                            همچنان باید توسط ادمین بررسی و تایید شود.
                        </span>
                    </div>

                    {/* ============ پیش‌نمایش نظر ============ */}
                    <div className="restore-review-preview">
                        <div className="restore-preview-header">
                            <div className="restore-preview-user">
                                <MessageSquare
                                    size={14}
                                    style={{ color: "#8b5cf6" }}
                                />
                                <span className="restore-preview-user-name">
                                    {review.user?.name ?? "—"}
                                </span>
                            </div>
                            <div className="restore-preview-rating">
                                <div className="restore-preview-rating-stars">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            fill={
                                                i <= review.rating
                                                    ? "#fbbf24"
                                                    : "#e5e7eb"
                                            }
                                            color={
                                                i <= review.rating
                                                    ? "#fbbf24"
                                                    : "#e5e7eb"
                                            }
                                        />
                                    ))}
                                </div>
                                <span className="restore-preview-rating-value">
                                    {toPersianNumber(review.rating)}/۵
                                </span>
                            </div>
                        </div>

                        {review.comment ? (
                            <p className="review-comment-display">
                                {review.comment}
                            </p>
                        ) : (
                            <div className="review-comment-display empty">
                                بدون متن
                            </div>
                        )}
                    </div>

                    {/* ============ اطلاعات حذف ============ */}
                    {review.deleted_at && (
                        <div className="restore-deleted-info">
                            <AlertTriangle size={14} />
                            <div>
                                <strong>تاریخ حذف:</strong>{" "}
                                {new Date(review.deleted_at).toLocaleDateString(
                                    "fa-IR",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    },
                                )}
                            </div>
                        </div>
                    )}

                    {/* ============ چک‌باکس تایید ============ */}
                    <label
                        className={`restore-confirm-checkbox ${
                            isConfirmed ? "checked" : ""
                        }`}
                    >
                        <input
                            type="checkbox"
                            checked={isConfirmed}
                            onChange={(e) => setIsConfirmed(e.target.checked)}
                            disabled={isLoading}
                        />
                        <span>
                            تایید می‌کنم که این نظر را می‌خواهم بازیابی کنم.
                        </span>
                    </label>

                    {errors.restore && (
                        <div className="restore-form-error">
                            <AlertTriangle size={12} />
                            <span>{errors.restore}</span>
                        </div>
                    )}
                </div>

                {/* ============ فوتر ============ */}
                <div className="restore-modal-footer">
                    <button
                        type="button"
                        className="btn-confirm"
                        onClick={handleRestore}
                        disabled={isLoading || !isConfirmed}
                    >
                        {isLoading ? (
                            <>
                                <span className="restore-spinner" />
                                در حال بازیابی...
                            </>
                        ) : (
                            <>
                                <RotateCcw size={14} />
                                بازیابی نظر
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        انصراف
                    </button>
                </div>
            </div>
        </div>
    );
}
