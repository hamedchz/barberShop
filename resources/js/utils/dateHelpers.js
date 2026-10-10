import { toJalaali } from "jalaali-js";
import { toPersianNumber } from "./persianNumbers";

/**
 * تبدیل تاریخ میلادی به شمسی (رشته)
 * @param {string|Date} date
 * @returns {string} مثلاً "۱۴۰۳/۰۹/۱۵"
 */
export const formatJalaliDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const { jy, jm, jd } = toJalaali(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    );
    return toPersianNumber(
        `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`,
    );
};

/**
 * تاریخ کامل شمسی با ساعت
 * @param {string|Date} date
 * @returns {string} مثلاً "۱۴۰۳/۰۹/۱۵ - ۱۴:۳۰"
 */
export const formatFullDateTime = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const { jy, jm, jd } = toJalaali(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    );
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return toPersianNumber(
        `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")} - ${hours}:${minutes}`,
    );
};

/**
 * فقط ساعت
 * @param {string|Date} date
 * @returns {string} مثلاً "۱۴:۳۰"
 */
export const formatTime = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return toPersianNumber(`${hours}:${minutes}`);
};

/**
 * نام روز هفته
 * @param {string|Date} date
 * @returns {string} مثلاً "دوشنبه"
 */
export const getDayName = (date) => {
    if (!date) return "";
    const days = [
        "یکشنبه",
        "دوشنبه",
        "سه‌شنبه",
        "چهارشنبه",
        "پنجشنبه",
        "جمعه",
        "شنبه",
    ];
    return days[new Date(date).getDay()];
};

/**
 * تاریخ نسبی
 * @param {string|Date} date
 * @returns {{label: string, color: string}}
 */
export const getRelativeTime = (date) => {
    if (!date) return { label: "", color: "" };
    const now = new Date();
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const diffInDays = Math.round((d - today) / 1000 / 60 / 60 / 24);

    if (diffInDays === 0) return { label: "امروز", color: "#f59e0b" };
    if (diffInDays === 1) return { label: "فردا", color: "#3b82f6" };
    if (diffInDays === -1) return { label: "دیروز", color: "#9ca3af" };
    if (diffInDays > 0)
        return {
            label: `${toPersianNumber(diffInDays)} روز آینده`,
            color: "#10b981",
        };
    return {
        label: `${toPersianNumber(Math.abs(diffInDays))} روز پیش`,
        color: "#9ca3af",
    };
};

/**
 * فاصله زمانی نسبی (برای تراکنشها، اعلانها)
 * @param {string|Date} date
 * @returns {string} مثلاً "۵ دقیقه پیش"
 */
export const getTimeAgo = (date) => {
    if (!date) return "";
    const now = new Date();
    const d = new Date(date);
    const diffInSeconds = Math.floor((now - d) / 1000);

    if (diffInSeconds < 60) {
        return "همین الان";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${toPersianNumber(diffInMinutes)} دقیقه پیش`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${toPersianNumber(diffInHours)} ساعت پیش`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${toPersianNumber(diffInDays)} روز پیش`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${toPersianNumber(diffInMonths)} ماه پیش`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${toPersianNumber(diffInYears)} سال پیش`;
};

/**
 * بررسی امروز بودن
 */
export const isToday = (date) => {
    if (!date) return false;
    return new Date(date).toDateString() === new Date().toDateString();
};

/**
 * بررسی گذشته بودن
 */
export const isPast = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
};

/**
 * بررسی آینده بودن
 */
export const isFuture = (date) => {
    if (!date) return false;
    return new Date(date) > new Date();
};

/**
 * اختلاف ساعت (برای مهلتها)
 */
export const hoursDiff = (date) => {
    if (!date) return 0;
    return Math.abs(new Date() - new Date(date)) / 1000 / 60 / 60;
};

/**
 * تبدیل شمسی به میلادی
 */
export const jalaliToGregorian = (jy, jm, jd) => {
    const { toGregorian } = require("jalaali-js");
    const { gy, gm, gd } = toGregorian(jy, jm, jd);
    return new Date(gy, gm - 1, gd);
};
