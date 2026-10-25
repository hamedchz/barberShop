import React, { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatFullDateWithoutTime } from "../../../../utils/dateHelpers";
import { formatCompactNumber } from "../../../../Constants/formatCompactNumber";
import "../Assets/css/DashboardChart.css";
export default function DashboardChart({
    labels = [],
    revenue = [],
    bookings = [],
}) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [activeSeries, setActiveSeries] = useState("both"); // both, revenue, bookings

    // ============ محاسبه max ============
    const maxRevenue = Math.max(...revenue, 1);
    const maxBookings = Math.max(...bookings, 1);

    // ============ SVG dimensions ============
    const W = 800;
    const H = 280;
    const PADDING = { top: 20, right: 20, bottom: 40, left: 60 };
    const CHART_W = W - PADDING.left - PADDING.right;
    const CHART_H = H - PADDING.top - PADDING.bottom;

    // ============ نقاط SVG ============
    const points = useMemo(() => {
        const getX = (i) =>
            PADDING.left + (i / (labels.length - 1 || 1)) * CHART_W;

        return labels.map((label, i) => {
            const revY =
                PADDING.top + CHART_H - (revenue[i] / maxRevenue) * CHART_H;
            const bookY =
                PADDING.top + CHART_H - (bookings[i] / maxBookings) * CHART_H;
            return {
                label,
                x: getX(i),
                revenueY: revY,
                bookingsY: bookY,
                revenue: revenue[i],
                bookings: bookings[i],
            };
        });
    }, [labels, revenue, bookings, maxRevenue, maxBookings]);

    // ============ مسیر polyline ============
    const revenuePath = points.map((p) => `${p.x},${p.revenueY}`).join(" ");
    const bookingsPath = points.map((p) => `${p.x},${p.bookingsY}`).join(" ");
    const revenueAreaPath = `${PADDING.left},${PADDING.top + CHART_H} ${revenuePath} ${PADDING.left + CHART_W},${PADDING.top + CHART_H}`;

    // ============ Grid ============
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
        y: PADDING.top + CHART_H - ratio * CHART_H,
        label: formatCompactNumber(Math.round(maxRevenue * ratio)),
    }));

    // ============ X-axis labels ============
    const xLabels = useMemo(() => {
        if (labels.length <= 7) {
            return points;
        }
        const step = Math.ceil(labels.length / 7);
        return points.filter(
            (_, i) => i % step === 0 || i === points.length - 1,
        );
    }, [points, labels.length]);

    // ============ Hover ============
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * W;
        const relativeX = x - PADDING.left;
        const index = Math.round((relativeX / CHART_W) * (labels.length - 1));

        if (index >= 0 && index < labels.length) {
            setHoveredIndex(index);
        }
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
    };

    const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

    return (
        <div className="dashboard-chart-wrapper">
            {/* ============ هدر با legend ============ */}
            <div className="dashboard-chart-header">
                <div className="dashboard-chart-legend">
                    <button
                        type="button"
                        className={`chart-legend-item ${activeSeries === "both" || activeSeries === "revenue" ? "active" : ""}`}
                        onClick={() =>
                            setActiveSeries(
                                activeSeries === "revenue" ? "both" : "revenue",
                            )
                        }
                    >
                        <span className="chart-legend-dot revenue" />
                        درآمد
                    </button>
                    <button
                        type="button"
                        className={`chart-legend-item ${activeSeries === "both" || activeSeries === "bookings" ? "active" : ""}`}
                        onClick={() =>
                            setActiveSeries(
                                activeSeries === "bookings"
                                    ? "both"
                                    : "bookings",
                            )
                        }
                    >
                        <span className="chart-legend-dot bookings" />
                        رزرو
                    </button>
                </div>

                {/* خلاصه دوره */}
                <div className="dashboard-chart-summary">
                    <div className="chart-summary-item">
                        <span className="summary-label">مجموع درآمد</span>
                        <span className="summary-value revenue">
                            {formatCompactNumber(
                                revenue.reduce((a, b) => a + b, 0),
                            )}{" "}
                            تومان
                        </span>
                    </div>
                    <div className="chart-summary-item">
                        <span className="summary-label">مجموع رزرو</span>
                        <span className="summary-value bookings">
                            {toPersianNumber(
                                bookings.reduce((a, b) => a + b, 0),
                            )}{" "}
                            مورد
                        </span>
                    </div>
                </div>
            </div>

            {/* ============ SVG Chart ============ */}
            <div
                className="dashboard-chart-container"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    className="dashboard-chart-svg"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        <linearGradient
                            id="revenueAreaGradient"
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="#10b981"
                                stopOpacity="0.25"
                            />
                            <stop
                                offset="100%"
                                stopColor="#10b981"
                                stopOpacity="0"
                            />
                        </linearGradient>
                        <filter id="chartGlow">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* ============ Grid lines ============ */}
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
                                direction="ltr"
                            >
                                {line.label}
                            </text>
                        </g>
                    ))}

                    {/* ============ Area زیر درآمد ============ */}
                    {(activeSeries === "both" ||
                        activeSeries === "revenue") && (
                        <polygon
                            points={revenueAreaPath}
                            fill="url(#revenueAreaGradient)"
                        />
                    )}

                    {/* ============ خط درآمد ============ */}
                    {(activeSeries === "both" ||
                        activeSeries === "revenue") && (
                        <polyline
                            points={revenuePath}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#chartGlow)"
                        />
                    )}

                    {/* ============ خط رزرو ============ */}
                    {(activeSeries === "both" ||
                        activeSeries === "bookings") && (
                        <polyline
                            points={bookingsPath}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="6,4"
                        />
                    )}

                    {/* ============ نقاط (دایره‌ها) ============ */}
                    {points.map((p, i) => {
                        if (
                            labels.length > 60 &&
                            i % 3 !== 0 &&
                            i !== hoveredIndex
                        )
                            return null;

                        return (
                            <g key={i}>
                                {(activeSeries === "both" ||
                                    activeSeries === "revenue") && (
                                    <circle
                                        cx={p.x}
                                        cy={p.revenueY}
                                        r={hoveredIndex === i ? 5 : 3}
                                        fill="#ffffff"
                                        stroke="#10b981"
                                        strokeWidth="2"
                                        style={{ transition: "r 0.15s" }}
                                    />
                                )}
                                {(activeSeries === "both" ||
                                    activeSeries === "bookings") && (
                                    <circle
                                        cx={p.x}
                                        cy={p.bookingsY}
                                        r={hoveredIndex === i ? 5 : 3}
                                        fill="#ffffff"
                                        stroke="#3b82f6"
                                        strokeWidth="2"
                                        style={{ transition: "r 0.15s" }}
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* ============ Hover line ============ */}
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

                    {/* ============ X-axis labels ============ */}
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
                            {formatFullDateWithoutTime(p.label).slice(5)}
                        </text>
                    ))}
                </svg>

                {/* ============ Tooltip ============ */}
                {hoveredPoint && (
                    <div
                        className="dashboard-chart-tooltip"
                        style={{
                            left: `${(hoveredPoint.x / W) * 100}%`,
                            top: "10px",
                        }}
                    >
                        <div className="tooltip-date">
                            <Calendar size={11} />
                            {formatFullDateWithoutTime(hoveredPoint.label)}
                        </div>
                        <div className="tooltip-row revenue">
                            <span>درآمد:</span>
                            <strong>
                                {toPersianNumber(
                                    Number(hoveredPoint.revenue).toLocaleString(
                                        "en-US",
                                    ),
                                )}{" "}
                                تومان
                            </strong>
                        </div>
                        <div className="tooltip-row bookings">
                            <span>رزرو:</span>
                            <strong>
                                {toPersianNumber(hoveredPoint.bookings)} مورد
                            </strong>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
