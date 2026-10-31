import React, { useState, useMemo } from "react";
import { Calendar } from "lucide-react";
import { toJalaali } from "jalaali-js";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";
import "../Assets/css/EarningsChartTooltip.css";
export default function EarningsChart({ data = [] }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const W = 800;
    const H = 280;

    const PADDING = {
        top: 25,
        right: 20,
        bottom: 40,
        left: 65,
    };

    const CHART_W = W - PADDING.left - PADDING.right;
    const CHART_H = H - PADDING.top - PADDING.bottom;

    // تبدیل تاریخ‌ها به شمسی
    const chartData = useMemo(() => {
        return data.map((item) => {
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
                total: Number(item.total) || 0,
            };
        });
    }, [data]);

    const maxValue = Math.max(...chartData.map((item) => item.total), 1);

    // محاسبه نقاط نمودار
    const points = useMemo(() => {
        const getX = (i) =>
            PADDING.left + (i / (chartData.length - 1 || 1)) * CHART_W;

        return chartData.map((item, i) => {
            const y = PADDING.top + CHART_H - (item.total / maxValue) * CHART_H;

            return {
                ...item,
                x: getX(i),
                y,
            };
        });
    }, [chartData, maxValue]);

    // مسیر خط نمودار
    const chartPath = points.map((p) => `${p.x},${p.y}`).join(" ");

    // مسیر ناحیه زیر نمودار
    const areaPath =
        points.length > 0
            ? `${PADDING.left},${PADDING.top + CHART_H} ${chartPath} ${PADDING.left + CHART_W},${PADDING.top + CHART_H}`
            : "";

    // خطوط افقی نمودار
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
        y: PADDING.top + CHART_H - ratio * CHART_H,
        label: formatCompactNumber(Math.round(maxValue * ratio)),
    }));

    // برچسب‌های محور X
    const xLabels = useMemo(() => {
        if (points.length <= 7) return points;

        const step = Math.ceil(points.length / 7);

        return points.filter(
            (_, i) => i % step === 0 || i === points.length - 1,
        );
    }, [points]);

    // تشخیص نزدیک‌ترین نقطه به موس
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();

        const x = ((e.clientX - rect.left) / rect.width) * W;

        const relativeX = x - PADDING.left;

        const index = Math.round((relativeX / CHART_W) * (points.length - 1));

        if (index >= 0 && index < points.length) {
            setHoveredIndex(index);
        } else {
            setHoveredIndex(null);
        }
    };

    const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

    if (!chartData.length || chartData.every((d) => d.total === 0)) {
        return (
            <div className="chart-empty">
                <span>در این بازه درآمدی ثبت نشده است.</span>
            </div>
        );
    }

    return (
        <div
            className="barber-chart-wrapper earnings-chart-wrapper"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIndex(null)}
        >
            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="barber-chart-svg"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <linearGradient
                        id="earningsGradient"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="#10b981"
                            stopOpacity="0.4"
                        />

                        <stop
                            offset="100%"
                            stopColor="#10b981"
                            stopOpacity="0"
                        />
                    </linearGradient>
                </defs>

                {/* Grid */}
                {gridLines.map((line, i) => (
                    <g key={i}>
                        <line
                            x1={PADDING.left}
                            y1={line.y}
                            x2={PADDING.left + CHART_W}
                            y2={line.y}
                            stroke="#f3f4f6"
                            strokeWidth="1"
                            strokeDasharray={i === 0 ? "0" : "4,4"}
                        />

                        <text
                            x={PADDING.left - 8}
                            y={line.y + 4}
                            textAnchor="end"
                            fontSize="10"
                            fill="#9ca3af"
                            fontWeight="600"
                        >
                            {line.label}
                        </text>
                    </g>
                ))}

                {/* Area */}
                <polygon points={areaPath} fill="url(#earningsGradient)" />

                {/* Earnings Line */}
                <polyline
                    points={chartPath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data Points */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={hoveredIndex === i ? 5 : 3}
                        fill="#ffffff"
                        stroke="#10b981"
                        strokeWidth="2"
                    />
                ))}

                {/* Hover Line */}
                {hoveredPoint && (
                    <line
                        x1={hoveredPoint.x}
                        y1={PADDING.top}
                        x2={hoveredPoint.x}
                        y2={PADDING.top + CHART_H}
                        stroke="#8b5cf6"
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                        opacity="0.6"
                    />
                )}

                {/* X Labels */}
                {xLabels.map((p, i) => (
                    <text
                        key={i}
                        x={p.x}
                        y={PADDING.top + CHART_H + 20}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#9ca3af"
                        fontWeight="600"
                    >
                        {toPersianNumber(p.label)}
                    </text>
                ))}
            </svg>

            {/* Tooltip */}
            {hoveredPoint && (
                <div
                    className="barber-chart-tooltip"
                    style={{
                        left: `${(hoveredPoint.x / W) * 100}%`,
                        top: "0px",
                        transform: "translate(-50%, -100%)",
                        marginTop: "-12px",
                    }}
                >
                    <div className="tooltip-date">
                        <Calendar size={11} />

                        {hoveredPoint.fullLabel}
                    </div>

                    <div className="tooltip-row earnings">
                        <span>درآمد:</span>

                        <strong>
                            {toPersianNumber(
                                Number(hoveredPoint.total).toLocaleString(
                                    "en-US",
                                ),
                            )}{" "}
                            تومان
                        </strong>
                    </div>
                </div>
            )}
        </div>
    );
}
