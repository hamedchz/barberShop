import React, { useState, useMemo } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import Select2 from "../Components/Select2";
import Cropper from "react-easy-crop";
import "./Assets/css/CreateBarber.css";

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
    CheckCircle,
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
    ZoomIn,
    RefreshCw,
} from "lucide-react";

// ============ نقشه آیکون‌های وضعیت ============
const iconMap = {
    CheckCircle: CheckCircle2,
    XCircle: XCircle,
    PauseCircle: PauseCircle,
    Clock: Clock,
    Ban: Ban,
};

// ============ قدرت رمز عبور ============
const getPasswordStrength = (password) => {
    if (!password) {
        return { score: 0, label: "", level: "" };
    }

    const checks = [
        password.length >= 8,
        password.length >= 12,
        /[a-z]/.test(password) && /[A-Z]/.test(password),
        /\d/.test(password),
        /[^a-zA-Z0-9]/.test(password),
    ];

    const score = checks.filter(Boolean).length;

    if (score <= 1) {
        return { score, label: "بسیار ضعیف", level: "weak" };
    }

    if (score === 2) {
        return { score, label: "ضعیف", level: "weak" };
    }

    if (score === 3) {
        return { score, label: "متوسط", level: "medium" };
    }

    if (score === 4) {
        return { score, label: "قوی", level: "good" };
    }

    return { score, label: "بسیار قوی", level: "strong" };
};

// ============ ساخت تصویر از URL ============
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();

        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", reject);

        image.src = url;
    });

// ============ تولید فایل تصویر برش‌خورده ============
const getCroppedImage = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);

    const canvas = document.createElement("canvas");

    canvas.width = 800;
    canvas.height = 1280;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Canvas context is not available.");
    }

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        800,
        1280,
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error("ساخت تصویر برش‌خورده ناموفق بود."));
                    return;
                }

                resolve(
                    new File([blob], `barber-card-${Date.now()}.webp`, {
                        type: "image/webp",
                    }),
                );
            },
            "image/webp",
            0.88,
        );
    });
};

