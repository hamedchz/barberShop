import React from "react";
import {
    Clock4,
    Search,
    MessageSquare,
    CheckCircle,
    XCircle,
    Ban,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

const statusConfig = {
    pending: {
        label: "اعتراض در بررسی",
        icon: Clock4,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
    },
    investigating: {
        label: "اعتراض در بررسی",
        icon: Search,
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#dbeafe",
    },
    awaiting_response: {
        label: "در انتظار پاسخ",
        icon: MessageSquare,
        color: "#9a3412",
        bg: "#fff7ed",
        border: "#ffedd5",
    },
    resolved: {
        label: "اعتراض تایید شد",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#d1fae5",
    },
    rejected: {
        label: "اعتراض رد شد",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fee2e2",
    },
    cancelled: {
        label: "اعتراض لغو شد",
        icon: Ban,
        color: "#6b7280",
        bg: "#f3f4f6",
        border: "#e5e7eb",
    },
};

export default function DisputeBadge({
    status,
    count = 1,
    position = "inline", // inline | block
    size = "default", // small | default | large
}) {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <div
            className={`booking-dispute-badge status-${status} ${size} ${position}`}
            style={{
                backgroundColor: config.bg,
                color: config.color,
                borderColor: config.border,
            }}
        >
            <Icon size={size === "small" ? 10 : 12} />
            <span>{config.label}</span>
            {count > 1 && (
                <span className="dispute-count">{toPersianNumber(count)}</span>
            )}
        </div>
    );
}
