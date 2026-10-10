import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    CreditCard,
    AlertTriangle,
    ArrowUpRight,
    Wallet,
    Clock4,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import "../Assets/css/WithDrawSection.css";
export default function WithdrawSection({
    wallet,
    bankInfo,
    pendingSettlements,
}) {
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const available = wallet.balance - wallet.locked_balance;
    const minAmount = 10000;
    const hasActiveSettlement =
        pendingSettlements && pendingSettlements.length > 0;
    const handleSubmit = () => {
        if (!bankInfo.has_bank_info) {
            router.visit(route("barber.finance.wallet.bank-info"));
            return;
        }

        const numAmount = Number(amount);
        const clientErrors = {};

        if (!amount || numAmount <= 0) {
            clientErrors.amount = "لطفاً مبلغ را وارد کنید.";
        } else if (numAmount < minAmount) {
            clientErrors.amount = `حداقل مبلغ برداشت ${toPersianNumber(minAmount.toLocaleString())} تومان است.`;
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
            route("barber.finance.wallet.withdraw"),
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
            <div className="withdraw-balance">
                <span className="balance-label">موجودی قابل برداشت</span>
                <div className="balance-value">
                    <span>{toPersianNumber(available.toLocaleString())}</span>
                    <span className="currency">تومان</span>
                </div>
            </div>

            {/* هشدار */}
            {wallet.locked_balance > 0 && (
                <div className="withdraw-warning">
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
                <div className="no-bank-info">
                    <CreditCard size={32} />
                    <p>برای برداشت، ابتدا اطلاعات بانکی خود را تکمیل کنید.</p>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() =>
                            router.visit(
                                route("barber.finance.wallet.bank-info"),
                            )
                        }
                    >
                        <CreditCard size={16} />
                        تکمیل اطلاعات بانکی
                    </button>
                </div>
            ) : (
                <>
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
                    {!hasActiveSettlement && (
                        <>
                            <div className="form-group">
                                <label>مبلغ برداشت (تومان)</label>
                                <input
                                    type="number"
                                    className={`form-input ${errors.amount ? "error" : ""}`}
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        setErrors({
                                            ...errors,
                                            amount: undefined,
                                        });
                                    }}
                                    placeholder={`حداقل ${toPersianNumber(minAmount.toLocaleString())}`}
                                    min={minAmount}
                                    max={available}
                                    disabled={isLoading}
                                />

                                {/* ✅ نمایش مبلغ + درصد + باقیمانده */}

                                {amount > 0 && (
                                    <div
                                        className={`amount-display ${
                                            Number(amount) > available
                                                ? "exceeds"
                                                : ""
                                        }`}
                                    >
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

                                        {Number(amount) > available ? (
                                            <div className="amount-error-note">
                                                <AlertCircle size={11} />
                                                <span>
                                                    مبلغ وارد شده بیشتر از
                                                    موجودی است.
                                                </span>
                                            </div>
                                        ) : (
                                            available > 0 && (
                                                <div className="amount-meta">
                                                    <span className="amount-percentage">
                                                        {toPersianNumber(
                                                            Math.round(
                                                                (Number(
                                                                    amount,
                                                                ) /
                                                                    available) *
                                                                    100,
                                                            ),
                                                        )}
                                                        ٪ از موجودی
                                                    </span>
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
                                                </div>
                                            )
                                        )}
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
                                className="btn-confirm full-width"
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
                                        ثبت درخواست برداشت
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
