import { useState } from "react";
import { router } from "@inertiajs/react";
import { X, Play, AlertCircle, Clock4 } from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function ProcessModal({
    isOpen,
    settlement,
    isLoading,
    onClose,
}) {
    const [notes, setNotes] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    if (!isOpen || !settlement) return null;

    const handleSubmit = () => {
        setIsProcessing(true);
        router.post(
            route("admin.finance.settlements.process", settlement.id),
            { notes },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
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
                    <div className="modal-icon process">
                        <Play size={24} />
                    </div>
                    <h3>شروع پردازش تسویه</h3>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-warning info">
                    <Clock4 size={14} />
                    <p>
                        با شروع پردازش، وضعیت تسویه به «در حال پردازش» تغییر
                        مییابد. سپس باید از درگاه بانکی واریز را انجام دهید.
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
                        {isProcessing ? " درحال پردازش..." : "شروع پردازش"}
                    </button>
                </div>
            </div>
        </div>
    );
}