export default function Edit({
    auth,
    barber,
    roles = [],
    statuses = [],
    scope,
}) {
    // آدرس تصاویر فعلی که باید از Controller ارسال شوند
    const existingAvatarUrl = barber.avatar_url || barber.avatarUrl || null;

    const existingCardUrl =
        barber.avatar_card_url || barber.avatarCardUrl || null;

    // ============ useForm ============
    const { data, setData, post, processing, errors } = useForm({
        _method: "PUT",
        name: barber.name || "",
        phone: barber.phone || "",
        status: barber.status || "active",
        password: "",
        password_confirmation: "",
        roles: barber.roles || [],
        image: null,
        card_image: null,
    });

    // ============ وضعیت تصاویر ============
    const [imagePreview, setImagePreview] = useState(existingAvatarUrl);

    const [cardPreview, setCardPreview] = useState(
        existingCardUrl || existingAvatarUrl,
    );

    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // ============ انتخاب تصویر جدید ============
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            alert("فرمت تصویر باید JPG، PNG یا WEBP باشد.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");
            e.target.value = "";
            return;
        }

        // تصویر جدید انتخاب شده اما هنوز Crop تأیید نشده است
        setData("image", file);
        setData("card_image", null);

        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);

        const reader = new FileReader();

        reader.onloadend = () => {
            setImagePreview(reader.result);
            setCropModalOpen(true);
        };

        reader.readAsDataURL(file);

        // امکان انتخاب دوباره همان فایل
        e.target.value = "";
    };

    // ============ تغییر محدوده Crop ============
    const handleCropComplete = (_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    };

    // ============ تأیید تصویر برش‌خورده ============
    const handleCropSave = async () => {
        if (!imagePreview || !croppedAreaPixels) return;

        try {
            const croppedFile = await getCroppedImage(
                imagePreview,
                croppedAreaPixels,
            );

            setData("card_image", croppedFile);

            setCardPreview((previous) => {
                if (previous && previous.startsWith("blob:")) {
                    URL.revokeObjectURL(previous);
                }

                return URL.createObjectURL(croppedFile);
            });

            setCropModalOpen(false);
        } catch (error) {
            console.error("Image crop error:", error);
            alert("خطا در آماده‌سازی تصویر. دوباره تلاش کنید.");
        }
    };

    // ============ لغو انتخاب تصویر جدید ============
    const handleCropCancel = () => {
        setData("image", null);
        setData("card_image", null);

        setImagePreview(existingAvatarUrl);
        setCardPreview(existingCardUrl || existingAvatarUrl);

        setCropModalOpen(false);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
    };

    // ============ باز کردن انتخاب تصویر ============
    const handleChangeImage = () => {
        document.getElementById("barber-edit-image-input")?.click();
    };

    // ============ نمایش رمز عبور ============
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [changePassword, setChangePassword] = useState(false);

    const passwordStrength = getPasswordStrength(data.password);

    // ============ گزینه‌های نقش ============

    // ============ گزینه‌های وضعیت ============
    const statusOptions = useMemo(
        () =>
            statuses.map((status) => ({
                value: String(status.value),
                label: status.label,
                color: status.color,
                icon: status.icon,
            })),
        [statuses],
    );
    const selectedStatus = data.status;

    const handleStatusChange = (selected) => {
        setSelectedStatus(selected);
        setData("status", selected?.value || "");
    };

    // const handleStatusChange = (selectedOption) => {
    //     setData("status", selectedOption ? selectedOption.value : "");
    // };

    // ============ ارسال فرم ============
    const handleSubmit = (e) => {
        e.preventDefault();

        // اگر رمز عبور غیرفعال است، خالی ارسال شود
        if (!changePassword) {
            setData("password", "");
            setData("password_confirmation", "");
        }

        // اگر تصویر جدید انتخاب شده ولی Crop تأیید نشده است
        if (data.image && !data.card_image) {
            alert("لطفاً ابتدا کادر تصویر جدید را تنظیم و تأیید کنید.");
            setCropModalOpen(true);
            return;
        }

        post(`/admin/barbers/${barber.slug}/update`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    // ============ آیکون وضعیت ============
    const StatusIcon = selectedStatus?.icon
        ? iconMap[selectedStatus.icon] || Activity
        : Activity;

    return (
        <Layout>
            <Head title={`ویرایش آرایشگر: ${barber.name}`} />

            <div className="center-column">
                <div className="roles-page-header">
                    <div className="roles-header-content">
                        <div className="roles-header-icon">
                            <User size={23} strokeWidth={1.8} />
                        </div>

                        <div className="roles-header-info">
                            <h1 className="roles-page-title">
                                ویرایش آرایشگر: {barber.name}
                            </h1>
                        </div>
                    </div>

                    <Link href="/admin/barbers" className="back-btn">
                        <ArrowRight size={20} />
                        <span>بازگشت به لیست آرایشگر‌ها</span>
                    </Link>
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
                                ویرایش اطلاعات آرایشگر
                            </h2>

                            <p className="form-card-subtitle">
                                اطلاعات کاربری و وضعیت آرایشگر را می‌توانید
                                تغییر دهید.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="form-body">
                        {/* ============ آپلود و پیش‌نمایش تصویر ============ */}
                        <div className="form-group">
                            <label className="form-label">
                                <ImageIcon size={16} />
                                تصویر آرایشگر
                            </label>

                            <input
                                id="barber-edit-image-input"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageChange}
                                className="image-upload-input"
                                hidden
                            />

                            <div className="barber-image-uploader">
                                {cardPreview ? (
                                    <div className="barber-image-result">
                                        <div className="barber-image-card-preview">
                                            <img
                                                src={cardPreview}
                                                alt="پیش‌نمایش کارت آرایشگر"
                                            />

                                            <div className="barber-image-overlay">
                                                <span>
                                                    {data.name || "نام آرایشگر"}
                                                </span>
                                                <small>
                                                    پیش‌نمایش تصویر کارت
                                                </small>
                                            </div>
                                        </div>

                                        <div className="barber-image-actions">
                                            <button
                                                type="button"
                                                className="barber-image-action"
                                                onClick={handleChangeImage}
                                            >
                                                <Upload size={16} />
                                                تغییر تصویر
                                            </button>

                                            {data.image && (
                                                <button
                                                    type="button"
                                                    className="barber-image-action"
                                                    onClick={() =>
                                                        setCropModalOpen(true)
                                                    }
                                                >
                                                    <RefreshCw size={16} />
                                                    تنظیم مجدد کادر
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <label
                                        className="barber-image-upload-box"
                                        htmlFor="barber-edit-image-input"
                                    >
                                        <div className="barber-image-upload-icon">
                                            <Upload size={28} />
                                        </div>

                                        <strong>
                                            تصویر آرایشگر را انتخاب کنید
                                        </strong>

                                        <span>برای انتخاب تصویر کلیک کنید</span>

                                        <small>
                                            JPG، PNG یا WEBP - حداکثر ۵ مگابایت
                                        </small>
                                    </label>
                                )}
                            </div>

                            <p className="form-help-text">
                                در صورت عدم انتخاب تصویر جدید، تصویر فعلی
                                آرایشگر حفظ می‌شود. برای تغییر تصویر، عکس جدید
                                را انتخاب و کادر آن را تنظیم کنید.
                            </p>

                            {errors.image && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{errors.image}</span>
                                </div>
                            )}

                            {errors.card_image && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{errors.card_image}</span>
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

                        {/* ============ شماره تماس ============ */}
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
                        </div>

                        {/* ============ وضعیت کاربری ============ */}
                        <div className="form-group">
                            <label htmlFor="status" className="form-label">
                                <StatusIcon size={16} />
                                وضعیت کاربری
                                <span className="required">*</span>
                            </label>

                            <Select2
                                options={statusOptions}
                                value={data.status}
                                onChange={(value) => setData("status", value)}
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
                                وضعیت کاربری تعیین می‌کند که آرایشگر بتواند وارد
                                سیستم شود یا خیر.
                            </p>
                        </div>

                        {/* ============ تغییر رمز عبور ============ */}
                        <div className="password-section">
                            <button
                                type="button"
                                className={`password-toggle-card ${changePassword ? "active" : ""}`}
                                onClick={() => {
                                    const newState = !changePassword;

                                    setChangePassword(newState);

                                    if (!newState) {
                                        setData("password", "");
                                        setData("password_confirmation", "");
                                        setShowPassword(false);
                                        setShowConfirmPassword(false);
                                    }
                                }}
                            >
                                <div className="password-toggle-card-icon">
                                    <KeyRound size={22} />
                                </div>

                                <div className="password-toggle-card-content">
                                    <h4 className="password-toggle-card-title">
                                        تغییر رمز عبور
                                    </h4>

                                    <p className="password-toggle-card-description">
                                        {changePassword
                                            ? "رمز عبور جدید را در فیلدهای زیر وارد کنید"
                                            : "برای تغییر رمز عبور، این کارت را کلیک کنید"}
                                    </p>
                                </div>

                                <div className="password-toggle-card-action">
                                    <span
                                        className={`password-toggle-card-status ${changePassword ? "active" : "inactive"}`}
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
                                        className={`password-toggle-card-chevron ${changePassword ? "rotated" : ""}`}
                                    />
                                </div>
                            </button>

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
                                                className={`form-input ${errors.password ? "error" : ""}`}
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

                                        {/* نمایشگر قدرت رمز */}
                                        {data.password && (
                                            <div
                                                className={`password-strength ${passwordStrength.level}`}
                                            >
                                                <div className="password-strength-header">
                                                    <span>قدرت رمز عبور</span>
                                                    <strong>
                                                        {passwordStrength.label}
                                                    </strong>
                                                </div>

                                                <div
                                                    className="password-strength-bars"
                                                    role="meter"
                                                    aria-label="قدرت رمز عبور"
                                                    aria-valuemin={0}
                                                    aria-valuemax={5}
                                                    aria-valuenow={
                                                        passwordStrength.score
                                                    }
                                                >
                                                    {[1, 2, 3, 4, 5].map(
                                                        (item) => (
                                                            <span
                                                                key={item}
                                                                className={
                                                                    item <=
                                                                    passwordStrength.score
                                                                        ? "active"
                                                                        : ""
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>

                                                <p className="password-strength-hint">
                                                    برای امنیت بیشتر، از حروف
                                                    کوچک و بزرگ، اعداد و نمادها
                                                    استفاده کنید.
                                                </p>
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
                                                className={`form-input ${errors.password_confirmation ? "error" : ""}`}
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
                                        ذخیره تغییرات
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ============ Crop Image Modal ============ */}
            {cropModalOpen && imagePreview && (
                <div className="barber-crop-modal">
                    <div className="barber-crop-dialog">
                        <div className="barber-crop-header">
                            <div>
                                <h3>تنظیم تصویر آرایشگر</h3>
                                <p>
                                    کادر تصویر را برای نمایش بهتر در کارت تنظیم
                                    کنید.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="barber-crop-close"
                                onClick={handleCropCancel}
                                title="انصراف"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="barber-crop-area">
                            <Cropper
                                image={imagePreview}
                                crop={crop}
                                zoom={zoom}
                                aspect={5 / 8}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={handleCropComplete}
                                showGrid={true}
                                objectFit="contain"
                                restrictPosition={true}
                            />
                        </div>

                        <div className="barber-crop-controls">
                            <label htmlFor="barber-image-zoom">
                                <ZoomIn size={16} />
                                بزرگ‌نمایی
                            </label>

                            <input
                                id="barber-image-zoom"
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) =>
                                    setZoom(Number(e.target.value))
                                }
                            />

                            <span>{zoom.toFixed(1)}x</span>
                        </div>

                        <div className="barber-crop-footer">
                            <button
                                type="button"
                                className="btn-outline"
                                onClick={handleCropCancel}
                            >
                                انصراف
                            </button>

                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleCropSave}
                            >
                                <CheckCircle size={17} />
                                تأیید و ذخیره کادر
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
