import React, { useState, useMemo } from "react";
import { useForm } from "@inertiajs/react";
import {
    User,
    Mail,
    MapPin,
    Calendar,
    Save,
    FileText,
    Users,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import PersianDatePicker from "../../../../Components/PersianDatePicker";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import "../Assets/css/PersonalForm.css";

/* ==========================================
   قوانین اعتبارسنجی مطابق با کنترلر
   ========================================== */
const VALIDATION_RULES = {
    name: {
        required: true,
        min: 2,
        max: 100,
        messages: {
            required: "لطفاً نام خود را وارد کنید.",
            min: "نام باید حداقل ۲ کاراکتر باشد.",
            max: "نام نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.",
        },
    },
    email: {
        required: false,
        email: true,
        max: 150,
        messages: {
            email: "فرمت ایمیل صحیح نیست.",
            max: "ایمیل نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.",
        },
    },
    bio: {
        required: false,
        max: 500,
        messages: {
            max: "بیوگرافی نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد.",
        },
    },
    address: {
        required: false,
        max: 500,
        messages: {
            max: "آدرس نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد.",
        },
    },
    city: {
        required: false,
        max: 100,
        messages: {
            max: "شهر نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.",
        },
    },
    birth_date: {
        required: false,
        beforeToday: true,
        messages: {
            beforeToday: "تاریخ تولد باید قبل از امروز باشد.",
        },
    },
    gender: {
        required: false,
        in: ["male", "female", "other"],
        messages: {
            in: "جنسیت انتخاب‌شده معتبر نیست.",
        },
    },
};

/* ==========================================
   Regex ایمیل
   ========================================== */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ==========================================
   تابع اعتبارسنجی یک فیلد
   ========================================== */
function validateField(field, value) {
    const rule = VALIDATION_RULES[field];
    if (!rule) return "";

    const strValue = typeof value === "string" ? value.trim() : value;

    // required
    if (rule.required && (!strValue || strValue.length === 0)) {
        return rule.messages.required;
    }

    // اگر خالی و غیراجباری، فقط max را چک نکن (چون خالی مجاز است)
    if (!strValue || strValue.length === 0) {
        return "";
    }

    // min
    if (rule.min && strValue.length < rule.min) {
        return rule.messages.min;
    }

    // max
    if (rule.max && strValue.length > rule.max) {
        return rule.messages.max;
    }

    // email
    if (rule.email && !EMAIL_REGEX.test(strValue)) {
        return rule.messages.email;
    }

    // before today
    if (rule.beforeToday) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(strValue);
        if (isNaN(inputDate.getTime())) {
            return "تاریخ وارد شده معتبر نیست.";
        }
        inputDate.setHours(0, 0, 0, 0);
        if (inputDate >= today) {
            return rule.messages.beforeToday;
        }
    }

    // in
    if (rule.in && !rule.in.includes(strValue)) {
        return rule.messages.in;
    }

    return "";
}

/* ==========================================
   کامپوننت اصلی
   ========================================== */
