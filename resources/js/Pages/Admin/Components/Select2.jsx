import React from "react";
import {
    Search,
    X,
    ChevronDown,
    Check,
    Loader2,
    AlertCircle,
    Plus,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { useSelect2 } from "./useSelect2";
import "../Assets/css/Select2.css";

export default function Select2({
    // پایه
    options = [],
    initialOptions = [],
    value,
    onChange,
    placeholder = "انتخاب کنید...",
    isRtl = true,
    isDisabled = false,
    isClearable = true,
    isSearchable = true,

    // multi
    isMulti = false,
    maxSelected = null,

    // async
    isAsync = false,
    asyncUrl,
    asyncMethod = "GET",
    asyncParams = {},
    asyncDelay = 400,

    // ظاهر
    size = "md",
    variant = "default",
    menuPlacement = "auto",
    maxMenuHeight = 300,

    // رفتار
    isSearchFocused = true,
    closeMenuOnSelect = true,

    // سفارشی
    renderOption = null,
    renderValue = null,
    noOptionsMessage = "گزینه‌ای یافت نشد",
    loadingMessage = "در حال بارگذاری...",

    // رویدادها
    onSearchChange,
    onMenuOpen,
    onMenuClose,
    onFocus,
    onBlur,

    className = "",
}) {
    const {
        isOpen,
        setIsOpen,
        search,
        setSearch,
        isLoading,
        error,
        highlightedIndex,
        setHighlightedIndex,
        containerRef,
        inputRef,
        filteredOptions,
        selectedOptions,
        selectedValues,
        selectOption,
        removeValue,
        clearAll,
        handleKeyDown,
    } = useSelect2({
        options,
        initialOptions,
        value,
        isMulti,
        isSearchable,
        isAsync,
        asyncUrl,
        asyncMethod,
        asyncParams,
        asyncDelay,
        isDisabled,
        closeMenuOnSelect,
        onChange,
    });

    // ============ Toggle menu ============
    const toggleMenu = () => {
        if (isDisabled) return;

        const newState = !isOpen;
        setIsOpen(newState);

        if (newState) {
            onMenuOpen?.();
            if (isSearchFocused) {
                setTimeout(() => inputRef.current?.focus(), 50);
            }
        } else {
            onMenuClose?.();
        }
    };

    // ============ Search change ============
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        onSearchChange?.(val);
    };

    // ============ حذف ============
    const handleRemove = (e, val) => {
        e.stopPropagation();
        removeValue(val);
    };

    // ============ آپشن‌ها با Grouping ============
    const groupedOptions = React.useMemo(() => {
        // اگه گروه نداریم، یه گروه ساده
        return [{ label: null, options: filteredOptions }];
    }, [filteredOptions]);

    // ============ نمایش مقدار انتخاب‌شده ============
    const renderSelected = () => {
        if (selectedOptions.length === 0) {
            return <span className="select2-placeholder">{placeholder}</span>;
        }

        if (isMulti) {
            return (
                <div className="select2-multi-values">
                    {selectedOptions.map((opt) => (
                        <span
                            key={opt.value}
                            className="select2-tag"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {opt.icon && (
                                <img
                                    src={opt.icon}
                                    alt={opt.label}
                                    className="select2-tag-icon"
                                />
                            )}
                            <span>{opt.label}</span>
                            {!isDisabled && (
                                <button
                                    type="button"
                                    className="select2-tag-remove"
                                    onClick={(e) => handleRemove(e, opt.value)}
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </span>
                    ))}
                </div>
            );
        }

        const selected = selectedOptions[0];
        if (renderValue) {
            return renderValue(selected);
        }

        return (
            <span className="select2-single-value">
                {selected?.icon && (
                    <img
                        src={selected.icon}
                        alt={selected.label}
                        className="select2-value-icon"
                    />
                )}
                <span>{selected?.label}</span>
            </span>
        );
    };

    // ============ نمایش هر گزینه ============
    const renderOptionItem = (option, index) => {
        const isSelected = selectedValues.some(
            (value) => String(value) === String(option.value),
        );
        const isHighlighted = index === highlightedIndex;
        const isMaxReached =
            isMulti &&
            maxSelected &&
            selectedValues.length >= maxSelected &&
            !isSelected;

        return (
            <button
                key={option.value}
                type="button"
                className={`select2-option ${
                    isSelected ? "selected" : ""
                } ${isHighlighted ? "highlighted" : ""} ${
                    option.disabled || isMaxReached ? "disabled" : ""
                }`}
                onClick={() => !isMaxReached && selectOption(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                disabled={option.disabled || isMaxReached}
            >
                {isMulti && (
                    <span className="select2-checkbox">
                        {isSelected && <Check size={12} />}
                    </span>
                )}

                {option.icon && (
                    <img
                        src={option.icon}
                        alt={option.label}
                        className="select2-option-icon"
                    />
                )}

                <span className="select2-option-label">
                    {renderOption ? renderOption(option) : option.label}
                </span>

                {!isMulti && isSelected && (
                    <Check size={14} className="select2-option-check" />
                )}
            </button>
        );
    };

    return (
        <div
            className={`select2-container size-${size} variant-${variant} ${className}`}
            ref={containerRef}
            dir={isRtl ? "rtl" : "ltr"}
        >
            {/* ============ Trigger ============ */}
            <div
                className={`select2-trigger ${isOpen ? "open" : ""} ${
                    isDisabled ? "disabled" : ""
                } ${error ? "has-error" : ""}`}
                onClick={toggleMenu}
                onKeyDown={handleKeyDown}
                tabIndex={isDisabled ? -1 : 0}
                onFocus={onFocus}
                onBlur={onBlur}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <div className="select2-trigger-content">
                    {/* Search input (وقتی بازه و searchable) */}
                    {isSearchable && isOpen ? (
                        <div className="select2-search-input">
                            <Search size={14} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={handleSearchChange}
                                placeholder={
                                    selectedOptions.length > 0
                                        ? ""
                                        : placeholder
                                }
                                onClick={(e) => e.stopPropagation()}
                                autoComplete="off"
                            />
                        </div>
                    ) : (
                        <div className="select2-selected">
                            {renderSelected()}
                        </div>
                    )}
                </div>

                <div className="select2-trigger-actions">
                    {isLoading && (
                        <Loader2 size={14} className="select2-spinner" />
                    )}

                    {isClearable &&
                        selectedValues.length > 0 &&
                        !isDisabled &&
                        !isLoading && (
                            <button
                                type="button"
                                className="select2-clear-btn"
                                onClick={clearAll}
                                tabIndex={-1}
                            >
                                <X size={14} />
                            </button>
                        )}

                    <ChevronDown
                        size={16}
                        className={`select2-chevron ${isOpen ? "open" : ""}`}
                    />
                </div>
            </div>

            {/* ============ Dropdown ============ */}
            {isOpen && (
                <div
                    className={`select2-dropdown placement-${menuPlacement}`}
                    style={{ maxHeight: maxMenuHeight }}
                >
                    <div className="select2-options" role="listbox">
                        {error ? (
                            <div className="select2-empty error">
                                <AlertCircle size={24} />
                                <span>{error}</span>
                            </div>
                        ) : isLoading && filteredOptions.length === 0 ? (
                            <div className="select2-empty">
                                <Loader2
                                    size={20}
                                    className="select2-spinner"
                                />
                                <span>{loadingMessage}</span>
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="select2-empty">
                                <Search size={24} />
                                <span>{noOptionsMessage}</span>
                            </div>
                        ) : (
                            groupedOptions.map((group, gi) => (
                                <div key={gi}>
                                    {group.label && (
                                        <div className="select2-group-label">
                                            {group.label}
                                        </div>
                                    )}
                                    {group.options.map((opt, i) =>
                                        renderOptionItem(opt, i),
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {filteredOptions.length > 0 && (
                        <div className="select2-footer">
                            {toPersianNumber(filteredOptions.length)} گزینه
                            {isMulti &&
                                maxSelected &&
                                selectedValues.length >= maxSelected && (
                                    <span className="select2-max-warning">
                                        {" "}
                                        • حداکثر {toPersianNumber(
                                            maxSelected,
                                        )}{" "}
                                        انتخاب
                                    </span>
                                )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
