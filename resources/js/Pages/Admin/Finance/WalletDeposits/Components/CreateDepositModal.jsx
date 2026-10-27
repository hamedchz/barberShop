import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Plus, X, AlertTriangle, ArrowLeft, CheckCircle } from "lucide-react";
import Select2 from "../../../Components/Select2";
import AmountInput from "./AmountInput";
import DepositConfirmStep from "./DepositConfirmStep";

export default function CreateDepositModal({ userOptions = [], onClose }) {
    const [form, setForm] = useState({
        user_id: "",
        amount: "",
        description: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUserOption, setSelectedUserOption] = useState(null);
    const [showConfirmStep, setShowConfirmStep] = useState(false);

    // ============ انتخاب کاربر ============
    const handleUsersChange = (userId) => {
        const selected = userOptions.find(
            (user) => String(user.value) === String(userId),
        );

        setForm((prev) => ({ ...prev, user_id: userId ?? "" }));
        setSelectedUserOption(selected ?? null);
        setErrors((prev) => ({ ...prev, user_id: "" }));
    };

    // ============ اعتبارسنجی و رفتن به مرحله تایید ============
    const handleSubmit = (e) => {
        e.preventDefault();

        const amount = Number(form.amount || 0);

        const clientErrors = {};
        if (!form.user_id) {
            clientErrors.user_id = "انتخاب کاربر الزامی است.";
        }
        if (!amount || amount < 1000) {
            clientErrors.amount = "حداقل مبلغ ۱,۰۰۰ تومان است.";
        } else if (amount > 500000000) {
            clientErrors.amount = "حداکثر مبلغ ۵۰۰,۰۰۰,۰۰۰ تومان است.";
        }

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setErrors({});
        setShowConfirmStep(true); // ← مرحله تایید
    };

    // ============ ارسال نهایی ============
    const handleFinalSubmit = () => {
        setIsLoading(true);
        router.post("/admin/finance/wallet/deposits", form, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError: (err) => {
                setErrors(err);
                setIsLoading(false);
                setShowConfirmStep(false);
            },
        });
    };

    // ============ مرحله تایید ============
    if (showConfirmStep) {
        return (
            <DepositConfirmStep
                user={selectedUserOption}
                amount={form.amount}
                isLoading={isLoading}
                onConfirm={handleFinalSubmit}
                onBack={() => setShowConfirmStep(false)}
                onClose={onClose}
            />
        );
    }

    // ============ فرم اصلی ============
    return (
        <div
            className="stat-detail-overlay"
            onClick={() => {
                if (!isLoading) onClose();
            }}
        >
            <div
                className="stat-detail-modal"
                onClick={(event) => event.stopPropagation()}
                style={{ maxWidth: "520px" }}
            >
                {/* هدر */}
                <div
                    className="stat-detail-header"
                    style={{
                        background: "#ecfdf5",
                        borderColor: "#a7f3d0",
                    }}
                >
                    <div
                        className="stat-detail-icon"
                        style={{ background: "#065f46", color: "#fff" }}
                    >
                        <Plus size={24} />
                    </div>
                    <div className="stat-detail-header-content">
                        <h3 style={{ color: "#065f46" }}>شارژ دستی کیف پول</h3>
                        <p className="stat-detail-desc">
                            مبلغ را به کیف پول کاربر اضافه کنید
                        </p>
                    </div>
                    <button
                        type="button"
                        className="stat-detail-close"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ============ هشدار غیرقابل برگشت ============ */}
                <div className="deposit-warning">
                    <AlertTriangle size={18} />
                    <div>
                        <strong>توجه:</strong> این عملیات{" "}
                        <strong>غیرقابل برگشت</strong> است. مبلغ مستقیماً به کیف
                        پول کاربر اضافه می‌شود و کاربر می‌تواند آن را{" "}
                        <strong>برداشت کند</strong>.
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    style={{ padding: "1rem 1.5rem 1.25rem" }}
                >
                    {/* انتخاب کاربر */}
                    <div
                        className="filter-group"
                        style={{ marginBottom: "1rem" }}
                    >
                        <label className="form-label">
                            کاربر <span className="required">*</span>
                        </label>

                        <Select2
                            isAsync={true}
                            asyncUrl={route("admin.search.users.search")}
                            asyncMethod="GET"
                            asyncParams={{ limit: 20 }}
                            asyncDelay={400}
                            searchParam="q"
                            initialOptions={userOptions}
                            value={form.user_id}
                            onChange={handleUsersChange}
                            placeholder="جستجو و انتخاب کاربر..."
                            isMulti={false}
                            isSearchable={true}
                            isClearable={true}
                            closeMenuOnSelect={true}
                            noOptionsMessage="کاربری یافت نشد"
                        />

                        {errors.user_id && (
                            <div className="form-error">{errors.user_id}</div>
                        )}

                        {/* پیش‌نمایش کاربر */}
                        {selectedUserOption && (
                            <div className="selected-user-preview">
                                <div className="selected-user-avatar">
                                    {selectedUserOption.icon ? (
                                        <img
                                            src={selectedUserOption.icon}
                                            alt={
                                                selectedUserOption.name ??
                                                selectedUserOption.label ??
                                                "کاربر"
                                            }
                                        />
                                    ) : (
                                        <span>
                                            {(
                                                selectedUserOption.name ??
                                                selectedUserOption.label ??
                                                "?"
                                            )
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="selected-user-info">
                                    <strong>
                                        {selectedUserOption.name ??
                                            selectedUserOption.label}
                                    </strong>
                                    {selectedUserOption.phone && (
                                        <span dir="ltr">
                                            {selectedUserOption.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* مبلغ */}
                    <div
                        className="filter-group"
                        style={{ marginBottom: "1rem" }}
                    >
                        <AmountInput
                            label="مبلغ"
                            value={form.amount}
                            onChange={(val) => {
                                setForm((prev) => ({
                                    ...prev,
                                    amount: val,
                                }));
                                setErrors((prev) => ({
                                    ...prev,
                                    amount: "",
                                }));
                            }}
                            min={1000}
                            max={500000000}
                            unit="تومان"
                            placeholder="مثلاً 100000"
                            required
                            disabled={isLoading}
                            error={errors.amount}
                        />
                    </div>

                    {/* توضیحات */}
                    <div
                        className="filter-group"
                        style={{ marginBottom: "1rem" }}
                    >
                        <label className="form-label">توضیحات</label>
                        <textarea
                            className="filter-input"
                            value={form.description}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    description: event.target.value,
                                }))
                            }
                            placeholder="دلیل شارژ (اختیاری)"
                            rows={3}
                            maxLength={500}
                            disabled={isLoading}
                            style={{ resize: "vertical" }}
                        />
                    </div>

                    {/* دکمه‌ها */}
                    <div
                        className="stat-detail-footer"
                        style={{
                            padding: 0,
                            borderTop: "none",
                            marginTop: "1rem",
                        }}
                    >
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                justifyContent: "center",
                            }}
                        >
                            <ArrowLeft size={14} />
                            ادامه و تایید
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            انصراف
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
