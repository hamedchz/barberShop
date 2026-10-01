import React, { useState, useEffect, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PublicLayout from "../Layouts/PublicLayout";

import RatingStars from "../Components/RatingStars";
import Pagination from "../../Admin/Components/Pagination";
import {
    ArrowRight,
    Star,
    MessageCircle,
    X,
    Calendar,
    ChevronDown,
    ThumbsUp,
    Trash2,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { toJalaali } from "jalaali-js";

import "../Assets/Review.css";

// ============ توابع کمکی ============
const formatJalaliDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const { jy, jm, jd } = toJalaali(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    );
    return toPersianNumber(
        `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`,
    );
};

export default function BarbersReviews({ auth, barber, reviews, filters }) {
    // ============ State ها ============
    const [selectedRating, setSelectedRating] = useState(filters?.rating || "");
    const [selectedSort, setSelectedSort] = useState(filters?.sort || "latest");
    const [showFilters, setShowFilters] = useState(false);

    const reviewsList = reviews.data || [];

    // ============ فیلتر امتیاز ============
    const handleRatingFilter = (rating) => {
        const newRating = selectedRating === rating ? "" : rating;
        setSelectedRating(newRating);

        router.get(
            `/barber/reviews/${barber.slug}/list`,
            {
                rating: newRating,
                sort: selectedSort,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // ============ تغییر مرتب‌سازی ============
    const handleSortChange = (sort) => {
        setSelectedSort(sort);

        router.get(
            `/barber/reviews/${barber.slug}/list`,
            {
                rating: selectedRating,
                sort: sort,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // ============ پاک کردن فیلترها ============
    const handleClearFilters = () => {
        setSelectedRating("");
        setSelectedSort("latest");

        router.get(
            `/barber/reviews/${barber.slug}/list`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const hasActiveFilters = selectedRating || selectedSort !== "latest";

    return (
        <PublicLayout>
            <Head title={`نظرات ${barber.name}`} />

            <div className="reviews-page-container">
                {/* ============ دکمه بازگشت ============ */}
                <div className="reviews-page-back">
                    <Link
                        href={`/barbers/${barber.slug}/details`}
                        className="back-btn"
                    >
                        <ArrowRight size={20} />
                        <span>بازگشت به پروفایل</span>
                    </Link>
                </div>

                {/* ============ هدر ============ */}
                <div className="reviews-page-header">
                    <div className="reviews-page-barber">
                        <div className="reviews-page-avatar">
                            {barber.thumbnail ? (
                                <img src={barber.thumbnail} alt={barber.name} />
                            ) : (
                                <span>
                                    {barber.name?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="reviews-page-title">
                                نظرات {barber.name}
                            </h1>
                            <div className="reviews-page-meta">
                                <RatingStars
                                    rating={Number(barber.rating)}
                                    size={16}
                                    showNumber={true}
                                    showTotal={true}
                                    total={barber.total_reviews}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============ خلاصه امتیازات ============ */}
                {barber.total_reviews > 0 && (
                    <div className="reviews-summary-card">
                        <div className="reviews-summary-average">
                            <div className="average-big">
                                <span className="average-big-number">
                                    {toPersianNumber(
                                        Number(barber.rating).toFixed(1),
                                    )}
                                </span>
                                <span className="average-big-max">
                                    از {toPersianNumber(5)}
                                </span>
                            </div>
                            <RatingStars
                                rating={Number(barber.rating)}
                                size={20}
                                showNumber={false}
                                showTotal={false}
                            />
                            <p className="average-big-label">
                                بر اساس {toPersianNumber(barber.total_reviews)}{" "}
                                نظر
                            </p>
                        </div>

                        <div className="reviews-summary-bars">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count =
                                    barber.rating_distribution?.[star] ?? 0;
                                const percent =
                                    barber.total_reviews > 0
                                        ? (count / barber.total_reviews) * 100
                                        : 0;

                                return (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`rating-bar-row ${
                                            selectedRating === star
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => handleRatingFilter(star)}
                                    >
                                        <span className="rating-bar-star">
                                            {toPersianNumber(star)}
                                            <Star
                                                size={12}
                                                fill="#fbbf24"
                                                color="#fbbf24"
                                            />
                                        </span>
                                        <div className="rating-bar-track">
                                            <div
                                                className="rating-bar-fill"
                                                style={{
                                                    width: `${percent}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="rating-bar-count">
                                            {toPersianNumber(count)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ============ نوار ابزار ============ */}
                <div className="reviews-toolbar">
                    <div className="reviews-toolbar-left">
                        {selectedRating && (
                            <span className="active-filter-badge">
                                <Star
                                    size={12}
                                    fill="#fbbf24"
                                    color="#fbbf24"
                                />
                                {toPersianNumber(selectedRating)} ستاره
                                <button
                                    onClick={() => handleRatingFilter("")}
                                    className="filter-remove"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}
                    </div>

                    <div className="reviews-toolbar-right">
                        {hasActiveFilters && (
                            <button
                                className="clear-filters-btn"
                                onClick={handleClearFilters}
                            >
                                <X size={16} />
                                پاک کردن
                            </button>
                        )}

                        <div className="sort-dropdown">
                            <select
                                className="sort-select"
                                value={selectedSort}
                                onChange={(e) =>
                                    handleSortChange(e.target.value)
                                }
                            >
                                <option value="latest">جدیدترین</option>
                                <option value="oldest">قدیمی‌ترین</option>
                                <option value="highest">بالاترین امتیاز</option>
                                <option value="lowest">
                                    پایین‌ترین امتیاز
                                </option>
                                {/* <option value="most_helpful">مفیدترین</option> */}
                            </select>
                            <ChevronDown size={16} className="sort-chevron" />
                        </div>
                    </div>
                </div>

                {/* ============ لیست نظرات ============ */}
                {reviewsList.length === 0 ? (
                    <div className="reviews-empty">
                        <MessageCircle size={48} />
                        <h3>هیچ نظری یافت نشد</h3>
                        <p>
                            {hasActiveFilters
                                ? "هیچ نظری با فیلترهای انتخاب شده مطابقت ندارد."
                                : "هنوز نظری برای این آرایشگر ثبت نشده است."}
                        </p>
                        {hasActiveFilters && (
                            <button
                                className="clear-filters-btn-primary"
                                onClick={handleClearFilters}
                            >
                                پاک کردن فیلترها
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="reviews-full-list">
                        {reviewsList.map((review) => {
                            return (
                                <div
                                    key={review.id}
                                    className="review-card-full"
                                >
                                    <div className="review-card-full-header">
                                        <div className="review-card-full-user">
                                            <div
                                                className={`review-avatar-full ${
                                                    review.user.is_deleted
                                                        ? "deleted"
                                                        : ""
                                                }`}
                                            >
                                                {review.user.thumbnail ? (
                                                    <img
                                                        src={
                                                            review.user
                                                                .thumbnail
                                                        }
                                                        alt={review.user.name}
                                                    />
                                                ) : (
                                                    <span>
                                                        {review.user.name
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <span className="review-user-name-full">
                                                    {review.user.name}
                                                    {review.user.is_deleted && (
                                                        <span className="deleted-badge">
                                                            <Trash2 size={10} />
                                                            حذف شده
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="review-date-full">
                                                    <Calendar size={12} />
                                                    {formatJalaliDate(
                                                        review.created_at,
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <RatingStars
                                            rating={Number(review.rating)}
                                            size={16}
                                            showNumber={false}
                                            showTotal={false}
                                        />
                                    </div>

                                    {review.comment && (
                                        <p className="review-comment-full">
                                            {review.comment}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ============ صفحه‌بندی ============ */}
                <Pagination links={reviews.links} />
            </div>
        </PublicLayout>
    );
}
