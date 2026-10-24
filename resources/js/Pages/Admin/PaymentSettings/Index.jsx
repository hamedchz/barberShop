// resources/js/Pages/Admin/PaymentSettings/Index.jsx

import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import "../Assets/css/Finance.css";
import "../Assets/css/Transactions.css";
import "./Assets/css/PaymentSettings.css";

import {
    CreditCard,
    Settings,
    CheckCircle,
    XCircle,
    ChevronLeft,
    Shield,
    AlertTriangle,
    Server,
    Database,
    RefreshCw,
} from "lucide-react";

const modeColors = {
    normal: { color: "#065f46", bg: "#ecfdf5", border: "#a7f3d0" },
    sandbox: { color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
    zaringate: { color: "#5b21b6", bg: "#f5f3ff", border: "#ddd6fe" },
};

const modeLabels = {
    normal: "عادی",
    sandbox: "تست (Sandbox)",
    zaringate: "زرین‌گیت",
};

export default function PaymentSettingsIndex({ settings = [] }) {
    return (
        <Layout>
            <Head title="تنظیمات درگاه پرداخت" />

            <div className="admin-finance-page">
                {/* هدر */}
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div className="finance-header-icon">
                            <Settings size={28} />
                        </div>
                        <div>
                            <h1>تنظیمات درگاه پرداخت</h1>
                            <p>مدیریت درگاه‌های پرداخت آنلاین</p>
                        </div>
                    </div>
                    <div className="finance-header-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() =>
                                router.reload({ only: ["settings"] })
                            }
                        >
                            <RefreshCw size={14} />
                            بروزرسانی
                        </button>
                    </div>
                </div>

                {/* هشدار */}
                <div
                    className="deposit-warning"
                    style={{ marginBottom: "1.5rem" }}
                >
                    <AlertTriangle size={16} />
                    <div>
                        <strong>توجه:</strong> تغییر تنظیمات درگاه، روی همه
                        پرداخت‌های جدید اعمال می‌شود. برای اطمینان، قبل از
                        تغییر، با تیم فنی هماهنگ کنید.
                    </div>
                </div>

                {/* لیست درگاه‌ها */}
                <div className="payment-gateways-grid">
                    {settings.map((setting) => {
                        const modeStyle =
                            modeColors[setting.mode] ?? modeColors.normal;

                        return (
                            <div
                                key={setting.gateway}
                                className={`payment-gateway-card ${setting.is_active ? "active" : "inactive"}`}
                            >
                                {/* هدر کارت */}
                                <div className="payment-gateway-card-header">
                                    <div className="payment-gateway-icon">
                                        <CreditCard size={24} />
                                    </div>
                                    <div className="payment-gateway-title">
                                        <h3>{setting.gateway_label}</h3>
                                        <div className="payment-gateway-badges">
                                            {setting.is_active ? (
                                                <span className="gateway-badge active">
                                                    <CheckCircle size={10} />
                                                    فعال
                                                </span>
                                            ) : (
                                                <span className="gateway-badge inactive">
                                                    <XCircle size={10} />
                                                    غیرفعال
                                                </span>
                                            )}
                                            <span
                                                className="gateway-badge mode"
                                                style={{
                                                    color: modeStyle.color,
                                                    background: modeStyle.bg,
                                                    borderColor:
                                                        modeStyle.border,
                                                }}
                                            >
                                                {modeLabels[setting.mode] ??
                                                    setting.mode}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* اطلاعات */}
                                <div className="payment-gateway-info">
                                    <div className="payment-gateway-row">
                                        <span className="payment-gateway-label">
                                            <Shield size={12} />
                                            Merchant ID
                                        </span>
                                        <span className="payment-gateway-value ltr">
                                            {setting.merchant_id
                                                ? setting.merchant_id.substring(
                                                      0,
                                                      16,
                                                  ) + "..."
                                                : "—"}
                                        </span>
                                    </div>
                                    <div className="payment-gateway-row">
                                        <span className="payment-gateway-label">
                                            <Database size={12} />
                                            منبع
                                        </span>
                                        <span className="payment-gateway-value">
                                            {setting.source === "database"
                                                ? "دیتابیس"
                                                : "config"}
                                        </span>
                                    </div>
                                    <div className="payment-gateway-row">
                                        <span className="payment-gateway-label">
                                            <Server size={12} />
                                            واحد پول
                                        </span>
                                        <span className="payment-gateway-value">
                                            {setting.currency === "T"
                                                ? "تومان"
                                                : "ریال"}
                                        </span>
                                    </div>
                                </div>

                                {/* اکشن‌ها */}
                                <div className="payment-gateway-actions">
                                    <Link
                                        href={`/admin/payment-settings/${setting.gateway}`}
                                        className="payment-gateway-btn edit"
                                    >
                                        <Settings size={14} />
                                        تنظیمات
                                        <ChevronLeft size={14} />
                                    </Link>
                                    <button
                                        type="button"
                                        className={`payment-gateway-btn toggle ${setting.is_active ? "deactivate" : "activate"}`}
                                        onClick={() =>
                                            router.patch(
                                                `/admin/payment-settings/${setting.gateway}/toggle`,
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        {setting.is_active ? (
                                            <>
                                                <XCircle size={14} />
                                                غیرفعال
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={14} />
                                                فعال
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Layout>
    );
}
