import { useState, useRef, useEffect, useCallback, useMemo } from "react";

export function useSelect2({
    options = [],
    value,
    onChange,
    initialOptions = [],
    isMulti = false,
    isSearchable = true,
    isAsync = false,
    asyncUrl,
    asyncMethod = "GET",
    asyncParams = {},
    asyncDelay = 400,
    isDisabled = false,
    closeMenuOnSelect = true,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [asyncOptions, setAsyncOptions] = useState([]);
    const [selectedOptionCache, setSelectedOptionCache] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);
    const abortControllerRef = useRef(null);
    const requestIdRef = useRef(0);

    const asyncParamsRef = useRef(asyncParams);

    useEffect(() => {
        asyncParamsRef.current = asyncParams;
    }, [asyncParams]);

    // مقادیر انتخاب‌شده
    const selectedValues = useMemo(() => {
        if (isMulti) {
            return Array.isArray(value) ? value : [];
        }

        return value !== null && value !== undefined && value !== ""
            ? [value]
            : [];
    }, [value, isMulti]);

    // گزینه‌های قابل نمایش در منو
    const filteredOptions = useMemo(() => {
        const source = isAsync ? asyncOptions : options;

        if (isAsync || !isSearchable || !search.trim()) {
            return source;
        }

        const term = search.trim().toLowerCase();

        return source.filter(
            (option) =>
                option.label?.toLowerCase().includes(term) ||
                String(option.value).toLowerCase().includes(term),
        );
    }, [isAsync, asyncOptions, options, isSearchable, search]);

    // حفظ برچسب گزینه‌های انتخاب‌شده
    const displayOptions = useMemo(() => {
        const merged = [...initialOptions, ...selectedOptionCache, ...options];

        return merged.filter(
            (option, index, array) =>
                array.findIndex((item) => item.value === option.value) ===
                index,
        );
    }, [initialOptions, selectedOptionCache, options]);

    const selectedOptions = useMemo(() => {
        return displayOptions.filter((option) =>
            selectedValues.includes(option.value),
        );
    }, [displayOptions, selectedValues]);

    // دریافت داده از سرور
    const fetchAsync = useCallback(
        async (searchTerm = "") => {
            if (!asyncUrl || isDisabled) return;

            // لغو درخواست قبلی
            abortControllerRef.current?.abort();

            const controller = new AbortController();
            abortControllerRef.current = controller;

            const requestId = ++requestIdRef.current;

            setIsLoading(true);
            setError(null);

            try {
                const url = new URL(asyncUrl, window.location.origin);

                const params = new URLSearchParams();

                Object.entries(asyncParamsRef.current).forEach(([key, val]) => {
                    if (val !== null && val !== undefined) {
                        params.set(key, String(val));
                    }
                });

                if (searchTerm.trim()) {
                    params.set("search", searchTerm.trim());
                } else {
                    params.delete("search");
                }

                const method = asyncMethod.toUpperCase();

                const config = {
                    method,
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    credentials: "same-origin",
                    signal: controller.signal,
                };

                if (method === "GET" || method === "HEAD") {
                    params.forEach((val, key) => {
                        url.searchParams.set(key, val);
                    });
                } else {
                    config.headers["Content-Type"] =
                        "application/x-www-form-urlencoded";

                    config.body = params.toString();
                }

                const response = await fetch(url, config);

                if (!response.ok) {
                    throw new Error(`خطا در دریافت داده (${response.status})`);
                }

                const data = await response.json();

                const results = Array.isArray(data)
                    ? data
                    : Array.isArray(data.results)
                      ? data.results
                      : Array.isArray(data.data)
                        ? data.data
                        : [];

                // فقط آخرین درخواست اجازه تغییر state دارد
                if (requestId !== requestIdRef.current) return;

                setAsyncOptions(results);
                setHighlightedIndex(0);

                // حفظ گزینه‌هایی که قبلاً انتخاب شده‌اند
                setSelectedOptionCache((previous) => {
                    const selectedPrevious = previous.filter((option) =>
                        selectedValues.includes(option.value),
                    );

                    const selectedResults = results.filter((option) =>
                        selectedValues.includes(option.value),
                    );

                    const merged = [...selectedPrevious, ...selectedResults];

                    return merged.filter(
                        (option, index, array) =>
                            array.findIndex(
                                (item) => item.value === option.value,
                            ) === index,
                    );
                });
            } catch (err) {
                if (
                    err.name !== "AbortError" &&
                    requestId === requestIdRef.current
                ) {
                    setError("خطا در دریافت داده");
                    setAsyncOptions([]);
                }
            } finally {
                if (requestId === requestIdRef.current) {
                    setIsLoading(false);
                }
            }
        },
        [asyncUrl, asyncMethod, isDisabled, selectedValues],
    );

    // بارگذاری اولیه و جست‌وجو با debounce
    useEffect(() => {
        if (!isAsync || !isOpen || isDisabled) return;

        const delay = search.trim() ? asyncDelay : 0;

        debounceRef.current = setTimeout(() => {
            fetchAsync(search);
        }, delay);

        return () => {
            clearTimeout(debounceRef.current);
        };
    }, [search, isAsync, isOpen, isDisabled, asyncDelay, fetchAsync]);

    // لغو درخواست هنگام بسته شدن منو
    useEffect(() => {
        if (isOpen) return;

        clearTimeout(debounceRef.current);
        abortControllerRef.current?.abort();

        requestIdRef.current++;
        setIsLoading(false);
    }, [isOpen]);

    // پاک‌سازی هنگام unmount
    useEffect(() => {
        return () => {
            clearTimeout(debounceRef.current);
            abortControllerRef.current?.abort();
        };
    }, []);

    // کلیک بیرون از کامپوننت
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                setSearch("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // انتخاب گزینه
    const selectOption = useCallback(
        (option) => {
            if (isDisabled || option.disabled) return;

            setSelectedOptionCache((previous) => {
                const merged = [
                    ...previous.filter((item) => item.value !== option.value),
                    option,
                ];

                return merged;
            });

            if (isMulti) {
                const newValues = selectedValues.includes(option.value)
                    ? selectedValues.filter((item) => item !== option.value)
                    : [...selectedValues, option.value];

                onChange?.(newValues);
            } else {
                onChange?.(option.value);
                setSearch("");

                if (closeMenuOnSelect) {
                    setIsOpen(false);
                }
            }
        },
        [isDisabled, isMulti, selectedValues, onChange, closeMenuOnSelect],
    );

    // حذف گزینه انتخاب‌شده
    const removeValue = useCallback(
        (valueToRemove) => {
            if (isDisabled) return;

            if (isMulti) {
                onChange?.(
                    selectedValues.filter((item) => item !== valueToRemove),
                );
            } else {
                onChange?.(null);
            }
        },
        [isDisabled, isMulti, selectedValues, onChange],
    );

    // پاک کردن انتخاب‌ها
    const clearAll = useCallback(
        (event) => {
            event?.stopPropagation();

            if (isDisabled) return;

            onChange?.(isMulti ? [] : null);
            setSearch("");
        },
        [isDisabled, isMulti, onChange],
    );

    // مدیریت صفحه‌کلید
    const handleKeyDown = useCallback(
        (event) => {
            if (isDisabled) return;

            if (!isOpen) {
                if (["Enter", " ", "ArrowDown"].includes(event.key)) {
                    event.preventDefault();
                    setIsOpen(true);
                }

                return;
            }

            switch (event.key) {
                case "ArrowDown":
                    event.preventDefault();
                    setHighlightedIndex((previous) =>
                        Math.min(previous + 1, filteredOptions.length - 1),
                    );
                    break;

                case "ArrowUp":
                    event.preventDefault();
                    setHighlightedIndex((previous) =>
                        Math.max(previous - 1, 0),
                    );
                    break;

                case "Enter":
                    event.preventDefault();

                    if (filteredOptions[highlightedIndex]) {
                        selectOption(filteredOptions[highlightedIndex]);
                    }
                    break;

                case "Escape":
                    event.preventDefault();
                    setIsOpen(false);
                    setSearch("");
                    break;

                case "Backspace":
                    if (!search && isMulti && selectedValues.length > 0) {
                        removeValue(selectedValues[selectedValues.length - 1]);
                    }
                    break;

                default:
                    break;
            }
        },
        [
            isDisabled,
            isOpen,
            filteredOptions,
            highlightedIndex,
            search,
            isMulti,
            selectedValues,
            selectOption,
            removeValue,
        ],
    );

    return {
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
        displayOptions,
        selectOption,
        removeValue,
        clearAll,
        handleKeyDown,
        fetchAsync,
    };
}
