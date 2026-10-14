import { X, Trash2, AlertTriangle, Building2 } from "lucide-react";

export default function DeleteBankModal({
    isOpen,
    bank,
    isLoading,
    onClose,
    onConfirm,
}) {
    if (!isOpen || !bank) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-icon reject">
                        <Trash2 size={24} />
                    </div>
                    <h3>حذف بانک</h3>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-warning danger">
                    <AlertTriangle size={14} />
                    <p>
                        با حذف این بانک، اطلاعات بانکی کاربرانی که از آن استفاده
                        می‌کنند دست‌نخورده می‌ماند. این عملیات قابل بازگشت نیست.
                    </p>
                </div>

                <div className="modal-summary">
                    <div className="summary-row">
                        <span>نام بانک:</span>
                        <strong>{bank.name}</strong>
                    </div>
                    {bank.code && (
                        <div className="summary-row">
                            <span>کد:</span>
                            <strong dir="ltr">{bank.code}</strong>
                        </div>
                    )}
                    {bank.slug && (
                        <div className="summary-row">
                            <span>Slug:</span>
                            <strong dir="ltr">{bank.slug}</strong>
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn-ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        انصراف
                    </button>
                    <button
                        type="button"
                        className="btn-danger"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                در حال حذف...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                بله، حذف کن
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
