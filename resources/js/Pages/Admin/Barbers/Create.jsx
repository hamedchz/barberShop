import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import Select2 from "../Components/Select2";
import Cropper from "react-easy-crop";
import "./Assets/css/CreateBarber.css";
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
    Users,
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
        card_image: null,
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [cardPreview, setCardPreview] = useState(null);

    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

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

    const passwordStrength = getPasswordStrength(data.password);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // بررسی نوع تصویر
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            alert("فرمت تصویر باید JPG، PNG یا WEBP باشد.");
            e.target.value = "";
            return;
        }

        // بررسی حجم تصویر: حداکثر ۵ مگابایت
        if (file.size > 5 * 1024 * 1024) {
            alert("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");
            e.target.value = "";
            return;
        }

        setData("image", file);
        setData("card_image", null);

        setCardPreview(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);

        const reader = new FileReader();

        reader.onloadend = () => {
            setImagePreview(reader.result);
            setCropModalOpen(true);
        };

        reader.readAsDataURL(file);

        // امکان انتخاب مجدد همان فایل
        e.target.value = "";
    };

    const handleCropComplete = (_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    };

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();

            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", reject);

            image.src = url;
        });

    const getCroppedImage = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc);

        const canvas = document.createElement("canvas");

        canvas.width = 800;
        canvas.height = 1280;

        const ctx = canvas.getContext("2d");

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

    const handleCropSave = async () => {
        if (!imagePreview || !croppedAreaPixels) return;

        try {
            const croppedFile = await getCroppedImage(
                imagePreview,
                croppedAreaPixels,
            );

            setData("card_image", croppedFile);

            setCardPreview((previous) => {
                if (previous) URL.revokeObjectURL(previous);

                return URL.createObjectURL(croppedFile);
            });

            setCropModalOpen(false);
        } catch (error) {
            console.error("Image crop error:", error);
            alert("خطا در آماده‌سازی تصویر. دوباره تلاش کنید.");
        }
    };

    const handleImageRemove = () => {
        setData("image", null);
        setData("card_image", null);

        setImagePreview(null);

        setCardPreview((previous) => {
            if (previous) URL.revokeObjectURL(previous);
            return null;
        });

        setCropModalOpen(false);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
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
    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     forceFormData: (true,
    //         post("/admin/barbers/store", {
    //             onSuccess: () => reset(),
    //         }));
    // };

    const handleSubmit = (e) => {
        e.preventDefault();

        post("/admin/barbers/store", {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setImagePreview(null);
            },
        });
    };

    return (
        <Layout>
            <Head title="ایجاد آرایشگر جدید" />

            <div className="center-column">
                <div className="roles-page-header">
                    <div className="roles-header-content">
                        <div className="roles-header-icon">
                            <Users size={23} strokeWidth={1.8} />
                        </div>

                        <div className="roles-header-info">
                            <h1 className="roles-page-title">
                                ایجاد آرایشگر جدید
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
                        {/* ============ آپلود و تنظیم تصویر آرایشگر ============ */}
                        <div className="form-group">
                            <label className="form-label">
                                <ImageIcon size={16} />
                                تصویر آرایشگر
                                <span className="required">*</span>
                            </label>

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
                                                onClick={() =>
                                                    setCropModalOpen(true)
                                                }
                                            >
                                                <ImageIcon size={16} />
                                                تنظیم مجدد کادر
                                            </button>

                                            <button
                                                type="button"
                                                className="barber-image-action barber-image-delete"
                                                onClick={handleImageRemove}
                                            >
                                                <X size={16} />
                                                حذف تصویر
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="barber-image-upload-box">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleImageChange}
                                            className="image-upload-input"
                                        />

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
                                بهتر است از تصویر پرتره با وضوح بالا استفاده
                                کنید. پس از انتخاب تصویر می‌توانید کادر آن را
                                تنظیم کنید.
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
                            {/* ============ Password Strength ============ */}
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
                                        aria-valuenow={passwordStrength.score}
                                    >
                                        {[1, 2, 3, 4, 5].map((item) => (
                                            <span
                                                key={item}
                                                className={
                                                    item <=
                                                    passwordStrength.score
                                                        ? "active"
                                                        : ""
                                                }
                                            />
                                        ))}
                                    </div>

                                    <p className="password-strength-hint">
                                        برای امنیت بیشتر، از حروف کوچک و بزرگ،
                                        اعداد و نمادها استفاده کنید.
                                    </p>
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
                                onClick={() => {
                                    if (cardPreview) {
                                        setCropModalOpen(false);
                                    } else {
                                        handleImageRemove();
                                    }
                                }}
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
                                میزان بزرگ‌نمایی
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
                                onClick={() => {
                                    if (cardPreview) {
                                        setCropModalOpen(false);
                                    } else {
                                        handleImageRemove();
                                    }
                                }}
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
