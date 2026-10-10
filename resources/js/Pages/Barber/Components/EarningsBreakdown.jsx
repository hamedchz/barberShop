import { toPersianNumber } from "../../../utils/persianNumbers";

const typeColors = {
    earning: "green",
    deposit: "blue",
    refund: "purple",
    compensation: "indigo",
    withdraw: "orange",
    penalty: "red",
    payment: "gray",
    commission: "gray",
};

export default function EarningsBreakdown({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="wallet-card">
                <div className="wallet-card-header">
                    <h2>تفکیک درآمد</h2>
                </div>
                <div className="empty-state">
                    <span>دادهای برای نمایش وجود ندارد.</span>
                </div>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="wallet-card">
            <div className="wallet-card-header">
                <h2>تفکیک درآمد</h2>
                <span className="card-subtitle">
                    مجموع: {toPersianNumber(total.toLocaleString())} تومان
                </span>
            </div>

            <div className="breakdown-list">
                {data.map((item) => {
                    const percentage =
                        total > 0 ? (item.total / total) * 100 : 0;
                    const color = typeColors[item.type] || "gray";

                    return (
                        <div key={item.type} className="breakdown-item">
                            <div className="breakdown-header">
                                <span className="breakdown-label">
                                    {item.type_label}
                                </span>
                                <span className="breakdown-value">
                                    {toPersianNumber(
                                        item.total.toLocaleString(),
                                    )}{" "}
                                    تومان
                                </span>
                            </div>
                            <div className="breakdown-bar-wrapper">
                                <div
                                    className={`breakdown-bar ${color}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <div className="breakdown-meta">
                                <span>
                                    {toPersianNumber(item.count)} تراکنش
                                </span>
                                <span>
                                    {toPersianNumber(Math.round(percentage))}٪
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
