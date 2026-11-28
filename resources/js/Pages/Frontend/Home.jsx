import React from "react";
import FrontLayout from "./FrontLayout";
import Hero from "./Components/Hero";
import ServiceCategories from "./Components/ServiceCategories";
import FeaturedBarbers from "./Components/FeaturedBarbers";
import CustomerReviews from "./Components/CustomerReviews";

export default function Home({
    auth = null,
    categories = [],
    barbers = [],
    reviews = [],
}) {
    return (
        <FrontLayout auth={auth}>
            <Hero />

            <ServiceCategories categories={categories} />

            <FeaturedBarbers barbers={barbers} />

            <section
                id="features"
                className="front-section front-features-section"
            >
                <div className="front-container">
                    <span className="front-section-eyebrow">
                        تجربه‌ای متفاوت
                    </span>

                    <h2 className="front-section-title">چرا barberApp؟</h2>

                    <div className="front-features-grid">
                        <div>
                            <span>۰۱</span>
                            <h3>رزرو آسان</h3>
                            <p>
                                بدون تماس تلفنی، زمان مناسب خودت را انتخاب کن.
                            </p>
                        </div>

                        <div>
                            <span>۰۲</span>
                            <h3>انتخاب آگاهانه</h3>
                            <p>پروفایل و نظرات تأییدشده آرایشگران را ببین.</p>
                        </div>

                        <div>
                            <span>۰۳</span>
                            <h3>مدیریت نوبت‌ها</h3>
                            <p>رزروهای خودت را به‌سادگی مدیریت کن.</p>
                        </div>

                        <div>
                            <span>۰۴</span>
                            <h3>آرایشگران حرفه‌ای</h3>
                            <p>خدمات و تخصص‌های متنوع را در یک جا پیدا کن.</p>
                        </div>
                    </div>
                </div>
            </section>

            <CustomerReviews reviews={reviews} />

            <section className="front-barber-cta">
                <div className="front-container">
                    <div>
                        <span>ویژه آرایشگران</span>

                        <h2>کسب‌وکارت را حرفه‌ای‌تر مدیریت کن</h2>

                        <p>
                            نوبت‌دهی آنلاین، مدیریت خدمات و ارتباط بهتر با
                            مشتریان.
                        </p>
                    </div>

                    <a href="/register">شروع همکاری</a>
                </div>
            </section>
        </FrontLayout>
    );
}
