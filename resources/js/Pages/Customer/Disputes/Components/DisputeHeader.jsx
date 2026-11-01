import React, { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import {
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle,
    Loader,
    MessageSquare,
    Ban,
    Info,
    Paperclip,
    Eye,
    Timer,
    Edit3,
    Trash2,
} from "lucide-react";
import { formatFullDateTime } from "../../../../utils/dateHelpers";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import { getDisputeTypeConfig } from "../../../../Constants/disputeTypes";

import "../Assets/css/Header.css";

import DeleteConfirmModal from "./DeleteConfirmModal";
import RespondModal from "./RespondModal";

/* ============================================
   نگاشت آیکون‌ها
   ============================================ */
const STATUS_ICONS = {
    pending: Clock,
    investigating: Loader,
    awaiting_response: AlertCircle,
    resolved: CheckCircle2,
    rejected: XCircle,
    cancelled: XCircle,
};

const BANNER_ICONS = {
    pending: Clock,
    investigating: Loader,
    awaiting_response: MessageSquare,
    resolved: CheckCircle2,
    rejected: XCircle,
    cancelled: Ban,
};

const getBannerMessage = (status, isMyDispute) => {
    const messages = {
        pending: isMyDispute
            ? "اعتراض شما ثبت شده و در انتظار بررسی ادمین است. ادمین تا ۴۸ ساعت آینده بررسی خواهد کرد."
            : "مشتری از شما اعتراض کرده است. ادمین در حال بررسی است. لطفاً منتظر بمانید.",
        investigating: isMyDispute
            ? "ادمین در حال بررسی اعتراض شماست. لطفاً منتظر بمانید."
            : "ادمین در حال بررسی اعتراض مشتری علیه شماست. لطفاً منتظر بمانید.",
        awaiting_response: isMyDispute
            ? "ادمین نیاز به اطلاعات بیشتری دارد. لطفاً پاسخ خود را ثبت کنید."
            : "ادمین نیاز به اطلاعات بیشتری درباره اعتراض مشتری دارد. لطفاً پاسخ خود را ثبت کنید.",
        resolved: isMyDispute
            ? "اعتراض شما تایید شد."
            : "اعتراض مشتری تایید شد.",
        rejected: isMyDispute
            ? "پس از بررسی، اعتراض شما رد شد. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید."
            : "پس از بررسی، اعتراض مشتری رد شد. رزرو در وضعیت تکمیل باقی می‌ماند.",
        cancelled: isMyDispute
            ? "اعتراض شما لغو شده است."
            : "اعتراض مشتری لغو شده است.",
    };
    return messages[status] || "";
};

const getBannerTitle = (status) => {
    const titles = {
        pending: "اعتراض شما در صف بررسی",
        investigating: "اعتراض شما در حال بررسی",
        awaiting_response: "در انتظار پاسخ شما",
        resolved: "اعتراض شما تایید شد",
        rejected: "اعتراض شما رد شد",
        cancelled: "اعتراض شما لغو شد",
    };
    return titles[status] || "اعتراض";
};

/* ============================================
   کامپوننت اصلی
   ============================================ */
export default function DisputeHeader({
    dispute,
    booking,
    permissions,
    onEdit, // ← باز کردن مودال ویرایش
    onRespond, // ← باز کردن مودال پاسخ
}) {
    const color = dispute.status_color || "gray";
    const StatusIcon = STATUS_ICONS[dispute.status] || Clock;
    const BannerIcon = BANNER_ICONS[dispute.status] || Info;

    // آیا این اعتراض توسط من (مشتری) ثبت شده؟
    const isMyDispute = dispute.disputed_by === "customer";

    // ============ شمارش معکوس ============
    const [remainingSeconds, setRemainingSeconds] = useState(() =>
        Math.max(
            0,
            Math.ceil(Number(permissions.edit_hours_remaining || 0) * 3600),
        ),
    );

    useEffect(() => {
        setRemainingSeconds(
            Math.max(
                0,
                Math.ceil(Number(permissions.edit_hours_remaining || 0) * 3600),
            ),
        );
    }, [permissions.edit_hours_remaining]);

    useEffect(() => {
        if (remainingSeconds <= 0) return;

        const timer = setTimeout(() => {
            setRemainingSeconds((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearTimeout(timer);
    }, [remainingSeconds]);

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

    // ============ مودال حذف ============
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRespondModal, setShowRespondModal] = useState(false);

    return (
        <>
            {/* ============ هدر اصلی ============ */}
            <div className={`dispute-header ${color}`}>
                <div className="dispute-header-icon">
                    <StatusIcon size={28} />
                </div>
                <div className="dispute-header-content">
                    <div className="dispute-header-top">
                        <span className={`dispute-status-badge ${color}`}>
                            <StatusIcon size={14} />
                            {dispute.status_label}
                        </span>
                        <span className="dispute-code">#{dispute.id}</span>
                        <span className="dispute-type-badge">
                            {dispute.dispute_type_label}
                        </span>
                    </div>
                    <h1 className="dispute-title">اعتراض به رزرو</h1>
                    <p className="dispute-subtitle">
                        ثبت شده در {formatFullDateTime(dispute.created_at)}
                    </p>
                </div>
            </div>

            {/* ============ کارت مهلت ویرایش/حذف ============ */}
            {(permissions.can_edit || permissions.can_delete) &&
                remainingSeconds > 0 && (
                    <div className="dispute-deadline-card">
                        <div className="dispute-deadline-header">
                            <div className="dispute-deadline-icon">
                                <Timer size={24} />
                            </div>
                            <div className="dispute-deadline-content">
                                <h3>مهلت ویرایش و حذف اعتراض</h3>
                                <p>
                                    پس از پایان زمان، امکان انجام عملیات مجاز
                                    روی این اعتراض از بین می‌رود.
                                </p>
                            </div>
                            <div className="dispute-deadline-timer">
                                <span>زمان باقی‌مانده</span>
                                <strong dir="ltr">
                                    {formatCountdown(remainingSeconds)}
                                </strong>
                            </div>
                        </div>

                        <div className="dispute-deadline-divider" />

                        <div className="dispute-deadline-footer">
                            <div className="dispute-deadline-footer-title">
                                <Edit3 size={17} />
                                <span>عملیات اعتراض</span>
                            </div>
                            <div className="dispute-show-edit-actions">
                                {permissions.can_edit && (
                                    <button
                                        type="button"
                                        className="dispute-show-edit-btn"
                                        onClick={onEdit}
                                    >
                                        <Edit3 size={14} />
                                        ویرایش اعتراض
                                    </button>
                                )}

                                {permissions.can_delete && (
                                    <button
                                        type="button"
                                        className="dispute-show-delete-btn"
                                        onClick={() => setShowDeleteModal(true)}
                                    >
                                        <Trash2 size={14} />
                                        حذف اعتراض
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            {/* ============ بنر اعتراض آرایشگر به مشتری ============ */}
            {dispute.disputed_by === "customer" && (
                <div
                    className={`customer-dispute-banner status-${dispute.status}`}
                >
                    <div className="dispute-banner-icon">
                        <BannerIcon size={24} />
                    </div>

                    <div className="dispute-banner-content">
                        <div className="dispute-banner-header">
                            <h3>{getBannerTitle(dispute.status)}</h3>
                            <span className="dispute-banner-date">
                                ثبت: {formatFullDateTime(dispute.created_at)}
                            </span>
                        </div>

                        <p className="dispute-banner-message">
                            {getBannerMessage(dispute.status, isMyDispute)}
                        </p>

                        {/* پیام ادمین */}
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
                                    {dispute.status === "awaiting_response" && (
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
                                            لطفاً پیام مدیریت را با دقت مطالعه
                                            کرده و پاسخ یا مدارک درخواستی را از
                                            طریق بخش ثبت پاسخ ارسال کنید.
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* جزئیات */}
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
                                    {getDisputeTypeConfig(dispute.dispute_type)
                                        ?.label || dispute.dispute_type_label}
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

                            {/* پیوست‌ها */}
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
                                                            <Eye size={14} />
                                                        </div>
                                                    </a>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* هشدارها */}
                        {dispute.status === "pending" &&
                            permissions.can_edit &&
                            remainingSeconds > 0 && (
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

                        {/* دکمه پاسخ (برای اعتراض آرایشگر) */}
                        {permissions.can_respond && (
                            <div className="dispute-banner-actions">
                                <button
                                    type="button"
                                    className="dispute-action-btn respond"
                                    onClick={() => setShowRespondModal(true)}
                                    title="ثبت پاسخ"
                                >
                                    <MessageSquare size={14} />
                                    <span>ثبت پاسخ</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ============ ✅ مودال حذف (از اینجا باز می‌شود) ============ */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                dispute={dispute}
            />

            <RespondModal
                isOpen={showRespondModal}
                onClose={() => setShowRespondModal(false)}
                dispute={dispute}
            />
        </>
    );
}
