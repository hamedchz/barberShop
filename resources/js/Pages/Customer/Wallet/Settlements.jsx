import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/PublicLayout";
import {
    CreditCard,
    Clock4,
    CheckCircle,
    XCircle,
    Wallet,
    ArrowUpRight,
    Search,
    Eye,
    Calendar,
    AlertTriangle,
    Ban,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../utils/dateHelpers";
import "../Assets/Settlements.css";
import Pagination from "../../Admin/Components/Pagination";
import WithdrawModal from "../../Barber/Components/WithdrawModal";

const statusConfig = {
    pending: {
        icon: Clock4,
        color: "yellow",
        label: "در انتظار بررسی",
        description: "درخواست شما ثبت شده و در انتظار بررسی ادمین است.",
    },
    processing: {
        icon: Clock4,
        color: "blue",
        label: "در حال پردازش",
        description: "ادمین در حال پردازش درخواست شماست.",
    },
    completed: {
        icon: CheckCircle,
        color: "green",
        label: "تکمیل شده",
        description: "مبلغ به حساب بانکی شما واریز شد.",
    },
    failed: {
        icon: XCircle,
        color: "red",
        label: "ناموفق",
        description: "متأسفانه واریز انجام نشد.",
    },
    cancelled: {
        icon: Ban,
        color: "gray",
        label: "لغو شده",
        description: "این درخواست لغو شده است.",
    },
};

const filterButtons = [
    { value: "", label: "همه" },
    { value: "pending", label: "در انتظار" },
    { value: "processing", label: "در حال پردازش" },
    { value: "completed", label: "تکمیل شده" },
    { value: "failed", label: "ناموفق" },
    { value: "cancelled", label: "لغو شده" },
];

export default function Settlements({
    settlements,
    filters = {},
    wallet = {},
    bankInfo = {},
    has_active_settlement,
}) {
    const [statusFilter, setStatusFilter] = useState(filters.status || "");

    const handleStatusChange = (status) => {
        setStatusFilter(status);
        router.get(
            route("customer.finance.wallet.settlements"),
            { status },
            { preserveScroll: true, preserveState: true },
        );
    };

    const hasBankInfo = bankInfo?.has_bank_info === true;
    const availableBalance = wallet?.available || 0;
    const [withdrawModal, setWithdrawModal] = useState({
        isOpen: false,
        amount: "",
        isLoading: false,
        errors: {},
    });

    const openWithdrawModal = () => {
        setWithdrawModal({
            isOpen: true,
            amount: "",
            isLoading: false,
            errors: {},
        });
    };

    const activeSettlement =
        settlements.data.find(
            (s) => s.status === "pending" || s.status === "processing",
        ) || null;
    return (
        <Layout>
            <Head title="تسویه‌ها" />

            <div className="customer-wallet-page">
                {/* ============ هدر ============ */}
                <div className="wallet-header">
                    <div className="wallet-header-content">
                        <div className="wallet-header-icon">
                            <CreditCard size={28} />
                        </div>
                        <div>
                            <h1>تسویه‌ها</h1>
                            <p>تاریخچه درخواست‌های برداشت شما</p>
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

                        {!has_active_settlement && (
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={openWithdrawModal}
                            >
                                <ArrowUpRight size={16} />
                                درخواست برداشت جدید
                            </button>
                        )}
                    </div>
                </div>

                {/* ============ هشدار نداشتن اطلاعات بانکی ============ */}
                {!hasBankInfo && (
                    <div className="no-bank-info-banner">
                        <AlertTriangle size={20} />
                        <div className="banner-content">
                            <h3>اطلاعات بانکی تکمیل نشده است</h3>
                            <p>
                                برای ثبت درخواست برداشت، ابتدا اطلاعات بانکی خود
                                را تکمیل کنید.
                            </p>
                        </div>
                        <Link
                            href={route("customer.finance.profile.bank-info")}
                            className="btn-primary"
                        >
                            <CreditCard size={16} />
                            تکمیل اطلاعات بانکی
                        </Link>
                    </div>
                )}

                {/* ============ فیلتر وضعیت ============ */}
                <div className="status-filters">
                    {filterButtons.map((btn) => (
                        <button
                            key={btn.value}
                            type="button"
                            className={`filter-btn ${
                                statusFilter === btn.value ? "active" : ""
                            }`}
                            onClick={() => handleStatusChange(btn.value)}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                {/* ============ کارت درخواست فعال ============ */}
                {activeSettlement && (
                    <div
                        className={`active-settlement-card status-${activeSettlement.status}`}
                    >
                        <div className="active-settlement-content">
                            <div className="active-settlement-header">
                                <span className="active-settlement-title">
                                    توجه:
                                </span>
                                <span style={{ fontSize: "12px" }}>
                                    در حال حاضر، یک درخواست تأییدنشده دارید. تا
                                    زمان تعیین تکلیف درخواست جاری و تأیید یا رد
                                    آن، امکان ثبت درخواست جدید برای شما وجود
                                    نخواهد داشت.{" "}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============ لیست تسویه‌ها ============ */}
                <div className="wallet-card">
                    {settlements.data.length === 0 ? (
                        <div className="empty-state-large">
                            <CreditCard size={48} />
                            <p>
                                {statusFilter
                                    ? "تسویه‌ای با این وضعیت یافت نشد."
                                    : "هنوز تسویه‌ای ثبت نشده است."}
                            </p>

                            {!has_active_settlement && (
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={openWithdrawModal}
                                >
                                    <ArrowUpRight size={16} />
                                    درخواست برداشت جدید
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="settlements-list-detailed">
                                {settlements.data.map((s) => {
                                    const cfg =
                                        statusConfig[s.status] ||
                                        statusConfig.pending;
                                    const Icon = cfg.icon;

                                    return (
                                        <div
                                            key={s.id}
                                            className={`settlement-card status-${cfg.color}`}
                                        >
                                            <div
                                                className={`settlement-card-icon ${cfg.color}`}
                                            >
                                                <Icon size={20} />
                                            </div>

                                            <div className="settlement-card-body">
                                                <div className="settlement-card-header">
                                                    <div className="settlement-card-title">
                                                        <span className="settlement-card-amount">
                                                            {toPersianNumber(
                                                                s.amount.toLocaleString(),
                                                            )}{" "}
                                                            تومان
                                                        </span>
                                                        <span
                                                            className={`settlement-card-status ${cfg.color}`}
                                                        >
                                                            <Icon size={10} />
                                                            {cfg.label}
                                                        </span>
                                                    </div>

                                                    <span className="settlement-card-id">
                                                        #{toPersianNumber(s.id)}
                                                    </span>
                                                </div>

                                                <p className="settlement-card-desc">
                                                    {cfg.description}
                                                </p>

                                                {/* اطلاعات بانکی */}
                                                {s.bank_name && (
                                                    <div className="settlement-card-bank">
                                                        <CreditCard size={12} />
                                                        <span>
                                                            {s.bank_name}
                                                        </span>
                                                        {s.card_number && (
                                                            <>
                                                                <span className="separator">
                                                                    •
                                                                </span>
                                                                <span dir="ltr">
                                                                    ****
                                                                    {s.card_number.slice(
                                                                        -4,
                                                                    )}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {/* شماره پیگیری */}
                                                {s.bank_reference && (
                                                    <div className="settlement-card-reference">
                                                        <CheckCircle
                                                            size={12}
                                                        />
                                                        <span>
                                                            شماره پیگیری:{" "}
                                                            <strong dir="ltr">
                                                                {
                                                                    s.bank_reference
                                                                }
                                                            </strong>
                                                        </span>
                                                    </div>
                                                )}

                                                {/* دلیل خطا */}
                                                {s.failure_reason && (
                                                    <div className="settlement-card-error">
                                                        <AlertTriangle
                                                            size={12}
                                                        />
                                                        <span>
                                                            {s.failure_reason}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* تاریخ‌ها */}
                                                <div className="settlement-card-dates">
                                                    {s.requested_at && (
                                                        <div className="date-item">
                                                            <Calendar
                                                                size={11}
                                                            />
                                                            <span>
                                                                درخواست:{" "}
                                                                {formatFullDateTime(
                                                                    s.requested_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {s.processed_at && (
                                                        <div className="date-item info">
                                                            <Clock4 size={11} />
                                                            <span>
                                                                شروع پردازش:{" "}
                                                                {formatFullDateTime(
                                                                    s.processed_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {s.completed_at && (
                                                        <div className="date-item success">
                                                            <CheckCircle
                                                                size={11}
                                                            />
                                                            <span>
                                                                تکمیل:{" "}
                                                                {formatFullDateTime(
                                                                    s.completed_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {s.failed_at && (
                                                        <div className="date-item danger">
                                                            <XCircle
                                                                size={11}
                                                            />
                                                            <span>
                                                                ناموفق:{" "}
                                                                {formatFullDateTime(
                                                                    s.failed_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ============ صفحه‌بندی ============ */}
                            <Pagination links={settlements.links} />
                        </>
                    )}
                </div>
            </div>

            {withdrawModal.isOpen && (
                <WithdrawModal
                    wallet={wallet}
                    bankInfo={bankInfo}
                    routeName={route("customer.finance.wallet.withdraw")}
                    bankInfoRoute={route("customer.finance.profile.bank-info")}
                    onClose={() => setWithdrawModal(false)}
                />
            )}
        </Layout>
    );
}
