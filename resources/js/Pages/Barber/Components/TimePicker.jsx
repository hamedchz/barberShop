import React from "react";
import { Clock } from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import "../Assets/css/TimePicker.css";

export default function TimePicker({
    label,
    value = "09:00",
    onChange,
    minuteStep = 15,
    disabled = false,
    vertical = false,
}) {
    const [hours, minutes] = value.split(":");

    const hourOptions = Array.from({ length: 24 }, (_, i) =>
        String(i).padStart(2, "0"),
    );

    const minuteOptions = [];

    for (let i = 0; i < 60; i += minuteStep) {
        minuteOptions.push(String(i).padStart(2, "0"));
    }

    if (!minuteOptions.includes(minutes)) {
        minuteOptions.push(minutes);
        minuteOptions.sort();
    }

    const handleHourChange = (e) => {
        onChange(`${e.target.value}:${minutes}`);
    };

    const handleMinuteChange = (e) => {
        onChange(`${hours}:${e.target.value}`);
    };

    return (
        <div
            className={`time-picker ${vertical ? "time-picker-vertical" : ""}`}
        >
            {label && (
                <label className="time-picker-label">
                    <Clock size={14} />
                    {label}
                </label>
            )}

            <div className="time-picker-inputs">
                {vertical && (
                    <label className="time-picker-field-label">ساعت</label>
                )}
                <select
                    className="time-picker-select"
                    value={hours}
                    onChange={handleHourChange}
                    disabled={disabled}
                    aria-label="ساعت"
                >
                    {hourOptions.map((h) => (
                        <option key={h} value={h}>
                            {toPersianNumber(h)}
                        </option>
                    ))}
                </select>

                <span className="time-picker-separator">:</span>
                {vertical && (
                    <label className="time-picker-field-label">دقیقه</label>
                )}
                <select
                    className="time-picker-select"
                    value={minutes}
                    onChange={handleMinuteChange}
                    disabled={disabled}
                    aria-label="دقیقه"
                >
                    {minuteOptions.map((m) => (
                        <option key={m} value={m}>
                            {toPersianNumber(m)}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
