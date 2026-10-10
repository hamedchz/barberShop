import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    X,
    ArrowUpRight,
    CreditCard,
    AlertTriangle,
    Wallet,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

import "../Assets/css/WithdrawModal.css";

export default function WithdrawModal({
    wallet,
    bankInfo,
    routeName, // ✅ مسیر ارسال
    bankInfoRoute, // ✅ مسیر اطلاعات بانکی
    onClose,
}) {
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const available = wallet.balance - wallet.locked_balance;
    const minAmount = 10000;

    const handleSubmit = () => {
        const numAmount = Number(amount);
        const clientErrors = {};

        if (!amount || numAmount <= 0) {
            clientErrors.amount = "لطفاً مبلغ را وارد کنید.";
        } else if (numAmount < minAmount) {
            clientErrors.amount = `حداقل مبلغ برداشت ${toPersianNumber(
                minAmount.toLocaleString(),
            )} تومان است.`;
        } else if (numAmount > available) {
            clientErrors.amount =
                "مبلغ وارد شده بیشتر از موجودی قابل برداشت است.";
        }

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setIsLoading(true);
        router.post(
            routeName, // ✅ داینامیک
            { amount: numAmount },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsLoading(false);
                },
            },
        );
    };

    return (
        <div className="withdraw-modal-overlay" onClick={onClose}>
            <div
                className="withdraw-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* هدر */}
                <div className="withdraw-modal-header">
                    <div className="withdraw-modal-icon">
                        <ArrowUpRight size={24} />
                    </div>
                    <h3>درخواست برداشت</h3>
                    <button
                        type="button"
                        className="withdraw-modal-close"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* موجودی */}
                <div className="withdraw-balance-box">
                    <span className="balance-label">موجودی قابل برداشت</span>
                    <div className="balance-value">
                        <span>
                            {toPersianNumber(available.toLocaleString())}
                        </span>
                        <span className="currency">تومان</span>
                    </div>
                </div>

                {/* هشدار قفل */}
                {wallet.locked_balance > 0 && (
                    <div className="withdraw-warning-box">
                        <AlertTriangle size={14} />
                        <span>
                            {toPersianNumber(
                                wallet.locked_balance.toLocaleString(),
                            )}{" "}
                            تومان در انتظار آزادسازی است.
                        </span>
                    </div>
                )}

                {/* اطلاعات بانکی */}
                {!bankInfo.has_bank_info ? (
                    <div className="no-bank-info-box">
                        <CreditCard size={32} />
                        <p>
                            برای برداشت، ابتدا اطلاعات بانکی خود را تکمیل کنید.
                        </p>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={() => router.visit(bankInfoRoute)} // ✅ داینامیک
                        >
                            <CreditCard size={16} />
                            تکمیل اطلاعات بانکی
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bank-info-preview-box">
                            <CreditCard size={14} />
                            <span>{bankInfo.bank_name}</span>
                            <span className="separator">•</span>
                            <span dir="ltr">
                                ****{bankInfo.card_number?.slice(-4)}
                            </span>
                        </div>

                        <div className="form-group">
                            <label>مبلغ برداشت (تومان)</label>
                            <input
                                type="number"
                                className={`form-input ${
                                    errors.amount ? "error" : ""
                                }`}
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    setErrors({
                                        ...errors,
                                        amount: undefined,
                                    });
                                }}
                                placeholder={`حداقل ${toPersianNumber(
                                    minAmount.toLocaleString(),
                                )}`}
                                min={minAmount}
                                max={available}
                                disabled={isLoading}
                                autoFocus
                            />

                            {amount > 0 && (
                                <div className="amount-display">
                                    <div className="amount-main">
                                        <span className="amount-value">
                                            {toPersianNumber(
                                                Number(amount).toLocaleString(),
                                            )}
                                        </span>
                                        <span className="amount-currency">
                                            تومان
                                        </span>
                                    </div>

                                    <div className="amount-meta">
                                        {available > 0 && (
                                            <span className="amount-percentage">
                                                {toPersianNumber(
                                                    Math.round(
                                                        (Number(amount) /
                                                            available) *
                                                            100,
                                                    ),
                                                )}
                                                ٪ از موجودی
                                            </span>
                                        )}

                                        {Number(amount) <= available && (
                                            <>
                                                <span className="meta-separator">
                                                    •
                                                </span>
                                                <span className="amount-remaining">
                                                    باقیمانده:{" "}
                                                    {toPersianNumber(
                                                        (
                                                            available -
                                                            Number(amount)
                                                        ).toLocaleString(),
                                                    )}{" "}
                                                    تومان
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {errors.amount && (
                                <span className="form-error">
                                    {errors.amount}
                                </span>
                            )}
                        </div>

                        <div className="withdraw-modal-actions">
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
                                className="btn-primary"
                                onClick={handleSubmit}
                                disabled={isLoading || available < minAmount}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        در حال ارسال...
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpRight size={16} />
                                        ثبت درخواست
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
