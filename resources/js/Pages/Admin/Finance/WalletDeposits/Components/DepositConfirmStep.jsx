import React from "react";
import {
    X,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
} from "lucide-react";
import { toPersianNumber } from "../../../../../utils/persianNumbers";

import "../../../Assets/css/DepositConfirmStep.css";

export default function DepositConfirmStep({
    user,
    amount,
    isLoading,
    onConfirm,
    onBack,
    onClose,
}) {
    const [isConfirmed, setIsConfirmed] = React.useState(false);

    return (
        <div
            className="stat-detail-overlay"
            onClick={() => {
                if (!isLoading) onClose();
            }}
        >
            <div
                className="stat-detail-modal"
                onClick={(event) => event.stopPropagation()}
                style={{ maxWidth: "480px" }}
            >
                {/* هدر */}
                <div
                    className="stat-detail-header"
                    style={{ background: "#fef2f2", borderColor: "#fecaca" }}
                >
                    <div
                        className="stat-detail-icon"
                        style={{ background: "#991b1b", color: "#fff" }}
                    >
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-detail-header-content">
                        <h3 style={{ color: "#991b1b" }}>تایید نهایی شارژ</h3>
                        <p className="stat-detail-desc">
                            لطفاً اطلاعات را دوباره بررسی کنید
                        </p>
                    </div>
                    <button
                        type="button"
                        className="stat-detail-close"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: "1.25rem 1.5rem" }}>
                    {/* اطلاعات */}
                    <div className="confirm-details">
                        <div className="confirm-row">
                            <span className="confirm-label">کاربر:</span>
                            <strong className="confirm-value">
                                {user?.name ?? user?.label ?? "—"}
                                {user?.phone && (
                                    <span
                                        style={{
                                            marginRight: "0.375rem",
                                            fontSize: "0.6875rem",
                                            color: "#6b7280",
                                            direction: "ltr",
                                            display: "inline-block",
                                        }}
                                    >
                                        ({toPersianNumber(user.phone)})
                                    </span>
                                )}
                            </strong>
                        </div>
                        <div className="confirm-row">
                            <span className="confirm-label">مبلغ:</span>
                            <strong className="confirm-amount">
                                {toPersianNumber(
                                    Number(amount || 0).toLocaleString("en-US"),
                                )}{" "}
                                تومان
                            </strong>
                        </div>
                    </div>

                    {/* هشدار بزرگ */}
                    <div className="confirm-warning">
                        <AlertTriangle size={24} />
                        <div>
                            <strong>این عملیات غیرقابل برگشت است</strong>
                            <p>
                                مبلغ مستقیماً به کیف پول کاربر اضافه می‌شود و
                                کاربر می‌تواند آن را از سایت برداشت کند.
                            </p>
                            <p>
                                اگر این مبلغ اشتباه باشد،{" "}
                                <strong>ضرر مالی واقعی</strong> برای پلتفرم است
                                و فقط از طریق کاهش موجودی (با تراکنش debit
                                جداگانه) قابل جبران است.
                            </p>
                        </div>
                    </div>

                    {/* چک‌باکس تایید */}
                    <label className="confirm-checkbox">
                        <input
                            type="checkbox"
                            checked={isConfirmed}
                            onChange={(e) => setIsConfirmed(e.target.checked)}
                            disabled={isLoading}
                        />
                        <span>
                            تایید می‌کنم که کاربر و مبلغ را بررسی کرده‌ام و این
                            عملیات را تایید می‌کنم.
                        </span>
                    </label>
                </div>

                {/* دکمه‌ها */}
                <div className="confirm-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onBack}
                        disabled={isLoading}
                    >
                        <ArrowRight size={14} />
                        بازگشت و ویرایش
                    </button>
                    <button
                        type="button"
                        className="btn-danger"
                        onClick={onConfirm}
                        disabled={isLoading || !isConfirmed}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner" />
                                در حال شارژ...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={14} />
                                بله، شارژ کن
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
