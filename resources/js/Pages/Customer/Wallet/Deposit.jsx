import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/PublicLayout";
import {
    Plus,
    ArrowRight,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock4,
    AlertCircle,
    Sparkles,
    Shield,
    Zap,
    Wallet,
    Receipt,
    RefreshCw,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../utils/dateHelpers";
import "../Assets//WalletDeposit.css";
import Pagination from "../../Admin/Components/Pagination";

export default function Deposit({
    wallet,
    deposits,
    quickAmounts,
    minAmount,
    maxAmount,
    filters = {},
}) {
    const [amount, setAmount] = useState("");
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState(filters.status || "");

    // ============ اعتبارسنجی ============
    const validate = () => {
        const numAmount = Number(amount);
        const clientErrors = {};

        if (!amount || numAmount <= 0) {
            clientErrors.amount = "لطفاً مبلغ شارژ را وارد کنید.";
        } else if (numAmount < minAmount) {
            clientErrors.amount = `حداقل مبلغ شارژ ${toPersianNumber(
                minAmount.toLocaleString(),
            )} تومان است.`;
        } else if (numAmount > maxAmount) {
            clientErrors.amount = `حداکثر مبلغ شارژ ${toPersianNumber(
                maxAmount.toLocaleString(),
            )} تومان است.`;
        }

        return clientErrors;
    };

    // ============ ارسال ============
    const handleSubmit = () => {
        const clientErrors = validate();
        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        router.post(
            route("customer.finance.deposit.initiate"),
            { amount: Number(amount) },
            {
                onError: (errs) => {
                    setErrors(errs);
                    setIsLoading(false);
                },
                onFinish: () => setIsLoading(false),
            },
        );
    };

    // ============ فیلتر وضعیت ============
    const handleStatusChange = (status) => {
        setStatusFilter(status);
        router.get(
            route("customer.finance.deposit"),
            { status },
            { preserveScroll: true, preserveState: true },
        );
    };

    const formatAmount = (value) =>
        toPersianNumber(Number(value || 0).toLocaleString());

    return (
        <Layout>
            <Head title="شارژ کیف پول" />

            <div className="customer-wallet-page">
                {/* ============ هدر ============ */}
                <div className="wallet-header deposit-header">
                    <div className="wallet-header-content">
                        <div className="wallet-header-icon deposit-icon">
                            <Plus size={28} />
                        </div>
                        <div>
                            <h1>شارژ کیف پول</h1>
                            <p>افزایش موجودی از طریق درگاه پرداخت امن</p>
                        </div>
                    </div>

                    <div className="wallet-header-actions">
                        <Link
                            href={route("customer.finance.wallet.index")}
                            className="btn-secondary"
                        >
                            <Wallet size={16} />
                            کیف پول
                        </Link>
                        <Link
                            href={route("customer.finance.wallet.transactions")}
                            className="btn-secondary"
                        >
                            <RefreshCw size={16} />
                            تراکنش‌ها
                        </Link>
                    </div>
                </div>

                {/* ============ هشدار امنیتی ============ */}
                <div className="security-notice deposit-security">
                    <Shield size={20} />
                    <div>
                        <h3>پرداخت امن</h3>
                        <p>
                            پرداخت‌ها از طریق درگاه بانکی امن انجام می‌شود و
                            اطلاعات کارت شما نزد ما ذخیره نمی‌شود.
                        </p>
                    </div>
                </div>

                {/* ============ گرید ============ */}
                <div className="deposit-grid">
                    {/* ============ فرم شارژ ============ */}
                    <div className="wallet-card deposit-form-card">
                        <div className="wallet-card-header">
                            <div className="card-icon-box green">
                                <Wallet size={20} />
                            </div>
                            <h2>مبلغ شارژ</h2>
                        </div>

                        {/* موجودی فعلی */}
                        <div className="current-balance-box">
                            <span className="balance-label">
                                موجودی فعلی کیف پول
                            </span>
                            <div className="balance-value">
                                <span>{formatAmount(wallet.balance)}</span>
                                <span className="currency">تومان</span>
                            </div>
                        </div>

                        {/* مبالغ سریع */}
                        <div className="quick-amounts-section">
                            <label>
                                <Sparkles size={14} />
                                مبالغ پیشنهادی
                            </label>
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
                                        {formatAmount(amt)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* input مبلغ */}
                        <div className="form-group">
                            <label>
                                یا مبلغ دلخواه وارد کنید (تومان)
                                <span className="required">*</span>
                            </label>
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
                                placeholder={`مثلاً ${formatAmount(minAmount)}`}
                                min={minAmount}
                                max={maxAmount}
                                disabled={isLoading}
                            />

                            {/* نمایش مبلغ */}
                            {amount > 0 && (
                                <div className="amount-display">
                                    <div className="amount-main">
                                        <span className="amount-value">
                                            {formatAmount(amount)}
                                        </span>
                                        <span className="amount-currency">
                                            تومان
                                        </span>
                                    </div>

                                    <div className="amount-meta">
                                        <span className="amount-remaining">
                                            موجودی پس از شارژ:{" "}
                                            {formatAmount(
                                                wallet.balance + Number(amount),
                                            )}{" "}
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
                                حداقل: {formatAmount(minAmount)} تومان • حداکثر:{" "}
                                {formatAmount(maxAmount)} تومان
                            </span>
                        </div>

                        {/* دکمه پرداخت */}
                        <button
                            type="button"
                            className="btn-primary full-width deposit-submit-btn"
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
                                    پرداخت و شارژ کیف پول
                                </>
                            )}
                        </button>

                        {/* مزایا */}
                        <div className="deposit-benefits-list">
                            <div className="benefit-item">
                                <Zap size={14} />
                                <span>شارژ فوری، بدون کارمزد</span>
                            </div>
                            <div className="benefit-item">
                                <Shield size={14} />
                                <span>پرداخت امن از طریق درگاه بانکی</span>
                            </div>
                            <div className="benefit-item">
                                <CheckCircle size={14} />
                                <span>امکان برداشت به حساب بانکی</span>
                            </div>
                        </div>
                    </div>

                    {/* ============ تاریخچه ============ */}
                    <div className="wallet-card deposit-history-card">
                        <div className="wallet-card-header">
                            <div className="card-icon-box blue">
                                <Clock4 size={20} />
                            </div>
                            <h2>تاریخچه شارژها</h2>
                        </div>

                        {/* فیلتر وضعیت */}
                        <div className="status-filters">
                            {[
                                { value: "", label: "همه" },
                                { value: "paid", label: "موفق" },
                                { value: "pending", label: "در انتظار" },
                                { value: "failed", label: "ناموفق" },
                                { value: "expired", label: "منقضی" },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`filter-btn ${
                                        statusFilter === opt.value
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleStatusChange(opt.value)
                                    }
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* لیست */}
                        {deposits.data.length === 0 ? (
                            <div className="empty-state">
                                <Plus size={32} />
                                <span>
                                    {statusFilter
                                        ? "شارژی با این وضعیت یافت نشد."
                                        : "هنوز شارژی انجام نشده است."}
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="deposits-list">
                                    {deposits.data.map((d) => {
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
                                                        {formatAmount(d.amount)}{" "}
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
                                                            <strong dir="ltr">
                                                                {
                                                                    d.tracking_code
                                                                }
                                                            </strong>
                                                        </span>
                                                    )}
                                                    {d.failure_reason && (
                                                        <span className="deposit-failure">
                                                            {d.failure_reason}
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

                                {/* صفحه‌بندی */}
                                <Pagination links={deposits.links} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
