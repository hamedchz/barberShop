import React from "react";
import { Scissors, ArrowLeft, Sparkles } from "lucide-react";
import { router, Link } from "@inertiajs/react";
import "../Assets/css/Services.css";
const iconMap = {
    scissors: Scissors,
    sparkles: Sparkles,
};

/**
 * کارت مشترک دسته‌بندی
 */
function CategoryCard({ category, variant = "" }) {
    const Icon = iconMap[category.icon] || Scissors;

    return (
        <a
            //  href={route("user.services.show", service.slug)}
            href={`/services?category=${encodeURIComponent(category.slug)}`}
            className={`front-category-card ${variant}`}
            aria-label={`مشاهده خدمات ${category.name}`}
        >
            {/* <Link href=""></Link> */}
            {/* تصویر سمت راست */}
            <div className="front-category-image">
                {category.image_url ? (
                    <img
                        src={category.image_url}
                        alt={category.name}
                        loading="lazy"
                    />
                ) : (
                    <div className="front-category-placeholder">
                        <Icon size={42} strokeWidth={1.5} />
                    </div>
                )}
            </div>

            {/* اطلاعات سمت چپ */}
            <div className="front-category-content">
                <div className="front-category-text">
                    <span className="front-category-eyebrow">خدمات تخصصی</span>

                    <h3>{category.name}</h3>

                    {/* <p>خدمات حرفه‌ای و متناسب با استایل و سلیقه شما</p> */}
                </div>

                <div className="front-category-bottom">
                    <span className="front-category-action">
                        مشاهده خدمات
                        <ArrowLeft size={15} />
                    </span>
                </div>
            </div>
        </a>
    );
}

export default function ServiceCategories({ categories = [] }) {
    if (!categories.length) return null;

    const featuredCategories = categories.slice(0, 2);
    const remainingCategories = categories.slice(2);

    return (
        <section
            className="front-section front-categories-section"
            id="services"
        >
            <div className="front-container">
                {/* عنوان بخش */}
                <div className="front-section-header">
                    <div>
                        <span className="front-section-eyebrow">
                            خدمات حرفه‌ای
                        </span>

                        <h2 className="front-section-title">
                            خدمات متناسب با استایل تو
                        </h2>

                        <p className="front-section-description">
                            از میان خدمات متنوع، انتخاب مناسب خودت را پیدا کن.
                        </p>
                    </div>

                    <Link
                        href={route("user.services.index")}
                        className="front-section-more"
                    >
                        مشاهده آرایشگران
                        <ArrowLeft size={17} />
                    </Link>
                </div>

                {/* دسکتاپ و تبلت */}
                <div className="front-categories-desktop">
                    <div className="front-categories-grid">
                        {categories.map((category) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                            />
                        ))}
                    </div>
                </div>

                {/* موبایل */}
                <div className="front-categories-mobile">
                    {/* دو دسته‌بندی اصلی */}
                    <div className="front-categories-featured">
                        {featuredCategories.map((category) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                variant="front-category-featured"
                            />
                        ))}
                    </div>

                    {/* سایر دسته‌بندی‌ها */}
                    {remainingCategories.length > 0 && (
                        <div className="front-categories-more">
                            <div className="front-categories-more-header">
                                <h3>سایر خدمات</h3>

                                <span>
                                    برای مشاهده بیشتر بکشید
                                    <ArrowLeft size={14} />
                                </span>
                            </div>

                            <div
                                className="front-categories-carousel"
                                dir="rtl"
                                aria-label="سایر دسته‌بندی‌های خدمات"
                            >
                                {remainingCategories.map((category) => (
                                    <CategoryCard
                                        key={category.id}
                                        category={category}
                                        variant="front-category-carousel-card"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
