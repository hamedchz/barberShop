import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    Lock,
    Eye,
    EyeOff,
    Save,
    AlertCircle,
    Shield,
    CheckCircle,
} from "lucide-react";

export default function PasswordForm() {
    const [formData, setFormData] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // چک قدرت رمز
    const passwordStrength = (() => {
        const pwd = formData.password;
        if (!pwd) return { level: 0, label: "", color: "" };

        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (score <= 2) return { level: 1, label: "ضعیف", color: "red" };
        if (score <= 3) return { level: 2, label: "متوسط", color: "orange" };
        if (score <= 4) return { level: 3, label: "خوب", color: "blue" };
        return { level: 4, label: "قوی", color: "green" };
    })();

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        router.put(route("customer.profile.update-password"), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setFormData({
                    current_password: "",
                    password: "",
                    password_confirmation: "",
                });
                setIsLoading(false);
            },
            onError: (errs) => {
                setErrors(errs);
                setIsLoading(false);
            },
        });
    };

    const toggleShow = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="profile-card">
            <div className="profile-card-header">
                <div className="card-icon-box green">
                    <Shield size={20} />
                </div>
                <h2>تغییر رمز عبور</h2>
            </div>

            <div className="password-warning">
                <AlertCircle size={14} />
                <p>
                    برای امنیت حساب، رمز عبور باید حداقل ۸ کاراکتر و شامل حروف و
                    اعداد باشد.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
                {/* رمز فعلی */}
                <div className="form-group">
                    <label>
                        <Lock size={14} />
                        رمز عبور فعلی
                        <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                        <input
                            type={showPasswords.current ? "text" : "password"}
                            className={`form-input ltr ${
                                errors.current_password ? "error" : ""
                            }`}
                            value={formData.current_password}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    current_password: e.target.value,
                                });
                                setErrors({
                                    ...errors,
                                    current_password: undefined,
                                });
                            }}
                            dir="ltr"
                        />
                        <button
                            type="button"
                            className="input-icon-btn"
                            onClick={() => toggleShow("current")}
                        >
                            {showPasswords.current ? (
                                <EyeOff size={16} />
                            ) : (
                                <Eye size={16} />
                            )}
                        </button>
                    </div>
                    {errors.current_password && (
                        <span className="form-error">
                            <AlertCircle size={12} />
                            {errors.current_password}
                        </span>
                    )}
                </div>

                {/* رمز جدید */}
                <div className="form-group">
                    <label>
                        <Lock size={14} />
                        رمز عبور جدید
                        <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                        <input
                            type={showPasswords.new ? "text" : "password"}
                            className={`form-input ltr ${
                                errors.password ? "error" : ""
                            }`}
                            value={formData.password}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                });
                                setErrors({ ...errors, password: undefined });
                            }}
                            dir="ltr"
                        />
                        <button
                            type="button"
                            className="input-icon-btn"
                            onClick={() => toggleShow("new")}
                        >
                            {showPasswords.new ? (
                                <EyeOff size={16} />
                            ) : (
                                <Eye size={16} />
                            )}
                        </button>
                    </div>

                    {/* نوار قدرت */}
                    {formData.password && (
                        <div className="password-strength">
                            <div className="strength-bars">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className={`strength-bar ${
                                            i <= passwordStrength.level
                                                ? passwordStrength.color
                                                : ""
                                        }`}
                                    />
                                ))}
                            </div>
                            <span
                                className={`strength-label ${passwordStrength.color}`}
                            >
                                {passwordStrength.label}
                            </span>
                        </div>
                    )}

                    {errors.password && (
                        <span className="form-error">
                            <AlertCircle size={12} />
                            {errors.password}
                        </span>
                    )}
                </div>

                {/* تأیید رمز */}
                <div className="form-group">
                    <label>
                        <Lock size={14} />
                        تأیید رمز عبور جدید
                        <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                        <input
                            type={showPasswords.confirm ? "text" : "password"}
                            className={`form-input ltr ${
                                errors.password_confirmation ? "error" : ""
                            }`}
                            value={formData.password_confirmation}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password_confirmation: e.target.value,
                                })
                            }
                            dir="ltr"
                        />
                        <button
                            type="button"
                            className="input-icon-btn"
                            onClick={() => toggleShow("confirm")}
                        >
                            {showPasswords.confirm ? (
                                <EyeOff size={16} />
                            ) : (
                                <Eye size={16} />
                            )}
                        </button>
                    </div>

                    {/* چک مطابقت */}
                    {formData.password_confirmation && (
                        <span
                            className={`match-indicator ${
                                formData.password ===
                                formData.password_confirmation
                                    ? "success"
                                    : "error"
                            }`}
                        >
                            {formData.password ===
                            formData.password_confirmation ? (
                                <>
                                    <CheckCircle size={12} />
                                    مطابقت دارد
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={12} />
                                    مطابقت ندارد
                                </>
                            )}
                        </span>
                    )}
                </div>

                {/* دکمه */}
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={
                        isLoading ||
                        !formData.current_password ||
                        !formData.password ||
                        formData.password !== formData.password_confirmation
                    }
                >
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            در حال تغییر...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            تغییر رمز عبور
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
