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
} from "lucide-react";

export const menuConfig = [
    // ============ داشبورد ============
    {
        id: "dashboard",
        label: "داشبورد",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
        scopes: ["dashboard"],
        // اگر permissions خالی باشد، یعنی برای همه نمایش داده می‌شود
        permissions: [],
    },

    // ============ مدیریت ادمین‌ها ============
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
        id: "users",
        label: "کاربران",
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
                icon: CreditCard,
                href: "/admin/finance/settlements",
                permissions: ["manage-settlements", "manage-finance"],
                scopes: ["settlements"],
            },
            {
                id: "commission",
                label: "کمیسیون",
                icon: Percent,
                href: "/admin/finance/commission",
                permissions: ["manage-commission", "manage-finance"],
                scopes: ["commission"],
            },
        ],
    },
    // ============ گزارش‌ها ============
    {
        id: "banks",
        label: "بانک ها",
        icon: Landmark,
        href: "/admin/banks",
        scopes: [],
        permissions: [],
    },
    // ============ رزروهای آرایشگر ============
    {
        id: "bookings",
        label: "رزروها",
        icon: CalendarCheck2,
        href: "",
        scopes: ["bookings"],
        permissions: [],
    },

    {
        id: "disputes",
        label: "اعتراض ها",
        icon: Scale,
        href: "admin/disputes",
        scopes: ["disputes"],
        permissions: [],
    },

    // ============ تنظیمات ============

    {
        id: "settings",
        label: "تنظیمات",
        icon: Settings,
        permissions: [],
        children: [
            {
                id: "general-settings",
                label: "تنظیمات عمومی",
                icon: SlidersHorizontal,
                href: "/admin/settings/general",
                permissions: [],
                scopes: ["manage-general-settings"],
            },
            {
                id: "commission-settings",
                label: "تنظیمات کمیسیون",
                icon: Percent,
                href: "/admin/settings/commission",
                permissions: [],
                scopes: ["commission-settings"],
            },
            {
                id: "payment-settings",
                label: "تنظیمات پرداخت",
                icon: CreditCard,
                href: "/admin/settings/payment",
                permissions: [],
                scopes: ["payment-settings"],
            },
            {
                id: "notification-settings",
                label: "تنظیمات اعلان‌ها",
                icon: Bell,
                href: "/admin/settings/notifications",
                permissions: [],
                scopes: [],
            },
        ],
    },

    // ============ خدمات من (آرایشگر) ============
    {
        id: "services",
        label: "خدمات من",
        icon: Package,
        href: "/barber/services",
        scopes: ["services", "service-list", "service-create", "service-edit"],
        permissions: ["services.view", "services.manage"],
    },

    // ============ برنامه هفتگی ============
    {
        id: "availabilities",
        label: "برنامه هفتگی",
        icon: Calendar,
        href: "/barber/availabilities",
        scopes: ["availabilities", "availability-list"],
        permissions: [],
    },

    // ============ زمان‌بندی نوبت‌ها ============
    {
        id: "time-slots",
        label: "زمان‌بندی نوبت‌ها",
        icon: Clock,
        href: "/barber/time-slots",
        scopes: ["time-slots", "time-slot-list"],
        permissions: [],
    },
];
