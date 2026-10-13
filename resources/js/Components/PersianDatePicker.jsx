import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    X,
} from "lucide-react";
import {
    toJalaali,
    toGregorian,
    isValidJalaaliDate,
    jalaaliMonthLength,
} from "jalaali-js";

import "../Assets/persianDatePicker.css";

const MONTHS = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
];

const WEEK_DAYS = [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
];

const WEEK_DAYS_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

const toPersianNumber = (value) =>
    String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[digit]);

const pad = (value) => String(value).padStart(2, "0");

/** دریافت تاریخ میلادی با فرمت YYYY-MM-DD */
const parseGregorianValue = (value) => {
    if (!value || typeof value !== "string") return null;

    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const gy = Number(match[1]);
    const gm = Number(match[2]);
    const gd = Number(match[3]);

    if (
        !Number.isInteger(gy) ||
        !Number.isInteger(gm) ||
        !Number.isInteger(gd) ||
        gm < 1 ||
        gm > 12 ||
        gd < 1 ||
        gd > 31
    ) {
        return null;
    }

    // جلوگیری از پذیرش تاریخ‌های نامعتبر مثل 2025-02-31
    const date = new Date(Date.UTC(gy, gm - 1, gd));
    if (
        date.getUTCFullYear() !== gy ||
        date.getUTCMonth() + 1 !== gm ||
        date.getUTCDate() !== gd
    ) {
        return null;
    }

    return { gy, gm, gd };
};

/** تبدیل تاریخ میلادی YYYY-MM-DD به تاریخ شمسی */
const gregorianToJalali = (value) => {
    const parsed = parseGregorianValue(value);
    if (!parsed) return null;

    try {
        return toJalaali(parsed.gy, parsed.gm, parsed.gd);
    } catch {
        return null;
    }
};

/** تبدیل تاریخ شمسی به رشته تاریخ میلادی YYYY-MM-DD */
const jalaliToGregorianString = (jy, jm, jd) => {
    if (!isValidJalaaliDate(jy, jm, jd)) return "";

    const gregorian = toGregorian(jy, jm, jd);
    return `${gregorian.gy}-${pad(gregorian.gm)}-${pad(gregorian.gd)}`;
};

/** دریافت تاریخ امروز به تقویم شمسی */
const getTodayJalali = () => {
    const today = new Date();
    return toJalaali(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate(),
    );
};

