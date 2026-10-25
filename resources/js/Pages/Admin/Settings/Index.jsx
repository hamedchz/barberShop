import React, { useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import "../Assets/css/Finance.css";
import "../Assets/css/Transactions.css";
import "./Assets/css/Settings.css";

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

// ============ رنگ‌های مکمل پیشنهادی ============
const secondaryPresets = [
    { name: "سرمه‌ای", value: "#1E293B" },
    { name: "خاکستری", value: "#374151" },
    { name: "مشکی", value: "#0F172A" },
    { name: "سرمه‌ای روشن", value: "#334155" },
    { name: "قهوه‌ای تیره", value: "#44403C" },
];

// ============ حالت‌های ظاهری ============
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

// ============ تبدیل tint از رنگ اصلی ============
const getTintFromPrimary = (hex) => {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);

    const tintR = Math.round(r * 0.1 + 255 * 0.9);
    const tintG = Math.round(g * 0.1 + 255 * 0.9);
    const tintB = Math.round(b * 0.1 + 255 * 0.9);

    return `#${tintR.toString(16).padStart(2, "0")}${tintG.toString(16).padStart(2, "0")}${tintB.toString(16).padStart(2, "0")}`;
};

// ============ تبدیل hover از رنگ اصلی ============
const getHoverFromPrimary = (hex) => {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);

    const hoverR = Math.round(r * 0.8);
    const hoverG = Math.round(g * 0.8);
    const hoverB = Math.round(b * 0.8);

    return `#${hoverR.toString(16).padStart(2, "0")}${hoverG.toString(16).padStart(2, "0")}${hoverB.toString(16).padStart(2, "0")}`;
};

