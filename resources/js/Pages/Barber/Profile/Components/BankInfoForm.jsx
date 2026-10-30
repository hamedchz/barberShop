import React from "react";
import { useForm } from "@inertiajs/react";
import {
    CreditCard,
    Building2,
    Hash,
    Save,
    Wallet,
    Shield,
    User,
} from "lucide-react";
import Select2 from "../../../Admin/Components/Select2";

// تبدیل اعداد فارسی به انگلیسی
const toEnglishDigits = (str) => {
    return str
        .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
        .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

export default function BankInfoForm({ bankInfo, banks = [] }) {
    const { data, setData, put, processing, errors, clearErrors, setError } =
        useForm({
            bank_id: bankInfo.bank_id ? String(bankInfo.bank_id) : "",
            bank_name: bankInfo.bank_name || "",
            account_holder_name: bankInfo.account_holder_name || "",
            card_number: bankInfo.card_number || "",
            sheba_number: bankInfo.sheba_number || "",
        });
    const initialBankOptions = data.bank_id
        ? [
              {
                  value: String(data.bank_id),
                  label: data.bank_name || "بانک انتخاب‌شده",
              },
          ]
        : [];
    const validateForm = () => {
        const validationErrors = {};

        if (data.bank_id !== null && data.bank_id !== "") {
            const bankExists = banks.some(
                (bank) => String(bank.id) === String(data.bank_id),
            );

            // فقط در صورتی بررسی شود که بانک در لیست اولیه موجود باشد.
            // بانک‌های جستجوی Ajax ممکن است در banks نباشند.
            if (banks.length > 0 && !bankExists) {
                // اعتبارسنجی نهایی وجود بانک در سرور انجام می‌شود.
            }
        }

        if (data.bank_name && typeof data.bank_name !== "string") {
            validationErrors.bank_name = "نام بانک معتبر نیست.";
        } else if (data.bank_name.length > 100) {
            validationErrors.bank_name =
                "نام بانک نباید بیشتر از ۱۰۰ کاراکتر باشد.";
        }

        if (data.account_holder_name.length > 150) {
            validationErrors.account_holder_name =
                "نام صاحب حساب نباید بیشتر از ۱۵۰ کاراکتر باشد.";
        }

        if (data.card_number && data.card_number.length !== 16) {
            validationErrors.card_number = "شماره کارت باید ۱۶ رقم باشد.";
        }

        if (data.sheba_number && data.sheba_number.length !== 24) {
            validationErrors.sheba_number = "شماره شبا باید ۲۴ رقم باشد.";
        }

        return validationErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        clearErrors();

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            Object.entries(validationErrors).forEach(([field, message]) => {
                setError(field, message);
            });

            return;
        }

        put(route("barber.profile.update-bank-info"), {
            preserveScroll: true,
        });
    };

    const handleCardNumberChange = (e) => {
        const value = toEnglishDigits(e.target.value).replace(/\D/g, "");
        setData("card_number", value.slice(0, 16));
    };

    const handleShebaChange = (e) => {
        let value = toEnglishDigits(e.target.value)
            .replace(/\s/g, "")
            .replace(/^IR/i, "")
            .replace(/\D/g, "");
        setData("sheba_number", value.slice(0, 24));
    };

    // فرمت نمایش شماره کارت
    const formatCardDisplay = (value) => {
        return value.replace(/(\d{4})(?=\d)/g, "$1 ");
    };

    const formatShebaDisplay = (value) => {
        return value.replace(/(\d{4})(?=\d)/g, "$1 ");
    };

    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section-title">
                <CreditCard size={18} />
                <span>اطلاعات بانکی</span>
            </div>

            {bankInfo.has_bank_info && (
                <div className="bank-status-badge">
                    <Shield size={14} />
                    <span>اطلاعات بانکی ثبت شده است</span>
                </div>
            )}

            <div className="info-box">
                <Wallet size={16} />
                <p>
                    اطلاعات بانکی شما برای واریز درآمد به حساب شما استفاده
                    می‌شود. لطفاً اطلاعات را با دقت وارد کنید.
                </p>
            </div>

            <div className="form-grid-2">
                {/* نام بانک */}
                <div className="form-group">
                    <label className="form-label">
                        <Building2 size={14} />
                        نام بانک
                    </label>

                    <Select2
                        isAsync
                        asyncUrl={route("user.banks.search")}
                        asyncMethod="GET"
                        asyncParams={{ limit: 5 }}
                        value={data.bank_id ? String(data.bank_id) : ""}
                        initialOptions={initialBankOptions}
                        onChange={(value, option) => {
                            const bankId =
                                value != null && value !== ""
                                    ? String(value)
                                    : "";

                            const bankName = bankId
                                ? (option?.label ?? option?.name ?? "")
                                : "";

                            setData((prev) => ({
                                ...prev,
                                bank_id: bankId,
                                bank_name: bankName,
                            }));

                            clearErrors("bank_id", "bank_name");
                        }}
                        placeholder="بانک خود را انتخاب کنید"
                        isSearchable
                        isClearable
                        isDisabled={processing}
                    />

                    {errors.bank_id && (
                        <span className="form-error">{errors.bank_id}</span>
                    )}

                    {errors.bank_name && (
                        <span className="form-error">{errors.bank_name}</span>
                    )}
                </div>

                {/* نام صاحب حساب */}
                <div className="form-group">
                    <label className="form-label">
                        <User size={14} />
                        نام صاحب حساب
                    </label>
                    <input
                        type="text"
                        className={`form-input ${errors.account_holder_name ? "has-error" : ""}`}
                        value={data.account_holder_name}
                        onChange={(e) =>
                            setData("account_holder_name", e.target.value)
                        }
                        placeholder="نام و نام خانوادگی صاحب حساب"
                    />
                    {errors.account_holder_name && (
                        <span className="form-error">
                            {errors.account_holder_name}
                        </span>
                    )}
                </div>
            </div>

            {/* شماره کارت */}
            <div className="form-group">
                <label className="form-label">
                    <CreditCard size={14} />
                    شماره کارت
                </label>
                <input
                    type="text"
                    className={`form-input ${errors.card_number ? "has-error" : ""}`}
                    value={formatCardDisplay(data.card_number)}
                    onChange={handleCardNumberChange}
                    placeholder="xxxx xxxx xxxx xxxx"
                    dir="ltr"
                    maxLength={19}
                />
                <div className="form-hint-row">
                    {errors.card_number ? (
                        <span className="form-error">{errors.card_number}</span>
                    ) : (
                        <span className="form-hint">
                            شماره کارت ۱۶ رقمی خود را وارد کنید
                        </span>
                    )}
                    <span className="form-counter">
                        {data.card_number.length} / 16
                    </span>
                </div>
            </div>

            {/* شماره شبا */}
            <div className="form-group">
                <label className="form-label">
                    <Hash size={14} />
                    شماره شبا
                </label>
                <div className="sheba-input-wrapper">
                    <span className="sheba-prefix">IR</span>
                    <input
                        type="text"
                        className={`form-input sheba-input ${errors.sheba_number ? "has-error" : ""}`}
                        value={formatShebaDisplay(data.sheba_number)}
                        onChange={handleShebaChange}
                        placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                        dir="ltr"
                        maxLength={29}
                    />
                </div>
                <div className="form-hint-row">
                    {errors.sheba_number ? (
                        <span className="form-error">
                            {errors.sheba_number}
                        </span>
                    ) : (
                        <span className="form-hint">
                            شماره شبا ۲۴ رقمی (بدون IR)
                        </span>
                    )}
                    <span className="form-counter">
                        {data.sheba_number.length} / 24
                    </span>
                </div>
            </div>

            <div className="form-actions">
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={processing}
                >
                    {processing ? (
                        <span className="spinner" />
                    ) : (
                        <Save size={16} />
                    )}
                    ذخیره اطلاعات بانکی
                </button>
            </div>
        </form>
    );
}
