import React from "react";
import Select from "react-select";

const colorMap = {
    green: { bg: "#ecfdf5", color: "#065f46", border: "#d1fae5" },
    blue: { bg: "#eff6ff", color: "#1e40af", border: "#dbeafe" },
    orange: { bg: "#fff7ed", color: "#9a3412", border: "#ffedd5" },
    red: { bg: "#fef2f2", color: "#991b1b", border: "#fee2e2" },
    gray: { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" },
    purple: { bg: "#f5f3ff", color: "#5b21b6", border: "#ede9fe" },
};

export default function Select2({
    options = [],
    value = null,
    onChange,
    placeholder = "انتخاب کنید...",
    isMulti = false,
    isRtl = true,
    isDisabled = false,
    isLoading = false,
    isClearable = true,
    isSearchable = true,
    showColors = false, // ← نمایش رنگ گزینه‌ها
}) {
    // ============ استایل ============
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderRadius: "0.75rem",
            borderColor: state.isFocused ? "#10b981" : "#e5e7eb",
            boxShadow: state.isFocused
                ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                : "none",
            padding: "0.25rem",
            minHeight: "48px",
            fontFamily: "inherit",
            backgroundColor: isDisabled ? "#f9fafb" : "white",
            "&:hover": {
                borderColor: isDisabled ? "#e5e7eb" : "#10b981",
            },
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: "0.25rem 0.5rem",
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
            padding: "0.625rem 1rem",
            fontFamily: "inherit",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "#1f2937",
            fontSize: "0.875rem",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "#9ca3af",
            fontSize: "0.875rem",
        }),
        input: (provided) => ({
            ...provided,
            fontSize: "0.875rem",
            fontFamily: "inherit",
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: "0.75rem",
            overflow: "hidden",
            boxShadow:
                "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            zIndex: 9999,
            marginTop: "0.25rem",
            border: "1px solid #f3f4f6",
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: "280px",
            padding: "0.25rem",
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            cursor: "pointer",
            color: "#9ca3af",
            "&:hover": {
                color: "#10b981",
            },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            cursor: "pointer",
            color: "#9ca3af",
            "&:hover": {
                color: "#ef4444",
            },
        }),
        indicatorSeparator: (provided) => ({
            ...provided,
            backgroundColor: "#e5e7eb",
        }),
        noOptionsMessage: (provided) => ({
            ...provided,
            fontSize: "0.875rem",
            color: "#9ca3af",
            padding: "0.75rem",
        }),
    };

    // ============ فرمت‌دهی گزینه‌ها ============
    const formatOptionLabel = (option, { context }) => {
        if (!showColors || !option.color) {
            return option.label;
        }

        const colorConfig = colorMap[option.color] || colorMap.gray;

        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}
            >
                <span
                    style={{
                        width: "0.625rem",
                        height: "0.625rem",
                        borderRadius: "50%",
                        backgroundColor: colorConfig.color,
                        flexShrink: 0,
                    }}
                ></span>
                <span>{option.label}</span>
            </div>
        );
    };

    return (
        <Select
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            isMulti={isMulti}
            isDisabled={isDisabled}
            isLoading={isLoading}
            isClearable={isClearable}
            isSearchable={isSearchable}
            styles={customStyles}
            isRtl={isRtl}
            formatOptionLabel={showColors ? formatOptionLabel : undefined}
            noOptionsMessage={() => "موردی یافت نشد"}
            loadingMessage={() => "در حال بارگذاری..."}
            className="react-select-container"
            classNamePrefix="react-select"
            menuPlacement="auto"
            closeMenuOnSelect={!isMulti}
            hideSelectedOptions={true} // گزینه‌های انتخاب شده از لیست حذف شوند
            isOptionDisabled={() => false}
        />
    );
}
