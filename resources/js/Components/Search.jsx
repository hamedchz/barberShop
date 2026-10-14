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
    const [searchTerm, setSearchTerm] = useState(value ?? "");
    const [isFocused, setIsFocused] = useState(false);

    const inputRef = useRef(null);
    const debounceTimer = useRef(null);
    const onSearchRef = useRef(onSearch);
    const onChangeRef = useRef(onChange);
    const lastSearchRef = useRef(value ?? "");

    // به‌روزرسانی callbackها بدون ایجاد تایمر اضافی
    useEffect(() => {
        onSearchRef.current = onSearch;
        onChangeRef.current = onChange;
    }, [onSearch, onChange]);

    // همگام‌سازی با مقدار خارجی، مثلاً بعد از پاسخ Inertia
    useEffect(() => {
        const externalValue = value ?? "";

        setSearchTerm((current) =>
            current === externalValue ? current : externalValue,
        );

        lastSearchRef.current = externalValue;
    }, [value]);

    // اجرای جستجو پس از توقف تایپ
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // اگر مقدار ورودی با آخرین جستجوی ارسال‌شده برابر است،
        // درخواست تکراری نفرست.
        if (searchTerm === lastSearchRef.current) {
            return;
        }

        debounceTimer.current = setTimeout(() => {
            lastSearchRef.current = searchTerm;

            onChangeRef.current?.(searchTerm);
            onSearchRef.current?.(searchTerm);
        }, delay);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchTerm, delay]);

    // پاک‌کردن جستجو
    const handleClear = () => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        setSearchTerm("");
        lastSearchRef.current = "";

        onChangeRef.current?.("");
        onSearchRef.current?.("");

        inputRef.current?.focus();
    };

    // کلیدهای Enter و Escape
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();

            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            if (searchTerm !== lastSearchRef.current) {
                lastSearchRef.current = searchTerm;

                onChangeRef.current?.(searchTerm);
                onSearchRef.current?.(searchTerm);
            }
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
                        style={{
                            animation: "search-spin 0.8s linear infinite",
                        }}
                    />
                ) : (
                    <SearchIcon size={20} />
                )}
            </div>

            {/* ورودی جستجو */}
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

            {/* دکمه پاک‌کردن */}
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
                    aria-label="پاک کردن جستجو"
                >
                    <X size={18} />
                </button>
            )}

            <style>{`
                @keyframes search-spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}
