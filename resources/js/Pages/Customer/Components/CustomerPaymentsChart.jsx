// resources/js/Pages/Customer/Wallet/Components/CustomerPaymentsChart.jsx

import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { toJalaali } from "jalaali-js";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function CustomerPaymentsChart({ data }) {
    // تبدیل داده‌ها برای chart
    const chartData = data.map((item) => {
        const d = new Date(item.date);
        const { jy, jm, jd } = toJalaali(
            d.getFullYear(),
            d.getMonth() + 1,
            d.getDate(),
        );

        return {
            date: item.date,
            label: `${jd}/${jm}`,
            fullLabel: toPersianNumber(
                `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`,
            ),
            total: item.total,
        };
    });

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="chart-tooltip">
                    <span className="tooltip-date">{data.fullLabel}</span>
                    <div className="tooltip-value">
                        <span>
                            {toPersianNumber(data.total.toLocaleString())}
                        </span>
                        <span className="currency">تومان</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (chartData.every((d) => d.total === 0)) {
        return (
            <div className="chart-empty">
                <span>در این بازه پرداختی ثبت نشده است.</span>
            </div>
        );
    }

    return (
        <div className="earnings-chart">
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient
                            id="paymentsGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="#3b82f6"
                                stopOpacity={0.4}
                            />
                            <stop
                                offset="100%"
                                stopColor="#3b82f6"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f3f4f6"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) =>
                            value >= 1000000
                                ? `${(value / 1000000).toFixed(1)}M`
                                : value >= 1000
                                  ? `${(value / 1000).toFixed(0)}K`
                                  : value
                        }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fill="url(#paymentsGradient)"
                        dot={{
                            r: 3,
                            fill: "#3b82f6",
                            strokeWidth: 0,
                        }}
                        activeDot={{
                            r: 5,
                            fill: "#3b82f6",
                            stroke: "#fff",
                            strokeWidth: 2,
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
