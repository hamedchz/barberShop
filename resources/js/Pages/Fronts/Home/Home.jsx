import React from "react";
import { Head, Link } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowUpLeft,
    CalendarDays,
    Check,
    Clock3,
    Crown,
    Scissors,
    ShieldCheck,
    Sparkles,
    Star,
    UserRound,
} from "lucide-react";
import FrontLayout from "../Layouts/FrontLayout";

const defaultServices = [
    {
        id: 1,
        name: "اصلاح و کوتاهی مو",
        description: "کوتاهی حرفه‌ای متناسب با فرم چهره و سلیقه شما",
        icon: Scissors,
    },
    {
        id: 2,
        name: "اصلاح و فرم‌دهی ریش",
        description: "اصلاح دقیق و طراحی فرم ریش با جزئیات حرفه‌ای",
        icon: Sparkles,
    },
    {
        id: 3,
        name: "پکیج کامل آراستگی",
        description: "تجربه کامل اصلاح مو و ریش در یک نوبت",
        icon: Crown,
    },
];

const defaultBarbers = [
    { id: 1, name: "آرایشگر حرفه‌ای", role: "متخصص کوتاهی مو" },
    { id: 2, name: "آرایشگر حرفه‌ای", role: "متخصص اصلاح و گریم" },
    { id: 3, name: "آرایشگر حرفه‌ای", role: "متخصص استایل و پیرایش" },
];

const benefits = [
    {
        icon: ShieldCheck,
        title: "رزرو مطمئن",
        description: "امکان انتخاب آرایشگر و زمان دلخواه",
    },
    {
        icon: UserRound,
        title: "متخصصان حرفه‌ای",
        description: "انتخاب از میان آرایشگران مجموعه",
    },
    {
        icon: Clock3,
        title: "صرفه‌جویی در زمان",
        description: "رزرو آنلاین بدون انتظار و معطلی",
    },
];

function SectionHeading({ eyebrow, title, description }) {
    return (
        <div className="front-section-heading">
            <span className="front-eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
        </div>
    );
}

