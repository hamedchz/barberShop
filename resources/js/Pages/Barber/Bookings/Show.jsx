import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import ConfirmModal from "../../Admin/Components/ConfirmModal";
import RatingStars from "../../Customer/Components/RatingStars";
import "../Assets/css/BarberBookingShow.css";
import {
    ArrowRight,
    Calendar,
    Clock,
    Scissors,
    DollarSign,
    User,
    Phone,
    Mail,
    CheckCircle,
    XCircle,
    Clock4,
    Star,
    Hash,
    CreditCard,
    CalendarClock,
    Info,
    FileText,
    Shield,
    Ban,
    Check,
    Printer,
    AlertCircle,
    AlertTriangle,
    Bot,
    MessageSquare,
    X,
    Paperclip,
    Upload,
    Eye,
    Edit3,
    Trash2,
    Send,
    LoaderCircle,
} from "lucide-react";
import { toJalaali } from "jalaali-js";
import {
    toPersianNumber,
    toPersianTimeRange,
} from "../../../utils/persianNumbers";
import {
    getDisputeTypesByRole,
    getDisputeTypeConfig,
} from "../../../Constants/disputeTypes";

import DisputeStatusCard from "../../../Components/Disputes/DisputeStatusCard";

// ============ توابع کمکی ============
const formatJalaliDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const { jy, jm, jd } = toJalaali(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    );
    return toPersianNumber(
        `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`,
    );
};

const getDayName = (date) => {
    if (!date) return "";
    const days = [
        "یکشنبه",
        "دوشنبه",
        "سه‌شنبه",
        "چهارشنبه",
        "پنجشنبه",
        "جمعه",
        "شنبه",
    ];
    return days[new Date(date).getDay()];
};

