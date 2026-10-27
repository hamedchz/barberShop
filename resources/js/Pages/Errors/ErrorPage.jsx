// resources/js/Pages/Errors/ErrorPage.jsx

import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    ShieldOff,
    Search,
    Clock,
    AlertTriangle,
    ServerCrash,
    Wrench,
    Home,
    ArrowRight,
    RefreshCw,
    Info,
} from "lucide-react";
import { toPersianNumber } from "../../utils/persianNumbers";
import "./Assets/Errors.css";
// ============ تنظیمات هر خطا ============
const errorConfig = {
    403: {
        title: "دسترسی غیرمجاز",
        code: "۴۰۳",
        description:
            "شما مجوز دسترسی به این بخش را ندارید. این صفحه فقط برای کاربران مجاز در دسترس است.",
        icon: ShieldOff,
        hint: null,
        actions: ["home", "back"],
    },
    404: {
        title: "صفحه پیدا نشد",
        code: "۴۰۴",
        description:
            "متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است. ممکن است آدرس را اشتباه وارد کرده باشید.",
        icon: Search,
        hint: null,
        actions: ["home", "back"],
    },
    419: {
        title: "نشست شما منقضی شده است",
        code: "۴۱۹",
        description:
            "به دلیل عدم فعالیت طولانی، نشست شما منقضی شده است. لطفاً صفحه را بازخوانی کنید و دوباره تلاش کنید.",
        icon: Clock,
        hint: null,
        actions: ["reload", "home"],
    },
    429: {
        title: "درخواست‌های بیش از حد",
        code: "۴۲۹",
        description:
            "شما تعداد زیادی درخواست در مدت زمان کوتاه ارسال کرده‌اید. لطفاً چند لحظه صبر کنید و دوباره تلاش کنید.",
        icon: AlertTriangle,
        hint: "این محدودیت برای جلوگیری از حملات و استفاده غیرمجاز اعمال می‌شود. پس از یک دقیقه می‌توانید دوباره تلاش کنید.",
        actions: ["reload", "home"],
    },
    500: {
        title: "خطای سرور",
        code: "۵۰۰",
        description:
            "متأسفانه در پردازش درخواست شما خطایی رخ داده است. تیم فنی ما از این مشکل مطلع شد و در حال بررسی است.",
        icon: ServerCrash,
        hint: "اگر مشکل ادامه داشت، لطفاً با پشتیبانی تماس بگیرید و کد خطا را اعلام کنید.",
        actions: ["reload", "home"],
    },
    503: {
        title: "سایت در حال بروزرسانی است",
        code: "۵۰۳",
        description:
            "ما در حال انجام تعمیرات برنامه‌ریزی‌شده هستیم تا تجربه بهتری برای شما فراهم کنیم. لطفاً چند دقیقه دیگر دوباره سر بزنید.",
        icon: Wrench,
        hint: "زمان تقریبی: کمتر از ۳۰ دقیقه. می‌توانید صفحه را رفرش کنید یا بعداً دوباره تلاش کنید.",
        actions: ["reload"],
    },
};

export default function ErrorPage({ status, message = null, site = null }) {
    const config = errorConfig[status] ?? errorConfig[500];
    const Icon = config.icon;

    return (
        <>
            <Head title={`${config.title} - ${site?.name ?? "آرایشگاه"}`} />

            <div className="error-page-wrapper">
                <div className="error-page-card">
                    {/* ============ Code ============ */}
                    <div className="error-page-code">{config.code}</div>

                    {/* ============ Icon ============ */}
                    <div className="error-page-icon">
                        <Icon size={40} />
                    </div>

                    {/* ============ Title ============ */}
                    <h1 className="error-page-title">{config.title}</h1>

                    {/* ============ Description ============ */}
                    <p className="error-page-description">
                        {message || config.description}
                    </p>

                    {/* ============ Hint ============ */}
                    {config.hint && (
                        <div className="error-page-hint">
                            <Info size={16} />
                            <span>{config.hint}</span>
                        </div>
                    )}

                    {/* ============ Actions ============ */}
                    <div className="error-page-actions">
                        {config.actions.includes("home") && (
                            <Link href="/" className="error-page-btn primary">
                                <Home size={16} />
                                صفحه اصلی
                            </Link>
                        )}

                        {config.actions.includes("reload") && (
                            <button
                                type="button"
                                className="error-page-btn primary"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw size={16} />
                                تلاش مجدد
                            </button>
                        )}

                        {config.actions.includes("back") && (
                            <button
                                type="button"
                                className="error-page-btn secondary"
                                onClick={() => window.history.back()}
                            >
                                <ArrowRight size={16} />
                                بازگشت
                            </button>
                        )}
                    </div>

                    {/* ============ Footer ============ */}
                    <div className="error-page-footer">
                        کد خطا:{" "}
                        <strong>
                            {toPersianNumber(status)} — {config.title}
                        </strong>
                    </div>
                </div>
            </div>
        </>
    );
}
