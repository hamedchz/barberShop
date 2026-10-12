import { useState } from "react";
import { router } from "@inertiajs/react";
import { X, XCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

const rejectionReasons = [
    { value: "invalid_bank_info", label: "اطلاعات بانکی نادرست" },
    { value: "insufficient_balance", label: "موجودی کافی نیست" },
    { value: "suspicious_activity", label: "فعالیت مشکوک" },
    { value: "duplicate_request", label: "درخواست تکراری" },
    { value: "user_request", label: "درخواست کاربر" },
    { value: "other", label: "سایر" },
];

export default function RejectModal({
    isOpen,
    settlement,
    isLoading,
    onClose,
}) {
    const [reason, setReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    if (!isOpen || !settlement) return null;

    const handleSubmit = () => {
        const clientErrors = {};
        if (!reason) {
            clientErrors.failure_reason = "لطفاً دلیل رد را انتخاب کنید.";
        }
        if (reason === "other" && !customReason.trim()) {
            clientErrors.failure_reason = "لطفاً دلیل رد را وارد کنید.";
        }

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        const finalReason =
            reason === "other"
                ? customReason
                : rejectionReasons.find((r) => r.value === reason)?.label ||
                  reason;

        setIsProcessing(true);
        router.post(
            route("admin.finance.settlements.reject", settlement.id),
            { failure_reason: finalReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    setReason("");
                    setCustomReason("");
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsProcessing(false);
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-icon reject">
                        <XCircle size={24} />
                    </div>
                    <h3>رد تسویه</h3>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-warning danger">
                    <AlertTriangle size={14} />
                    <p>
                        با رد تسویه، مبلغ قفل شده آزاد میشود و کاربر میتواند
                        دوباره درخواست دهد.
                    </p>
                </div>

                <div className="modal-summary">
                    <div className="summary-row">
                        <span>مبلغ:</span>
                        <strong>
                            {toPersianNumber(
                                settlement.amount.toLocaleString(),
                            )}{" "}
                            تومان
                        </strong>
                    </div>
                    <div className="summary-row">
                        <span>کاربر:</span>
                        <strong>{settlement.user?.name}</strong>
                    </div>
                </div>

                <div className="form-group">
                    <label>
                        دلیل رد
                        <span className="required">*</span>
                    </label>
                    <div className="reasons-list">
                        {rejectionReasons.map((r) => (
                            <button
                                key={r.value}
                                type="button"
                                className={`reason-option ${
                                    reason === r.value ? "selected" : ""
                                }`}
                                onClick={() => {
                                    setReason(r.value);
                                    setErrors({
                                        ...errors,
                                        failure_reason: undefined,
                                    });
                                }}
                            >
                                <span className="reason-radio">
                                    {reason === r.value && (
                                        <span className="dot" />
                                    )}
                                </span>
                                <span>{r.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {reason === "other" && (
                    <div className="form-group">
                        <label>توضیحات</label>
                        <textarea
                            className="form-textarea"
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            placeholder="دلیل رد..."
                            rows={3}
                        />
                    </div>
                )}

                {errors.failure_reason && (
                    <div className="form-error">
                        <AlertCircle size={12} />
                        {errors.failure_reason}
                    </div>
                )}

                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn-ghost"
                        onClick={onClose}
                    >
                        انصراف
                    </button>
                    <button
                        type="button"
                        className="btn-danger"
                        onClick={handleSubmit}
                        disabled={isProcessing}
                    >
                        {isProcessing ? "در حال انجام..." : "رد تسویه"}
                    </button>
                </div>
            </div>
        </div>
    );
}
