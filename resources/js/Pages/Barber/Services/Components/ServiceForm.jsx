import React, { useState, useRef } from "react";
import { useForm, Link } from "@inertiajs/react";

import { toPersianNumber } from "../../../../utils/persianNumbers";

import {
    Save,
    X,
    AlertCircle,
    Package,
    Scissors,
    Palette,
    Sparkles,
    Brush,
    Droplet,
    Flower,
    Crown,
    Star,
    Wind,
    Sun,
    Zap,
    Heart,
    Clock,
    DollarSign,
    CheckCircle2,
    Lock,
    Image as ImageIcon,
    Info,
} from "lucide-react";

const ICON_COMPONENTS = {
    Scissors,
    Palette,
    Sparkles,
    Brush,
    Droplet,
    Flower,
    Crown,
    Star,
    Wind,
    Sun,
    Zap,
    Heart,
};

export default function ServiceForm({
    mode = "create",
    service = null,
    availableCategories = [],
    allCategoriesCount = 0,
}) {
    
    const isEdit = mode === "edit";
    const category = isEdit ? service?.category : null;

    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? "put" : undefined,
        category_id: isEdit ? category?.id : "",
        price: isEdit ? service?.price : "",
        duration: isEdit ? service?.duration : "",
        is_active: isEdit ? service?.is_active : true,
    });

    // ============ اعتبارسنجی قیمت ============
    const priceError = () => {
        if (!category || !data.price) return null;
        const price = Number(data.price);

        if (category.min_price && price < category.min_price) {
            return `قیمت نمی‌تواند کمتر از ${toPersianNumber(
                category.min_price.toLocaleString(),
            )} تومان باشد.`;
        }

        if (category.max_price && price > category.max_price) {
            return `قیمت نمی‌تواند بیشتر از ${toPersianNumber(
                category.max_price.toLocaleString(),
            )} تومان باشد.`;
        }

        return null;
    };

    // ============ ارسال ============
    const handleSubmit = (e) => {
        e.preventDefault();

        const url = isEdit
            ? route("barber.services.update", service.id)
            : route("barber.services.store");

        post(url, {
            preserveScroll: true,
        });
    };

    // ============ انتخاب دسته‌بندی (فقط create) ============
    const handleCategorySelect = (cat) => {
        setData((prev) => ({
            ...prev,
            category_id: cat.id,
            // پر کردن خودکار قیمت و مدت پیشنهادی
            price: prev.price || cat.min_price || "",
            duration: prev.duration || cat.suggested_duration || "",
        }));
    };

    // ============ دسته‌بندی انتخاب‌شده (create) ============
    const selectedCategory = !isEdit
        ? availableCategories.find((c) => c.id === Number(data.category_id))
        : category;

    return (
        <form onSubmit={handleSubmit} className="sv-form">
            {/* Error Banner */}
            {Object.keys(errors).length > 0 && (
                <div className="sv-form-error-banner">
                    <AlertCircle size={18} />
                    <div>
                        <strong>لطفاً خطاهای زیر را برطرف کنید:</strong>
                        <ul>
                            {Object.values(errors).map((error, idx) => (
                                <li key={idx}>{error}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="sv-form-header">
                <div className="sv-form-header-icon">
                    <Package size={24} />
                </div>
                <div>
                    <h1>
                        {isEdit
                            ? `ویرایش: ${category?.name}`
                            : "افزودن خدمت جدید"}
                    </h1>
                    <p>
                        {isEdit
                            ? "قیمت و مدت زمان خدمت خود را تنظیم کنید"
                            : "از دسته‌بندی‌های تعریف‌شده توسط ادمین انتخاب کنید"}
                    </p>
                </div>
            </div>

            {/* ============ CREATE: انتخاب دسته‌بندی ============ */}
            {!isEdit && (
                <div className="sv-form-section">
                    <div className="sv-section-header">
                        <h2>۱. انتخاب خدمت</h2>
                        <p>
                            خدمتی که می‌خواهید ارائه دهید را انتخاب کنید
                            {allCategoriesCount > 0 && (
                                <span className="sv-info-badge">
                                    <Info size={12} />
                                    {toPersianNumber(
                                        availableCategories.length,
                                    )}{" "}
                                    از {toPersianNumber(allCategoriesCount)}{" "}
                                    دسته در دسترس
                                </span>
                            )}
                        </p>
                    </div>

                    {availableCategories.length > 0 ? (
                        <div className="sv-category-grid-large">
                            {availableCategories.map((cat) => {
                                const Icon =
                                    ICON_COMPONENTS[cat.icon] || Scissors;
                                const isSelected =
                                    Number(data.category_id) === cat.id;

                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        className={`sv-category-card-large ${cat.color} ${
                                            isSelected ? "selected" : ""
                                        }`}
                                        onClick={() =>
                                            handleCategorySelect(cat)
                                        }
                                    >
                                        {cat.image_url && (
                                            <div className="sv-category-image">
                                                <img
                                                    src={cat.image_url}
                                                    alt={cat.name}
                                                />
                                            </div>
                                        )}

                                        <div className="sv-category-content">
                                            <div
                                                className={`sv-category-icon-large ${cat.color}`}
                                            >
                                                <Icon size={20} />
                                            </div>
                                            <div className="sv-category-info">
                                                <h4>{cat.name}</h4>
                                                {cat.description && (
                                                    <p>{cat.description}</p>
                                                )}
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="sv-category-check-circle">
                                                <CheckCircle2 size={18} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    {/* ) : (
                        <div className="sv-categories-empty">
                            <Package size={48} />
                            <h4>همه دسته‌بندی‌ها را اضافه کرده‌اید</h4>
                            <p>
                                شما همه دسته‌بندی‌های موجود را به لیست خدمات خود
                                اضافه کرده‌اید.
                            </p>
                            <Link
                                href={route("barber.services.index")}
                                className="sv-btn-secondary"
                            >
                                بازگشت به لیست خدمات
                            </Link>
                        </div>
                    )} */}

                    {errors.category_id && (
                        <span className="sv-error">
                            <AlertCircle size={12} />
                            {errors.category_id}
                        </span>
                    )}
                </div>
            )}

            {/* ============ CREATE: پس از انتخاب دسته ============ */}
            {!isEdit && selectedCategory && (
                <div className="sv-form-section sv-fade-in">
                    <div className="sv-section-header">
                        <h2>۲. قیمت و مدت زمان</h2>
                        <p>
                            قیمت و مدت زمان خدمت خود را تعیین کنید
                            {selectedCategory.description && (
                                <span className="sv-section-desc">
                                    {selectedCategory.description}
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="sv-selected-category-preview">
                        <div
                            className={`sv-preview-icon-large ${selectedCategory.color}`}
                        >
                            {React.createElement(
                                ICON_COMPONENTS[selectedCategory.icon] ||
                                    Scissors,
                                { size: 24 },
                            )}
                        </div>
                        <div>
                            <strong>{selectedCategory.name}</strong>
                            {selectedCategory.description && (
                                <p>{selectedCategory.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="sv-form-row">
                        <div className="sv-form-group">
                            <label className="sv-label">
                                <DollarSign size={14} />
                                قیمت (تومان)
                                <span className="sv-required">*</span>
                            </label>
                            <input
                                type="number"
                                className={`sv-input ${
                                    errors.price || priceError() ? "error" : ""
                                }`}
                                value={data.price}
                                onChange={(e) =>
                                    setData("price", e.target.value)
                                }
                                placeholder={
                                    selectedCategory.min_price
                                        ? selectedCategory.min_price.toString()
                                        : "50000"
                                }
                                min={0}
                            />
                            {(errors.price || priceError()) && (
                                <span className="sv-error">
                                    <AlertCircle size={12} />
                                    {errors.price || priceError()}
                                </span>
                            )}
                            {(selectedCategory.min_price ||
                                selectedCategory.max_price) && (
                                <span className="sv-price-range">
                                    محدوده قیمت:{" "}
                                    {selectedCategory.min_price &&
                                        toPersianNumber(
                                            selectedCategory.min_price.toLocaleString(),
                                        )}
                                    {selectedCategory.min_price &&
                                        selectedCategory.max_price &&
                                        " تا "}
                                    {selectedCategory.max_price &&
                                        toPersianNumber(
                                            selectedCategory.max_price.toLocaleString(),
                                        )}{" "}
                                    تومان
                                </span>
                            )}
                        </div>

                        <div className="sv-form-group">
                            <label className="sv-label">
                                <Clock size={14} />
                                مدت زمان (دقیقه)
                                <span className="sv-required">*</span>
                            </label>
                            <input
                                type="number"
                                className={`sv-input ${
                                    errors.duration ? "error" : ""
                                }`}
                                value={data.duration}
                                onChange={(e) =>
                                    setData("duration", e.target.value)
                                }
                                placeholder={
                                    selectedCategory.suggested_duration
                                        ? selectedCategory.suggested_duration.toString()
                                        : "30"
                                }
                                min={5}
                                max={480}
                            />
                            {errors.duration && (
                                <span className="sv-error">
                                    <AlertCircle size={12} />
                                    {errors.duration}
                                </span>
                            )}
                            {selectedCategory.suggested_duration && (
                                <span className="sv-price-range">
                                    مدت پیشنهادی:{" "}
                                    {toPersianNumber(
                                        selectedCategory.suggested_duration,
                                    )}{" "}
                                    دقیقه
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ============ EDIT: اطلاعات دسته (غیرقابل تغییر) ============ */}
            {isEdit && (
                <>
                    {/* کارت اطلاعات دسته‌بندی */}
                    <div className="sv-form-section">
                        <div className="sv-section-header">
                            <h2>
                                <Lock size={16} />
                                اطلاعات خدمت
                            </h2>
                            <p>
                                نام، تصویر و توضیحات توسط ادمین تعیین شده و قابل
                                تغییر نیست
                            </p>
                        </div>

                        <div className="sv-locked-category">
                            {category?.image_url && (
                                <div className="sv-locked-image">
                                    <img
                                        src={category.image_url}
                                        alt={category.name}
                                    />
                                </div>
                            )}

                            <div className="sv-locked-content">
                                <div
                                    className={`sv-locked-icon ${category?.color}`}
                                >
                                    {React.createElement(
                                        ICON_COMPONENTS[category?.icon] ||
                                            Scissors,
                                        { size: 22 },
                                    )}
                                </div>
                                <h3>{category?.name}</h3>
                                {category?.description && (
                                    <p>{category.description}</p>
                                )}
                                <span className="sv-locked-badge">
                                    <Lock size={12} />
                                    تعریف‌شده توسط ادمین
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* قیمت و مدت */}
                    <div className="sv-form-section">
                        <div className="sv-section-header">
                            <h2>قیمت و مدت زمان</h2>
                            <p>قیمت و مدت زمان خدمت خود را تنظیم کنید</p>
                        </div>

                        <div className="sv-form-row">
                            <div className="sv-form-group">
                                <label className="sv-label">
                                    <DollarSign size={14} />
                                    قیمت (تومان)
                                    <span className="sv-required">*</span>
                                </label>
                                <input
                                    type="number"
                                    className={`sv-input ${
                                        errors.price || priceError()
                                            ? "error"
                                            : ""
                                    }`}
                                    value={data.price}
                                    onChange={(e) =>
                                        setData("price", e.target.value)
                                    }
                                    placeholder="50000"
                                    min={0}
                                />
                                {(errors.price || priceError()) && (
                                    <span className="sv-error">
                                        <AlertCircle size={12} />
                                        {errors.price || priceError()}
                                    </span>
                                )}
                                {(category?.min_price ||
                                    category?.max_price) && (
                                    <span className="sv-price-range">
                                        محدوده قیمت:{" "}
                                        {category?.min_price &&
                                            toPersianNumber(
                                                category.min_price.toLocaleString(),
                                            )}
                                        {category?.min_price &&
                                            category?.max_price &&
                                            " تا "}
                                        {category?.max_price &&
                                            toPersianNumber(
                                                category.max_price.toLocaleString(),
                                            )}{" "}
                                        تومان
                                    </span>
                                )}
                            </div>

                            <div className="sv-form-group">
                                <label className="sv-label">
                                    <Clock size={14} />
                                    مدت زمان (دقیقه)
                                    <span className="sv-required">*</span>
                                </label>
                                <input
                                    type="number"
                                    className={`sv-input ${
                                        errors.duration ? "error" : ""
                                    }`}
                                    value={data.duration}
                                    onChange={(e) =>
                                        setData("duration", e.target.value)
                                    }
                                    placeholder="30"
                                    min={5}
                                    max={480}
                                />
                                {errors.duration && (
                                    <span className="sv-error">
                                        <AlertCircle size={12} />
                                        {errors.duration}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ============ تنظیمات (مشترک) ============ */}
            <div className="sv-form-section">
                <div className="sv-section-header">
                    <h2>وضعیت نمایش</h2>
                </div>

                <label className="sv-toggle">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData("is_active", e.target.checked)}
                    />
                    <span className="sv-toggle-track">
                        <span className="sv-toggle-thumb" />
                    </span>
                    <span className="sv-toggle-label">
                        {data.is_active ? "فعال" : "غیرفعال"}
                    </span>
                </label>

                <p className="sv-toggle-hint">
                    {data.is_active
                        ? "این خدمت در صفحه شما نمایش داده می‌شود و قابل رزرو است."
                        : "این خدمت نمایش داده نمی‌شود و قابل رزرو نیست."}
                </p>
            </div>

            {/* ============ پیش‌نمایش زنده ============ */}
            {selectedCategory && data.price && (
                <div className="sv-form-section">
                    <div className="sv-section-header">
                        <h2>پیش‌نمایش</h2>
                        <p>
                            این خدمت در صفحه عمومی شما این‌طور نمایش داده می‌شود
                        </p>
                    </div>

                    <div className="sv-preview-card-public">
                        <div className="sv-preview-card-image">
                            {selectedCategory.image_url ? (
                                <img
                                    src={selectedCategory.image_url}
                                    alt={selectedCategory.name}
                                />
                            ) : (
                                <div className="sv-preview-card-placeholder">
                                    {React.createElement(
                                        ICON_COMPONENTS[
                                            selectedCategory.icon
                                        ] || Scissors,
                                        { size: 48 },
                                    )}
                                </div>
                            )}
                            <span
                                className={`sv-preview-badge ${data.is_active ? "active" : "inactive"}`}
                            >
                                {data.is_active ? (
                                    <>
                                        <Power size={10} />
                                        فعال
                                    </>
                                ) : (
                                    <>
                                        <PowerOff size={10} />
                                        غیرفعال
                                    </>
                                )}
                            </span>
                        </div>

                        <div className="sv-preview-card-content">
                            <h3>{selectedCategory.name}</h3>
                            {selectedCategory.description && (
                                <p>{selectedCategory.description}</p>
                            )}
                            <div className="sv-preview-card-meta">
                                <span className="sv-preview-card-price">
                                    {toPersianNumber(
                                        Number(data.price).toLocaleString(),
                                    )}{" "}
                                    تومان
                                </span>
                                <span className="sv-preview-card-duration">
                                    <Clock size={12} />
                                    {toPersianNumber(data.duration)} دقیقه
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============ Actions ============ */}
            <div className="sv-form-actions">
                <Link
                    href={route("barber.services.index")}
                    className="sv-btn-cancel"
                >
                    <X size={16} />
                    انصراف
                </Link>
                <button
                    type="submit"
                    className="sv-btn-primary"
                    disabled={
                        processing ||
                        (!isEdit && !selectedCategory) ||
                        priceError() !== null
                    }
                >
                    {processing ? (
                        <span className="sv-spinner" />
                    ) : (
                        <Save size={16} />
                    )}
                    {isEdit ? "ذخیره تغییرات" : "افزودن خدمت"}
                </button>
            </div>
        </form>
    );
}
