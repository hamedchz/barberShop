import React, { useMemo } from "react";
import Select from "react-select";
import { Clock } from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function TimePicker({
    value = "09:00",
    onChange,
    label,
    disabled = false,
    minuteStep = 15, // فاصله دقیقه‌ها (۱۵ یا ۳۰ یا ۵)
}) {
    // ============ استخراج ساعت و دقیقه ============
    const [hour, minute] = useMemo(() => {
        const parts = (value || "09:00").split(":");
        return [
            parts[0]?.padStart(2, "0") || "09",
            parts[1]?.padStart(2, "0") || "00",
        ];
    }, [value]);

    // ============ گزینه‌های ساعت ============
    const hourOptions = useMemo(() => {
        const hours = [];
        for (let h = 0; h < 24; h++) {
            const hh = String(h).padStart(2, "0");
            hours.push({
                value: hh,
                label: toPersianNumber(hh),
            });
        }
        return hours;
    }, []);

    // ============ گزینه‌های دقیقه ============
    const minuteOptions = useMemo(() => {
        const minutes = [];
        for (let m = 0; m < 60; m += minuteStep) {
            const mm = String(m).padStart(2, "0");
            minutes.push({
                value: mm,
                label: toPersianNumber(mm),
            });
        }
        return minutes;
    }, [minuteStep]);

    // ============ استایل Select ============
    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: "44px",
            borderRadius: "0.75rem",
            borderColor: state.isFocused ? "#10b981" : "#e5e7eb",
            boxShadow: state.isFocused
                ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                : "none",
            fontFamily: "inherit",
            backgroundColor: disabled ? "#f9fafb" : "white",
            "&:hover": {
                borderColor: disabled ? "#e5e7eb" : "#10b981",
            },
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: "0.25rem 0.75rem",
            justifyContent: "center",
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "#1f2937",
            fontWeight: "700",
            fontSize: "0.9375rem",
            textAlign: "center",
            width: "100%",
        }),
        indicatorSeparator: () => ({
            display: "none",
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            color: "#9ca3af",
            padding: "0 0.5rem",
            "&:hover": {
                color: "#10b981",
            },
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: "0.75rem",
            overflow: "hidden",
            boxShadow:
                "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            zIndex: 9999,
            minWidth: "100px",
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: "200px",
            padding: "0.25rem",
        }),
        option: (provided, state) => ({
            ...provided,
            textAlign: "center",
            fontWeight: state.isSelected ? "700" : "500",
            backgroundColor: state.isSelected
                ? "#10b981"
                : state.isFocused
                  ? "#ecfdf5"
                  : "white",
            color: state.isSelected ? "white" : "#1f2937",
            cursor: "pointer",
            padding: "0.5rem",
            fontSize: "0.875rem",
        }),
    };

    // ============ تغییر ساعت ============
    const handleHourChange = (selected) => {
        if (!onChange) return;
        onChange(`${selected.value}:${minute}`);
    };

    // ============ تغییر دقیقه ============
    const handleMinuteChange = (selected) => {
        if (!onChange) return;
        onChange(`${hour}:${selected.value}`);
    };

    return (
        <div className="time-picker">
            {label && (
                <label className="form-label">
                    <Clock size={14} />
                    {label} <span className="required">*</span>
                </label>
            )}

            <div className="time-picker-row">
                {/* ساعت */}
                <div className="time-picker-select">
                    <Select
                        options={hourOptions}
                        value={hourOptions.find((o) => o.value === hour)}
                        onChange={handleHourChange}
                        styles={selectStyles}
                        isSearchable={false}
                        isDisabled={disabled}
                        isRtl={true}
                        menuPlacement="auto"
                        classNamePrefix="time-select"
                    />
                    <span className="time-picker-label">ساعت</span>
                </div>

                {/* جداکننده */}
                <div className="time-picker-separator">:</div>

                {/* دقیقه */}
                <div className="time-picker-select">
                    <Select
                        options={minuteOptions}
                        value={minuteOptions.find((o) => o.value === minute)}
                        onChange={handleMinuteChange}
                        styles={selectStyles}
                        isSearchable={false}
                        isDisabled={disabled}
                        isRtl={true}
                        menuPlacement="auto"
                        classNamePrefix="time-select"
                    />
                    <span className="time-picker-label">دقیقه</span>
                </div>
            </div>

            {/* پیش‌نمایش */}
            <div className="time-picker-preview">
                <Clock size={14} />
                <span>
                    {toPersianNumber(hour)}:{toPersianNumber(minute)}
                </span>
            </div>
        </div>
    );
}
