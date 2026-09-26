import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import Select2 from "../Components/Select2";
import {
    ArrowRight,
    Save,
    UserPlus,
    AlertCircle,
    User,
    Phone,
    Lock,
    Eye,
    EyeOff,
    Shield,
    CheckCircle,
    ImageIcon,
    Upload,
    X,
} from "lucide-react";

export default function Create({ auth, roles, scope }) {
    // ============ useForm ============
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        phone: "",
        password: "",
        password_confirmation: "",
        roles: [],
        image: null,
    });

    const [imagePreview, setImagePreview] = useState(null);

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
    // ============ State نمایش رمز عبور ============
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ============ تبدیل نقش‌ها به فرمت Select2 ============
    const roleOptions = roles.map((role) => ({
        value: role.id,
        label: role.name,
    }));

    // ============ نقش‌های انتخاب شده فعلی ============
    // پیدا کردن گزینه‌هایی که ID آن‌ها در data.roles است
    const selectedRoles = roleOptions.filter((opt) =>
        data.roles.includes(opt.value),
    );

    // ============ هندل تغییر نقش‌ها ============
    const handleRolesChange = (selectedOptions) => {
        // selectedOptions یک آرایه از {value, label} است یا null
        const selectedIds = selectedOptions
            ? selectedOptions.map((opt) => opt.value)
            : [];
        setData("roles", selectedIds);
    };

    // ============ ارسال فرم ============
    const handleSubmit = (e) => {
        e.preventDefault();
        forceFormData: (true,
            post("/admin/barbers/store", {
                onSuccess: () => reset(),
            }));
    };

    return (
        <Layout>
            <Head title="ایجاد آرایشگر جدید" />

            <div className="center-column">
                {/* ============ هدر ============ */}
                <div className="page-header-with-back">
                    <Link href="/admin/barbers" className="back-btn">
                        <ArrowRight size={20} />
                        <span>بازگشت به لیست آرایشگر‌ها</span>
                    </Link>
                    <h1 className="page-title">ایجاد آرایشگر جدید</h1>
                </div>

                {/* ============ کارت فرم ============ */}
                <div className="form-card">
                    <div className="form-card-header">
                        <div
                            className="form-icon-box"
                            style={{
                                backgroundColor: "#ecfdf5",
                                color: "#10b981",
                            }}
                        >
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h2 className="form-card-title">اطلاعات آرایشگر</h2>
                            <p className="form-card-subtitle">
                                اطلاعات کاربری آرایشگر جدید را وارد کنید.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="form-body">
                        {/* ============ آپلود عکس ============ */}
                        <div className="form-group">
                            <label className="form-label">
                                <ImageIcon size={16} />
                                تصویر آرایشگر
                                <span className="required">*</span>
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
                        </div>
                        {/* ============ فیلد نام ============ */}
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                <User size={16} />
                                نام و نام خانوادگی
                                <span className="required">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                className={`form-input ${errors.name ? "error" : ""}`}
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                placeholder="مثلاً: علی محمدی"
                                autoFocus
                            />
                            {errors.name && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{errors.name}</span>
                                </div>
                            )}
                        </div>

                        {/* ============ فیلد شماره تماس ============ */}
                        <div className="form-group">
                            <label htmlFor="phone" className="form-label">
                                <Phone size={16} />
                                شماره تماس
                                <span className="required">*</span>
                            </label>
                            <input
                                id="phone"
                                type="text"
                                className={`form-input ${errors.phone ? "error" : ""}`}
                                value={data.phone}
                                onChange={(e) =>
                                    setData("phone", e.target.value)
                                }
                                placeholder="مثلاً: 09123456789"
                                dir="ltr"
                                style={{ textAlign: "left" }}
                            />
                            {errors.phone && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{errors.phone}</span>
                                </div>
                            )}
                            <p className="form-help-text">
                                این شماره برای ورود به سیستم استفاده می‌شود.
                            </p>
                        </div>

                        {/* ============ فیلد رمز عبور ============ */}
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                <Lock size={16} />
                                رمز عبور
                                <span className="required">*</span>
                            </label>
                            <div className="password-input-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className={`form-input ${errors.password ? "error" : ""}`}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    placeholder="حداقل ۸ کاراکتر"
                                    dir="ltr"
                                    style={{ textAlign: "left" }}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{errors.password}</span>
                                </div>
                            )}
                        </div>

                        {/* ============ فیلد تکرار رمز عبور ============ */}
                        <div className="form-group">
                            <label
                                htmlFor="password_confirmation"
                                className="form-label"
                            >
                                <Lock size={16} />
                                تکرار رمز عبور
                                <span className="required">*</span>
                            </label>
                            <div className="password-input-wrapper">
                                <input
                                    id="password_confirmation"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    className={`form-input ${
                                        errors.password_confirmation
                                            ? "error"
                                            : ""
                                    }`}
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="رمز عبور را دوباره وارد کنید"
                                    dir="ltr"
                                    style={{ textAlign: "left" }}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{errors.password_confirmation}</span>
                                </div>
                            )}

                            {/* نشانگر تطابق رمز */}
                            {data.password &&
                                data.password_confirmation &&
                                data.password ===
                                    data.password_confirmation && (
                                    <div className="password-match">
                                        <CheckCircle size={14} />
                                        <span>رمزهای عبور مطابقت دارند</span>
                                    </div>
                                )}
                        </div>

                        {/* ============ دکمه‌های عملیات ============ */}
                        <div className="form-actions">
                            <Link href="/admin/barbers" className="btn-outline">
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
                                        ذخیره آرایشگر
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
