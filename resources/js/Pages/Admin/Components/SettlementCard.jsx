import { Link } from "@inertiajs/react";
import {
    Eye,
    Play,
    CheckCircle,
    XCircle,
    Ban,
    CreditCard,
    Clock4,
    User,
    Phone,
    Calendar,
    FileText,
    AlertTriangle,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../utils/dateHelpers";

const statusConfig = {
    pending: { icon: Clock4, color: "yellow", label: "در انتظار" },
    processing: { icon: Play, color: "blue", label: "در حال پردازش" },
    completed: { icon: CheckCircle, color: "green", label: "تکمیل شده" },
    failed: { icon: XCircle, color: "red", label: "ناموفق" },
    cancelled: { icon: Ban, color: "gray", label: "لغو شده" },
};

export default function SettlementCard({
    settlement,
    isSelected,
    onSelect,
    onProcess,
    onComplete,
    onReject,
}) {
    const cfg = statusConfig[settlement.status] || statusConfig.pending;
    const Icon = cfg.icon;

    const formatAmount = (value) =>
        toPersianNumber(Number(value || 0).toLocaleString());

    return (
        <div
            className={`settlement-card status-${cfg.color} ${isSelected ? "selected" : ""}`}
        >
            {/* چکباکس برای pending */}
            {settlement.status === "pending" && (
                <div className="settlement-checkbox">
                    <label className="checkbox-wrapper">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={onSelect}
                        />
                        <span className="checkbox-custom" />
                    </label>
                </div>
            )}

            {/* آیکون */}
            <div className={`settlement-icon ${cfg.color}`}>
                <Icon size={22} />
            </div>

            {/* محتوا */}
            <div className="settlement-body">
                {/* هدر */}
                <div className="settlement-header">
                    <div className="settlement-title">
                        <span className="settlement-amount">
                            {formatAmount(settlement.amount)} تومان
                        </span>
                        <span className={`settlement-status ${cfg.color}`}>
                            <Icon size={10} />
                            {cfg.label}
                        </span>
                    </div>
                    <span className="settlement-id">
                        #{toPersianNumber(settlement.id)}
                    </span>
                </div>

                {/* کاربر */}
                {settlement.user && (
                    <div className="settlement-user">
                        {settlement.user.thumbnail && (
                            <img
                                src={settlement.user.thumbnail}
                                alt={settlement.user.name}
                            />
                        )}
                        <div className="user-info">
                            <span className="user-name">
                                <User size={12} />
                                {settlement.user.name}
                            </span>
                            {settlement.user.phone && (
                                <span className="user-phone" dir="ltr">
                                    {toPersianNumber(settlement.user.phone)}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* بانک */}
                {settlement.bank_name && (
                    <div className="settlement-bank">
                        <CreditCard size={12} />
                        <span>{settlement.bank_name}</span>
                        {settlement.card_number && (
                            <>
                                <span className="separator">•</span>
                                <span dir="ltr">
                                    ****{settlement.card_number.slice(-4)}
                                </span>
                            </>
                        )}
                    </div>
                )}

                {/* شماره پیگیری */}
                {settlement.bank_reference && (
                    <div className="settlement-reference">
                        <CheckCircle size={12} />
                        <span>
                            شماره پیگیری:{" "}
                            <strong dir="ltr">
                                {settlement.bank_reference}
                            </strong>
                        </span>
                    </div>
                )}

                {/* دلیل خطا */}
                {settlement.failure_reason && (
                    <div className="settlement-error">
                        <AlertTriangle size={12} />
                        <span>{settlement.failure_reason}</span>
                    </div>
                )}

                {/* تاریخ */}
                <div className="settlement-dates">
                    <div className="date-item">
                        <Calendar size={11} />
                        <span>
                            ثبت: {formatFullDateTime(settlement.created_at)}
                        </span>
                    </div>
                    {settlement.completed_at && (
                        <div className="date-item success">
                            <CheckCircle size={11} />
                            <span>
                                تکمیل:{" "}
                                {formatFullDateTime(settlement.completed_at)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* اکشنها */}
            <div className="settlement-actions">
                <Link
                    href={route(
                        "admin.finance.settlements.show",
                        settlement.id,
                    )}
                    className="action-btn view"
                    title="مشاهده جزئیات"
                >
                    <Eye size={14} />
                </Link>

                {settlement.status === "pending" && (
                    <>
                        <button
                            type="button"
                            className="action-btn process"
                            onClick={onProcess}
                            title="شروع پردازش"
                        >
                            <Play size={14} />
                        </button>
                        <button
                            type="button"
                            className="action-btn reject"
                            onClick={onReject}
                            title="رد"
                        >
                            <XCircle size={14} />
                        </button>
                    </>
                )}

                {settlement.status === "processing" && (
                    <>
                        <button
                            type="button"
                            className="action-btn complete"
                            onClick={onComplete}
                            title="تکمیل"
                        >
                            <CheckCircle size={14} />
                        </button>
                        <button
                            type="button"
                            className="action-btn reject"
                            onClick={onReject}
                            title="رد"
                        >
                            <XCircle size={14} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
