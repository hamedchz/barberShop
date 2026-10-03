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

const toPersianNumber = (value) => {
    return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[digit]);
};

const pad = (value) => String(value).padStart(2, "0");

/**
 * YYYY-MM-DD میلادی
 */
const parseGregorianValue = (value) => {
    if (!value || typeof value !== "string") {
        return null;
    }

    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) {
        return null;
    }

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

    return {
        gy,
        gm,
        gd,
    };
};

/**
 * تبدیل تاریخ میلادی YYYY-MM-DD
 * به تاریخ شمسی
 */
const gregorianToJalali = (value) => {
    const parsed = parseGregorianValue(value);

    if (!parsed) {
        return null;
    }

    const { gy, gm, gd } = parsed;

    try {
        return toJalaali(gy, gm, gd);
    } catch {
        return null;
    }
};

/**
 * تبدیل تاریخ شمسی به YYYY-MM-DD میلادی
 */
const jalaliToGregorianString = (jy, jm, jd) => {
    if (!isValidJalaaliDate(jy, jm, jd)) {
        return "";
    }

    const gregorian = toGregorian(jy, jm, jd);

    return `${gregorian.gy}-${pad(gregorian.gm)}-${pad(gregorian.gd)}`;
};

/**
 * تاریخ امروز سیستم
 */
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

    const selectedJalali = useMemo(() => {
        return gregorianToJalali(value);
    }, [value]);

    const initialDate = selectedJalali || today;

    const [isOpen, setIsOpen] = useState(false);

    const [viewYear, setViewYear] = useState(initialDate.jy);
    const [viewMonth, setViewMonth] = useState(initialDate.jm);

    /**
     * هر وقت value از بیرون تغییر کرد،
     * تقویم هم روی همان ماه قرار می‌گیرد.
     */
    useEffect(() => {
        if (selectedJalali) {
            setViewYear(selectedJalali.jy);
            setViewMonth(selectedJalali.jm);
        }
    }, [selectedJalali]);

    /**
     * بستن با کلیک بیرون
     */
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        }

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isOpen]);

    /**
     * بستن با Escape
     */
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    /**
     * بررسی محدودیت حداقل تاریخ
     */
    const isBeforeMinDate = (dateString) => {
        if (!minDate) {
            return false;
        }

        return dateString < minDate;
    };

    /**
     * بررسی محدودیت حداکثر تاریخ
     */
    const isAfterMaxDate = (dateString) => {
        if (!maxDate) {
            return false;
        }

        return dateString > maxDate;
    };

    /**
     * آیا تاریخ قابل انتخاب است؟
     */
    const isSelectable = (jy, jm, jd) => {
        const dateString = jalaliToGregorianString(jy, jm, jd);

        if (!dateString) {
            return false;
        }

        if (isBeforeMinDate(dateString)) {
            return false;
        }

        if (isAfterMaxDate(dateString)) {
            return false;
        }

        return true;
    };

    /**
     * رفتن به ماه قبل
     */
    const goPreviousMonth = () => {
        if (viewMonth === 1) {
            setViewMonth(12);
            setViewYear((year) => year - 1);
        } else {
            setViewMonth((month) => month - 1);
        }
    };

    /**
     * رفتن به ماه بعد
     */
    const goNextMonth = () => {
        if (viewMonth === 12) {
            setViewMonth(1);
            setViewYear((year) => year + 1);
        } else {
            setViewMonth((month) => month + 1);
        }
    };

    /**
     * رفتن به امروز
     */
    const goToday = () => {
        setViewYear(today.jy);
        setViewMonth(today.jm);

        const todayString = jalaliToGregorianString(
            today.jy,
            today.jm,
            today.jd,
        );

        if (todayString && isSelectable(today.jy, today.jm, today.jd)) {
            onChange?.(todayString);
        }
    };

    /**
     * انتخاب تاریخ
     */
    const selectDate = (jy, jm, jd) => {
        if (!isSelectable(jy, jm, jd)) {
            return;
        }

        const dateString = jalaliToGregorianString(jy, jm, jd);

        onChange?.(dateString);

        setIsOpen(false);
    };

    /**
     * پاک کردن
     */
    const clearDate = (event) => {
        event.stopPropagation();

        onChange?.("");
        setIsOpen(false);
    };

    /**
     * ساخت روزهای ماه
     *
     * jalaali-js برای تبدیل تاریخ استفاده می‌شود.
     * بنابراین محاسبه روز هفته بر اساس Date و timezone
     * انجام نمی‌شود.
     */
    const calendarDays = useMemo(() => {
        const daysInMonth = jalaaliMonthLength(viewYear, viewMonth);

        const firstGregorian = toGregorian(viewYear, viewMonth, 1);

        const firstDate = new Date(
            firstGregorian.gy,
            firstGregorian.gm - 1,
            firstGregorian.gd,
        );

        /**
         * JavaScript:
         *
         * Sunday = 0
         * Monday = 1
         * ...
         * Saturday = 6
         *
         * تقویم فارسی:
         *
         * Saturday = 0
         * Sunday = 1
         * ...
         * Friday = 6
         *
         * پس:
         * (getDay() + 1) % 7
         */
        const firstDayIndex = (firstDate.getDay() + 1) % 7;

        const days = [];

        for (let i = 0; i < firstDayIndex; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push({
                jy: viewYear,
                jm: viewMonth,
                jd: day,
            });
        }

        return days;
    }, [viewYear, viewMonth]);

    /**
     * متن input
     */
    const displayValue = selectedJalali
        ? `${toPersianNumber(selectedJalali.jy)}/${toPersianNumber(
              pad(selectedJalali.jm),
          )}/${toPersianNumber(pad(selectedJalali.jd))}`
        : "";

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
                    onClick={() => {
                        if (!disabled) {
                            setIsOpen((open) => !open);
                        }
                    }}
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
                        <button
                            type="button"
                            className="datepicker-nav-button"
                            onClick={goNextMonth}
                            aria-label="ماه بعد"
                        >
                            <ChevronRight size={19} />
                        </button>

                        <button
                            type="button"
                            className="datepicker-month-title"
                        >
                            <span>{MONTHS[viewMonth - 1]}</span>

                            <span className="datepicker-year">
                                {toPersianNumber(viewYear)}
                            </span>

                            <ChevronDown size={15} />
                        </button>

                        <button
                            type="button"
                            className="datepicker-nav-button"
                            onClick={goPreviousMonth}
                            aria-label="ماه قبل"
                        >
                            <ChevronLeft size={19} />
                        </button>
                    </div>

                    {/* Week days */}
                    <div className="datepicker-weekdays">
                        {WEEK_DAYS.map((day, index) => (
                            <div
                                key={day}
                                className="datepicker-weekday"
                                title={day}
                            >
                                <span className="weekday-full">{day}</span>

                                <span className="weekday-short">
                                    {WEEK_DAYS_SHORT[index]}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Days */}
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
                                    onClick={() => selectDate(jy, jm, jd)}
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

                        {value && (
                            <button
                                type="button"
                                className="datepicker-clear-button"
                                onClick={() => {
                                    onChange?.("");
                                    setIsOpen(false);
                                }}
                            >
                                پاک کردن
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
