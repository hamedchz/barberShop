import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";

import { toPersianNumber } from "../../../utils/persianNumbers";
import "../Dashboard/Assets/css/BarberDashboard.css";
import "./Assets/css/BarberDisputes.css";
import "./Assets/css/DisputeShow.css";

import {
    ArrowRight,
    AlertTriangle,
    MessageSquare,
    Calendar,
    User,
    Scissors,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Ban,
    FileText,
    Eye,
    Send,
    RefreshCw,
    Info,
    Shield,
    AlertCircle,
    Phone,
    Paperclip,
    Download,
    Image as ImageIcon,
} from "lucide-react";

import {
    formatFullDateTime,
    formatFullDateWithoutTime,
} from "../../../utils/dateHelpers";

// ============ تنظیمات وضعیت ============
const statusConfig = {
    pending: {
        label: "در انتظار بررسی",
        icon: Clock,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
        gradient: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)",
    },
    investigating: {
        label: "در حال بررسی",
        icon: Search,
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#bfdbfe",
        gradient: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
    },
    awaiting_response: {
        label: "در انتظار پاسخ",
        icon: MessageSquare,
        color: "#9a3412",
        bg: "#fff7ed",
        border: "#fed7aa",
        gradient: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
    },
    resolved: {
        label: "حل شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#a7f3d0",
        gradient: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
    },
    rejected: {
        label: "رد شده",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fecaca",
        gradient: "linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)",
    },
    cancelled: {
        label: "لغو شده",
        icon: Ban,
        color: "#6b7280",
        bg: "#f3f4f6",
        border: "#e5e7eb",
        gradient: "linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)",
    },
};