export default function SettingsIndex({ settings }) {
    // ============ State ============
    const [primaryColor, setPrimaryColor] = useState(
        settings.theme?.primary_color ?? "#10B981",
    );
    const [secondaryColor, setSecondaryColor] = useState(
        settings.theme?.secondary_color ?? "#1E293B",
    );
    const [themeMode, setThemeMode] = useState(
        settings.theme?.theme_mode ?? "light",
    );
    const [isSaving, setIsSaving] = useState(false);

    // ============ رنگ‌های مشتق‌شده ============
    const primaryHover = getHoverFromPrimary(primaryColor);
    const primaryTint = getTintFromPrimary(primaryColor);

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
                ],
            },
            {
                preserveScroll: true,
                onSuccess: () => setIsSaving(false),
                onError: () => setIsSaving(false),
            },
        );
    };

    return (
        <Layout>
            <Head title="تنظیمات ظاهر سایت" />

            <div className="admin-finance-page">
                {/* ============ هدر ============ */}
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div className="finance-header-icon">
                            <Palette size={28} />
                        </div>
                        <div>
                            <h1>تنظیمات ظاهر سایت</h1>
                            <p>رنگ اصلی، رنگ مکمل و حالت ظاهری</p>
                        </div>
                    </div>
                </div>

                {/* ============ پیش‌نمایش زنده ============ */}
                <div
                    className="theme-live-preview"
                    style={{
                        background: `linear-gradient(135deg, ${primaryTint} 0%, var(--color-bg-card) 100%)`,
                        borderColor: `${primaryColor}40`,
                    }}
                >
                    <div className="theme-preview-header">
                        <Sparkles size={18} style={{ color: primaryColor }} />
                        <span>پیش‌نمایش زنده</span>
                        <span
                            className="theme-preview-badge"
                            style={{
                                background: `${primaryColor}20`,
                                color: primaryColor,
                            }}
                        >
                            {
                                themeModes.find((m) => m.value === themeMode)
                                    ?.label
                            }
                        </span>
                    </div>

                    {/* دکمه‌ها */}
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

                    {/* عناصر نمونه */}
                    <div className="theme-preview-elements">
                        {/* لینک */}
                        <a
                            href="#"
                            className="theme-preview-link"
                            style={{ color: primaryColor }}
                            onClick={(e) => e.preventDefault()}
                        >
                            <Eye size={14} />
                            لینک نمونه
                        </a>

                        {/* آیتم فعال منو */}
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

                        {/* برچسب */}
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

                        {/* کارت انتخاب‌شده */}
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

                    {/* رنگ‌های ثابت */}
                    <div className="theme-preview-fixed">
                        <span className="fixed-label">رنگ‌های ثابت:</span>
                        <span
                            className="fixed-badge"
                            style={{ background: "#10B981", color: "#fff" }}
                        >
                            موفق
                        </span>
                        <span
                            className="fixed-badge"
                            style={{ background: "#EF4444", color: "#fff" }}
                        >
                            خطا
                        </span>
                        <span
                            className="fixed-badge"
                            style={{ background: "#F59E0B", color: "#fff" }}
                        >
                            هشدار
                        </span>
                        <span
                            className="fixed-badge"
                            style={{ background: "#3B82F6", color: "#fff" }}
                        >
                            اطلاع
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* ============ رنگ اصلی ============ */}
                    <div className="finance-card">
                        <div className="finance-card-header">
                            <div className="card-icon-box purple">
                                <Palette size={20} />
                            </div>
                            <h2>رنگ اصلی (Primary)</h2>
                            <span className="permissions-count">ضروری</span>
                        </div>

                        <p className="setting-description">
                            رنگ هویت بصری سایت؛ برای دکمه‌های اصلی، لینک‌ها،
                            انتخاب زمان رزرو، آیتم فعال منو و بخش‌های مهم.
                        </p>

                        {/* رنگ‌های پیشنهادی */}
                        <div className="color-preset-grid">
                            {presetColors.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    className={`color-preset-card ${primaryColor === color.value ? "selected" : ""}`}
                                    onClick={() => setPrimaryColor(color.value)}
                                    style={{
                                        borderColor:
                                            primaryColor === color.value
                                                ? color.value
                                                : "#e5e7eb",
                                    }}
                                >
                                    <div
                                        className="color-preset-swatch"
                                        style={{ background: color.value }}
                                    />
                                    <span className="color-preset-name">
                                        {color.name}
                                    </span>
                                    {primaryColor === color.value && (
                                        <CheckCircle
                                            size={14}
                                            style={{ color: color.value }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* رنگ سفارشی */}
                        <div className="color-custom-input">
                            <label className="form-label">یا رنگ سفارشی:</label>
                            <div className="color-input-row">
                                <input
                                    type="color"
                                    className="color-input-native"
                                    value={primaryColor}
                                    onChange={(e) =>
                                        setPrimaryColor(e.target.value)
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
                                رنگ‌های «هاور» و «tint» به‌صورت خودکار از رنگ
                                اصلی ساخته می‌شوند.
                            </p>
                        </div>
                    </div>

                    {/* ============ رنگ مکمل ============ */}
                    <div className="finance-card">
                        <div className="finance-card-header">
                            <div className="card-icon-box blue">
                                <Palette size={20} />
                            </div>
                            <h2>رنگ مکمل (Secondary)</h2>
                        </div>

                        <p className="setting-description">
                            برای عناصر فرعی، پس‌زمینه بعضی کارت‌ها، مرزبندی بصری
                            و بخش‌های تکمیلی.
                        </p>

                        <div className="color-preset-grid">
                            {secondaryPresets.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    className={`color-preset-card ${secondaryColor === color.value ? "selected" : ""}`}
                                    onClick={() =>
                                        setSecondaryColor(color.value)
                                    }
                                    style={{
                                        borderColor:
                                            secondaryColor === color.value
                                                ? color.value
                                                : "#e5e7eb",
                                    }}
                                >
                                    <div
                                        className="color-preset-swatch"
                                        style={{ background: color.value }}
                                    />
                                    <span className="color-preset-name">
                                        {color.name}
                                    </span>
                                    {secondaryColor === color.value && (
                                        <CheckCircle
                                            size={14}
                                            style={{ color: color.value }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="color-custom-input">
                            <label className="form-label">یا رنگ سفارشی:</label>
                            <div className="color-input-row">
                                <input
                                    type="color"
                                    className="color-input-native"
                                    value={secondaryColor}
                                    onChange={(e) =>
                                        setSecondaryColor(e.target.value)
                                    }
                                />
                                <input
                                    type="text"
                                    className="filter-input"
                                    value={secondaryColor}
                                    onChange={(e) =>
                                        setSecondaryColor(e.target.value)
                                    }
                                    dir="ltr"
                                    placeholder="#1E293B"
                                    maxLength={7}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ============ حالت ظاهری ============ */}
                    <div className="finance-card">
                        <div className="finance-card-header">
                            <div className="card-icon-box yellow">
                                <Sun size={20} />
                            </div>
                            <h2>حالت ظاهری (Theme Mode)</h2>
                        </div>

                        <p className="setting-description">
                            حالت نمایش سایت: روشن، تاریک یا مطابق تنظیمات
                            دستگاه.
                        </p>

                        <div className="theme-mode-grid">
                            {themeModes.map((mode) => {
                                const Icon = mode.icon;
                                const isActive = themeMode === mode.value;

                                return (
                                    <button
                                        key={mode.value}
                                        type="button"
                                        className={`theme-mode-card ${isActive ? "active" : ""}`}
                                        onClick={() => setThemeMode(mode.value)}
                                        style={
                                            isActive
                                                ? {
                                                      borderColor: primaryColor,
                                                      background: primaryTint,
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
                                                style={{ color: primaryColor }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ============ رنگ‌های ثابت ============ */}
                    <div className="finance-card">
                        <div className="finance-card-header">
                            <div className="card-icon-box gray">
                                <Lock size={20} />
                            </div>
                            <h2>رنگ‌های ثابت (غیرقابل تغییر)</h2>
                        </div>

                        <p className="setting-description">
                            این رنگ‌ها برای حفظ یکپارچگی معنایی در کل سیستم
                            استاندارد می‌مانند و قابل تغییر نیستند.
                        </p>

                        <div className="fixed-colors-grid">
                            <div className="fixed-color-item">
                                <div
                                    className="fixed-color-swatch"
                                    style={{ background: "#10B981" }}
                                />
                                <div>
                                    <strong>موفقیت (Success)</strong>
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
                                    <strong>خطا (Error)</strong>
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
                                    <strong>هشدار (Warning)</strong>
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
                                    <strong>اطلاع‌رسانی (Info)</strong>
                                    <span>#3B82F6</span>
                                </div>
                                <Lock size={14} />
                            </div>
                        </div>

                        <div className="fixed-info">
                            <Info size={14} />
                            <span>
                                رنگ‌های وضعیت رزرو (در انتظار، تایید شده، تکمیل
                                شده، لغو شده) نیز ثابت هستند.
                            </span>
                        </div>
                    </div>

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
