import React, { useEffect, useRef, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";

import {
    Search,
    SlidersHorizontal,
    Star,
    MapPin,
    Scissors,
    ArrowLeft,
    Users,
    Sparkles,
    X,
    BadgeCheck,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";

import Layout from "../FrontLayout";
import "./Assets/css/Index.css";
import FeaturedBarbers from "../Components/FeaturedBarbers";
import Pagination from "../../Admin/Components/Pagination";

const number = (value) =>
    new Intl.NumberFormat("fa-IR").format(Number(value || 0));

/*
|--------------------------------------------------------------------------
| ساخت پارامترهای درخواست
|--------------------------------------------------------------------------
*/

const cleanFilters = (filters) => {
    const result = {};

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
            result[key] = value;
        }
    });

    return result;
};

/*
|--------------------------------------------------------------------------
| صفحه فهرست آرایشگران
|--------------------------------------------------------------------------
*/

export default function Index({
    category = null,
    categories = [],
    barbers = {},
    filters = {},
}) {
    /*
    |--------------------------------------------------------------------------
    | مقادیر فیلترها از بک‌اند
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] = useState(filters.search || "");
    const [sort, setSort] = useState(filters.sort || "popular");
    const [minRating, setMinRating] = useState(
        String(filters.min_rating ?? "0"),
    );

    const [showFilters, setShowFilters] = useState(false);

    const searchTimeout = useRef(null);

    // نگهداری آخرین مقادیر فیلترها برای درخواست جستجوی Debounce
    const currentFilters = useRef({
        sort,
        minRating,
        category: category?.slug || "",
    });

    currentFilters.current = {
        sort,
        minRating,
        category: category?.slug || "",
    };

    /*
    |--------------------------------------------------------------------------
    | اطلاعات صفحه‌بندی
    |--------------------------------------------------------------------------
    */

    const barberItems = Array.isArray(barbers) ? barbers : barbers?.data || [];

    const totalBarbers = barbers?.total ?? barberItems.length;
    const currentPage = barbers?.current_page ?? 1;
    const lastPage = barbers?.last_page ?? 1;
    const paginationLinks = barbers?.links || [];

    /*
    |--------------------------------------------------------------------------
    | ارسال درخواست به بک‌اند
    |--------------------------------------------------------------------------
    */

    const submitFilters = (overrides = {}) => {
        const current = currentFilters.current;

        const params = cleanFilters({
            search,
            sort: current.sort,
            min_rating: current.minRating,
            category: current.category,
            page: 1,
            ...overrides,
        });

        router.get(route("user.services.index"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | همگام‌سازی فیلترها پس از دریافت پاسخ سرور
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        setSearch(filters.search || "");
        setSort(filters.sort || "popular");
        setMinRating(String(filters.min_rating ?? "0"));
    }, [filters.search, filters.sort, filters.min_rating]);

    /*
    |--------------------------------------------------------------------------
    | جستجوی Debounce
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            const current = currentFilters.current;

            router.get(
                route("user.services.index"),
                cleanFilters({
                    search,
                    sort: current.sort,
                    min_rating: current.minRating,
                    category: current.category,
                    page: 1,
                }),
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 400);

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [search]);

    /*
    |--------------------------------------------------------------------------
    | تغییر مرتب‌سازی
    |--------------------------------------------------------------------------
    */

    const handleSortChange = (value) => {
        setSort(value);

        submitFilters({
            sort: value,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | تغییر حداقل امتیاز
    |--------------------------------------------------------------------------
    */

    const handleRatingChange = (value) => {
        setMinRating(value);

        submitFilters({
            min_rating: value,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | پاک کردن فیلترها
    |--------------------------------------------------------------------------
    */

    const clearFilters = () => {
        setSearch("");
        setSort("popular");
        setMinRating("0");

        router.get(
            route("user.services.index"),
            cleanFilters({
                category: category?.slug || "",
                sort: "popular",
            }),
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleCategoryChange = (slug = null) => {
        console.log(slug);
        router.get(
            route("user.services.index"),
            {
                category: slug || undefined,
                search: filters.search || undefined,
                sort: filters.sort || "popular",
                min_rating: filters.min_rating || undefined,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ["category", "barbers", "filters"],
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | عنوان صفحه
    |--------------------------------------------------------------------------
    */

    return (
        <Layout>
            <Head
                title={
                    category?.name
                        ? `آرایشگران ${category.name}`
                        : "فهرست آرایشگران"
                }
            />

            <main className="barber-index-page">
                <div className="barber-index-container">
                    {/* معرفی صفحه */}

                    <section className="barber-index-hero">
                        <div className="barber-index-hero-content">
                            <div className="barber-index-eyebrow">
                                <Sparkles size={15} />
                                انتخاب حرفه‌ای، تجربه متفاوت
                            </div>

                            <h1>
                                {category?.name
                                    ? `بهترین آرایشگران ${category.name}`
                                    : "آرایشگر مورد علاقه‌ات را پیدا کن"}
                            </h1>

                            <p>
                                آرایشگران حرفه‌ای را بررسی کن، نمونه‌کارها را
                                ببین و با خیال راحت نوبت خودت را رزرو کن.
                            </p>

                            <div className="barber-index-hero-stats">
                                <div>
                                    <Users size={18} />

                                    <strong>{number(totalBarbers)}</strong>

                                    <span>آرایشگر</span>
                                </div>

                                <div>
                                    <BadgeCheck size={18} />

                                    <strong>حرفه‌ای</strong>

                                    <span>متخصصان تأییدشده</span>
                                </div>
                            </div>
                        </div>

                        <div className="barber-index-hero-decoration">
                            <div className="barber-index-hero-icon">
                                <Scissors size={76} strokeWidth={1} />
                            </div>

                            <span className="barber-index-decoration-dot dot-one" />
                            <span className="barber-index-decoration-dot dot-two" />
                            <span className="barber-index-decoration-dot dot-three" />
                        </div>
                    </section>

                    {/* دسته‌بندی‌ها */}

                    {categories.length > 0 && (
                        <section className="barber-categories-section">
                            <div className="barber-categories-heading">
                                <div>
                                    <h3>دسته‌بندی خدمات</h3>
                                    <p>خدمت موردنظرت رو انتخاب کن</p>
                                </div>
                            </div>

                            <div className="barber-index-category-list">
                                <button
                                    type="button"
                                    onClick={() => handleCategoryChange(null)}
                                    className={`barber-index-category-chip ${
                                        !category ? "active" : ""
                                    }`}
                                >
                                    همه خدمات
                                </button>

                                {categories.map((item) => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={() =>
                                            handleCategoryChange(item.slug)
                                        }
                                        className={`barber-index-category-chip ${
                                            category?.id === item.id
                                                ? "active"
                                                : ""
                                        }`}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* جست‌وجو و فیلتر */}

                    <section className="barber-index-toolbar">
                        <div className="barber-index-search">
                            <Search size={19} />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="نام آرایشگر، خدمت یا محدوده را جست‌وجو کن..."
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="پاک کردن جست‌وجو"
                                >
                                    <X size={17} />
                                </button>
                            )}
                        </div>

                        <div className="barber-index-toolbar-actions">
                            <label className="barber-index-sort">
                                {/* <span>مرتب‌سازی:</span> */}

                                <select
                                    value={sort}
                                    onChange={(event) =>
                                        handleSortChange(event.target.value)
                                    }
                                >
                                    <option value="popular">محبوب‌ترین</option>

                                    <option value="rating">
                                        بالاترین امتیاز
                                    </option>

                                    <option value="price">کمترین قیمت</option>
                                </select>
                            </label>

                            <button
                                type="button"
                                className={`barber-index-filter-btn ${
                                    showFilters ? "active" : ""
                                }`}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <SlidersHorizontal size={17} />
                                فیلترها
                            </button>
                        </div>

                        {showFilters && (
                            <div className="barber-index-filter-panel">
                                <div>
                                    <label htmlFor="barber-min-rating">
                                        حداقل امتیاز
                                    </label>

                                    <select
                                        id="barber-min-rating"
                                        value={minRating}
                                        onChange={(event) =>
                                            handleRatingChange(
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="0">همه امتیازها</option>

                                        <option value="3">۳ به بالا</option>

                                        <option value="4">۴ به بالا</option>

                                        <option value="4.5">۴.۵ به بالا</option>
                                    </select>
                                </div>

                                <button type="button" onClick={clearFilters}>
                                    حذف فیلترها
                                </button>
                            </div>
                        )}
                    </section>

                    {/* نتایج */}

                    <section className="barber-index-results">
                        <div className="barber-index-results-heading">
                            <div className="barber-index-results-title">
                                <span className="barber-index-section-eyebrow">
                                    انتخاب با اطمینان
                                </span>

                                <h2>
                                    {category?.name
                                        ? `آرایشگران ${category.name}`
                                        : "آرایشگران برتر"}
                                </h2>
                            </div>

                            <span className="barber-index-result-count">
                                {number(totalBarbers)} آرایشگر
                            </span>
                        </div>

                        {barberItems.length > 0 ? (
                            <>
                                <FeaturedBarbers
                                    barbers={barberItems}
                                    showHeader={false}
                                />
                            </>
                        ) : (
                            <div className="barber-index-empty">
                                <div>
                                    <Search size={30} />
                                </div>

                                <h3>آرایشگری پیدا نشد</h3>

                                <p>
                                    با تغییر عبارت جست‌وجو یا حذف فیلترها دوباره
                                    امتحان کن.
                                </p>

                                <button type="button" onClick={clearFilters}>
                                    نمایش همه آرایشگران
                                </button>
                            </div>
                        )}
                    </section>
                </div>
                <Pagination links={barbers.links} only={barbers} />
            </main>
        </Layout>
    );
}
