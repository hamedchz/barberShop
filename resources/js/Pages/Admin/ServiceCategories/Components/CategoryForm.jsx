import React, { useState, useRef } from "react";
import { useForm, Link } from "@inertiajs/react";
import {
    Save,
    Upload,
    X,
    AlertCircle,
    Image as ImageIcon,
    LayoutGrid,
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
    SoapDispenserDroplet,
    TowelRack,
    ShowerHead,
    SprayCan,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";

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
    SoapDispenserDroplet,
    TowelRack,
    ShowerHead,
    SprayCan,
};

const COLOR_CLASSES = {
    green: "#10b981",
    blue: "#3b82f6",
    purple: "#8b5cf6",
    orange: "#f59e0b",
    red: "#ef4444",
    pink: "#ec4899",
    yellow: "#eab308",
    gray: "#6b7280",
};

export default function CategoryForm({
    mode = "create",
    category = null,
    colors = [],
    icons = [],
}) {
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(
        category?.image_url || null,
    );

    // ✅ useForm با همه فیلدها
    const { data, setData, post, processing, errors } = useForm({
        _method: mode === "edit" ? "put" : undefined, // ← کلید حل مشکل
        name: category?.name || "",
        description: category?.description || "",
        image: null,
        icon: category?.icon || "Scissors",
        color: category?.color || "green",
        min_price: category?.min_price ?? "",
        max_price: category?.max_price ?? "",
        suggested_duration: category?.suggested_duration ?? "",
        sort_order: category?.sort_order ?? 0,
        is_active: category?.is_active ?? true,
    });

    // ============ انتخاب تصویر ============
    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setData("image", file);

        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleImageRemove = () => {
        setData("image", null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ============ ارسال ============
    const handleSubmit = (e) => {
        e.preventDefault();

        const url =
            mode === "create"
                ? route("admin.service-categories.store")
                : route("admin.service-categories.update", category.id);

        // ✅ همیشه از post استفاده کن (با _method)
        post(url, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => {
                console.error("Validation errors:", errors);
            },
            onSuccess: () => {
                // موفق — ریدایرکت انجام می‌شود
            },
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="sc-form"
            encType="multipart/form-data"
        >
            {/* نمایش خطاهای کلی */}
            {Object.keys(errors).length > 0 && (
                <div className="sc-form-error-banner">
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
            <div className="sc-form-header">
                <div className="sc-form-header-icon">
                    <LayoutGrid size={24} />
                </div>
                <div>
                    <h1>
                        {mode === "create"
                            ? "ایجاد دسته‌بندی جدید"
                            : `ویرایش: ${category.name}`}
                    </h1>
                    <p>
                        {mode === "create"
                            ? "اطلاعات دسته‌بندی خدمت را وارد کنید"
                            : "اطلاعات دسته‌بندی را بروزرسانی کنید"}
                    </p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="sc-form-grid">
                {/* ستون اصلی */}
                <div className="sc-form-main">
                    {/* اطلاعات پایه */}
                    <div className="sc-form-section">
                        <div className="sc-section-header">
                            <h2>اطلاعات پایه</h2>
                        </div>

                        <div className="sc-form-group">
                            <label className="sc-label">
                                نام دسته‌بندی
                                <span className="sc-required">*</span>
                            </label>
                            <input
                                type="text"
                                className={`sc-input ${errors.name ? "error" : ""}`}
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                placeholder="مثال: کوتاهی مو"
                                maxLength={100}
                            />
                            {errors.name && (
                                <span className="sc-error">
                                    <AlertCircle size={12} />
                                    {errors.name}
                                </span>
                            )}
                        </div>

                        <div className="sc-form-group">
                            <label className="sc-label">توضیحات</label>
                            <textarea
                                className={`sc-textarea ${errors.description ? "error" : ""}`}
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                placeholder="توضیح کوتاه درباره این دسته‌بندی..."
                                rows={4}
                                maxLength={1000}
                            />
                            <div className="sc-form-footer">
                                {errors.description && (
                                    <span className="sc-error">
                                        <AlertCircle size={12} />
                                        {errors.description}
                                    </span>
                                )}
                                <span className="sc-counter">
                                    {toPersianNumber(data.description.length)} /{" "}
                                    {toPersianNumber(1000)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* قیمت و زمان */}
                    <div className="sc-form-section">
                        <div className="sc-section-header">
                            <h2>قیمت و زمان پیشنهادی</h2>
                            <p>
                                اختیاری — آرایشگر می‌تواند قیمت خودش را تعیین
                                کند
                            </p>
                        </div>

                        <div className="sc-form-row">
                            <div className="sc-form-group">
                                <label className="sc-label">
                                    حداقل قیمت (تومان)
                                </label>
                                <input
                                    type="number"
                                    className={`sc-input ${errors.min_price ? "error" : ""}`}
                                    value={data.min_price}
                                    onChange={(e) =>
                                        setData("min_price", e.target.value)
                                    }
                                    placeholder="50000"
                                    min={0}
                                />
                                {errors.min_price && (
                                    <span className="sc-error">
                                        <AlertCircle size={12} />
                                        {errors.min_price}
                                    </span>
                                )}
                            </div>

                            <div className="sc-form-group">
                                <label className="sc-label">
                                    حداکثر قیمت (تومان)
                                </label>
                                <input
                                    type="number"
                                    className={`sc-input ${errors.max_price ? "error" : ""}`}
                                    value={data.max_price}
                                    onChange={(e) =>
                                        setData("max_price", e.target.value)
                                    }
                                    placeholder="200000"
                                    min={0}
                                />
                                {errors.max_price && (
                                    <span className="sc-error">
                                        <AlertCircle size={12} />
                                        {errors.max_price}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="sc-form-group">
                            <label className="sc-label">
                                مدت زمان پیشنهادی (دقیقه)
                            </label>
                            <input
                                type="number"
                                className={`sc-input ${errors.suggested_duration ? "error" : ""}`}
                                value={data.suggested_duration}
                                onChange={(e) =>
                                    setData(
                                        "suggested_duration",
                                        e.target.value,
                                    )
                                }
                                placeholder="30"
                                min={5}
                                max={480}
                            />
                            {errors.suggested_duration && (
                                <span className="sc-error">
                                    <AlertCircle size={12} />
                                    {errors.suggested_duration}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ستون کنار */}
                <div className="sc-form-sidebar">
                    {/* تصویر */}
                    <div className="sc-form-section">
                        <div className="sc-section-header">
                            <h2>تصویر</h2>
                        </div>

                        {imagePreview ? (
                            <div className="sc-image-preview">
                                <img src={imagePreview} alt="پیش‌نمایش" />
                                <button
                                    type="button"
                                    className="sc-image-remove"
                                    onClick={handleImageRemove}
                                    disabled={processing}
                                    title="حذف تصویر"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="sc-image-upload">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageSelect}
                                    disabled={processing}
                                    className="sc-image-input"
                                />
                                <div className="sc-image-upload-content">
                                    <div className="sc-image-upload-icon">
                                        <Upload size={24} />
                                    </div>
                                    <span className="sc-image-upload-title">
                                        آپلود تصویر
                                    </span>
                                    <span className="sc-image-upload-hint">
                                        JPG, PNG, WEBP - حداکثر ۲MB
                                    </span>
                                </div>
                            </label>
                        )}

                        {errors.image && (
                            <span className="sc-error">
                                <AlertCircle size={12} />
                                {errors.image}
                            </span>
                        )}
                    </div>

                    {/* رنگ */}
                    <div className="sc-form-section">
                        <div className="sc-section-header">
                            <h2>رنگ</h2>
                        </div>

                        <div className="sc-color-grid">
                            {colors.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    className={`sc-color-btn ${data.color === color.value ? "selected" : ""}`}
                                    onClick={() =>
                                        setData("color", color.value)
                                    }
                                    title={color.label}
                                    style={{
                                        "--color":
                                            COLOR_CLASSES[color.value] ||
                                            "#10b981",
                                    }}
                                >
                                    {data.color === color.value && (
                                        <span className="sc-color-check">
                                            ✓
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* آیکون */}
                    <div className="sc-form-section">
                        <div className="sc-section-header">
                            <h2>آیکون</h2>
                        </div>

                        <div className="sc-icon-grid">
                            {icons.map((iconName) => {
                                const Icon =
                                    ICON_COMPONENTS[iconName] || Scissors;
                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        className={`sc-icon-btn ${data.icon === iconName ? "selected" : ""}`}
                                        onClick={() =>
                                            setData("icon", iconName)
                                        }
                                        title={iconName}
                                    >
                                        <Icon size={20} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* تنظیمات */}
                    <div className="sc-form-section">
                        <div className="sc-section-header">
                            <h2>تنظیمات</h2>
                        </div>

                        <div className="sc-form-group">
                            <label className="sc-label">ترتیب نمایش</label>
                            <input
                                type="number"
                                className="sc-input"
                                value={data.sort_order}
                                onChange={(e) =>
                                    setData("sort_order", e.target.value)
                                }
                                placeholder="0"
                                min={0}
                            />
                        </div>

                        <label className="sc-toggle">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) =>
                                    setData("is_active", e.target.checked)
                                }
                            />
                            <span className="sc-toggle-track">
                                <span className="sc-toggle-thumb" />
                            </span>
                            <span className="sc-toggle-label">
                                {data.is_active ? "فعال" : "غیرفعال"}
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="sc-form-actions">
                <Link
                    href={route("admin.service-categories.index")}
                    className="sc-btn-cancel"
                >
                    <X size={16} />
                    انصراف
                </Link>
                <button
                    type="submit"
                    className="sc-btn-primary"
                    disabled={processing}
                >
                    {processing ? (
                        <span className="sc-spinner" />
                    ) : (
                        <Save size={16} />
                    )}
                    {mode === "create" ? "ایجاد دسته‌بندی" : "ذخیره تغییرات"}
                </button>
            </div>
        </form>
    );
}