export default function BarberDisputeShow({ dispute }) {
    const config = statusConfig[dispute.status] ?? statusConfig.pending;
    const StatusIcon = config.icon;

    // ============ State پاسخ ============
    const [response, setResponse] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ============ ارسال پاسخ ============
    const handleRespond = (e) => {
        e.preventDefault();

        if (response.trim().length < 10) {
            return;
        }

        setIsSubmitting(true);

        router.post(
            `/barber/disputes/${dispute.id}/respond`,
            { response: response.trim() },
            {
                preserveScroll: true,
                onSuccess: () => setResponse(""),
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <Layout>
            <Head title={`اعتراض #${dispute.id}`} />

            <div className="dispute-show-page">
                {/* ============ بازگشت ============ */}
                <div className="dispute-show-back">
                    <Link href="/barber/disputes" className="btn-secondary">
                        <ArrowRight size={16} />
                        بازگشت به اعتراضات
                    </Link>
                </div>

                {/* ============ هدر ============ */}
                <div
                    className="dispute-show-hero"
                    style={{
                        background: config.gradient,
                        borderColor: config.border,
                    }}
                >
                    <div
                        className="dispute-show-hero-icon"
                        style={{
                            background: config.bg,
                            color: config.color,
                            borderColor: config.border,
                        }}
                    >
                        <StatusIcon size={32} />
                    </div>

                    <div className="dispute-show-hero-content">
                        <div className="dispute-show-hero-badges">
                            <span
                                className="dispute-show-hero-badge"
                                style={{
                                    background: config.bg,
                                    color: config.color,
                                    borderColor: config.border,
                                }}
                            >
                                <StatusIcon size={12} />
                                {config.label}
                            </span>
                            <span className="dispute-show-hero-id">
                                <FileText size={12} />
                                اعتراض #{toPersianNumber(dispute.id)}
                            </span>
                            {dispute.can_respond && (
                                <span className="dispute-show-hero-urgent">
                                    <AlertCircle size={12} />
                                    نیاز به پاسخ شما
                                </span>
                            )}
                        </div>
                        <h1 className="dispute-show-hero-title">
                            {dispute.dispute_type_label}
                        </h1>
                        <p className="dispute-show-hero-subtitle">
                            <Calendar size={12} />
                            ثبت شده در {formatFullDateTime(dispute.created_at)}
                        </p>
                    </div>
                </div>

                {/* ============ گرید ============ */}
                <div className="dispute-show-grid">
                    {/* ============ ستون راست ============ */}
                    <div className="dispute-show-main">
                        {/* متن اعتراض */}
                        <div className="dispute-show-card">
                            <div className="dispute-show-card-header">
                                <div className="dispute-show-card-icon warning">
                                    <AlertTriangle size={20} />
                                </div>
                                <h2>متن اعتراض</h2>
                            </div>

                            <div className="dispute-show-reason-box">
                                <AlertTriangle size={16} />
                                <p>{dispute.reason}</p>
                            </div>

                            <div className="dispute-show-meta-grid">
                                <div className="dispute-show-meta-item">
                                    <span className="dispute-show-meta-label">
                                        <User size={12} />
                                        معترض
                                    </span>
                                    <span className="dispute-show-meta-value">
                                        {dispute.disputed_by_label}
                                    </span>
                                </div>
                                <div className="dispute-show-meta-item">
                                    <span className="dispute-show-meta-label">
                                        <Calendar size={12} />
                                        تاریخ ثبت
                                    </span>
                                    <span className="dispute-show-meta-value">
                                        {formatFullDateTime(dispute.created_at)}
                                    </span>
                                </div>
                                <div className="dispute-show-meta-item">
                                    <span className="dispute-show-meta-label">
                                        <FileText size={12} />
                                        نوع
                                    </span>
                                    <span className="dispute-show-meta-value">
                                        {dispute.dispute_type_label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* پاسخ */}
                        {dispute.response && (
                            <div className="dispute-show-card">
                                <div className="dispute-show-card-header">
                                    <div className="dispute-show-card-icon info">
                                        <MessageSquare size={20} />
                                    </div>
                                    <h2>پاسخ</h2>
                                </div>

                                <div className="dispute-show-response-box">
                                    <div className="dispute-show-response-header">
                                        <MessageSquare size={14} />
                                        <strong>
                                            {dispute.responded_by_user?.name ??
                                                "شما"}
                                        </strong>
                                        {dispute.responded_at && (
                                            <span className="dispute-show-response-date">
                                                {formatFullDateTime(
                                                    dispute.responded_at,
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <p>{dispute.response}</p>
                                </div>
                            </div>
                        )}

                        {/* نتیجه (اگه حل شده) */}
                        {dispute.status === "resolved" &&
                            dispute.resolution && (
                                <div className="dispute-show-card">
                                    <div className="dispute-show-card-header">
                                        <div className="dispute-show-card-icon success">
                                            <CheckCircle size={20} />
                                        </div>
                                        <h2>نتیجه بررسی</h2>
                                    </div>

                                    <div className="dispute-show-resolution-box">
                                        <CheckCircle size={16} />
                                        <div>
                                            <p>{dispute.resolution}</p>
                                            {dispute.resolved_at && (
                                                <span className="dispute-show-resolution-date">
                                                    حل شده در{" "}
                                                    {formatFullDateTime(
                                                        dispute.resolved_at,
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* مبالغ */}
                                    {(dispute.refund_amount > 0 ||
                                        dispute.penalty_amount > 0 ||
                                        dispute.compensation_amount > 0) && (
                                        <div className="dispute-show-amounts">
                                            {dispute.refund_amount > 0 && (
                                                <div className="dispute-show-amount-item success">
                                                    <span>بازگشت وجه</span>
                                                    <strong>
                                                        {toPersianNumber(
                                                            Number(
                                                                dispute.refund_amount,
                                                            ).toLocaleString(
                                                                "en-US",
                                                            ),
                                                        )}{" "}
                                                        تومان
                                                    </strong>
                                                </div>
                                            )}
                                            {dispute.penalty_amount > 0 && (
                                                <div className="dispute-show-amount-item danger">
                                                    <span>جریمه</span>
                                                    <strong>
                                                        {toPersianNumber(
                                                            Number(
                                                                dispute.penalty_amount,
                                                            ).toLocaleString(
                                                                "en-US",
                                                            ),
                                                        )}{" "}
                                                        تومان
                                                    </strong>
                                                </div>
                                            )}
                                            {dispute.compensation_amount >
                                                0 && (
                                                <div className="dispute-show-amount-item info">
                                                    <span>غرامت</span>
                                                    <strong>
                                                        {toPersianNumber(
                                                            Number(
                                                                dispute.compensation_amount,
                                                            ).toLocaleString(
                                                                "en-US",
                                                            ),
                                                        )}{" "}
                                                        تومان
                                                    </strong>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                        {/* فرم پاسخ */}
                        {dispute.can_respond && (
                            <div className="dispute-show-card dispute-show-respond-card">
                                <div className="dispute-show-card-header">
                                    <div className="dispute-show-card-icon primary">
                                        <MessageSquare size={20} />
                                    </div>
                                    <h2>پاسخ شما</h2>
                                </div>

                                <p className="dispute-show-respond-hint">
                                    <Info size={14} />
                                    این اعتراض نیاز به پاسخ شما دارد. لطفاً با
                                    دقت پاسخ دهید. ادمین پس از بررسی، تصمیم
                                    نهایی را خواهد گرفت.
                                </p>

                                <form onSubmit={handleRespond}>
                                    <textarea
                                        className="dispute-show-respond-textarea"
                                        value={response}
                                        onChange={(e) =>
                                            setResponse(e.target.value)
                                        }
                                        placeholder="پاسخ خود را دقیق و کامل بنویسید..."
                                        rows={5}
                                        maxLength={2000}
                                        disabled={isSubmitting}
                                    />

                                    <div className="dispute-show-respond-footer">
                                        <div className="dispute-show-respond-counter">
                                            {toPersianNumber(response.length)} /
                                            ۲۰۰۰
                                        </div>
                                        <button
                                            type="submit"
                                            className="dispute-show-respond-btn"
                                            disabled={
                                                isSubmitting ||
                                                response.trim().length < 10
                                            }
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner"></span>
                                                    در حال ارسال...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={16} />
                                                    ارسال پاسخ
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* اطلاعات بررسی ادمین */}
                        {dispute.admin_notes && (
                            <div className="dispute-show-card">
                                <div className="dispute-show-card-header">
                                    <div className="dispute-show-card-icon gray">
                                        <Shield size={20} />
                                    </div>
                                    <h2>یادداشت ادمین</h2>
                                </div>

                                <div className="dispute-show-admin-note">
                                    <Shield size={14} />
                                    <p>{dispute.admin_notes}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ============ ستون چپ ============ */}
                    <div className="dispute-show-sidebar">
                        {/* مشتری */}
                        {dispute.booking?.customer && (
                            <div className="dispute-show-card">
                                <div className="dispute-show-card-header">
                                    <div className="dispute-show-card-icon blue">
                                        <User size={20} />
                                    </div>
                                    <h2>مشتری</h2>
                                </div>

                                <div className="dispute-show-person">
                                    <div className="dispute-show-person-avatar customer">
                                        {dispute.booking.customer.avatar ? (
                                            <img
                                                src={
                                                    dispute.booking.customer
                                                        .avatar
                                                }
                                                alt={
                                                    dispute.booking.customer
                                                        .name
                                                }
                                            />
                                        ) : (
                                            dispute.booking.customer.name
                                                ?.charAt(0)
                                                .toUpperCase() || "؟"
                                        )}
                                    </div>
                                    <div className="dispute-show-person-info">
                                        <span className="dispute-show-person-name">
                                            {dispute.booking.customer.name}
                                        </span>
                                        {dispute.booking.customer.phone && (
                                            <a
                                                href={`tel:${dispute.booking.customer.phone}`}
                                                className="dispute-show-person-phone"
                                            >
                                                <Phone size={12} />
                                                {toPersianNumber(
                                                    dispute.booking.customer
                                                        .phone,
                                                )}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* اطلاعات رزرو */}
                        {dispute.booking && (
                            <div className="dispute-show-card">
                                <div className="dispute-show-card-header">
                                    <div className="dispute-show-card-icon green">
                                        <Calendar size={20} />
                                    </div>
                                    <h2>اطلاعات رزرو</h2>
                                </div>

                                <div className="dispute-show-booking">
                                    <div className="dispute-show-booking-row">
                                        <Scissors size={14} />
                                        <span className="dispute-show-booking-label">
                                            خدمت
                                        </span>
                                        <span className="dispute-show-booking-value">
                                            {dispute.booking.service?.name ??
                                                "—"}
                                        </span>
                                    </div>

                                    {dispute.booking.time_slot && (
                                        <>
                                            <div className="dispute-show-booking-row">
                                                <Calendar size={14} />
                                                <span className="dispute-show-booking-label">
                                                    تاریخ
                                                </span>
                                                <span className="dispute-show-booking-value">
                                                    {formatFullDateWithoutTime(
                                                        dispute.booking
                                                            .time_slot.date,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="dispute-show-booking-row">
                                                <Clock size={14} />
                                                <span className="dispute-show-booking-label">
                                                    ساعت
                                                </span>
                                                <span className="dispute-show-booking-value ltr">
                                                    {toPersianNumber(
                                                        dispute.booking.time_slot.start?.substring(
                                                            0,
                                                            5,
                                                        ),
                                                    )}
                                                    {" - "}
                                                    {toPersianNumber(
                                                        dispute.booking.time_slot.end?.substring(
                                                            0,
                                                            5,
                                                        ),
                                                    )}
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    <div className="dispute-show-booking-row total">
                                        <DollarSign size={14} />
                                        <span className="dispute-show-booking-label">
                                            مبلغ رزرو
                                        </span>
                                        <span className="dispute-show-booking-value">
                                            {toPersianNumber(
                                                Number(
                                                    dispute.booking.amount,
                                                ).toLocaleString("en-US"),
                                            )}{" "}
                                            تومان
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    href={`/barber/bookings/${dispute.booking.id}`}
                                    className="dispute-show-booking-link"
                                >
                                    <Eye size={14} />
                                    مشاهده رزرو
                                </Link>
                            </div>
                        )}

                        {/* پیوست‌ها */}
                        {dispute.attachments?.length > 0 && (
                            <div className="dispute-show-card">
                                <div className="dispute-show-card-header">
                                    <div className="dispute-show-card-icon purple">
                                        <Paperclip size={20} />
                                    </div>
                                    <h2>
                                        پیوست‌ها (
                                        {toPersianNumber(
                                            dispute.attachments.length,
                                        )}
                                        )
                                    </h2>
                                </div>

                                <div className="dispute-show-attachments">
                                    {dispute.attachments.map(
                                        (attachment, i) => (
                                            <a
                                                key={i}
                                                href={`/storage/${attachment}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="dispute-show-attachment"
                                            >
                                                <ImageIcon size={16} />
                                                <span>
                                                    پیوست{" "}
                                                    {toPersianNumber(i + 1)}
                                                </span>
                                                <Download size={12} />
                                            </a>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                        {/* راهنما */}
                        <div className="dispute-show-card">
                            <div className="dispute-show-card-header">
                                <div className="dispute-show-card-icon gray">
                                    <Info size={20} />
                                </div>
                                <h2>راهنما</h2>
                            </div>

                            <ul className="dispute-show-help-list">
                                <li>
                                    <CheckCircle size={14} />
                                    <span>
                                        اعتراضات توسط ادمین بررسی می‌شوند.
                                    </span>
                                </li>
                                <li>
                                    <AlertCircle size={14} />
                                    <span>
                                        پاسخ شما به تصمیم ادمین کمک می‌کند.
                                    </span>
                                </li>
                                <li>
                                    <Info size={14} />
                                    <span>
                                        نتیجه نهایی از طریق اعلان به شما اطلاع
                                        داده می‌شود.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
