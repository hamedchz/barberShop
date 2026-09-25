import React, { useState, useMemo } from "react";
import { toJalaali, toGregorian } from "jalaali-js";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
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

    // ============ محاسبه روزهای ماه ============
    const daysInMonth = useMemo(() => {
        return toJalaali(currentYear, currentMonth, 1).jy
            ? jalaaliMonthLength(currentYear, currentMonth)
            : 30;
    }, [currentYear, currentMonth]);

    // روز اول ماه (چه روزی از هفته)
    const firstDayOfMonth = useMemo(() => {
        const gregorian = toGregorian(currentYear, currentMonth, 1);
        const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
        // تبدیل به شنبه = 0
        return (date.getDay() + 1) % 7;
    }, [currentYear, currentMonth]);

    // ============ ناوبری ============
    const goToPrevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    // ============ بررسی انتخاب ============
    const isSelected = (day) => {
        if (!selectedDate) return false;
        const sel = toJalaali(
            new Date(selectedDate).getFullYear(),
            new Date(selectedDate).getMonth() + 1,
            new Date(selectedDate).getDate(),
        );
        return (
            sel.jy === currentYear && sel.jm === currentMonth && sel.jd === day
        );
    };

    const isToday = (day) => {
        return (
            todayJalali.jy === currentYear &&
            todayJalali.jm === currentMonth &&
            todayJalali.jd === day
        );
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
                    <div key={index} className="calendar-weekday">
                        {day}
                    </div>
                ))}
            </div>

            {/* روزهای ماه */}
            <div className="calendar-days">
                {days.map((day, index) => (
                    <div key={index} className="calendar-day-wrapper">
                        {day ? (
                            <button
                                className={`calendar-day ${
                                    isSelected(day) ? "selected" : ""
                                } ${isToday(day) ? "today" : ""}`}
                                onClick={() => handleSelectDay(day)}
                            >
                                {toPersianNumber(day)}
                            </button>
                        ) : (
                            <div className="calendar-day empty"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============ تابع کمکی برای تعداد روزهای ماه ============
function jalaaliMonthLength(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    // اسفند
    const isLeap = isJalaaliLeapYear(jy);
    return isLeap ? 30 : 29;
}

function isJalaaliLeapYear(jy) {
    return ((jy + 12) % 33) % 4 === 1;
}