export default function PersianDatePicker({
    value = "",
    onChange,
    placeholder = "انتخاب تاریخ",
    label = "",
    disabled = false,
    minDate = null,
    maxDate = null,
    className = "",
    clearable = true,
}) {
    const wrapperRef = useRef(null);
    const today = useMemo(() => getTodayJalali(), []);

    const selectedJalali = useMemo(() => gregorianToJalali(value), [value]);

    const initialDate = selectedJalali || today;

    const [isOpen, setIsOpen] = useState(false);
    const [viewYear, setViewYear] = useState(initialDate.jy);
    const [viewMonth, setViewMonth] = useState(initialDate.jm);
    const [pickerMode, setPickerMode] = useState("calendar");
    const [yearRangeStart, setYearRangeStart] = useState(initialDate.jy - 5);

    // اگر مقدار از بیرون تغییر کرد، تقویم روی همان ماه قرار بگیرد.
    useEffect(() => {
        if (selectedJalali) {
            setViewYear(selectedJalali.jy);
            setViewMonth(selectedJalali.jm);
        }
    }, [selectedJalali]);

    // بستن تقویم با کلیک بیرون از کامپوننت
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                setPickerMode("calendar");
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        }

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isOpen]);

    // بستن تقویم با کلید Escape
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                setPickerMode("calendar");
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    const isBeforeMinDate = (dateString) =>
        Boolean(minDate && dateString < minDate);

    const isAfterMaxDate = (dateString) =>
        Boolean(maxDate && dateString > maxDate);

    const isSelectable = (jy, jm, jd) => {
        const dateString = jalaliToGregorianString(jy, jm, jd);
        if (!dateString) return false;
        if (isBeforeMinDate(dateString)) return false;
        if (isAfterMaxDate(dateString)) return false;
        return true;
    };

    /** رفتن به ماه قبل */
    const goPreviousMonth = () => {
        if (viewMonth === 1) {
            setViewMonth(12);
            setViewYear((year) => year - 1);
        } else {
            setViewMonth((month) => month - 1);
        }
    };

    /** رفتن به ماه بعد */
    const goNextMonth = () => {
        if (viewMonth === 12) {
            setViewMonth(1);
            setViewYear((year) => year + 1);
        } else {
            setViewMonth((month) => month + 1);
        }
    };

    /** نمایش انتخاب سال */
    const openYearPicker = () => {
        setYearRangeStart(viewYear - 5);
        setPickerMode("years");
    };

    /** انتخاب سال */
    const selectYear = (year) => {
        setViewYear(year);
        setPickerMode("calendar");
    };

    /** نمایش انتخاب ماه */
    const openMonthPicker = () => setPickerMode("months");

    /** انتخاب ماه */
    const selectMonth = (month) => {
        setViewMonth(month);
        setPickerMode("calendar");
    };

    /** حرکت بین بازه‌های ۱۲ ساله */
    const previousYearRange = () => setYearRangeStart((start) => start - 12);

    const nextYearRange = () => setYearRangeStart((start) => start + 12);

    /** رفتن به امروز */
    const goToday = () => {
        setViewYear(today.jy);
        setViewMonth(today.jm);
        setPickerMode("calendar");

        const todayString = jalaliToGregorianString(
            today.jy,
            today.jm,
            today.jd,
        );

        if (todayString && isSelectable(today.jy, today.jm, today.jd)) {
            onChange?.(todayString);
            setIsOpen(false);
        }
    };

    /** انتخاب تاریخ */
    const selectDate = (jy, jm, jd) => {
        if (!isSelectable(jy, jm, jd)) return;

        const dateString = jalaliToGregorianString(jy, jm, jd);
        if (!dateString) return;

        onChange?.(dateString);
        setIsOpen(false);
        setPickerMode("calendar");
    };

    /** پاک کردن تاریخ */
    const clearDate = (event) => {
        event.stopPropagation();
        onChange?.("");
        setIsOpen(false);
        setPickerMode("calendar");
    };

    /** ساخت روزهای ماه جاری */
    const calendarDays = useMemo(() => {
        const daysInMonth = jalaaliMonthLength(viewYear, viewMonth);
        const firstGregorian = toGregorian(viewYear, viewMonth, 1);
        const firstDate = new Date(
            firstGregorian.gy,
            firstGregorian.gm - 1,
            firstGregorian.gd,
        );

        // در تقویم شمسی، شنبه باید ستون اول باشد.
        const firstDayIndex = (firstDate.getDay() + 1) % 7;
        const days = [];

        for (let i = 0; i < firstDayIndex; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push({ jy: viewYear, jm: viewMonth, jd: day });
        }

        return days;
    }, [viewYear, viewMonth]);

    const displayValue = selectedJalali
        ? `${toPersianNumber(selectedJalali.jy)}/${toPersianNumber(
              pad(selectedJalali.jm),
          )}/${toPersianNumber(pad(selectedJalali.jd))}`
        : "";

    const toggleCalendar = () => {
        if (disabled) return;

        setIsOpen((open) => {
            const nextOpen = !open;
            if (nextOpen) setPickerMode("calendar");
            return nextOpen;
        });
    };

    return (
        <div
            ref={wrapperRef}
            className={`custom-persian-datepicker ${className}`}
            dir="rtl"
        >
            {label && (
                <label className="custom-persian-datepicker-label">
                    <CalendarDays size={16} />
                    {label}
                </label>
            )}

            <div className="custom-persian-datepicker-input-wrapper">
                <button
                    type="button"
                    className={`custom-persian-datepicker-input ${
                        isOpen ? "is-open" : ""
                    } ${disabled ? "is-disabled" : ""}`}
                    onClick={toggleCalendar}
                    disabled={disabled}
                >
                    <span
                        className={
                            displayValue
                                ? "datepicker-value"
                                : "datepicker-placeholder"
                        }
                    >
                        {displayValue || placeholder}
                    </span>

                    <span className="datepicker-input-icons">
                        {clearable && value && !disabled && (
                            <span
                                className="datepicker-clear"
                                onClick={clearDate}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                    ) {
                                        clearDate(event);
                                    }
                                }}
                            >
                                <X size={15} />
                            </span>
                        )}

                        <CalendarDays
                            size={18}
                            className="datepicker-calendar-icon"
                        />
                    </span>
                </button>
            </div>

            {isOpen && !disabled && (
                <div className="custom-persian-datepicker-popup">
                    {/* Header */}
                    <div className="datepicker-header">
                        {pickerMode === "calendar" && (
                            <>
                                <button
                                    type="button"
                                    className="datepicker-nav-button"
                                    onClick={goNextMonth}
                                    aria-label="ماه بعد"
                                >
                                    <ChevronRight size={19} />
                                </button>

                                <div className="datepicker-header-title">
                                    <button
                                        type="button"
                                        className="datepicker-month-title"
                                        onClick={openMonthPicker}
                                        aria-label="انتخاب ماه"
                                    >
                                        <span>{MONTHS[viewMonth - 1]}</span>
                                        <ChevronDown size={15} />
                                    </button>

                                    <button
                                        type="button"
                                        className="datepicker-year"
                                        onClick={openYearPicker}
                                        aria-label="انتخاب سال"
                                    >
                                        <span>{toPersianNumber(viewYear)}</span>
                                        <ChevronDown size={15} />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="datepicker-nav-button"
                                    onClick={goPreviousMonth}
                                    aria-label="ماه قبل"
                                >
                                    <ChevronLeft size={19} />
                                </button>
                            </>
                        )}

                        {pickerMode === "years" && (
                            <>
                                <button
                                    type="button"
                                    className="datepicker-nav-button"
                                    onClick={previousYearRange}
                                    aria-label="۱۲ سال قبل"
                                >
                                    <ChevronRight size={19} />
                                </button>

                                <button
                                    type="button"
                                    className="datepicker-month-title"
                                    onClick={() => setPickerMode("calendar")}
                                >
                                    انتخاب سال
                                </button>

                                <button
                                    type="button"
                                    className="datepicker-nav-button"
                                    onClick={nextYearRange}
                                    aria-label="۱۲ سال بعد"
                                >
                                    <ChevronLeft size={19} />
                                </button>
                            </>
                        )}

                        {pickerMode === "months" && (
                            <>
                                <span className="datepicker-header-spacer" />
                                <button
                                    type="button"
                                    className="datepicker-month-title"
                                    onClick={() => setPickerMode("calendar")}
                                >
                                    انتخاب ماه
                                </button>
                                <span className="datepicker-header-spacer" />
                            </>
                        )}
                    </div>

                    {/* انتخاب سال */}
                    {pickerMode === "years" && (
                        <div className="datepicker-year-grid">
                            {Array.from(
                                { length: 12 },
                                (_, index) => yearRangeStart + index,
                            ).map((year) => (
                                <button
                                    key={year}
                                    type="button"
                                    className={`datepicker-picker-item ${
                                        year === viewYear ? "active" : ""
                                    }`}
                                    onClick={() => selectYear(year)}
                                >
                                    {toPersianNumber(year)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* انتخاب ماه */}
                    {pickerMode === "months" && (
                        <div className="datepicker-month-grid">
                            {MONTHS.map((month, index) => (
                                <button
                                    key={month}
                                    type="button"
                                    className={`datepicker-picker-item ${
                                        index + 1 === viewMonth ? "active" : ""
                                    }`}
                                    onClick={() => selectMonth(index + 1)}
                                >
                                    {month}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* تقویم روزها */}
                    {pickerMode === "calendar" && (
                        <>
                            <div className="datepicker-weekdays">
                                {WEEK_DAYS.map((day, index) => (
                                    <div
                                        key={day}
                                        className="datepicker-weekday"
                                        title={day}
                                    >
                                        <span className="weekday-full">
                                            {day}
                                        </span>
                                        <span className="weekday-short">
                                            {WEEK_DAYS_SHORT[index]}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="datepicker-days">
                                {calendarDays.map((date, index) => {
                                    if (!date) {
                                        return (
                                            <div
                                                key={`empty-${index}`}
                                                className="datepicker-day empty"
                                            />
                                        );
                                    }

                                    const { jy, jm, jd } = date;
                                    const dateString = jalaliToGregorianString(
                                        jy,
                                        jm,
                                        jd,
                                    );

                                    const isSelected =
                                        selectedJalali &&
                                        selectedJalali.jy === jy &&
                                        selectedJalali.jm === jm &&
                                        selectedJalali.jd === jd;

                                    const isToday =
                                        today.jy === jy &&
                                        today.jm === jm &&
                                        today.jd === jd;

                                    const selectable = isSelectable(jy, jm, jd);

                                    return (
                                        <button
                                            type="button"
                                            key={dateString}
                                            className={[
                                                "datepicker-day",
                                                isSelected ? "selected" : "",
                                                isToday ? "today" : "",
                                                !selectable ? "disabled" : "",
                                            ]
                                                .filter(Boolean)
                                                .join(" ")}
                                            onClick={() =>
                                                selectDate(jy, jm, jd)
                                            }
                                            disabled={!selectable}
                                        >
                                            <span>{toPersianNumber(jd)}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="datepicker-footer">
                                <button
                                    type="button"
                                    className="datepicker-today-button"
                                    onClick={goToday}
                                >
                                    <CalendarDays size={15} />
                                    امروز
                                </button>

                                {value && clearable && (
                                    <button
                                        type="button"
                                        className="datepicker-clear-button"
                                        onClick={() => {
                                            onChange?.("");
                                            setIsOpen(false);
                                            setPickerMode("calendar");
                                        }}
                                    >
                                        پاک کردن
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
