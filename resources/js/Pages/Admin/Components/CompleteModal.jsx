import { useState } from "react";
import { router } from "@inertiajs/react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function CompleteModal({
    isOpen,
    settlement,
    isLoading,
    onClose,
}) {
    const [bankReference, setBankReference] = useState("");
    const [notes, setNotes] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    if (!isOpen || !settlement) return null;

    const handleSubmit = () => {
        const clientErrors = {};
        if (!bankReference.trim()) {
            clientErrors.bank_reference =
                "لطفاً شماره پیگیری بانکی را وارد کنید.";
        }

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setIsProcessing(true);
        router.post(
            route("admin.finance.settlements.complete", settlement.id),
            { bank_reference: bankReference, notes },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    setBankReference("");
                    setNotes("");
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
                    <div className="modal-icon complete">
                        <CheckCircle size={24} />
                    </div>
                    <h3>تکمیل تسویه</h3>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-warning success">
                    <CheckCircle size={14} />
                    <p>
                        با تکمیل، مبلغ از کیف پول کاربر کسر و تسویه نهایی میشود.
                        این عملیات قابل بازگشت نیست.
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
                    <div className="summary-row">
                        <span>بانک:</span>
                        <strong>{settlement.bank_name}</strong>
                    </div>
                </div>

                <div className="form-group">
                    <label>
                        شماره پیگیری بانکی
                        <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        className={`form-input ltr ${errors.bank_reference ? "error" : ""}`}
                        value={bankReference}
                        onChange={(e) => {
                            setBankReference(e.target.value);
                            setErrors({ ...errors, bank_reference: undefined });
                        }}
                        placeholder="مثلاً: 123456789"
                        dir="ltr"
                    />
                    {errors.bank_reference && (
                        <span className="form-error">
                            <AlertCircle size={12} />
                            {errors.bank_reference}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label>یادداشت (اختیاری)</label>
                    <textarea
                        className="form-textarea"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="یادداشت داخلی..."
                        rows={3}
                    />
                </div>

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
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={isProcessing}
                    >
                        {isProcessing ? "در حال انجام..." : "تکمیل تسویه"}
                    </button>
                </div>
            </div>
        </div>
    );
}
