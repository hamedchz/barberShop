import React, { useMemo } from "react";
import { AlertCircle, CheckCircle, Wallet } from "lucide-react";
import { toPersianNumber } from "../../../../../utils/persianNumbers";
import "../../../Assets/css/AmountInput.css";
const formatAmount = (value) =>
    toPersianNumber(Number(value || 0).toLocaleString("en-US"));

export default function AmountInput({
    value,
    onChange,
    min = 1000,
    max = 500000000,
    unit = "تومان",
    placeholder = "مثلاً 100000",
    disabled = false,
    error = null,
    helperText = null,
    label = null,
    required = false,
}) {
    const numericValue = Number(value || 0);
    const isEmpty = !value || value === "";

    // ============ اعتبارسنجی ============
    const validation = useMemo(() => {
        if (isEmpty) {
            return { status: "empty", message: null };
        }
        if (numericValue < min) {
            return {
                status: "too-low",
                message: `حداقل مبلغ ${formatAmount(min)} ${unit} است.`,
            };
        }
        if (numericValue > max) {
            return {
                status: "too-high",
                message: `حداکثر مبلغ ${formatAmount(max)} ${unit} است.`,
            };
        }
        return { status: "valid", message: null };
    }, [numericValue, isEmpty, min, max, unit]);

    const displayError = error || validation.message;

    // ============ استایل border بر اساس وضعیت ============
    const getInputClass = () => {
        let cls = "amount-input-field";
        if (disabled) cls += " disabled";
        if (displayError) cls += " has-error";
        else if (validation.status === "valid") cls += " has-success";
        return cls;
    };

    return (
        <div className="amount-input-wrapper">
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}

            {/* ============ Input ============ */}
            <div className="amount-input-container">
                <input
                    type="number"
                    className={getInputClass()}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    required={required}
                    disabled={disabled}
                    inputMode="numeric"
                />
                <span className="amount-input-unit">{unit}</span>
            </div>

            {/* ============ پیش‌نمایش مبلغ ============ */}
            {!isEmpty && numericValue > 0 && (
                <div
                    className={`amount-preview ${
                        validation.status === "valid" ? "valid" : "invalid"
                    }`}
                >
                    <Wallet size={14} />
                    <span className="amount-preview-label">مبلغ وارد شده:</span>
                    <strong className="amount-preview-value">
                        {formatAmount(numericValue)}
                    </strong>
                    <span className="amount-preview-unit">{unit}</span>
                    {validation.status === "valid" && (
                        <CheckCircle
                            size={14}
                            className="amount-preview-icon success"
                        />
                    )}
                </div>
            )}

            {/* ============ خطا / راهنما ============ */}
            {displayError ? (
                <div className="amount-input-error">
                    <AlertCircle size={14} />
                    <span>{displayError}</span>
                </div>
            ) : helperText ? (
                <div className="amount-input-hint">
                    <span>{helperText}</span>
                </div>
            ) : (
                <div className="amount-input-hint">
                    <span>
                        حداقل {formatAmount(min)} و حداکثر {formatAmount(max)}{" "}
                        {unit}
                    </span>
                </div>
            )}
        </div>
    );
}
