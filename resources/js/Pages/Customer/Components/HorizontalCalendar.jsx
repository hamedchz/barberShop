import React from "react";
import { toJalaali } from "jalaali-js";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { CheckCircle } from "lucide-react";
import "../Assets/HorizentalCalendar.css";
import Tooltip from "../Components/Tooltip";

const persianDaysShort = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
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

export default function HorizontalCalendar({
    selectedDate,
    onSelectDate,
    slotsByDate = {},
    daysToShow = 14,
}) {
    const today = new Date();

    const days = [];
    for (let i = 0; i < daysToShow; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const j = toJalaali(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
        );

        const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1,
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        const hasSlots = slotsByDate[dateStr]?.length > 0;

        days.push({
            date,
            dateStr,
            jalali: j,
            dayName: persianDaysShort[date.getDay()],
            dayNumber: j.jd,
            monthName: persianMonths[j.jm - 1],
            hasSlots,
            isToday: i === 0,
        });
    }

    const isSelected = (day) => {
        if (!selectedDate) return false;
        const sel = new Date(selectedDate);
        const selStr = `${sel.getFullYear()}-${String(
            sel.getMonth() + 1,
        ).padStart(2, "0")}-${String(sel.getDate()).padStart(2, "0")}`;
        return selStr === day.dateStr;
    };

    return (
        <div className="horizontal-calendar">
            <div className="horizontal-calendar-scroll">
                {days.map((day) => {
                    // ============ محتوای Tooltip ============
                    const tooltipContent = day.hasSlots
                        ? `${toPersianNumber(
                              day.slotsCount,
                          )} نوبت در این روز موجود است`
                        : "برای این روز نوبتی موجود نیست";

                    return (
                        <Tooltip
                            key={day.dateStr}
                            content={tooltipContent}
                            position="bottom"
                            delay={200}
                        >
                            <button
                                type="button"
                                className={`calendar-day-btn ${
                                    isSelected(day) ? "selected" : ""
                                } ${day.isToday ? "today" : ""} ${
                                    !day.hasSlots ? "no-slots" : ""
                                }`}
                                onClick={() =>
                                    day.hasSlots && onSelectDate(day.date)
                                }
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
                                    <span className="calendar-day-dot"></span>
                                )}

                                {!day.hasSlots && (
                                    <span className="calendar-day-empty-label">
                                        تعطیل
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
