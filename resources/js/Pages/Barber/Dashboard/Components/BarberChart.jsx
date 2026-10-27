import React, { useState, useMemo } from "react";
import { Calendar } from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatFullDateWithoutTime } from "../../../../utils/dateHelpers";
import { formatCompactNumber } from "../../../../Constants/formatCompactNumber";

export default function BarberChart({
    labels = [],
    earnings = [],
    bookings = [],
    mode = "both",
}) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const maxEarnings = Math.max(...earnings, 1);
    const maxBookings = Math.max(...bookings, 1);

    const W = 800;
    const H = 280;
    const PADDING = { top: 20, right: 20, bottom: 40, left: 60 };
    const CHART_W = W - PADDING.left - PADDING.right;
    const CHART_H = H - PADDING.top - PADDING.bottom;

    const points = useMemo(() => {
        const getX = (i) =>
            PADDING.left + (i / (labels.length - 1 || 1)) * CHART_W;

        return labels.map((label, i) => {
            const earnY =
                PADDING.top + CHART_H - (earnings[i] / maxEarnings) * CHART_H;
            const bookY =
                PADDING.top + CHART_H - (bookings[i] / maxBookings) * CHART_H;
            return {
                label,
                x: getX(i),
                earnY,
                bookY,
                earnings: earnings[i],
                bookings: bookings[i],
            };
        });
    }, [labels, earnings, bookings, maxEarnings, maxBookings]);

    const earningsPath = points.map((p) => `${p.x},${p.earnY}`).join(" ");
    const bookingsPath = points.map((p) => `${p.x},${p.bookY}`).join(" ");
    const earningsAreaPath = `${PADDING.left},${PADDING.top + CHART_H} ${earningsPath} ${PADDING.left + CHART_W},${PADDING.top + CHART_H}`;

    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
        y: PADDING.top + CHART_H - ratio * CHART_H,
        label: formatCompactNumber(Math.round(maxEarnings * ratio)),
    }));

    const xLabels = useMemo(() => {
        if (labels.length <= 7) return points;
        const step = Math.ceil(labels.length / 7);
        return points.filter(
            (_, i) => i % step === 0 || i === points.length - 1,
        );
    }, [points, labels.length]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * W;
        const relativeX = x - PADDING.left;
        const index = Math.round((relativeX / CHART_W) * (labels.length - 1));
        if (index >= 0 && index < labels.length) setHoveredIndex(index);
    };

    const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

    return (
        <div
            className="barber-chart-wrapper"
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
                            stopOpacity="0.3"
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
                {(mode === "both" || mode === "earnings") && (
                    <polygon
                        points={earningsAreaPath}
                        fill="url(#earningsGradient)"
                    />
                )}

                {/* Earnings line */}
                {(mode === "both" || mode === "earnings") && (
                    <polyline
                        points={earningsPath}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {/* Bookings line */}
                {(mode === "both" || mode === "bookings") && (
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

                {/* Dots */}
                {points.map((p, i) => (
                    <g key={i}>
                        {(mode === "both" || mode === "earnings") && (
                            <circle
                                cx={p.x}
                                cy={p.earnY}
                                r={hoveredIndex === i ? 5 : 3}
                                fill="#ffffff"
                                stroke="#10b981"
                                strokeWidth="2"
                            />
                        )}
                        {(mode === "both" || mode === "bookings") && (
                            <circle
                                cx={p.x}
                                cy={p.bookY}
                                r={hoveredIndex === i ? 5 : 3}
                                fill="#ffffff"
                                stroke="#3b82f6"
                                strokeWidth="2"
                            />
                        )}
                    </g>
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
                        {formatFullDateWithoutTime(p.label).slice(5)}
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
                        {formatFullDateWithoutTime(hoveredPoint.label)}
                    </div>

                    {(mode === "both" || mode === "earnings") && (
                        <div className="tooltip-row earnings">
                            <span>درآمد:</span>
                            <strong>
                                {toPersianNumber(
                                    Number(
                                        hoveredPoint.earnings,
                                    ).toLocaleString("en-US"),
                                )}{" "}
                                تومان
                            </strong>
                        </div>
                    )}

                    {(mode === "both" || mode === "bookings") && (
                        <div className="tooltip-row bookings">
                            <span>رزرو:</span>
                            <strong>
                                {toPersianNumber(hoveredPoint.bookings)} مورد
                            </strong>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
