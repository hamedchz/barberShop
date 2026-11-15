import React from "react";
import { Star, Quote } from "lucide-react";

export default function CustomerReviews({ reviews = [] }) {
    if (!reviews.length) return null;

    return (
        <section className="front-section front-reviews-section" id="reviews">
            <div className="front-container">
                <div className="front-section-header">
                    <div>
                        <span className="front-section-eyebrow">
                            تجربه مشتریان
                        </span>

                        <h2 className="front-section-title">
                            رضایت واقعی، انتخاب مطمئن
                        </h2>

                        <p className="front-section-description">
                            تجربه مشتریانی که از خدمات آرایشگران استفاده
                            کرده‌اند.
                        </p>
                    </div>
                </div>

                <div className="front-reviews-grid">
                    {reviews.map((review) => (
                        <article key={review.id} className="front-review-card">
                            <div className="front-review-top">
                                <Quote size={25} />

                                <div className="front-review-rating">
                                    {Array.from({ length: 5 }).map(
                                        (_, index) => (
                                            <Star
                                                key={index}
                                                size={15}
                                                fill={
                                                    index < review.rating
                                                        ? "currentColor"
                                                        : "none"
                                                }
                                            />
                                        ),
                                    )}
                                </div>
                            </div>

                            <p className="front-review-comment">
                                {review.comment}
                            </p>

                            <div className="front-review-customer">
                                {review.customer.avatar ? (
                                    <img
                                        src={review.customer.avatar}
                                        alt={review.customer.name}
                                        loading="lazy"
                                    />
                                ) : (
                                    <span className="front-review-avatar-placeholder">
                                        {review.customer.name?.charAt(0) || "م"}
                                    </span>
                                )}

                                <div>
                                    <strong>{review.customer.name}</strong>

                                    <small>
                                        {review.barber?.name
                                            ? `مشتری ${review.barber.name}`
                                            : "مشتری تأییدشده"}
                                    </small>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
