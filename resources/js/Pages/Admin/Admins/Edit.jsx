import React, { useState, useMemo } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import Select2 from "../Components/Select2";
import {
    ArrowRight,
    Save,
    AlertCircle,
    Edit3,
    User,
    Phone,
    Lock,
    Eye,
    EyeOff,
    Shield,
    CheckCircle,
    Info,
    KeyRound,
} from "lucide-react";

export default function Edit({ auth, admin, roles, scope }) {
    // ============ useForm ============
    const { data, setData, put, processing, errors } = useForm({
        name: admin.name || "",
        phone: admin.phone || "",
        password: "",
        password_confirmation: "",
        roles: admin.roles || [], // آرایه ID نقش‌های فعلی
    });

    // ============ State نمایش رمز عبور ============
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [changePassword, setChangePassword] = useState(false);

    // ============ تبدیل نقش‌ها به فرمت Select2 ============
    const allRoleOptions = useMemo(
        () =>
            roles.map((role) => ({
                value: role.id,
                label: role.name,
            })),
        [roles],
    );

    // ============ نقش‌های انتخاب شده ============
    const selectedRoles = useMemo(
        () => allRoleOptions.filter((opt) => data.roles.includes(opt.value)),
        [allRoleOptions, data.roles],
    );

    // ============ نقش‌های انتخاب نشده ============
    const unselectedRoleOptions = useMemo(
        () => allRoleOptions.filter((opt) => !data.roles.includes(opt.value)),
        [allRoleOptions, data.roles],
    );

    // ============ هندل تغییر نقش‌ها ============
    const handleRolesChange = (selectedOptions) => {
        const selectedIds = selectedOptions
            ? selectedOptions.map((opt) => opt.value)
            : [];
        setData("roles", selectedIds);
    };

    // ============ انتخاب همه ============
    const handleSelectAll = () => {
        setData(
            "roles",
            allRoleOptions.map((opt) => opt.value),
        );
    };

    // ============ پاک کردن همه ============
    const handleClearAll = () => {
        setData("roles", []);
    };

    // ============ ارسال فرم ============
    const handleSubmit = (e) => {
        e.preventDefault();

        // اگر کاربر نمی‌خواهد رمز را تغییر دهد، فیلدها را خالی کن
        if (!changePassword) {
            data.password = "";
            data.password_confirmation = "";
        }

        put(`/admin/admins/${admin.id}`);
    };

    return (
        <Layout>
            <Head title={`ویرایش ادمین: ${admin.name}`} />

            <div className="center-column">
                {/* ============ هدر ============ */}
                <div className="page-header-with-back">
                    <Link href="/admin/admins" className="back-btn">
                        <ArrowRight size={20} />
                        <span>بازگشت به لیست ادمین‌ها</span>
                    </Link>
                    <h1 className="page-title">ویرایش ادمین: {admin.name}</h1>
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
                                ویرایش اطلاعات ادمین
                            </h2>
                            <p className="form-card-subtitle">
                                اطلاعات کاربری و نقش‌های ادمین را می‌توانید
                                تغییر دهید.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="form-body">
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

                        {/* ============ بخش تغییر رمز عبور ============ */}
                        <div className="password-section">
                            <div className="password-section-header">
                                <div className="password-section-title">
                                    <KeyRound size={18} />
                                    <span>رمز عبور</span>
                                </div>
                                <label className="toggle-switch-wrapper">
                                    <input
                                        type="checkbox"
                                        checked={changePassword}
                                        onChange={(e) => {
                                            setChangePassword(e.target.checked);
                                            if (!e.target.checked) {
                                                setData("password", "");
                                                setData(
                                                    "password_confirmation",
                                                    "",
                                                );
                                            }
                                        }}
                                        className="toggle-switch-input"
                                    />
                                    <span className="toggle-switch"></span>
                                    <span className="toggle-switch-label">
                                        {changePassword
                                            ? "تغییر رمز عبور"
                                            : "بدون تغییر"}
                                    </span>
                                </label>
                            </div>

                            {changePassword && (
                                <div
                                    className="password-fields"
                                    style={{ animation: "slideDown 0.3s ease" }}
                                >
                                    {/* فیلد رمز جدید */}
                                    <div className="form-group">
                                        <label
                                            htmlFor="password"
                                            className="form-label"
                                        >
                                            <Lock size={16} />
                                            رمز عبور جدید
                                            <span className="required">*</span>
                                        </label>
                                        <div className="password-input-wrapper">
                                            <input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                className={`form-input ${
                                                    errors.password
                                                        ? "error"
                                                        : ""
                                                }`}
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData(
                                                        "password",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="حداقل ۸ کاراکتر"
                                                dir="ltr"
                                                style={{ textAlign: "left" }}
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
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

                                    {/* فیلد تکرار رمز */}
                                    <div className="form-group">
                                        <label
                                            htmlFor="password_confirmation"
                                            className="form-label"
                                        >
                                            <Lock size={16} />
                                            تکرار رمز عبور جدید
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
                                                value={
                                                    data.password_confirmation
                                                }
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
                                                <span>
                                                    {
                                                        errors.password_confirmation
                                                    }
                                                </span>
                                            </div>
                                        )}

                                        {/* نشانگر تطابق */}
                                        {data.password &&
                                            data.password_confirmation &&
                                            data.password ===
                                                data.password_confirmation && (
                                                <div className="password-match">
                                                    <CheckCircle size={14} />
                                                    <span>
                                                        رمزهای عبور مطابقت دارند
                                                    </span>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}

                            {!changePassword && (
                                <div className="password-info-box">
                                    <Info size={16} />
                                    <p>
                                        اگر نمی‌خواهید رمز عبور را تغییر دهید،
                                        این بخش را غیرفعال بگذارید.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ============ فیلد نقش‌ها ============ */}
                        <div className="form-group">
                            <div className="permissions-label-wrapper">
                                <label htmlFor="roles" className="form-label">
                                    <Shield size={16} />
                                    نقش‌ها
                                    <span className="form-hint">
                                        ({data.roles.length} از {roles.length}{" "}
                                        انتخاب شده)
                                    </span>
                                </label>

                                <div className="permission-shortcuts">
                                    <button
                                        type="button"
                                        className="shortcut-btn"
                                        onClick={handleSelectAll}
                                        title="انتخاب تمام نقش‌ها"
                                    >
                                        <CheckCircle size={14} />
                                        انتخاب همه
                                    </button>
                                    <button
                                        type="button"
                                        className="shortcut-btn danger"
                                        onClick={handleClearAll}
                                        title="حذف تمام انتخاب‌ها"
                                    >
                                        ✕ پاک کردن همه
                                    </button>
                                </div>
                            </div>

                            {/* Select2 */}
                            <Select2
                                options={unselectedRoleOptions}
                                value={selectedRoles}
                                onChange={handleRolesChange}
                                placeholder="جستجو و افزودن نقش..."
                                isMulti={true}
                                isRtl={true}
                            />

                            {errors.roles && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{errors.roles}</span>
                                </div>
                            )}

                            <div className="permissions-help">
                                <p>
                                    <strong>راهنما:</strong> برای حذف یک نقش،
                                    روی ضربدر (×) کنار آن کلیک کنید. برای افزودن
                                    نقش جدید، از لیست بازشو انتخاب کنید یا نام
                                    آن را تایپ کنید.
                                </p>
                            </div>
                        </div>

                        {/* ============ دکمه‌های عملیات ============ */}
                        <div className="form-actions">
                            <Link href="/admin/admins" className="btn-outline">
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
            </div>
        </Layout>
    );
}
