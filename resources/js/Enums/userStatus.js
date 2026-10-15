// resources/js/Constants/userStatus.js

import {
    CheckCircle,
    CircleSlash,
    PauseCircle,
    Clock,
    Ban,
} from "lucide-react";

// ============================================
// User Status Enum
// ============================================
export const UserStatus = Object.freeze({
    ACTIVE: "active",
    INACTIVE: "inactive",
    SUSPENDED: "suspended",
    PENDING: "pending",
    BANNED: "banned",
});

// ============================================
// کانفیگ کامل هر وضعیت
// ============================================
export const userStatusConfig = Object.freeze({
    [UserStatus.ACTIVE]: {
        value: UserStatus.ACTIVE,
        label: "فعال",
        icon: CheckCircle,
        color: "green",
        description: "حساب کاربری فعال است و می‌تواند از خدمات استفاده کند.",
        isActive: true, // ← آیا is_active = true باشه؟
    },
    [UserStatus.INACTIVE]: {
        value: UserStatus.INACTIVE,
        label: "غیرفعال",
        icon: CircleSlash,
        color: "gray",
        description: "حساب کاربری به‌صورت موقت غیرفعال شده است.",
        isActive: false,
    },
    [UserStatus.SUSPENDED]: {
        value: UserStatus.SUSPENDED,
        label: "معلق",
        icon: PauseCircle,
        color: "orange",
        description: "حساب کاربری به دلیل نقض قوانین معلق شده است.",
        isActive: false,
    },
    [UserStatus.PENDING]: {
        value: UserStatus.PENDING,
        label: "در انتظار تایید",
        icon: Clock,
        color: "yellow",
        description: "حساب کاربری در انتظار تایید مدیر است.",
        isActive: false,
    },
    [UserStatus.BANNED]: {
        value: UserStatus.BANNED,
        label: "مسدود",
        icon: Ban,
        color: "red",
        description: "حساب کاربری به‌صورت دائم مسدود شده است.",
        isActive: false,
    },
});

// ============================================
// توابع کمکی
// ============================================

/**
 * گرفتن کانفیگ وضعیت با fallback
 */
export const getUserStatusConfig = (status) => {
    return userStatusConfig[status] || userStatusConfig[UserStatus.ACTIVE];
};

/**
 * گرفتن label وضعیت
 */
export const getUserStatusLabel = (status) => {
    return getUserStatusConfig(status).label;
};

/**
 * گرفتن رنگ وضعیت
 */
export const getUserStatusColor = (status) => {
    return getUserStatusConfig(status).color;
};

/**
 * گرفتن آیکون وضعیت
 */
export const getUserStatusIcon = (status) => {
    return getUserStatusConfig(status).icon;
};

/**
 * گرفتن توضیحات وضعیت
 */
export const getUserStatusDescription = (status) => {
    return getUserStatusConfig(status).description;
};

/**
 * بررسی فعال بودن
 */
export const isUserStatusActive = (status) => {
    return getUserStatusConfig(status).isActive;
};

/**
 * همه وضعیتها بهصورت آرایه (برای dropdown, select, ...)
 */
export const getUserStatusOptions = () => {
    return Object.values(userStatusConfig).map((cfg) => ({
        value: cfg.value,
        label: cfg.label,
        icon: cfg.icon,
        color: cfg.color,
        description: cfg.description,
        isActive: cfg.isActive,
    }));
};

/**
 * همه مقادیر (برای validation)
 */
export const getUserStatusValues = () => {
    return Object.values(UserStatus);
};
