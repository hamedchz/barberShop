import React, { useState } from "react";
import { Star } from "lucide-react";

export default function InteractiveRating({
    value = 0,
    onChange,
    size = 32,
    disabled = false,
    labels = {
        1: "خیلی بد",
        2: "بد",
        3: "متوسط",
        4: "خوب",
        5: "عالی",
    },
}) {
    const [hoveredValue, setHoveredValue] = useState(0);

    const displayValue = hoveredValue || value;

    const handleClick = (rating) => {
        if (disabled) return;
        onChange(rating);
    };

    return (
        <div className="interactive-rating-wrapper">
            <div className="rating-stars-row">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= displayValue;

                    return (
                        <button
                            key={star}
                            type="button"
                            className={`interactive-star-btn ${
                                isFilled ? "filled" : ""
                            } ${hoveredValue === star ? "hovered" : ""}`}
                            onClick={() => handleClick(star)}
                            onMouseEnter={() =>
                                !disabled && setHoveredValue(star)
                            }
                            onMouseLeave={() => setHoveredValue(0)}
                            disabled={disabled}
                            aria-label={`${star} ستاره`}
                        >
                            <Star
                                size={size}
                                fill={isFilled ? "#fbbf24" : "transparent"}
                                color={isFilled ? "#fbbf24" : "#d1d5db"}
                                strokeWidth={2}
                            />
                        </button>
                    );
                })}
            </div>

            {displayValue > 0 && (
                <div
                    className={`rating-label ${hoveredValue ? "hovered" : ""}`}
                    style={{
                        color:
                            displayValue >= 4
                                ? "#10b981"
                                : displayValue === 3
                                  ? "#f59e0b"
                                  : "#ef4444",
                    }}
                >
                    {labels[displayValue]}
                </div>
            )}
        </div>
    );
}
