import React from "react";
import { Scissors, ArrowLeft, Sparkles } from "lucide-react";

const iconMap = {
    scissors: Scissors,
    sparkles: Sparkles,
};

export default function ServiceCategories({ categories = [] }) {
    if (!categories.length) return null;

    return (
        <section className="front-section" id="services">
            <div className="front-container">
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

                    <a href="#barbers" className="front-section-more">
                        مشاهده آرایشگران
                        <ArrowLeft size={17} />
                    </a>
                </div>

                <div className="front-categories-grid">
                    {categories.map((category) => {
                        const Icon = iconMap[category.icon] || Scissors;

                        return (
                            <a
                                key={category.id}
                                href={`/services?category=${encodeURIComponent(category.slug)}`}
                                className="front-category-card"
                            >
                                <div className="front-category-image">
                                    {category.image ? (
                                        <img
                                            src={category.image_url}
                                            alt={category.name}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="front-category-placeholder">
                                            <Icon size={34} />
                                        </div>
                                    )}

                                    <span className="front-category-count">
                                        {category.services_count} خدمت
                                    </span>
                                </div>

                                <div className="front-category-info">
                                    <h3>{category.name}</h3>

                                    <span>
                                        مشاهده خدمات
                                        <ArrowLeft size={15} />
                                    </span>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
