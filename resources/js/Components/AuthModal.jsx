import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { Eye, EyeOff, LoaderCircle, X } from "lucide-react";

import "./Assets/css/AuthModal.css";

const ENDPOINTS = {
    login: "/auth/login",
    sendOtp: "/auth/register/otp/send",
    verifyOtp: "/auth/register/otp/verify",
    register: "/auth/register",
};

const toEnglishDigits = (value = "") =>
    String(value)
        .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
        .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

const getReturnTo = () =>
    window.location.pathname + window.location.search + window.location.hash;

const getPasswordStrength = (password = "") => {
    const checks = [
        password.length >= 8,
        password.length >= 12,
        /[a-z]/.test(password) && /[A-Z]/.test(password),
        /\d/.test(password),
        /[^a-zA-Z0-9]/.test(password),
    ];

    const score = checks.filter(Boolean).length;

    let label = "ضعیف";
    let level = "weak";

    if (score >= 5) {
        label = "بسیار قوی";
        level = "strong";
    } else if (score >= 4) {
        label = "قوی";
        level = "good";
    } else if (score >= 3) {
        label = "متوسط";
        level = "medium";
    }

    return { score, label, level };
};

async function postJson(url, payload) {
    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");

    const response = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(
            data.message || "در انجام عملیات مشکلی پیش آمد.",
        );

        error.errors = data.errors || {};
        error.status = response.status;

        throw error;
    }

    return data;
}

