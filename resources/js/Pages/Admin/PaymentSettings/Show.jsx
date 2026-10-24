// resources/js/Pages/Admin/PaymentSettings/Show.jsx

import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import "../Assets/css/Finance.css";
import "../Assets/css/Transactions.css";
import "./Assets/css/PaymentSettings.css";
import "./Assets/css/PaymentShow.css";

import {
    ArrowRight,
    CreditCard,
    Save,
    AlertTriangle,
    Info,
    Shield,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    XCircle,
} from "lucide-react";

export default function PaymentSettingsShow({
    setting,
    modes = [],
    currencies = [],
}) {
    const [form, setForm] = useState({
        mode: setting.mode || "normal",
        merchant_id: setting.merchant_id || "",
        callback_url: setting.callback_url || "",
        description: setting.description || "",
        currency: setting.currency || "T",
        is_active: setting.is_active ?? true,
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        router.patch(`/admin/payment-settings/${setting.gateway}`, form, {
            preserveScroll: true,
            onSuccess: () => setIsLoading(false),
            onError: (err) => {
                setErrors(err);
                setIsLoading(false);
            },
        });
    };

    return (
        <Layout>
            <Head title={`تنظیمات ${setting.gateway_label}`} />

            <div className="admin-finance-page">
                {/* بازگشت */}
                <div
                    className="booking-show-back"
                    style={{
                        margin: "10px",
                    }}
                >
                    <Link
                        href="/admin/payment-settings"
                        className="btn-secondary"
                    >
                        <ArrowRight size={16} />
                        بازگشت به تنظیمات درگاه‌ها
                    </Link>
                </div>

                {/* هدر */}
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div className="finance-header-icon">
                            <CreditCard size={28} />
                        </div>
                        <div>
                            <h1>تنظیمات {setting.gateway_label}</h1>
                            <p>
                                منبع فعلی:{" "}
                                <strong>
                                    {setting.source === "database"
                                        ? "دیتابیس"
                                        : "فایل config"}
                                </strong>
                            </p>
                        </div>
                    </div>
                </div>

                {/* هشدار */}
                <div
                    className="deposit-warning"
                    style={{ marginBottom: "1.5rem" }}
                >
                    <AlertTriangle size={16} />
                    <div>
                        <strong>هشدار:</strong> تغییرات در دیتابیس ذخیره می‌شود
                        و روی config فعلی override می‌شود. برای بازگشت به مقدار
                        config، فیلد را خالی کنید.
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="finance-card">
                        <div className="finance-card-header">
                            <div className="card-icon-box purple">
                                <Shield size={20} />
                            </div>
                            <h2>تنظیمات اصلی</h2>
                        </div>

                        <div
                            className="filters-grid"
                            style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
                        >
                            {/* حالت */}
                            <div className="filter-group">
                                <label className="form-label">
                                    حالت درگاه
                                    <span className="required">*</span>
                                </label>
                                <select
                                    className="filter-select"
                                    value={form.mode}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            mode: e.target.value,
                                        })
                                    }
                                    disabled={isLoading}
                                >
                                    {modes.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.mode && (
                                    <div className="form-error">
                                        <AlertCircle size={12} />
                                        <span>{errors.mode}</span>
                                    </div>
                                )}
                            </div>

                            {/* واحد پول */}
                            <div className="filter-group">
                                <label className="form-label">
                                    واحد پول
                                    <span className="required">*</span>
                                </label>
                                <select
                                    className="filter-select"
                                    value={form.currency}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            currency: e.target.value,
                                        })
                                    }
                                    disabled={isLoading}
                                >
                                    {currencies.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Merchant ID */}
                            <div
                                className="filter-group"
                                style={{ gridColumn: "1 / -1" }}
                            >
                                <label className="form-label">
                                    Merchant ID (شناسه درگاه)
                                    {form.mode !== "sandbox" && (
                                        <span className="required">*</span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    className="filter-input"
                                    value={form.merchant_id}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            merchant_id: e.target.value,
                                        })
                                    }
                                    placeholder={
                                        form.mode === "sandbox"
                                            ? "برای sandbox معمولاً نیازی نیست"
                                            : "مثلاً 37febd1a-b5f5-..."
                                    }
                                    dir="ltr"
                                    disabled={isLoading}
                                />
                                <div className="form-hint">
                                    شناسه درگاه از پنل {setting.gateway_label}{" "}
                                    دریافت می‌شود.
                                </div>
                            </div>

                            {/* Callback URL */}
                            {/* <div
                                className="filter-group"
                                style={{ gridColumn: "1 / -1" }}
                            >
                                <label className="form-label">
                                    آدرس بازگشت (Callback URL)
                                </label>
                                <input
                                    type="url"
                                    className="filter-input"
                                    value={form.callback_url}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            callback_url: e.target.value,
                                        })
                                    }
                                    placeholder="https://example.com/customer/payment/callback/zarinpal"
                                    dir="ltr"
                                    disabled={isLoading}
                                />
                                <div className="form-hint">
                                    آدرس بازگشت بعد از پرداخت (باید در پنل درگاه
                                    هم ثبت شود)
                                </div>
                            </div> */}

                            {/* توضیحات */}
                            <div
                                className="filter-group"
                                style={{ gridColumn: "1 / -1" }}
                            >
                                <label className="form-label">توضیحات</label>
                                <input
                                    type="text"
                                    className="filter-input"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="payment using zarinpal"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* فعال/غیرفعال */}
                            <div
                                className="filter-group"
                                style={{ gridColumn: "1 / -1" }}
                            >
                                <label className="form-label">
                                    وضعیت درگاه
                                </label>
                                <div
                                    className={`gateway-toggle-wrapper ${form.is_active ? "active" : "inactive"}`}
                                    onClick={() =>
                                        !isLoading &&
                                        setForm({
                                            ...form,
                                            is_active: !form.is_active,
                                        })
                                    }
                                >
                                    <div className="gateway-toggle-icon">
                                        {form.is_active ? (
                                            <CheckCircle size={20} />
                                        ) : (
                                            <XCircle size={20} />
                                        )}
                                    </div>

                                    <div className="gateway-toggle-content">
                                        <span className="gateway-toggle-title">
                                            {form.is_active
                                                ? "درگاه فعال است"
                                                : "درگاه غیرفعال است"}
                                        </span>
                                        <span className="gateway-toggle-desc">
                                            {form.is_active
                                                ? "پرداخت‌های جدید از این درگاه انجام می‌شود"
                                                : "این درگاه در صفحه پرداخت نمایش داده نمی‌شود"}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={form.is_active}
                                        className={`gateway-switch ${form.is_active ? "on" : "off"}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isLoading) {
                                                setForm({
                                                    ...form,
                                                    is_active: !form.is_active,
                                                });
                                            }
                                        }}
                                        disabled={isLoading}
                                    >
                                        <span className="gateway-switch-thumb" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* دکمه‌ها */}
                    <div
                        className="filters-actions"
                        style={{ marginTop: "1rem" }}
                    >
                        <Link
                            href="/admin/payment-settings"
                            className="btn-ghost"
                        >
                            انصراف
                        </Link>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner" />
                                    در حال ذخیره...
                                </>
                            ) : (
                                <>
                                    <Save size={14} />
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
