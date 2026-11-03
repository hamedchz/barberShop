import React, { useState, useMemo } from "react";
import { Calendar } from "lucide-react";
import { toJalaali } from "jalaali-js";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";
import "../Wallet/Assets/css/PaymentChart.css";
export default function CustomerPaymentsChart({ data = [] }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const W = 800;
    const H = 280;

    const PADDING = {
        top: 55,
        right: 20,
        bottom: 40,
        left: 65,
    };

    const CHART_W = W - PADDING.left - PADDING.right;
    const CHART_H = H - PADDING.top - PADDING.bottom;

    // تبدیل داده‌ها به تاریخ شمسی
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

    const maxTotal = Math.max(...chartData.map((item) => item.total), 1);

    const points = useMemo(() => {
        return chartData.map((item, i) => {
            const x =
                PADDING.left + (i / (chartData.length - 1 || 1)) * CHART_W;

            const y = PADDING.top + CHART_H - (item.total / maxTotal) * CHART_H;

            return {
                ...item,
                x,
                y,
            };
        });
    }, [chartData, maxTotal]);

    // مسیر نمودار
    const linePath = points.map((p) => `${p.x},${p.y}`).join(" ");

    // سطح زیر نمودار
    const areaPath =
        points.length > 0
            ? `${PADDING.left},${PADDING.top + CHART_H} ${linePath} ${PADDING.left + CHART_W},${PADDING.top + CHART_H}`
            : "";

    // خطوط راهنمای نمودار
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
        y: PADDING.top + CHART_H - ratio * CHART_H,
        label: formatCompactNumber(Math.round(maxTotal * ratio)),
    }));

    // برچسب‌های محور افقی
    const xLabels = useMemo(() => {
        if (points.length <= 7) return points;

        const step = Math.ceil(points.length / 7);

        return points.filter(
            (_, i) => i % step === 0 || i === points.length - 1,
        );
    }, [points]);

    // انتخاب نقطه با حرکت موس
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();

        const x = ((e.clientX - rect.left) / rect.width) * W;

        const relativeX = x - PADDING.left;

        const index = Math.round((relativeX / CHART_W) * (points.length - 1));

        if (index >= 0 && index < points.length) {
            setHoveredIndex(index);
        }
    };

    // انتخاب نقطه با لمس موبایل
    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        if (!touch) return;

        const rect = e.currentTarget.getBoundingClientRect();

        const x = ((touch.clientX - rect.left) / rect.width) * W;

        const relativeX = x - PADDING.left;

        const index = Math.round((relativeX / CHART_W) * (points.length - 1));

        if (index >= 0 && index < points.length) {
            setHoveredIndex(index);
        }
    };

    const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

    if (!chartData.length || chartData.every((item) => item.total === 0)) {
        return (
            <div className="chart-empty">
                <span>در این بازه پرداختی ثبت نشده است.</span>
            </div>
        );
    }

    return (
        <div
            className="barber-chart-wrapper customer-payments-chart"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={handleMouseMove}
            onTouchStart={handleTouchMove}
            onTouchMove={handleTouchMove}
            style={{
                position: "relative",
                touchAction: "pan-y",
            }}
        >
            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="barber-chart-svg"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <linearGradient
                        id="customerPaymentsGradient"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="#3b82f6"
                            stopOpacity="0.3"
                        />

                        <stop
                            offset="100%"
                            stopColor="#3b82f6"
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
                <polygon
                    points={areaPath}
                    fill="url(#customerPaymentsGradient)"
                />

                {/* Line */}
                <polyline
                    points={linePath}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Dots */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={hoveredIndex === i ? 6 : 3}
                        fill="#ffffff"
                        stroke="#3b82f6"
                        strokeWidth="2"
                    />
                ))}

                {/* Hover line */}
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

                {/* X labels */}
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
                        {p.label}
                    </text>
                ))}
            </svg>

            {/* Tooltip */}
            {hoveredPoint && (
                <div
                    className="barber-chart-tooltip"
                    style={{
                        left: `${(hoveredPoint.x / W) * 100}%`,
                        top: `${(hoveredPoint.y / H) * 100}%`,
                        transform: "translate(-50%, -100%)",
                        marginTop: "-12px",
                        pointerEvents: "none",
                    }}
                >
                    <div className="tooltip-date">
                        <Calendar size={11} />

                        {hoveredPoint.fullLabel}
                    </div>

                    <div className="tooltip-row earnings">
                        <span>پرداخت:</span>

                        <strong>
                            {toPersianNumber(
                                hoveredPoint.total.toLocaleString("en-US"),
                            )}{" "}
                            تومان
                        </strong>
                    </div>
                </div>
            )}
        </div>
    );
}