export default function AuthModal({ site, isOpen, mode, onClose }) {
    const [activeTab, setActiveTab] = useState("login");
    const loginForm = useForm({
        phone: "",
        password: "",
        remember: false,
        return_to: "",
    });

    const registerForm = useForm({
        name: "",
        phone: "",
        password: "",
        password_confirmation: "",
        return_to: "",
    });

    const [registerCode, setRegisterCode] = useState("");

    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const [otpLoading, setOtpLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");

    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [
        showRegisterPasswordConfirmation,
        setShowRegisterPasswordConfirmation,
    ] = useState(false);

    const loading =
        otpLoading || loginForm.processing || registerForm.processing;

    const passwordStrength = getPasswordStrength(registerForm.data.password);

    const resetForm = (tab = "login") => {
        setActiveTab(tab);

        loginForm.reset();
        loginForm.clearErrors();

        registerForm.reset();
        registerForm.clearErrors();

        setRegisterCode("");
        setOtpSent(false);
        setOtpVerified(false);
        setCountdown(0);

        setOtpLoading(false);
        setErrors({});
        setMessage("");

        setShowLoginPassword(false);
        setShowRegisterPassword(false);
        setShowRegisterPasswordConfirmation(false);
    };

    useEffect(() => {
        const openModal = (event) => {
            const tab = event.detail?.tab === "register" ? "register" : "login";

            resetForm(tab);
            setIsOpen(true);
        };

        window.addEventListener("auth:open", openModal);

        return () => {
            window.removeEventListener("auth:open", openModal);
        };
    }, []);

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = window.setInterval(() => {
            setCountdown((current) => {
                if (current <= 1) {
                    window.clearInterval(timer);
                    return 0;
                }

                return current - 1;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [countdown > 0]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !loading) {
                onClose?.();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, loading]);

    const closeModal = () => {
        onClose?.();
    };

    const changeTab = (tab) => {
        if (loading) return;
        resetForm(tab);
    };

    const showError = (error) => {
        setErrors(error.errors || {});
        setMessage(error.message || "در ارتباط با سرور مشکلی پیش آمد.");
    };

    const getFieldError = (field) => {
        const inertiaErrors =
            activeTab === "login" ? loginForm.errors : registerForm.errors;

        const value = inertiaErrors[field] || errors[field];

        if (Array.isArray(value)) {
            return value[0];
        }

        return value || "";
    };

    const hasErrors = () => {
        const inertiaErrors =
            activeTab === "login" ? loginForm.errors : registerForm.errors;

        return (
            Object.keys(inertiaErrors).length > 0 ||
            Object.keys(errors).length > 0
        );
    };

    const handleLogin = (event) => {
        event.preventDefault();

        setErrors({});
        setMessage("");
        loginForm.clearErrors();

        const phone = toEnglishDigits(loginForm.data.phone).trim();

        if (!/^09\d{9}$/.test(phone)) {
            setErrors({
                phone: ["شماره موبایل معتبر نیست."],
            });
            return;
        }

        if (!loginForm.data.password) {
            setErrors({
                password: ["رمز عبور الزامی است."],
            });
            return;
        }

        loginForm.transform((data) => ({
            ...data,
            phone,
            return_to: getReturnTo(),
        }));

        loginForm.post(ENDPOINTS.login, {
            preserveScroll: true,

            onSuccess: () => {
                onClose?.();
            },

            onError: () => {
                setMessage("لطفاً اطلاعات واردشده را بررسی کنید.");
            },

            onFinish: () => {
                loginForm.transform((data) => data);
            },
        });
    };

    const handleSendOtp = async () => {
        setErrors({});
        setMessage("");

        registerForm.clearErrors();

        const phone = toEnglishDigits(registerForm.data.phone).trim();

        if (!/^09\d{9}$/.test(phone)) {
            setErrors({
                phone: ["شماره موبایل معتبر نیست."],
            });
            return;
        }

        setOtpLoading(true);

        try {
            const data = await postJson(ENDPOINTS.sendOtp, { phone });

            setOtpSent(true);
            setOtpVerified(false);
            setRegisterCode("");

            setCountdown(
                Number(data.resend_after) > 0 ? Number(data.resend_after) : 60,
            );

            setMessage(data.message || "کد تأیید برای شما ارسال شد.");
        } catch (error) {
            showError(error);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setErrors({});
        setMessage("");

        const phone = toEnglishDigits(registerForm.data.phone).trim();

        const code = toEnglishDigits(registerCode).trim();

        if (!/^09\d{9}$/.test(phone)) {
            setErrors({
                phone: ["شماره موبایل معتبر نیست."],
            });
            return;
        }

        if (!/^\d{6}$/.test(code)) {
            setErrors({
                code: ["کد تأیید باید ۶ رقم باشد."],
            });
            return;
        }

        setOtpLoading(true);

        try {
            const data = await postJson(ENDPOINTS.verifyOtp, { phone, code });

            if (data.verified !== true) {
                throw new Error("تأیید شماره موبایل انجام نشد.");
            }

            setOtpVerified(true);

            setMessage(data.message || "شماره موبایل با موفقیت تأیید شد.");
        } catch (error) {
            setOtpVerified(false);
            showError(error);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleRegister = (event) => {
        event.preventDefault();

        setErrors({});
        setMessage("");

        registerForm.clearErrors();

        if (!otpVerified) {
            setMessage("ابتدا شماره موبایل خود را تأیید کنید.");
            return;
        }

        const phone = toEnglishDigits(registerForm.data.phone).trim();

        if (!/^09\d{9}$/.test(phone)) {
            setErrors({
                phone: ["شماره موبایل معتبر نیست."],
            });
            return;
        }

        if (!registerForm.data.name.trim()) {
            setErrors({
                name: ["نام و نام خانوادگی الزامی است."],
            });
            return;
        }

        if (registerForm.data.password.length < 8) {
            setErrors({
                password: ["رمز عبور حداقل باید ۸ کاراکتر باشد."],
            });
            return;
        }

        if (
            registerForm.data.password !==
            registerForm.data.password_confirmation
        ) {
            setErrors({
                password_confirmation: ["تکرار رمز عبور مطابقت ندارد."],
            });
            return;
        }

        registerForm.transform((data) => ({
            ...data,
            name: data.name.trim(),
            phone,
            return_to: getReturnTo(),
        }));

        registerForm.post(ENDPOINTS.register, {
            preserveScroll: true,

            onSuccess: () => {
                onClose?.();
            },

            onError: (formErrors) => {
                if (formErrors.phone) {
                    setOtpVerified(false);
                    setOtpSent(false);
                    setRegisterCode("");
                    setCountdown(0);
                }

                setMessage("لطفاً اطلاعات واردشده را بررسی کنید.");
            },

            onFinish: () => {
                registerForm.transform((data) => data);
            },
        });
    };

    const updateRegisterPhone = (value) => {
        registerForm.setData("phone", value);

        setRegisterCode("");
        setOtpSent(false);
        setOtpVerified(false);
        setCountdown(0);

        setErrors({});
        setMessage("");

        registerForm.clearErrors();
    };

    if (!isOpen) return null;

    return (
        <div
            className="auth-modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    closeModal();
                }
            }}
        >
            <div
                className="auth-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-modal-title"
                dir="rtl"
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="auth-modal-close"
                    aria-label="بستن"
                >
                    <X size={22} />
                </button>

                <div className="auth-modal-brand">
                    <div className="auth-modal-logo">
                        {site?.logo ? (
                            <img src={site.logo} alt={site?.name || "لوگو"} />
                        ) : (
                            <span>{site?.name?.charAt(0) || "B"}</span>
                        )}
                    </div>

                    <span>{site?.name || "سالن زیبایی"}</span>
                    <small>زیبایی، با یک انتخاب درست</small>
                </div>

                <div className="auth-modal-heading">
                    <h2 id="auth-modal-title">
                        {activeTab === "login"
                            ? "خوش آمدید"
                            : "ایجاد حساب کاربری"}
                    </h2>

                    <p>
                        {activeTab === "login"
                            ? "برای ورود به حساب خود اطلاعات را وارد کنید."
                            : "برای عضویت، اطلاعات خود را تکمیل کنید."}
                    </p>
                </div>

                <div className="auth-modal-tabs">
                    <button
                        type="button"
                        className={activeTab === "login" ? "active" : ""}
                        onClick={() => changeTab("login")}
                        disabled={loading}
                    >
                        ورود
                    </button>

                    <button
                        type="button"
                        className={activeTab === "register" ? "active" : ""}
                        onClick={() => changeTab("register")}
                        disabled={loading}
                    >
                        ثبت‌نام
                    </button>
                </div>

                {message && (
                    <div
                        className={`auth-message ${
                            hasErrors() ? "error" : "success"
                        }`}
                    >
                        {message}
                    </div>
                )}

                {activeTab === "login" ? (
                    <form onSubmit={handleLogin} noValidate>
                        <div className="auth-field">
                            <label htmlFor="login-phone">
                                شماره موبایل
                                <span className="auth-required">*</span>
                            </label>

                            <input
                                id="login-phone"
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel"
                                placeholder="مثلاً 09123456789"
                                value={loginForm.data.phone}
                                onChange={(event) => {
                                    loginForm.setData(
                                        "phone",
                                        event.target.value,
                                    );

                                    loginForm.clearErrors("phone");
                                    setErrors({});
                                    setMessage("");
                                }}
                                disabled={loading}
                            />

                            {getFieldError("phone") && (
                                <small className="auth-field-error">
                                    {getFieldError("phone")}
                                </small>
                            )}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="login-password">
                                رمز عبور
                                <span className="auth-required">*</span>
                            </label>

                            <div className="auth-input-wrap">
                                <input
                                    id="login-password"
                                    type={
                                        showLoginPassword ? "text" : "password"
                                    }
                                    autoComplete="current-password"
                                    placeholder="رمز عبور خود را وارد کنید"
                                    value={loginForm.data.password}
                                    onChange={(event) => {
                                        loginForm.setData(
                                            "password",
                                            event.target.value,
                                        );

                                        loginForm.clearErrors("password");
                                        setErrors({});
                                        setMessage("");
                                    }}
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() =>
                                        setShowLoginPassword((prev) => !prev)
                                    }
                                    aria-label={
                                        showLoginPassword
                                            ? "مخفی کردن رمز عبور"
                                            : "نمایش رمز عبور"
                                    }
                                    disabled={loading}
                                >
                                    {showLoginPassword ? (
                                        <EyeOff size={19} />
                                    ) : (
                                        <Eye size={19} />
                                    )}
                                </button>
                            </div>

                            {getFieldError("password") && (
                                <small className="auth-field-error">
                                    {getFieldError("password")}
                                </small>
                            )}
                        </div>

                        <label className="auth-remember">
                            <input
                                type="checkbox"
                                checked={loginForm.data.remember}
                                onChange={(event) =>
                                    loginForm.setData(
                                        "remember",
                                        event.target.checked,
                                    )
                                }
                                disabled={loading}
                            />

                            <span>مرا به خاطر بسپار</span>
                        </label>

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loginForm.processing ? (
                                <>
                                    <LoaderCircle
                                        className="auth-loading-icon"
                                        size={19}
                                    />
                                    <span>در حال ورود، لطفاً صبر کنید...</span>
                                </>
                            ) : (
                                "ورود به حساب"
                            )}
                        </button>

                        <div className="auth-switch">
                            حساب کاربری ندارید؟
                            <button
                                type="button"
                                onClick={() => changeTab("register")}
                                disabled={loading}
                            >
                                ثبت‌نام کنید
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} noValidate>
                        <div className="auth-field">
                            <label htmlFor="register-name">
                                نام و نام خانوادگی
                                <span className="auth-required">*</span>
                            </label>

                            <input
                                id="register-name"
                                type="text"
                                autoComplete="name"
                                placeholder="نام و نام خانوادگی"
                                value={registerForm.data.name}
                                onChange={(event) => {
                                    registerForm.setData(
                                        "name",
                                        event.target.value,
                                    );

                                    registerForm.clearErrors("name");
                                    setErrors({});
                                    setMessage("");
                                }}
                                disabled={loading}
                            />

                            {getFieldError("name") && (
                                <small className="auth-field-error">
                                    {getFieldError("name")}
                                </small>
                            )}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="register-phone">
                                شماره موبایل
                                <span className="auth-required">*</span>
                            </label>

                            <div className="auth-phone-row">
                                <input
                                    id="register-phone"
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    placeholder="مثلاً 09123456789"
                                    value={registerForm.data.phone}
                                    onChange={(event) =>
                                        updateRegisterPhone(event.target.value)
                                    }
                                    disabled={loading || otpVerified}
                                />

                                {!otpVerified && (
                                    <button
                                        type="button"
                                        className="auth-otp-send"
                                        onClick={handleSendOtp}
                                        disabled={loading || countdown > 0}
                                    >
                                        {otpLoading ? (
                                            <LoaderCircle
                                                className="auth-loading-icon"
                                                size={16}
                                            />
                                        ) : otpSent ? (
                                            countdown > 0 ? (
                                                `${countdown} ثانیه`
                                            ) : (
                                                "ارسال مجدد"
                                            )
                                        ) : (
                                            "ارسال کد"
                                        )}
                                    </button>
                                )}
                            </div>

                            {getFieldError("phone") && (
                                <small className="auth-field-error">
                                    {getFieldError("phone")}
                                </small>
                            )}
                        </div>

                        {otpSent && !otpVerified && (
                            <div className="auth-field">
                                <label htmlFor="register-code">
                                    کد تأیید پیامک‌شده
                                    <span className="auth-required">*</span>
                                </label>

                                <div className="auth-phone-row">
                                    <input
                                        id="register-code"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        placeholder="کد ۶ رقمی"
                                        value={registerCode}
                                        onChange={(event) => {
                                            setRegisterCode(event.target.value);

                                            setErrors({});
                                            setMessage("");
                                        }}
                                        disabled={loading}
                                    />

                                    <button
                                        type="button"
                                        className="auth-otp-send"
                                        onClick={handleVerifyOtp}
                                        disabled={loading}
                                    >
                                        {otpLoading ? (
                                            <LoaderCircle
                                                className="auth-loading-icon"
                                                size={16}
                                            />
                                        ) : (
                                            "تأیید کد"
                                        )}
                                    </button>
                                </div>

                                {getFieldError("code") && (
                                    <small className="auth-field-error">
                                        {getFieldError("code")}
                                    </small>
                                )}
                            </div>
                        )}

                        {otpVerified && (
                            <div className="auth-verified">
                                شماره موبایل با موفقیت تأیید شد.
                            </div>
                        )}

                        <div className="auth-field">
                            <label htmlFor="register-password">
                                رمز عبور
                                <span className="auth-required">*</span>
                            </label>

                            <div className="auth-input-wrap">
                                <input
                                    id="register-password"
                                    type={
                                        showRegisterPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="new-password"
                                    placeholder="حداقل ۸ کاراکتر"
                                    value={registerForm.data.password}
                                    onChange={(event) => {
                                        registerForm.setData(
                                            "password",
                                            event.target.value,
                                        );

                                        registerForm.clearErrors("password");
                                        setErrors({});
                                        setMessage("");
                                    }}
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() =>
                                        setShowRegisterPassword((prev) => !prev)
                                    }
                                    aria-label={
                                        showRegisterPassword
                                            ? "مخفی کردن رمز عبور"
                                            : "نمایش رمز عبور"
                                    }
                                    disabled={loading}
                                >
                                    {showRegisterPassword ? (
                                        <EyeOff size={19} />
                                    ) : (
                                        <Eye size={19} />
                                    )}
                                </button>
                            </div>

                            {registerForm.data.password.length > 0 && (
                                <div
                                    className={`auth-password-strength ${passwordStrength.level}`}
                                    aria-live="polite"
                                >
                                    <div className="auth-password-strength-header">
                                        <span>قدرت رمز عبور</span>
                                        <strong>
                                            {passwordStrength.label}
                                        </strong>
                                    </div>

                                    <div
                                        className="auth-password-strength-bars"
                                        role="progressbar"
                                        aria-label="قدرت رمز عبور"
                                        aria-valuemin={0}
                                        aria-valuemax={5}
                                        aria-valuenow={passwordStrength.score}
                                    >
                                        {[0, 1, 2, 3, 4].map((item) => (
                                            <span
                                                key={item}
                                                className={
                                                    item <
                                                    passwordStrength.score
                                                        ? "active"
                                                        : ""
                                                }
                                            />
                                        ))}
                                    </div>

                                    <small>
                                        حداقل ۸ کاراکتر، ترکیبی از حروف، اعداد و
                                        نمادها انتخاب کنید.
                                    </small>
                                </div>
                            )}

                            {getFieldError("password") && (
                                <small className="auth-field-error">
                                    {getFieldError("password")}
                                </small>
                            )}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="register-password-confirm">
                                تکرار رمز عبور
                                <span className="auth-required">*</span>
                            </label>

                            <div className="auth-input-wrap">
                                <input
                                    id="register-password-confirm"
                                    type={
                                        showRegisterPasswordConfirmation
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="new-password"
                                    placeholder="رمز عبور را مجدداً وارد کنید"
                                    value={
                                        registerForm.data.password_confirmation
                                    }
                                    onChange={(event) => {
                                        registerForm.setData(
                                            "password_confirmation",
                                            event.target.value,
                                        );

                                        registerForm.clearErrors(
                                            "password_confirmation",
                                        );

                                        setErrors({});
                                        setMessage("");
                                    }}
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() =>
                                        setShowRegisterPasswordConfirmation(
                                            (prev) => !prev,
                                        )
                                    }
                                    aria-label={
                                        showRegisterPasswordConfirmation
                                            ? "مخفی کردن رمز عبور"
                                            : "نمایش رمز عبور"
                                    }
                                    disabled={loading}
                                >
                                    {showRegisterPasswordConfirmation ? (
                                        <EyeOff size={19} />
                                    ) : (
                                        <Eye size={19} />
                                    )}
                                </button>
                            </div>

                            {getFieldError("password_confirmation") && (
                                <small className="auth-field-error">
                                    {getFieldError("password_confirmation")}
                                </small>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading || !otpVerified}
                        >
                            {registerForm.processing ? (
                                <>
                                    <LoaderCircle
                                        className="auth-loading-icon"
                                        size={19}
                                    />
                                    <span>در حال ایجاد حساب کاربری...</span>
                                </>
                            ) : (
                                "ایجاد حساب کاربری"
                            )}
                        </button>

                        <div className="auth-switch">
                            قبلاً ثبت‌نام کرده‌اید؟
                            <button
                                type="button"
                                onClick={() => changeTab("login")}
                                disabled={loading}
                            >
                                وارد شوید
                            </button>
                        </div>
                    </form>
                )}

                <div className="auth-modal-footer">
                    ورود و عضویت به معنی پذیرش قوانین و مقررات سایت است.
                </div>
            </div>
        </div>
    );
}
