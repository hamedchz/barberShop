import React from "react";
import { Link } from "@inertiajs/react";
import { Star, ArrowLeft, MessageCircle } from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../../utils/dateHelpers";

export default function RecentReviews({ reviews }) {
    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={14}
                className={i < rating ? "filled" : "empty"}
                fill={i < rating ? "currentColor" : "none"}
            />
        ));
    };

    return (
        <div className="dashboard-card">
            <div className="dashboard-card-header">
                <div className="dashboard-card-header-icon orange">
                    <Star size={20} />
                </div>
                <div className="dashboard-card-header-content">
                    <h3>آخرین نظرات شما</h3>
                    <p>نظراتی که برای آرایشگران ثبت کرده‌اید</p>
                </div>
                <Link href="" className="dashboard-card-link">
                    مشاهده همه
                    <ArrowLeft size={14} />
                </Link>
            </div>

            {reviews.length > 0 ? (
                <div className="reviews-list">
                    {reviews.map((review) => (
                        <div key={review.id} className="review-item">
                            <div className="review-header">
                                <div className="review-barber">
                                    {review.barber_avatar ? (
                                        <img
                                            src={review.barber_avatar}
                                            alt={review.barber_name}
                                            className="review-barber-avatar"
                                        />
                                    ) : (
                                        <div className="review-barber-avatar-placeholder">
                                            <MessageCircle size={16} />
                                        </div>
                                    )}
                                    <span className="review-barber-name">
                                        {review.barber_name}
                                    </span>
                                </div>
                                <div className="review-stars">
                                    {renderStars(review.rating)}
                                </div>
                            </div>
                            <p className="review-comment">{review.comment}</p>
                            <span className="review-date">
                                {formatFullDateTime(review.created_at)}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="dashboard-empty-state">
                    <Star size={40} />
                    <p>هنوز نظری ثبت نکرده‌اید</p>
                </div>
            )}
        </div>
    );
}