function Home({ services = [], barbers = [], reviews = [] }) {
    const displayedServices =
        services.length > 0 ? services.slice(0, 3) : defaultServices;

    const displayedBarbers =
        barbers.length > 0 ? barbers.slice(0, 3) : defaultBarbers;

    return (
        <FrontLayout>
            <Head>
                <title>خانه | Barber Studio</title>
                <meta
                    name="description"
                    content="رزرو آنلاین خدمات آرایشگاهی و انتخاب آرایشگر موردنظر شما"
                />
            </Head>

            {/* Hero */}
            <section className="front-hero" id="home">
                <div className="front-hero-overlay" />

                <div className="front-container front-hero-container">
                    <div className="front-hero-content">
                        <div className="front-hero-label">
                            <Sparkles size={16} />
                            <span>تجربه‌ای متفاوت از آراستگی</span>
                        </div>

                        <h1>
                            استایل خاص شما،
                            <br />
                            <span>امضای شخصیت شماست.</span>
                        </h1>

                        <p>
                            با انتخاب آرایشگر حرفه‌ای و رزرو آنلاین، تجربه‌ای
                            متفاوت از زیبایی، دقت و کیفیت را تجربه کنید.
                        </p>

                        <div className="front-hero-actions">
                            <a href="#booking" className="front-primary-button">
                                <CalendarDays size={19} />
                                رزرو نوبت
                                <ArrowLeft size={17} />
                            </a>

                            <a
                                href="#services"
                                className="front-outline-button"
                            >
                                مشاهده خدمات
                            </a>
                        </div>

                        <div className="front-hero-features">
                            <div>
                                <Check size={16} />
                                <span>رزرو آنلاین آسان</span>
                            </div>
                            <div>
                                <Check size={16} />
                                <span>انتخاب آرایشگر</span>
                            </div>
                            <div>
                                <Check size={16} />
                                <span>مدیریت نوبت‌ها</span>
                            </div>
                        </div>
                    </div>

                    <div className="front-hero-decoration">
                        <div className="front-hero-decoration-inner">
                            <Scissors size={62} strokeWidth={1} />
                            <span>YOUR STYLE</span>
                            <strong>YOUR SIGNATURE</strong>
                        </div>
                    </div>
                </div>

                <a href="#services" className="front-scroll-indicator">
                    <span>مشاهده بیشتر</span>
                    <ArrowUpLeft size={17} />
                </a>
            </section>

            {/* Benefits */}
            <section className="front-benefits">
                <div className="front-container front-benefits-grid">
                    {benefits.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <div className="front-benefit-item" key={index}>
                                <span className="front-benefit-icon">
                                    <Icon size={23} />
                                </span>

                                <div>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Services */}
            <section className="front-section front-services" id="services">
                <div className="front-container">
                    <SectionHeading
                        eyebrow="OUR SERVICES"
                        title="خدمات تخصصی ما"
                        description="برای داشتن ظاهری آراسته، خدمات موردنظر خود را انتخاب کنید."
                    />

                    <div className="front-services-grid">
                        {displayedServices.map((service, index) => {
                            const Icon = service.icon || Scissors;

                            return (
                                <article
                                    className="front-service-card"
                                    key={service.id ?? index}
                                >
                                    <div className="front-service-icon">
                                        <Icon size={27} strokeWidth={1.6} />
                                    </div>

                                    <span className="front-card-number">
                                        0{index + 1}
                                    </span>

                                    <h3>{service.name}</h3>

                                    <p>
                                        {service.description ||
                                            "با استفاده از خدمات تخصصی و تجربه آرایشگران حرفه‌ای"}
                                    </p>

                                    {service.price && (
                                        <div className="front-service-price">
                                            <strong>{service.price}</strong>
                                            <span>تومان</span>
                                        </div>
                                    )}

                                    <a
                                        href="#booking"
                                        className="front-card-link"
                                    >
                                        انتخاب این خدمت
                                        <ArrowLeft size={16} />
                                    </a>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* About */}
            <section className="front-about" id="about">
                <div className="front-container front-about-grid">
                    <div className="front-about-visual">
                        <div className="front-about-image">
                            <div className="front-about-image-caption">
                                <Scissors size={25} />
                                <span>ART OF GROOMING</span>
                            </div>
                        </div>

                        <div className="front-about-stamp">
                            <Crown size={27} />
                            <span>کیفیت</span>
                            <strong>در جزئیات</strong>
                        </div>
                    </div>

                    <div className="front-about-content">
                        <span className="front-eyebrow">ABOUT OUR STUDIO</span>

                        <h2>
                            آراستگی فقط یک انتخاب نیست؛
                            <span> یک سبک زندگی است.</span>
                        </h2>

                        <p>
                            ما تلاش می‌کنیم تجربه‌ای ساده، حرفه‌ای و لذت‌بخش از
                            خدمات آرایشگاهی برای شما فراهم کنیم. از انتخاب خدمت
                            تا انتخاب آرایشگر و زمان مراجعه، همه‌چیز به‌سادگی و
                            به‌صورت آنلاین در دسترس شماست.
                        </p>

                        <div className="front-about-points">
                            <div>
                                <Check size={17} />
                                انتخاب خدمات متناسب با سلیقه شما
                            </div>
                            <div>
                                <Check size={17} />
                                مشاهده آرایشگران و تخصص آن‌ها
                            </div>
                            <div>
                                <Check size={17} />
                                رزرو و مدیریت نوبت به‌صورت آنلاین
                            </div>
                        </div>

                        <a href="#barbers" className="front-text-link">
                            آشنایی با آرایشگران
                            <ArrowLeft size={17} />
                        </a>
                    </div>
                </div>
            </section>

            {/* Barbers */}
            <section className="front-section front-barbers" id="barbers">
                <div className="front-container">
                    <SectionHeading
                        eyebrow="OUR BARBERS"
                        title="با آرایشگران ما آشنا شوید"
                        description="آرایشگر موردنظر خود را انتخاب کنید و برای دریافت خدمات نوبت بگیرید."
                    />

                    <div className="front-barbers-grid">
                        {displayedBarbers.map((barber, index) => {
                            const barberName =
                                barber.user?.name || barber.name || "آرایشگر";

                            return (
                                <article
                                    className="front-barber-card"
                                    key={barber.id ?? index}
                                >
                                    <div className="front-barber-avatar">
                                        {barber.avatar_url || barber.avatar ? (
                                            <img
                                                src={
                                                    barber.avatar_url ||
                                                    barber.avatar
                                                }
                                                alt={barberName}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <UserRound
                                                size={58}
                                                strokeWidth={1}
                                            />
                                        )}

                                        <span className="front-barber-index">
                                            0{index + 1}
                                        </span>
                                    </div>

                                    <div className="front-barber-info">
                                        <h3>{barberName}</h3>
                                        <p>
                                            {barber.specialty ||
                                                barber.title ||
                                                "متخصص خدمات آرایشگاهی"}
                                        </p>

                                        {barber.rating && (
                                            <div className="front-barber-rating">
                                                <Star
                                                    size={15}
                                                    fill="currentColor"
                                                />
                                                <span>{barber.rating}</span>
                                            </div>
                                        )}

                                        <a
                                            href={barber.show_url || "#booking"}
                                            className="front-card-link"
                                        >
                                            مشاهده و رزرو
                                            <ArrowLeft size={16} />
                                        </a>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Reviews */}
            {reviews.length > 0 && (
                <section className="front-section front-reviews">
                    <div className="front-container">
                        <SectionHeading
                            eyebrow="CUSTOMER REVIEWS"
                            title="تجربه مشتریان ما"
                            description="نظرات افرادی که از خدمات مجموعه استفاده کرده‌اند."
                        />

                        <div className="front-reviews-grid">
                            {reviews.slice(0, 3).map((review, index) => (
                                <article
                                    className="front-review-card"
                                    key={review.id ?? index}
                                >
                                    <div className="front-review-stars">
                                        {Array.from({
                                            length: Math.min(
                                                5,
                                                Math.max(
                                                    0,
                                                    Number(review.rating) || 0,
                                                ),
                                            ),
                                        }).map((_, starIndex) => (
                                            <Star
                                                key={starIndex}
                                                size={16}
                                                fill="currentColor"
                                            />
                                        ))}
                                    </div>

                                    <p>
                                        {review.comment || review.description}
                                    </p>

                                    <strong>
                                        {review.user?.name ||
                                            review.user_name ||
                                            "مشتری"}
                                    </strong>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Booking CTA */}
            <section className="front-booking-cta" id="booking">
                <div className="front-container front-booking-content">
                    <div>
                        <span className="front-eyebrow">
                            YOUR NEXT APPOINTMENT
                        </span>

                        <h2>
                            وقتشه برای استایل جدیدت
                            <br />
                            <span>یک قدم برداری.</span>
                        </h2>

                        <p>
                            خدمت و آرایشگر موردنظرت را انتخاب کن و نوبتت را
                            آنلاین رزرو کن.
                        </p>
                    </div>

                    <a href="#services" className="front-primary-button">
                        شروع رزرو نوبت
                        <ArrowLeft size={18} />
                    </a>
                </div>
            </section>
        </FrontLayout>
    );
}

export default Home;
