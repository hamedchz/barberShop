import React, { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, X, Loader2 } from "lucide-react";

export default function Search({
    value = "",
    onChange,
    onSearch,
    placeholder = "جستجو...",
    delay = 500,
    isLoading = false,
    autoFocus = false,
    className = "",
    showClearButton = true,
}) {
    const [searchTerm, setSearchTerm] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);
    const debounceTimer = useRef(null);

    // ============ همگام‌سازی با مقدار خارجی ============
    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    // ============ Debounce ============
    useEffect(() => {
        // پاک کردن تایمر قبلی
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // اگر مقدار تغییر کرد، بعد از delay تابع onSearch را صدا بزن
        debounceTimer.current = setTimeout(() => {
            if (onSearch && searchTerm !== value) {
                onSearch(searchTerm);
            }
            if (onChange) {
                onChange(searchTerm);
            }
        }, delay);

        // پاک‌سازی در unmount
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchTerm]);

    // ============ پاک کردن جستجو ============
    const handleClear = () => {
        setSearchTerm("");
        if (onSearch) onSearch("");
        if (onChange) onChange("");
        inputRef.current?.focus();
    };

    // ============ زدن Enter ============
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            if (onSearch) onSearch(searchTerm);
        }
        if (e.key === "Escape") {
            handleClear();
        }
    };

    return (
        <div
            className={`search-component ${className}`}
            style={{
                position: "relative",
                width: "100%",
            }}
        >
            {/* آیکون جستجو */}
            <div
                className="search-component-icon"
                style={{
                    position: "absolute",
                    right: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: isFocused ? "var(--primary)" : "var(--text-light)",
                    transition: "color 0.2s",
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {isLoading ? (
                    <Loader2
                        size={20}
                        style={{ animation: "spin 0.8s linear infinite" }}
                    />
                ) : (
                    <SearchIcon size={20} />
                )}
            </div>

            {/* Input */}
            <input
                ref={inputRef}
                type="text"
                className="search-component-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoFocus={autoFocus}
                style={{
                    width: "100%",
                    padding: "0.75rem 2.75rem 0.75rem 2.75rem",
                    borderRadius: "0.75rem",
                    border: isFocused
                        ? "1px solid var(--primary)"
                        : "1px solid #e5e7eb",
                    boxShadow: isFocused
                        ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                        : "none",
                    backgroundColor: "var(--white)",
                    fontFamily: "inherit",
                    fontSize: "0.875rem",
                    color: "var(--text-main)",
                    outline: "none",
                    transition: "all 0.2s",
                    direction: "rtl",
                }}
            />

            {/* دکمه پاک کردن */}
            {showClearButton && searchTerm && (
                <button
                    type="button"
                    className="search-component-clear"
                    onClick={handleClear}
                    style={{
                        position: "absolute",
                        left: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "var(--text-light)",
                        cursor: "pointer",
                        padding: "0.25rem",
                        borderRadius: "0.375rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                        e.currentTarget.style.color = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--text-light)";
                    }}
                    aria-label="پاک کردن جستجو"
                >
                    <X size={18} />
                </button>
            )}

            {/* استایل اسپینر */}
            <style jsx="true">{`
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}
