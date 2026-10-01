import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PublicLayout from "../Layouts/PublicLayout";
import BarbersHero from "../Components/BarbersHero";
import BarbersFilters from "../Components/BarbersFilters";
import BarberCard from "../Components/BarberCard";
import EmptyList from "../../Admin/Components/EmptyList";
import Pagination from "../../Admin/Components/Pagination";
import {
    Scissors,
    Grid3x3,
    List,
    Star,
    TrendingUp,
    Users,
    X,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

import "../Assets/BarbersList.css";

export default function BarbersIndex({
    auth,
    barbers,
    cities,
    stats,
    filters,
}) {
    const [viewMode, setViewMode] = useState("grid"); // grid | list

    // ============ تعریف barbersList در ابتدا ============
    const barbersList = barbers.data || [];

    // ============ فیلتر و مرتب‌سازی نهایی ============
    const finalBarbers = useMemo(() => {
        let list = [...barbersList];

        // ۱. فیلتر امتیاز
        if (filters?.min_rating) {
            list = list.filter(
                (b) => b.rating >= parseFloat(filters.min_rating),
            );
        }

        // ۲. فیلتر آنلاین
        if (filters?.online_only) {
            list = list.filter((b) => b.is_online);
        }

        // ۳. مرتب‌سازی
        switch (filters?.sort) {
            case "rating":
            case "smart":
                list.sort((a, b) => {
                    // آنلاین‌ها اول
                    if (a.is_online !== b.is_online) {
                        return a.is_online ? -1 : 1;
                    }
                    // سپس امتیاز
                    if (b.rating !== a.rating) {
                        return b.rating - a.rating;
                    }
                    return b.total_reviews - a.total_reviews;
                });
                break;

            case "reviews":
                list.sort((a, b) => b.total_reviews - a.total_reviews);
                break;

            case "services":
                list.sort((a, b) => b.services_count - a.services_count);
                break;

            case "name":
                list.sort((a, b) => a.name.localeCompare(b.name, "fa"));
                break;

            case "latest":
            default:
                // ترتیب اصلی حفظ می‌شود
                break;
        }

        return list;
    }, [barbersList, filters]);

    // ============ بررسی وجود فیلتر فعال ============
    const hasActiveFilters =
        filters?.search ||
        filters?.city ||
        filters?.min_rating ||
        filters?.online_only ||
        (filters?.sort && filters.sort !== "latest");

    // ============ تغییر مرتب‌سازی ============
    const handleSortChange = (sort) => {
        router.get(
            "/barbers",
            {
                ...filters,
                sort: sort,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <PublicLayout>
            <Head title="آرایشگران" />

            {/* ============ Hero Section ============ */}
            {!hasActiveFilters && <BarbersHero stats={stats} />}

            {/* ============ بخش آرایشگران ============ */}
            <section className="barbers-section" id="barbers">
                <div className="section-container">
                    {/* هدر بخش */}
                    <div className="barbers-section-header">
                        <div>
                            <h2 className="barbers-section-title">
                                {hasActiveFilters
                                    ? `${toPersianNumber(
                                          barbers.total,
                                      )} نتیجه یافت شد`
                                    : "همه آرایشگران"}
                            </h2>
                            <p className="barbers-section-subtitle">
                                {hasActiveFilters
                                    ? "نتایج بر اساس فیلترهای شما"
                                    : "بهترین آرایشگران را انتخاب کنید و نوبت بگیرید"}
                            </p>
                        </div>

                        {/* مرتب‌سازی و نمایش */}
                        <div className="barbers-section-actions">
                            {/* حالت نمایش */}
                            <div className="view-mode-toggle">
                                <button
                                    className={`view-mode-btn ${
                                        viewMode === "grid" ? "active" : ""
                                    }`}
                                    onClick={() => setViewMode("grid")}
                                    title="نمایش شبکه‌ای"
                                >
                                    <Grid3x3 size={16} />
                                </button>
                                <button
                                    className={`view-mode-btn ${
                                        viewMode === "list" ? "active" : ""
                                    }`}
                                    onClick={() => setViewMode("list")}
                                    title="نمایش لیستی"
                                >
                                    <List size={16} />
                                </button>
                            </div>

                            {/* مرتب‌سازی */}
                            <div className="sort-wrapper">
                                <select
                                    className="sort-select-public"
                                    value={filters?.sort || "latest"}
                                    onChange={(e) =>
                                        handleSortChange(e.target.value)
                                    }
                                >
                                    {/* <option value="latest">جدیدترین</option> */}
                                    <option value="rating">
                                        بالاترین امتیاز
                                    </option>
                                    <option value="reviews">
                                        بیشترین نظرات
                                    </option>
                                    <option value="services">
                                        بیشترین خدمات
                                    </option>
                                    <option value="name">ترتیب الفبایی</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* فیلترها و جستجو */}
                    <BarbersFilters filters={filters} cities={cities} />

                    {/* گرید یا لیست آرایشگران */}
                    {finalBarbers.length === 0 ? (
                        <div className="card" style={{ padding: "3rem" }}>
                            <EmptyList
                                title={
                                    hasActiveFilters
                                        ? "نتیجه‌ای یافت نشد"
                                        : "آرایشگری پیدا نشد"
                                }
                                message={
                                    hasActiveFilters
                                        ? "هیچ آرایشگری با فیلترهای انتخاب شده مطابقت ندارد."
                                        : "در حال حاضر هیچ آرایشگری در سیستم ثبت نشده است."
                                }
                            />
                        </div>
                    ) : (
                        <div
                            className={
                                viewMode === "grid"
                                    ? "barbers-public-grid"
                                    : "barbers-public-list"
                            }
                        >
                            {finalBarbers.map((barber) => (
                                <BarberCard
                                    key={barber.id}
                                    barber={barber}
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>
                    )}

                    {/* صفحه‌بندی */}
                    <Pagination links={barbers.links} />
                </div>
            </section>

            {/* ============ بخش ویژگی‌ها ============ */}
            {!hasActiveFilters && (
                <section className="features-section">
                    <div className="section-container">
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon green">
                                    <Scissors size={24} />
                                </div>
                                <h3>آرایشگران متخصص</h3>
                                <p>
                                    بیش از {toPersianNumber(stats.total)}{" "}
                                    آرایشگر حرفه‌ای در سراسر ایران آماده
                                    خدمت‌رسانی به شما هستند.
                                </p>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon blue">
                                    <TrendingUp size={24} />
                                </div>
                                <h3>رزرو سریع و آسان</h3>
                                <p>
                                    در کمتر از ۳۰ ثانیه نوبت خود را رزرو کنید.
                                    بدون تماس تلفنی، بدون انتظار.
                                </p>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon purple">
                                    <Star
                                        size={24}
                                        fill="#8b5cf6"
                                        color="#8b5cf6"
                                    />
                                </div>
                                <h3>رضایت ۱۰۰٪</h3>
                                <p>
                                    بیش از ۱۰۰۰ رزرو موفق با امتیاز ۴.۸ از ۵.
                                    رضایت شما اولویت ماست.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
