// resources/js/Pages/Admin/Reviews/Components/DeleteReviewModal.jsx

import React, { useState } from "react";
import { router } from "@inertiajs/react";
import {
    X,
    Trash2,
    AlertTriangle,
    Star,
    MessageSquare,
    User,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import "../Assets/css/DeleteReviewModal.css";
import RatingStars from "../../../Customer/Components/RatingStars";

export default function DeleteReviewModal({
    isOpen,
    review,
    isLoading,
    onClose,
    setIsLoading,
}) {
    const [isConfirmed, setIsConfirmed] = useState(false);

    if (!isOpen || !review) return null;

    const handleDelete = () => {
        if (!isConfirmed) return;
        setIsLoading(true);
        router.delete(`/admin/reviews/${review.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                setIsConfirmed(false);
            },
            onError: () => setIsLoading(false),
        });
    };

    return (
        <div
            className="delete-modal-overlay"
            onClick={() => !isLoading && onClose()}
        >
            <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                {/* هدر */}
                <div className="delete-modal-header">
                    <div className="delete-modal-icon">
                        <Trash2 size={24} />
                    </div>
                    <div className="delete-modal-header-content">
                        <h3>حذف نظر</h3>
                        <p className="delete-modal-desc">
                            نظر به سبد حذف‌شده‌ها منتقل می‌شود
                        </p>
                    </div>
                    <button
                        type="button"
                        className="delete-modal-close"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="delete-modal-body">
                    {/* هشدار */}
                    <div className="delete-warning-box">
                        <AlertTriangle size={18} />
                        <div>
                            <strong>توجه:</strong> نظر حذف می‌شود ولی در دیتابیس
                            باقی می‌ماند. می‌توانید در صورت نیاز آن را بازیابی
                            کنید.
                        </div>
                    </div>

                    {/* اطلاعات نظر */}
                    <div className="delete-review-info">
                        <div className="delete-info-row">
                            <span className="delete-info-label">
                                <User size={12} />
                                مشتری
                            </span>
                            <span className="delete-info-value">
                                {review.user?.name ?? "—"}
                            </span>
                        </div>
                        <div className="delete-info-row">
                            <span className="delete-info-label">
                                <Star size={12} />
                                امتیاز
                            </span>
                            <span className="delete-info-rating">
                                <span className="delete-info-rating-stars">
                                    <RatingStars
                                        rating={review.rating}
                                        size={20}
                                        showNumber={true}
                                        showTotal={false}
                                    />
                                </span>
                            </span>
                        </div>
                        {review.comment && (
                            <div
                                className="delete-info-row"
                                style={{
                                    flexDirection: "column",
                                    alignItems: "stretch",
                                    gap: "0.375rem",
                                }}
                            >
                                <span className="delete-info-label">
                                    <MessageSquare size={12} />
                                    متن نظر
                                </span>
                                {review.comment ? (
                                    <p className="reject-preview-comment">
                                        {review.comment}
                                    </p>
                                ) : (
                                    <div className="reject-preview-comment-empty">
                                        بدون متن
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* چک‌باکس تایید */}
                    <label
                        className={`delete-confirm-checkbox ${isConfirmed ? "checked" : ""}`}
                    >
                        <input
                            type="checkbox"
                            checked={isConfirmed}
                            onChange={(e) => setIsConfirmed(e.target.checked)}
                            disabled={isLoading}
                        />
                        <span>
                            تایید می‌کنم که این نظر را می‌خواهم حذف کنم.
                        </span>
                    </label>
                </div>

                {/* فوتر */}
                <div className="delete-modal-footer">
                    <button
                        type="button"
                        className="btn-danger"
                        onClick={handleDelete}
                        disabled={isLoading || !isConfirmed}
                    >
                        {isLoading ? (
                            <>
                                <span className="delete-spinner" />
                                در حال حذف...
                            </>
                        ) : (
                            <>
                                <Trash2 size={14} />
                                حذف نظر
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
