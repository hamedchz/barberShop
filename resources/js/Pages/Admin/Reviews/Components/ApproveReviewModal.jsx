import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import {
    X,
    CheckCircle,
    AlertCircle,
    Star,
    Info,
    MessageSquare,
    RefreshCw,
    AlertTriangle,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import "../Assets/css/ApproveReviewModal.css";

export default function ApproveReviewModal({
    isOpen,
    review,
    isLoading,
    onClose,
    setIsLoading,
}) {
    const [reason, setReason] = useState("");
    const [note, setNote] = useState("");
    const [errors, setErrors] = useState({});

    // تشخیص حالت تغییر: فقط وقتی وضعیت فعلی rejected هست
    const isChange = review?.status === "rejected";

    // ریست state وقتی modal باز می‌شه
    useEffect(() => {
        if (isOpen) {
            setReason("");
            setNote("");
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen || !review) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        const clientErrors = {};

        // ============ دلیل فقط برای تغییر تصمیم الزامی ============
        if (isChange) {
            if (!reason.trim() || reason.trim().length < 5) {
                clientErrors.reason =
                    "دلیل تغییر تصمیم باید حداقل ۵ کاراکتر باشد.";
            }
        }

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        // ============ payload ============
        // برای pending: فقط note (اختیاری)
        // برای rejected: reason (الزامی) + note (اختیاری)
        const payload = isChange
            ? { reason: reason.trim(), note: note.trim() || null }
            : { note: note.trim() || null };

        router.patch(`/admin/reviews/${review.id}/approve`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
            onError: (err) => {
                setErrors(err);
                setIsLoading(false);
            },
        });
    };

    return (
        <div
            className="approve-modal-overlay"
            onClick={() => !isLoading && onClose()}
        >
            <div className="approve-modal" onClick={(e) => e.stopPropagation()}>
                {/* ============ هدر ============ */}
                <div className="approve-modal-header">
                    <div className="approve-modal-icon">
                        {isChange ? (
                            <RefreshCw size={24} />
                        ) : (
                            <CheckCircle size={24} />
                        )}
                    </div>
                    <div className="approve-modal-header-content">
                        <h3>
                            {isChange ? "تغییر تصمیم به تایید" : "تایید نظر"}
                        </h3>
                        <p className="approve-modal-desc">
                            {isChange
                                ? "نظر قبلاً رد شده بود. با تایید، امتیاز آرایشگر بازمحاسبه می‌شود"
                                : "نظر بعد از تایید در صفحه آرایشگر نمایش داده می‌شود"}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="approve-modal-close"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="approve-modal-body">
                        {/* هشدار تغییر */}
                        {isChange && (
                            <div
                                className="approve-info-box"
                                style={{
                                    background: "#fffbeb",
                                    borderColor: "#fde68a",
                                    color: "#92400e",
                                }}
                            >
                                <AlertTriangle
                                    size={14}
                                    style={{ color: "#f59e0b" }}
                                />
                                <span>
                                    این نظر قبلاً <strong>رد شده</strong> بود.
                                    با تغییر به تایید، نظر در پروفایل عمومی
                                    نمایش داده می‌شود و امتیاز آرایشگر بازمحاسبه
                                    می‌شود.
                                </span>
                            </div>
                        )}

                        {/* پیش‌نمایش نظر */}
                        <div className="approve-review-preview">
                            <div className="approve-review-preview-header">
                                <div className="approve-review-user">
                                    <MessageSquare
                                        size={14}
                                        style={{ color: "#8b5cf6" }}
                                    />
                                    <span className="approve-review-user-name">
                                        {review.user?.name ?? "—"}
                                    </span>
                                </div>
                                <div className="approve-review-rating">
                                    <div className="approve-review-rating-stars">
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
                                    <span className="approve-review-rating-value">
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

                        {/* توضیح (فقط برای pending) */}
                        {!isChange && (
                            <div className="approve-info-box">
                                <Info size={14} />
                                <span>
                                    با تایید این نظر، امتیاز آرایشگر به‌روزرسانی
                                    می‌شود و نظر در پروفایل عمومی نمایش داده
                                    خواهد شد.
                                </span>
                            </div>
                        )}

                        {/* ============ دلیل (فقط برای تغییر تصمیم) ============ */}
                        {isChange && (
                            <div className="approve-form-group">
                                <label className="approve-form-label">
                                    دلیل تغییر تصمیم
                                    <span
                                        className="required"
                                        style={{ color: "#dc2626" }}
                                    >
                                        *
                                    </span>
                                </label>
                                <textarea
                                    className="approve-form-textarea"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="چرا تصمیم را از رد به تایید تغییر می‌دهید؟"
                                    rows={3}
                                    maxLength={500}
                                    disabled={isLoading}
                                    required
                                />
                                <div className="approve-form-footer">
                                    <span>حداقل ۵ کاراکتر</span>
                                    <span className="approve-form-counter">
                                        {toPersianNumber(reason.length)} / ۵۰۰
                                    </span>
                                </div>
                                {errors.reason && (
                                    <div className="approve-form-error">
                                        <AlertCircle size={12} />
                                        <span>{errors.reason}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ============ یادداشت (همیشه اختیاری) ============ */}
                        <div className="approve-form-group">
                            <label className="approve-form-label">
                                یادداشت ادمین
                                <span className="optional">(اختیاری)</span>
                            </label>
                            <textarea
                                className="approve-form-textarea"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={
                                    isChange
                                        ? "توضیحات تکمیلی برای تغییر تصمیم..."
                                        : "توضیحات تکمیلی (اختیاری)..."
                                }
                                rows={2}
                                maxLength={500}
                                disabled={isLoading}
                            />
                            <div className="approve-form-footer">
                                <span>حداکثر ۵۰۰ کاراکتر</span>
                                <span className="approve-form-counter">
                                    {toPersianNumber(note.length)} / ۵۰۰
                                </span>
                            </div>
                            {errors.note && (
                                <div className="approve-form-error">
                                    <AlertCircle size={12} />
                                    <span>{errors.note}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* فوتر */}
                    <div className="approve-modal-footer">
                        <button
                            type="submit"
                            className="btn-confirm"
                            disabled={isLoading || (isChange && !reason.trim())}
                        >
                            {isLoading ? (
                                <>
                                    <span className="approve-spinner" />
                                    در حال {isChange ? "تغییر" : "تایید"}...
                                </>
                            ) : (
                                <>
                                    {isChange ? (
                                        <RefreshCw size={14} />
                                    ) : (
                                        <CheckCircle size={14} />
                                    )}
                                    {isChange ? "تغییر به تایید" : "تایید نظر"}
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
                </form>
            </div>
        </div>
    );
}
