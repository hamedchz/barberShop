import React from "react";
import { toJalaali } from "jalaali-js";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { CheckCircle } from "lucide-react";
import "../Assets/HorizentalCalendar.css";
import Tooltip from "../Components/Tooltip";

const persianDaysShort = ["ی", "د", "س", "چ", "پ", "ج", "ش"];

const persianMonths = [
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

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export default function HorizontalCalendar({
    selectedDate,
    onSelectDate,
    slotsByDate = {},
    holidays = {},
    daysToShow = 14,
}) {
    const today = new Date();

    const days = [];

    for (let i = 0; i < daysToShow; i++) {
        const date = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + i,
        );

        const dateStr = formatDate(date);

        const j = toJalaali(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
        );

        const slots = slotsByDate[dateStr] || [];
        const hasSlots = slots.length > 0;

        // جمعه
        const isFriday = date.getDay() === 5;

        // تعطیلات رسمی دریافتی از بک‌اند
        const holidayItems = holidays[dateStr] || [];
        const isOfficialHoliday = holidayItems.length > 0;

        const holidayTitles = holidayItems
            .map((item) => item.title)
            .filter(Boolean);

        days.push({
            date,
            dateStr,
            jalali: j,
            dayName: persianDaysShort[date.getDay()],
            dayNumber: j.jd,
            monthName: persianMonths[j.jm - 1],
            hasSlots,
            slotsCount: slots.length,
            isToday: i === 0,
            isFriday,
            isOfficialHoliday,
            holidayTitles,
            isHoliday: isFriday || isOfficialHoliday,
        });
    }

    // مقایسه تاریخ‌ها بدون مشکل اختلاف ساعت UTC
    const selectedDateStr = selectedDate
        ? typeof selectedDate === "string"
            ? selectedDate.substring(0, 10)
            : formatDate(selectedDate)
        : null;

    const isSelected = (day) => {
        return selectedDateStr === day.dateStr;
    };

    const getTooltipContent = (day) => {
        const messages = [];

        if (day.isFriday) {
            messages.push("جمعه");
        }

        if (day.isOfficialHoliday) {
            messages.push(...day.holidayTitles);
        }

        if (day.hasSlots) {
            messages.push(`${toPersianNumber(day.slotsCount)} نوبت موجود است`);
        } else {
            messages.push("نوبتی برای این روز موجود نیست");
        }

        return messages.join(" - ");
    };

    return (
        <div className="horizontal-calendar">
            <div className="horizontal-calendar-scroll">
                {days.map((day) => {
                    const selected = isSelected(day);

                    return (
                        <Tooltip
                            key={day.dateStr}
                            content={getTooltipContent(day)}
                            position="bottom"
                            delay={200}
                        >
                            <button
                                type="button"
                                className={[
                                    "calendar-day-btn",
                                    selected ? "selected" : "",
                                    day.isToday ? "today" : "",
                                    !day.hasSlots ? "no-slots" : "",
                                    day.isFriday ? "friday" : "",
                                    day.isOfficialHoliday
                                        ? "official-holiday"
                                        : "",
                                    day.isHoliday ? "holiday" : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                onClick={() => {
                                    if (day.hasSlots) {
                                        onSelectDate(day.date);
                                    }
                                }}
                                disabled={!day.hasSlots}
                                aria-label={`${day.dayNumber} ${day.monthName}`}
                            >
                                <span className="calendar-day-name">
                                    {day.dayName}
                                </span>

                                <span className="calendar-day-number">
                                    {toPersianNumber(day.dayNumber)}
                                </span>

                                <span className="calendar-day-month">
                                    {day.monthName}
                                </span>

                                {day.hasSlots && (
                                    <span className="calendar-day-dot" />
                                )}

                                {day.isHoliday && (
                                    <span className="calendar-day-holiday-label">
                                        {day.isOfficialHoliday
                                            ? "تعطیل رسمی"
                                            : "جمعه"}
                                    </span>
                                )}

                                {!day.hasSlots && !day.isHoliday && (
                                    <span className="calendar-day-empty-label">
                                        بدون نوبت
                                    </span>
                                )}

                                {selected && (
                                    <span className="calendar-day-selected-icon">
                                        <CheckCircle size={13} />
                                    </span>
                                )}
                            </button>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
}
