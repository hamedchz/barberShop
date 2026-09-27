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
        href: "/admin/users",
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
        permissions: ["availabilities.manage"],
    },

    // ============ زمان‌بندی نوبت‌ها ============
    {
        id: "time-slots",
        label: "زمان‌بندی نوبت‌ها",
        icon: Clock,
        href: "/barber/time-slots",
        scopes: ["time-slots", "time-slot-list"],
        permissions: ["time-slots.manage"],
    },

    // ============ گزارش‌ها ============
    {
        id: "reports",
        label: "گزارش‌ها",
        icon: BarChart2,
        href: "/admin/reports",
        scopes: ["reports"],
        permissions: ["reports.view"],
    },

    // ============ تنظیمات ============
    {
        id: "settings",
        label: "تنظیمات",
        icon: Settings,
        href: "/admin/settings",
        scopes: ["settings"],
        permissions: ["settings.manage"],
    },
];
