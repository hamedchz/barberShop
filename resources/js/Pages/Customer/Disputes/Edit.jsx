import React, { useState, useEffect, useRef } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import PublicLayout from "../Layouts/PublicLayout";
import "../Assets/DisputeEdit.css";
import DisputeCountdown from "../Components/DisputeCountdown";
import Swal from "sweetalert2";
import {
    ArrowRight,
    AlertTriangle,
    AlertCircle,
    XCircle,
    Clock4,
    Star,
    User,
    MoreHorizontal,
    X,
    Paperclip,
    Upload,
    FileText,
    CheckCircle,
    Save,
    Info,
    Image as ImageIcon,
    Loader2,
} from "lucide-react";
import { toJalaali } from "jalaali-js";
import {
    toPersianNumber,
    toPersianTimeRange,
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

// ============ انواع اعتراض ============
const disputeTypes = [
    { value: "not_done", label: "خدمت انجام نشد", icon: XCircle },
    { value: "incomplete", label: "خدمت ناقص بود", icon: Clock4 },
    { value: "poor_quality", label: "کیفیت پایین بود", icon: Star },
    { value: "bad_behavior", label: "رفتار نامناسب", icon: User },
    { value: "other", label: "سایر", icon: MoreHorizontal },
];

export default function DisputeEdit({ auth, dispute, booking }) {
    // ============================================
    // useForm برای مدیریت فرم
    // ============================================
    const { data, setData, post, processing, errors } = useForm({
        _method: "PUT",
        reason: dispute.reason || "",
        dispute_type: dispute.dispute_type || "",
        attachments: [], // فایل‌های جدید
        keep_attachments: dispute.attachments.map((att) => att.path), // پیوست‌های نگه‌داشته شده
    });

    // ============================================
    // State برای پیوست‌ها
    // ============================================
    const [existingAttachments, setExistingAttachments] = useState(
        dispute.attachments || [],
    );

    const [newAttachments, setNewAttachments] = useState([]);

    const [attachmentErrors, setAttachmentErrors] = useState(null);

    // ============================================
    // توابع مدیریت پیوست
    // ============================================

    // ---------- انتخاب فایل جدید ----------
    const handleAttachmentChange = (e) => {
        const files = Array.from(e.target.files);

        const totalFiles =
            existingAttachments.length + newAttachments.length + files.length;

        if (totalFiles > 5) {
            setAttachmentErrors("حداکثر ۵ فایل می‌توانید داشته باشید.");
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

        const newList = validFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        const updatedNewAttachments = [...newAttachments, ...newList];
        setNewAttachments(updatedNewAttachments);

        setData(
            "attachments",
            updatedNewAttachments.map((att) => att.file),
        );

        setAttachmentErrors(
            fileErrors.length > 0 ? "⚠️ " + fileErrors.join(" • ") : null,
        );

        e.target.value = "";
    };

    // ---------- حذف پیوست موجود ----------
    const handleRemoveExistingAttachment = (index) => {
        const updated = [...existingAttachments];
        const removed = updated.splice(index, 1)[0];

        setExistingAttachments(updated);

        // حذف از keep_attachments
        setData(
            "keep_attachments",
            data.keep_attachments.filter((path) => path !== removed.path),
        );
    };

    // ---------- حذف پیوست جدید ----------
    const handleRemoveNewAttachment = (index) => {
        const updated = [...newAttachments];

        if (updated[index]?.preview) {
            URL.revokeObjectURL(updated[index].preview);
        }

        updated.splice(index, 1);
        setNewAttachments(updated);

        setData(
            "attachments",
            updated.map((att) => att.file),
        );
    };

    // ---------- ارسال فرم ----------
    const handleSubmit = (e) => {
        e.preventDefault();

        post(`/customer/disputes/${dispute.id}`, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    // ============================================
    // محاسبه زمان باقی‌مانده با ساعت، دقیقه و ثانیه
    // ============================================
    const [timeRemaining, setTimeRemaining] = useState(null);

    const redirectingRef = useRef(false);

    useEffect(() => {
        if (dispute.status !== "pending") {
            setTimeRemaining(null);
            return;
        }

        const calculateTimeRemaining = () => {
            const createdAt = new Date(dispute.created_at);
            const deadline = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000);

            const now = new Date();
            const diff = deadline - now;

            if (diff <= 0) {
                setTimeRemaining(null);

                if (!redirectingRef.current) {
                    redirectingRef.current = true;
                    Swal.fire({
                        icon: "error",
                        title: "زمان ویرایش اعتراض به پایان رسیده است.",
                        confirmButtonText: "باشه",
                        customClass: {
                            popup: "rtl-alert",
                        },
                    });

                    router.get(`/customer/bookings/${booking.id}`);
                }

                return;
            }

            const hours = Math.floor(diff / 1000 / 60 / 60);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeRemaining({
                hours,
                minutes,
                seconds,
                totalMs: diff,
            });
        };

        calculateTimeRemaining();

        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [dispute.status, dispute.created_at, dispute.id]);

    const totalAttachments = existingAttachments.length + newAttachments.length;

    return (
        <PublicLayout>
            <Head title={`ویرایش اعتراض #${dispute.id}`} />

            <div className="dispute-edit-page">
                {/* ============ دکمه بازگشت ============ */}
                <div className="dispute-edit-back">
                    <Link
                        href={`/customer/bookings/${booking.id}`}
                        className="back-btn"
                    >
                        <ArrowRight size={20} />
                        <span>بازگشت به جزئیات رزرو</span>
                    </Link>
                </div>

                {/* ============ هدر ============ */}
                <div className="dispute-edit-header">
                    <div className="dispute-edit-header-icon">
                        <AlertTriangle size={28} />
                    </div>
                    <div>
                        <h1 className="dispute-edit-title">ویرایش اعتراض</h1>
                        <p className="dispute-edit-subtitle">
                            می‌توانید اطلاعات اعتراض خود را تا قبل از بررسی
                            ادمین ویرایش کنید.
                        </p>
                    </div>
                </div>

                {/* ============ هشدار زمان ============ */}
                {dispute.status === "pending" && (
                    <DisputeCountdown
                        createdAt={dispute.created_at}
                        status={dispute.status}
                    />
                )}

                {/* ============ هشدار ویرایش شده ============ */}
                {dispute.edit_count > 0 && (
                    <div className="dispute-edit-alert info">
                        <Info size={18} />
                        <div>
                            <strong>
                                این اعتراض قبلاً{" "}
                                {toPersianNumber(dispute.edit_count)} بار ویرایش
                                شده است
                            </strong>
                            <span>هر ویرایش برای ادمین ثبت می‌شود.</span>
                        </div>
                    </div>
                )}

                {/* ============ خلاصه رزرو ============ */}
                <div className="dispute-edit-booking">
                    {/* آرایشگر */}
                    <div className="booking-summary-item">
                        <div className="booking-summary-avatar">
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
                        <div className="booking-summary-info">
                            <span className="booking-summary-label">
                                آرایشگر
                            </span>
                            <span className="booking-summary-value">
                                {booking.barber?.name}
                            </span>
                        </div>
                    </div>

                    <div className="booking-summary-divider"></div>

                    {/* خدمت */}
                    <div className="booking-summary-item">
                        <div className="booking-summary-icon green">
                            <Star size={18} fill="#10b981" color="#10b981" />
                        </div>
                        <div className="booking-summary-info">
                            <span className="booking-summary-label">خدمت</span>
                            <span className="booking-summary-value">
                                {booking.service?.name}
                            </span>
                        </div>
                    </div>

                    <div className="booking-summary-divider"></div>

                    {/* تاریخ */}
                    <div className="booking-summary-item">
                        <div className="booking-summary-icon blue">
                            <Clock4 size={18} />
                        </div>
                        <div className="booking-summary-info">
                            <span className="booking-summary-label">تاریخ</span>
                            <span className="booking-summary-value">
                                {getDayName(booking.date)}{" "}
                                {formatJalaliDate(booking.date)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ============ فرم ============ */}
                <form onSubmit={handleSubmit} className="dispute-edit-form">
                    {/* ============ نوع اعتراض ============ */}
                    <div className="dispute-edit-section">
                        <div className="dispute-edit-section-header">
                            <div className="dispute-edit-section-icon red">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h2 className="dispute-edit-section-title">
                                    نوع اعتراض
                                </h2>
                                <p className="dispute-edit-section-subtitle">
                                    نوع اعتراض خود را انتخاب کنید
                                </p>
                            </div>
                        </div>

                        <div className="dispute-type-options">
                            {disputeTypes.map((type) => {
                                const Icon = type.icon;
                                const isSelected =
                                    data.dispute_type === type.value;

                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        className={`dispute-type-btn ${
                                            isSelected ? "selected" : ""
                                        }`}
                                        onClick={() =>
                                            setData("dispute_type", type.value)
                                        }
                                        disabled={processing}
                                    >
                                        <Icon size={16} />
                                        <span>{type.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {errors.dispute_type && (
                            <div className="form-error">
                                <AlertCircle size={14} />
                                <span>{errors.dispute_type}</span>
                            </div>
                        )}
                    </div>

                    {/* ============ توضیحات ============ */}
                    <div className="dispute-edit-section">
                        <div className="dispute-edit-section-header">
                            <div className="dispute-edit-section-icon blue">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h2 className="dispute-edit-section-title">
                                    توضیحات
                                </h2>
                                <p className="dispute-edit-section-subtitle">
                                    دلیل اعتراض خود را کامل توضیح دهید
                                </p>
                            </div>
                        </div>

                        <textarea
                            className={`form-textarea ${
                                errors.reason ? "error" : ""
                            }`}
                            value={data.reason}
                            onChange={(e) => setData("reason", e.target.value)}
                            placeholder="لطفاً توضیح دهید چه اتفاقی افتاده است..."
                            rows={6}
                            maxLength={1000}
                            disabled={processing}
                        />

                        <div className="char-counter">
                            {toPersianNumber(data.reason.length)} /{" "}
                            {toPersianNumber(1000)}
                        </div>

                        {errors.reason && (
                            <div className="form-error">
                                <AlertCircle size={14} />
                                <span>{errors.reason}</span>
                            </div>
                        )}
                    </div>

                    {/* ============ پیوست‌ها ============ */}
                    <div className="dispute-edit-section">
                        <div className="dispute-edit-section-header">
                            <div className="dispute-edit-section-icon purple">
                                <Paperclip size={20} />
                            </div>
                            <div>
                                <h2 className="dispute-edit-section-title">
                                    پیوست‌ها
                                </h2>
                                <p className="dispute-edit-section-subtitle">
                                    حداکثر ۵ فایل - هر فایل تا ۲ مگابایت
                                </p>
                            </div>
                            <span className="attachments-counter-badge">
                                {toPersianNumber(totalAttachments)} / ۵
                            </span>
                        </div>

                        {/* پیوست‌های موجود */}
                        {existingAttachments.length > 0 && (
                            <div className="attachments-group">
                                <h3 className="attachments-group-title">
                                    <CheckCircle size={14} />
                                    پیوست‌های فعلی
                                </h3>
                                <div className="attachments-preview">
                                    {existingAttachments.map((att, index) => (
                                        <div
                                            key={index}
                                            className="attachment-item"
                                        >
                                            <img
                                                src={att.url}
                                                alt={att.name}
                                                className="attachment-image"
                                            />

                                            <div className="attachment-info">
                                                <span className="attachment-name">
                                                    {att.name}
                                                </span>
                                                <span className="attachment-size">
                                                    پیوست موجود
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                className="attachment-remove"
                                                onClick={() =>
                                                    handleRemoveExistingAttachment(
                                                        index,
                                                    )
                                                }
                                                disabled={processing}
                                                title="حذف"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* پیوست‌های جدید */}
                        {newAttachments.length > 0 && (
                            <div className="attachments-group">
                                <h3 className="attachments-group-title">
                                    <ImageIcon size={14} />
                                    پیوست‌های جدید
                                </h3>
                                <div className="attachments-preview">
                                    {newAttachments.map((att, index) => (
                                        <div
                                            key={index}
                                            className="attachment-item new"
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
                                                        att.file.size / 1024
                                                    ).toFixed(1)}{" "}
                                                    KB
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                className="attachment-remove"
                                                onClick={() =>
                                                    handleRemoveNewAttachment(
                                                        index,
                                                    )
                                                }
                                                disabled={processing}
                                                title="حذف"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* دکمه آپلود */}
                        {totalAttachments < 5 && (
                            <label className="attachment-upload-btn">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleAttachmentChange}
                                    disabled={processing}
                                    style={{ display: "none" }}
                                />
                                <Upload size={18} />
                                <span>افزودن عکس جدید</span>
                                <span className="upload-count">
                                    {toPersianNumber(totalAttachments)} / ۵
                                </span>
                            </label>
                        )}

                        {attachmentErrors && (
                            <div className="form-error">
                                <AlertCircle size={14} />
                                <span>{attachmentErrors}</span>
                            </div>
                        )}
                    </div>

                    {/* ============ اطلاعات ویرایش ============ */}
                    <div className="dispute-edit-info-box">
                        <Info size={16} />
                        <p>
                            <strong>نکته:</strong> با ذخیره تغییرات، اعتراض شما
                            مجدداً به ادمین ارسال می‌شود.
                            {dispute.edit_count > 0 && (
                                <>
                                    {" "}
                                    این{" "}
                                    {toPersianNumber(dispute.edit_count + 1)}
                                    امین ویرایش شماست.
                                </>
                            )}
                        </p>
                    </div>

                    {/* ============ دکمه‌های عملیات ============ */}
                    <div className="dispute-edit-actions">
                        <Link
                            href={`/customer/bookings/${booking.id}`}
                            className="btn-cancel"
                        >
                            انصراف
                        </Link>

                        <button
                            type="submit"
                            className="btn-save"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 size={18} className="spin" />
                                    در حال ذخیره...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    ذخیره تغییرات
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </PublicLayout>
    );
}
