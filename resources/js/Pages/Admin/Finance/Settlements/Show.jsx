import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../../Layouts/Layout";
import {
    ArrowRight,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock4,
    Play,
    Ban,
    User,
    Phone,
    Mail,
    Calendar,
    Hash,
    Wallet,
    AlertTriangle,
    FileText,
    Copy,
    Check,
    Printer,
    TrendingUp,
    DollarSign,
    Shield,
    Info,
    Banknote,
    Building2,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../../utils/dateHelpers";
import ProcessModal from "../../Components/ProcessModal";
import CompleteModal from "../../Components/CompleteModal";
import RejectModal from "../../Components/RejectModal";
import "../../Assets/css/SettlementsAdmin.css";
import "../../Assets/css/SettlementShowAdmin.css";

const statusConfig = {
    pending: {
        icon: Clock4,
        color: "yellow",
        label: "در انتظار بررسی",
        description: "این درخواست در انتظار بررسی ادمین است.",
    },
    processing: {
        icon: Play,
        color: "blue",
        label: "در حال پردازش",
        description: "این درخواست در حال پردازش است.",
    },
    completed: {
        icon: CheckCircle,
        color: "green",
        label: "تکمیل شده",
        description: "مبلغ با موفقیت به حساب بانکی کاربر واریز شد.",
    },
    failed: {
        icon: XCircle,
        color: "red",
        label: "ناموفق",
        description: "این درخواست رد شده است.",
    },
    cancelled: {
        icon: Ban,
        color: "gray",
        label: "لغو شده",
        description: "این درخواست لغو شده است.",
    },
};

export default function SettlementShow({
    settlement,
    user,
    wallet,
    userStats,
}) {
    const [copied, setCopied] = useState(null);
    const [processModal, setProcessModal] = useState({ isOpen: false });
    const [completeModal, setCompleteModal] = useState({ isOpen: false });
    const [rejectModal, setRejectModal] = useState({ isOpen: false });

    const cfg = statusConfig[settlement.status] || statusConfig.pending;
    const StatusIcon = cfg.icon;

    const formatAmount = (value) =>
        toPersianNumber(Number(value || 0).toLocaleString());

    // ============ کپی ============
    const handleCopy = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    // ============ چاپ ============
    const handlePrint = () => window.print();

    // ============ اقدامات ============
    const canProcess = settlement.status === "pending";
    const canComplete = ["pending", "processing"].includes(settlement.status);
    const canReject = ["pending", "processing"].includes(settlement.status);

    return (
        <Layout>
            <Head title={`تسویه #${settlement.id}`} />

            <div className="admin-settlement-show-page">
                {/* ============ هدر بازگشت ============ */}

                <div className="page-header-with-back">
                    <Link
                        href={route("admin.finance.settlements.index")}
                        className="back-btn"
                    >
                        <ArrowRight size={20} />
                        <span> لیست تسویه ها</span>
                    </Link>

                    {/* <div className="header-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handlePrint}
                        >
                            <Printer size={16} />
                            چاپ
                        </button>
                    </div> */}
                </div>

                {/* ============ هدر اصلی ============ */}
                <div className={`settlement-detail-header status-${cfg.color}`}>
                    <div
                        className={`settlement-detail-icon status-${cfg.color}`}
                    >
                        <StatusIcon size={32} />
                    </div>

                    <div className="settlement-detail-header-content">
                        <div className="settlement-detail-header-top">
                            <span
                                className={`settlement-status-badge status-${cfg.color}`}
                            >
                                <StatusIcon size={14} />
                                {cfg.label}
                            </span>

                            <span className="settlement-detail-code">
                                تسویه #{toPersianNumber(settlement.id)}
                            </span>

                            <span className="settlement-type-badge">
                                {settlement.type === "barber_payout"
                                    ? "واریز به آرایشگر"
                                    : "بازگشت به مشتری"}
                            </span>
                        </div>

                        <h1 className="settlement-detail-title">
                            {formatAmount(settlement.amount)}{" "}
                            <span className="currency">تومان</span>
                        </h1>

                        <p className="settlement-detail-subtitle">
                            {cfg.description}
                        </p>
                    </div>

                    {/* عملیات */}
                    <div className="settlement-detail-header-actions">
                        {canProcess && (
                            <button
                                type="button"
                                className="btn-warning"
                                onClick={() =>
                                    setProcessModal({ isOpen: true })
                                }
                            >
                                <Play size={16} />
                                شروع پردازش
                            </button>
                        )}

                        {canComplete && (
                            <button
                                type="button"
                                className="btn-success"
                                onClick={() =>
                                    setCompleteModal({ isOpen: true })
                                }
                            >
                                <CheckCircle size={16} />
                                تکمیل
                            </button>
                        )}

                        {canReject && (
                            <button
                                type="button"
                                className="btn-danger"
                                onClick={() => setRejectModal({ isOpen: true })}
                            >
                                <XCircle size={16} />
                                رد
                            </button>
                        )}
                    </div>
                </div>

                {/* ============ گرید اصلی ============ */}
                <div className="settlement-detail-grid">
                    {/* ============ ستون راست ============ */}
                    <div className="settlement-detail-main">
                        {/* اطلاعات مالی */}
                        <div className="settlement-detail-card">
                            <div className="card-header">
                                <div className="card-icon-box green">
                                    <Banknote size={20} />
                                </div>
                                <h2 className="card-title">اطلاعات مالی</h2>
                            </div>

                            <div className="financial-detail-grid">
                                <div className="financial-detail-item">
                                    <span className="detail-label">
                                        مبلغ درخواستی
                                    </span>
                                    <span className="detail-value primary">
                                        {formatAmount(settlement.amount)}{" "}
                                        <span className="currency">تومان</span>
                                    </span>
                                </div>

                                <div className="financial-detail-item">
                                    <span className="detail-label">
                                        نوع تسویه
                                    </span>
                                    <span className="detail-value">
                                        {settlement.type_label}
                                    </span>
                                </div>

                                {settlement.paid_amount > 0 && (
                                    <div className="financial-detail-item">
                                        <span className="detail-label">
                                            مبلغ پرداخت شده
                                        </span>
                                        <span className="detail-value success">
                                            {formatAmount(
                                                settlement.paid_amount,
                                            )}{" "}
                                            <span className="currency">
                                                تومان
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* اطلاعات بانکی */}
                        <div className="settlement-detail-card">
                            <div className="card-header">
                                <div className="card-icon-box blue">
                                    <CreditCard size={20} />
                                </div>
                                <h2 className="card-title">اطلاعات بانکی</h2>
                            </div>

                            <div className="bank-details-list">
                                {/* نام بانک */}
                                {settlement.bank_name && (
                                    <div className="bank-detail-item">
                                        <div className="detail-icon">
                                            <Building2 size={14} />
                                        </div>
                                        <span className="detail-label">
                                            نام بانک
                                        </span>
                                        <span className="detail-value">
                                            {settlement.bank_name}
                                        </span>
                                    </div>
                                )}

                                {/* نام صاحب حساب */}
                                {settlement.account_holder_name && (
                                    <div className="bank-detail-item">
                                        <div className="detail-icon">
                                            <User size={14} />
                                        </div>
                                        <span className="detail-label">
                                            نام صاحب حساب
                                        </span>
                                        <span className="detail-value">
                                            {settlement.account_holder_name}
                                        </span>
                                    </div>
                                )}

                                {/* شماره کارت */}
                                {settlement.card_number && (
                                    <div className="bank-detail-item copyable">
                                        <div className="detail-icon">
                                            <CreditCard size={14} />
                                        </div>
                                        <span className="detail-label">
                                            شماره کارت
                                        </span>
                                        <span
                                            className="detail-value mono"
                                            dir="ltr"
                                        >
                                            {settlement.card_number.replace(
                                                /(.{4})/g,
                                                "$1 ",
                                            )}
                                        </span>
                                        <button
                                            type="button"
                                            className="copy-btn"
                                            onClick={() =>
                                                handleCopy(
                                                    settlement.card_number,
                                                    "card",
                                                )
                                            }
                                            title="کپی"
                                        >
                                            {copied === "card" ? (
                                                <Check size={14} />
                                            ) : (
                                                <Copy size={14} />
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* شماره شبا */}
                                {settlement.sheba_number && (
                                    <div className="bank-detail-item copyable">
                                        <div className="detail-icon">
                                            <Hash size={14} />
                                        </div>
                                        <span className="detail-label">
                                            شماره شبا
                                        </span>
                                        <span
                                            className="detail-value mono"
                                            dir="ltr"
                                        >
                                            IR{settlement.sheba_number}
                                        </span>
                                        <button
                                            type="button"
                                            className="copy-btn"
                                            onClick={() =>
                                                handleCopy(
                                                    `IR${settlement.sheba_number}`,
                                                    "sheba",
                                                )
                                            }
                                            title="کپی"
                                        >
                                            {copied === "sheba" ? (
                                                <Check size={14} />
                                            ) : (
                                                <Copy size={14} />
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* شماره حساب */}
                                {settlement.account_number && (
                                    <div className="bank-detail-item copyable">
                                        <div className="detail-icon">
                                            <FileText size={14} />
                                        </div>
                                        <span className="detail-label">
                                            شماره حساب
                                        </span>
                                        <span
                                            className="detail-value mono"
                                            dir="ltr"
                                        >
                                            {settlement.account_number}
                                        </span>
                                        <button
                                            type="button"
                                            className="copy-btn"
                                            onClick={() =>
                                                handleCopy(
                                                    settlement.account_number,
                                                    "account",
                                                )
                                            }
                                            title="کپی"
                                        >
                                            {copied === "account" ? (
                                                <Check size={14} />
                                            ) : (
                                                <Copy size={14} />
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* شماره پیگیری */}
                                {settlement.bank_reference && (
                                    <div className="bank-detail-item reference">
                                        <div className="detail-icon success">
                                            <CheckCircle size={14} />
                                        </div>
                                        <span className="detail-label">
                                            شماره پیگیری بانکی
                                        </span>
                                        <span
                                            className="detail-value mono success"
                                            dir="ltr"
                                        >
                                            {settlement.bank_reference}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* دلیل خطا */}
                        {settlement.failure_reason && (
                            <div className="settlement-detail-card danger-card">
                                <div className="card-header">
                                    <div className="card-icon-box red">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <h2 className="card-title">
                                        دلیل رد تسویه
                                    </h2>
                                </div>
                                <div className="error-box">
                                    <p>{settlement.failure_reason}</p>
                                </div>
                            </div>
                        )}

                        {/* یادداشت ادمین */}
                        {settlement.notes && (
                            <div className="settlement-detail-card">
                                <div className="card-header">
                                    <div className="card-icon-box gray">
                                        <FileText size={20} />
                                    </div>
                                    <h2 className="card-title">
                                        یادداشت ادمین
                                    </h2>
                                </div>
                                <div className="notes-box">
                                    <p>{settlement.notes}</p>
                                </div>
                            </div>
                        )}

                        {/* تراکنش‌های کیف پول */}
                        {settlement.wallet_transactions &&
                            settlement.wallet_transactions.length > 0 && (
                                <div className="settlement-detail-card">
                                    <div className="card-header">
                                        <div className="card-icon-box purple">
                                            <Wallet size={20} />
                                        </div>
                                        <h2 className="card-title">
                                            تراکنش‌های مرتبط
                                        </h2>
                                    </div>

                                    <div className="transactions-mini-list">
                                        {settlement.wallet_transactions.map(
                                            (t) => (
                                                <div
                                                    key={t.id}
                                                    className="transaction-mini-item"
                                                >
                                                    <div className="mini-icon">
                                                        <DollarSign size={14} />
                                                    </div>
                                                    <div className="mini-content">
                                                        <span className="mini-type">
                                                            {t.type_label}
                                                        </span>
                                                        <span className="mini-desc">
                                                            {t.description}
                                                        </span>
                                                    </div>
                                                    <div className="mini-amount">
                                                        <span className="amount">
                                                            {formatAmount(
                                                                t.amount,
                                                            )}
                                                        </span>
                                                        <span className="date">
                                                            {formatFullDateTime(
                                                                t.created_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* ============ ستون چپ ============ */}
                    <div className="settlement-detail-sidebar">
                        {/* اطلاعات کاربر */}
                        {user && (
                            <div className="settlement-detail-card">
                                <div className="card-header">
                                    <div className="card-icon-box blue">
                                        <User size={20} />
                                    </div>
                                    <h2 className="card-title">
                                        اطلاعات کاربر
                                    </h2>
                                </div>

                                <div className="user-profile-card">
                                    <div className="user-profile-avatar">
                                        {user.thumbnail ? (
                                            <img
                                                src={user.thumbnail}
                                                alt={user.name}
                                            />
                                        ) : (
                                            <span>
                                                {user.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="user-profile-info">
                                        <h3>{user.name}</h3>
                                        {user.phone && (
                                            <a
                                                href={`tel:${user.phone}`}
                                                className="contact-item"
                                                dir="ltr"
                                            >
                                                <Phone size={12} />
                                                {toPersianNumber(user.phone)}
                                            </a>
                                        )}
                                        {user.email && (
                                            <span
                                                className="contact-item"
                                                dir="ltr"
                                            >
                                                <Mail size={12} />
                                                {user.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* آمار کاربر */}
                        {userStats && (
                            <div className="settlement-detail-card">
                                <div className="card-header">
                                    <div className="card-icon-box purple">
                                        <TrendingUp size={20} />
                                    </div>
                                    <h2 className="card-title">
                                        آمار تسویه کاربر
                                    </h2>
                                </div>

                                <div className="user-stats-list">
                                    <div className="stat-item">
                                        <span className="stat-label">
                                            تسویه‌های موفق
                                        </span>
                                        <span className="stat-value success">
                                            {toPersianNumber(
                                                userStats.total_settlements,
                                            )}{" "}
                                            مورد
                                        </span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">
                                            مجموع پرداختی
                                        </span>
                                        <span className="stat-value">
                                            {formatAmount(userStats.total_paid)}{" "}
                                            تومان
                                        </span>
                                    </div>
                                    {userStats.pending_settlements > 0 && (
                                        <div className="stat-item">
                                            <span className="stat-label">
                                                در انتظار
                                            </span>
                                            <span className="stat-value warning">
                                                {toPersianNumber(
                                                    userStats.pending_settlements,
                                                )}{" "}
                                                مورد
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* کیف پول کاربر */}
                        {wallet && (
                            <div className="settlement-detail-card wallet-card">
                                <div className="card-header">
                                    <div className="card-icon-box green">
                                        <Wallet size={20} />
                                    </div>
                                    <h2 className="card-title">
                                        کیف پول کاربر
                                    </h2>
                                </div>

                                <div className="wallet-summary">
                                    <div className="wallet-row">
                                        <span className="wallet-label">
                                            موجودی فعلی
                                        </span>
                                        <span className="wallet-value">
                                            {formatAmount(wallet.balance)} تومان
                                        </span>
                                    </div>
                                    {wallet.locked_balance > 0 && (
                                        <div className="wallet-row">
                                            <span className="wallet-label">
                                                مبلغ قفل‌شده
                                            </span>
                                            <span className="wallet-value warning">
                                                {formatAmount(
                                                    wallet.locked_balance,
                                                )}{" "}
                                                تومان
                                            </span>
                                        </div>
                                    )}
                                    <div className="wallet-row total">
                                        <span className="wallet-label">
                                            قابل برداشت
                                        </span>
                                        <span className="wallet-value success">
                                            {formatAmount(wallet.available)}{" "}
                                            تومان
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* تاریخ‌ها */}
                        <div className="settlement-detail-card">
                            <div className="card-header">
                                <div className="card-icon-box gray">
                                    <Calendar size={20} />
                                </div>
                                <h2 className="card-title">تاریخ‌ها</h2>
                            </div>

                            <div className="timeline">
                                <div className="timeline-item">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <span className="timeline-label">
                                            ثبت درخواست
                                        </span>
                                        <span className="timeline-date">
                                            {formatFullDateTime(
                                                settlement.created_at,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {settlement.processed_at && (
                                    <div className="timeline-item">
                                        <div className="timeline-dot info"></div>
                                        <div className="timeline-content">
                                            <span className="timeline-label">
                                                شروع پردازش
                                            </span>
                                            <span className="timeline-date">
                                                {formatFullDateTime(
                                                    settlement.processed_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {settlement.completed_at && (
                                    <div className="timeline-item">
                                        <div className="timeline-dot success"></div>
                                        <div className="timeline-content">
                                            <span className="timeline-label">
                                                تکمیل
                                            </span>
                                            <span className="timeline-date">
                                                {formatFullDateTime(
                                                    settlement.completed_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {settlement.failed_at && (
                                    <div className="timeline-item">
                                        <div className="timeline-dot danger"></div>
                                        <div className="timeline-content">
                                            <span className="timeline-label">
                                                رد شده
                                            </span>
                                            <span className="timeline-date">
                                                {formatFullDateTime(
                                                    settlement.failed_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {settlement.requested_by && (
                                    <div className="timeline-item">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                            <span className="timeline-label">
                                                درخواست توسط
                                            </span>
                                            <span className="timeline-date">
                                                {settlement.requested_by.name}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {settlement.processed_by && (
                                    <div className="timeline-item">
                                        <div className="timeline-dot info"></div>
                                        <div className="timeline-content">
                                            <span className="timeline-label">
                                                پردازش توسط
                                            </span>
                                            <span className="timeline-date">
                                                {settlement.processed_by.name}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============ مودال‌ها ============ */}
            <ProcessModal
                isOpen={processModal.isOpen}
                settlement={settlement}
                onClose={() => setProcessModal({ isOpen: false })}
            />

            <CompleteModal
                isOpen={completeModal.isOpen}
                settlement={settlement}
                onClose={() => setCompleteModal({ isOpen: false })}
            />

            <RejectModal
                isOpen={rejectModal.isOpen}
                settlement={settlement}
                onClose={() => setRejectModal({ isOpen: false })}
            />
        </Layout>
    );
}
