import React from "react";
import { Star } from "lucide-react";

export default function RatingStars({
    rating = 0,
    total = 0,
    size = 16,
    showNumber = true,
    showTotal = true,
    interactive = false,
    onChange,
}) {
    const [hoverRating, setHoverRating] = React.useState(0);

    const handleClick = (value) => {
        if (interactive && onChange) onChange(value);
    };

    const displayRating = hoverRating || rating;

    return (
        <div className={`rating-stars ${interactive ? "interactive" : ""}`}>
            <div className="stars-wrapper">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= Math.round(displayRating);

                    return (
                        <button
                            key={star}
                            type="button"
                            className={`star-btn ${isFilled ? "filled" : ""}`}
                            onClick={() => handleClick(star)}
                            onMouseEnter={() =>
                                interactive && setHoverRating(star)
                            }
                            onMouseLeave={() =>
                                interactive && setHoverRating(0)
                            }
                            disabled={!interactive}
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

            {showNumber && (
                <span className="rating-number">
                    {parseFloat(rating || 0).toFixed(1)}
                </span>
            )}

            {showTotal && total > 0 && (
                <span className="rating-total">({total} نظر)</span>
            )}
        </div>
    );
}