const formatFullDateTime = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const { jy, jm, jd } = toJalaali(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    );
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${getDayName(date)} ${toPersianNumber(jy)}/${toPersianNumber(
        String(jm).padStart(2, "0"),
    )}/${toPersianNumber(String(jd).padStart(2, "0"))} - ${toPersianNumber(
        hours,
    )}:${toPersianNumber(minutes)}`;
};

// ============ وضعیت رزرو ============
const statusConfig = {
    pending: {
        label: "در انتظار تایید",
        icon: Clock4,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
        description: "این رزرو در انتظار تایید شماست.",
    },
    confirmed: {
        label: "تایید شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#d1fae5",
        description: "این رزرو تایید شده است.",
    },
    completed: {
        label: "تکمیل شده",
        icon: CheckCircle,
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#dbeafe",
        description: "این خدمت با موفقیت انجام شده است.",
    },
    cancelled: {
        label: "لغو شده",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fee2e2",
        description: "این رزرو لغو شده است.",
    },
};

// ============ چه کسی تکمیل کرده ============
const completedByConfig = {
    barber: {
        label: "تکمیل توسط شما",
        icon: Scissors,
        color: "#065f46",
        bg: "#ecfdf5",
    },
    customer: {
        label: "تکمیل توسط مشتری",
        icon: User,
        color: "#1e40af",
        bg: "#eff6ff",
    },
    system: {
        label: "تکمیل خودکار",
        icon: Bot,
        color: "#92400e",
        bg: "#fffbeb",
    },
    admin: {
        label: "تکمیل توسط ادمین",
        icon: Shield,
        color: "#5b21b6",
        bg: "#f5f3ff",
    },
};

// ============ وضعیت پرداخت ============
const paymentStatusConfig = {
    pending: {
        label: "در انتظار پرداخت",
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
    },
    success: {
        label: "پرداخت موفق",
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#d1fae5",
    },
    failed: {
        label: "پرداخت ناموفق",
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fee2e2",
    },
    refunded: {
        label: "برگشت داده شده",
        color: "#5b21b6",
        bg: "#f5f3ff",
        border: "#ddd6fe",
    },
};

const gatewayLabels = {
    zarinpal: "زرین‌پال",
    idpay: "آیدی‌پی",
    payping: "پی‌پینگ",
    nextpay: "نکست‌پی",
};

export default function BarberBookingShow({ auth, booking }) {
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
    // ============ Modal states ============
    const [completeModal, setCompleteModal] = useState({
        isOpen: false,
        isLoading: false,
    });

    const [cancelModal, setCancelModal] = useState({
        isOpen: false,
        isLoading: false,
    });

    const config = statusConfig[booking.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    const paymentConfig = booking.payment
        ? paymentStatusConfig[booking.payment.status]
        : null;
    // === dispute ===
    const latestDispute = booking.latest_dispute;
    const isMyDispute = latestDispute?.disputed_by_user_id === auth.user.id;
    console.log(auth.user.id);
    console.log(booking.latest_dispute);
    // ============ چاپ ============
    const handlePrint = () => {
        window.print();
    };

    // ============ تایید تکمیل ============
    const handleComplete = () => {
        setCompleteModal((prev) => ({ ...prev, isLoading: true }));

        router.patch(
            `/barber/bookings/${booking.id}/complete`,
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    setCompleteModal({ isOpen: false, isLoading: false }),
                onError: () =>
                    setCompleteModal((prev) => ({
                        ...prev,
                        isLoading: false,
                    })),
            },
        );
    };

    // ============ لغو رزرو ============
    const handleCancel = () => {
        setCancelModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(`/barber/bookings/${booking.id}/cancel`, {
            preserveScroll: true,
            onSuccess: () =>
                setCancelModal({ isOpen: false, isLoading: false }),
            onError: () =>
                setCancelModal((prev) => ({
                    ...prev,
                    isLoading: false,
                })),
        });
    };

    // ============ اعتراض به تکمیل توسط مشتری ============
    // ============================================
    // انواع اعتراض مجاز برای آرایشگر
    // ============================================
    const barberDisputeTypes = getDisputeTypesByRole("barber");

    // ============================================
    // باز کردن Modal
    // ============================================
    const openDisputeModal = () => {
        setDisputeModal({
            isOpen: true,
            isLoading: false,
            disputeType: "",
            reason: "",
            attachments: [],
            errors: {},
        });
    };

    // ============================================
    // بستن Modal
    // ============================================
    const closeDisputeModal = () => {
        disputeModal.attachments?.forEach((att) => {
            if (att.preview) URL.revokeObjectURL(att.preview);
        });

        setDisputeModal({
            isOpen: false,
            isLoading: false,
            disputeType: "",
            reason: "",
            attachments: [],
            errors: {},
        });
    };

    // ============================================
    // انتخاب فایل
    // ============================================
    const handleAttachmentChange = (e) => {
        const files = Array.from(e.target.files);

        const totalFiles = disputeModal.attachments.length + files.length;
        if (totalFiles > 5) {
            setDisputeModal((prev) => ({
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

        setDisputeModal((prev) => {
            const newErrors = { ...prev.errors };
            if (fileErrors.length > 0) {
                newErrors.attachments = "⚠️ " + fileErrors.join(" • ");
            } else {
                newErrors.attachments = null;
            }

            return {
                ...prev,
                attachments: [...prev.attachments, ...newAttachments],
                errors: newErrors,
            };
        });

        e.target.value = "";
    };

    // ============================================
    // حذف فایل
    // ============================================
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

    // ============================================
    // ثبت اعتراض
    // ============================================
    const handleDispute = () => {
        const errors = {};

        if (!disputeModal.disputeType) {
            errors.dispute_type = "لطفاً نوع اعتراض را انتخاب کنید.";
        }

        if (disputeModal.reason.length < 10) {
            errors.reason = "دلیل باید حداقل ۱۰ کاراکتر باشد.";
        }

        if (Object.keys(errors).length > 0) {
            setDisputeModal((prev) => ({ ...prev, errors }));
            return;
        }

        setDisputeModal((prev) => ({ ...prev, isLoading: true }));

        const formData = new FormData();
        formData.append("dispute_type", disputeModal.disputeType);
        formData.append("reason", disputeModal.reason);
        disputeModal.attachments.forEach((att, index) => {
            formData.append(`attachments[${index}]`, att.file);
        });

        router.post(`/barber/disputes/bookings/${booking.id}`, formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                disputeModal.attachments.forEach((att) => {
                    if (att.preview) URL.revokeObjectURL(att.preview);
                });
                closeDisputeModal();
            },
            onError: (errors) => {
                setDisputeModal((prev) => ({
                    ...prev,
                    isLoading: false,
                    errors,
                }));
            },
        });
    }; // ============ کامپوننت تکمیل شده ============
    const completedByCfg = booking.completed_by
        ? completedByConfig[booking.completed_by]
        : null;
    // ============================================
    // حذف اعتراض
    // ============================================
    const handleDeleteDispute = () => {
        if (!deleteDisputeModal.dispute) return;

        setDeleteDisputeModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(
            `/barber/disputes/${deleteDisputeModal.dispute.id}/destroy`,
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

    // جواب به درخواست اطلاعات بیشتر اعتراض
    const [responseModal, setResponseModal] = useState({
        isOpen: false,
        isLoading: false,
        dispute: null, // اعتراضی که بهش پاسخ میدیم
        response: "", // متن پاسخ
        attachments: [], // فایلهای پیوست
        errors: {},
    });
    // ============ باز کردن مدال ============
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
            <Head title={`رزرو #${booking.id}`} />

            <div className="barber-booking-show-page">
                {/* ============ دکمه بازگشت ============ */}
                <div className="barber-booking-show-back">
                    <Link href="/barber/bookings" className="back-btn">
                        <ArrowRight size={20} />
                        <span>بازگشت به رزروها</span>
                    </Link>
                </div>

                {/* ============ هدر ============ */}
                <div
                    className="barber-booking-show-header"
                    style={{
                        background: `linear-gradient(135deg, ${config.bg} 0%, #ffffff 100%)`,
                        borderColor: config.border,
                    }}
                >
                    <div
                        className="barber-booking-show-header-icon"
                        style={{
                            backgroundColor: config.bg,
                            color: config.color,
                            borderColor: config.border,
                        }}
                    >
                        <StatusIcon size={28} />
                    </div>

                    <div className="barber-booking-show-header-content">
                        <div className="barber-booking-show-header-top">
                            <span
                                className="barber-booking-show-status-badge"
                                style={{
                                    backgroundColor: config.bg,
                                    color: config.color,
                                    borderColor: config.border,
                                }}
                            >
                                <StatusIcon size={14} />
                                {config.label}
                            </span>

                            {/* ============ نشانگر اعتراض ============ */}
                            {booking.has_disputes && booking.latest_dispute && (
                                <span
                                    className={`dispute-mini-badge status-${booking.latest_dispute.status}`}
                                >
                                    <AlertTriangle size={12} />

                                    <>
                                        {booking.latest_dispute.status ===
                                            "pending" &&
                                            "اعتراض در انتظار بررسی"}

                                        {booking.latest_dispute.status ===
                                            "investigating" &&
                                            "اعتراض در حال بررسی"}

                                        {booking.latest_dispute.status ===
                                            "resolved" && "اعتراض تایید شد"}

                                        {booking.latest_dispute.status ===
                                            "rejected" && "اعتراض رد شد"}

                                        {booking.latest_dispute.status ===
                                            "cancelled" && "اعتراض لغو شد"}

                                        {booking.latest_dispute.status ===
                                            "awaiting_response" &&
                                            (isMyDispute
                                                ? "در انتظار پاسخ"
                                                : "اعتراض در حال بررسی")}
                                    </>
                                </span>
                            )}

                            <span className="barber-booking-show-code">
                                <Hash size={14} />
                                رزرو {toPersianNumber(booking.id)}
                            </span>

                            {/* Badge چه کسی تکمیل کرده */}
                            {booking.status === "completed" &&
                                completedByCfg && (
                                    <span
                                        className="barber-booking-show-completed-by"
                                        style={{
                                            backgroundColor: completedByCfg.bg,
                                            color: completedByCfg.color,
                                        }}
                                    >
                                        <completedByCfg.icon size={12} />
                                        {completedByCfg.label}
                                    </span>
                                )}
                        </div>

                        <h1 className="barber-booking-show-title">
                            {config.description}
                        </h1>

                        <p className="barber-booking-show-subtitle">
                            ثبت شده در {formatFullDateTime(booking.created_at)}
                        </p>
                    </div>
                </div>

                {/* ============ هشدار شکایت ============ */}
                {booking.has_disputes &&
                    booking.latest_dispute &&
                    !isMyDispute && (
                        <DisputeStatusCard
                            dispute={booking.latest_dispute}
                            viewerRole="barber"
                            scrollTargetSelector=".barber-dispute-banner"
                            showScrollButton
                        />
                    )}

                {/* ============ گرید اصلی ============ */}
                <div className="barber-booking-show-grid">
                    {/* ============ ستون راست ============ */}
                    <div className="barber-booking-show-main">
                        {/* کارت مشتری */}
                        <div className="barber-booking-show-card">
                            <div className="barber-booking-show-card-header">
                                <div className="card-icon-box blue">
                                    <User size={20} />
                                </div>
                                <h2 className="card-title">اطلاعات مشتری</h2>
                            </div>

                            {booking.customer ? (
                                <div className="customer-info-card">
                                    <div className="customer-info-avatar">
                                        {booking.customer.thumbnail ? (
                                            <img
                                                src={booking.customer.thumbnail}
                                                alt={booking.customer.name}
                                            />
                                        ) : (
                                            <span>
                                                {booking.customer.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="customer-info-content">
                                        <h3 className="customer-info-name">
                                            {booking.customer.name}
                                        </h3>

                                        <div className="customer-info-contact">
                                            {booking.customer.phone && (
                                                <a
                                                    href={`tel:${booking.customer.phone}`}
                                                    className="contact-item"
                                                >
                                                    <Phone size={14} />
                                                    <span dir="ltr">
                                                        {toPersianNumber(
                                                            booking.customer
                                                                .phone,
                                                        )}
                                                    </span>
                                                </a>
                                            )}

                                            {booking.customer.email && (
                                                <a
                                                    href={`mailto:${booking.customer.email}`}
                                                    className="contact-item"
                                                >
                                                    <Mail size={14} />
                                                    <span dir="ltr">
                                                        {booking.customer.email}
                                                    </span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="empty-text">
                                    اطلاعات مشتری یافت نشد.
                                </p>
                            )}
                        </div>
                        {/* ============ بنر وضعیت اعتراض ============ */}
                        {booking.has_disputes &&
                            booking.latest_dispute &&
                            booking.latest_dispute.disputed_by === "barber" && (
                                <div
                                    className={`customer-dispute-banner status-${booking.latest_dispute.status}`}
                                >
                                    <div className="dispute-banner-icon">
                                        {booking.latest_dispute.status ===
                                            "pending" && <Clock4 size={24} />}
                                        {booking.latest_dispute.status ===
                                            "investigating" && (
                                            <LoaderCircle size={24} />
                                        )}
                                        {booking.latest_dispute.status ===
                                            "awaiting_response" && (
                                            <MessageSquare size={24} />
                                        )}
                                        {booking.latest_dispute.status ===
                                            "resolved" && (
                                            <CheckCircle size={24} />
                                        )}
                                        {booking.latest_dispute.status ===
                                            "rejected" && <XCircle size={24} />}
                                        {booking.latest_dispute.status ===
                                            "cancelled" && <Ban size={24} />}
                                    </div>

                                    <div className="dispute-banner-content">
                                        <div className="dispute-banner-header">
                                            <h3>
                                                {booking.latest_dispute
                                                    .status === "pending" &&
                                                    "اعتراض شما در صف بررسی"}
                                                {booking.latest_dispute
                                                    .status ===
                                                    "investigating" &&
                                                    "اعتراض شما در حال بررسی"}
                                                {booking.latest_dispute
                                                    .status ===
                                                    "awaiting_response" &&
                                                    "در انتظار پاسخ شما"}
                                                {booking.latest_dispute
                                                    .status === "resolved" &&
                                                    "اعتراض شما تایید شد"}
                                                {booking.latest_dispute
                                                    .status === "rejected" &&
                                                    "اعتراض شما رد شد"}
                                                {booking.latest_dispute
                                                    .status === "cancelled" &&
                                                    "اعتراض شما لغو شد"}
                                            </h3>

                                            <span className="dispute-banner-date">
                                                ثبت:{" "}
                                                {formatFullDateTime(
                                                    booking.latest_dispute
                                                        .created_at,
                                                )}
                                            </span>
                                        </div>

                                        <p className="dispute-banner-message">
                                            {booking.latest_dispute.status ===
                                                "pending" &&
                                                (isMyDispute
                                                    ? "اعتراض شما ثبت شده و در انتظار بررسی ادمین است. ادمین تا ۴۸ ساعت آینده بررسی خواهد کرد."
                                                    : "مشتری از شما اعتراض کرده است. ادمین در حال بررسی است. لطفاً منتظر بمانید.")}

                                            {booking.latest_dispute.status ===
                                                "investigating" &&
                                                (isMyDispute
                                                    ? "ادمین در حال بررسی اعتراض شماست. لطفاً منتظر بمانید."
                                                    : "ادمین در حال بررسی اعتراض مشتری علیه شماست. لطفاً منتظر بمانید.")}

                                            {booking.latest_dispute.status ===
                                                "awaiting_response" &&
                                                (isMyDispute
                                                    ? "ادمین نیاز به اطلاعات بیشتری دارد. لطفاً پاسخ خود را ثبت کنید."
                                                    : "ادمین نیاز به اطلاعات بیشتری درباره اعتراض مشتری دارد. لطفاً پاسخ خود را ثبت کنید.")}

                                            {booking.latest_dispute.status ===
                                                "resolved" &&
                                                (isMyDispute
                                                    ? "اعتراض شما تایید شد."
                                                    : "اعتراض مشتری تایید شد.")}

                                            {booking.latest_dispute.status ===
                                                "rejected" &&
                                                (isMyDispute
                                                    ? "پس از بررسی، اعتراض شما رد شد. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید."
                                                    : "پس از بررسی، اعتراض مشتری رد شد. رزرو در وضعیت تکمیل باقی می‌ماند.")}

                                            {booking.latest_dispute.status ===
                                                "cancelled" &&
                                                (isMyDispute
                                                    ? "اعتراض شما لغو شده است."
                                                    : "اعتراض مشتری لغو شده است.")}
                                        </p>

                                        {/* ============ جزئیات اعتراض ============ */}
                                        <div className="dispute-banner-details">
                                            <div className="detail-item">
                                                <span className="detail-label">
                                                    متن اعتراض:
                                                </span>
                                                <span className="detail-value">
                                                    {
                                                        booking.latest_dispute
                                                            .reason
                                                    }
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">
                                                    نوع اعتراض:
                                                </span>
                                                <span className="detail-value">
                                                    {
                                                        getDisputeTypeConfig(
                                                            booking
                                                                .latest_dispute
                                                                .dispute_type,
                                                        )["label"]
                                                    }
                                                </span>
                                            </div>

                                            {booking.latest_dispute
                                                .refund_amount > 0 && (
                                                <div className="detail-item success">
                                                    <span className="detail-label">
                                                        مبلغ بازگشتی:
                                                    </span>
                                                    <span className="detail-value">
                                                        {toPersianNumber(
                                                            booking.latest_dispute.refund_amount.toLocaleString(),
                                                        )}{" "}
                                                        تومان
                                                    </span>
                                                </div>
                                            )}

                                            {booking.latest_dispute
                                                .penalty_amount > 0 && (
                                                <div className="detail-item penalty">
                                                    <span className="detail-label">
                                                        جریمه آرایشگر:
                                                    </span>
                                                    <span className="detail-value">
                                                        {toPersianNumber(
                                                            booking.latest_dispute.penalty_amount.toLocaleString(),
                                                        )}{" "}
                                                        تومان
                                                    </span>
                                                </div>
                                            )}

                                            {booking.latest_dispute
                                                .resolution && (
                                                <div className="detail-item resolution">
                                                    <span className="detail-label">
                                                        پاسخ ادمین:
                                                    </span>
                                                    <span className="detail-value">
                                                        {
                                                            booking
                                                                .latest_dispute
                                                                .resolution
                                                        }
                                                    </span>
                                                </div>
                                            )}

                                            {booking.latest_dispute
                                                .response && (
                                                <div className="detail-item response">
                                                    <span className="detail-label">
                                                        پاسخ شما:
                                                    </span>
                                                    <span className="detail-value">
                                                        {
                                                            booking
                                                                .latest_dispute
                                                                .response
                                                        }
                                                    </span>
                                                </div>
                                            )}

                                            {/* ============ پیوست‌ها ============ */}
                                            {booking.latest_dispute
                                                .attachments &&
                                                booking.latest_dispute
                                                    .attachments.length > 0 && (
                                                    <div className="detail-item attachments">
                                                        <span className="detail-label">
                                                            <Paperclip
                                                                size={12}
                                                            />
                                                            پیوست‌ها:
                                                        </span>
                                                        <div className="dispute-attachments-mini-grid">
                                                            {booking.latest_dispute.attachments.map(
                                                                (
                                                                    att,
                                                                    index,
                                                                ) => (
                                                                    <a
                                                                        key={
                                                                            index
                                                                        }
                                                                        href={
                                                                            att.url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="dispute-attachment-mini"
                                                                        title={
                                                                            att.name
                                                                        }
                                                                    >
                                                                        <img
                                                                            src={
                                                                                att.url
                                                                            }
                                                                            alt={`پیوست ${
                                                                                index +
                                                                                1
                                                                            }`}
                                                                        />
                                                                        <div className="attachment-mini-overlay">
                                                                            <Eye
                                                                                size={
                                                                                    14
                                                                                }
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
                                        {booking.latest_dispute.status ===
                                            "pending" && (
                                            <div className="dispute-banner-info">
                                                <Info size={14} />
                                                <span>
                                                    می‌توانید تا زمان بررسی،
                                                    اطلاعات بیشتری ارسال کنید.
                                                </span>
                                            </div>
                                        )}

                                        {booking.latest_dispute.status ===
                                            "awaiting_response" && (
                                            <div className="dispute-banner-warning">
                                                <AlertCircle size={14} />
                                                <span>
                                                    لطفاً پاسخ خود را در اسرع
                                                    وقت ثبت کنید.
                                                </span>
                                            </div>
                                        )}

                                        {/* ============ نمایش تعداد اعتراضات ============ */}
                                        {booking.disputes_count > 1 && (
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
                                        )}

                                        {/* ============ دکمه‌های عملیات اعتراض ============ */}
                                        <div className="dispute-banner-actions">
                                            {/* ویرایش */}
                                            {booking.latest_dispute
                                                .can_edit && (
                                                <Link
                                                    href={`/barber/disputes/${booking.latest_dispute.id}/edit`}
                                                    className="dispute-action-btn edit"
                                                    title="ویرایش اعتراض"
                                                >
                                                    <Edit3 size={14} />
                                                    <span>ویرایش</span>
                                                    {/* {booking.latest_dispute
                                                .edit_hours_remaining && (
                                                <span className="time-remaining">
                                                    {toPersianNumber(
                                                        booking.latest_dispute
                                                            .edit_hours_remaining,
                                                    )}{" "}
                                                    ساعت
                                                </span>
                                            )} */}
                                                </Link>
                                            )}

                                            {/* حذف */}
                                            {booking.latest_dispute
                                                .can_delete && (
                                                <button
                                                    type="button"
                                                    className="dispute-action-btn delete"
                                                    onClick={() =>
                                                        setDeleteDisputeModal({
                                                            isOpen: true,
                                                            isLoading: false,
                                                            dispute:
                                                                booking.latest_dispute,
                                                        })
                                                    }
                                                    title="حذف اعتراض"
                                                >
                                                    <Trash2 size={14} />
                                                    <span>حذف</span>
                                                </button>
                                            )}

                                            {/* پاسخ */}
                                            {booking.latest_dispute
                                                .can_respond && (
                                                <button
                                                    type="button"
                                                    className="dispute-action-btn respond"
                                                    onClick={() =>
                                                        openResponseModal(
                                                            latestDispute,
                                                        )
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
                                                dispute: booking.latest_dispute,
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
                        {/* کارت زمان و خدمت */}
                        <div className="barber-booking-show-card">
                            <div className="barber-booking-show-card-header">
                                <div className="card-icon-box green">
                                    <CalendarClock size={20} />
                                </div>
                                <h2 className="card-title">زمان و خدمت</h2>
                            </div>

                            <div className="booking-info-grid">
                                <div className="info-block">
                                    <div className="info-icon">
                                        <Calendar size={16} />
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">
                                            تاریخ
                                        </span>
                                        <span className="info-value">
                                            {getDayName(booking.date)}{" "}
                                            {formatJalaliDate(booking.date)}
                                        </span>
                                    </div>
                                </div>

                                <div className="info-block">
                                    <div className="info-icon">
                                        <Clock size={16} />
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">ساعت</span>
                                        <span className="info-value">
                                            {toPersianTimeRange(
                                                booking.start_time,
                                                booking.end_time,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="info-block">
                                    <div className="info-icon">
                                        <Scissors size={16} />
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">خدمت</span>
                                        <span className="info-value">
                                            {booking.service?.name}
                                        </span>
                                    </div>
                                </div>

                                <div className="info-block">
                                    <div className="info-icon">
                                        <Clock size={16} />
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">
                                            مدت زمان
                                        </span>
                                        <span className="info-value">
                                            {toPersianNumber(
                                                booking.service?.duration,
                                            )}{" "}
                                            دقیقه
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {booking.service?.description && (
                                <div className="service-description-box">
                                    <FileText size={14} />
                                    <p>{booking.service.description}</p>
                                </div>
                            )}
                        </div>

                        {/* کارت پرداخت */}
                        {booking.payment && (
                            <div className="barber-booking-show-card">
                                <div className="barber-booking-show-card-header">
                                    <div className="card-icon-box purple">
                                        <CreditCard size={20} />
                                    </div>
                                    <h2 className="card-title">
                                        اطلاعات پرداخت
                                    </h2>
                                </div>

                                <div className="payment-info-grid">
                                    <div className="payment-info-item">
                                        <span className="payment-info-label">
                                            درگاه پرداخت
                                        </span>
                                        <span className="payment-info-value">
                                            {gatewayLabels[
                                                booking.payment.gateway
                                            ] || booking.payment.gateway}
                                        </span>
                                    </div>

                                    <div className="payment-info-item">
                                        <span className="payment-info-label">
                                            شماره تراکنش
                                        </span>
                                        <span
                                            className="payment-info-value mono"
                                            dir="ltr"
                                        >
                                            {booking.payment.transaction_id ||
                                                "-"}
                                        </span>
                                    </div>

                                    <div className="payment-info-item">
                                        <span className="payment-info-label">
                                            تاریخ پرداخت
                                        </span>
                                        <span className="payment-info-value">
                                            {formatFullDateTime(
                                                booking.payment.paid_at,
                                            )}
                                        </span>
                                    </div>

                                    <div className="payment-info-item">
                                        <span className="payment-info-label">
                                            وضعیت
                                        </span>
                                        <span
                                            className="payment-status-badge"
                                            style={{
                                                backgroundColor:
                                                    paymentConfig.bg,
                                                color: paymentConfig.color,
                                                borderColor:
                                                    paymentConfig.border,
                                            }}
                                        >
                                            {paymentConfig.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="payment-total">
                                    <span className="payment-total-label">
                                        <DollarSign size={16} />
                                        مبلغ پرداخت شده
                                    </span>
                                    <span className="payment-total-value">
                                        {toPersianNumber(
                                            booking.amount.toLocaleString(),
                                        )}{" "}
                                        <span className="currency">تومان</span>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* کارت نظر */}
                        {booking.review && (
                            <div className="barber-booking-show-card">
                                <div className="barber-booking-show-card-header">
                                    <div className="card-icon-box yellow">
                                        <Star
                                            size={20}
                                            fill="#fbbf24"
                                            color="#fbbf24"
                                        />
                                    </div>
                                    <h2 className="card-title">نظر مشتری</h2>
                                </div>

                                <div className="review-display">
                                    <div className="review-display-header">
                                        <RatingStars
                                            rating={booking.review.rating}
                                            size={16}
                                            showNumber={false}
                                            showTotal={false}
                                        />
                                        <span className="review-display-date">
                                            {formatFullDateTime(
                                                booking.review.created_at,
                                            )}
                                        </span>
                                    </div>

                                    {booking.review.comment && (
                                        <p className="review-display-comment">
                                            {booking.review.comment}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ============ ستون چپ ============ */}
                    <div className="barber-booking-show-sidebar">
                        {/* خلاصه */}
                        <div className="barber-booking-show-card summary-card">
                            <div className="barber-booking-show-card-header">
                                <div className="card-icon-box green">
                                    <DollarSign size={20} />
                                </div>
                                <h2 className="card-title">خلاصه</h2>
                            </div>

                            <div className="summary-list">
                                <div className="summary-row">
                                    <span className="summary-row-label">
                                        مبلغ خدمت
                                    </span>
                                    <span className="summary-row-value">
                                        {toPersianNumber(
                                            (
                                                booking.service?.price || 0
                                            ).toLocaleString(),
                                        )}{" "}
                                        تومان
                                    </span>
                                </div>

                                <div className="summary-divider"></div>

                                <div className="summary-row total">
                                    <span className="summary-row-label">
                                        مبلغ نهایی
                                    </span>
                                    <span className="summary-row-value">
                                        {toPersianNumber(
                                            booking.amount.toLocaleString(),
                                        )}{" "}
                                        <span className="currency">تومان</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* دکمه‌های عملیات */}
                        <div className="barber-booking-show-card actions-card">
                            <div className="barber-booking-show-card-header">
                                <div className="card-icon-box gray">
                                    <Info size={20} />
                                </div>
                                <h2 className="card-title">عملیات</h2>
                            </div>

                            <div className="actions-list">
                                {/* ============================================ */}
                                {/* دکمه اعتراض آرایشگر */}
                                {/* ============================================ */}
                                {booking.can_barber_dispute &&
                                    booking.can_dispute && (
                                        <button
                                            type="button"
                                            className="action-btn dispute"
                                            onClick={openDisputeModal}
                                        >
                                            <AlertTriangle size={16} />
                                            <span>اعتراض به تکمیل</span>
                                            {/* {booking.dispute_hours_remaining && (
                                            <span className="time-remaining">
                                                {toPersianNumber(
                                                    booking.dispute_hours_remaining,
                                                )}{" "}
                                                ساعت
                                            </span>
                                        )} */}
                                        </button>
                                    )}

                                {/* تایید تکمیل */}
                                {booking.can_complete && (
                                    <button
                                        type="button"
                                        className="action-btn complete"
                                        onClick={() =>
                                            setCompleteModal({
                                                isOpen: true,
                                                isLoading: false,
                                            })
                                        }
                                    >
                                        <Check size={16} />
                                        <span>تایید تکمیل خدمت</span>
                                    </button>
                                )}

                                {/* چاپ */}
                                <button
                                    type="button"
                                    className="action-btn print"
                                    onClick={handlePrint}
                                >
                                    <Printer size={16} />
                                    <span>چاپ رسید</span>
                                </button>

                                {/* تماس با مشتری */}
                                {booking.customer?.phone && (
                                    <a
                                        href={`tel:${booking.customer.phone}`}
                                        className="action-btn contact"
                                    >
                                        <Phone size={16} />
                                        <span>تماس با مشتری</span>
                                    </a>
                                )}

                                {/* لغو */}
                                {booking.can_cancel && (
                                    <button
                                        type="button"
                                        className="action-btn cancel"
                                        onClick={() =>
                                            setCancelModal({
                                                isOpen: true,
                                                isLoading: false,
                                            })
                                        }
                                    >
                                        <Ban size={16} />
                                        <span>لغو رزرو</span>
                                    </button>
                                )}
                            </div>

                            {/* پیام‌های راهنما */}
                            {booking.can_complete && (
                                <div className="info-box info">
                                    <Info size={14} />
                                    <p>
                                        زمان نوبت گذشته است. لطفاً پس از انجام
                                        خدمت، تکمیل آن را تایید کنید.
                                    </p>
                                </div>
                            )}

                            {booking.can_dispute && (
                                <div className="info-box warning">
                                    <AlertTriangle size={14} />
                                    <p>
                                        مشتری تکمیل خدمت را اعلام کرده است. اگر
                                        خدمت را انجام نداده‌اید، تا ۲۴ ساعت فرصت
                                        اعتراض دارید.
                                    </p>
                                </div>
                            )}

                            {booking.status === "pending" && (
                                <div className="info-box warning">
                                    <Clock4 size={14} />
                                    <p>
                                        این رزرو در انتظار تایید است. برای
                                        تایید، از صفحه رزروهای در انتظار استفاده
                                        کنید.
                                    </p>
                                </div>
                            )}

                            {booking.completed_by === "system" && (
                                <div className="info-box info">
                                    <Bot size={14} />
                                    <p>
                                        این رزرو به صورت خودکار تکمیل شده است
                                        چون شما در ۲۴ ساعت تایید نکردید.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* راهنما */}
                        <div className="barber-booking-show-card">
                            <div className="barber-booking-show-card-header">
                                <div className="card-icon-box gray">
                                    <Shield size={20} />
                                </div>
                                <h2 className="card-title">راهنما</h2>
                            </div>

                            <ul className="status-guide-list">
                                <li>
                                    <Check size={14} />
                                    <span>
                                        برای تکمیل خدمت، دکمه «تایید تکمیل خدمت»
                                        را بزنید.
                                    </span>
                                </li>
                                <li>
                                    <AlertTriangle size={14} />
                                    <span>
                                        اگر مشتری تکمیل را اعلام کرد اما خدمت
                                        انجام نشده، اعتراض کنید.
                                    </span>
                                </li>
                                <li>
                                    <Ban size={14} />
                                    <span>
                                        لغو رزرو فقط قبل از زمان نوبت امکان‌پذیر
                                        است.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============ Modal تایید تکمیل ============ */}
            <ConfirmModal
                isOpen={completeModal.isOpen}
                onClose={() =>
                    setCompleteModal({ isOpen: false, isLoading: false })
                }
                onConfirm={handleComplete}
                title="تایید تکمیل خدمت"
                message={`آیا خدمت «${booking.service?.name}» برای مشتری "${booking.customer?.name}" را انجام داده‌اید؟ با تایید، رزرو به وضعیت «تکمیل شده» تغییر می‌کند و درآمد آن آزاد می‌شود.`}
                confirmText="بله، تایید می‌کنم"
                cancelText="انصراف"
                type="success"
                isLoading={completeModal.isLoading}
            />

            {/* ============ Modal لغو رزرو ============ */}
            <ConfirmModal
                isOpen={cancelModal.isOpen}
                onClose={() =>
                    setCancelModal({ isOpen: false, isLoading: false })
                }
                onConfirm={handleCancel}
                title="لغو رزرو"
                message={`آیا از لغو رزرو #${booking.id} برای مشتری "${booking.customer?.name}" مطمئن هستید؟ در صورت لغو، مبلغ به مشتری بازگردانده می‌شود و ۱۵٪ جریمه کسر می‌شود.`}
                confirmText="بله، لغو کن"
                cancelText="انصراف"
                type="danger"
                isLoading={cancelModal.isLoading}
            />

            {/* ============ Modal اعتراض ============ */}
            {disputeModal.isOpen && (
                <div
                    className="dispute-modal-overlay"
                    onClick={() =>
                        !disputeModal.isLoading &&
                        setDisputeModal((prev) => ({
                            ...prev,
                            isOpen: false,
                        }))
                    }
                >
                    <div
                        className="dispute-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* هدر */}
                        <div className="dispute-modal-header">
                            <div className="dispute-modal-icon">
                                <AlertTriangle size={28} />
                            </div>
                            <h3>اعتراض به تکمیل خدمت</h3>
                        </div>

                        {/* هشدار */}
                        <div className="dispute-modal-warning">
                            <AlertCircle size={16} />
                            <p>
                                <strong>توجه:</strong> مشتری اعلام کرده خدمت
                                انجام شده است. اگر شما این را قبول ندارید، دلیل
                                خود را بنویسید. ادمین بررسی خواهد کرد.
                            </p>
                        </div>

                        {/* اطلاعات رزرو */}
                        <div className="dispute-modal-info">
                            <div className="info-row">
                                <span>مشتری:</span>
                                <strong>{booking.customer?.name}</strong>
                            </div>
                            <div className="info-row">
                                <span>خدمت:</span>
                                <strong>{booking.service?.name}</strong>
                            </div>
                            <div className="info-row">
                                <span>تاریخ:</span>
                                <strong>
                                    {formatJalaliDate(booking.date)}
                                </strong>
                            </div>
                            <div className="info-row">
                                <span>مبلغ:</span>
                                <strong>
                                    {toPersianNumber(
                                        booking.amount.toLocaleString(),
                                    )}{" "}
                                    تومان
                                </strong>
                            </div>
                        </div>

                        {/* فیلد دلیل */}
                        <div className="dispute-form-group">
                            <label className="form-label">
                                دلیل اعتراض
                                <span className="required">*</span>
                            </label>
                            <textarea
                                className={`form-textarea ${
                                    disputeModal.errors.reason ? "error" : ""
                                }`}
                                value={disputeModal.reason}
                                onChange={(e) =>
                                    setDisputeModal((prev) => ({
                                        ...prev,
                                        reason: e.target.value,
                                        errors: {},
                                    }))
                                }
                                placeholder="مثلاً: مشتری در زمان نوبت حاضر نشد و خدمت انجام نشد. یا: خدمت را نیمه‌کاره رها کردم..."
                                rows={4}
                                maxLength={500}
                                disabled={disputeModal.isLoading}
                            />
                            <div className="char-counter">
                                {toPersianNumber(disputeModal.reason.length)} /{" "}
                                {toPersianNumber(500)}
                            </div>
                            {disputeModal.errors.reason && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{disputeModal.errors.reason}</span>
                                </div>
                            )}
                        </div>

                        {/* دکمه‌ها */}
                        <div className="dispute-modal-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() =>
                                    setDisputeModal((prev) => ({
                                        ...prev,
                                        isOpen: false,
                                    }))
                                }
                                disabled={disputeModal.isLoading}
                            >
                                انصراف
                            </button>
                            <button
                                type="button"
                                className="btn-confirm"
                                onClick={handleDispute}
                                disabled={disputeModal.isLoading}
                            >
                                {disputeModal.isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        در حال ارسال...
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={16} />
                                        ثبت اعتراض
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* Modal اعتراض */}
            {/* ============================================ */}
            {disputeModal.isOpen && (
                <div
                    className="dispute-modal-overlay"
                    onClick={closeDisputeModal}
                >
                    <div
                        className="dispute-modal barber-dispute-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* هدر */}
                        <div className="dispute-modal-header">
                            <div className="dispute-modal-icon barber">
                                <AlertTriangle size={28} />
                            </div>
                            <h3>اعتراض آرایشگر</h3>
                            <button
                                type="button"
                                className="dispute-modal-close"
                                onClick={closeDisputeModal}
                                disabled={disputeModal.isLoading}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* هشدار */}
                        <div className="dispute-modal-warning barber">
                            <AlertCircle size={16} />
                            <p>
                                <strong>توجه:</strong> در صورت اعتراض نادرست،
                                ممکن است امتیاز یا حساب شما محدود شود. لطفاً
                                اطلاعات دقیق وارد کنید.
                            </p>
                        </div>

                        {/* نوع اعتراض */}
                        <div className="dispute-form-group">
                            <label className="form-label">
                                نوع اعتراض
                                <span className="required">*</span>
                            </label>
                            <div className="dispute-type-options">
                                {barberDisputeTypes.map((type) => {
                                    const Icon = type.icon;
                                    const isSelected =
                                        disputeModal.disputeType === type.value;

                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            className={`dispute-type-btn ${
                                                isSelected ? "selected" : ""
                                            }`}
                                            onClick={() =>
                                                setDisputeModal((prev) => ({
                                                    ...prev,
                                                    disputeType: type.value,
                                                    errors: {
                                                        ...prev.errors,
                                                        dispute_type: null,
                                                    },
                                                }))
                                            }
                                            disabled={disputeModal.isLoading}
                                        >
                                            <Icon size={16} />
                                            <span>{type.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {disputeModal.errors.dispute_type && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>
                                        {disputeModal.errors.dispute_type}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* توضیحات */}
                        <div className="dispute-form-group">
                            <label className="form-label">
                                توضیحات
                                <span className="required">*</span>
                            </label>
                            <textarea
                                className={`form-textarea ${
                                    disputeModal.errors.reason ? "error" : ""
                                }`}
                                value={disputeModal.reason}
                                onChange={(e) =>
                                    setDisputeModal((prev) => ({
                                        ...prev,
                                        reason: e.target.value,
                                        errors: {
                                            ...prev.errors,
                                            reason: null,
                                        },
                                    }))
                                }
                                placeholder="لطفاً توضیح دهید چه اتفاقی افتاده است..."
                                rows={5}
                                maxLength={1000}
                                disabled={disputeModal.isLoading}
                            />
                            <div className="char-counter">
                                {toPersianNumber(disputeModal.reason.length)} /{" "}
                                {toPersianNumber(1000)}
                            </div>
                            {disputeModal.errors.reason && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{disputeModal.errors.reason}</span>
                                </div>
                            )}
                        </div>

                        {/* پیوست‌ها */}
                        <div className="dispute-form-group">
                            <label className="form-label">
                                <Paperclip size={14} />
                                پیوست (اختیاری)
                            </label>

                            <div className="dispute-attachments">
                                {/* پیش‌نمایش */}
                                {disputeModal.attachments.length > 0 && (
                                    <div className="attachments-preview">
                                        {disputeModal.attachments.map(
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
                                                            handleRemoveAttachment(
                                                                index,
                                                            )
                                                        }
                                                        disabled={
                                                            disputeModal.isLoading
                                                        }
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}

                                {/* دکمه آپلود */}
                                {disputeModal.attachments.length < 5 && (
                                    <label className="attachment-upload-btn">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleAttachmentChange}
                                            disabled={disputeModal.isLoading}
                                            style={{ display: "none" }}
                                        />
                                        <Upload size={18} />
                                        <span>افزودن عکس</span>
                                        <span className="upload-count">
                                            {toPersianNumber(
                                                disputeModal.attachments.length,
                                            )}{" "}
                                            / ۵
                                        </span>
                                    </label>
                                )}
                            </div>

                            {disputeModal.errors.attachments && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>
                                        {disputeModal.errors.attachments}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* اطلاعات رزرو */}
                        <div className="dispute-modal-info">
                            <div className="info-row">
                                <span>مشتری:</span>
                                <strong>{booking.customer?.name}</strong>
                            </div>
                            <div className="info-row">
                                <span>خدمت:</span>
                                <strong>{booking.service?.name}</strong>
                            </div>
                            <div className="info-row">
                                <span>مبلغ:</span>
                                <strong>
                                    {toPersianNumber(
                                        booking.amount.toLocaleString(),
                                    )}{" "}
                                    تومان
                                </strong>
                            </div>
                        </div>

                        {/* دکمه‌ها */}
                        <div className="dispute-modal-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={closeDisputeModal}
                                disabled={disputeModal.isLoading}
                            >
                                انصراف
                            </button>
                            <button
                                type="button"
                                className="btn-confirm barber"
                                onClick={handleDispute}
                                disabled={disputeModal.isLoading}
                            >
                                {disputeModal.isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        در حال ارسال...
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={16} />
                                        ثبت اعتراض
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

            {/* ============ Modal حذف اعتراض ============ */}
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
                        ? `آیا از حذف اعتراض خود مطمئن هستید؟ این عملیات قابل بازگشت نیست و اعتراض شما به طور کامل از سیستم حذف می‌شود.${
                              deleteDisputeModal.dispute.reason
                                  ? `\n\nمتن اعتراض: "${deleteDisputeModal.dispute.reason.substring(
                                        0,
                                        100,
                                    )}${
                                        deleteDisputeModal.dispute.reason
                                            .length > 100
                                            ? "..."
                                            : ""
                                    }"`
                                  : ""
                          }`
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
