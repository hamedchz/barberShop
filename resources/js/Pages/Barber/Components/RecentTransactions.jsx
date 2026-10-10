import { Link } from "@inertiajs/react";
import { ArrowUpRight, ArrowDownRight, Lock, Eye } from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatJalaliDate } from "../../../utils/dateHelpers";

export default function RecentTransactions({ transactions }) {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="wallet-card">
                <div className="wallet-card-header">
                    <h2>آخرین تراکنشها</h2>
                </div>
                <div className="empty-state">
                    <span>تراکنشی ثبت نشده است.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="wallet-card">
            <div className="wallet-card-header">
                <h2>آخرین تراکنشها</h2>
                <Link
                    href={route("barber.finance.wallet.transactions")}
                    className="card-link"
                >
                    مشاهده همه
                    <Eye size={14} />
                </Link>
            </div>

            <div className="transactions-list">
                {transactions.map((t) => {
                    const isCredit = t.direction === "credit";

                    return (
                        <div key={t.id} className="transaction-item">
                            <div
                                className={`transaction-icon ${isCredit ? "credit" : "debit"}`}
                            >
                                {isCredit ? (
                                    <ArrowDownRight size={16} />
                                ) : (
                                    <ArrowUpRight size={16} />
                                )}
                            </div>

                            <div className="transaction-content">
                                <div className="transaction-title">
                                    <span>{t.type_label}</span>
                                    {t.is_locked && (
                                        <span className="lock-badge">
                                            <Lock size={10} />
                                            قفل شده
                                        </span>
                                    )}
                                </div>
                                <span className="transaction-desc">
                                    {t.description}
                                </span>
                            </div>

                            <div className="transaction-amount">
                                <span
                                    className={`amount-value ${isCredit ? "credit" : "debit"}`}
                                >
                                    {isCredit ? "+" : "-"}
                                    {toPersianNumber(t.amount.toLocaleString())}
                                </span>
                                <span className="amount-date">
                                    {formatJalaliDate(t.created_at)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
