import React, { useState, useMemo, useEffect } from "react";
import { toJalaali, toGregorian } from "jalaali-js";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import "../Assets/css/JalaliCalendar.css";

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

export default function JalaliCalendar({ selectedDate, onSelectDate }) {
    const today = new Date();

    const todayJalali = toJalaali(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate(),
    );

    const [currentYear, setCurrentYear] = useState(todayJalali.jy);
    const [currentMonth, setCurrentMonth] = useState(todayJalali.jm);

    // تعطیلات رسمی سال جاری تقویم
    const [holidays, setHolidays] = useState([]);

    const [holidaysLoading, setHolidaysLoading] = useState(false);

    // ============ دریافت تعطیلات رسمی سال ============
    useEffect(() => {
        let isMounted = true;

        const fetchHolidays = async () => {
            setHolidaysLoading(true);

            try {
                const response = await fetch(
                    `https://raw.githubusercontent.com/MiladJoodi/FarsiUI/main/calendar/years/${currentYear}/holidays.json`,
                );

                if (!response.ok) {
                    throw new Error("دریافت تعطیلات با خطا مواجه شد.");
                }

                const data = await response.json();

                const holidayItems = (data.items || []).filter(
                    (item) => item.isHoliday,
                );

                if (isMounted) {
                    setHolidays(holidayItems);
                }
            } catch (error) {
                console.error("Holiday calendar error:", error);

                if (isMounted) {
                    setHolidays([]);
                }
            } finally {
                if (isMounted) {
                    setHolidaysLoading(false);
                }
            }
        };

        fetchHolidays();

        return () => {
            isMounted = false;
        };
    }, [currentYear]);

    // ============ ساخت نقشه تعطیلات ============
    const holidayMap = useMemo(() => {
        const map = {};

        holidays.forEach((holiday) => {
            map[holiday.date] = holiday;
        });

        return map;
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

    // ============ ناوبری ============
    const goToPrevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear((prev) => prev - 1);
        } else {
            setCurrentMonth((prev) => prev - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear((prev) => prev + 1);
        } else {
            setCurrentMonth((prev) => prev + 1);
        }
    };

    // ============ بررسی انتخاب ============
    const isSelected = (day) => {
        if (!selectedDate) return false;

        const selected = new Date(selectedDate);

        const sel = toJalaali(
            selected.getFullYear(),
            selected.getMonth() + 1,
            selected.getDate(),
        );

        return (
            sel.jy === currentYear && sel.jm === currentMonth && sel.jd === day
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

        const isFriday = date.getDay() === 5;
        const holiday = holidayMap[dateKey];

        return {
            isFriday,
            holiday,
            dateKey,
        };
    };

    // ============ انتخاب روز ============
    const handleSelectDay = (day) => {
        const gregorian = toGregorian(currentYear, currentMonth, day);

        const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);

        onSelectDate(date);
    };

    // ============ ساخت آرایه روزها ============
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        days.push(d);
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
                            <div key={index} className="calendar-day empty" />
                        );
                    }

                    const { isFriday, holiday, dateKey } = getDayInfo(day);

                    const isOfficialHoliday = Boolean(holiday);

                    const dayClasses = [
                        "calendar-day",
                        isSelected(day) ? "selected" : "",
                        isToday(day) ? "today" : "",
                        isFriday ? "friday" : "",
                        isOfficialHoliday ? "official-holiday" : "",
                    ]
                        .filter(Boolean)
                        .join(" ");

                    const title = isOfficialHoliday
                        ? holiday.title?.fa || "تعطیل رسمی"
                        : isFriday
                          ? "جمعه"
                          : "";

                    return (
                        <div key={dateKey} className="calendar-day-wrapper">
                            <button
                                type="button"
                                className={dayClasses}
                                onClick={() => handleSelectDay(day)}
                                title={title}
                                aria-label={`${day}${
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

// ============ تعداد روزهای ماه ============
function jalaaliMonthLength(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;

    return isJalaaliLeapYear(jy) ? 30 : 29;
}

function isJalaaliLeapYear(jy) {
    return ((jy + 12) % 33) % 4 === 1;
}
