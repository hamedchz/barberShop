// resources/js/config/menu.js
import {
    LayoutDashboard,
    Users,
    Shield,
    Scissors,
    Calendar,
    Clock,
    BarChart2,
    Settings,
    Package,
    UserShield,
    CalendarCheck2,
    Scale,
    SlidersHorizontal,
    Percent,
    CreditCard,
    Bell,
    Receipt,
    Coins,
    ChartColumn,
    Landmark,
    ChartCandlestick,
    BanknoteArrowUp,
    BanknoteArrowDown,
    UserRoundGroup,
    StarCheck,
    CalendarClock,
    SquareText,
    BellRing,
    CreditCardReader,
    MessageSquareCode,
    Quote,
    CreditCardPlus,
} from "lucide-react";

export const menuConfig = [
    // admin menus
    // ============ داشبورد ============
    {
        id: "dashboard",
        label: "داشبورد",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
        scopes: ["dashboard"],
        permissions: [
            "manage-admins",
            "manage-barber",
            "manage-users",
            "manage-roles",
            "manage-finance",
            "manage-transactions",
            "manage-revenue",
            "manage-settlements",
            "manage-commission",
            "manage-banks",
            "manage-needs-attention",
            "manage-bookings",
            "manage-disputes",
            "manage-reviews",
            "manage-payment-settings",
            "manage-general-settings",
        ],
    },

    // ============ مدیریت ادمین‌ها ============

    {
        id: "users",
        label: "مدیریت کاربران",
        icon: UserRoundGroup,
        childrenPermissions: [
            "manage-admins",
            "manage-barber",
            "manage-users",
            "manage-roles",
        ],
        children: [
            {
                id: "admins",
                label: "ادمین‌ها",
                icon: Shield,
                href: "/admin/admins",
                scopes: ["admins", "admin-list", "admin-create", "admin-edit"],
                permissions: ["manage-admins"],
            },

            // ============ آرایشگران ============
            {
                id: "barbers",
                label: "آرایشگران",
                icon: Scissors,
                href: "/admin/barbers",
                scopes: ["barbers", "barber-list", "barber-show"],
                permissions: ["manage-barber"],
            },

            // ============ کاربران ============
            {
                id: "customers",
                label: "مشتریان",
                icon: Users,
                href: "/admin/customers",
                scopes: ["users", "user-list"],
                permissions: ["manage-users"],
            },
            // ============ نقشها ============
            {
                id: "roles",
                label: "نقش ها",
                icon: UserShield,
                href: "/admin/roles",
                scopes: ["roles", "role-list"],
                permissions: ["manage-roles"],
            },
        ],
    },
    // ============ مالی ============

    {
        id: "finance",
        label: "مالی",
        icon: ChartCandlestick,
        childrenPermissions: [
            "manage-finance",
            "manage-transactions",
            "manage-revenue",
            "manage-settlements",
            "manage-commission",
            "manage-banks",
        ],
        children: [
            {
                id: "finance-index",
                label: "مدیریت مالی",
                icon: Coins,
                href: "/admin/finance",
                permissions: ["manage-finance"],
                scopes: ["finance"],
            },
            {
                id: "transactions",
                label: "تراکنش ها",
                icon: Receipt,
                href: "/admin/finance/transactions",
                permissions: ["manage-transactions", "manage-finance"],
                scopes: ["transactions"],
            },
            {
                id: "revenue",
                label: "گزارش درآمد",
                icon: ChartColumn,
                href: "/admin/finance/revenue",
                permissions: ["manage-revenue", "manage-finance"],
                scopes: ["revenue"],
            },
            {
                id: "settlements",
                label: "تسویه ها",
                icon: BanknoteArrowDown,
                href: "/admin/finance/settlements",
                permissions: ["manage-settlements", "manage-finance"],
                scopes: ["settlements"],
            },
            {
                id: "deposits",
                label: "شارژ ها",
                icon: BanknoteArrowUp,
                href: "/admin/finance/wallet/deposits",
                permissions: ["manage-deposits", "manage-finance"],
                scopes: ["deposits"],
            },
            {
                id: "payments",
                label: "پرداخت‌های درگاه",
                icon: CreditCard,
                href: "/admin/finance/payments",
                permissions: ["manage-payment", "manage-finance"],
                scopes: ["payments"],
            },

            {
                id: "commission",
                label: "کمیسیون",
                icon: Percent,
                href: "/admin/finance/commission",
                permissions: ["manage-commission", "manage-finance"],
                scopes: ["commission"],
            },
            {
                id: "banks",
                label: "لیست بانک ها",
                icon: Landmark,
                href: "/admin/banks",
                permissions: ["manage-banks", "manage-finance"],
                scopes: ["banks-list"],
            },
        ],
    },

    {
        id: "needs-attention",
        label: "موارد نیازمند رسیدگی",
        icon: SquareText,
        href: "/admin/needs-attention",
        scopes: ["needs-attention"],
        permissions: ["manage-needs-attention"],
    },
    {
        id: "notifications",
        label: "مرکز اعلان ها",
        icon: BellRing,
        href: "/admin/notifications",
        scopes: ["notifications"],
        permissions: ["manage-notifications"],
    },
    // ============ رزروها============
    {
        id: "bookings",
        label: "مدیریت رزروها",
        icon: CalendarClock,
        childrenPermissions: [
            "manage-bookings",
            "manage-disputes",
            "manage-reviews",
        ],
        children: [
            {
                id: "bookings",
                label: "رزروها",
                icon: CalendarCheck2,
                href: "/admin/bookings",
                scopes: ["bookings-list"],
                permissions: ["manage-bookings"],
            },

            {
                id: "disputes",
                label: "اعتراض ها",
                icon: Scale,
                href: "/admin/disputes",
                scopes: ["disputes"],
                permissions: ["manage-disputes"],
            },
            {
                id: "reviews",
                label: "نظرات",
                icon: Quote,
                href: "/admin/reviews",
                scopes: ["reviews"],
                permissions: ["manage-reviews"],
            },
        ],
    },

    // ============ تنظیمات ============

    {
        id: "settings",
        label: "تنظیمات",
        icon: Settings,
        permissions: ["manage-payment-settings", "manage-general-settings"],
        children: [
            {
                id: "general-settings",
                label: "تنظیمات عمومی",
                icon: SlidersHorizontal,
                href: "/admin/settings",
                permissions: [],
                scopes: ["manage-general-settings"],
            },
            {
                id: "gatway",
                label: "تنظیمات درگاه پرداخت",
                icon: CreditCardReader,
                href: "/admin/payment-settings/zarinpal",
                permissions: ["manage-payment-settings"],
                scopes: ["payment-settings"],
            },
        ],
    },
    // barber menus
    // ============ داشبورد ============
    {
        id: "barber-dashboard",
        label: "داشبورد",
        icon: LayoutDashboard,
        href: "/barber/dashboard",
        scopes: ["dashboard"],
        permissions: ["barber-dashboard-panel"],
    },
    // ============ خدمات من (آرایشگر) ============
    {
        id: "services",
        label: "خدمات من",
        icon: Package,
        href: "/barber/services",
        scopes: ["services", "service-list", "service-create", "service-edit"],
        permissions: ["barber-dashboard-panel"],
    },

    // ============ برنامه هفتگی ============
    {
        id: "availabilities",
        label: "برنامه هفتگی",
        icon: Calendar,
        href: "/barber/availabilities",
        scopes: ["availabilities", "availability-list"],
        permissions: ["barber-dashboard-panel"],
    },

    // ============ رزروها ============

    {
        id: "barber-bookings",
        label: "مدیریت رزروها",
        icon: CalendarClock,
        childrenPermissions: ["barber-dashboard-panel"],
        children: [
            {
                id: "bookings",
                label: "رزروها",
                icon: CalendarCheck2,
                href: "/barber/bookings",
                scopes: ["bookings-list"],
                permissions: ["barber-dashboard-panel"],
            },

            {
                id: "disputes",
                label: "اعتراض ها",
                icon: Scale,
                href: "/barber/disputes",
                scopes: ["disputes"],
                permissions: ["barber-dashboard-panel"],
            },
            {
                id: "reviews",
                label: "نظرات",
                icon: Quote,
                href: "/barber/reviews",
                scopes: ["reviews"],
                permissions: ["barber-dashboard-panel"],
            },
        ],
    },

    // ============ مالی ============

    {
        id: "barber-finance",
        label: "مالی",
        icon: ChartCandlestick,
        childrenPermissions: ["barber-dashboard-panel"],
        children: [
            {
                id: "barber-finance-index",
                label: "مدیریت مالی",
                icon: Coins,
                href: "/barber/finance/wallet",
                permissions: ["barber-dashboard-panel"],
                scopes: ["finance"],
            },
            {
                id: "barber-transactions",
                label: "تراکنش ها",
                icon: Receipt,
                href: "/barber/finance/wallet/transactions",
                permissions: ["barber-dashboard-panel"],
                scopes: ["transactions"],
            },
            {
                id: "barber-settlements",
                label: "تسویه ها",
                icon: BanknoteArrowDown,
                href: "/barber/finance/wallet/settlements",
                permissions: ["barber-dashboard-panel"],
                scopes: ["settlements"],
            },

            {
                id: "barber-bank-info",
                label: "اطلاعات بانکی",
                icon: CreditCardPlus,
                href: "/barber/finance/profile/bank-info",
                permissions: ["barber-dashboard-panel"],
                scopes: ["bank-info"],
            },
        ],
    },
];
