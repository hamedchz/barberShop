import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Lock, Eye, EyeOff, Save, Shield } from "lucide-react";

export default function PasswordForm({ user }) {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("barber.profile.update-password"), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    // بررسی قدرت رمز
    const getPasswordStrength = () => {
        const pwd = data.password;
        if (!pwd) return null;
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^a-zA-Z0-9]/.test(pwd)) score++;

        if (score <= 1)
            return { level: "weak", label: "ضعیف", color: "#ef4444" };
        if (score === 2)
            return { level: "medium", label: "متوسط", color: "#f59e0b" };
        if (score === 3)
            return { level: "good", label: "خوب", color: "#3b82f6" };
        return { level: "strong", label: "قوی", color: "#10b981" };
    };

    const strength = getPasswordStrength();

    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section-title">
                <Lock size={18} />
                <span>تغییر رمز عبور</span>
            </div>

            {!user.has_password && (
                <div className="info-box">
                    <Shield size={16} />
                    <p>
                        شما هنوز رمز عبوری تنظیم نکرده‌اید. با تنظیم رمز عبور
                        می‌توانید با ایمیل یا موبایل خود وارد شوید.
                    </p>
                </div>
            )}

            {/* رمز فعلی */}
            <div className="form-group">
                <label className="form-label">
                    <Lock size={14} />
                    رمز عبور فعلی <span className="required">*</span>
                </label>
                <div className="password-input-wrapper">
                    <input
                        type={showCurrent ? "text" : "password"}
                        className={`form-input ${errors.current_password ? "has-error" : ""}`}
                        value={data.current_password}
                        onChange={(e) =>
                            setData("current_password", e.target.value)
                        }
                        placeholder="رمز عبور فعلی خود را وارد کنید"
                        dir="ltr"
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowCurrent(!showCurrent)}
                        tabIndex={-1}
                    >
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                {errors.current_password && (
                    <span className="form-error">
                        {errors.current_password}
                    </span>
                )}
            </div>

            <div className="form-divider" />

            {/* رمز جدید */}
            <div className="form-grid-2">
                <div className="form-group">
                    <label className="form-label">
                        <Lock size={14} />
                        رمز عبور جدید <span className="required">*</span>
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            type={showNew ? "text" : "password"}
                            className={`form-input ${errors.password ? "has-error" : ""}`}
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            placeholder="رمز عبور جدید"
                            dir="ltr"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowNew(!showNew)}
                            tabIndex={-1}
                        >
                            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {strength && (
                        <div className="password-strength">
                            <div className="password-strength-bar">
                                <div
                                    className="password-strength-fill"
                                    style={{
                                        width:
                                            strength.level === "weak"
                                                ? "25%"
                                                : strength.level === "medium"
                                                  ? "50%"
                                                  : strength.level === "good"
                                                    ? "75%"
                                                    : "100%",
                                        backgroundColor: strength.color,
                                    }}
                                />
                            </div>
                            <span
                                className="password-strength-label"
                                style={{ color: strength.color }}
                            >
                                {strength.label}
                            </span>
                        </div>
                    )}
                    {errors.password && (
                        <span className="form-error">{errors.password}</span>
                    )}
                </div>

                {/* تأیید رمز */}
                <div className="form-group">
                    <label className="form-label">
                        <Lock size={14} />
                        تأیید رمز عبور جدید <span className="required">*</span>
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            type={showConfirm ? "text" : "password"}
                            className={`form-input ${errors.password_confirmation ? "has-error" : ""}`}
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            placeholder="تکرار رمز عبور جدید"
                            dir="ltr"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowConfirm(!showConfirm)}
                            tabIndex={-1}
                        >
                            {showConfirm ? (
                                <EyeOff size={16} />
                            ) : (
                                <Eye size={16} />
                            )}
                        </button>
                    </div>
                    {errors.password_confirmation && (
                        <span className="form-error">
                            {errors.password_confirmation}
                        </span>
                    )}
                </div>
            </div>

            {/* راهنمای رمز */}
            <div className="info-box">
                <Shield size={16} />
                <p>
                    رمز عبور باید حداقل ۸ کاراکتر باشد و شامل حروف و اعداد
                    انگلیسی باشد.
                </p>
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
                    تغییر رمز عبور
                </button>
            </div>
        </form>
    );
}
