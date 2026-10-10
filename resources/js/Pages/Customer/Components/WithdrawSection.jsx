// resources/js/Pages/Customer/Wallet/Components/WithdrawSection.jsx

import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import {
    CreditCard,
    AlertTriangle,
    ArrowUpRight,
    Wallet,
    Clock4,
    CheckCircle,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../utils/dateHelpers";

export default function WithdrawSection({
    wallet,
    bankInfo,
    pendingSettlements,
}) {
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const available = wallet.balance - (wallet.locked_balance || 0);
    const minAmount = 50000; // حداقل برداشت مشتری
    const hasActiveSettlement =
        pendingSettlements && pendingSettlements.length > 0;
    // const hasBankInfo = bankInfo?.has_bank_info === true;
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
            route("customer.finance.wallet.withdraw"),
            { amount: numAmount },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAmount("");
                    setIsLoading(false);
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsLoading(false);
                },
            },
        );
    };

    return (
        <div className="wallet-card withdraw-card">
            <div className="wallet-card-header">
                <div className="card-icon-box green">
                    <ArrowUpRight size={20} />
                </div>
                <h2>درخواست برداشت</h2>
            </div>

            {/* موجودی قابل برداشت */}
            {bankInfo.has_bank_info ? (
                <>
                    <div className="withdraw-balance">
                        <span className="balance-label">
                            موجودی قابل برداشت
                        </span>

                        <div className="balance-value">
                            <span>
                                {toPersianNumber(available.toLocaleString())}
                            </span>
                            <span className="currency">تومان</span>
                        </div>
                    </div>

                    <div className="bank-info-preview">
                        <CreditCard size={14} />
                        <span>{bankInfo.bank_name}</span>
                        <span className="separator">•</span>
                        <span dir="ltr">
                            ****{bankInfo.card_number?.slice(-4)}
                        </span>
                    </div>

                    {/* هشدار درخواست فعال */}
                    {hasActiveSettlement && (
                        <div className="withdraw-warning">
                            <Clock4 size={14} />
                            <span>
                                شما یک درخواست برداشت فعال دارید. لطفاً تا بررسی
                                آن صبر کنید.
                            </span>
                        </div>
                    )}

                    {/* هشدار موجودی کم */}
                    {!hasActiveSettlement && available < minAmount && (
                        <div className="withdraw-warning">
                            <AlertTriangle size={14} />
                            <span>
                                موجودی شما کمتر از حداقل مبلغ برداشت (
                                {toPersianNumber(minAmount.toLocaleString())}{" "}
                                تومان) است.
                            </span>
                        </div>
                    )}

                    {/* فرم برداشت */}
                    {!hasActiveSettlement && available >= minAmount && (
                        <>
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
                                />

                                {Number(amount) > 0 && (
                                    <div className="amount-display">
                                        <div className="amount-main">
                                            <span className="amount-value">
                                                {toPersianNumber(
                                                    Number(
                                                        amount,
                                                    ).toLocaleString(),
                                                )}
                                            </span>

                                            <span className="amount-currency">
                                                تومان
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {errors.amount && (
                                    <span className="form-error">
                                        {errors.amount}
                                    </span>
                                )}

                                <span className="form-hint">
                                    حداقل مبلغ برداشت:{" "}
                                    {toPersianNumber(
                                        minAmount.toLocaleString(),
                                    )}{" "}
                                    تومان
                                </span>
                            </div>

                            <button
                                type="button"
                                className="btn-primary full-width"
                                onClick={handleSubmit}
                                disabled={
                                    isLoading ||
                                    !amount ||
                                    Number(amount) < minAmount ||
                                    Number(amount) > available
                                }
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        در حال ارسال...
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpRight size={16} />
                                        ثبت درخواست برداشت
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </>
            ) : (
                <div className="no-bank-info">
                    <CreditCard size={32} />

                    <p>برای برداشت، ابتدا اطلاعات بانکی خود را تکمیل کنید.</p>

                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() =>
                            router.visit(
                                route("customer.finance.profile.bank-info"),
                            )
                        }
                    >
                        <CreditCard size={16} />
                        تکمیل اطلاعات بانکی
                    </button>
                </div>
            )}

            {/* درخواست‌های در انتظار */}
            {/* {pendingSettlements && pendingSettlements.length > 0 && (
                <div className="pending-settlements-mini">
                    <h4>درخواست‌های در انتظار</h4>
                    {pendingSettlements.map((s) => (
                        <div key={s.id} className="mini-settlement-item">
                            <div className="mini-icon">
                                <Clock4 size={14} />
                            </div>
                            <div className="mini-content">
                                <span className="mini-amount">
                                    {toPersianNumber(s.amount.toLocaleString())}{" "}
                                    تومان
                                </span>
                                <span className="mini-date">
                                    {formatFullDateTime(s.requested_at)}
                                </span>
                            </div>
                            <span className={`mini-status ${s.status}`}>
                                {s.status_label}
                            </span>
                        </div>
                    ))}
                </div>
            )} */}
        </div>
    );
}
