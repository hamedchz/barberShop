import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { toPersianNumber } from "../../../utils/persianNumbers";

const COLORS = {
    commission: "#10b981",
    penalty: "#ef4444",
    deposit: "#3b82f6",
    refund: "#8b5cf6",
    earning: "#f59e0b",
    withdraw: "#f97316",
};

export default function AdminRevenuePie({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="chart-empty">
                <span>دادهای برای نمایش وجود ندارد</span>
            </div>
        );
    }

    const chartData = data.map((item) => ({
        name: item.type_label,
        value: item.total,
        type: item.type,
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            return (
                <div className="chart-tooltip">
                    <span className="tooltip-date">{item.name}</span>
                    <div className="tooltip-value">
                        <span>
                            {toPersianNumber(item.value.toLocaleString())}
                        </span>
                        <span className="currency">تومان</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const total = data.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="revenue-pie-wrapper">
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[entry.type] || "#9ca3af"}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* لیست رنگ‌ها */}
            <div className="pie-legend">
                {data.map((item) => {
                    const percentage =
                        total > 0 ? (item.total / total) * 100 : 0;

                    return (
                        <div key={item.type} className="pie-legend-item">
                            <span
                                className="legend-color"
                                style={{
                                    background: COLORS[item.type] || "#9ca3af",
                                }}
                            />
                            <span className="legend-label">
                                {item.type_label}
                            </span>
                            <span className="legend-percentage">
                                {toPersianNumber(Math.round(percentage))}٪
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
