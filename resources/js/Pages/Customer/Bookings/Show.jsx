import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PublicLayout from "../Layouts/PublicLayout";
import ConfirmModal from "../../Admin/Components/ConfirmModal";
import RatingStars from "../Components/RatingStars";
import "../Assets/BookingShow.css";
import {
    ArrowRight,
    Calendar,
    Clock,
    Scissors,
    DollarSign,
    User,
    Phone,
    MapPin,
    CheckCircle,
    XCircle,
    Clock4,
    Star,
    AlertCircle,
    Hash,
    CreditCard,
    Printer,
    Award,
    Building2,
    CalendarClock,
    Info,
    FileText,
    Shield,
    RefreshCw,
    Hourglass,
    Ban,
    CheckCheck,
    Edit3,
    Trash2,
    X,
    AlertTriangle,
    MoreHorizontal,
    Paperclip,
    Upload,
    Eye,
    MessageSquare,
} from "lucide-react";
import { toJalaali } from "jalaali-js";
import {
    toPersianNumber,
    toPersianTimeRange,
    toPersianTime,
} from "../../../utils/persianNumbers";

// ============ توابع کمکی ============
const formatJalaliDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const { jy, jm, jd } = toJalaali(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    );
    return `${toPersianNumber(jy)}/${toPersianNumber(
        String(jm).padStart(2, "0"),
    )}/${toPersianNumber(String(jd).padStart(2, "0"))}`;
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

// ============ وضعیت‌ها ============
// ============ وضعیت‌های پرداخت ============
const statusConfig = {
    pending: {
        label: "در انتظار پرداخت",
        icon: Clock4,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
    },
    confirmed: {
        label: "رزرو  شده",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#212422",
    },
    completed: {
        label: "تکمیل شده",
        icon: CheckCheck,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#212422",
    },

    success: {
        label: "موفق",
        icon: CheckCircle,
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#212422",
    },
    failed: {
        label: "ناموفق",
        icon: XCircle,
        color: "#991b1b",
        bg: "#fef2f2",
        border: "#fee2e2",
    },
    cancelled: {
        label: "لغو شده",
        icon: Ban, // ← از lucide-react
        color: "#6b7280",
        bg: "#f3f4f6",
        border: "#e5e7eb",
    },
    refunded: {
        label: "برگشت داده شده",
        icon: RefreshCw, // ← از lucide-react
        color: "#5b21b6",
        bg: "#f5f3ff",
        border: "#ddd6fe",
    },
};

// dispute badge coors
const getDisputeTypeLabel = (type) => {
    const labels = {
        not_done: "خدمت انجام نشد",
        incomplete: "خدمت ناقص بود",
        poor_quality: "کیفیت پایین بود",
        bad_behavior: "رفتار نامناسب",
        other: "سایر",
    };
    return labels[type] || type;
};

