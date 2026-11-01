import React from "react";
import { Link } from "@inertiajs/react";
import { ArrowUpRight, ArrowDownLeft, ArrowLeft, Wallet } from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../../utils/dateHelpers";

export default function RecentTransactions({ transactions }) {
    return (
        <div className="dashboard-card">
            <div className="dashboard-card-header">
                <div className="dashboard-card-header-icon">
                    <Wallet size={20} />
                </div>
                <div className="dashboard-card-header-content">
                    <h3>آخرین تراکنش‌ها</h3>
                    <p>۵ تراکنش آخر کیف پول شما</p>
                </div>
                <Link
                    href={route("customer.finance.wallet.index")}
                    className="dashboard-card-link"
                >
                    مشاهده همه
                    <ArrowLeft size={14} />
                </Link>
            </div>

            {transactions.length > 0 ? (
                <div className="transactions-list">
                    {transactions.map((tx) => (
                        <div
                            key={tx.id}
                            className={`transaction-item ${tx.type}`}
                        >
                            <div className="transaction-icon">
                                {tx.type === "credit" ? (
                                    <ArrowDownLeft size={16} />
                                ) : (
                                    <ArrowUpRight size={16} />
                                )}
                            </div>
                            <div className="transaction-content">
                                <span className="transaction-desc">
                                    {tx.description}
                                </span>
                                <span className="transaction-date">
                                    {formatFullDateTime(tx.created_at)}
                                </span>
                            </div>
                            <div className="transaction-amount">
                                <span className={`amount ${tx.type}`}>
                                    {tx.type === "credit" ? "+" : "−"}
                                    {toPersianNumber(
                                        tx.amount.toLocaleString(),
                                    )}
                                </span>
                                <span className="currency">تومان</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="dashboard-empty-state">
                    <Wallet size={40} />
                    <p>هنوز تراکنشی ندارید</p>
                </div>
            )}
        </div>
    );
}
