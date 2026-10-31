import {
    Wallet,
    Lock,
    TrendingUp,
    TrendingDown,
    Calendar,
    ArrowUpRight,
    AlertTriangle,
    CheckCircle2,
    Clock,
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
   پیکربندی کارت‌ها و مدال‌ها
   ========================================== */
export const CARD_CONFIG = {
    balance: {
        key: "balance",
        label: "موجودی قابل برداشت",
        icon: Wallet,
        color: "green",
        getValue: (wallet) => wallet.balance,
        title: "جزئیات موجودی قابل برداشت",
        description:
            "این مبلغ در حال حاضر در کیف پول شما موجود است و می‌توانید آن را به حساب بانکی خود برداشت کنید.",
        hint: "برای برداشت، به بخش برداشت وجه مراجعه کنید.",
        details: (wallet) => [
            {
                label: "موجودی کل کیف پول",
                value:
                    wallet.total_balance ??
                    (wallet.balance || 0) + (wallet.locked_balance || 0),
                format: "currency",
                icon: Wallet,
            },
            {
                label: "مبلغ در انتظار آزادسازی",
                value: wallet.locked_balance || 0,
                format: "currency",
                icon: Lock,
            },
            {
                label: "حداقل مبلغ برداشت",
                value: wallet.min_withdraw_amount ?? 50000,
                format: "currency",
                icon: ArrowUpRight,
            },
            {
                label: "آخرین برداشت",
                value: wallet.last_withdraw_at || "—",
                format: "date",
                icon: Calendar,
            },
        ],
    },

    locked: {
        key: "locked",
        label: "در انتظار آزادسازی",
        icon: Lock,
        color: "orange",
        getValue: (wallet) => wallet.locked_balance,
        title: "جزئیات مبلغ در انتظار آزادسازی",
        description:
            "این مبلغ از درآمدهای شماست که هنوز در دوره نگه‌داری قرار دارد و پس از پایان دوره به موجودی قابل برداشت منتقل می‌شود.",
        hint: "دوره نگه‌داری معمولاً ۷ روز پس از انجام سرویس است.",
        details: (wallet) => [
            {
                label: "تعداد رزروهای در انتظار",
                value: wallet.pending_count ?? 0,
                format: "number",
                icon: Clock,
            },
            {
                label: "مبلغ قابل آزادسازی امروز",
                value: wallet.releasable_today ?? 0,
                format: "currency",
                icon: TrendingUp,
            },
            {
                label: "زودترین زمان آزادسازی",
                value: wallet.next_release_at || "—",
                format: "date",
                icon: Calendar,
            },
            {
                label: "کل درآمد در انتظار",
                value: wallet.locked_balance || 0,
                format: "currency",
                icon: Lock,
            },
        ],
    },

    earnings: {
        key: "earnings",
        label: "درآمد این دوره",
        icon: TrendingUp,
        color: "blue",
        getValue: (wallet, stats) => stats.period_earnings,
        title: "جزئیات درآمد این دوره",
        description:
            "مجموع درآمد شما از رزروهای تکمیل‌شده در بازه زمانی انتخاب‌شده (پس از کسر کمیسیون).",
        hint: "برای مشاهده ریز تراکنش‌ها به بخش تراکنش‌ها مراجعه کنید.",
        details: (wallet, stats, period) => [
            {
                label: "تعداد رزروهای تکمیل‌شده",
                value: stats.completed_count ?? 0,
                format: "number",
                icon: CheckCircle2,
            },
            {
                label: "میانگین درآمد هر رزرو",
                value:
                    stats.completed_count > 0
                        ? Math.round(
                              stats.period_earnings / stats.completed_count,
                          )
                        : 0,
                format: "currency",
                icon: TrendingUp,
            },
            {
                label: "بیشترین درآمد یک روز",
                value: stats.max_daily_earning ?? 0,
                format: "currency",
                icon: ArrowUpRight,
            },
            {
                label: "درآمد خالص (پس از کسر جریمه)",
                value:
                    (stats.period_earnings || 0) -
                    (stats.period_penalties || 0),
                format: "currency",
                icon: Wallet,
            },
            {
                label: "دوره انتخابی",
                value: getPeriodLabel(period),
                format: "text",
                icon: Calendar,
            },
        ],
    },

    penalties: {
        key: "penalties",
        label: "جریمه‌های این دوره",
        icon: TrendingDown,
        color: "red",
        getValue: (wallet, stats) => stats.period_penalties,
        title: "جزئیات جریمه‌های این دوره",
        description:
            "مبلغ جریمه‌هایی که در بازه انتخابی به دلیل لغو رزرو یا تخلف از قوانین کسر شده است.",
        hint: "برای مشاهده دلیل هر جریمه، بخش تراکنش‌ها را بررسی کنید.",
        details: (wallet, stats, period) => [
            {
                label: "تعداد جریمه‌ها",
                value: stats.penalties_count ?? 0,
                format: "number",
                icon: AlertTriangle,
            },
            {
                label: "میانگین هر جریمه",
                value:
                    stats.penalties_count > 0
                        ? Math.round(
                              stats.period_penalties / stats.penalties_count,
                          )
                        : 0,
                format: "currency",
                icon: TrendingDown,
            },
            {
                label: "بیشترین جریمه",
                value: stats.max_penalty ?? 0,
                format: "currency",
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
};

/* ==========================================
   ساخت config نهایی برای مدال
   ========================================== */
export const buildModalConfig = (card, wallet, stats, period) => {
    const config = CARD_CONFIG[card.key];
    if (!config) return null;

    return {
        title: config.title,
        label: config.label,
        color: config.color,
        icon: config.icon,
        description: config.description,
        hint: config.hint,
        mainValue: config.getValue(wallet, stats),
        mainValueFormat: "currency",
        details: config.details(wallet, stats, period),
    };
};
