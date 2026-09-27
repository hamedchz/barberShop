import React, { useState, useMemo } from "react";
import { Head, Link } from "@inertiajs/react";
import PublicLayout from "../Layouts/PublicLayout";
import HeroSection from "../Components/HeroSection";
import BarberCard from "../Components/BarberCard";
import Search from "../../../Components/Search";

import { Scissors, TrendingUp, Award } from "lucide-react";

export default function BarbersIndex({ auth, barbers }) {
    const [searchTerm, setSearchTerm] = useState("");
    const barbersList = barbers.data || [];

    // ============ فیلتر سمت کلاینت ============
    const filteredBarbers = useMemo(() => {
        if (!searchTerm.trim()) return barbersList;
        const term = searchTerm.toLowerCase();
        return barbersList.filter((b) => b.name?.toLowerCase().includes(term));
    }, [barbersList, searchTerm]);

    return (
        <PublicLayout>
            <Head title="آرایشگران" />

            {/* ============ Hero Section ============ */}
            {!searchTerm && <HeroSection />}

            {/* ============ بخش آرایشگران ============ */}
            <section className="barbers-public-section" id="barbers">
                <div className="section-container">
                    {/* هدر بخش */}
                    <div className="section-header">
                        <span className="section-badge">
                            <Award size={14} />
                            بهترین‌های شهر
                        </span>
                        <h2 className="section-title">آرایشگران حرفه‌ای</h2>
                        <p className="section-subtitle">
                            از بین آرایشگران متخصص، مورد نظر خود را انتخاب کنید
                            و نوبت بگیرید.
                        </p>
                    </div>

                    {/* جستجو */}
                    <div className="barbers-search-wrapper">
                        <Search
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="جستجوی نام آرایشگر..."
                            delay={300}
                        />
                    </div>

                    {/* لیست آرایشگران */}
                    {filteredBarbers.length === 0 ? (
                        <div className="public-empty-state">
                            <Scissors size={48} />
                            <h3>آرایشگری پیدا نشد</h3>
                            <p>با عبارت دیگری جستجو کنید.</p>
                        </div>
                    ) : (
                        <div className="barbers-public-grid">
                            {filteredBarbers.map((barber) => (
                                <BarberCard key={barber.id} barber={barber} />
                            ))}
                        </div>
                    )}

                    {/* صفحه‌بندی */}
                    {barbers.links && barbers.links.length > 3 && (
                        <div className="public-pagination">
                            {barbers.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || "#"}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`public-page-link ${
                                        link.active ? "active" : ""
                                    }`}
                                    style={{
                                        opacity: link.url ? 1 : 0.5,
                                        pointerEvents: link.url
                                            ? "auto"
                                            : "none",
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ============ بخش ویژگی‌ها ============ */}
            <section className="features-section">
                <div className="section-container">
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon green">
                                <Scissors size={24} />
                            </div>
                            <h3>آرایشگران متخصص</h3>
                            <p>
                                بیش از ۵۰ آرایشگر حرفه‌ای در سراسر شهر آماده
                                خدمت‌رسانی به شما هستند.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon blue">
                                <TrendingUp size={24} />
                            </div>
                            <h3>رزرو سریع و آسان</h3>
                            <p>
                                در کمتر از ۳۰ ثانیه نوبت خود را رزرو کنید. بدون
                                تماس تلفنی، بدون انتظار.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon purple">
                                <Award size={24} />
                            </div>
                            <h3>رضایت ۱۰۰٪</h3>
                            <p>
                                بیش از ۱۰۰۰ رزرو موفق با امتیاز ۴.۸ از ۵. رضایت
                                شما اولویت ماست.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
