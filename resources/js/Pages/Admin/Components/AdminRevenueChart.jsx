import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { toJalaali } from "jalaali-js";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function AdminRevenueChart({
    revenue,
    deposits,
    settlements,
    showOnlyRevenue = false,
}) {
    // ادغام دادهها
    const chartData = revenue.map((item, idx) => {
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
            revenue: item.total,
            deposits: deposits[idx]?.total || 0,
            settlements: settlements[idx]?.total || 0,
        };
    });

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="chart-tooltip">
                    <span className="tooltip-date">{data.fullLabel}</span>
                    <div className="tooltip-row revenue">
                        <span>درآمد:</span>
                        <strong>
                            {toPersianNumber(data.revenue.toLocaleString())}{" "}
                            تومان
                        </strong>
                    </div>
                    <div className="tooltip-row deposits">
                        <span>شارژ:</span>
                        <strong>
                            {toPersianNumber(data.deposits.toLocaleString())}{" "}
                            تومان
                        </strong>
                    </div>
                    <div className="tooltip-row settlements">
                        <span>تسویه:</span>
                        <strong>
                            {toPersianNumber(data.settlements.toLocaleString())}{" "}
                            تومان
                        </strong>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="admin-revenue-chart" style={{ zIndex: 10000000 }}>
            {" "}
            <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient
                            id="revenueGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="#10b981"
                                stopOpacity={0.3}
                            />
                            <stop
                                offset="100%"
                                stopColor="#10b981"
                                stopOpacity={0}
                            />
                        </linearGradient>
                        {!showOnlyRevenue && (
                            <>
                                <linearGradient
                                    id="depositsGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#3b82f6"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#3b82f6"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                                <linearGradient
                                    id="settlementsGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#ef4444"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#ef4444"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </>
                        )}
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
                    {/* <Tooltip
                        content={<CustomTooltip />}
                        allowEscapeViewBox={{ x: false, y: false }}
                        wrapperStyle={{
                            zIndex: 10000,
                            pointerEvents: "none",
                        }}
                    /> */}
                    <Tooltip
                        content={<CustomTooltip />}
                        isAnimationActive={false}
                        shared={true}
                        wrapperStyle={{
                            zIndex: 10000,
                            pointerEvents: "none",
                        }}
                    />
                    <Legend
                        wrapperStyle={{
                            fontSize: "0.75rem",
                            paddingTop: "1rem",
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        name="درآمد"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                    />
                    {!showOnlyRevenue && (
                        <>
                            <Area
                                type="monotone"
                                dataKey="deposits"
                                name="شارژ"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#depositsGradient)"
                            />
                            <Area
                                type="monotone"
                                dataKey="settlements"
                                name="تسویه"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fill="url(#settlementsGradient)"
                            />
                        </>
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
