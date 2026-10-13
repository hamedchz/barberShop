import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    CreditCard,
    Save,
    AlertCircle,
    Building2,
    User,
    Hash,
    Shield,
    CheckCircle,
} from "lucide-react";

import Select2 from "../../../Admin/Components/Select2";

export default function BankInfoForm({ bankInfo, banks }) {
    const [formData, setFormData] = useState({
        bank_id: bankInfo?.bank_id ?? "",
        account_holder_name: bankInfo?.account_holder_name ?? "",
        card_number: bankInfo?.card_number ?? "",
        sheba_number: bankInfo?.sheba_number ?? "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // گزینه اولیه برای نمایش بانک ذخیره‌شده
    const selectedBank = banks.find(
        (bank) => String(bank.value ?? bank.id) === String(formData.bank_id),
    );

    const initialBankOptions = formData.bank_id
        ? [
              {
                  value: String(formData.bank_id),
                  label:
                      bankInfo?.bank_name ||
                      selectedBank?.label ||
                      selectedBank?.name ||
                      "بانک انتخاب‌شده",
                  icon: bankInfo?.icon || selectedBank?.icon || null,
              },
          ]
        : [];

    // حذف خطای یک فیلد
    const clearFieldError = (field) => {
        setErrors((previous) => ({
            ...previous,
            [field]: undefined,
        }));
    };

    // فرمت شماره کارت
    const formatCardNumber = (value) => {
        const cleaned = String(value || "")
            .replace(/\D/g, "")
            .slice(0, 16);

        return cleaned.replace(/(.{4})/g, "$1 ").trim();
    };

    // اعتبارسنجی فرم
    const validate = () => {
        const clientErrors = {};

        const cleanCard = formData.card_number.replace(/\D/g, "");
        const cleanSheba = formData.sheba_number
            .replace(/\s/g, "")
            .replace(/^IR/i, "");

        if (!formData.bank_id) {
            clientErrors.bank_id = "لطفاً بانک خود را انتخاب کنید.";
        }

        if (!formData.account_holder_name.trim()) {
            clientErrors.account_holder_name =
                "لطفاً نام صاحب حساب را وارد کنید.";
        }

        if (!cleanCard && !cleanSheba) {
            clientErrors.card_number =
                "حداقل یکی از موارد کارت یا شبا الزامی است.";
        }

        if (cleanCard && cleanCard.length !== 16) {
            clientErrors.card_number = "شماره کارت باید ۱۶ رقم باشد.";
        }

        if (cleanSheba && !/^\d{24}$/.test(cleanSheba)) {
            clientErrors.sheba_number =
                "شماره شبا باید شامل ۲۴ رقم پس از IR باشد.";
        }

        return clientErrors;
    };

    // ارسال فرم
    const handleSubmit = (event) => {
        event.preventDefault();

        if (isLoading) return;

        const clientErrors = validate();

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        const cleanCard = formData.card_number.replace(/\D/g, "");

        const cleanSheba = formData.sheba_number
            .replace(/\s/g, "")
            .replace(/^IR/i, "");

        router.put(
            route("customer.profile.update-bank-info"),
            {
                bank_id: formData.bank_id,
                account_holder_name: formData.account_holder_name.trim(),
                card_number: cleanCard || null,
                sheba_number: cleanSheba || null,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setIsLoading(false);
                },

                onError: (serverErrors) => {
                    setErrors(serverErrors);
                    setIsLoading(false);
                },

                onFinish: () => {
                    setIsLoading(false);
                },
            },
        );
    };

    return (
        <div className="profile-card">
            {/* عنوان */}
            <div className="profile-card-header">
                <div className="card-icon-box purple">
                    <CreditCard size={20} />
                </div>

                <h2>اطلاعات بانکی</h2>
            </div>

            {/* هشدار امنیتی */}
            <div className="security-notice">
                <Shield size={18} />

                <p>
                    اطلاعات بانکی شما به‌صورت امن ذخیره می‌شود و برای واریز وجه
                    استفاده خواهد شد.
                </p>
            </div>

            {/* وضعیت اطلاعات ذخیره‌شده */}
            {bankInfo?.has_bank_info && (
                <div className="saved-info-badge">
                    <CheckCircle size={14} />

                    <span>اطلاعات بانکی شما قبلاً ذخیره شده است.</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">
                {/* انتخاب بانک */}
                <div className="form-group">
                    <label>
                        <Building2 size={14} />
                        نام بانک
                    </label>

                    <Select2
                        isAsync
                        asyncUrl={route("customer.banks.search")}
                        asyncMethod="GET"
                        asyncParams={{ limit: 5 }}
                        value={formData.bank_id ? String(formData.bank_id) : ""}
                        initialOptions={initialBankOptions}
                        onChange={(value) => {
                            console.log("Selected bank value:", value);

                            setFormData((prev) => ({
                                ...prev,
                                bank_id: value ?? "",
                            }));
                        }}
                        placeholder="بانک خود را انتخاب کنید"
                    />

                    {errors.bank_id && (
                        <span className="form-error">
                            <AlertCircle size={12} />
                            {errors.bank_id}
                        </span>
                    )}
                </div>

                {/* نام صاحب حساب */}
                <div className="form-group">
                    <label>
                        <User size={14} />
                        نام صاحب حساب
                    </label>

                    <input
                        type="text"
                        className={`form-input ${
                            errors.account_holder_name ? "error" : ""
                        }`}
                        value={formData.account_holder_name}
                        onChange={(event) => {
                            setFormData((previous) => ({
                                ...previous,
                                account_holder_name: event.target.value,
                            }));

                            clearFieldError("account_holder_name");
                        }}
                        placeholder="مثلاً: علی رضایی"
                        autoComplete="name"
                        disabled={isLoading}
                    />

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
                            inputMode="numeric"
                            autoComplete="off"
                            className={`form-input with-icon ltr ${
                                errors.card_number ? "error" : ""
                            }`}
                            value={formatCardNumber(formData.card_number)}
                            onChange={(event) => {
                                const value = event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 16);

                                setFormData((previous) => ({
                                    ...previous,
                                    card_number: value,
                                }));

                                clearFieldError("card_number");
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

                {/* شماره شبا */}
                <div className="form-group">
                    <label>
                        <Hash size={14} />
                        شماره شبا (اختیاری)
                    </label>

                    <div className="input-with-icon">
                        <Hash size={16} />

                        <input
                            type="text"
                            inputMode="text"
                            autoComplete="off"
                            className={`form-input with-icon ltr ${
                                errors.sheba_number ? "error" : ""
                            }`}
                            value={
                                formData.sheba_number
                                    ? `IR${formData.sheba_number
                                          .replace(/^IR/i, "")
                                          .replace(/\s/g, "")}`
                                    : ""
                            }
                            onChange={(event) => {
                                const value = event.target.value
                                    .toUpperCase()
                                    .replace(/\s/g, "")
                                    .replace(/^IR/i, "")
                                    .replace(/\D/g, "")
                                    .slice(0, 24);

                                setFormData((previous) => ({
                                    ...previous,
                                    sheba_number: value,
                                }));

                                clearFieldError("sheba_number");
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
                        حداقل یکی از موارد شماره کارت یا شبا الزامی است.
                    </span>
                </div>

                {/* ذخیره */}
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
                            <Save size={16} />
                            ذخیره اطلاعات بانکی
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
