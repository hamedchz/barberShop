import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import {
    Plus,
    Pencil,
    Trash2,
    Star,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    KeyRound,
    UserRound,
    LockKeyhole,
    Phone,
    FileText,
    X,
    Save,
    LoaderCircle,
    Power,
    MessageSquare,
    RefreshCw,
    CreditCard,
} from "lucide-react";
import Swal from "sweetalert2";

import Layout from "../Layouts/Layout";
import "./Assets/css/SmsProviders.css";
import { toPersianNumber } from "../../../utils/persianNumbers";
const driverDescriptions = {
    kavenegar: "ارسال کد تأیید با شناسه قالب کاوه‌نگار",
    melipayamak: "ارسال کد تأیید با شناسه پترن ملی‌پیامک",
    farazsms: "ارسال کد تأیید با پترن فراز اس‌ام‌اس",
};

const emptyForm = {
    driver: "kavenegar",
    name: "",
    is_active: true,
    is_primary: false,
    credentials: {
        api_key: "",
        username: "",
        password: "",
    },
    line_number: "",
    template_id: "",
    code_parameter: "token",
    template_enabled: true,
};

function Status({ active, children }) {
    return (
        <span className={`sms-status ${active ? "is-success" : "is-muted"}`}>
            <span className="sms-status-dot" />
            {children}
        </span>
    );
}

