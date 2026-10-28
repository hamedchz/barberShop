// resources/js/Pages/Barber/Disputes/Show.jsx

import React, { useState, useRef, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import ConfirmModal from "../../Admin/Components/ConfirmModal";

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
    Plus,
    X,
    Edit3,
    Trash2,
    Timer,
    UserCheck,
    Hash,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import {
    formatFullDateTime,
    formatFullDateWithoutTime,
} from "../../../utils/dateHelpers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";

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

// ============ فرمت حجم فایل ============
const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${toPersianNumber(bytes)} B`;
    if (bytes < 1024 * 1024)
        return `${toPersianNumber((bytes / 1024).toFixed(1))} KB`;
    return `${toPersianNumber((bytes / (1024 * 1024)).toFixed(1))} MB`;
};

const formatRemainingTime = (hours) => {
    const totalMinutes = Math.max(0, Math.ceil(Number(hours || 0) * 60));

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    if (h > 0 && m > 0) {
        return `${toPersianNumber(h)} ساعت و ${toPersianNumber(m)} دقیقه`;
    }

    if (h > 0) {
        return `${toPersianNumber(h)} ساعت`;
    }

    return `${toPersianNumber(m)} دقیقه`;
};

export default function BarberDisputeShow({ dispute }) {
    // ============ State حذف اعتراض ============
    const [deleteDisputeModal, setDeleteDisputeModal] = useState({
        isOpen: false,
        isLoading: false,
        dispute: null,
    });
    // ============================================
    // State
    // ============================================
    const [disputeModal, setDisputeModal] = useState({
        isOpen: false,
        isLoading: false,
        disputeType: "",
        reason: "",
        attachments: [],
        errors: {},
    });
    const config = statusConfig[dispute.status] ?? statusConfig.pending;
    const StatusIcon = config.icon;

    // ============ State پاسخ ============
    const [response, setResponse] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    // ============ افزودن فایل ============
    const handleFilesChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        const allowedExtensions = /\.(jpe?g|png|pdf|docx?|mp4)$/i;

        const remaining = Math.max(0, 5 - attachments.length);
        const validFiles = [];
        const errors = [];

        for (const file of selectedFiles) {
            if (attachments.length + validFiles.length >= 5) {
                errors.push("حداکثر ۵ فایل می‌توانید انتخاب کنید.");
                break;
            }

            if (file.size > 5 * 1024 * 1024) {
                errors.push(`حجم فایل «${file.name}» بیشتر از ۵ مگابایت است.`);
                continue;
            }

            if (!allowedExtensions.test(file.name)) {
                errors.push(`فرمت فایل «${file.name}» مجاز نیست.`);
                continue;
            }

            validFiles.push(file);
        }

        if (remaining === 0 && selectedFiles.length > 0) {
            errors.push("حداکثر ۵ فایل می‌توانید انتخاب کنید.");
        }

        if (validFiles.length > 0) {
            setAttachments((prev) => [...prev, ...validFiles]);
        }

        if (errors.length > 0) {
            window.alert(errors.join("\n"));
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // ============ حذف فایل ============
    const removeAttachment = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    // ============ ارسال پاسخ ============
    const handleRespond = (e) => {
        e.preventDefault();

        if (response.trim().length < 10) return;

        setIsSubmitting(true);

        router.post(
            `/barber/disputes/${dispute.id}/respond`,
            {
                response: response.trim(),
                attachments: attachments,
            },
            {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    setResponse("");
                    setAttachments([]);
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };
    const [remainingSeconds, setRemainingSeconds] = useState(() =>
        Math.max(
            0,
            Math.ceil(Number(dispute.edit_hours_remaining || 0) * 3600),
        ),
    );

    // همگام‌سازی با مقدار دریافتی از سرور
    useEffect(() => {
        setRemainingSeconds(
            Math.max(
                0,
                Math.ceil(Number(dispute.edit_hours_remaining || 0) * 3600),
            ),
        );
    }, [dispute.edit_hours_remaining]);

    // شمارش معکوس هر ثانیه
    useEffect(() => {
        if (remainingSeconds <= 0) return;

        const timer = setTimeout(() => {
            setRemainingSeconds((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearTimeout(timer);
    }, [remainingSeconds]);

    // تبدیل ثانیه به ساعت، دقیقه و ثانیه
    const formatCountdown = (seconds) => {
        const safeSeconds = Math.max(0, seconds);
        const hours = Math.floor(safeSeconds / 3600);
        const minutes = Math.floor((safeSeconds % 3600) / 60);
        const secs = safeSeconds % 60;

        return [hours, minutes, secs]
            .map((value) => String(value).padStart(2, "0"))
            .map((value) => toPersianNumber(value))
            .join(":");
    };

    const handleDeleteDispute = () => {
        if (!deleteDisputeModal.dispute) return;

        setDeleteDisputeModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(
            `/barber/disputes/${deleteDisputeModal.dispute.id}/destroy?from_disputes_list=true`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteDisputeModal({
                        isOpen: false,
                        isLoading: false,
                        dispute: null,
                    });
                },
                onError: () => {
                    setDeleteDisputeModal((prev) => ({
                        ...prev,
                        isLoading: false,
                    }));
                },
            },
        );
    };
    // attachments handle
    const handleRemoveAttachment = (index) => {
        setDisputeModal((prev) => {
            const newAttachments = [...prev.attachments];
            if (newAttachments[index]?.preview) {
                URL.revokeObjectURL(newAttachments[index].preview);
            }
            newAttachments.splice(index, 1);
            return { ...prev, attachments: newAttachments };
        });
    };

    // ============ انتخاب فایل ============
    const handleResponseAttachmentChange = (e) => {
        const files = Array.from(e.target.files);
        const totalFiles = responseModal.attachments.length + files.length;

        if (totalFiles > 5) {
            setResponseModal((prev) => ({
                ...prev,
                errors: {
                    ...prev.errors,
                    attachments: "حداکثر ۵ فایل می‌توانید آپلود کنید.",
                },
            }));
            e.target.value = "";
            return;
        }

        const validFiles = [];
        const fileErrors = [];

        for (const file of files) {
            if (file.size > 2 * 1024 * 1024) {
                fileErrors.push(`«${file.name}» بیش از ۲ مگابایت است`);
                continue;
            }
            if (!file.type.startsWith("image/")) {
                fileErrors.push(`«${file.name}» تصویر نیست`);
                continue;
            }
            validFiles.push(file);
        }

        const newAttachments = validFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setResponseModal((prev) => ({
            ...prev,
            attachments: [...prev.attachments, ...newAttachments],
            errors: {
                ...prev.errors,
                attachments:
                    fileErrors.length > 0
                        ? "⚠️ " + fileErrors.join(" • ")
                        : null,
            },
        }));

        e.target.value = "";
    };

    // ============ حذف پیوست ============
    const handleRemoveResponseAttachment = (index) => {
        setResponseModal((prev) => {
            const newAttachments = [...prev.attachments];
            if (newAttachments[index]?.preview) {
                URL.revokeObjectURL(newAttachments[index].preview);
            }
            newAttachments.splice(index, 1);
            return { ...prev, attachments: newAttachments };
        });
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
                                {dispute.status_label}
                            </span>
                            <span className="dispute-show-hero-id">
                                <Hash size={12} />
                                اعتراض #{toPersianNumber(dispute.id)}
                            </span>
                            {dispute.can_respond && (
                                <span className="dispute-show-hero-urgent">
                                    <AlertCircle size={12} />
                                    نیاز به پاسخ شما
                                </span>
                            )}
                            {dispute.edited_at && (
                                <span className="dispute-show-hero-edited">
                                    <Edit3 size={12} />
                                    ویرایش شده (
                                    {toPersianNumber(dispute.edit_count)} بار)
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

                {/* درخواست توضیحات و مدارک بیشتر از طرف ادمین */}
                {dispute.can_respond && (
                    <div className="dispute-deadline-card dispute-response-required">
                        {/* هدر درخواست */}
                        <div className="dispute-deadline-header">
                            <div className="dispute-deadline-icon">
                                <MessageSquare size={24} />
                            </div>

                            <div className="dispute-deadline-content">
                                <h3>
                                    ادمین به توضیحات و مدارک بیشتر نیاز دارد
                                </h3>
                                <p>
                                    برای ادامه بررسی اعتراض، لازم است توضیحات
                                    تکمیلی خود را ارسال کنید. در صورت نیاز،
                                    مدارک و تصاویر مرتبط را نیز ضمیمه کنید.
                                </p>
                            </div>

                            <div className="dispute-response-badge">
                                <AlertCircle size={15} />
                                نیاز به پاسخ
                            </div>
                        </div>

                        {/* جداکننده */}
                        <div className="dispute-deadline-divider" />

                        {/* راهنمای اقدام */}
                        <div className="dispute-deadline-footer">
                            <div className="dispute-deadline-footer-title">
                                <Paperclip size={17} />
                                <span>اقدام موردنیاز شما</span>
                            </div>

                            <div className="dispute-response-actions">
                                <span className="dispute-response-hint">
                                    لطفاً به بخش پاسخ مراجعه کرده و اطلاعات
                                    تکمیلی را ارسال کنید.
                                </span>

                                <button
                                    type="button"
                                    className="dispute-response-btn"
                                    onClick={() => {
                                        document
                                            .getElementById(
                                                "dispute-response-form",
                                            )
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "center",
                                            });
                                    }}
                                >
                                    <Send size={15} />
                                    ارسال توضیحات و مدارک
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* edit delete */}
                {(dispute.can_edit || dispute.can_delete) &&
                    remainingSeconds > 0 && (
                        <div className="dispute-deadline-card">
                            {/* بخش هشدار و شمارش معکوس */}
                            <div className="dispute-deadline-header">
                                <div className="dispute-deadline-icon">
                                    <Timer size={24} />
                                </div>

                                <div className="dispute-deadline-content">
                                    <h3>مهلت ویرایش و حذف اعتراض</h3>
                                    <p>
                                        پس از پایان زمان، امکان انجام عملیات
                                        مجاز روی این اعتراض از بین می‌رود.
                                    </p>
                                </div>

                                <div className="dispute-deadline-timer">
                                    <span>زمان باقی‌مانده</span>
                                    <strong dir="ltr">
                                        {formatCountdown(remainingSeconds)}
                                    </strong>
                                </div>
                            </div>

                            {/* جداکننده */}
                            <div className="dispute-deadline-divider" />

                            {/* بخش عملیات */}
                            <div className="dispute-deadline-footer">
                                <div className="dispute-deadline-footer-title">
                                    <Edit3 size={17} />
                                    <span>عملیات اعتراض</span>
                                </div>

                                <div className="dispute-show-edit-actions">
                                    {dispute.can_edit && (
                                        <Link
                                            href={`/barber/disputes/${dispute.id}/edit`}
                                            className="dispute-show-edit-btn"
                                        >
                                            <Edit3 size={14} />
                                            ویرایش اعتراض
                                        </Link>
                                    )}

                                    {dispute.can_delete && (
                                        <button
                                            type="button"
                                            className="dispute-show-delete-btn"
                                            onClick={() =>
                                                setDeleteDisputeModal({
                                                    isOpen: true,
                                                    isLoading: false,
                                                    dispute: dispute,
                                                })
                                            }
                                        >
                                            <Trash2 size={14} />
                                            حذف اعتراض
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

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

                            {/* اطلاعات */}
                            <div className="dispute-show-meta-grid">
                                <div className="dispute-show-meta-item">
                                    <span className="dispute-show-meta-label">
                                        <User size={12} />
                                        معترض
                                    </span>
                                    <span className="dispute-show-meta-value">
                                        {dispute.disputed_by_user?.name ?? "—"}
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
                                {dispute.edited_at && (
                                    <div className="dispute-show-meta-item">
                                        <span className="dispute-show-meta-label">
                                            <Edit3 size={12} />
                                            آخرین ویرایش
                                        </span>
                                        <span className="dispute-show-meta-value">
                                            {formatFullDateTime(
                                                dispute.edited_at,
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* پیوست‌های اعتراض */}
                            {dispute.attachments?.length > 0 && (
                                <div className="dispute-show-attachments-section">
                                    <div className="dispute-show-attachments-label">
                                        <Paperclip size={12} />
                                        پیوست‌های اعتراض (
                                        {toPersianNumber(
                                            dispute.attachments.length,
                                        )}
                                        )
                                    </div>
                                    <div className="dispute-show-attachments-list">
                                        {dispute.attachments.map((att, i) => (
                                            <a
                                                key={i}
                                                href={att.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="dispute-show-attachment"
                                            >
                                                <ImageIcon size={16} />
                                                <span>{att.name}</span>
                                                <Download size={12} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                                        <strong>پاسخ</strong>
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

                        {/* نتیجه */}
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
                        {dispute.attachments?.length > 0 && (
                            <div className="dispute-show-card">
                                <div className="dispute-show-card-header">
                                    <div className="dispute-show-card-icon info">
                                        <Paperclip size={20} />
                                    </div>
                                    <h2>
                                        مدارک پیوست پاسخ (
                                        {toPersianNumber(
                                            dispute.attachments.length,
                                        )}
                                        )
                                    </h2>
                                </div>

                                <div className="dispute-show-attachments-list">
                                    {dispute.attachments.map((att, index) => (
                                        <a
                                            key={att.path ?? index}
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="dispute-show-attachment"
                                        >
                                            <FileText size={16} />
                                            <span>
                                                {att.name ?? "فایل پیوست"}
                                            </span>
                                            <Download size={12} />
                                        </a>
                                    ))}
                                </div>
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
                                    ادمین از شما درخواست مدارک یا توضیح کرده
                                    است. لطفاً با دقت پاسخ دهید و در صورت نیاز،
                                    مدارک را ضمیمه کنید.
                                </p>

                                <form onSubmit={handleRespond}>
                                    {/* متن پاسخ */}
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

                                    <div className="dispute-show-respond-counter-row">
                                        <span className="dispute-show-respond-counter">
                                            {toPersianNumber(response.length)} /
                                            ۲۰۰۰
                                        </span>
                                        {response.trim().length < 10 &&
                                            response.length > 0 && (
                                                <span className="dispute-show-respond-error">
                                                    حداقل ۱۰ کاراکتر
                                                </span>
                                            )}
                                    </div>

                                    {/* آپلود پیوست */}
                                    <div className="dispute-show-attachments-section">
                                        <label className="dispute-show-attachments-label">
                                            <Paperclip size={14} />
                                            مدارک (اختیاری)
                                            <span className="dispute-show-attachments-hint">
                                                حداکثر ۵ فایل — JPG, PNG, PDF,
                                                DOC, MP4 — هر فایل ۵MB
                                            </span>
                                        </label>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFilesChange}
                                            accept="image/*,application/pdf,.doc,.docx,video/mp4"
                                            multiple
                                            hidden
                                            disabled={isSubmitting}
                                        />

                                        <button
                                            type="button"
                                            className="dispute-show-attachments-add-btn"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            disabled={
                                                isSubmitting ||
                                                attachments.length >= 5
                                            }
                                        >
                                            <Plus size={14} />
                                            افزودن فایل (
                                            {toPersianNumber(
                                                attachments.length,
                                            )}{" "}
                                            از ۵)
                                        </button>

                                        {/* پیش‌نمایش */}
                                        {attachments.length > 0 && (
                                            <div className="dispute-show-attachments-list">
                                                {attachments.map(
                                                    (file, index) => (
                                                        <div
                                                            key={index}
                                                            className="dispute-show-attachment-item"
                                                        >
                                                            <div className="dispute-show-attachment-icon">
                                                                {file.type.startsWith(
                                                                    "image/",
                                                                ) ? (
                                                                    <ImageIcon
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <FileText
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="dispute-show-attachment-info">
                                                                <span className="dispute-show-attachment-name">
                                                                    {file.name}
                                                                </span>
                                                                <span className="dispute-show-attachment-size">
                                                                    {formatFileSize(
                                                                        file.size,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="dispute-show-attachment-remove"
                                                                onClick={() =>
                                                                    removeAttachment(
                                                                        index,
                                                                    )
                                                                }
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* دکمه ارسال */}
                                    <div className="dispute-show-respond-footer">
                                        <div></div>
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
                                                    {attachments.length > 0 && (
                                                        <span className="dispute-show-respond-badge">
                                                            {toPersianNumber(
                                                                attachments.length,
                                                            )}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* ============ ستون چپ ============ */}
                    <div className="dispute-show-sidebar">
                        {/* معترض */}
                        {dispute.disputed_by_user && (
                            <div className="dispute-show-card">
                                <div className="dispute-show-card-header">
                                    <div className="dispute-show-card-icon blue">
                                        <User size={20} />
                                    </div>
                                    <h2>معترض</h2>
                                </div>
                                {}

                                <div className="dispute-show-person">
                                    <div className="dispute-show-person-avatar customer">
                                        {dispute.disputed_by_user.avatar ? (
                                            <img
                                                src={
                                                    dispute.disputed_by_user
                                                        .avatar
                                                }
                                                alt={
                                                    dispute.disputed_by_user
                                                        .name ?? "معترض"
                                                }
                                                loading="lazy"
                                            />
                                        ) : (
                                            dispute.disputed_by_user.name
                                                ?.charAt(0)
                                                .toUpperCase() || "؟"
                                        )}
                                    </div>
                                    <div className="dispute-show-person-info">
                                        <span className="dispute-show-person-name">
                                            {dispute.disputed_by_user.name}
                                        </span>
                                        <span className="dispute-show-person-role">
                                            <UserCheck size={11} />
                                            {dispute.disputed_by === "customer"
                                                ? "مشتری"
                                                : "آرایشگر"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* وضعیت */}
                        <div className="dispute-show-card">
                            <div className="dispute-show-card-header">
                                <div className="dispute-show-card-icon gray">
                                    <Info size={20} />
                                </div>
                                <h2>وضعیت پرونده</h2>
                            </div>

                            <div className="dispute-show-status-list">
                                <div className="dispute-show-status-item">
                                    <span className="dispute-show-status-label">
                                        وضعیت
                                    </span>
                                    <span
                                        className="dispute-show-status-value"
                                        style={{
                                            color: config.color,
                                            background: config.bg,
                                        }}
                                    >
                                        <StatusIcon size={10} />
                                        {dispute.status_label}
                                    </span>
                                </div>
                                <div className="dispute-show-status-item">
                                    <span className="dispute-show-status-label">
                                        تاریخ ثبت
                                    </span>
                                    <span className="dispute-show-status-value plain">
                                        {formatFullDateWithoutTime(
                                            dispute.created_at,
                                        )}
                                    </span>
                                </div>
                                {dispute.responded_at && (
                                    <div className="dispute-show-status-item">
                                        <span className="dispute-show-status-label">
                                            تاریخ پاسخ
                                        </span>
                                        <span className="dispute-show-status-value plain">
                                            {formatFullDateWithoutTime(
                                                dispute.responded_at,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {dispute.resolved_at && (
                                    <div className="dispute-show-status-item">
                                        <span className="dispute-show-status-label">
                                            تاریخ حل
                                        </span>
                                        <span className="dispute-show-status-value plain">
                                            {formatFullDateWithoutTime(
                                                dispute.resolved_at,
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* اطلاعات رزرو */}
                        {dispute.booking && (
                            <div className="dispute-show-card">
                                <div className="dispute-show-card-header">
                                    <div className="dispute-show-card-icon green">
                                        <Calendar size={20} />
                                    </div>
                                    <h2>رزرو مرتبط</h2>
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
                                            مبلغ
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

            <ConfirmModal
                isOpen={deleteDisputeModal.isOpen}
                onClose={() =>
                    !deleteDisputeModal.isLoading &&
                    setDeleteDisputeModal({
                        isOpen: false,
                        isLoading: false,
                        dispute: null,
                    })
                }
                onConfirm={handleDeleteDispute}
                title="حذف اعتراض"
                message={
                    deleteDisputeModal.dispute
                        ? `آیا از حذف اعتراض خود مطمئن هستید؟ این عملیات قابل بازگشت نیست و اعتراض شما به طور کامل از سیستم حذف می‌شود.`
                        : ""
                }
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                type="danger"
                isLoading={deleteDisputeModal.isLoading}
            />
        </Layout>
    );
}
