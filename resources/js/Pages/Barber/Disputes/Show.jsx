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
    Bot,
    Upload,
    LoaderCircle,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import {
    formatFullDateTime,
    formatFullDateWithoutTime,
} from "../../../utils/dateHelpers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";
import {
    getDisputeTypesByRole,
    getDisputeTypeConfig,
} from "../../../Constants/disputeTypes";
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

export default function BarberDisputeShow({ dispute, auth }) {
    const isMyDispute = dispute?.disputed_by_user_id === auth.user.id;
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

    const [responseModal, setResponseModal] = useState({
        isOpen: false,
        isLoading: false,
        dispute: null,
        response: "",
        attachments: [],
        errors: {},
    });
    const openResponseModal = (dispute) => {
        setResponseModal({
            isOpen: true,
            isLoading: false,
            dispute,
            response: "",
            attachments: [],
            errors: {},
        });
    };

    // ============ بستن مدال ============
    const closeResponseModal = () => {
        // آزادسازی preview ها
        responseModal.attachments?.forEach((att) => {
            if (att.preview) URL.revokeObjectURL(att.preview);
        });

        setResponseModal({
            isOpen: false,
            isLoading: false,
            dispute: null,
            response: "",
            attachments: [],
            errors: {},
        });
    };

    // ============ انتخاب فایل ============
    // const handleResponseAttachmentChange = (e) => {
    //     const files = Array.from(e.target.files);
    //     const totalFiles = responseModal.attachments.length + files.length;

    //     if (totalFiles > 5) {
    //         setResponseModal((prev) => ({
    //             ...prev,
    //             errors: {
    //                 ...prev.errors,
    //                 attachments: "حداکثر ۵ فایل می‌توانید آپلود کنید.",
    //             },
    //         }));
    //         e.target.value = "";
    //         return;
    //     }

    //     const validFiles = [];
    //     const fileErrors = [];

    //     for (const file of files) {
    //         if (file.size > 2 * 1024 * 1024) {
    //             fileErrors.push(`«${file.name}» بیش از ۲ مگابایت است`);
    //             continue;
    //         }
    //         if (!file.type.startsWith("image/")) {
    //             fileErrors.push(`«${file.name}» تصویر نیست`);
    //             continue;
    //         }
    //         validFiles.push(file);
    //     }

    //     const newAttachments = validFiles.map((file) => ({
    //         file,
    //         preview: URL.createObjectURL(file),
    //     }));

    //     setResponseModal((prev) => ({
    //         ...prev,
    //         attachments: [...prev.attachments, ...newAttachments],
    //         errors: {
    //             ...prev.errors,
    //             attachments:
    //                 fileErrors.length > 0
    //                     ? "⚠️ " + fileErrors.join(" • ")
    //                     : null,
    //         },
    //     }));

    //     e.target.value = "";
    // };

    // ============ حذف پیوست ============
    // const handleRemoveResponseAttachment = (index) => {
    //     setResponseModal((prev) => {
    //         const newAttachments = [...prev.attachments];
    //         if (newAttachments[index]?.preview) {
    //             URL.revokeObjectURL(newAttachments[index].preview);
    //         }
    //         newAttachments.splice(index, 1);
    //         return { ...prev, attachments: newAttachments };
    //     });
    // };

    // ============ اعتبارسنجی ============
    const validateResponse = (response) => {
        const errors = {};
        const trimmed = response.trim();

        if (!trimmed) {
            errors.response = "لطفاً متن پاسخ را وارد کنید.";
        } else if (trimmed.length < 10) {
            errors.response = "پاسخ باید حداقل ۱۰ کاراکتر باشد.";
        } else if (trimmed.length > 1000) {
            errors.response = "پاسخ نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد.";
        }

        return errors;
    };

    // ============ ارسال پاسخ ============
    const handleSubmitResponse = () => {
        const response = responseModal.response.trim();
        const clientErrors = validateResponse(response);

        if (Object.keys(clientErrors).length > 0) {
            setResponseModal((prev) => ({ ...prev, errors: clientErrors }));
            return;
        }

        setResponseModal((prev) => ({ ...prev, isLoading: true, errors: {} }));

        const formData = new FormData();
        formData.append("response", response);
        responseModal.attachments.forEach((att, index) => {
            formData.append(`attachments[${index}]`, att.file);
        });

        router.post(
            `/barber/disputes/${responseModal.dispute.id}/respond`,
            formData,
            {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    responseModal.attachments.forEach((att) => {
                        if (att.preview) URL.revokeObjectURL(att.preview);
                    });
                    closeResponseModal();
                },
                onError: (errors) => {
                    setResponseModal((prev) => ({
                        ...prev,
                        isLoading: false,
                        errors,
                    }));
                },
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
                {/* dispute.can_respond && */}
                {/* ============ بنر وضعیت اعتراض ============ */}
                {dispute.disputed_by === "barber" && (
                    <div
                        className={`customer-dispute-banner status-${dispute.status}`}
                    >
                        <div className="dispute-banner-icon">
                            {dispute.status === "pending" && (
                                <Clock4 size={24} />
                            )}
                            {dispute.status === "investigating" && (
                                <LoaderCircle size={24} />
                            )}
                            {dispute.status === "awaiting_response" && (
                                <MessageSquare size={24} />
                            )}
                            {dispute.status === "resolved" && (
                                <CheckCircle size={24} />
                            )}
                            {dispute.status === "rejected" && (
                                <XCircle size={24} />
                            )}
                            {dispute.status === "cancelled" && (
                                <Ban size={24} />
                            )}
                        </div>

                        <div className="dispute-banner-content">
                            <div className="dispute-banner-header">
                                <h3>
                                    {dispute.status === "pending" &&
                                        "اعتراض شما در صف بررسی"}
                                    {dispute.status === "investigating" &&
                                        "اعتراض شما در حال بررسی"}
                                    {dispute.status === "awaiting_response" &&
                                        "در انتظار پاسخ شما"}
                                    {dispute.status === "resolved" &&
                                        "اعتراض شما تایید شد"}
                                    {dispute.status === "rejected" &&
                                        "اعتراض شما رد شد"}
                                    {dispute.status === "cancelled" &&
                                        "اعتراض شما لغو شد"}
                                </h3>

                                <span className="dispute-banner-date">
                                    ثبت:{" "}
                                    {formatFullDateTime(dispute.created_at)}
                                </span>
                            </div>

                            <p className="dispute-banner-message">
                                {dispute.status === "pending" &&
                                    (isMyDispute
                                        ? "اعتراض شما ثبت شده و در انتظار بررسی ادمین است. ادمین تا ۴۸ ساعت آینده بررسی خواهد کرد."
                                        : "مشتری از شما اعتراض کرده است. ادمین در حال بررسی است. لطفاً منتظر بمانید.")}

                                {dispute.status === "investigating" &&
                                    (isMyDispute
                                        ? "ادمین در حال بررسی اعتراض شماست. لطفاً منتظر بمانید."
                                        : "ادمین در حال بررسی اعتراض مشتری علیه شماست. لطفاً منتظر بمانید.")}

                                {dispute.status === "awaiting_response" &&
                                    (isMyDispute
                                        ? "ادمین نیاز به اطلاعات بیشتری دارد. لطفاً پاسخ خود را ثبت کنید."
                                        : "ادمین نیاز به اطلاعات بیشتری درباره اعتراض مشتری دارد. لطفاً پاسخ خود را ثبت کنید.")}

                                {dispute.status === "resolved" &&
                                    (isMyDispute
                                        ? "اعتراض شما تایید شد."
                                        : "اعتراض مشتری تایید شد.")}

                                {dispute.status === "rejected" &&
                                    (isMyDispute
                                        ? "پس از بررسی، اعتراض شما رد شد. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید."
                                        : "پس از بررسی، اعتراض مشتری رد شد. رزرو در وضعیت تکمیل باقی می‌ماند.")}

                                {dispute.status === "cancelled" &&
                                    (isMyDispute
                                        ? "اعتراض شما لغو شده است."
                                        : "اعتراض مشتری لغو شده است.")}
                            </p>
                            {dispute.admin_request_message && (
                                <div
                                    className={`dispute-admin-message ${
                                        dispute.status === "awaiting_response"
                                            ? "is-action-required"
                                            : ""
                                    }`}
                                >
                                    <div className="dispute-admin-message-header">
                                        <div className="dispute-admin-message-icon">
                                            <MessageSquare size={20} />
                                        </div>

                                        <div className="dispute-admin-message-title">
                                            <strong>پیام مدیریت به شما</strong>

                                            <span>
                                                {dispute.status ===
                                                "awaiting_response"
                                                    ? "اقدام شما لازم است"
                                                    : "اطلاع‌رسانی مدیریت"}
                                            </span>
                                        </div>

                                        {dispute.status ===
                                            "awaiting_response" && (
                                            <span className="dispute-admin-message-badge">
                                                <AlertCircle size={14} />
                                                نیازمند پاسخ
                                            </span>
                                        )}
                                    </div>

                                    <div className="dispute-admin-message-body">
                                        {dispute.admin_request_message}
                                    </div>

                                    {dispute.status === "awaiting_response" && (
                                        <div className="dispute-admin-message-footer">
                                            <Info size={16} />
                                            <span>
                                                لطفاً پیام مدیریت را با دقت
                                                مطالعه کرده و پاسخ یا مدارک
                                                درخواستی را از طریق بخش ثبت پاسخ
                                                ارسال کنید.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* ============ جزئیات اعتراض ============ */}
                            <div className="dispute-banner-details">
                                <div className="detail-item">
                                    <span className="detail-label">
                                        متن اعتراض:
                                    </span>
                                    <span className="detail-value">
                                        {dispute.reason}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">
                                        نوع اعتراض:
                                    </span>
                                    <span className="detail-value">
                                        {
                                            getDisputeTypeConfig(
                                                dispute.dispute_type,
                                            )["label"]
                                        }
                                    </span>
                                </div>

                                {dispute.refund_amount > 0 && (
                                    <div className="detail-item success">
                                        <span className="detail-label">
                                            مبلغ بازگشتی:
                                        </span>
                                        <span className="detail-value">
                                            {toPersianNumber(
                                                dispute.refund_amount.toLocaleString(),
                                            )}{" "}
                                            تومان
                                        </span>
                                    </div>
                                )}
                                {dispute.penalty_amount > 0 && (
                                    <div className="detail-item penalty">
                                        <span className="detail-label">
                                            جریمه آرایشگر:
                                        </span>
                                        <span className="detail-value">
                                            {toPersianNumber(
                                                dispute.penalty_amount.toLocaleString(),
                                            )}{" "}
                                            تومان
                                        </span>
                                    </div>
                                )}
                                {dispute.resolution && (
                                    <div className="detail-item resolution">
                                        <span className="detail-label">
                                            پاسخ ادمین:
                                        </span>
                                        <span className="detail-value">
                                            {dispute.resolution}
                                        </span>
                                    </div>
                                )}
                                {dispute.response && (
                                    <div className="detail-item response">
                                        <span className="detail-label">
                                            پاسخ شما:
                                        </span>
                                        <span className="detail-value">
                                            {dispute.response}
                                        </span>
                                    </div>
                                )}
                                {/* ============ پیوست‌ها ============ */}
                                {dispute.attachments &&
                                    dispute.attachments.length > 0 && (
                                        <div className="detail-item attachments">
                                            <span className="detail-label">
                                                <Paperclip size={12} />
                                                پیوست‌ها:
                                            </span>
                                            <div className="dispute-attachments-mini-grid">
                                                {dispute.attachments.map(
                                                    (att, index) => (
                                                        <a
                                                            key={index}
                                                            href={att.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="dispute-attachment-mini"
                                                            title={att.name}
                                                        >
                                                            <img
                                                                src={att.url}
                                                                alt={`پیوست ${
                                                                    index + 1
                                                                }`}
                                                            />
                                                            <div className="attachment-mini-overlay">
                                                                <Eye
                                                                    size={14}
                                                                />
                                                            </div>
                                                        </a>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>

                            {/* ============ اطلاعات اضافی ============ */}
                            {dispute.status === "pending" && (
                                <div className="dispute-banner-info">
                                    <Info size={14} />
                                    <span>
                                        می‌توانید تا زمان بررسی، اطلاعات بیشتری
                                        ارسال کنید.
                                    </span>
                                </div>
                            )}

                            {dispute.status === "awaiting_response" && (
                                <div className="dispute-banner-warning">
                                    <AlertCircle size={14} />
                                    <span>
                                        لطفاً پاسخ خود را در اسرع وقت ثبت کنید.
                                    </span>
                                </div>
                            )}

                            {/* ============ نمایش تعداد اعتراضات ============ */}
                            {/* {booking.disputes_count > 1 && (
                                <div className="dispute-banner-info">
                                    <Info size={14} />
                                    <span>
                                        این رزرو{" "}
                                        {toPersianNumber(
                                            booking.disputes_count,
                                        )}{" "}
                                        اعتراض دارد.
                                    </span>
                                </div>
                            )} */}

                            {/* ============ دکمه‌های عملیات اعتراض ============ */}
                            <div className="dispute-banner-actions">
                                {/* ویرایش */}
                                {dispute.can_edit && (
                                    <Link
                                        href={`/barber/disputes/${dispute.id}/edit`}
                                        className="dispute-action-btn edit"
                                        title="ویرایش اعتراض"
                                    >
                                        <Edit3 size={14} />
                                        <span>ویرایش</span>
                                        {/* {dispute
                                                .edit_hours_remaining && (
                                                <span className="time-remaining">
                                                    {toPersianNumber(
                                                        dispute
                                                            .edit_hours_remaining,
                                                    )}{" "}
                                                    ساعت
                                                </span>
                                            )} */}
                                    </Link>
                                )}

                                {/* حذف */}
                                {dispute.can_delete && (
                                    <button
                                        type="button"
                                        className="dispute-action-btn delete"
                                        onClick={() =>
                                            setDeleteDisputeModal({
                                                isOpen: true,
                                                isLoading: false,
                                                dispute: dispute,
                                            })
                                        }
                                        title="حذف اعتراض"
                                    >
                                        <Trash2 size={14} />
                                        <span>حذف</span>
                                    </button>
                                )}

                                {/* پاسخ */}
                                {dispute.can_respond && (
                                    <button
                                        type="button"
                                        className="dispute-action-btn respond"
                                        onClick={() =>
                                            openResponseModal(dispute)
                                        }
                                        title="ثبت پاسخ"
                                    >
                                        <MessageSquare size={14} />
                                        <span>ثبت پاسخ</span>
                                    </button>
                                )}

                                {/* مشاهده جزئیات */}
                                {/* <button
                                        type="button"
                                        className="dispute-action-btn view"
                                        onClick={() =>
                                            setDetailsModal({
                                                isOpen: true,
                                                dispute: dispute,
                                            })
                                        }
                                        title="مشاهده جزئیات"
                                    >
                                        <Eye size={14} />
                                        <span>جزئیات</span>
                                    </button> */}
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

            {/* مدال پاسخ به اعتراض از ادمین */}
            {responseModal.isOpen && responseModal.dispute && (
                <div
                    className="response-modal-overlay"
                    onClick={() =>
                        !responseModal.isLoading && closeResponseModal()
                    }
                >
                    <div
                        className="response-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ============ هدر ============ */}
                        <div className="response-modal-header">
                            <div className="response-modal-icon">
                                <MessageSquare size={28} />
                            </div>
                            <h3>پاسخ به درخواست ادمین</h3>
                            <button
                                type="button"
                                className="response-modal-close"
                                onClick={closeResponseModal}
                                disabled={responseModal.isLoading}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* ============ هشدار ============ */}
                        <div className="response-modal-warning">
                            <AlertCircle size={16} />
                            <p>
                                ادمین برای بررسی دقیق‌تر اعتراض، نیاز به اطلاعات
                                بیشتری دارد. لطفاً پاسخ خود را کامل و دقیق وارد
                                کنید.
                            </p>
                        </div>

                        {/* ============ پیام ادمین ============ */}
                        {responseModal.dispute.admin_request_message && (
                            <div className="admin-request-box">
                                <div className="admin-request-header">
                                    <Bot size={16} />
                                    <span>درخواست ادمین:</span>
                                </div>
                                <p>
                                    {
                                        responseModal.dispute
                                            .admin_request_message
                                    }
                                </p>
                                {responseModal.dispute.admin_request_at && (
                                    <span className="admin-request-date">
                                        {formatFullDateTime(
                                            responseModal.dispute
                                                .admin_request_at,
                                        )}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* ============ متن اعتراض (خلاصه) ============ */}
                        <div className="response-modal-info">
                            <div className="info-row">
                                <span>نوع اعتراض:</span>
                                <strong>
                                    {getDisputeTypeConfig(
                                        responseModal.dispute.dispute_type,
                                    )?.label || "-"}
                                </strong>
                            </div>
                            <div className="info-row">
                                <span>اعتراض‌کننده:</span>
                                <strong>
                                    {responseModal.dispute.disputed_by ===
                                    "customer"
                                        ? "مشتری"
                                        : "آرایشگر"}
                                </strong>
                            </div>
                            <div className="info-row">
                                <span>کد اعتراض:</span>
                                <strong dir="ltr">
                                    #{toPersianNumber(responseModal.dispute.id)}
                                </strong>
                            </div>
                        </div>

                        {/* ============ فیلد پاسخ ============ */}
                        <div className="response-form-group">
                            <label className="form-label">
                                پاسخ شما
                                <span className="required">*</span>
                            </label>
                            <textarea
                                className={`form-textarea ${
                                    responseModal.errors.response ? "error" : ""
                                }`}
                                value={responseModal.response}
                                onChange={(e) =>
                                    setResponseModal((prev) => ({
                                        ...prev,
                                        response: e.target.value,
                                        errors: {
                                            ...prev.errors,
                                            response: undefined,
                                        },
                                    }))
                                }
                                placeholder="لطفاً پاسخ خود را با جزئیات بنویسید..."
                                rows={5}
                                maxLength={1000}
                                disabled={responseModal.isLoading}
                            />
                            <div className="form-footer">
                                {responseModal.errors.response ? (
                                    <span className="form-error">
                                        <AlertCircle size={12} />
                                        {responseModal.errors.response}
                                    </span>
                                ) : (
                                    <span className="form-hint">
                                        حداقل ۱۰ و حداکثر ۱۰۰۰ کاراکتر
                                    </span>
                                )}
                                <span className="form-counter" dir="ltr">
                                    {toPersianNumber(
                                        responseModal.response.length,
                                    )}{" "}
                                    / ۱۰۰۰
                                </span>
                            </div>
                        </div>

                        {/* ============ پیوست‌ها ============ */}
                        <div className="response-form-group">
                            <label className="form-label">
                                <Paperclip size={14} />
                                پیوست (اختیاری)
                            </label>

                            <div className="response-attachments">
                                {responseModal.attachments.length > 0 && (
                                    <div className="attachments-preview">
                                        {responseModal.attachments.map(
                                            (att, index) => (
                                                <div
                                                    key={index}
                                                    className="attachment-item"
                                                >
                                                    <img
                                                        src={att.preview}
                                                        alt={att.file.name}
                                                        className="attachment-image"
                                                    />
                                                    <div className="attachment-info">
                                                        <span className="attachment-name">
                                                            {att.file.name}
                                                        </span>
                                                        <span className="attachment-size">
                                                            {(
                                                                att.file.size /
                                                                1024
                                                            ).toFixed(1)}{" "}
                                                            KB
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="attachment-remove"
                                                        onClick={() =>
                                                            handleRemoveResponseAttachment(
                                                                index,
                                                            )
                                                        }
                                                        disabled={
                                                            responseModal.isLoading
                                                        }
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}

                                {responseModal.attachments.length < 5 && (
                                    <label className="attachment-upload-btn">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={
                                                handleResponseAttachmentChange
                                            }
                                            disabled={responseModal.isLoading}
                                            style={{ display: "none" }}
                                        />
                                        <Upload size={18} />
                                        <span>افزودن عکس</span>
                                        <span className="upload-count">
                                            {toPersianNumber(
                                                responseModal.attachments
                                                    .length,
                                            )}{" "}
                                            / ۵
                                        </span>
                                    </label>
                                )}
                            </div>

                            {responseModal.errors.attachments && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>
                                        {responseModal.errors.attachments}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* ============ دکمه‌ها ============ */}
                        <div className="response-modal-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={closeResponseModal}
                                disabled={responseModal.isLoading}
                            >
                                انصراف
                            </button>
                            <button
                                type="button"
                                className="btn-confirm"
                                onClick={handleSubmitResponse}
                                disabled={
                                    responseModal.isLoading ||
                                    !responseModal.response.trim()
                                }
                            >
                                {responseModal.isLoading ? (
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
                    </div>
                </div>
            )}
        </Layout>
    );
}
