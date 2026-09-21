import React from "react";
import Select from "react-select";

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
}) {
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
            gap: "0.25rem",
            flexWrap: "wrap",
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
            "&:active": {
                backgroundColor: "#059669",
            },
        }),
        // Badge های انتخاب شده (سبز)
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: "#ecfdf5",
            borderRadius: "0.5rem",
            padding: "0.125rem 0.375rem",
            margin: "0.125rem",
            border: "1px solid #d1fae5",
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: "#065f46",
            fontWeight: "500",
            fontSize: "0.8125rem",
            padding: "0.125rem 0.25rem",
            paddingRight: "0.5rem",
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: "#065f46",
            borderRadius: "0.25rem",
            cursor: "pointer",
            padding: "0 0.25rem",
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
            fontFamily: "inherit",
            color: "#1f2937",
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
        clearIndicator: (provided) => ({
            ...provided,
            cursor: "pointer",
            color: "#9ca3af",
            ":hover": {
                color: "#ef4444",
            },
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            cursor: "pointer",
            color: "#9ca3af",
            ":hover": {
                color: "#10b981",
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
            noOptionsMessage={() => "موردی یافت نشد"}
            loadingMessage={() => "در حال بارگذاری..."}
            className="react-select-container"
            classNamePrefix="react-select"
            menuPlacement="auto"
            closeMenuOnSelect={false} // مهم: منو بسته نشود تا کاربر چند مورد انتخاب کند
            hideSelectedOptions={true} // گزینه‌های انتخاب شده از لیست حذف شوند
            isOptionDisabled={() => false}
        />
    );
}
