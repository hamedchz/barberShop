import React, { useState, useMemo, useEffect } from "react";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import "../Assets/css/JalaliCalendar.css";

import { toJalaali, toGregorian, jalaaliMonthLength } from "jalaali-js";

const monthNames = [
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

const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

/**
 * تبدیل تاریخ ورودی به Date محلی
 * جلوگیری از اختلاف تاریخ در رشته‌های YYYY-MM-DD
 */
const parseLocalDate = (value) => {
    if (!value) return null;

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === "string") {
        const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

        if (dateOnlyMatch) {
            const [, year, month, day] = dateOnlyMatch;

            return new Date(Number(year), Number(month) - 1, Number(day), 12);
        }
    }

    const parsedDate = new Date(value);

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export default function JalaliCalendar({ selectedDate, onSelectDate }) {
    // ============ تاریخ امروز ============
    const today = new Date();

    const todayJalali = toJalaali(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate(),
    );

    // ============ وضعیت تقویم ============
    const [currentYear, setCurrentYear] = useState(todayJalali.jy);
    const [currentMonth, setCurrentMonth] = useState(todayJalali.jm);

    // ============ تعطیلات رسمی ============
    const [holidays, setHolidays] = useState({});
    const [holidaysLoading, setHolidaysLoading] = useState(false);

    // ============ دریافت تعطیلات رسمی سال ============
    useEffect(() => {
        const controller = new AbortController();

        const fetchHolidays = async () => {
            setHolidaysLoading(true);
            setHolidays({});

            try {
                const response = await fetch(
                    route("barber.calendar.holidays", {
                        year: currentYear,
                    }),
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                        },
                        credentials: "same-origin",
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error("دریافت تعطیلات با خطا مواجه شد.");
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(
                        data.message || "دریافت تعطیلات ناموفق بود.",
                    );
                }

                // خروجی Laravel یک آبجکت با کلید تاریخ است، نه آرایه
                const holidayData = data.holidays;

                if (
                    holidayData &&
                    typeof holidayData === "object" &&
                    !Array.isArray(holidayData)
                ) {
                    setHolidays(holidayData);
                } else {
                    setHolidays({});
                }
            } catch (error) {
                // درخواست لغوشده خطای واقعی محسوب نمی‌شود
                if (error.name !== "AbortError") {
                    console.error("Calendar holidays error:", error);
                    setHolidays({});
                }
            } finally {
                if (!controller.signal.aborted) {
                    setHolidaysLoading(false);
                }
            }
        };

        fetchHolidays();

        return () => {
            controller.abort();
        };
    }, [currentYear]);

    // ============ نقشه تعطیلات ============
    // ساختار holidays از Laravel از قبل بر اساس تاریخ دسته‌بندی شده است.
    const holidayMap = useMemo(() => {
        return holidays || {};
    }, [holidays]);

    // ============ تعداد روزهای ماه ============
    const daysInMonth = useMemo(() => {
        return jalaaliMonthLength(currentYear, currentMonth);
    }, [currentYear, currentMonth]);

    // ============ روز اول ماه ============
    const firstDayOfMonth = useMemo(() => {
        const gregorian = toGregorian(currentYear, currentMonth, 1);

        const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd, 12);

        // شنبه = 0، یکشنبه = 1، ... جمعه = 6
        return (date.getDay() + 1) % 7;
    }, [currentYear, currentMonth]);

    // ============ ناوبری ماه قبل ============
    const goToPrevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear((prev) => prev - 1);
        } else {
            setCurrentMonth((prev) => prev - 1);
        }
    };

    // ============ ناوبری ماه بعد ============
    const goToNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear((prev) => prev + 1);
        } else {
            setCurrentMonth((prev) => prev + 1);
        }
    };

    // ============ بررسی انتخاب روز ============
    const isSelected = (day) => {
        const selected = parseLocalDate(selectedDate);

        if (!selected) return false;

        const selectedJalali = toJalaali(
            selected.getFullYear(),
            selected.getMonth() + 1,
            selected.getDate(),
        );

        return (
            selectedJalali.jy === currentYear &&
            selectedJalali.jm === currentMonth &&
            selectedJalali.jd === day
        );
    };

    // ============ بررسی امروز ============
    const isToday = (day) => {
        return (
            todayJalali.jy === currentYear &&
            todayJalali.jm === currentMonth &&
            todayJalali.jd === day
        );
    };

    // ============ اطلاعات تعطیلی روز ============
    const getDayInfo = (day) => {
        const gregorian = toGregorian(currentYear, currentMonth, day);

        const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd, 12);

        const dateKey = [
            currentYear,
            String(currentMonth).padStart(2, "0"),
            String(day).padStart(2, "0"),
        ].join("-");

        // جمعه در JavaScript برابر 5 است
        const isFriday = date.getDay() === 5;

        // تعطیلات رسمی هر روز از آبجکت Laravel دریافت می‌شود
        const holidayItems = Array.isArray(holidayMap[dateKey])
            ? holidayMap[dateKey]
            : [];

        return {
            dateKey,
            isFriday,
            holidayItems,
            isOfficialHoliday: holidayItems.length > 0,
        };
    };

    // ============ انتخاب روز ============
    const handleSelectDay = (day) => {
        if (typeof onSelectDate !== "function") return;

        const gregorian = toGregorian(currentYear, currentMonth, day);

        // ساعت ظهر برای جلوگیری از مشکلات اختلاف ساعت
        const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd, 12);

        onSelectDate(date);
    };

    // ============ ساخت آرایه روزهای ماه ============
    const days = [];

    // خانه‌های خالی قبل از روز اول ماه
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }

    // روزهای ماه
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    return (
        <div className="jalali-calendar">
            {/* هدر */}
            <div className="calendar-header">
                <button
                    type="button"
                    className="calendar-nav-btn"
                    onClick={goToPrevMonth}
                    title="ماه قبل"
                    aria-label="ماه قبل"
                >
                    <ChevronRight size={18} />
                </button>

                <div className="calendar-title">
                    <span className="calendar-month">
                        {monthNames[currentMonth - 1]}
                    </span>

                    <span className="calendar-year">
                        {toPersianNumber(currentYear)}
                    </span>
                </div>

                <button
                    type="button"
                    className="calendar-nav-btn"
                    onClick={goToNextMonth}
                    title="ماه بعد"
                    aria-label="ماه بعد"
                >
                    <ChevronLeft size={18} />
                </button>
            </div>

            {/* روزهای هفته */}
            <div className="calendar-weekdays">
                {weekDays.map((day, index) => (
                    <div
                        key={index}
                        className={`calendar-weekday ${
                            index === 6 ? "friday-weekday" : ""
                        }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* روزهای ماه */}
            <div className="calendar-days">
                {days.map((day, index) => {
                    if (!day) {
                        return (
                            <div
                                key={`empty-${index}`}
                                className="calendar-day empty"
                            />
                        );
                    }

                    const {
                        dateKey,
                        isFriday,
                        holidayItems,
                        isOfficialHoliday,
                    } = getDayInfo(day);

                    const holidayTitle = holidayItems
                        .map((item) => item.title)
                        .filter(Boolean)
                        .join("، ");

                    // تعطیل رسمی نسبت به جمعه اولویت دارد
                    const title = isOfficialHoliday
                        ? holidayTitle || "تعطیل رسمی"
                        : isFriday
                          ? "جمعه"
                          : "";

                    const dayClasses = [
                        "calendar-day",
                        isSelected(day) ? "selected" : "",
                        isToday(day) ? "today" : "",
                        isFriday ? "friday" : "",
                        isOfficialHoliday ? "official-holiday" : "",
                    ]
                        .filter(Boolean)
                        .join(" ");

                    return (
                        <div key={dateKey} className="calendar-day-wrapper">
                            <button
                                type="button"
                                className={dayClasses}
                                onClick={() => handleSelectDay(day)}
                                title={title}
                                aria-label={`${toPersianNumber(day)}${
                                    title ? ` - ${title}` : ""
                                }`}
                            >
                                {toPersianNumber(day)}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* راهنمای تعطیلات */}
            <div className="calendar-legend">
                <div className="calendar-legend-item">
                    <span className="calendar-legend-dot official" />
                    <span>تعطیل رسمی</span>
                </div>

                <div className="calendar-legend-item">
                    <span className="calendar-legend-dot friday" />
                    <span>جمعه</span>
                </div>

                {holidaysLoading && (
                    <span className="calendar-holiday-loading">
                        دریافت تعطیلات...
                    </span>
                )}
            </div>
        </div>
    );
}
