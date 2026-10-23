import React, { useState } from "react";
import { router } from "@inertiajs/react";
import {
    X,
    XCircle,
    AlertTriangle,
    Star,
    MessageSquare,
    AlertCircle,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import RatingStars from "../../../Customer/Components/RatingStars";

import "../Assets/css/RejectReviewModal.css";

const rejectionReasons = [
    {
        value: "inappropriate_language",
        label: "الفاظ نامناسب",
        description: "توهین، فحش یا الفاظ رکیک",
    },
    {
        value: "false_information",
        label: "اطلاعات نادرست",
        description: "اطلاعات نادرست یا گمراه‌کننده",
    },
    {
        value: "not_related",
        label: "نامرتبط با خدمت",
        description: "نظر ربطی به خدمت ندارد",
    },
    {
        value: "spam",
        label: "اسپم یا تبلیغ",
        description: "تبلیغ، لینک یا محتوای اسپم",
    },
    {
        value: "personal_info",
        label: "افشای اطلاعات شخصی",
        description: "شماره، آدرس یا اطلاعات خصوصی",
    },
    {
        value: "other",
        label: "سایر (نیاز به توضیح)",
        description: "دلیل دیگر (نیاز به توضیح)",
    },
];

export default function RejectReviewModal({
    isOpen,
    review,
    isLoading,
    onClose,
    setIsLoading,
}) {
    const isChange = review?.status === "approved";
    const [reason, setReason] = useState("");
    const [note, setNote] = useState("");
    const [errors, setErrors] = useState({});

    if (!isOpen || !review) return null;

    const handleSubmit = () => {
        const clientErrors = {};
        if (!reason) clientErrors.reason = "دلیل رد الزامی است.";
        if (reason === "other" && !note.trim())
            clientErrors.note = "توضیح الزامی است.";
        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        router.patch(
            `/admin/reviews/${review.id}/reject`,
            { reason, note },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    setReason("");
                    setNote("");
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
            className="reject-modal-overlay"
            onClick={() => !isLoading && onClose()}
        >
            <div className="reject-modal" onClick={(e) => e.stopPropagation()}>
                {/* هدر */}
                <div className="reject-modal-header">
                    <div className="reject-modal-icon">
                        <XCircle size={24} />
                    </div>
                    <div className="reject-modal-header-content">
                        <h3>{isChange ? "تغییر تصمیم به رد" : "رد نظر"}</h3>{" "}
                        <p className="reject-modal-desc">
                            {isChange
                                ? "نظر قبلاً تایید شده بود. با رد، از پروفایل عمومی حذف می‌شود"
                                : "نظر از دید عمومی مخفی می‌شود و امتیاز آرایشگر بازمحاسبه می‌شود"}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="reject-modal-close"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="reject-modal-body">
                    {/* در هشدار (فقط برای isChange) */}
                    {isChange && (
                        <div
                            className="reject-warning-box"
                            style={{
                                background: "#fef2f2",
                                borderColor: "#fecaca",
                                color: "#991b1b",
                            }}
                        >
                            <AlertTriangle size={16} />
                            <span>
                                این نظر قبلاً <strong>تایید شده</strong> بود. با
                                تغییر به رد، از پروفایل آرایشگر حذف می‌شود و
                                امتیاز بازمحاسبه می‌شود.
                            </span>
                        </div>
                    )}
                    {/* پیش‌نمایش نظر */}
                    <div className="reject-review-preview">
                        <div className="reject-preview-header">
                            <div className="reject-preview-user">
                                <MessageSquare
                                    size={14}
                                    style={{ color: "#8b5cf6" }}
                                />
                                <span className="reject-preview-user-name">
                                    {review.user?.name ?? "—"}
                                </span>
                            </div>
                            <div className="reject-preview-rating">
                                <div className="reject-preview-rating-stars">
                                    <RatingStars
                                        rating={review.rating}
                                        size={20}
                                        showNumber={true}
                                        showTotal={false}
                                    />
                                </div>
                            </div>
                        </div>
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
                    {/* دلایل */}
                    <div className="reject-reasons-section">
                        <label className="reject-reasons-label">
                            دلیل رد نظر <span className="required">*</span>
                        </label>
                        <div className="reject-reasons-list">
                            {rejectionReasons.map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    className={`reject-reason-option ${reason === r.value ? "selected" : ""}`}
                                    onClick={() => setReason(r.description)}
                                    disabled={isLoading}
                                >
                                    <span className="reject-reason-radio">
                                        {reason === r.value && (
                                            <span
                                                style={{
                                                    width: "0.375rem",
                                                    height: "0.375rem",
                                                    borderRadius: "50%",
                                                    background: "#fff",
                                                }}
                                            />
                                        )}
                                    </span>
                                    <div className="reject-reason-content">
                                        <span className="reject-reason-label">
                                            {r.label}
                                        </span>
                                        <span className="reject-reason-description">
                                            {r.description}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {errors.reason && (
                            <div className="reject-form-error">
                                <AlertCircle size={12} />
                                <span>{errors.reason}</span>
                            </div>
                        )}
                    </div>
                    {/* توضیحات */}
                    <div className="reject-form-group">
                        <label className="reject-form-label">
                            {isChange ? "دلیل تغییر تصمیم" : "دلیل رد"}
                            <span className="required">*</span>
                        </label>
                        <textarea
                            className="reject-form-textarea"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={
                                isChange
                                    ? "چرا تصمیم را از تایید به رد تغییر می‌دهید؟"
                                    : "دلیل رد نظر..."
                            }
                            rows={3}
                            maxLength={500}
                            required
                        />
                        <div className="reject-form-footer">
                            <span>حداکثر ۵۰۰ کاراکتر</span>
                            <span className="reject-form-counter">
                                {toPersianNumber(note.length)} / ۵۰۰
                            </span>
                        </div>
                        {errors.note && (
                            <div className="reject-form-error">
                                <AlertCircle size={12} />
                                <span>{errors.note}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* فوتر */}
                <div className="reject-modal-footer">
                    <button
                        type="button"
                        className="btn-confirm"
                        onClick={handleSubmit}
                        disabled={isLoading || !reason}
                    >
                        {isLoading ? (
                            <>
                                <span className="reject-spinner" />
                                در حال رد...
                            </>
                        ) : (
                            <>
                                <XCircle size={14} />
                                رد نظر
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
