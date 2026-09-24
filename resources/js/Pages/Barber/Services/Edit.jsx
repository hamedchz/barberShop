import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import {
    ArrowRight,
    Save,
    Scissors,
    AlertCircle,
    Clock,
    DollarSign,
    Edit3,
    CheckCircle,
    Info,
    Trash2,
    XCircle,
    Image as ImageIcon,
    Upload,
    X,
} from "lucide-react";

export default function ServicesEdit({ auth, service }) {
    // ============ useForm ============
    const { data, setData, post, processing, errors } = useForm({
        _method: "PUT", // ← این مهم است
        name: service.name || "",
        description: service.description || "",
        duration: service.duration || 30,
        price: service.price || 0,
        is_active: service.is_active ?? true,
        image: null,
        remove_image: false,
    });

    const [imagePreview, setImagePreview] = useState(service.image || null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageRemove = () => {
        setData("image", null);
        setImagePreview(null);
    };

    // ============ ارسال فرم ============
    const handleSubmit = (e) => {
        e.preventDefault();

        post(`/barber/services/${service.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                console.log("Success!", page);
            },
            onError: (errors) => {
                console.error("Errors:", errors);
            },
        });
    };

    return (
        <Layout>
            <Head title={`ویرایش سرویس: ${service.name}`} />

            <div className="center-column">
                {/* ============ هدر با دکمه بازگشت ============ */}
                <div className="page-header-with-back">
                    <Link href="/barber/services" className="back-btn">
                        <ArrowRight size={20} />
                        <span>بازگشت به لیست سرویس ها</span>
                    </Link>
                    <h1 className="page-title">ویرایش سرویس: {service.name}</h1>
                </div>

                {/* ============ کارت فرم ============ */}
                <div className="form-card">
                    <div className="form-card-header">
                        <div
                            className="form-icon-box"
                            style={{
                                backgroundColor: "#eff6ff",
                                color: "#3b82f6",
                            }}
                        >
                            <Edit3 size={24} />
                        </div>
                        <div>
                            <h2 className="form-card-title">
                                ویرایش اطلاعات سرویس
                            </h2>
                            <p className="form-card-subtitle">
                                مشخصات سرویس را می‌توانید تغییر دهید.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="form-body"
                        method="post"
                    >
                        <div className="form-group">
                            <label className="form-label">
                                <ImageIcon size={16} />
                                تصویر سرویس
                                <span className="form-hint">(اختیاری)</span>
                            </label>

                            <div className="image-upload-wrapper">
                                {imagePreview ? (
                                    <div className="image-preview-container">
                                        <img
                                            src={imagePreview}
                                            alt="پیش‌نمایش"
                                            className="image-preview"
                                        />
                                        <button
                                            type="button"
                                            className="image-remove-btn"
                                            onClick={handleImageRemove}
                                            title="حذف تصویر"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="image-upload-box">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="image-upload-input"
                                        />
                                        <div className="image-upload-content">
                                            <div className="image-upload-icon">
                                                <Upload size={24} />
                                            </div>
                                            <p className="image-upload-text">
                                                کلیک کنید یا تصویر را اینجا رها
                                                کنید
                                            </p>
                                            <p className="image-upload-hint">
                                                PNG, JPG, WEBP - حداکثر ۲
                                                مگابایت
                                            </p>
                                        </div>
                                    </label>
                                )}
                            </div>

                            {errors.image && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{errors.image}</span>
                                </div>
                            )}

                            {service.image && !data.image && (
                                <p className="form-help-text">
                                    برای تغییر تصویر، تصویر جدیدی آپلود کنید.
                                </p>
                            )}
                        </div>
                        {/* ============ نام سرویس ============ */}
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                <Scissors size={16} />
                                نام سرویس
                                <span className="required">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                className={`form-input ${
                                    errors.name ? "error" : ""
                                }`}
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                placeholder="مثلاً: کوتاهی مو"
                                autoFocus
                            />
                            {errors.name && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{errors.name}</span>
                                </div>
                            )}
                        </div>

                        {/* ============ توضیحات ============ */}
                        <div className="form-group">
                            <label htmlFor="description" className="form-label">
                                توضیحات
                                <span className="form-hint">(اختیاری)</span>
                            </label>
                            <textarea
                                id="description"
                                className={`form-input ${
                                    errors.description ? "error" : ""
                                }`}
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                placeholder="توضیح مختصری درباره این سرویس..."
                                rows={3}
                            />
                            {errors.description && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{errors.description}</span>
                                </div>
                            )}
                        </div>

                        {/* ============ مدت و قیمت ============ */}
                        <div className="form-row">
                            <div className="form-group">
                                <label
                                    htmlFor="duration"
                                    className="form-label"
                                >
                                    <Clock size={16} />
                                    مدت زمان (دقیقه)
                                    <span className="required">*</span>
                                </label>
                                <input
                                    id="duration"
                                    type="number"
                                    className={`form-input ${
                                        errors.duration ? "error" : ""
                                    }`}
                                    value={data.duration}
                                    onChange={(e) =>
                                        setData(
                                            "duration",
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                    min={5}
                                    max={480}
                                    step={5}
                                />
                                {errors.duration && (
                                    <div className="form-error">
                                        <AlertCircle size={14} />
                                        <span>{errors.duration}</span>
                                    </div>
                                )}
                                <p className="form-help-text">
                                    مدت زمان تقریبی این سرویس به دقیقه
                                </p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="price" className="form-label">
                                    <DollarSign size={16} />
                                    قیمت (تومان)
                                    <span className="required">*</span>
                                </label>
                                <input
                                    id="price"
                                    type="number"
                                    className={`form-input ${
                                        errors.price ? "error" : ""
                                    }`}
                                    value={Number(data.price)}
                                    onChange={(e) =>
                                        setData("price", e.target.value)
                                    }
                                    min={0}
                                    dir="ltr"
                                    style={{ textAlign: "left" }}
                                />
                                {errors.price && (
                                    <div className="form-error">
                                        <AlertCircle size={14} />
                                        <span>{errors.price}</span>
                                    </div>
                                )}
                                <p className="form-help-text">
                                    {parseFloat(data.price || 0).toLocaleString(
                                        "fa-IR",
                                    )}{" "}
                                    تومان
                                </p>
                            </div>
                        </div>

                        {/* ============ وضعیت فعال/غیرفعال ============ */}
                        <button
                            type="button"
                            className={`service-status-card ${
                                data.is_active ? "active" : "inactive"
                            }`}
                            onClick={() =>
                                setData("is_active", !data.is_active)
                            }
                        >
                            {/* آیکون */}
                            <div className="service-status-card-icon">
                                {data.is_active ? (
                                    <CheckCircle size={24} />
                                ) : (
                                    <XCircle size={24} />
                                )}
                            </div>

                            {/* محتوا */}
                            <div className="service-status-card-content">
                                <h4 className="service-status-card-title">
                                    {data.is_active
                                        ? "سرویس فعال است"
                                        : "سرویس غیرفعال است"}
                                </h4>
                                <p className="service-status-card-description">
                                    {data.is_active
                                        ? "این سرویس در لیست سرویس ها قابل رزرو مشتریان نمایش داده می‌شود."
                                        : "این سرویس در لیست سرویس ها قابل رزرو مشتریان نمایش داده نمی‌شود."}
                                </p>
                            </div>

                            {/* وضعیت + چورون */}
                            <div className="service-status-card-action">
                                <span
                                    className={`service-status-card-badge ${
                                        data.is_active ? "active" : "inactive"
                                    }`}
                                >
                                    {data.is_active ? (
                                        <>
                                            <CheckCircle size={12} />
                                            فعال
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={12} />
                                            غیرفعال
                                        </>
                                    )}
                                </span>
                                <div className="service-status-card-switch">
                                    <div className="switch-track">
                                        <div className="switch-thumb"></div>
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* ============ اطلاعات ============ */}
                        <div className="info-box">
                            <Info size={16} />
                            <p>
                                <strong>نکته:</strong> اگر سرویس را غیرفعال
                                کنید، در لیست سرویس ها مشتریان نمایش داده
                                نمی‌شود، اما رزروهای قبلی آن حفظ می‌شوند.
                            </p>
                        </div>

                        {/* ============ دکمه‌های عملیات ============ */}
                        <div className="form-actions">
                            <Link
                                href="/barber/services"
                                className="btn-outline"
                            >
                                انصراف
                            </Link>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={processing}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    justifyContent: "center",
                                }}
                            >
                                {processing ? (
                                    <>
                                        <span className="spinner"></span>
                                        در حال ذخیره...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        ذخیره تغییرات
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ============ کارت اطلاعات اضافی ============ */}
                <div
                    className="card"
                    style={{
                        maxWidth: "700px",
                        margin: "0 auto",
                        width: "100%",
                    }}
                ></div>
            </div>
        </Layout>
    );
}
