import {
    XCircle,
    Clock4,
    Star,
    UserX,
    MessageSquare,
    MoreHorizontal,
    HeartCrack,
    CheckCircle,
    Search,
    Ban,
} from "lucide-react";

// ============================================
// انواع اعتراض
// ============================================
export const disputeTypes = {
    // ============================================
    // انواع اعتراض مشتری
    // ============================================
    not_done: {
        label: "خدمت انجام نشد",
        icon: XCircle,
        color: "red",
        for: "customer",
    },
    incomplete: {
        label: "خدمت ناقص بود",
        icon: Clock4,
        color: "orange",
        for: "customer",
    },
    poor_quality: {
        label: "کیفیت پایین بود",
        icon: Star,
        color: "yellow",
        for: "customer",
    },
    barber_bad_behavior: {
        label: "رفتار نامناسب آرایشگر",
        icon: UserX,
        color: "red",
        for: "customer",
    },

    // ============================================
    // انواع اعتراض آرایشگر
    // ============================================
    customer_not_present: {
        label: "مشتری حاضر نشد",
        icon: UserX,
        color: "orange",
        for: "barber",
    },
    customer_rude: {
        label: "مشتری توهین کرد",
        icon: MessageSquare,
        color: "red",
        for: "barber",
    },
    false_review: {
        label: "نظر نادرست",
        icon: Star,
        color: "yellow",
        for: "barber",
    },
    customer_left_early: {
        label: "مشتری زودتر رفت",
        icon: Clock4,
        color: "orange",
        for: "barber",
    },
    customer_damaged: {
        label: "خسارت توسط مشتری",
        icon: HeartCrack,
        color: "red",
        for: "barber",
    },

    // ============================================
    // مشترک
    // ============================================
    other: {
        label: "سایر",
        icon: MoreHorizontal,
        color: "gray",
        for: "both",
    },
};

// ============================================
// وضعیت‌های اعتراض
// ============================================
// توجه: colorName برای سازگاری با کدهای قبلی که از color استفاده می‌کردند نگه داشته شده.
// فیلدهای color/bg/border/accent کدهای hex هستند و در کارت‌ها استفاده می‌شوند.
// ============================================
export const disputeStatuses = {
    pending: {
        label: "در انتظار بررسی",
        icon: Clock4,
        colorName: "yellow",
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
        accent: "#f59e0b",
    },
    investigating: {
        label: "در حال بررسی",
        icon: Search,
        colorName: "blue",
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#dbeafe",
        accent: "#3b82f6",
    },
    awaiting_response: {
        label: "در انتظار پاسخ",
        icon: MessageSquare,
        colorName: "orange",
        color: "#9a3412",
        bg: "#fff7ed",
        border: "#ffedd5",
        accent: "#f97316",
    },
    resolved: {
        label: "تایید شده",
        icon: CheckCircle,
        colorName: "green",
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#d1fae5",
        accent: "#10b981",
    },
    rejected: {
        label: "رد شده",
        icon: XCircle,
        colorName: "red",
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fee2e2",
        accent: "#ef4444",
    },
    cancelled: {
        label: "لغو شده",
        icon: Ban,
        colorName: "gray",
        color: "#4b5563",
        bg: "#f9fafb",
        border: "#e5e7eb",
        accent: "#9ca3af",
    },
};

// ============================================
// پالت رنگ (برای استفاده در کامپوننت‌ها)
// ============================================
export const disputeColorPalette = {
    yellow: {
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
        accent: "#f59e0b",
    },
    blue: {
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#dbeafe",
        accent: "#3b82f6",
    },
    orange: {
        color: "#9a3412",
        bg: "#fff7ed",
        border: "#ffedd5",
        accent: "#f97316",
    },
    green: {
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#d1fae5",
        accent: "#10b981",
    },
    red: {
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fee2e2",
        accent: "#ef4444",
    },
    gray: {
        color: "#4b5563",
        bg: "#f9fafb",
        border: "#e5e7eb",
        accent: "#9ca3af",
    },
};

// ============================================
// توابع کمکی
// ============================================

/**
 * دریافت تنظیمات یک نوع اعتراض
 */
export const getDisputeTypeConfig = (type) => {
    return disputeTypes[type] || disputeTypes.other;
};

/**
 * دریافت لیست انواع اعتراض بر اساس نقش
 */
export const getDisputeTypesByRole = (role) => {
    return Object.entries(disputeTypes)
        .filter(([_, config]) => config.for === role || config.for === "both")
        .map(([value, config]) => ({
            value,
            label: config.label,
            icon: config.icon,
            color: config.color,
        }));
};

/**
 * دریافت تنظیمات یک وضعیت اعتراض
 */
export const getDisputeStatusConfig = (status) => {
    return disputeStatuses[status] || disputeStatuses.pending;
};

/**
 * دریافت کانفیگ وضعیت برای کارت خلاصه
 * @param {string} status
 * @param {Object} [options]
 * @param {boolean} [options.normalize=false] - awaiting_response رو مثل investigating نمایش بده
 */
export const getDisputeStatusCardConfig = (
    status,
    { normalize = false } = {},
) => {
    let key = status;
    if (normalize && status === "awaiting_response") {
        key = "investigating";
    }
    return disputeStatuses[key] || disputeStatuses.pending;
};

/**
 * دریافت پالت رنگ بر اساس نام رنگ
 */
export const getDisputeColorPalette = (colorName) => {
    return disputeColorPalette[colorName] || disputeColorPalette.yellow;
};

/**
 * دریافت پالت رنگ مستقیم از وضعیت
 */
export const getDisputeStatusPalette = (status) => {
    const cfg = getDisputeStatusConfig(status);
    return getDisputeColorPalette(cfg.colorName);
};

/**
 * دریافت لیبل فارسی یک نوع اعتراض
 */
export const getDisputeTypeLabel = (type) => {
    return disputeTypes[type]?.label || type;
};

/**
 * دریافت لیبل فارسی یک وضعیت
 */
export const getDisputeStatusLabel = (status) => {
    return disputeStatuses[status]?.label || status;
};