export default function PersonalInfoForm({ user }) {
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        address: user.address || "",
        city: user.city || "",
        birth_date: user.birth_date || "",
        gender: user.gender || "",
    });

    // خطاهای کلاینت
    const [clientErrors, setClientErrors] = useState({});
    // فیلدهایی که کاربر لمس کرده
    const [touched, setTouched] = useState({});
    // آیا فرم submit شده
    const [submitted, setSubmitted] = useState(false);

    /* ============ اعتبارسنجی همه فیلدها ============ */
    const validateAll = () => {
        const newErrors = {};
        Object.keys(VALIDATION_RULES).forEach((field) => {
            const err = validateField(field, data[field]);
            if (err) newErrors[field] = err;
        });
        setClientErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /* ============ اعتبارسنجی یک فیلد هنگام تغییر ============ */
    const handleChange = (field, value) => {
        setData(field, value);

        // اگر فیلد قبلاً لمس شده یا submit شده، فوراً اعتبارسنجی کن
        if (touched[field] || submitted) {
            const err = validateField(field, value);
            setClientErrors((prev) => {
                const next = { ...prev };
                if (err) next[field] = err;
                else delete next[field];
                return next;
            });
        }

        // خطای سرور مربوط به این فیلد را پاک کن
        if (errors[field]) {
            clearErrors(field);
        }
    };

    /* ============ when field loses focus ============ */
    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const err = validateField(field, data[field]);
        setClientErrors((prev) => {
            const next = { ...prev };
            if (err) next[field] = err;
            else delete next[field];
            return next;
        });
    };

    /* ============ submit ============ */
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);

        if (!validateAll()) {
            // اسکرول به اولین خطا
            const firstErrorField = Object.keys(clientErrors)[0];
            if (firstErrorField) {
                const el = document.querySelector(
                    `[data-field="${firstErrorField}"]`,
                );
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
                el?.focus?.();
            }
            return;
        }

        put(route("barber.profile.update"), {
            preserveScroll: true,
            onError: () => {
                // خطاهای سرور هم به clientErrors اضافه می‌شوند (نمایش یکپارچه)
            },
        });
    };

    /* ============ ترکیب خطاها (کلاینت + سرور) ============ */
    const getError = (field) => clientErrors[field] || errors[field] || "";

    /* ============ ذخیره‌شده‌ها برای نمایش موفقیت ============ */
    const showSuccess = (field) =>
        (touched[field] || submitted) && !getError(field) && data[field];

    /* ============ وضعیت بیوگرافی ============ */
    const bioLength = data.bio.length;
    const bioNearLimit = bioLength > 450;
    const bioOverLimit = bioLength > 500;

    return (
        <form
            onSubmit={handleSubmit}
            className="profile-form"
            noValidate
            autoComplete="off"
        >
            <div className="form-section-title">
                <User size={18} />
                <span>اطلاعات شخصی</span>
            </div>

            <div className="form-grid-2">
                {/* ========== نام ========== */}
                <div className="form-group" data-field="name">
                    <label className="form-label">
                        <User size={14} />
                        نام و نام خانوادگی <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            className={`form-input ${
                                getError("name") ? "has-error" : ""
                            } ${showSuccess("name") ? "has-success" : ""}`}
                            value={data.name}
                            onChange={(e) =>
                                handleChange("name", e.target.value)
                            }
                            onBlur={() => handleBlur("name")}
                            placeholder="نام کامل خود را وارد کنید"
                            maxLength={101}
                            aria-invalid={!!getError("name")}
                            aria-describedby="name-error"
                        />
                        {showSuccess("name") && (
                            <CheckCircle2
                                size={16}
                                className="input-icon-success"
                            />
                        )}
                    </div>
                    {getError("name") ? (
                        <span className="form-error" id="name-error">
                            <AlertCircle size={12} />
                            {getError("name")}
                        </span>
                    ) : (
                        <span className="form-hint">
                            حداقل ۲ و حداکثر ۱۰۰ کاراکتر
                        </span>
                    )}
                </div>

                {/* ========== ایمیل ========== */}
                <div className="form-group" data-field="email">
                    <label className="form-label">
                        <Mail size={14} />
                        ایمیل
                    </label>
                    <div className="input-wrapper">
                        <input
                            type="email"
                            className={`form-input ${
                                getError("email") ? "has-error" : ""
                            } ${showSuccess("email") ? "has-success" : ""}`}
                            value={data.email}
                            onChange={(e) =>
                                handleChange("email", e.target.value)
                            }
                            onBlur={() => handleBlur("email")}
                            placeholder="example@email.com"
                            dir="ltr"
                            maxLength={151}
                            aria-invalid={!!getError("email")}
                            aria-describedby="email-error"
                        />
                        {/* {showSuccess("email") && (
                            <CheckCircle2
                                size={16}
                                className="input-icon-success"
                            />
                        )} */}
                    </div>
                    {getError("email") ? (
                        <span className="form-error" id="email-error">
                            <AlertCircle size={12} />
                            {getError("email")}
                        </span>
                    ) : (
                        ""
                    )}
                </div>

                {/* ========== تاریخ تولد ========== */}
                <div className="form-group" data-field="birth_date">
                    <PersianDatePicker
                        label="تاریخ تولد"
                        value={data.birth_date}
                        onChange={(value) => {
                            handleChange("birth_date", value);
                            handleBlur("birth_date");
                        }}
                        placeholder="انتخاب تاریخ تولد"
                        maxDate={new Date()}
                    />
                    {getError("birth_date") && (
                        <span className="form-error">
                            <AlertCircle size={12} />
                            {getError("birth_date")}
                        </span>
                    )}
                </div>

                {/* ========== جنسیت ========== */}
                <div className="form-group" data-field="gender">
                    <label className="form-label">
                        <Users size={14} />
                        جنسیت
                    </label>
                    <select
                        className={`form-input ${
                            getError("gender") ? "has-error" : ""
                        }`}
                        value={data.gender}
                        onChange={(e) => handleChange("gender", e.target.value)}
                        onBlur={() => handleBlur("gender")}
                        aria-invalid={!!getError("gender")}
                    >
                        <option value="">انتخاب کنید</option>
                        <option value="male">مرد</option>
                        <option value="female">زن</option>
                        <option value="other">سایر</option>
                    </select>
                    {getError("gender") && (
                        <span className="form-error">
                            <AlertCircle size={12} />
                            {getError("gender")}
                        </span>
                    )}
                </div>
            </div>

            {/* ========== بیوگرافی ========== */}
            <div className="form-group" data-field="bio">
                <label className="form-label">
                    <FileText size={14} />
                    بیوگرافی
                </label>
                <div className="textarea-wrapper">
                    <textarea
                        className={`form-input form-textarea ${
                            getError("bio") || bioOverLimit ? "has-error" : ""
                        }`}
                        value={data.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        onBlur={() => handleBlur("bio")}
                        placeholder="درباره خودتان بنویسید..."
                        rows={4}
                        maxLength={600}
                        aria-invalid={!!getError("bio") || bioOverLimit}
                    />
                </div>
                <div className="form-hint-row">
                    {getError("bio") || bioOverLimit ? (
                        <span className="form-error">
                            <AlertCircle size={12} />
                            {getError("bio") ||
                                "بیوگرافی نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد."}
                        </span>
                    ) : (
                        <span className="form-hint">حداکثر ۵۰۰ کاراکتر</span>
                    )}
                    <span
                        className={`form-counter ${
                            bioOverLimit
                                ? "over-limit"
                                : bioNearLimit
                                  ? "near-limit"
                                  : ""
                        }`}
                    >
                        {toPersianNumber(bioLength)} / {toPersianNumber(500)}
                    </span>
                </div>
            </div>

            {/* ========== دکمه ذخیره ========== */}
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
                    {processing ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </button>
            </div>
        </form>
    );
}
