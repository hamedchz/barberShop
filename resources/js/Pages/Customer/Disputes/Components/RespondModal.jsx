import React, { useState, useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import {
    X,
    Send,
    AlertCircle,
    MessageCircle,
    Upload,
    Trash2,
    Image as ImageIcon,
    Paperclip,
} from "lucide-react";
import { formatFullDateTime } from "../../../../utils/dateHelpers";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import "../Assets/css/RespondModal.css";
const MAX_FILES = 5;
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function RespondModal({ isOpen, onClose, dispute }) {
    const fileInputRef = useRef(null);
    const [attachments, setAttachments] = useState([]);
    const [attachmentError, setAttachmentError] = useState("");

    const { data, setData, post, processing, errors, reset } = useForm({
        response: "",
        attachments: [],
    });

    // ریست هنگام باز شدن
    useEffect(() => {
        if (isOpen) {
            setData({ response: "", attachments: [] });
            setAttachments([]);
            setAttachmentError("");
        }
    }, [isOpen]);

    // ============ انتخاب فایل ============
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setAttachmentError("");

        // بررسی تعداد
        if (attachments.length + files.length > MAX_FILES) {
            setAttachmentError(
                `حداکثر ${MAX_FILES} فایل مجاز است. شما ${attachments.length} فایل دارید.`,
            );
            return;
        }

        const validFiles = [];

        for (const file of files) {
            // بررسی نوع
            if (!ACCEPTED_TYPES.includes(file.type)) {
                setAttachmentError("فقط فرمت‌های JPG، PNG و WEBP مجاز هستند.");
                continue;
            }

            // بررسی حجم
            if (file.size > MAX_FILE_SIZE) {
                setAttachmentError(
                    `حجم فایل ${file.name} بیشتر از ۲ مگابایت است.`,
                );
                continue;
            }

            // بررسی تکراری بودن
            const isDuplicate = attachments.some(
                (att) =>
                    att.file.name === file.name && att.file.size === file.size,
            );
            if (isDuplicate) {
                continue;
            }

            // پیش‌نمایش
            validFiles.push({
                file,
                preview: URL.createObjectURL(file),
            });
        }

        const newAttachments = [...attachments, ...validFiles];
        setAttachments(newAttachments);
        setData(
            "attachments",
            newAttachments.map((a) => a.file),
        );

        // ریست input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // ============ حذف فایل ============
    const handleRemoveFile = (index) => {
        const newAttachments = [...attachments];

        // آزاد کردن URL preview
        URL.revokeObjectURL(newAttachments[index].preview);
        newAttachments.splice(index, 1);

        setAttachments(newAttachments);
        setData(
            "attachments",
            newAttachments.map((a) => a.file),
        );
    };

    // ============ ارسال ============
    const handleSubmit = (e) => {
        e.preventDefault();

        post(
            route("customer.disputes.respond", {
                dispute: dispute.id,
                from_disputes_show: true,
            }),
            {
                preserveScroll: true,
                forceFormData: true,

                onSuccess: () => {
                    attachments.forEach((att) => {
                        if (att.preview) {
                            URL.revokeObjectURL(att.preview);
                        }
                    });

                    reset();
                    setAttachments([]);
                    onClose();
                },
            },
        );
    };

    // ============ پاکسازی هنگام بسته شدن ============
    useEffect(() => {
        if (!isOpen) {
            attachments.forEach((att) => URL.revokeObjectURL(att.preview));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content respond-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="respond-icon">
                        <MessageCircle size={24} />
                    </div>
                    <h3>پاسخ به اعتراض</h3>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        disabled={processing}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* پیام ادمین */}
                        {dispute.admin_request_message && (
                            <div className="admin-request-box">
                                <div className="admin-request-header">
                                    <MessageCircle size={14} />
                                    <span>درخواست ادمین:</span>
                                </div>
                                <p>{dispute.admin_request_message}</p>
                                <span className="admin-request-date">
                                    {formatFullDateTime(
                                        dispute.admin_request_at,
                                    )}
                                </span>
                            </div>
                        )}

                        {/* متن اعتراض اصلی */}
                        <div className="original-dispute-box">
                            <span className="original-label">
                                متن اعتراض شما:
                            </span>
                            <p>{dispute.reason}</p>
                        </div>

                        {/* پاسخ */}
                        <div className="form-group">
                            <label className="form-label">
                                پاسخ شما
                                <span className="required">*</span>
                            </label>
                            <textarea
                                className={`form-textarea ${
                                    errors.response ? "error" : ""
                                }`}
                                value={data.response}
                                onChange={(e) =>
                                    setData("response", e.target.value)
                                }
                                rows={6}
                                maxLength={1000}
                                placeholder="پاسخ خود را بنویسید..."
                                disabled={processing}
                            />
                            <div className="form-footer">
                                {errors.response ? (
                                    <span className="form-error">
                                        <AlertCircle size={12} />
                                        {errors.response}
                                    </span>
                                ) : (
                                    <span className="form-hint">
                                        حداکثر ۱۰۰۰ کاراکتر
                                    </span>
                                )}
                                <span className="form-counter">
                                    {data.response.length} / 1000
                                </span>
                            </div>
                        </div>

                        {/* ============ آپلود پیوست ============ */}
                        <div className="form-group">
                            <label className="form-label">
                                <Paperclip size={14} />
                                پیوست‌ها (اختیاری)
                            </label>

                            {/* دکمه آپلود */}
                            <label
                                className={`attachment-upload-btn ${
                                    processing ? "disabled" : ""
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={ACCEPTED_TYPES.join(",")}
                                    multiple
                                    onChange={handleFileSelect}
                                    disabled={
                                        processing ||
                                        attachments.length >= MAX_FILES
                                    }
                                    style={{ display: "none" }}
                                />
                                <Upload size={18} />
                                <span>
                                    {attachments.length === 0
                                        ? "آپلود تصویر (اختیاری)"
                                        : "افزودن تصویر دیگر"}
                                </span>
                                <span className="upload-count">
                                    {attachments.length} / {MAX_FILES}
                                </span>
                            </label>

                            {/* راهنما */}
                            <div className="attachment-hint">
                                فقط JPG, PNG, WEBP • حداکثر ۲ مگابایت • حداکثر{" "}
                                {toPersianNumber(MAX_FILES)} فایل
                            </div>

                            {/* خطای آپلود */}
                            {attachmentError && (
                                <div className="form-error">
                                    <AlertCircle size={12} />
                                    {attachmentError}
                                </div>
                            )}

                            {/* خطای سرور */}
                            {errors.attachments && (
                                <div className="form-error">
                                    <AlertCircle size={12} />
                                    {errors.attachments}
                                </div>
                            )}

                            {/* پیش‌نمایش فایل‌ها */}
                            {attachments.length > 0 && (
                                <div className="attachments-preview-grid">
                                    {attachments.map((att, index) => (
                                        <div
                                            key={index}
                                            className="attachment-preview-item"
                                        >
                                            <img
                                                src={att.preview}
                                                alt={att.file.name}
                                            />
                                            <div className="attachment-preview-info">
                                                <span className="attachment-name">
                                                    {att.file.name}
                                                </span>
                                                <span className="attachment-size">
                                                    {(
                                                        att.file.size / 1024
                                                    ).toFixed(0)}{" "}
                                                    KB
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="attachment-remove"
                                                onClick={() =>
                                                    handleRemoveFile(index)
                                                }
                                                disabled={processing}
                                                title="حذف"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                            disabled={processing}
                        >
                            انصراف
                        </button>
                        <button
                            type="submit"
                            className="btn-confirm"
                            disabled={processing}
                        >
                            {processing ? (
                                <span className="spinner" />
                            ) : (
                                <Send size={16} />
                            )}
                            {processing ? "در حال ارسال..." : "ارسال پاسخ"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
