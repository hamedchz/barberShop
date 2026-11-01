import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { AlertTriangle, Trash2, X, Loader } from "lucide-react";

export default function DeleteConfirmModal({ isOpen, onClose, dispute }) {
    const [processing, setProcessing] = useState(false);

    // ریست کردن حالت loading هنگام باز شدن مجدد مودال
    useEffect(() => {
        if (isOpen) {
            setProcessing(false);
        }
    }, [isOpen]);

    const handleDelete = () => {
        if (processing) return; // جلوگیری از کلیک دوباره

        setProcessing(true);

        router.delete(route("customer.disputes.destroy", dispute.id), {
            preserveScroll: true,
            onSuccess: () => {
                // بعد از موفقیت، onClose مودال را می‌بندد
                onClose();
            },
            onError: () => {
                // در صورت خطا، loading را خاموش کن
                setProcessing(false);
            },
            onFinish: () => {
                // همیشه بعد از اتمام، loading را خاموش کن
                // (اما اگر موفق بود، مودال بسته می‌شود)
                setProcessing(false);
            },
        });
    };

    // جلوگیری از بسته شدن با کلیک روی overlay هنگام loading
    const handleOverlayClick = () => {
        if (!processing) {
            onClose();
        }
    };

    // جلوگیری از بسته شدن با دکمه X هنگام loading
    const handleCloseClick = () => {
        if (!processing) {
            onClose();
        }
    };

    // جلوگیری از بسته شدن با Escape هنگام loading
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && !processing) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, processing, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className={`modal-overlay ${processing ? "is-processing" : ""}`}
            onClick={handleOverlayClick}
        >
            <div
                className="modal-content delete-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
            >
                <div className="modal-header">
                    <div className="delete-icon">
                        <AlertTriangle size={32} />
                    </div>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={handleCloseClick}
                        disabled={processing}
                        aria-label="بستن"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <h3 id="delete-modal-title">حذف اعتراض</h3>
                    <p className="modal-message">
                        آیا از حذف این اعتراض مطمئن هستید؟ این عمل قابل بازگشت
                        نیست.
                    </p>

                    <div className="delete-preview">
                        <span className="preview-label">متن اعتراض:</span>
                        <p className="preview-text">{dispute.reason}</p>
                    </div>
                </div>

                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={handleCloseClick}
                        disabled={processing}
                    >
                        انصراف
                    </button>
                    <button
                        type="button"
                        className="btn-danger"
                        onClick={handleDelete}
                        disabled={processing}
                        aria-busy={processing}
                    >
                        {processing ? (
                            <>
                                <Loader size={16} className="spin" />
                                در حال حذف...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                حذف اعتراض
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
