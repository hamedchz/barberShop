import React, { useState, useEffect, useMemo, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import "../Assets/css/Finance.css";
import "../Assets/css/Transactions.css";
import "./Assets/css/Settings.css";
import { applyThemeToDOM } from "../../../utils/theme";
import { toPersianNumber } from "../../../utils/persianNumbers";

import {
    Settings as SettingsIcon,
    Save,
    Palette,
    Moon,
    Sun,
    Monitor,
    CheckCircle,
    Info,
    Lock,
    Sparkles,
    AlertCircle,
    Eye,
    Globe,
    Phone,
    Mail,
    Camera,
    Send,
    Upload,
    Image as ImageIcon,
    FileText,
    X,
} from "lucide-react";

// ============ رنگ‌های پیشنهادی ============
const presetColors = [
    { name: "سبز زمردی", value: "#10B981" },
    { name: "آبی", value: "#3B82F6" },
    { name: "بنفش", value: "#8B5CF6" },
    { name: "نارنجی", value: "#F59E0B" },
    { name: "قرمز", value: "#EF4444" },
    { name: "صورتی", value: "#EC4899" },
    { name: "تیل", value: "#14B8A6" },
    { name: "نیلی", value: "#6366F1" },
    { name: "فیروزه‌ای", value: "#06B6D4" },
    { name: "سبز تیره", value: "#059669" },
];

const secondaryPresets = [
    { name: "سرمه‌ای", value: "#1E293B" },
    { name: "خاکستری", value: "#374151" },
    { name: "مشکی", value: "#0F172A" },
    { name: "سرمه‌ای روشن", value: "#334155" },
    { name: "قهوه‌ای تیره", value: "#44403C" },
];

const themeModes = [
    {
        value: "light",
        label: "روشن",
        icon: Sun,
        description: "پس‌زمینه سفید و متن تیره",
    },
    {
        value: "dark",
        label: "تاریک",
        icon: Moon,
        description: "پس‌زمینه تیره و متن روشن",
    },
    {
        value: "auto",
        label: "خودکار",
        icon: Monitor,
        description: "مطابق تنظیمات دستگاه",
    },
];

const getTintFromPrimary = (hex) => {
    if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return "#E8F8F2";
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const tintR = Math.round(r * 0.1 + 255 * 0.9);
    const tintG = Math.round(g * 0.1 + 255 * 0.9);
    const tintB = Math.round(b * 0.1 + 255 * 0.9);
    return `#${tintR.toString(16).padStart(2, "0")}${tintG.toString(16).padStart(2, "0")}${tintB.toString(16).padStart(2, "0")}`;
};

const getHoverFromPrimary = (hex) => {
    if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return "#0D9668";
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const hoverR = Math.round(r * 0.8);
    const hoverG = Math.round(g * 0.8);
    const hoverB = Math.round(b * 0.8);
    return `#${hoverR.toString(16).padStart(2, "0")}${hoverG.toString(16).padStart(2, "0")}${hoverB.toString(16).padStart(2, "0")}`;
};

const isSameColor = (a, b) => {
    if (!a || !b) return false;
    return a.toLowerCase() === b.toLowerCase();
};

export default function SettingsIndex({
    values = {},
    meta = {},
    groups = {},
    types = {},
}) {
    // ============ State (Theme) ============
    const [primaryColor, setPrimaryColor] = useState(
        values.primary_color ?? "#10B981",
    );
    const [secondaryColor, setSecondaryColor] = useState(
        values.secondary_color ?? "#1E293B",
    );
    const [themeMode, setThemeMode] = useState(values.theme_mode ?? "light");

    // ============ State (General) ============
    const [siteName, setSiteName] = useState(values.site_name ?? "");
    const [siteDescription, setSiteDescription] = useState(
        values.site_description ?? "",
    );

    // ============ State (Contact) ============
    const [contactPhone, setContactPhone] = useState(
        values.contact_phone ?? "",
    );
    const [contactEmail, setContactEmail] = useState(
        values.contact_email ?? "",
    );

    // ============ State (Social) ============
    const [instagram, setInstagram] = useState(values.social_instagram ?? "");
    const [telegram, setTelegram] = useState(values.social_telegram ?? "");

    // ============ State (Uploads) ============
    const [logoPreview, setLogoPreview] = useState(
        values.site_logo ? `/storage/${values.site_logo}` : null,
    );
    const [faviconPreview, setFaviconPreview] = useState(
        values.site_favicon ? `/storage/${values.site_favicon}` : null,
    );
    const logoInputRef = useRef(null);
    const faviconInputRef = useRef(null);

    // ============ State (UI) ============
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState("general");

    // ============ همگام‌سازی ============
    useEffect(() => {
        setPrimaryColor(values.primary_color ?? "#10B981");
        setSecondaryColor(values.secondary_color ?? "#1E293B");
        setThemeMode(values.theme_mode ?? "light");
        setSiteName(values.site_name ?? "");
        setSiteDescription(values.site_description ?? "");
        setContactPhone(values.contact_phone ?? "");
        setContactEmail(values.contact_email ?? "");
        setInstagram(values.social_instagram ?? "");
        setTelegram(values.social_telegram ?? "");
        setLogoPreview(
            values.site_logo ? `/storage/${values.site_logo}` : null,
        );
        setFaviconPreview(
            values.site_favicon ? `/storage/${values.site_favicon}` : null,
        );
    }, [values]);

    // ============ رنگ‌های مشتق‌شده ============
    const primaryHover = useMemo(
        () => getHoverFromPrimary(primaryColor),
        [primaryColor],
    );
    const primaryTint = useMemo(
        () => getTintFromPrimary(primaryColor),
        [primaryColor],
    );

    // ============ ذخیره ============
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);

        router.patch(
            "/admin/settings",
            {
                settings: [
                    { key: "primary_color", value: primaryColor },
                    { key: "secondary_color", value: secondaryColor },
                    { key: "theme_mode", value: themeMode },
                    { key: "site_name", value: siteName },
                    { key: "site_description", value: siteDescription },
                    { key: "contact_phone", value: contactPhone },
                    { key: "contact_email", value: contactEmail },
                    { key: "social_instagram", value: instagram },
                    { key: "social_telegram", value: telegram },
                ],
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    applyThemeToDOM(primaryColor, themeMode);
                    router.reload({
                        only: ["values", "meta", "theme", "site"],
                    });
                },
                onError: () => setIsSaving(false),
            },
        );
    };

    // ============ آپلود لوگو ============
    const [logoErrors, setLogoErrors] = useState({});
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLogoErrors({});

        const allowedExtensions = ["png", "jpg", "jpeg", "svg", "webp"];
        const extension = file.name.split(".").pop()?.toLowerCase();

        // بررسی فرمت فایل
        if (!allowedExtensions.includes(extension)) {
            setLogoErrors({
                logo: "فرمت‌های مجاز: PNG، JPG، JPEG، SVG و WebP.",
            });

            e.target.value = "";
            return;
        }

        // حداکثر ۲ مگابایت
        if (file.size > 2 * 1024 * 1024) {
            setLogoErrors({
                logo: "حجم فایل لوگو نباید بیشتر از ۲ مگابایت باشد.",
            });

            e.target.value = "";
            return;
        }

        // پیش‌نمایش فایل
        const reader = new FileReader();

        reader.onload = (ev) => {
            setLogoPreview(ev.target.result);
        };

        reader.onerror = () => {
            setLogoErrors({
                logo: "خواندن فایل با خطا مواجه شد.",
            });
        };

        reader.readAsDataURL(file);

        setIsUploadingLogo(true);

        router.post(
            "/admin/settings/logo",
            { logo: file },
            {
                preserveScroll: true,
                forceFormData: true,

                onError: (errors) => {
                    setLogoErrors(errors);
                },

                onSuccess: () => {
                    router.reload({
                        only: ["values", "site"],
                    });
                },

                onFinish: () => {
                    setIsUploadingLogo(false);
                },
            },
        );

        e.target.value = "";
    };

    // ============ آپلود فاوآیکون ============
    const [faviconErrors, setFaviconErrors] = useState({});
    const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

    const handleFaviconChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setFaviconErrors({});

        const allowedExtensions = ["png", "ico", "svg"];
        const extension = file.name.split(".").pop()?.toLowerCase();

        // بررسی فرمت
        if (!allowedExtensions.includes(extension)) {
            setFaviconErrors({
                favicon: "فرمت‌های مجاز: PNG، ICO و SVG.",
            });

            e.target.value = "";
            return;
        }

        // حداکثر ۵۱۲ کیلوبایت
        if (file.size > 512 * 1024) {
            setFaviconErrors({
                favicon: "حجم فایل نباید بیشتر از ۵۱۲ کیلوبایت باشد.",
            });

            e.target.value = "";
            return;
        }

        setIsUploadingFavicon(true);

        router.post(
            "/admin/settings/favicon",
            { favicon: file },
            {
                preserveScroll: true,
                forceFormData: true,

                onSuccess: () => {
                    router.reload({
                        only: ["values", "site"],
                        onFinish: () => {
                            setIsUploadingFavicon(false);
                        },
                    });
                },

                onError: (errors) => {
                    setFaviconErrors(errors);
                    setIsUploadingFavicon(false);
                },

                onFinish: () => {
                    setIsUploadingFavicon(false);
                },
            },
        );

        e.target.value = "";
    };

    // ============ تب‌ها ============
    const tabs = [
        { key: "general", label: "عمومی", icon: Globe },
        { key: "theme", label: "ظاهر و رنگ", icon: Palette },
        { key: "contact", label: "تماس", icon: Phone },
        { key: "social", label: "شبکه‌های اجتماعی", icon: Send },
    ];

    return (
        <Layout>
            <Head title="تنظیمات سایت" />

            <div className="admin-finance-page">
                {/* ============ هدر ============ */}
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div className="finance-header-icon">
                            <SettingsIcon size={28} />
                        </div>
                        <div>
                            <h1>تنظیمات سایت</h1>
                            <p>اطلاعات عمومی، ظاهر، تماس و شبکه‌های اجتماعی</p>
                        </div>
                    </div>
                </div>

                {/* ============ تب‌ها ============ */}
                <div className="settings-tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                className={`settings-tab ${activeSection === tab.key ? "active" : ""}`}
                                onClick={() => setActiveSection(tab.key)}
                                style={
                                    activeSection === tab.key
                                        ? {
                                              background: primaryTint,
                                              color: primaryColor,
                                              borderColor: primaryColor,
                                          }
                                        : {}
                                }
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ============ پیش‌نمایش (فقط تب theme) ============ */}
                {activeSection === "theme" && (
                    <div
                        className="theme-live-preview"
                        style={{
                            background: `linear-gradient(135deg, ${primaryTint} 0%, var(--color-bg-card) 100%)`,
                            borderColor: `${primaryColor}40`,
                        }}
                    >
                        <div className="theme-preview-header">
                            <Sparkles
                                size={18}
                                style={{ color: primaryColor }}
                            />
                            <span>پیش‌نمایش زنده</span>
                            <span
                                className="theme-preview-badge"
                                style={{
                                    background: `${primaryColor}20`,
                                    color: primaryColor,
                                }}
                            >
                                {
                                    themeModes.find(
                                        (m) => m.value === themeMode,
                                    )?.label
                                }
                            </span>
                        </div>

                        <div className="theme-preview-buttons">
                            <button
                                type="button"
                                className="theme-preview-btn"
                                style={{
                                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryHover})`,
                                    color: "#fff",
                                    boxShadow: `0 4px 12px ${primaryColor}40`,
                                }}
                            >
                                <CheckCircle size={14} />
                                دکمه اصلی
                            </button>

                            <button
                                type="button"
                                className="theme-preview-btn outline"
                                style={{
                                    background: "transparent",
                                    color: primaryColor,
                                    border: `1.5px solid ${primaryColor}`,
                                }}
                            >
                                دکمه خطی
                            </button>

                            <button
                                type="button"
                                className="theme-preview-btn tint"
                                style={{
                                    background: primaryTint,
                                    color: primaryColor,
                                    border: `1px solid ${primaryColor}40`,
                                }}
                            >
                                دکمه ملایم
                            </button>
                        </div>

                        <div className="theme-preview-elements">
                            <a
                                href="#"
                                className="theme-preview-link"
                                style={{ color: primaryColor }}
                                onClick={(e) => e.preventDefault()}
                            >
                                <Eye size={14} />
                                لینک نمونه
                            </a>

                            <div
                                className="theme-preview-nav-active"
                                style={{
                                    background: primaryTint,
                                    color: primaryColor,
                                    borderRight: `3px solid ${primaryColor}`,
                                }}
                            >
                                <CheckCircle size={14} />
                                آیتم فعال منو
                            </div>

                            <span
                                className="theme-preview-badge"
                                style={{
                                    background: primaryTint,
                                    color: primaryColor,
                                    border: `1px solid ${primaryColor}40`,
                                }}
                            >
                                برچسب
                            </span>

                            <div
                                className="theme-preview-card-selected"
                                style={{
                                    background: primaryTint,
                                    borderColor: primaryColor,
                                }}
                            >
                                <span style={{ color: primaryColor }}>
                                    ✓ انتخاب شده
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* ============ عمومی ============ */}
                    {activeSection === "general" && (
                        <>
                            {/* ============ اطلاعات عمومی ============ */}
                            <div className="finance-card">
                                <div className="finance-card-header">
                                    <div className="card-icon-box blue">
                                        <Globe size={20} />
                                    </div>
                                    <h2>اطلاعات عمومی سایت</h2>
                                </div>

                                <div className="settings-fields-grid">
                                    {/* نام سایت */}
                                    <div className="setting-field full">
                                        <label className="setting-label">
                                            <span className="setting-label-icon">
                                                <FileText size={14} />
                                            </span>
                                            نام سایت
                                            <span className="required">*</span>
                                        </label>
                                        <div className="setting-input-wrapper">
                                            <input
                                                type="text"
                                                className="filter-input setting-input-large"
                                                value={siteName}
                                                onChange={(e) =>
                                                    setSiteName(e.target.value)
                                                }
                                                placeholder="مثلاً آرایشگاه رویال"
                                                maxLength={100}
                                            />
                                            <span className="setting-input-counter">
                                                {toPersianNumber(
                                                    siteName.length,
                                                )}{" "}
                                                / ۱۰۰
                                            </span>
                                        </div>
                                        <span className="setting-hint">
                                            <Info size={11} />
                                            این نام در سایدبار، هدر و عنوان
                                            صفحات نمایش داده می‌شود
                                        </span>
                                    </div>

                                    {/* توضیحات */}
                                    <div className="setting-field full">
                                        <label className="setting-label">
                                            <span className="setting-label-icon">
                                                <FileText size={14} />
                                            </span>
                                            توضیحات سایت
                                        </label>
                                        <div className="setting-input-wrapper">
                                            <textarea
                                                className="filter-input"
                                                value={siteDescription}
                                                onChange={(e) =>
                                                    setSiteDescription(
                                                        e.target.value,
                                                    )
                                                }
                                                rows={3}
                                                maxLength={500}
                                                style={{ resize: "vertical" }}
                                                placeholder="سیستم رزرو آنلاین آرایشگاه - توضیحات برای SEO"
                                            />
                                            <span className="setting-input-counter">
                                                {toPersianNumber(
                                                    siteDescription.length,
                                                )}{" "}
                                                / ۵۰۰
                                            </span>
                                        </div>
                                        <span className="setting-hint">
                                            <Info size={11} />
                                            برای SEO و متا تگ‌ها استفاده می‌شود
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ============ لوگو و فاوآیکون ============ */}
                            <div className="finance-card">
                                <div className="finance-card-header">
                                    <div className="card-icon-box purple">
                                        <ImageIcon size={20} />
                                    </div>
                                    <h2>لوگو و فاوآیکون</h2>
                                </div>

                                <p className="setting-description">
                                    برای هویت بصری برند، لوگو و فاوآیکون سایت را
                                    آپلود کنید. فایل‌ها بعد از آپلود فوراً اعمال
                                    می‌شوند.
                                </p>

                                <div className="settings-uploads-grid">
                                    {/* لوگو */}
                                    <div className="settings-upload-item">
                                        <div className="settings-upload-header">
                                            <div className="settings-upload-header-icon purple">
                                                <ImageIcon size={18} />
                                            </div>
                                            <div className="settings-upload-header-content">
                                                <span className="settings-upload-title">
                                                    لوگو سایت
                                                </span>
                                                <span className="settings-upload-subtitle">
                                                    PNG, JPG, SVG, WebP — حداکثر
                                                    ۲MB
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            className="settings-upload-preview logo"
                                            onClick={() =>
                                                logoInputRef.current?.click()
                                            }
                                        >
                                            {logoPreview ? (
                                                <>
                                                    <img
                                                        src={logoPreview}
                                                        alt="لوگو"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="settings-upload-remove"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setLogoPreview(
                                                                null,
                                                            );
                                                        }}
                                                        title="حذف پیش‌نمایش"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="settings-upload-placeholder">
                                                    <Upload size={28} />
                                                    <span>
                                                        برای آپلود کلیک کنید
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <input
                                            type="file"
                                            ref={logoInputRef}
                                            onChange={handleLogoChange}
                                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                            hidden
                                            disabled={isUploadingLogo}
                                        />

                                        <button
                                            type="button"
                                            className="settings-upload-btn"
                                            onClick={() =>
                                                logoInputRef.current?.click()
                                            }
                                        >
                                            <Upload size={14} />
                                            {logoPreview
                                                ? "تغییر لوگو"
                                                : "آپلود لوگو"}
                                        </button>
                                        {isUploadingLogo && (
                                            <p className="mt-2 text-sm text-gray-500">
                                                در حال بارگذاری لوگو...
                                            </p>
                                        )}
                                        {logoErrors.logo && (
                                            <p
                                                className="mt-2 text-sm text-red-600"
                                                role="alert"
                                            >
                                                {logoErrors.logo}
                                            </p>
                                        )}
                                    </div>

                                    {/* فاوآیکون */}
                                    <div className="settings-upload-item">
                                        <div className="settings-upload-header">
                                            <div className="settings-upload-header-icon yellow">
                                                <Sparkles size={18} />
                                            </div>
                                            <div className="settings-upload-header-content">
                                                <span className="settings-upload-title">
                                                    فاوآیکون
                                                </span>
                                                <span className="settings-upload-subtitle">
                                                    PNG, ICO, SVG — حداکثر ۵۱۲KB
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            className="settings-upload-preview favicon"
                                            onClick={() =>
                                                faviconInputRef.current?.click()
                                            }
                                        >
                                            {faviconPreview ? (
                                                <>
                                                    <img
                                                        src={faviconPreview}
                                                        alt="فاوآیکون"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="settings-upload-remove"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFaviconPreview(
                                                                null,
                                                            );
                                                        }}
                                                        title="حذف پیش‌نمایش"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="settings-upload-placeholder favicon">
                                                    <Upload size={20} />
                                                    <span>کلیک کنید</span>
                                                </div>
                                            )}
                                        </div>

                                        <input
                                            type="file"
                                            ref={faviconInputRef}
                                            onChange={handleFaviconChange}
                                            accept="image/png,image/x-icon,image/svg+xml"
                                            hidden
                                            disabled={isUploadingFavicon}
                                        />

                                        <button
                                            type="button"
                                            className="settings-upload-btn"
                                            onClick={() =>
                                                faviconInputRef.current?.click()
                                            }
                                        >
                                            <Upload size={14} />
                                            {faviconPreview
                                                ? "تغییر فاوآیکون"
                                                : "آپلود فاوآیکون"}
                                        </button>
                                        {isUploadingFavicon && (
                                            <p className="mt-2 text-sm text-gray-500">
                                                در حال بارگذاری فاوآیکون...
                                            </p>
                                        )}
                                        {faviconErrors.favicon && (
                                            <p
                                                className="text-sm text-red-600 mt-2"
                                                role="alert"
                                            >
                                                {faviconErrors.favicon}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ============ تماس ============ */}
                    {activeSection === "contact" && (
                        <div className="finance-card">
                            <div className="finance-card-header">
                                <div className="card-icon-box green">
                                    <Phone size={20} />
                                </div>
                                <h2>اطلاعات تماس</h2>
                            </div>

                            <div className="settings-fields-grid">
                                <div className="setting-field">
                                    <label className="setting-label">
                                        <Phone size={14} />
                                        تلفن تماس
                                        <span className="setting-desc">
                                            شماره اصلی تماس
                                        </span>
                                    </label>
                                    <input
                                        type="tel"
                                        className="filter-input"
                                        value={contactPhone}
                                        onChange={(e) =>
                                            setContactPhone(e.target.value)
                                        }
                                        placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                                        dir="ltr"
                                    />
                                </div>

                                <div className="setting-field">
                                    <label className="setting-label">
                                        <Mail size={14} />
                                        ایمیل
                                        <span className="setting-desc">
                                            ایمیل تماس
                                        </span>
                                    </label>
                                    <input
                                        type="email"
                                        className="filter-input"
                                        value={contactEmail}
                                        onChange={(e) =>
                                            setContactEmail(e.target.value)
                                        }
                                        placeholder="info@example.com"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============ شبکه‌های اجتماعی ============ */}
                    {activeSection === "social" && (
                        <div className="finance-card">
                            <div className="finance-card-header">
                                <div className="card-icon-box orange">
                                    <Send size={20} />
                                </div>
                                <h2>شبکه‌های اجتماعی</h2>
                            </div>

                            <div className="settings-fields-grid">
                                <div className="setting-field">
                                    <label className="setting-label">
                                        <Camera size={14} />
                                        اینستاگرام
                                        <span className="setting-desc">
                                            آدرس پروفایل اینستاگرام
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        className="filter-input"
                                        value={instagram}
                                        onChange={(e) =>
                                            setInstagram(e.target.value)
                                        }
                                        placeholder="username"
                                        dir="ltr"
                                    />
                                </div>

                                <div className="setting-field">
                                    <label className="setting-label">
                                        <Send size={14} />
                                        تلگرام
                                        <span className="setting-desc">
                                            آدرس کانال یا پروفایل تلگرام
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        className="filter-input"
                                        value={telegram}
                                        onChange={(e) =>
                                            setTelegram(e.target.value)
                                        }
                                        placeholder="username"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============ ظاهر و رنگ ============ */}
                    {activeSection === "theme" && (
                        <>
                            {/* رنگ اصلی */}
                            <div className="finance-card">
                                <div className="finance-card-header">
                                    <div className="card-icon-box purple">
                                        <Palette size={20} />
                                    </div>
                                    <h2>رنگ اصلی (Primary)</h2>
                                    <span className="permissions-count">
                                        ضروری
                                    </span>
                                </div>

                                <p className="setting-description">
                                    رنگ هویت بصری سایت؛ برای دکمه‌های اصلی،
                                    لینک‌ها، انتخاب زمان رزرو، آیتم فعال منو و
                                    بخش‌های مهم.
                                </p>

                                <div className="color-preset-grid">
                                    {presetColors.map((color) => {
                                        const selected = isSameColor(
                                            primaryColor,
                                            color.value,
                                        );
                                        return (
                                            <button
                                                key={color.value}
                                                type="button"
                                                className={`color-preset-card ${selected ? "selected" : ""}`}
                                                onClick={() =>
                                                    setPrimaryColor(color.value)
                                                }
                                                style={{
                                                    borderColor: selected
                                                        ? color.value
                                                        : "#e5e7eb",
                                                }}
                                            >
                                                <div
                                                    className="color-preset-swatch"
                                                    style={{
                                                        background: color.value,
                                                    }}
                                                />
                                                <span className="color-preset-name">
                                                    {color.name}
                                                </span>
                                                {selected && (
                                                    <CheckCircle
                                                        size={14}
                                                        style={{
                                                            color: color.value,
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="color-custom-input">
                                    <label className="form-label">
                                        یا رنگ سفارشی:
                                    </label>
                                    <div className="color-input-row">
                                        <input
                                            type="color"
                                            className="color-input-native"
                                            value={primaryColor}
                                            onChange={(e) =>
                                                setPrimaryColor(
                                                    e.target.value.toUpperCase(),
                                                )
                                            }
                                        />
                                        <input
                                            type="text"
                                            className="filter-input"
                                            value={primaryColor}
                                            onChange={(e) =>
                                                setPrimaryColor(e.target.value)
                                            }
                                            dir="ltr"
                                            placeholder="#10B981"
                                            maxLength={7}
                                        />
                                        <div
                                            className="color-derived-preview"
                                            title="رنگ hover (خودکار)"
                                            style={{ background: primaryHover }}
                                        />
                                        <div
                                            className="color-derived-preview"
                                            title="رنگ tint (خودکار)"
                                            style={{ background: primaryTint }}
                                        />
                                    </div>
                                    <p className="color-hint">
                                        <Info size={12} />
                                        رنگ‌های «هاور» و «tint» به‌صورت خودکار
                                        از رنگ اصلی ساخته می‌شوند.
                                    </p>
                                </div>
                            </div>

                            {/* رنگ مکمل */}
                            <div className="finance-card">
                                <div className="finance-card-header">
                                    <div className="card-icon-box blue">
                                        <Palette size={20} />
                                    </div>
                                    <h2>رنگ مکمل (Secondary)</h2>
                                </div>

                                <p className="setting-description">
                                    برای عناصر فرعی، پس‌زمینه بعضی کارت‌ها،
                                    مرزبندی بصری و بخش‌های تکمیلی.
                                </p>

                                <div className="color-preset-grid">
                                    {secondaryPresets.map((color) => {
                                        const selected = isSameColor(
                                            secondaryColor,
                                            color.value,
                                        );
                                        return (
                                            <button
                                                key={color.value}
                                                type="button"
                                                className={`color-preset-card ${selected ? "selected" : ""}`}
                                                onClick={() =>
                                                    setSecondaryColor(
                                                        color.value,
                                                    )
                                                }
                                                style={{
                                                    borderColor: selected
                                                        ? color.value
                                                        : "#e5e7eb",
                                                }}
                                            >
                                                <div
                                                    className="color-preset-swatch"
                                                    style={{
                                                        background: color.value,
                                                    }}
                                                />
                                                <span className="color-preset-name">
                                                    {color.name}
                                                </span>
                                                {selected && (
                                                    <CheckCircle
                                                        size={14}
                                                        style={{
                                                            color: color.value,
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="color-custom-input">
                                    <label className="form-label">
                                        یا رنگ سفارشی:
                                    </label>
                                    <div className="color-input-row">
                                        <input
                                            type="color"
                                            className="color-input-native"
                                            value={secondaryColor}
                                            onChange={(e) =>
                                                setSecondaryColor(
                                                    e.target.value.toUpperCase(),
                                                )
                                            }
                                        />
                                        <input
                                            type="text"
                                            className="filter-input"
                                            value={secondaryColor}
                                            onChange={(e) =>
                                                setSecondaryColor(
                                                    e.target.value,
                                                )
                                            }
                                            dir="ltr"
                                            placeholder="#1E293B"
                                            maxLength={7}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* حالت ظاهری */}
                            <div className="finance-card">
                                <div className="finance-card-header">
                                    <div className="card-icon-box yellow">
                                        <Sun size={20} />
                                    </div>
                                    <h2>حالت ظاهری (Theme Mode)</h2>
                                </div>

                                <div className="theme-mode-grid">
                                    {themeModes.map((mode) => {
                                        const Icon = mode.icon;
                                        const isActive =
                                            themeMode === mode.value;

                                        return (
                                            <button
                                                key={mode.value}
                                                type="button"
                                                className={`theme-mode-card ${isActive ? "active" : ""}`}
                                                onClick={() =>
                                                    setThemeMode(mode.value)
                                                }
                                                style={
                                                    isActive
                                                        ? {
                                                              borderColor:
                                                                  primaryColor,
                                                              background:
                                                                  primaryTint,
                                                          }
                                                        : {}
                                                }
                                            >
                                                <div
                                                    className="theme-mode-icon"
                                                    style={
                                                        isActive
                                                            ? {
                                                                  background:
                                                                      primaryColor,
                                                                  color: "#fff",
                                                              }
                                                            : {}
                                                    }
                                                >
                                                    <Icon size={22} />
                                                </div>
                                                <div className="theme-mode-content">
                                                    <span className="theme-mode-title">
                                                        {mode.label}
                                                    </span>
                                                    <span className="theme-mode-desc">
                                                        {mode.description}
                                                    </span>
                                                </div>
                                                {isActive && (
                                                    <CheckCircle
                                                        size={18}
                                                        style={{
                                                            color: primaryColor,
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* رنگ‌های ثابت */}
                            <div className="finance-card">
                                <div className="finance-card-header">
                                    <div className="card-icon-box gray">
                                        <Lock size={20} />
                                    </div>
                                    <h2>رنگ‌های ثابت (غیرقابل تغییر)</h2>
                                </div>

                                <div className="fixed-colors-grid">
                                    <div className="fixed-color-item">
                                        <div
                                            className="fixed-color-swatch"
                                            style={{ background: "#10B981" }}
                                        />
                                        <div>
                                            <strong>موفقیت</strong>
                                            <span>#10B981</span>
                                        </div>
                                        <Lock size={14} />
                                    </div>
                                    <div className="fixed-color-item">
                                        <div
                                            className="fixed-color-swatch"
                                            style={{ background: "#EF4444" }}
                                        />
                                        <div>
                                            <strong>خطا</strong>
                                            <span>#EF4444</span>
                                        </div>
                                        <Lock size={14} />
                                    </div>
                                    <div className="fixed-color-item">
                                        <div
                                            className="fixed-color-swatch"
                                            style={{ background: "#F59E0B" }}
                                        />
                                        <div>
                                            <strong>هشدار</strong>
                                            <span>#F59E0B</span>
                                        </div>
                                        <Lock size={14} />
                                    </div>
                                    <div className="fixed-color-item">
                                        <div
                                            className="fixed-color-swatch"
                                            style={{ background: "#3B82F6" }}
                                        />
                                        <div>
                                            <strong>اطلاع</strong>
                                            <span>#3B82F6</span>
                                        </div>
                                        <Lock size={14} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ============ دکمه ذخیره ============ */}
                    <div className="settings-save-bar">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSaving}
                            style={{
                                background: `linear-gradient(135deg, ${primaryColor}, ${primaryHover})`,
                                boxShadow: `0 4px 12px ${primaryColor}40`,
                            }}
                        >
                            {isSaving ? (
                                <>
                                    <span className="spinner" />
                                    در حال ذخیره...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    ذخیره تنظیمات
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
