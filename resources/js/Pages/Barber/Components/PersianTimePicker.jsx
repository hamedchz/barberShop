import React, { useState } from "react";
import { TimePicker } from "react-persian-range-picker";
import { Clock, ChevronDown } from "lucide-react";

export default function PersianTimePicker({
    value,
    onChange,
    placeholder = "انتخاب ساعت",
    primaryColor = "#10b981",
    highlightColor = "#ecfdf5",
}) {
    return (
        <div className="persian-time-wrapper">
            <TimePicker
                value={value}
                onChange={onChange}
                primaryColor={primaryColor}
                highlightColor={highlightColor}
                placeholder={placeholder}
            />
        </div>
    );
}
