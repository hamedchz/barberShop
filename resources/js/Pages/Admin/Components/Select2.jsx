import React from "react";
import Select from "react-select";

export default function Select2({
    options,
    value,
    onChange,
    placeholder = "انتخاب کنید...",
    isMulti = false,
    isRtl = true,
}) {
    // استایل‌های سفارشی برای هماهنگی با طراحی
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderRadius: "0.75rem",
            borderColor: state.isFocused ? "#10b981" : "#e5e7eb",
            boxShadow: state.isFocused ? "0 0 0 1px #10b981" : "none",
            padding: "0.25rem",
            minHeight: "48px",
            "&:hover": {
                borderColor: "#10b981",
            },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "#10b981"
                : state.isFocused
                  ? "#ecfdf5"
                  : "white",
            color: state.isSelected ? "white" : "#1f2937",
            cursor: "pointer",
            padding: "0.75rem 1rem",
            "&:active": {
                backgroundColor: "#059669",
            },
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: "#ecfdf5",
            borderRadius: "0.5rem",
            padding: "0.125rem 0.5rem",
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: "#065f46",
            fontWeight: "500",
            fontSize: "0.875rem",
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: "#065f46",
            ":hover": {
                backgroundColor: "#10b981",
                color: "white",
            },
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "#9ca3af",
            fontSize: "0.875rem",
        }),
        input: (provided) => ({
            ...provided,
            fontSize: "0.875rem",
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: "0.75rem",
            overflow: "hidden",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            zIndex: 9999,
        }),
    };

    return (
        <Select
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            isMulti={isMulti}
            styles={customStyles}
            isRtl={isRtl}
            isSearchable={true}
            noOptionsMessage={() => "موردی یافت نشد"}
            className="react-select-container"
            classNamePrefix="react-select"
        />
    );
}
