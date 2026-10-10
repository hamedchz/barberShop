import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
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
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

import { formatFullDateTime } from "../../../utils/dateHelpers";

import "../Assets/css/Wallet.css";

import WithdrawModal from "../Components/WithdrawModal";

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
        icon: XCircle,
        color: "gray",
        label: "لغو شده",
        description: "این درخواست لغو شده است.",
    },
};

export default function Settlements({
    settlements,
    wallet,
    bankInfo,
    filters,
}) {
    const [statusFilter, setStatusFilter] = useState(filters?.status || "");

    const handleStatusChange = (status) => {
        setStatusFilter(status);
        router.get(
            route("barber.finance.wallet.settlements"),
            { status },
            { preserveScroll: true, preserveState: true },
        );
    };

    const filterButtons = [
        { value: "", label: "همه" },
        { value: "pending", label: "در انتظار" },
        { value: "processing", label: "در حال پردازش" },
        { value: "completed", label: "تکمیل شده" },
        { value: "failed", label: "ناموفق" },
    ];

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

    return (
        <Layout>
            <Head title="تسویه‌ها" />

            <div className="barber-wallet-page">
                {/* ============ هدر ============ */}
                <div className="wallet-header">
                    <div className="wallet-header-content">
                        <div className="wallet-header-icon">
                            <CreditCard size={28} />
                        </div>
                        <div>
                            <h1>تسویه‌ها</h1>
                            <p>تاریخچه درخواست‌های برداشت</p>
                        </div>
                    </div>

                    <div className="wallet-header-actions">
                        <Link
                            href={route("barber.finance.wallet.index")}
                            className="btn-secondary"
                        >
                            <Wallet size={16} />
                            کیف پول
                        </Link>
                    </div>
                </div>

                {/* ============ فیلتر وضعیت ============ */}
                <div className="settlement-filters">
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

                {/* ============ لیست تسویهها ============ */}
                <div className="wallet-card">
                    {settlements.data.length === 0 ? (
                        <div className="empty-state-large">
                            <CreditCard size={48} />
                            <p>تسویه‌ای یافت نشد.</p>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={openWithdrawModal}
                            >
                                <ArrowUpRight size={16} />
                                درخواست برداشت جدید
                            </button>
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

                                                {/* تاریخها */}
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

                            {/* صفحهبندی */}
                            {settlements.links &&
                                settlements.links.length > 3 && (
                                    <div className="pagination">
                                        {settlements.links.map((link, idx) => {
                                            if (!link.url) {
                                                return (
                                                    <span
                                                        key={idx}
                                                        className="pagination-item disabled"
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                );
                                            }

                                            return (
                                                <Link
                                                    key={idx}
                                                    href={link.url}
                                                    className={`pagination-item ${
                                                        link.active
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    preserveScroll
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                        </>
                    )}
                </div>
            </div>

            {withdrawModal.isOpen && (
                <WithdrawModal
                    wallet={wallet}
                    bankInfo={bankInfo}
                    onClose={() =>
                        setWithdrawModal({ ...withdrawModal, isOpen: false })
                    }
                />
            )}
        </Layout>
    );
}
