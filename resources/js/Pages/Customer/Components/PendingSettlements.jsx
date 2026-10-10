import { Link } from "@inertiajs/react";
import { Clock4, CheckCircle, XCircle, Eye } from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../utils/dateHelpers";
import "../Assets/PendingSettlement.css";

const statusConfig = {
    pending: { icon: Clock4, color: "yellow", label: "در انتظار" },
    processing: { icon: Clock4, color: "blue", label: "در حال پردازش" },
    completed: { icon: CheckCircle, color: "green", label: "تکمیل شده" },
    failed: { icon: XCircle, color: "red", label: "ناموفق" },
};

export default function PendingSettlements({ settlements }) {
    if (!settlements || settlements.length === 0) return null;

    return (
        <div className="wallet-card settlements-card">
            <div className="wallet-card-header">
                <h2>درخواستهای برداشت</h2>
                <Link
                    href={route("customer.finance.wallet.settlements")}
                    className="card-link"
                >
                    مشاهده همه
                    <Eye size={14} />
                </Link>
            </div>

            <div className="settlements-list">
                {settlements.map((s) => {
                    const cfg = statusConfig[s.status] || statusConfig.pending;
                    const Icon = cfg.icon;

                    return (
                        <div
                            key={s.id}
                            className={`settlement-item status-${cfg.color}`}
                        >
                            <div className={`settlement-icon ${cfg.color}`}>
                                <Icon size={16} />
                            </div>

                            <div className="settlement-content">
                                <div className="settlement-header">
                                    <span className="settlement-amount">
                                        {toPersianNumber(
                                            s.amount.toLocaleString(),
                                        )}{" "}
                                        تومان
                                    </span>
                                    <span
                                        className={`settlement-status ${cfg.color}`}
                                    >
                                        {cfg.label}
                                    </span>
                                </div>
                                <span className="settlement-date">
                                    {formatFullDateTime(
                                        s.requested_at || s.created_at,
                                    )}
                                </span>
                                {s.failure_reason && (
                                    <span className="settlement-failure">
                                        {s.failure_reason}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
