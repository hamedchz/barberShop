import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import {
    CreditCard,
    Save,
    User,
    Hash,
    Shield,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Wallet,
    Building2,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import "../Assets/css/BankInfo.css";

const iranianBanks = [
    "بانک ملی ایران",
    "بانک ملت",
    "بانک صادرات ایران",
    "بانک تجارت",
    "بانک سپه",
    "بانک کشاورزی",
    "بانک مسکن",
    "بانک پارسیان",
    "بانک پاسارگاد",
    "بانک سامان",
    "بانک اقتصاد نوین",
    "بانک کارآفرین",
    "بانک سینا",
    "بانک شهر",
    "بانک دی",
    "بانک صنعت و معدن",
    "بانک توسعه صادرات ایران",
    "بانک رفاه کارگران",
    "بانک آینده",
    "بانک قرض‌الحسنه رسالت",
    "بانک قرض‌الحسنه مهر ایران",
    "بانک خاورمیانه",
    "بانک ایران زمین",
    "بانک قوامین",
    "بانک حکمت ایرانیان",
    "بانک گردشگری",
    "بانک توسعه تعاون",
    "پست بانک ایران",
    "بانک مهر ایران",
    "بانک سرمایه",
];

export default function BankInfo({ auth, bankInfo }) {
    const [formData, setFormData] = useState({
        bank_name: bankInfo?.bank_name || "",
        account_holder_name:
            bankInfo?.account_holder_name || auth.user.name || "",
        card_number: bankInfo?.card_number || "",
        sheba_number: bankInfo?.sheba_number || "",
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // ============ فرمت کارت (هر ۴ رقم یه فاصله) ============
    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\D/g, "").slice(0, 16);
        return cleaned.replace(/(.{4})/g, "$1 ").trim();
    };

    // ============ اعتبارسنجی سمت کلاینت ============
    const validate = () => {
        const newErrors = {};

        if (!formData.bank_name) {
            newErrors.bank_name = "لطفاً نام بانک را انتخاب کنید.";
        }

        if (!formData.account_holder_name.trim()) {
            newErrors.account_holder_name = "لطفاً نام صاحب حساب را وارد کنید.";
        }

        const cleanCard = formData.card_number.replace(/\s/g, "");
        const cleanSheba = formData.sheba_number
            .replace(/\s/g, "")
            .replace(/^IR/i, "");

        if (!cleanCard && !cleanSheba) {
            newErrors.card_number =
                "حداقل یکی از موارد شماره کارت یا شبا الزامی است.";
        }

        if (cleanCard && cleanCard.length !== 16) {
            newErrors.card_number = "شماره کارت باید ۱۶ رقم باشد.";
        }

        if (cleanSheba && cleanSheba.length !== 24) {
            newErrors.sheba_number = "شماره شبا باید ۲۴ رقم باشد.";
        }

        return newErrors;
    };

    // ============ ارسال ============
    const handleSubmit = (e) => {
        e.preventDefault();

        const clientErrors = validate();
        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        router.post(
            route("barber.finance.profile.bank-info.update"),
            {
                bank_name: formData.bank_name,
                account_holder_name: formData.account_holder_name.trim(),
                card_number: formData.card_number.replace(/\s/g, ""),
                sheba_number: formData.sheba_number
                    .replace(/\s/g, "")
                    .replace(/^IR/i, ""),
            },
            {
                preserveScroll: true,
                onSuccess: () => setIsLoading(false),
                onError: (errs) => {
                    setErrors(errs);
                    setIsLoading(false);
                },
            },
        );
    };

    const hasSavedInfo = bankInfo?.has_bank_info;

    return (
        <Layout>
            <Head title="اطلاعات بانکی" />

            <div className="bank-info-page">
                {/* ============ هدر ============ */}
                <div className="bank-info-header">
                    <div className="bank-info-header-content">
                        <div className="bank-info-header-icon">
                            <CreditCard size={28} />
                        </div>
                        <div>
                            <h1>اطلاعات بانکی</h1>
                            <p>اطلاعات حساب برای واریز درآمد و تسویه</p>
                        </div>
                    </div>

                    <div className="bank-info-header-actions">
                        <Link
                            href={route("barber.finance.wallet.index")}
                            className="btn-secondary"
                        >
                            <ArrowRight size={16} />
                            بازگشت به کیف پول
                        </Link>
                    </div>
                </div>

                {/* ============ هشدار امنیتی ============ */}
                <div className="security-notice">
                    <Shield size={22} />
                    <div>
                        <h3>اطلاعات شما امن است</h3>
                        <p>
                            اطلاعات بانکی شما به‌صورت رمزنگاری‌شده ذخیره می‌شود
                            و فقط برای واریز درآمد استفاده خواهد شد.
                        </p>
                    </div>
                </div>

                {/* ============ گرید ============ */}
                <div className="bank-info-grid">
                    {/* فرم */}
                    <div className="bank-info-card">
                        <div className="bank-info-card-header">
                            <div className="bank-info-card-icon blue">
                                <CreditCard size={20} />
                            </div>
                            <h2>اطلاعات حساب بانکی</h2>
                        </div>

                        {hasSavedInfo && (
                            <div className="saved-info-badge">
                                <CheckCircle size={14} />
                                <span>
                                    اطلاعات بانکی شما ذخیره شده است. تغییرات
                                    جدید جایگزین می‌شوند.
                                </span>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="bank-info-form"
                        >
                            {/* نام بانک */}
                            <div className="form-group">
                                <label>
                                    <Building2 size={14} />
                                    نام بانک
                                    <span className="required">*</span>
                                </label>
                                <select
                                    className={`form-input ${
                                        errors.bank_name ? "error" : ""
                                    }`}
                                    value={formData.bank_name}
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            bank_name: e.target.value,
                                        }));
                                        setErrors((prev) => ({
                                            ...prev,
                                            bank_name: undefined,
                                        }));
                                    }}
                                    disabled={isLoading}
                                >
                                    <option value="">انتخاب بانک...</option>
                                    {iranianBanks.map((bank) => (
                                        <option key={bank} value={bank}>
                                            {bank}
                                        </option>
                                    ))}
                                </select>
                                {errors.bank_name && (
                                    <span className="form-error">
                                        <AlertCircle size={12} />
                                        {errors.bank_name}
                                    </span>
                                )}
                            </div>

                            {/* نام صاحب حساب */}
                            <div className="form-group">
                                <label>
                                    <User size={14} />
                                    نام صاحب حساب
                                    <span className="required">*</span>
                                </label>
                                <div className="input-with-icon">
                                    <User size={16} />
                                    <input
                                        type="text"
                                        className={`form-input with-icon ${
                                            errors.account_holder_name
                                                ? "error"
                                                : ""
                                        }`}
                                        value={formData.account_holder_name}
                                        onChange={(e) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                account_holder_name:
                                                    e.target.value,
                                            }));
                                            setErrors((prev) => ({
                                                ...prev,
                                                account_holder_name: undefined,
                                            }));
                                        }}
                                        placeholder="مثلاً: علی رضایی"
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.account_holder_name && (
                                    <span className="form-error">
                                        <AlertCircle size={12} />
                                        {errors.account_holder_name}
                                    </span>
                                )}
                                <span className="form-hint">
                                    نام باید با نام صاحب حساب بانکی یکسان باشد.
                                </span>
                            </div>

                            {/* شماره کارت */}
                            <div className="form-group">
                                <label>
                                    <CreditCard size={14} />
                                    شماره کارت (۱۶ رقم)
                                </label>
                                <div className="input-with-icon">
                                    <CreditCard size={16} />
                                    <input
                                        type="text"
                                        className={`form-input with-icon ltr ${
                                            errors.card_number ? "error" : ""
                                        }`}
                                        value={formatCardNumber(
                                            formData.card_number,
                                        )}
                                        onChange={(e) => {
                                            const value =
                                                e.target.value.replace(
                                                    /\s/g,
                                                    "",
                                                );
                                            setFormData((prev) => ({
                                                ...prev,
                                                card_number: value,
                                            }));
                                            setErrors((prev) => ({
                                                ...prev,
                                                card_number: undefined,
                                            }));
                                        }}
                                        placeholder="1234 5678 9012 3456"
                                        dir="ltr"
                                        maxLength={19}
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.card_number && (
                                    <span className="form-error">
                                        <AlertCircle size={12} />
                                        {errors.card_number}
                                    </span>
                                )}
                            </div>

                            {/* شبا */}
                            <div className="form-group">
                                <label>
                                    <Hash size={14} />
                                    شماره شبا (اختیاری)
                                </label>
                                <div className="input-with-icon">
                                    <Hash size={16} />
                                    <input
                                        type="text"
                                        className={`form-input with-icon ltr ${
                                            errors.sheba_number ? "error" : ""
                                        }`}
                                        value={
                                            formData.sheba_number
                                                ? `IR${formData.sheba_number.replace(/^IR/i, "")}`
                                                : ""
                                        }
                                        onChange={(e) => {
                                            const value =
                                                e.target.value.toUpperCase();
                                            setFormData((prev) => ({
                                                ...prev,
                                                sheba_number: value.replace(
                                                    /^IR/i,
                                                    "",
                                                ),
                                            }));
                                            setErrors((prev) => ({
                                                ...prev,
                                                sheba_number: undefined,
                                            }));
                                        }}
                                        placeholder="IR123456789012345678901234"
                                        dir="ltr"
                                        maxLength={26}
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.sheba_number && (
                                    <span className="form-error">
                                        <AlertCircle size={12} />
                                        {errors.sheba_number}
                                    </span>
                                )}
                                <span className="form-hint">
                                    حداقل یکی از موارد شماره کارت یا شبا الزامی
                                    است.
                                </span>
                            </div>

                            {/* دکمه ذخیره */}
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        در حال ذخیره...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        ذخیره اطلاعات بانکی
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* سایدبار */}
                    <div className="bank-info-sidebar">
                        {/* پیش‌نمایش کارت */}
                        <div className="bank-card-preview">
                            <div className="bank-card-gradient">
                                <div className="bank-card-chip" />
                                <div className="bank-card-number" dir="ltr">
                                    {formData.card_number
                                        ? formatCardNumber(formData.card_number)
                                        : "•••• •••• •••• ••••"}
                                </div>
                                <div className="bank-card-footer">
                                    <div className="bank-card-holder">
                                        <span className="bank-card-label">
                                            صاحب حساب
                                        </span>
                                        <span className="bank-card-value">
                                            {formData.account_holder_name ||
                                                "نام صاحب حساب"}
                                        </span>
                                    </div>
                                    <div className="bank-card-bank">
                                        <span className="bank-card-label">
                                            بانک
                                        </span>
                                        <span className="bank-card-value">
                                            {formData.bank_name || "—"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* راهنما */}
                        <div className="bank-info-card">
                            <div className="bank-info-card-header">
                                <div className="bank-info-card-icon orange">
                                    <AlertCircle size={20} />
                                </div>
                                <h2>نکات مهم</h2>
                            </div>

                            <ul className="bank-tips-list">
                                <li>
                                    <CheckCircle size={14} />
                                    <span>
                                        شماره کارت و شبا باید به نام خودتان
                                        باشد.
                                    </span>
                                </li>
                                <li>
                                    <CheckCircle size={14} />
                                    <span>
                                        پس از درخواست برداشت، مبلغ حداکثر تا ۷۲
                                        ساعت به حساب شما واریز می‌شود.
                                    </span>
                                </li>
                                <li>
                                    <CheckCircle size={14} />
                                    <span>
                                        حداقل مبلغ برداشت ۱۰,۰۰۰ تومان است.
                                    </span>
                                </li>
                                <li>
                                    <AlertCircle
                                        size={14}
                                        className="warning"
                                    />
                                    <span>
                                        در صورت تغییر اطلاعات، برداشت‌های در
                                        انتظار با اطلاعات قبلی پردازش می‌شوند.
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* لینک کیف پول */}
                        <Link
                            href={route("barber.finance.wallet.index")}
                            className="wallet-link-card"
                        >
                            <Wallet size={16} />
                            <span>بازگشت به کیف پول</span>
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
