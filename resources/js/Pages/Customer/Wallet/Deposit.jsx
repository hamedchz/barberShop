import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../../Layouts/Layout";
import {
    Wallet,
    ArrowRight,
    Plus,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock4,
    AlertCircle,
    Sparkles,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../utils/dateHelpers";
import "../../Assets/Customer/Wallet.css";

export default function Deposit({
    wallet,
    deposits,
    quickAmounts,
    minAmount,
    maxAmount,
}) {
    const [amount, setAmount] = useState("");
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = () => {
        const numAmount = Number(amount);

        const clientErrors = {};
        if (!amount || numAmount <= 0) {
            clientErrors.amount = "لطفاً مبلغ شارژ را وارد کنید.";
        } else if (numAmount < minAmount) {
            clientErrors.amount = `حداقل مبلغ شارژ ${toPersianNumber(minAmount.toLocaleString())} تومان است.`;
        } else if (numAmount > maxAmount) {
            clientErrors.amount = `حداکثر مبلغ شارژ ${toPersianNumber(maxAmount.toLocaleString())} تومان است.`;
        }

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setIsLoading(true);
        router.post(
            route("customer.wallet.deposit.initiate"),
            { amount: numAmount },
            {
                onError: (errs) => {
                    setErrors(errs);
                    setIsLoading(false);
                },
                onFinish: () => setIsLoading(false),
            },
        );
    };

    return (
        <Layout>
            <Head title="شارژ کیف پول" />

            <div className="customer-wallet-page">
                {/* ============ هدر ============ */}
                <div className="wallet-header">
                    <div className="wallet-header-content">
                        <div className="wallet-header-icon">
                            <Plus size={28} />
                        </div>
                        <div>
                            <h1>شارژ کیف پول</h1>
                            <p>افزایش موجودی از طریق درگاه پرداخت</p>
                        </div>
                    </div>

                    <div className="wallet-header-actions">
                        <Link
                            href={route("customer.wallet.index")}
                            className="btn-secondary"
                        >
                            <ArrowRight size={16} />
                            بازگشت به کیف پول
                        </Link>
                    </div>
                </div>

                {/* ============ گرید ============ */}
                <div className="deposit-grid">
                    {/* فرم شارژ */}
                    <div className="wallet-card">
                        <div className="wallet-card-header">
                            <div className="card-icon-box green">
                                <Wallet size={20} />
                            </div>
                            <h2>مبلغ شارژ</h2>
                        </div>

                        {/* موجودی فعلی */}
                        <div className="current-balance-box">
                            <span className="balance-label">موجودی فعلی</span>
                            <div className="balance-value">
                                <span>
                                    {toPersianNumber(
                                        wallet.balance.toLocaleString(),
                                    )}
                                </span>
                                <span className="currency">تومان</span>
                            </div>
                        </div>

                        {/* مبالغ سریع */}
                        <div className="quick-amounts-section">
                            <label>مبالغ پیشنهادی:</label>
                            <div className="quick-amounts-grid">
                                {quickAmounts.map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        className={`quick-amount-btn ${
                                            Number(amount) === amt
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setAmount(amt.toString())
                                        }
                                        disabled={isLoading}
                                    >
                                        {toPersianNumber(amt.toLocaleString())}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* input */}
                        <div className="form-group">
                            <label>یا مبلغ دلخواه وارد کنید (تومان)</label>
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
                                placeholder={`مثلاً ${toPersianNumber(minAmount.toLocaleString())}`}
                                min={minAmount}
                                max={maxAmount}
                                disabled={isLoading}
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
                                </div>
                            )}

                            {errors.amount && (
                                <span className="form-error">
                                    <AlertCircle size={12} />
                                    {errors.amount}
                                </span>
                            )}

                            <span className="form-hint">
                                حداقل:{" "}
                                {toPersianNumber(minAmount.toLocaleString())}{" "}
                                تومان • حداکثر:{" "}
                                {toPersianNumber(maxAmount.toLocaleString())}{" "}
                                تومان
                            </span>
                        </div>

                        {/* دکمه پرداخت */}
                        <button
                            type="button"
                            className="btn-primary full-width"
                            onClick={handleSubmit}
                            disabled={isLoading || !amount}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    در حال انتقال به درگاه...
                                </>
                            ) : (
                                <>
                                    <CreditCard size={16} />
                                    پرداخت و شارژ
                                </>
                            )}
                        </button>
                    </div>

                    {/* تاریخچه شارژ */}
                    <div className="wallet-card">
                        <div className="wallet-card-header">
                            <div className="card-icon-box blue">
                                <Clock4 size={20} />
                            </div>
                            <h2>آخرین شارژها</h2>
                        </div>

                        {deposits.length === 0 ? (
                            <div className="empty-state">
                                <span>هنوز شارژی انجام نشده است.</span>
                            </div>
                        ) : (
                            <div className="deposits-list">
                                {deposits.map((d) => {
                                    const statusIcons = {
                                        pending: Clock4,
                                        paid: CheckCircle,
                                        failed: XCircle,
                                        cancelled: XCircle,
                                        expired: XCircle,
                                    };
                                    const Icon =
                                        statusIcons[d.status] || Clock4;

                                    return (
                                        <div
                                            key={d.id}
                                            className={`deposit-item status-${d.status}`}
                                        >
                                            <div
                                                className={`deposit-icon ${d.status}`}
                                            >
                                                <Icon size={16} />
                                            </div>
                                            <div className="deposit-content">
                                                <span className="deposit-amount">
                                                    {toPersianNumber(
                                                        d.amount.toLocaleString(),
                                                    )}{" "}
                                                    تومان
                                                </span>
                                                <span className="deposit-date">
                                                    {formatFullDateTime(
                                                        d.created_at,
                                                    )}
                                                </span>
                                                {d.tracking_code && (
                                                    <span className="deposit-tracking">
                                                        کد پیگیری:{" "}
                                                        {d.tracking_code}
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                className={`deposit-status ${d.status}`}
                                            >
                                                {d.status_label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
