import React, { useState } from "react";
import {
    Search,
    MapPin,
    Scissors,
    ArrowLeft,
    ShieldCheck,
    Star,
} from "lucide-react";

export default function Hero({ searchUrl = "/barbers" }) {
    const [search, setSearch] = useState("");

    const handleSearch = (event) => {
        event.preventDefault();

        const query = search.trim();

        if (!query) {
            document.getElementById("barbers")?.scrollIntoView({
                behavior: "smooth",
            });

            return;
        }

        window.location.href = `${searchUrl}?search=${encodeURIComponent(query)}`;
    };

    return (
        <section className="front-hero" id="home">
            <div className="front-hero-overlay" />

            <div className="front-hero-container">
                <div className="front-hero-content">
                    <div className="front-hero-badge">
                        <span className="front-hero-badge-dot" />
                        تجربه‌ای متفاوت از رزرو آنلاین
                    </div>

                    <h1 className="front-hero-title">
                        استایل متفاوت،
                        <span> انتخابی هوشمندانه</span>
                    </h1>

                    <p className="front-hero-description">
                        آرایشگر حرفه‌ای خودت را پیدا کن، نمونه‌کارها را ببین و
                        در چند قدم ساده، نوبت دلخواهت را رزرو کن.
                    </p>

                    <form className="front-hero-search" onSubmit={handleSearch}>
                        <div className="front-hero-search-field">
                            <Search size={21} />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="نام آرایشگر، خدمت یا تخصص..."
                                aria-label="جستجوی آرایشگر یا خدمت"
                            />
                        </div>

                        <button type="submit">
                            <span>جستجو</span>
                            <ArrowLeft size={18} />
                        </button>
                    </form>

                    <div className="front-hero-trust">
                        <div>
                            <ShieldCheck size={17} />
                            <span>رزرو آسان و مطمئن</span>
                        </div>

                        <div>
                            <Star size={17} />
                            <span>انتخاب بر اساس نظرات واقعی</span>
                        </div>

                        <div>
                            <MapPin size={17} />
                            <span>دسترسی به آرایشگران</span>
                        </div>
                    </div>
                </div>

                <a
                    href="#services"
                    className="front-hero-scroll"
                    aria-label="مشاهده خدمات"
                >
                    <span />
                    <small>برای کشف بیشتر اسکرول کنید</small>
                </a>
            </div>
        </section>
    );
}
