import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Receipt,
    Calendar,
    ArrowDownLeft,
    ArrowUpRight,
    CheckCircle2,
    RotateCcw,
    Clock,
    AlertTriangle,
    Coins,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";

/* ==========================================
   برچسب دوره
   ========================================== */
export const getPeriodLabel = (period) => {
    const map = {
        7: "۷ روز اخیر",
        30: "۳۰ روز اخیر",
        90: "۹۰ روز اخیر",
        365: "۱ سال اخیر",
    };
    return map[period] || "نامشخص";
};

/* ==========================================
   پیکربندی کارت‌ها و مدال‌ها — مشتری
   ========================================== */
export const CUSTOMER_CARD_CONFIG = {
    balance: {
        key: "balance",
        label: "موجودی کیف پول",
        icon: Wallet,
        color: "green",
        getValue: (wallet) => wallet.balance,
        title: "جزئیات موجودی کیف پول",
        description:
            "موجودی فعلی کیف پول شما در این لحظه. این مبلغ می‌تواند برای پرداخت رزروهای آینده استفاده شود.",
        hint: "برای افزایش موجودی، از بخش شارژ کیف پول استفاده کنید.",
        details: (wallet) => [
            {
                label: "موجودی قابل استفاده",
                value: wallet.balance || 0,
                format: "currency",
                icon: Wallet,
            },
            {
                label: "مبلغ بلوکه‌شده (رزروهای فعال)",
                value: wallet.locked_balance || 0,
                format: "currency",
                icon: Clock,
            },
            {
                label: "کل پرداخت‌های انجام‌شده",
                value: wallet.total_paid || 0,
                format: "currency",
                icon: ArrowUpRight,
            },
            {
                label: "کل بازگشت وجه دریافتی",
                value: wallet.total_refunded || 0,
                format: "currency",
                icon: ArrowDownLeft,
            },
            {
                label: "آخرین شارژ",
                value: wallet.last_charge_at || "—",
                format: "date",
                icon: Calendar,
            },
        ],
    },

    paid: {
        key: "paid",
        label: "پرداخت‌های این دوره",
        icon: TrendingUp,
        color: "blue",
        getValue: (wallet, stats) => stats.period_paid,
        title: "جزئیات پرداخت‌های این دوره",
        description:
            "مجموع مبلغی که در بازه زمانی انتخاب‌شده بابت رزروهای انجام‌شده از کیف پول شما کسر شده است.",
        hint: "برای مشاهده ریز هر پرداخت، بخش تراکنش‌ها را بررسی کنید.",
        details: (wallet, stats, period) => [
            {
                label: "تعداد پرداخت‌های موفق",
                value: stats.paid_count ?? 0,
                format: "number",
                icon: CheckCircle2,
            },
            {
                label: "میانگین هر پرداخت",
                value:
                    stats.paid_count > 0
                        ? Math.round(stats.period_paid / stats.paid_count)
                        : 0,
                format: "currency",
                icon: Coins,
            },
            {
                label: "بیشترین پرداخت",
                value: stats.max_payment ?? 0,
                format: "currency",
                icon: ArrowUpRight,
            },
            {
                label: "تعداد رزروهای پرداخت‌شده",
                value: stats.paid_bookings_count ?? 0,
                format: "number",
                icon: Receipt,
            },
            {
                label: "دوره انتخابی",
                value: getPeriodLabel(period),
                format: "text",
                icon: Calendar,
            },
        ],
    },

    refunded: {
        key: "refunded",
        label: "بازگشت وجه این دوره",
        icon: TrendingDown,
        color: "purple",
        getValue: (wallet, stats) => stats.period_refunded,
        title: "جزئیات بازگشت وجه این دوره",
        description:
            "مبلغی که در بازه انتخاب‌شده به دلیل لغو رزرو توسط شما یا آرایشگر، به کیف پول شما بازگشته است.",
        hint: "بازگشت وجه معمولاً بلافاصله پس از تأیید لغو انجام می‌شود.",
        details: (wallet, stats, period) => [
            {
                label: "تعداد بازگشت وجه",
                value: stats.refund_count ?? 0,
                format: "number",
                icon: RotateCcw,
            },
            {
                label: "میانگین هر بازگشت",
                value:
                    stats.refund_count > 0
                        ? Math.round(stats.period_refunded / stats.refund_count)
                        : 0,
                format: "currency",
                icon: Coins,
            },
            {
                label: "بیشترین بازگشت وجه",
                value: stats.max_refund ?? 0,
                format: "currency",
                icon: ArrowDownLeft,
            },
            {
                label: "تعداد رزروهای لغوشده",
                value: stats.cancelled_count ?? 0,
                format: "number",
                icon: AlertTriangle,
            },
            {
                label: "دوره انتخابی",
                value: getPeriodLabel(period),
                format: "text",
                icon: Calendar,
            },
        ],
    },

    bookings: {
        key: "bookings",
        label: "تعداد رزروها",
        icon: Receipt,
        color: "orange",
        getValue: (wallet, stats) => stats.total_bookings,
        mainValueFormat: "number",
        title: "جزئیات رزروهای این دوره",
        description:
            "تعداد کل رزروهای ثبت‌شده توسط شما در بازه زمانی انتخاب‌شده.",
        hint: "برای مشاهده لیست کامل رزروها، به بخش رزروهای من مراجعه کنید.",
        details: (wallet, stats, period) => [
            {
                label: "رزروهای تکمیل‌شده",
                value: stats.completed_count ?? 0,
                format: "number",
                icon: CheckCircle2,
            },
            {
                label: "رزروهای در انتظار",
                value: stats.pending_count ?? 0,
                format: "number",
                icon: Clock,
            },
            {
                label: "رزروهای لغوشده",
                value: stats.cancelled_count ?? 0,
                format: "number",
                icon: AlertTriangle,
            },
            {
                label: "میانگین هزینه هر رزرو",
                value:
                    stats.total_bookings > 0
                        ? Math.round(stats.period_paid / stats.total_bookings)
                        : 0,
                format: "currency",
                icon: Coins,
            },
            {
                label: "دوره انتخابی",
                value: getPeriodLabel(period),
                format: "text",
                icon: Calendar,
            },
        ],
    },
};

/* ==========================================
   ساخت config نهایی برای مدال
   ========================================== */
export const buildCustomerModalConfig = (cardKey, wallet, stats, period) => {
    const config = CUSTOMER_CARD_CONFIG[cardKey];
    if (!config) return null;

    return {
        title: config.title,
        label: config.label,
        color: config.color,
        icon: config.icon,
        description: config.description,
        hint: config.hint,
        mainValue: config.getValue(wallet, stats),
        mainValueFormat: config.mainValueFormat || "currency",
        details: config.details(wallet, stats, period),
    };
};