function Readiness({ ready, children }) {
    return (
        <span
            className={`sms-readiness ${ready ? "is-ready" : "is-not-ready"}`}
        >
            {ready ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {children}
        </span>
    );
}

function FieldError({ message }) {
    if (!message) return null;
    return <span className="sms-field-error">{message}</span>;
}

function SmsProvidersIndex({
    providers = [],
    drivers = [],
    primaryProviderId = 0,
}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [showSecrets, setShowSecrets] = useState(false);

    const form = useForm(emptyForm);

    const isFaraz = form.data.driver === "farazsms";
    const isMeli = form.data.driver === "melipayamak";
    const isKavenegar = form.data.driver === "kavenegar";

    const openCreate = () => {
        setEditingProvider(null);
        setShowSecrets(false);
        form.reset();
        form.clearErrors();
        form.setData({ ...emptyForm });
        setModalOpen(true);
    };

    const openEdit = (provider) => {
        setEditingProvider(provider);
        setShowSecrets(false);
        form.clearErrors();

        form.setData({
            driver: provider.driver,
            name: provider.name ?? "",
            is_active: Boolean(provider.is_active),
            is_primary: Number(primaryProviderId) === Number(provider.id),
            credentials: {
                api_key: "",
                username: "",
                password: "",
            },
            line_number: provider.line_number ?? "",
            template_id: provider.template_id ?? "",
            code_parameter:
                provider.code_parameter ||
                (provider.driver === "kavenegar" ? "token" : "code"),
            template_enabled: Boolean(provider.template_enabled),
        });

        setModalOpen(true);
    };

    const closeModal = () => {
        if (form.processing) return;
        setModalOpen(false);
        setEditingProvider(null);
        form.clearErrors();
    };

    const updateCredential = (key, value) => {
        form.setData("credentials", {
            ...form.data.credentials,
            [key]: value,
        });
    };

    const submit = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setModalOpen(false);
                setEditingProvider(null);
                form.reset();
            },
        };

        if (editingProvider) {
            form.put(
                route("admin.sms-providers.update", editingProvider.id),
                options,
            );
        } else {
            form.post(route("admin.sms-providers.store"), options);
        }
    };

    const toggleProvider = (provider) => {
        router.patch(
            route("admin.sms-providers.toggle", provider.id),
            {},
            { preserveScroll: true },
        );
    };

    const setPrimary = (provider) => {
        if (!provider.is_otp_ready) {
            Swal.fire({
                icon: "warning",
                title: "سرویس آماده نیست",
                text: "ابتدا اطلاعات اتصال و قالب OTP این سرویس را کامل کنید.",
                confirmButtonText: "متوجه شدم",
                customClass: { popup: "sms-swal-popup" },
            });
            return;
        }

        Swal.fire({
            icon: "question",
            title: "تغییر سرویس اصلی؟",
            text: `سرویس «${provider.name}» برای ارسال کدهای تأیید انتخاب شود؟`,
            showCancelButton: true,
            confirmButtonText: "بله، انتخاب شود",
            cancelButtonText: "انصراف",
            reverseButtons: true,
            customClass: { popup: "sms-swal-popup" },
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(
                    route("admin.sms-providers.primary", provider.id),
                    {},
                    { preserveScroll: true },
                );
            }
        });
    };

    const deleteProvider = (provider) => {
        Swal.fire({
            icon: "warning",
            title: "حذف سرویس پیامکی",
            text: `آیا از حذف سرویس «${provider.name}» مطمئن هستید؟`,
            showCancelButton: true,
            confirmButtonText: "حذف سرویس",
            cancelButtonText: "انصراف",
            reverseButtons: true,
            confirmButtonColor: "#dc2626",
            customClass: { popup: "sms-swal-popup" },
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(
                    route("admin.sms-providers.destroy", provider.id),
                    { preserveScroll: true },
                );
            }
        });
    };

    const getCredentialFields = () => {
        if (isKavenegar || isFaraz) {
            return (
                <div className="sms-form-field">
                    <label className="sms-label">
                        <KeyRound size={15} />
                        کلید API
                        {!editingProvider && (
                            <span className="sms-required">*</span>
                        )}
                    </label>
                    <div className="sms-input-wrap">
                        <input
                            type={showSecrets ? "text" : "password"}
                            value={form.data.credentials.api_key}
                            onChange={(e) =>
                                updateCredential("api_key", e.target.value)
                            }
                            placeholder={
                                editingProvider
                                    ? "برای حفظ مقدار فعلی خالی بگذارید"
                                    : "کلید API سرویس"
                            }
                            autoComplete="new-password"
                            dir="ltr"
                        />
                    </div>
                    <FieldError message={form.errors["credentials.api_key"]} />
                    {editingProvider && (
                        <small className="sms-hint">
                            برای حفظ کلید قبلی، این فیلد را خالی بگذارید.
                        </small>
                    )}
                </div>
            );
        }

        return (
            <>
                <div className="sms-form-field">
                    <label className="sms-label">
                        <UserRound size={15} />
                        نام کاربری
                        {!editingProvider && (
                            <span className="sms-required">*</span>
                        )}
                    </label>
                    <input
                        type="text"
                        value={form.data.credentials.username}
                        onChange={(e) =>
                            updateCredential("username", e.target.value)
                        }
                        placeholder={
                            editingProvider
                                ? "برای حفظ مقدار فعلی خالی بگذارید"
                                : "نام کاربری پنل"
                        }
                        autoComplete="off"
                    />
                    <FieldError message={form.errors["credentials.username"]} />
                </div>

                <div className="sms-form-field">
                    <label className="sms-label">
                        <LockKeyhole size={15} />
                        رمز عبور
                        {!editingProvider && (
                            <span className="sms-required">*</span>
                        )}
                    </label>
                    <input
                        type={showSecrets ? "text" : "password"}
                        value={form.data.credentials.password}
                        onChange={(e) =>
                            updateCredential("password", e.target.value)
                        }
                        placeholder={
                            editingProvider
                                ? "برای حفظ مقدار فعلی خالی بگذارید"
                                : "رمز عبور پنل"
                        }
                        autoComplete="new-password"
                        dir="ltr"
                    />
                    <FieldError message={form.errors["credentials.password"]} />
                </div>
            </>
        );
    };

    return (
        <Layout>
            <Head title="مدیریت سرویس‌های پیامکی" />

            <div className="admin-sms-page">
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div className="finance-header-icon">
                            <MessageSquare size={28} />
                        </div>
                        <div>
                            <h1>سرویس‌های پیامکی</h1>
                            <p>مدیریت اتصال سرویس‌ها و تنظیم ارسال کد تأیید</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="sms-btn sms-btn-primary"
                        onClick={openCreate}
                    >
                        <Plus size={18} />
                        افزودن سرویس
                    </button>
                </div>

                <div className="sms-info-banner">
                    <ShieldCheck size={21} />
                    <div>
                        <strong>امنیت اطلاعات پیامکی</strong>
                        <p>
                            کلیدها و رمزهای اتصال به‌صورت رمزنگاری‌شده ذخیره
                            می‌شوند و مقدار ذخیره‌شده آن‌ها در این صفحه نمایش
                            داده نمی‌شود.
                        </p>
                    </div>
                </div>

                <div className="sms-summary">
                    <div className="sms-summary-card">
                        <span className="sms-summary-icon">
                            <MessageSquare size={19} />
                        </span>
                        <div>
                            <strong>{toPersianNumber(providers.length)}</strong>
                            <span>کل سرویس‌ها</span>
                        </div>
                    </div>
                    <div className="sms-summary-card">
                        <span className="sms-summary-icon success">
                            <CheckCircle2 size={19} />
                        </span>
                        <div>
                            <strong>
                                {toPersianNumber(
                                    providers.filter((item) => item.is_active)
                                        .length,
                                )}
                            </strong>
                            <span>سرویس فعال</span>
                        </div>
                    </div>
                    <div className="sms-summary-card">
                        <span className="sms-summary-icon primary">
                            <Star size={19} />
                        </span>
                        <div>
                            <strong>
                                {toPersianNumber(
                                    providers.some(
                                        (item) =>
                                            Number(item.id) ===
                                            Number(primaryProviderId),
                                    )
                                        ? 1
                                        : 0,
                                )}
                            </strong>
                            <span>سرویس اصلی OTP</span>
                        </div>
                    </div>
                </div>

                {providers.length === 0 ? (
                    <div className="sms-empty-state">
                        <div className="sms-empty-icon">
                            <MessageSquare size={34} />
                        </div>
                        <h3>هنوز سرویس پیامکی ثبت نشده است</h3>
                        <p>
                            برای ارسال کد تأیید، ابتدا یک سرویس پیامکی اضافه
                            کنید.
                        </p>
                        <button
                            type="button"
                            className="sms-btn sms-btn-primary"
                            onClick={openCreate}
                        >
                            <Plus size={17} />
                            افزودن اولین سرویس
                        </button>
                    </div>
                ) : (
                    <div className="sms-provider-grid">
                        {providers.map((provider) => {
                            const isPrimary =
                                Number(provider.id) ===
                                Number(primaryProviderId);

                            return (
                                <article
                                    className={`sms-provider-card ${isPrimary ? "is-primary" : ""}`}
                                    key={provider.id}
                                >
                                    <div className="sms-provider-top">
                                        <div className="sms-provider-title">
                                            <div className="sms-provider-icon">
                                                <MessageSquare size={21} />
                                            </div>
                                            <div>
                                                <h3>{provider.name}</h3>
                                                <span>
                                                    {provider.driver_label}
                                                </span>
                                            </div>
                                        </div>

                                        {isPrimary && (
                                            <span className="sms-primary-badge">
                                                <Star
                                                    size={13}
                                                    fill="currentColor"
                                                />
                                                سرویس اصلی
                                            </span>
                                        )}
                                    </div>

                                    <div className="sms-provider-statuses">
                                        <Status active={provider.is_active}>
                                            {provider.is_active
                                                ? "فعال"
                                                : "غیرفعال"}
                                        </Status>
                                        <Readiness ready={provider.is_ready}>
                                            {provider.is_ready
                                                ? "اطلاعات اتصال کامل"
                                                : "اطلاعات اتصال ناقص"}
                                        </Readiness>
                                        <Readiness
                                            ready={provider.is_otp_ready}
                                        >
                                            {provider.is_otp_ready
                                                ? "آماده ارسال OTP"
                                                : "قالب OTP آماده نیست"}
                                        </Readiness>
                                    </div>

                                    <div className="sms-provider-details">
                                        <div>
                                            <span>شناسه قالب</span>
                                            <strong dir="ltr">
                                                {provider.template_id ||
                                                    "ثبت نشده"}
                                            </strong>
                                        </div>
                                        {provider.driver === "farazsms" && (
                                            <div>
                                                <span>خط ارسال</span>
                                                <strong dir="ltr">
                                                    {provider.line_number ||
                                                        "ثبت نشده"}
                                                </strong>
                                            </div>
                                        )}
                                        <div>
                                            <span>آخرین بررسی</span>
                                            <strong>
                                                {provider.last_tested_at ||
                                                    "انجام نشده"}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="sms-provider-actions">
                                        <button
                                            type="button"
                                            className="sms-btn sms-btn-light"
                                            onClick={() => openEdit(provider)}
                                        >
                                            <Pencil size={15} />
                                            ویرایش
                                        </button>

                                        {!isPrimary && (
                                            <button
                                                type="button"
                                                className="sms-btn sms-btn-outline"
                                                onClick={() =>
                                                    setPrimary(provider)
                                                }
                                                disabled={
                                                    !provider.is_otp_ready
                                                }
                                            >
                                                <Star size={15} />
                                                انتخاب اصلی
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className={`sms-icon-btn ${provider.is_active ? "is-on" : ""}`}
                                            onClick={() =>
                                                toggleProvider(provider)
                                            }
                                            title={
                                                provider.is_active
                                                    ? "غیرفعال کردن"
                                                    : "فعال کردن"
                                            }
                                        >
                                            <Power size={17} />
                                        </button>

                                        <button
                                            type="button"
                                            className="sms-icon-btn is-danger"
                                            onClick={() =>
                                                deleteProvider(provider)
                                            }
                                            title="حذف سرویس"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {modalOpen && (
                <div
                    className="sms-modal-backdrop"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <div className="sms-modal" role="dialog" aria-modal="true">
                        <div className="sms-modal-header">
                            <div>
                                <h2>
                                    {editingProvider
                                        ? "ویرایش سرویس پیامکی"
                                        : "افزودن سرویس پیامکی"}
                                </h2>
                                <p>
                                    اطلاعات اتصال و قالب ارسال کد تأیید را وارد
                                    کنید.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="sms-modal-close"
                                onClick={closeModal}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={submit}>
                            <div className="sms-modal-body">
                                <div className="sms-form-section">
                                    <h3>اطلاعات سرویس</h3>

                                    <div className="sms-form-grid">
                                        <div className="sms-form-field">
                                            <label className="sms-label">
                                                نوع سرویس{" "}
                                                <span className="sms-required">
                                                    *
                                                </span>
                                            </label>
                                            <select
                                                value={form.data.driver}
                                                onChange={(e) => {
                                                    form.setData(
                                                        "driver",
                                                        e.target.value,
                                                    );
                                                    form.setData(
                                                        "credentials",
                                                        {
                                                            api_key: "",
                                                            username: "",
                                                            password: "",
                                                        },
                                                    );
                                                    form.setData(
                                                        "line_number",
                                                        "",
                                                    );
                                                    form.setData(
                                                        "code_parameter",
                                                        e.target.value ===
                                                            "kavenegar"
                                                            ? "token"
                                                            : "code",
                                                    );
                                                }}
                                                disabled={Boolean(
                                                    editingProvider,
                                                )}
                                            >
                                                {drivers.map((driver) => (
                                                    <option
                                                        key={driver.value}
                                                        value={driver.value}
                                                    >
                                                        {driver.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {editingProvider && (
                                                <small className="sms-hint">
                                                    نوع سرویس پس از ایجاد قابل
                                                    تغییر نیست.
                                                </small>
                                            )}
                                            <FieldError
                                                message={form.errors.driver}
                                            />
                                        </div>

                                        <div className="sms-form-field">
                                            <label className="sms-label">
                                                نام نمایشی{" "}
                                                <span className="sms-required">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={form.data.name}
                                                onChange={(e) =>
                                                    form.setData(
                                                        "name",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="مثلاً سرویس پیامکی اصلی"
                                            />
                                            <FieldError
                                                message={form.errors.name}
                                            />
                                        </div>
                                    </div>

                                    <p className="sms-driver-description">
                                        {driverDescriptions[form.data.driver]}
                                    </p>
                                </div>

                                <div className="sms-form-section">
                                    <div className="sms-section-title-row">
                                        <h3>اطلاعات اتصال</h3>
                                        <button
                                            type="button"
                                            className="sms-show-secret"
                                            onClick={() =>
                                                setShowSecrets(
                                                    (value) => !value,
                                                )
                                            }
                                        >
                                            {showSecrets
                                                ? "مخفی کردن مقادیر"
                                                : "نمایش مقادیر واردشده"}
                                        </button>
                                    </div>

                                    <div className="sms-form-grid">
                                        {getCredentialFields()}

                                        {isFaraz && (
                                            <div className="sms-form-field">
                                                <label className="sms-label">
                                                    <Phone size={15} />
                                                    خط ارسال{" "}
                                                    <span className="sms-required">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        form.data.line_number
                                                    }
                                                    onChange={(e) =>
                                                        form.setData(
                                                            "line_number",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="شماره خط ارسال"
                                                    dir="ltr"
                                                />
                                                <FieldError
                                                    message={
                                                        form.errors.line_number
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="sms-form-section">
                                    <h3>قالب پیامک OTP</h3>

                                    <div className="sms-form-grid">
                                        <div className="sms-form-field">
                                            <label className="sms-label">
                                                <FileText size={15} />
                                                شناسه قالب / پترن{" "}
                                                <span className="sms-required">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={form.data.template_id}
                                                onChange={(e) =>
                                                    form.setData(
                                                        "template_id",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="شناسه یا نام قالب ثبت‌شده"
                                                dir="ltr"
                                            />
                                            <FieldError
                                                message={
                                                    form.errors.template_id
                                                }
                                            />
                                            {isMeli && (
                                                <small className="sms-hint">
                                                    شناسه پترن ملی‌پیامک باید
                                                    عددی باشد.
                                                </small>
                                            )}
                                        </div>

                                        <div className="sms-form-field">
                                            <label className="sms-label">
                                                نام پارامتر کد تأیید{" "}
                                                <span className="sms-required">
                                                    *
                                                </span>
                                            </label>
                                            {isKavenegar ? (
                                                <select
                                                    value={
                                                        form.data.code_parameter
                                                    }
                                                    onChange={(e) =>
                                                        form.setData(
                                                            "code_parameter",
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="token">
                                                        token
                                                    </option>
                                                    <option value="token2">
                                                        token2
                                                    </option>
                                                    <option value="token3">
                                                        token3
                                                    </option>
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={
                                                        form.data.code_parameter
                                                    }
                                                    onChange={(e) =>
                                                        form.setData(
                                                            "code_parameter",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="نام متغیر در قالب"
                                                    dir="ltr"
                                                />
                                            )}
                                            <FieldError
                                                message={
                                                    form.errors.code_parameter
                                                }
                                            />
                                            {isMeli && (
                                                <small className="sms-hint">
                                                    در ملی‌پیامک ترتیب متغیرهای
                                                    قالب اهمیت دارد؛ قالب OTP
                                                    باید با پارامتر کد هماهنگ
                                                    باشد.
                                                </small>
                                            )}
                                        </div>
                                    </div>

                                    <label className="sms-checkbox-row">
                                        <input
                                            type="checkbox"
                                            checked={form.data.template_enabled}
                                            onChange={(e) =>
                                                form.setData(
                                                    "template_enabled",
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <span>
                                            <strong>قالب OTP فعال باشد</strong>
                                            <small>
                                                این قالب برای ارسال کد تأیید
                                                استفاده شود.
                                            </small>
                                        </span>
                                    </label>
                                    <FieldError
                                        message={form.errors.template_enabled}
                                    />
                                </div>

                                <div className="sms-form-section sms-options-section">
                                    <label className="sms-checkbox-row">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_active}
                                            onChange={(e) =>
                                                form.setData(
                                                    "is_active",
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <span>
                                            <strong>فعال بودن سرویس</strong>
                                            <small>
                                                سرویس در سیستم فعال باشد.
                                            </small>
                                        </span>
                                    </label>

                                    <label className="sms-checkbox-row">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_primary}
                                            onChange={(e) =>
                                                form.setData(
                                                    "is_primary",
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <span>
                                            <strong>
                                                انتخاب به‌عنوان سرویس اصلی OTP
                                            </strong>
                                            <small>
                                                برای ارسال کدهای تأیید از این
                                                سرویس استفاده شود.
                                            </small>
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="sms-modal-footer">
                                <button
                                    type="button"
                                    className="sms-btn sms-btn-light"
                                    onClick={closeModal}
                                    disabled={form.processing}
                                >
                                    انصراف
                                </button>
                                <button
                                    type="submit"
                                    className="sms-btn sms-btn-primary"
                                    disabled={form.processing}
                                >
                                    {form.processing ? (
                                        <LoaderCircle
                                            size={17}
                                            className="sms-spin"
                                        />
                                    ) : (
                                        <Save size={17} />
                                    )}
                                    {editingProvider
                                        ? "ذخیره تغییرات"
                                        : "ثبت سرویس"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default SmsProvidersIndex;
