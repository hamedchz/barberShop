import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import Search from "../../../Components/Search";
import {
    Filter,
    X,
    MapPin,
    Award,
    Star,
    Wifi,
    ChevronDown,
    SlidersHorizontal,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function BarbersFilters({ filters, cities }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCity, setSelectedCity] = useState(filters?.city || "");
    const [selectedRating, setSelectedRating] = useState(
        filters?.min_rating || "",
    );
    const [onlineOnly, setOnlineOnly] = useState(filters?.online_only || false);

    // ============ تعداد فیلترهای فعال ============
    const activeFiltersCount = [
        filters?.city,
        filters?.min_rating,
        filters?.online_only ? "online" : null,
    ].filter(Boolean).length;

    // ============ جستجو ============
    const handleSearch = (term) => {
        setIsSearching(true);
        router.get(
            "/barbers",
            {
                search: term,
                city: selectedCity,
                min_rating: selectedRating,
                online_only: onlineOnly ? 1 : 0,
                sort: filters?.sort,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    // ============ فیلتر شهر ============
    const handleCityChange = (city) => {
        setSelectedCity(city);
        router.get(
            "/barbers",
            {
                search: searchTerm,
                city: city,
                min_rating: selectedRating,
                online_only: onlineOnly ? 1 : 0,
                sort: filters?.sort,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // ============ فیلتر امتیاز ============
    const handleRatingChange = (rating) => {
        const newRating = selectedRating === rating ? "" : rating;
        setSelectedRating(newRating);
        router.get(
            "/barbers",
            {
                search: searchTerm,
                city: selectedCity,
                min_rating: newRating,
                online_only: onlineOnly ? 1 : 0,
                sort: filters?.sort,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // ============ فیلتر آنلاین ============
    const handleOnlineToggle = () => {
        const newValue = !onlineOnly;
        setOnlineOnly(newValue);
        router.get(
            "/barbers",
            {
                search: searchTerm,
                city: selectedCity,
                min_rating: selectedRating,
                online_only: newValue ? 1 : 0,
                sort: filters?.sort,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // ============ پاک کردن همه ============
    const handleClearAll = () => {
        setSearchTerm("");
        setSelectedCity("");
        setSelectedRating("");
        setOnlineOnly(false);

        router.get(
            "/barbers",
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <div className="barbers-filters">
            {/* ============ نوار جستجو + فیلترها ============ */}
            <div className="barbers-toolbar">
                {/* سمت راست: جستجو */}
                <div className="barbers-search-wrapper">
                    <Search
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onSearch={handleSearch}
                        placeholder="جستجوی نام آرایشگر، تخصص ..."
                        delay={500}
                        isLoading={isSearching}
                    />
                </div>

                {/* سمت چپ: دکمه‌های فیلتر */}
                <div className="barbers-toolbar-actions">
                    <button
                        className={`filter-toggle-btn ${
                            showFilters ? "active" : ""
                        }`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <SlidersHorizontal size={16} />
                        فیلترها
                        {activeFiltersCount > 0 && (
                            <span className="filter-count-badge">
                                {toPersianNumber(activeFiltersCount)}
                            </span>
                        )}
                    </button>

                    {activeFiltersCount > 0 && (
                        <button
                            className="clear-filters-btn"
                            onClick={handleClearAll}
                        >
                            <X size={16} />
                            پاک کردن
                        </button>
                    )}
                </div>
            </div>

            {/* ============ پنل فیلترها ============ */}
            {showFilters && (
                <div className="barbers-filters-panel">
                    {/* فیلتر شهر */}
                    <div className="filter-group">
                        <label className="filter-label">
                            <MapPin size={14} />
                            شهر
                        </label>
                        <div className="city-chips">
                            <button
                                className={`city-chip ${
                                    !selectedCity ? "active" : ""
                                }`}
                                onClick={() => handleCityChange("")}
                            >
                                همه
                            </button>
                            {cities.map((city) => (
                                <button
                                    key={city}
                                    className={`city-chip ${
                                        selectedCity === city ? "active" : ""
                                    }`}
                                    onClick={() => handleCityChange(city)}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* فیلتر امتیاز */}
                    <div className="filter-group">
                        <label className="filter-label">
                            <Star size={14} />
                            حداقل امتیاز
                        </label>
                        <div className="rating-chips">
                            {[4.5, 4, 3.5, 3].map((rating) => (
                                <button
                                    key={rating}
                                    className={`rating-chip ${
                                        selectedRating == rating ? "active" : ""
                                    }`}
                                    onClick={() => handleRatingChange(rating)}
                                >
                                    <Star
                                        size={12}
                                        fill="#fbbf24"
                                        color="#fbbf24"
                                    />
                                    {toPersianNumber(rating)} و بالاتر
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* فیلتر آنلاین */}
                    <div className="filter-group">
                        <label className="filter-label">
                            <Wifi size={14} />
                            وضعیت
                        </label>
                        <button
                            className={`online-toggle-btn ${
                                onlineOnly ? "active" : ""
                            }`}
                            onClick={handleOnlineToggle}
                        >
                            <Wifi size={14} />
                            فقط آرایشگران آنلاین
                            {onlineOnly && <span className="online-dot"></span>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
