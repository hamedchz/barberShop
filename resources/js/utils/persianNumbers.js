// ============ تبدیل اعداد انگلیسی به فارسی ============
export const toPersianNumber = (value) => {
    if (value === null || value === undefined) return "";

    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return String(value).replace(/\d/g, (d) => persianDigits[d]);
};

// ============ حذف ثانیه از زمان ============
// ورودی: "09:00:00" → خروجی: "09:00"
// ورودی: "09:00" → خروجی: "09:00"
export const stripSeconds = (time) => {
    if (!time) return "";

    // اگر فرمت HH:mm:ss بود، فقط HH:mm را برگردان
    const parts = String(time).split(":");
    if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
    }

    return String(time);
};

// ============ تبدیل ساعت به فارسی (با حذف ثانیه) ============
// ورودی: "09:00:00" → خروجی: "۰۹:۰۰"
export const toPersianTime = (time) => {
    if (!time) return "";
    return toPersianNumber(stripSeconds(time));
};

// ============ نمایش بازه زمانی به فارسی ============
// ورودی: "09:00:00", "18:00:00" → خروجی: "۰۹:۰۰ تا ۱۸:۰۰"
export const toPersianTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return "";
    return `${toPersianTime(startTime)} تا ${toPersianTime(endTime)}`;
};

// ============ نمایش ساعت ۱۲ ساعته با حذف ثانیه (اختیاری) ============
export const toPersianTime12 = (time) => {
    if (!time) return "";

    const cleanTime = stripSeconds(time);
    const [hours, minutes] = cleanTime.split(":").map(Number);

    const period = hours >= 12 ? "بعدازظهر" : "قبل‌ازظهر";
    const hour12 = hours % 12 || 12;

    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    const toPersian = (n) =>
        String(n)
            .padStart(2, "0")
            .replace(/\d/g, (d) => persianDigits[d]);

    return `${toPersian(hour12)}:${toPersian(minutes)} ${period}`;
};

export const toPersianTimeRange12 = (startTime, endTime) => {
    if (!startTime || !endTime) return "";
    return `${toPersianTime12(startTime)} تا ${toPersianTime12(endTime)}`;
};
