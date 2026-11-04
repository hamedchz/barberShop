import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import PublicLayout from "../../../Layouts/PublicLayout";
import {
    Search,
    MapPin,
    Star,
    Filter,
    X,
    SlidersHorizontal,
    Scissors,
    ChevronDown,
    User,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";

export default function BarbersIndex({
    barbers,
    filters,
    cities = [],
    services = [],
}) {
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || "");

    // ============ اعمال فیلتر ============
    const applyFilters = (newFilters = {}) => {
        router.get(
            route("public.barbers.index"),
            { ...filters, ...newFilters },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters({ search: searchQuery });
    };

    const clearFilters = () => {
        setSearchQuery("");
        router.get(
            route("public.barbers.index"),
            {},
            {
                preserveState: false,
            },
        );
    };

    const hasActiveFilters =
        filters.search ||
        filters.city ||
        filters.service ||
        filters.rating ||
        filters.online_only;

    return (
        <PublicLayout>
            <Head title="لیست آرایشگران" />

            <div className="barbers-list-page">
                {/* Header */}
                <div className="page-hero">
                    <div className="page-hero-content">
                        <h1>آرایشگران</h1>
                        <p>
                            {toPersianNumber(barbers.total)} آرایشگر حرفه‌ای در
                            دسترس
                        </p>
                    </div>
                </div>

                <div className="page-container">
                    {/* Toolbar */}
                    <div className="barbers-toolbar">
                        <form
                            onSubmit={handleSearch}
                            className="barbers-search"
                        >
                            <div className="search-input-wrapper">
                                <Search size={18} />
                                <input
                                    type="text"
                                    className="search-input"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="جستجوی نام آرایشگر..."
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="search-clear"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="barbers-toolbar-actions">
                            <button
                                type="button"
                                className={`filter-toggle ${
                                    showFilters ? "active" : ""
                                }`}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <SlidersHorizontal size={16} />
                                فیلترها
                                {hasActiveFilters && (
                                    <span className="filter-count">
                                        {
                                            [
                                                filters.city,
                                                filters.service,
                                                filters.rating,
                                                filters.online_only,
                                            ].filter(Boolean).length
                                        }
                                    </span>
                                )}
                            </button>

                            <div className="sort-wrapper">
                                <select
                                    className="sort-select"
                                    value={filters.sort || "rating"}
                                    onChange={(e) =>
                                        applyFilters({
                                            sort: e.target.value,
                                        })
                                    }
                                >
                                    <option value="rating">
                                        بهترین امتیاز
                                    </option>
                                    <option value="reviews">
                                        بیشترین نظرات
                                    </option>
                                    <option value="newest">جدیدترین</option>
                                </select>
                                <ChevronDown
                                    size={14}
                                    className="sort-chevron"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="filters-panel">
                            <div className="filters-grid">
                                {/* شهر */}
                                <div className="filter-group">
                                    <label className="filter-label">
                                        <MapPin size={14} />
                                        شهر
                                    </label>
                                    <select
                                        className="filter-select"
                                        value={filters.city || ""}
                                        onChange={(e) =>
                                            applyFilters({
                                                city:
                                                    e.target.value || undefined,
                                            })
                                        }
                                    >
                                        <option value="">همه شهرها</option>
                                        {cities.map((city) => (
                                            <option key={city} value={city}>
                                                {city}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* خدمات */}
                                <div className="filter-group">
                                    <label className="filter-label">
                                        <Scissors size={14} />
                                        خدمت
                                    </label>
                                    <select
                                        className="filter-select"
                                        value={filters.service || ""}
                                        onChange={(e) =>
                                            applyFilters({
                                                service:
                                                    e.target.value || undefined,
                                            })
                                        }
                                    >
                                        <option value="">همه خدمات</option>
                                        {services.map((service) => (
                                            <option
                                                key={service.id}
                                                value={service.id}
                                            >
                                                {service.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* امتیاز */}
                                <div className="filter-group">
                                    <label className="filter-label">
                                        <Star size={14} />
                                        حداقل امتیاز
                                    </label>
                                    <select
                                        className="filter-select"
                                        value={filters.rating || ""}
                                        onChange={(e) =>
                                            applyFilters({
                                                rating:
                                                    e.target.value || undefined,
                                            })
                                        }
                                    >
                                        <option value="">همه</option>
                                        <option value="4">۴ و بالاتر</option>
                                        <option value="4.5">
                                            ۴.۵ و بالاتر
                                        </option>
                                        <option value="3">۳ و بالاتر</option>
                                    </select>
                                </div>

                                {/* آنلاین */}
                                <div className="filter-group">
                                    <label className="filter-label">
                                        وضعیت
                                    </label>
                                    <label className="filter-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={
                                                filters.online_only || false
                                            }
                                            onChange={(e) =>
                                                applyFilters({
                                                    online_only:
                                                        e.target.checked ||
                                                        undefined,
                                                })
                                            }
                                        />
                                        <span className="checkbox-box" />
                                        فقط آنلاین
                                    </label>
                                </div>

                                {/* پاک کردن */}
                                {hasActiveFilters && (
                                    <div className="filter-group filter-clear">
                                        <button
                                            type="button"
                                            className="clear-btn"
                                            onClick={clearFilters}
                                        >
                                            <X size={14} />
                                            پاک کردن فیلترها
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {barbers.data.length > 0 ? (
                        <>
                            <div className="barbers-grid">
                                {barbers.data.map((barber) => (
                                    <Link
                                        key={barber.id}
                                        href={route(
                                            "public.barbers.show",
                                            barber.id,
                                        )}
                                        className="barber-card"
                                    >
                                        <div className="barber-card-avatar">
                                            {barber.avatar ? (
                                                <img
                                                    src={barber.avatar}
                                                    alt={barber.name}
                                                />
                                            ) : (
                                                <User size={32} />
                                            )}
                                            {barber.is_online && (
                                                <span className="online-dot" />
                                            )}
                                        </div>

                                        <div className="barber-card-content">
                                            <h3 className="barber-card-name">
                                                {barber.name}
                                            </h3>
                                            {barber.specialty && (
                                                <p className="barber-card-specialty">
                                                    {barber.specialty}
                                                </p>
                                            )}
                                            <div className="barber-card-rating">
                                                <Star
                                                    size={14}
                                                    fill="currentColor"
                                                />
                                                <span>
                                                    {toPersianNumber(
                                                        barber.rating,
                                                    )}
                                                </span>
                                                <span className="rating-count">
                                                    (
                                                    {toPersianNumber(
                                                        barber.reviews_count,
                                                    )}
                                                    )
                                                </span>
                                            </div>
                                            {barber.city && (
                                                <div className="barber-card-city">
                                                    <MapPin size={12} />
                                                    {barber.city}
                                                </div>
                                            )}

                                            {barber.services?.length > 0 && (
                                                <div className="barber-card-services">
                                                    {barber.services
                                                        .slice(0, 2)
                                                        .map((s, i) => (
                                                            <span
                                                                key={i}
                                                                className="service-tag"
                                                            >
                                                                {s}
                                                            </span>
                                                        ))}
                                                    {barber.services.length >
                                                        2 && (
                                                        <span className="service-tag more">
                                                            +
                                                            {toPersianNumber(
                                                                barber.services
                                                                    .length - 2,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="barber-card-cta">
                                            رزرو نوبت
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {barbers.last_page > 1 && (
                                <div className="pagination">
                                    {barbers.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || "#"}
                                            className={`pagination-item ${
                                                link.active ? "active" : ""
                                            } ${!link.url ? "disabled" : ""}`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-results">
                            <Search size={48} />
                            <h3>آرایشگری یافت نشد</h3>
                            <p>
                                فیلترها را تغییر دهید یا همه فیلترها را پاک
                                کنید.
                            </p>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={clearFilters}
                                >
                                    پاک کردن فیلترها
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
