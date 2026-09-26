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
    Activity,
    CheckCircle2,
    XCircle,
    PauseCircle,
    Clock,
    Ban,
    ChevronLeft,
    Image as ImageIcon,
    Upload,
    X,
} from "lucide-react";

// ============ نقشه آیکون‌ها ============
const iconMap = {
    CheckCircle: CheckCircle2,
    XCircle: XCircle,
    PauseCircle: PauseCircle,
    Clock: Clock,
    Ban: Ban,
};

export default function Edit({ auth, admin, roles, statuses, scope }) {
    // ============ useForm ============
    const { data, setData, post, processing, errors } = useForm({
        _method: "PUT",
        name: admin.name || "",
        phone: admin.phone || "",
        status: admin.status || "active", // ← وضعیت فعلی
        password: "",
        password_confirmation: "",
        roles: admin.roles || [],
        image: null,
        remove_image: false,
    });

    const [imagePreview, setImagePreview] = useState(admin.image || null);

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

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [changePassword, setChangePassword] = useState(false);

    // ============ گزینه‌های نقش ============
    const allRoleOptions = useMemo(
        () =>
            roles.map((role) => ({
                value: role.id,
                label: role.name,
            })),
        [roles],
    );

    const selectedRoles = useMemo(
        () => allRoleOptions.filter((opt) => data.roles.includes(opt.value)),
        [allRoleOptions, data.roles],
    );

    const unselectedRoleOptions = useMemo(
        () => allRoleOptions.filter((opt) => !data.roles.includes(opt.value)),
        [allRoleOptions, data.roles],
    );

    const handleRolesChange = (selectedOptions) => {
        const selectedIds = selectedOptions
            ? selectedOptions.map((opt) => opt.value)
            : [];
        setData("roles", selectedIds);
    };

    const handleSelectAll = () =>
        setData(
            "roles",
            allRoleOptions.map((opt) => opt.value),
        );

    const handleClearAll = () => setData("roles", []);

    // ============ گزینه‌های وضعیت (از Enum) ============
    const statusOptions = useMemo(
        () =>
            statuses.map((status) => ({
                value: status.value,
                label: status.label,
                color: status.color,
                icon: status.icon,
            })),
        [statuses],
    );

    // ============ وضعیت انتخاب شده فعلی ============
    const selectedStatus = useMemo(
        () => statusOptions.find((opt) => opt.value === data.status),
        [statusOptions, data.status],
    );

    // ============ هندل تغییر وضعیت ============
    const handleStatusChange = (selectedOption) => {
        setData("status", selectedOption ? selectedOption.value : "");
    };

    // ============ ارسال فرم ============
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!changePassword) {
            data.password = "";
            data.password_confirmation = "";
        }

        // put(`/admin/admins/${admin.slug}/update`);
        post(`/admin/admins/${admin.slug}/update`, {
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

    // ============ آیکون وضعیت انتخاب شده ============
    const StatusIcon = selectedStatus?.icon
        ? iconMap[selectedStatus.icon]
        : Activity;

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
                                اطلاعات کاربری، وضعیت و نقش‌های ادمین را
                                می‌توانید تغییر دهید.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="form-body">
                        {/* ============ آپلود عکس ============ */}
                        <div className="form-group">
                            <label className="form-label">
                                <ImageIcon size={16} />
                                تصویر ادمین
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
                                className={`form-input ${
                                    errors.name ? "error" : ""
                                }`}
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
                                className={`form-input ${
                                    errors.phone ? "error" : ""
                                }`}
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
                        </div>

                        {/* ============ فیلد وضعیت (از Enum) ============ */}
                        <div className="form-group">
                            <label htmlFor="status" className="form-label">
                                <StatusIcon size={16} />
                                وضعیت کاربری
                                <span className="required">*</span>
                            </label>

                            <Select2
                                options={statusOptions}
                                value={selectedStatus}
                                onChange={handleStatusChange}
                                placeholder="انتخاب وضعیت..."
                                isMulti={false}
                                isRtl={true}
                                isClearable={false}
                                showColors={true}
                            />

                            {errors.status && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{errors.status}</span>
                                </div>
                            )}

                            <p className="form-help-text">
                                وضعیت کاربری تعیین می‌کند که ادمین بتواند وارد
                                سیستم شود یا خیر.
                            </p>
                        </div>

                        {/* ============ بخش تغییر رمز عبور ============ */}
                        {/* ============ بخش تغییر رمز عبور ============ */}
                        <div className="password-section">
                            {/* کارت قابل کلیک برای فعال/غیرفعال کردن تغییر رمز */}
                            <button
                                type="button"
                                className={`password-toggle-card ${changePassword ? "active" : ""}`}
                                onClick={() => {
                                    const newState = !changePassword;
                                    setChangePassword(newState);
                                    if (!newState) {
                                        setData("password", "");
                                        setData("password_confirmation", "");
                                    }
                                }}
                            >
                                <div className="password-toggle-card-icon">
                                    <KeyRound size={22} />
                                </div>

                                <div className="password-toggle-card-content">
                                    <h4 className="password-toggle-card-title">
                                        {changePassword
                                            ? "تغییر رمز عبور"
                                            : "تغییر رمز عبور"}
                                    </h4>
                                    <p className="password-toggle-card-description">
                                        {changePassword
                                            ? "رمز عبور جدید را در فیلدهای زیر وارد کنید"
                                            : "برای تغییر رمز عبور، این کارت را کلیک کنید"}
                                    </p>
                                </div>

                                <div className="password-toggle-card-action">
                                    <span
                                        className={`password-toggle-card-status ${
                                            changePassword
                                                ? "active"
                                                : "inactive"
                                        }`}
                                    >
                                        {changePassword ? (
                                            <>
                                                <CheckCircle size={14} />
                                                فعال
                                            </>
                                        ) : (
                                            <>
                                                <Lock size={14} />
                                                غیرفعال
                                            </>
                                        )}
                                    </span>
                                    <ChevronLeft
                                        size={20}
                                        className={`password-toggle-card-chevron ${
                                            changePassword ? "rotated" : ""
                                        }`}
                                    />
                                </div>
                            </button>

                            {/* فیلدهای رمز عبور (فقط وقتی فعال است) */}
                            {changePassword && (
                                <div
                                    className="password-fields"
                                    style={{ animation: "slideDown 0.3s ease" }}
                                >
                                    {/* رمز جدید */}
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

                                    {/* تکرار رمز */}
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
                                    >
                                        <CheckCircle size={14} />
                                        انتخاب همه
                                    </button>
                                    <button
                                        type="button"
                                        className="shortcut-btn danger"
                                        onClick={handleClearAll}
                                    >
                                        ✕ پاک کردن همه
                                    </button>
                                </div>
                            </div>

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