// ============ کامپوننت شمارش معکوس ============
function CountdownTimer({ expiresAt }) {
    const [timeLeft, setTimeLeft] = useState({
        minutes: 0,
        seconds: 0,
        isExpired: false,
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const expires = new Date(expiresAt).getTime();
            const diff = expires - now;

            if (diff <= 0) {
                setTimeLeft({ minutes: 0, seconds: 0, isExpired: true });
                return;
            }

            const minutes = Math.floor(diff / 1000 / 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft({ minutes, seconds, isExpired: false });
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    if (timeLeft.isExpired) {
        return (
            <span className="countdown-timer expired">
                <Hourglass size={14} />
                منقضی شده
            </span>
        );
    }

    return (
        <span className="countdown-timer">
            <Hourglass size={14} />
            {toPersianNumber(timeLeft.minutes)}:
            {toPersianNumber(String(timeLeft.seconds).padStart(2, "0"))}
        </span>
    );
}

export default function BookingShow({ auth, booking }) {
    // ============ State حذف اعتراض ============
    const [deleteDisputeModal, setDeleteDisputeModal] = useState({
        isOpen: false,
        isLoading: false,
        dispute: null,
    });
    //
    const [completeModal, setCompleteModal] = useState({
        isOpen: false,
        isLoading: false,
    });
    // ============ State برای Modal حذف نظر ============

    const [deleteReviewModal, setDeleteReviewModal] = useState({
        isOpen: false,
        isLoading: false,
    });
    const [cancelModal, setCancelModal] = useState({
        isOpen: false,
        isLoading: false,
    });
    const config = statusConfig[booking.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    // ============ لغو رزرو ============
    const handleConfirmCancel = () => {
        setCancelModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(`/customer/bookings/${booking.id}/cancel`, {
            preserveScroll: true,
            onSuccess: () =>
                setCancelModal({ isOpen: false, isLoading: false }),
            onError: () =>
                setCancelModal((prev) => ({ ...prev, isLoading: false })),
        });
    };

    // ============ پرداخت مجدد ============

    const handleRetryPayment = () => {
        const form = document.createElement("form");

        form.method = "POST";
        form.action = "/customer/payment/pay";
        form.target = "_blank";

        // CSRF Token
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

        const csrfInput = document.createElement("input");
        csrfInput.type = "hidden";
        csrfInput.name = "_token";
        csrfInput.value = csrfToken;

        // Booking ID
        const bookingInput = document.createElement("input");
        bookingInput.type = "hidden";
        bookingInput.name = "booking_id";
        bookingInput.value = booking.id;

        // Gateway
        const gatewayInput = document.createElement("input");
        gatewayInput.type = "hidden";
        gatewayInput.name = "gateway";
        gatewayInput.value = booking.payment?.gateway || "zarinpal";

        form.appendChild(csrfInput);
        form.appendChild(bookingInput);
        form.appendChild(gatewayInput);

        document.body.appendChild(form);

        form.submit();

        document.body.removeChild(form);
    };
    // ============ تایید دریافت خدمت============

    const handleCustomerComplete = () => {
        setCompleteModal((prev) => ({ ...prev, isLoading: true }));

        router.patch(
            `/customer/bookings/${booking.id}/complete`,
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

    // ============ چاپ ============
    const handlePrint = () => {
        window.print();
    };

    // ============ حذف نظر ============
    const handleDeleteReview = () => {
        if (!booking.review) return;

        setDeleteReviewModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(
            `/customer/bookings/reviews/${booking.review.id}/delete`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteReviewModal({ isOpen: false, isLoading: false });
                },
                onError: () => {
                    setDeleteReviewModal((prev) => ({
                        ...prev,
                        isLoading: false,
                    }));
                },
            },
        );
    };

    // dispute
    const [disputeModal, setDisputeModal] = useState({
        isOpen: false,
        isLoading: false,
        reason: "",
        disputeType: "",
        attachments: [],
        errors: {},
    });

    // const openDisputeModal = () => {
    //     setDisputeModal({
    //         isOpen: true,
    //         isLoading: false,
    //         reason: "",
    //         disputeType: "",
    //         attachments: [],
    //         errors: {},
    //     });
    // };

    const closeDisputeModal = () => {
        disputeModal.attachments?.forEach((att) => {
            if (att.preview) URL.revokeObjectURL(att.preview);
        });

        setDisputeModal({
            isOpen: false,
            isLoading: false,
            reason: "",
            disputeType: "",
            attachments: [],
            errors: {},
        });
    };

    // ============ ثبت اعتراض ============
    const handleDispute = () => {
        // ... اعتبارسنجی
        setDisputeModal((prev) => ({ ...prev, isLoading: true }));

        const formData = new FormData();
        formData.append("reason", disputeModal.reason);
        formData.append("dispute_type", disputeModal.disputeType);

        disputeModal.attachments.forEach((att, index) => {
            formData.append(`attachments[${index}]`, att.file);
        });

        router.post(`/customer/bookings/${booking.id}/dispute`, formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                disputeModal.attachments.forEach((att) => {
                    if (att.preview) URL.revokeObjectURL(att.preview);
                });

                setDisputeModal({
                    isOpen: false,
                    isLoading: false,
                    reason: "",
                    disputeType: "",
                    attachments: [],
                    errors: {},
                });
            },
            onError: (errors) => {
                setDisputeModal((prev) => ({
                    ...prev,
                    isLoading: false,
                    errors,
                }));
            },
        });
    };

    // ============================================
    // هندل انتخاب فایل
    // ============================================
    const handleAttachmentChange = (e) => {
        const files = Array.from(e.target.files);

        // ============ بررسی تعداد کل ============
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

        // ============ بررسی حجم و نوع ============
        const validFiles = [];
        const fileErrors = [];

        for (const file of files) {
            // حجم بیش از ۲ مگابایت
            if (file.size > 2 * 1024 * 1024) {
                fileErrors.push(`فایل «${file.name}» بیش از ۲ مگابایت است.`);
                continue;
            }

            // غیر تصویری
            if (!file.type.startsWith("image/")) {
                fileErrors.push(`فایل «${file.name}» تصویر نیست.`);
                continue;
            }

            validFiles.push(file);
        }

        // ============ ساخت پیش‌نمایش ============
        const newAttachments = validFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        // ============ بروزرسانی State ============
        setDisputeModal((prev) => {
            // اگر خطایی وجود داشت، آن را نمایش بده
            // اگر خطایی نبود، خطای قبلی را پاک کن
            const newErrors = { ...prev.errors };

            if (fileErrors.length > 0) {
                newErrors.attachments = fileErrors.join(" | ");
            } else {
                newErrors.attachments = null;
            }

            return {
                ...prev,
                attachments: [...prev.attachments, ...newAttachments],
                errors: newErrors,
            };
        });

        // پاک کردن input
        e.target.value = "";
    };

    // ============================================
    // حذف پیوست
    // ============================================
    const handleRemoveAttachment = (index) => {
        setDisputeModal((prev) => {
            const newAttachments = [...prev.attachments];

            // آزاد کردن URL
            if (newAttachments[index]?.preview) {
                URL.revokeObjectURL(newAttachments[index].preview);
            }

            newAttachments.splice(index, 1);

            return {
                ...prev,
                attachments: newAttachments,
            };
        });
    };

    // ============================================
    // حذف اعتراض
    // ============================================
    const handleDeleteDispute = () => {
        if (!deleteDisputeModal.dispute) return;

        setDeleteDisputeModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(
            `/customer/disputes/${deleteDisputeModal.dispute.id}/destroy`,
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
    return (
        <PublicLayout>
            <Head title={`جزئیات رزرو #${booking.id}`} />

            <div className="booking-show-page">
                {/* ============ دکمه بازگشت ============ */}
                <div className="booking-show-back">
                    <Link href="/customer/bookings" className="back-btn">
                        <ArrowRight size={20} />
                        <span>بازگشت به نوبت‌های من</span>
                    </Link>
                </div>

                {/* ============ هدر با وضعیت ============ */}
                <div
                    className="booking-show-header"
                    style={{
                        background: `linear-gradient(135deg, ${config.bg} 0%, #ffffff 100%)`,
                        borderColor: config.border,
                    }}
                >
                    <div
                        className="booking-show-header-icon"
                        style={{
                            backgroundColor: config.bg,
                            color: config.color,
                            borderColor: config.border,
                        }}
                    >
                        <StatusIcon size={28} />
                    </div>

                    <div className="booking-show-header-content">
                        <div className="booking-show-header-top">
                            <span
                                className="booking-show-status-badge"
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
                                    {booking.latest_dispute.status ===
                                        "pending" && "اعتراض در بررسی"}
                                    {booking.latest_dispute.status ===
                                        "investigating" && "در حال بررسی"}
                                    {booking.latest_dispute.status ===
                                        "resolved" && "اعتراض تایید شد"}
                                    {booking.latest_dispute.status ===
                                        "rejected" && "اعتراض رد شد"}
                                    {booking.latest_dispute.status ===
                                        "awaiting_response" && "در انتظار پاسخ"}
                                    {booking.latest_dispute.status ===
                                        "cancelled" && "اعتراض لغو شد"}
                                </span>
                            )}

                            <span className="booking-show-code">
                                <Hash size={14} />
                                رزرو {toPersianNumber(booking.id)}
                            </span>

                            {/* شمارش معکوس برای pending */}
                            {booking.status === "pending" &&
                                booking.expires_at && (
                                    <CountdownTimer
                                        expiresAt={booking.expires_at}
                                    />
                                )}
                        </div>

                        <h1 className="booking-show-title">
                            {config.description}
                        </h1>

                        <p className="booking-show-subtitle">
                            ثبت شده در {formatFullDateTime(booking.created_at)}
                        </p>
                    </div>
                </div>
                {/* ============ بنر وضعیت اعتراض ============ */}
                {booking.has_disputes &&
                    booking.latest_dispute &&
                    booking.latest_dispute.disputed_by === "customer" && (
                        <div
                            className={`customer-dispute-banner status-${booking.latest_dispute.status}`}
                        >
                            <div className="dispute-banner-icon">
                                {booking.latest_dispute.status ===
                                    "pending" && <Clock4 size={24} />}
                                {booking.latest_dispute.status ===
                                    "investigating" && <Search size={24} />}
                                {booking.latest_dispute.status ===
                                    "awaiting_response" && (
                                    <MessageSquare size={24} />
                                )}
                                {booking.latest_dispute.status ===
                                    "resolved" && <CheckCircle size={24} />}
                                {booking.latest_dispute.status ===
                                    "rejected" && <XCircle size={24} />}
                                {booking.latest_dispute.status ===
                                    "cancelled" && <Ban size={24} />}
                            </div>

                            <div className="dispute-banner-content">
                                <div className="dispute-banner-header">
                                    <h3>
                                        {booking.latest_dispute.status ===
                                            "pending" &&
                                            "اعتراض شما در صف بررسی"}
                                        {booking.latest_dispute.status ===
                                            "investigating" &&
                                            "اعتراض شما در حال بررسی"}
                                        {booking.latest_dispute.status ===
                                            "awaiting_response" &&
                                            "در انتظار پاسخ شما"}
                                        {booking.latest_dispute.status ===
                                            "resolved" && "اعتراض شما تایید شد"}
                                        {booking.latest_dispute.status ===
                                            "rejected" && "اعتراض شما رد شد"}
                                        {booking.latest_dispute.status ===
                                            "cancelled" && "اعتراض شما لغو شد"}
                                    </h3>

                                    <span className="dispute-banner-date">
                                        ثبت:{" "}
                                        {formatFullDateTime(
                                            booking.latest_dispute.created_at,
                                        )}
                                    </span>
                                </div>

                                <p className="dispute-banner-message">
                                    {booking.latest_dispute.status ===
                                        "pending" &&
                                        "اعتراض شما ثبت شده و در انتظار بررسی ادمین است. ادمین تا ۴۸ ساعت آینده بررسی خواهد کرد."}
                                    {booking.latest_dispute.status ===
                                        "investigating" &&
                                        "ادمین در حال بررسی اعتراض شماست. لطفاً منتظر بمانید."}
                                    {booking.latest_dispute.status ===
                                        "awaiting_response" &&
                                        "ادمین نیاز به اطلاعات بیشتری دارد. لطفاً پاسخ خود را ثبت کنید."}
                                    {booking.latest_dispute.status ===
                                        "resolved" &&
                                        "اعتراض شما تایید شد. مبلغ پرداختی به کیف پول شما بازگردانده شد."}
                                    {booking.latest_dispute.status ===
                                        "rejected" &&
                                        "پس از بررسی، اعتراض شما رد شد. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید."}
                                    {booking.latest_dispute.status ===
                                        "cancelled" &&
                                        "اعتراض شما لغو شده است."}
                                </p>

                                {/* ============ جزئیات اعتراض ============ */}
                                <div className="dispute-banner-details">
                                    <div className="detail-item">
                                        <span className="detail-label">
                                            متن اعتراض:
                                        </span>
                                        <span className="detail-value">
                                            {booking.latest_dispute.reason}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">
                                            نوع اعتراض:
                                        </span>
                                        <span className="detail-value">
                                            {getDisputeTypeLabel(
                                                booking.latest_dispute
                                                    .dispute_type,
                                            )}
                                        </span>
                                    </div>

                                    {booking.latest_dispute.refund_amount >
                                        0 && (
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

                                    {booking.latest_dispute.penalty_amount >
                                        0 && (
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

                                    {booking.latest_dispute.resolution && (
                                        <div className="detail-item resolution">
                                            <span className="detail-label">
                                                پاسخ ادمین:
                                            </span>
                                            <span className="detail-value">
                                                {
                                                    booking.latest_dispute
                                                        .resolution
                                                }
                                            </span>
                                        </div>
                                    )}

                                    {booking.latest_dispute.response && (
                                        <div className="detail-item response">
                                            <span className="detail-label">
                                                پاسخ شما:
                                            </span>
                                            <span className="detail-value">
                                                {
                                                    booking.latest_dispute
                                                        .response
                                                }
                                            </span>
                                        </div>
                                    )}

                                    {/* ============ پیوست‌ها ============ */}
                                    {booking.latest_dispute.attachments &&
                                        booking.latest_dispute.attachments
                                            .length > 0 && (
                                            <div className="detail-item attachments">
                                                <span className="detail-label">
                                                    <Paperclip size={12} />
                                                    پیوست‌ها:
                                                </span>
                                                <div className="dispute-attachments-mini-grid">
                                                    {booking.latest_dispute.attachments.map(
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
                                            می‌توانید تا زمان بررسی، اطلاعات
                                            بیشتری ارسال کنید.
                                        </span>
                                    </div>
                                )}

                                {booking.latest_dispute.status ===
                                    "awaiting_response" && (
                                    <div className="dispute-banner-warning">
                                        <AlertCircle size={14} />
                                        <span>
                                            لطفاً پاسخ خود را در اسرع وقت ثبت
                                            کنید.
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
                                    {booking.latest_dispute.can_edit && (
                                        <Link
                                            href={`/customer/disputes/${booking.latest_dispute.id}/edit`}
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
                                    {booking.latest_dispute.can_delete && (
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
                                    {booking.latest_dispute.can_respond && (
                                        <button
                                            type="button"
                                            className="dispute-action-btn respond"
                                            onClick={() =>
                                                setResponseModal({
                                                    isOpen: true,
                                                    isLoading: false,
                                                    dispute:
                                                        booking.latest_dispute,
                                                })
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
                {/* ============ گرید اصلی ============ */}
                <div className="booking-show-grid">
                    {/* ============ ستون راست: جزئیات رزرو ============ */}
                    <div className="booking-show-main">
                        {/* کارت زمان و خدمت */}
                        <div className="booking-show-card">
                            <div className="booking-show-card-header">
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

                        {/* کارت آرایشگر */}
                        <div className="booking-show-card">
                            <div className="booking-show-card-header">
                                <div className="card-icon-box blue">
                                    <User size={20} />
                                </div>
                                <h2 className="card-title">آرایشگر</h2>
                            </div>

                            <div className="barber-info-card">
                                <div className="barber-info-avatar">
                                    {booking.barber?.thumbnail ? (
                                        <img
                                            src={booking.barber.thumbnail}
                                            alt={booking.barber.name}
                                        />
                                    ) : (
                                        <span>
                                            {booking.barber?.name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="barber-info-content">
                                    <h3 className="barber-info-name">
                                        {booking.barber?.name}
                                    </h3>

                                    {booking.barber?.specialty && (
                                        <div className="barber-info-specialty">
                                            <Award size={12} />
                                            {booking.barber.specialty}
                                        </div>
                                    )}

                                    <div className="barber-info-contact">
                                        {booking.barber?.phone && (
                                            <a
                                                href={`tel:${booking.barber.phone}`}
                                                className="contact-item"
                                            >
                                                <Phone size={14} />
                                                <span dir="ltr">
                                                    {toPersianNumber(
                                                        booking.barber.phone,
                                                    )}
                                                </span>
                                            </a>
                                        )}

                                        {booking.barber?.city && (
                                            <span className="contact-item">
                                                <MapPin size={14} />
                                                {booking.barber.city}
                                            </span>
                                        )}
                                    </div>

                                    {booking.barber?.address && (
                                        <div className="barber-info-address">
                                            <Building2 size={14} />
                                            <span>
                                                {booking.barber.address}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Link
                                href={`/barbers/${booking.barber.slug}/details`}
                                className="view-barber-btn"
                            >
                                <User size={16} />
                                مشاهده پروفایل آرایشگر
                            </Link>
                        </div>

                        {/* کارت پرداخت */}
                        {booking.payment && (
                            <div className="booking-show-card">
                                <div className="booking-show-card-header">
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
                                            {booking.payment.gateway_label}
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

                                    {/* ============ وضعیت پرداخت ============ */}
                                    <div className="payment-info-item">
                                        <span className="payment-info-label">
                                            وضعیت
                                        </span>

                                        {(() => {
                                            const paymentConfig =
                                                statusConfig[
                                                    booking.payment.status
                                                ] || statusConfig.pending;
                                            const PaymentIcon =
                                                paymentConfig.icon;

                                            return (
                                                <span
                                                    className="payment-status"
                                                    style={{
                                                        backgroundColor:
                                                            paymentConfig.bg,
                                                        color: paymentConfig.color,
                                                        borderColor:
                                                            paymentConfig.border,
                                                    }}
                                                >
                                                    <PaymentIcon size={12} />
                                                    {paymentConfig.label}
                                                </span>
                                            );
                                        })()}
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
                        {/* ============ کارت نظر ============ */}
                        {/* ============ کارت نظر ============ */}
                        {booking.review && (
                            <div className="booking-show-card review-card">
                                <div className="booking-show-card-header">
                                    <div className="card-icon-box yellow">
                                        <Star
                                            size={20}
                                            fill="#fbbf24"
                                            color="#fbbf24"
                                        />
                                    </div>

                                    <div className="review-header-info">
                                        <h2 className="card-title">نظر شما</h2>

                                        {/* ============ برچسب اعتراض ============ */}
                                        {booking.review.has_dispute && (
                                            <div className="review-dispute-label">
                                                <AlertTriangle size={14} />
                                                <span>
                                                    این نظر توسط مشتری‌ای ثبت
                                                    شده که به این رزرو اعتراض
                                                    دارد.
                                                </span>
                                            </div>
                                        )}

                                        {/* ============ Badge وضعیت ============ */}
                                        {(() => {
                                            const reviewStatusConfig = {
                                                pending: {
                                                    label: "در انتظار تایید",
                                                    color: "#92400e",
                                                    bg: "#fffbeb",
                                                    border: "#fde68a",
                                                    icon: Clock4,
                                                },
                                                approved: {
                                                    label: "تایید شده",
                                                    color: "#065f46",
                                                    bg: "#ecfdf5",
                                                    border: "#d1fae5",
                                                    icon: CheckCircle,
                                                },
                                                rejected: {
                                                    label: "رد شده",
                                                    color: "#991b1b",
                                                    bg: "#fef2f2",
                                                    border: "#fee2e2",
                                                    icon: XCircle,
                                                },
                                            };

                                            const cfg =
                                                reviewStatusConfig[
                                                    booking.review.status
                                                ] || reviewStatusConfig.pending;
                                            const Icon = cfg.icon;

                                            return (
                                                <span
                                                    className="review-status-badge"
                                                    style={{
                                                        backgroundColor: cfg.bg,
                                                        color: cfg.color,
                                                        borderColor: cfg.border,
                                                    }}
                                                >
                                                    <Icon size={12} />
                                                    {cfg.label}
                                                </span>
                                            );
                                        })()}
                                    </div>

                                    {/* ============ دکمه‌های ویرایش و حذف ============ */}
                                    {booking.review.status === "pending" && (
                                        <div className="review-actions">
                                            {booking.review.can_edit && (
                                                <Link
                                                    href={`/customer/bookings/reviews/${booking.review.id}/edit`}
                                                    className="review-action-btn edit"
                                                    title="ویرایش نظر"
                                                >
                                                    <Edit3 size={14} />
                                                    <span>ویرایش</span>
                                                </Link>
                                            )}

                                            {booking.review.can_delete && (
                                                <button
                                                    type="button"
                                                    className="review-action-btn delete"
                                                    onClick={() =>
                                                        setDeleteReviewModal({
                                                            isOpen: true,
                                                            isLoading: false,
                                                        })
                                                    }
                                                    title="حذف نظر"
                                                >
                                                    <Trash2 size={14} />
                                                    <span>حذف</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* ============ نمایش نظر ============ */}
                                <div className="review-display">
                                    <div className="review-display-header">
                                        <RatingStars
                                            rating={booking.review.rating}
                                            size={18}
                                            showNumber={false}
                                            showTotal={false}
                                        />
                                        <span className="review-display-date">
                                            {formatFullDateTime(
                                                booking.review.created_at,
                                            )}
                                            {booking.review.is_edited && (
                                                <span className="review-edited-badge">
                                                    ویرایش شده
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    {booking.review.comment && (
                                        <p className="review-display-comment">
                                            {booking.review.comment}
                                        </p>
                                    )}
                                </div>

                                {/* ============ پیام راهنما ============ */}
                                {booking.review.status === "pending" && (
                                    <div className="review-info-box pending">
                                        <Clock4 size={14} />
                                        <p>
                                            <strong>در انتظار تایید:</strong>{" "}
                                            نظر شما پس از تایید ادمین، در
                                            پروفایل آرایشگر نمایش داده می‌شود.
                                            تا آن زمان می‌توانید آن را ویرایش یا
                                            حذف کنید.
                                        </p>
                                    </div>
                                )}

                                {booking.review.status === "approved" && (
                                    <div className="review-info-box approved">
                                        <CheckCircle size={14} />
                                        <p>
                                            <strong>تایید شده:</strong> نظر شما
                                            در پروفایل آرایشگر نمایش داده
                                            می‌شود.
                                        </p>
                                    </div>
                                )}

                                {booking.review.status === "rejected" && (
                                    <div className="review-info-box rejected">
                                        <XCircle size={14} />
                                        <p>
                                            <strong>رد شده:</strong> نظر شما به
                                            دلیل عدم رعایت قوانین رد شده است.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ============ ستون چپ: عملیات ============ */}
                    <div className="booking-show-sidebar">
                        {/* در ستون عملیات (سمت چپ صفحه) */}
                        {booking.has_disputes &&
                            booking.latest_dispute &&
                            booking.latest_dispute.disputed_by ===
                                "customer" && (
                                <div
                                    className={`action-dispute-info status-${booking.latest_dispute.status}`}
                                >
                                    <AlertTriangle size={16} />
                                    <div>
                                        <strong>اعتراض شما</strong>
                                        <span>
                                            {booking.latest_dispute.status ===
                                                "pending" && "در صف بررسی"}
                                            {booking.latest_dispute.status ===
                                                "investigating" &&
                                                "در حال بررسی"}
                                            {booking.latest_dispute.status ===
                                                "awaiting_response" &&
                                                "در انتظار پاسخ"}
                                            {booking.latest_dispute.status ===
                                                "resolved" && "تایید شده"}
                                            {booking.latest_dispute.status ===
                                                "rejected" && "رد شده"}
                                            {booking.latest_dispute.status ===
                                                "cancelled" && "لغو شده"}
                                        </span>
                                        {booking.disputes_count > 1 && (
                                            <span className="disputes-count">
                                                {toPersianNumber(
                                                    booking.disputes_count,
                                                )}{" "}
                                                اعتراض
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        {/* خلاصه پرداخت */}
                        <div className="booking-show-card summary-card">
                            <div className="booking-show-card-header">
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

                                <div className="summary-row">
                                    <span className="summary-row-label">
                                        تخفیف
                                    </span>
                                    <span className="summary-row-value">
                                        {toPersianNumber("0")} تومان
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
                        <div className="booking-show-card actions-card">
                            <div className="booking-show-card-header">
                                <div className="card-icon-box gray">
                                    <Info size={20} />
                                </div>
                                <h2 className="card-title">عملیات</h2>
                            </div>

                            <div className="actions-list">
                                {/* ============ پرداخت مجدد ============ */}
                                {booking.can_pay && (
                                    <button
                                        onClick={handleRetryPayment}
                                        className="action-btn pay"
                                    >
                                        <CreditCard size={16} />
                                        <span>تکمیل پرداخت</span>
                                        <span className="action-badge">
                                            <Hourglass size={10} />
                                        </span>
                                    </button>
                                )}

                                {booking.can_customer_complete && (
                                    <button
                                        type="button"
                                        className="action-btn complete-customer"
                                        onClick={() =>
                                            setCompleteModal({ isOpen: true })
                                        }
                                    >
                                        <CheckCircle size={16} />
                                        <span>تایید دریافت سرویس</span>
                                    </button>
                                )}

                                {booking.can_dispute && (
                                    <button
                                        type="button"
                                        className="action-btn dispute"
                                        onClick={() =>
                                            setDisputeModal({
                                                isOpen: true,
                                                isLoading: false,
                                                reason: "",
                                                disputeType: "",
                                                errors: {},
                                                attachments: [],
                                            })
                                        }
                                    >
                                        <AlertTriangle size={16} />
                                        <span>اعتراض به تکمیل خدمت</span>
                                    </button>
                                )}

                                {/* ============ ثبت نظر ============ */}
                                {booking.can_review && (
                                    <Link
                                        href={`/customer/bookings/reviews/${booking.id}`}
                                        className="action-btn review"
                                    >
                                        <Star size={16} />
                                        <span>ثبت نظر</span>
                                    </Link>
                                )}

                                {/* ============ چاپ ============ */}
                                <button
                                    className="action-btn print"
                                    onClick={handlePrint}
                                >
                                    <Printer size={16} />
                                    <span>چاپ رسید</span>
                                </button>

                                {/* ============ تماس با آرایشگر ============ */}
                                {booking.barber?.phone && (
                                    <a
                                        href={`tel:${booking.barber.phone}`}
                                        className="action-btn contact"
                                    >
                                        <Phone size={16} />
                                        <span>تماس با آرایشگر</span>
                                    </a>
                                )}

                                {/* ============ لغو رزرو ============ */}
                                {booking.can_cancel && (
                                    <button
                                        className="action-btn cancel"
                                        onClick={() =>
                                            setCancelModal({
                                                isOpen: true,
                                                isLoading: false,
                                            })
                                        }
                                    >
                                        <XCircle size={16} />
                                        <span>لغو رزرو</span>
                                    </button>
                                )}
                            </div>

                            {/* ============ پیام‌های راهنما ============ */}
                            {/* پیام پرداخت برای pending */}
                            {booking.status === "pending" &&
                                booking.can_pay && (
                                    <div className="info-box warning">
                                        <AlertCircle size={14} />
                                        <p>
                                            برای تکمیل رزرو، لطفاً مبلغ را
                                            پرداخت کنید. در غیر این صورت، رزرو
                                            به صورت خودکار لغو می‌شود.
                                        </p>
                                    </div>
                                )}

                            {/* پیام لغو برای confirmed */}
                            {booking.can_cancel &&
                                booking.status === "confirmed" && (
                                    <div className="info-box warning">
                                        <AlertCircle size={14} />
                                        <p>
                                            لغو رزرو تا ۲ ساعت قبل از زمان نوبت
                                            امکان‌پذیر است.
                                        </p>
                                    </div>
                                )}

                            {/* پیام منقضی */}
                            {booking.is_expired && (
                                <div className="info-box danger">
                                    <XCircle size={14} />
                                    <p>
                                        زمان پرداخت منقضی شده است. لطفاً رزرو
                                        جدیدی ثبت کنید.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* راهنمای وضعیت */}
                        <div className="booking-show-card status-guide-card">
                            <div className="booking-show-card-header">
                                <div className="card-icon-box gray">
                                    <Shield size={20} />
                                </div>
                                <h2 className="card-title">راهنما</h2>
                            </div>

                            <ul className="status-guide-list">
                                {booking.status === "pending" ? (
                                    <>
                                        <li>
                                            <CreditCard size={14} />
                                            <span>
                                                برای تکمیل رزرو، مبلغ را پرداخت
                                                کنید.
                                            </span>
                                        </li>
                                        <li>
                                            <Clock4 size={14} />
                                            <span>
                                                مهلت پرداخت ۱۵ دقیقه از زمان ثبت
                                                رزرو است.
                                            </span>
                                        </li>
                                        <li>
                                            <XCircle size={14} />
                                            <span>
                                                در صورت عدم پرداخت، رزرو به صورت
                                                خودکار لغو می‌شود.
                                            </span>
                                        </li>
                                    </>
                                ) : booking.status === "confirmed" ? (
                                    <>
                                        <li>
                                            <CheckCircle size={14} />
                                            <span>
                                                رزرو تایید شده به معنی پرداخت
                                                موفق و ثبت نهایی است.
                                            </span>
                                        </li>
                                        <li>
                                            <Clock4 size={14} />
                                            <span>
                                                لطفاً ۱۰ دقیقه قبل از زمان نوبت
                                                حاضر باشید.
                                            </span>
                                        </li>
                                        <li>
                                            <XCircle size={14} />
                                            <span>
                                                لغو رزرو فقط تا ۲ ساعت قبل
                                                امکان‌پذیر است.
                                            </span>
                                        </li>
                                    </>
                                ) : booking.status === "completed" ? (
                                    <>
                                        <li>
                                            <CheckCircle size={14} />
                                            <span>
                                                خدمت با موفقیت انجام شده است.
                                            </span>
                                        </li>
                                        <li>
                                            <Star size={14} />
                                            <span>
                                                می‌توانید نظر خود را ثبت کنید.
                                            </span>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li>
                                            <XCircle size={14} />
                                            <span>این رزرو لغو شده است.</span>
                                        </li>
                                        <li>
                                            <Calendar size={14} />
                                            <span>
                                                برای رزرو جدید، به صفحه
                                                آرایشگران مراجعه کنید.
                                            </span>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            {/* ============ Modal تایید دریافت خدمت ============ */}

            <ConfirmModal
                isOpen={completeModal.isOpen}
                onClose={() =>
                    setCompleteModal({ isOpen: false, isLoading: false })
                }
                onConfirm={handleCustomerComplete}
                title="تایید دریافت خدمت"
                message="آیا خدمت مورد نظر را از آرایشگر دریافت کرده‌اید؟ با تایید، رزرو به وضعیت «تکمیل شده» تغییر می‌کند و می‌توانید نظر خود را ثبت کنید."
                confirmText="بله، دریافت کردم"
                cancelText="انصراف"
                type="success"
                isLoading={completeModal.isLoading}
            />

            {/* ============ Modal حذف نظر ============ */}
            <ConfirmModal
                isOpen={deleteReviewModal.isOpen}
                onClose={() =>
                    !deleteReviewModal.isLoading &&
                    setDeleteReviewModal({ isOpen: false, isLoading: false })
                }
                onConfirm={handleDeleteReview}
                title="حذف نظر"
                message={`آیا از حذف نظر خود مطمئن هستید؟ این عملیات قابل بازگشت نیست و امتیاز آرایشگر مجدداً محاسبه می‌شود.${
                    booking.review?.comment
                        ? `\n\nنظر شما: "${booking.review.comment.substring(0, 100)}${
                              booking.review.comment.length > 100 ? "..." : ""
                          }"`
                        : ""
                }`}
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                type="danger"
                isLoading={deleteReviewModal.isLoading}
            />
            {/* disoute modal */}
            {disputeModal.isOpen && (
                <div
                    className="dispute-modal-overlay"
                    onClick={() =>
                        !disputeModal.isLoading && closeDisputeModal()
                    }
                >
                    <div
                        className="dispute-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ============ هدر ============ */}
                        <div className="dispute-modal-header">
                            <div className="dispute-modal-icon">
                                <AlertTriangle size={28} />
                            </div>
                            <h3>اعتراض به تکمیل خدمت</h3>
                            <button
                                type="button"
                                className="dispute-modal-close"
                                onClick={closeDisputeModal}
                                disabled={disputeModal.isLoading}
                                aria-label="بستن"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* ============ هشدار ============ */}
                        <div className="dispute-modal-warning">
                            <AlertCircle size={16} />
                            <p>
                                <strong>توجه:</strong> با ثبت اعتراض، ادمین
                                بررسی خواهد کرد. لطفاً اطلاعات دقیق و صحیح وارد
                                کنید. اعتراضات نادرست ممکن است منجر به محدودیت
                                حساب شود.
                            </p>
                        </div>

                        {/* ============ انتخاب نوع اعتراض ============ */}
                        {/* ============ انتخاب نوع اعتراض ============ */}
                        <div className="dispute-form-group">
                            <label className="form-label">
                                نوع اعتراض
                                <span className="required">*</span>
                            </label>
                            <div className="dispute-type-options">
                                {[
                                    {
                                        value: "not_done",
                                        label: "خدمت انجام نشد",
                                        icon: XCircle,
                                    },
                                    {
                                        value: "incomplete",
                                        label: "خدمت ناقص بود",
                                        icon: Clock4,
                                    },
                                    {
                                        value: "poor_quality",
                                        label: "کیفیت پایین بود",
                                        icon: Star,
                                    },
                                    {
                                        value: "bad_behavior",
                                        label: "رفتار نامناسب",
                                        icon: User,
                                    },
                                    {
                                        value: "other",
                                        label: "سایر",
                                        icon: MoreHorizontal,
                                    },
                                ].map((type) => {
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

                        {/* ============ توضیحات ============ */}
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

                        {/* ============ آپلود پیوست ============ */}
                        <div className="dispute-form-group">
                            <label className="form-label">
                                <Paperclip size={14} />
                                پیوست (اختیاری)
                                <span className="form-hint">
                                    حداکثر ۵ فایل - هر فایل تا ۲ مگابایت
                                </span>
                            </label>

                            <div className="dispute-attachments">
                                {/* پیش‌نمایش فایل‌های انتخاب شده */}
                                {disputeModal.attachments &&
                                    disputeModal.attachments.length > 0 && (
                                        <div className="attachments-preview">
                                            {disputeModal.attachments.map(
                                                (attachment, index) => (
                                                    <div
                                                        key={index}
                                                        className="attachment-item"
                                                    >
                                                        {attachment.preview ? (
                                                            <img
                                                                src={
                                                                    attachment.preview
                                                                }
                                                                alt={`پیوست ${
                                                                    index + 1
                                                                }`}
                                                                className="attachment-image"
                                                            />
                                                        ) : (
                                                            <div className="attachment-icon">
                                                                <FileText
                                                                    size={24}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="attachment-info">
                                                            <span className="attachment-name">
                                                                {
                                                                    attachment
                                                                        .file
                                                                        .name
                                                                }
                                                            </span>
                                                            <span className="attachment-size">
                                                                {(
                                                                    attachment
                                                                        .file
                                                                        .size /
                                                                    1024
                                                                ).toFixed(
                                                                    1,
                                                                )}{" "}
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
                                                            title="حذف"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}

                                {/* دکمه آپلود */}
                                {disputeModal.attachments &&
                                    disputeModal.attachments.length < 5 && (
                                        <label className="attachment-upload-btn">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={
                                                    handleAttachmentChange
                                                }
                                                disabled={
                                                    disputeModal.isLoading
                                                }
                                                style={{ display: "none" }}
                                            />
                                            <Upload size={18} />
                                            <span>افزودن عکس</span>
                                            <span className="upload-count">
                                                {toPersianNumber(
                                                    disputeModal.attachments
                                                        .length,
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

                        {/* ============ دکمه‌ها ============ */}
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
        </PublicLayout>
    );
}
