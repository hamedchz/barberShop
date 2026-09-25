import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import ConfirmModal from "../../Admin/Components/ConfirmModal";
import TimePicker from "../Components/TimePicker";

import {
    toPersianTime,
    toPersianTimeRange,
    toPersianNumber,
} from "../../../utils/persianNumbers";
import {
    Calendar,
    Plus,
    Trash2,
    Clock,
    AlertCircle,
    CheckCircle,
    Info,
    Sunrise,
    Sun,
    Sunset,
    Moon,
    Edit3,
    ChevronLeft,
} from "lucide-react";

// ============ آیکون هر روز ============
const dayIcons = {
    0: Sunrise, // شنبه
    1: Sun, // یکشنبه
    2: Sun, // دوشنبه
    3: Sun, // سه‌شنبه
    4: Sun, // چهارشنبه
    5: Sunset, // پنجشنبه
    6: Moon, // جمعه
};

// ============ رنگ هر روز (اختیاری) ============
const dayColors = {
    0: { bg: "#ecfdf5", color: "#065f46", border: "#d1fae5" },
    1: { bg: "#eff6ff", color: "#1e40af", border: "#dbeafe" },
    2: { bg: "#f5f3ff", color: "#5b21b6", border: "#ede9fe" },
    3: { bg: "#fff7ed", color: "#9a3412", border: "#ffedd5" },
    4: { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
    5: { bg: "#fce7f3", color: "#9d174d", border: "#fbcfe8" },
    6: { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" },
};

export default function AvailabilitiesIndex({
    auth,
    availabilities,
    daysOfWeek,
}) {
    const [selectedDay, setSelectedDay] = useState(0);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("22:00");
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ============ State Modal حذف ============
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        availability: null,
        isLoading: false,
    });

    // ============ بررسی اینکه روز انتخاب شده قبلاً وجود دارد یا نه ============
    const isDayAlreadyDefined = availabilities.some(
        (a) => a.day_of_week === selectedDay,
    );
    const normalizedStart = startTime.substring(0, 5); // "09:00:00" → "09:00"
    const normalizedEnd = endTime.substring(0, 5);
    // ============ ذخیره ============
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        router.post(
            "/barber/availabilities",
            {
                day_of_week: selectedDay,
                start_time: normalizedStart,
                end_time: normalizedEnd,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    setErrors({});
                },
                onError: (err) => {
                    setErrors(err);
                    setIsSubmitting(false);
                },
            },
        );
    };

    // ============ Modal حذف ============
    const openDeleteModal = (availability) =>
        setDeleteModal({ isOpen: true, availability, isLoading: false });

    const closeDeleteModal = () =>
        setDeleteModal({
            isOpen: false,
            availability: null,
            isLoading: false,
        });

    const handleConfirmDelete = () => {
        if (!deleteModal.availability) return;
        setDeleteModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(`/barber/availabilities/${deleteModal.availability.id}`, {
            preserveScroll: true,
            onSuccess: () => closeDeleteModal(),
            onError: () =>
                setDeleteModal((prev) => ({
                    ...prev,
                    isLoading: false,
                })),
        });
    };

    return (
        <Layout>
            <Head title="برنامه هفتگی" />

            <div className="center-column">
                {/* ============ هدر صفحه ============ */}
                <div className="roles-page-header">
                    <div>
                        <h1 className="roles-page-title">برنامه هفتگی</h1>
                        <p
                            style={{
                                color: "#6b7280",
                                fontSize: "0.875rem",
                                marginTop: "0.25rem",
                            }}
                        >
                            روزها و ساعات کاری خود را در طول هفته مشخص کنید.
                        </p>
                    </div>
                    <div className="availability-header-badge">
                        <Calendar size={16} />
                        <span>
                            {availabilities.length.toLocaleString("fa-IR")} روز
                            از ۷ روز تعریف شده
                        </span>
                    </div>
                </div>

                {/* ============ راهنما ============ */}
                <div className="availability-guide">
                    <div className="availability-guide-icon">
                        <Info size={22} />
                    </div>
                    <div className="availability-guide-content">
                        <h3 className="availability-guide-title">
                            راهنمای تنظیم برنامه هفتگی
                        </h3>
                        <ul className="availability-guide-list">
                            <li>
                                <CheckCircle size={14} />
                                <span>
                                    <strong>روزهای کاری:</strong> روزهایی که
                                    می‌خواهید نوبت بپذیرید را انتخاب و ساعت شروع
                                    و پایان را مشخص کنید.
                                </span>
                            </li>
                            <li>
                                <CheckCircle size={14} />
                                <span>
                                    <strong>ویرایش:</strong> اگر می‌خواهید ساعات
                                    یک روز را تغییر دهید، فقط همان روز را دوباره
                                    با ساعات جدید ذخیره کنید؛ اطلاعات قبلی به
                                    صورت خودکار جایگزین می‌شود.
                                </span>
                            </li>
                            <li>
                                <CheckCircle size={14} />
                                <span>
                                    <strong>حذف:</strong> برای حذف یک روز، روی
                                    آیکون سطل زباله کلیک کنید و در Modal باز شده
                                    تایید کنید.
                                </span>
                            </li>
                            <li>
                                <CheckCircle size={14} />
                                <span>
                                    <strong>روزهای تعطیل:</strong> روزهایی که در
                                    این لیست نباشند، به صورت خودکار تعطیل در نظر
                                    گرفته می‌شوند.
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ============ گرید دو ستونه ============ */}
                <div className="availability-grid">
                    {/* ============ فرم افزودن ============ */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">
                                <Plus size={20} />
                                {isDayAlreadyDefined
                                    ? "ویرایش برنامه روز"
                                    : "افزودن روز کاری"}
                            </h2>
                            {isDayAlreadyDefined && (
                                <span className="availability-edit-badge">
                                    <Edit3 size={12} />
                                    در حال ویرایش
                                </span>
                            )}
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="availability-form"
                        >
                            {/* روز هفته */}
                            <div className="form-group">
                                <label className="form-label">
                                    <Calendar size={14} />
                                    روز هفته
                                    <span className="required">*</span>
                                </label>
                                <div className="day-selector">
                                    {Object.entries(daysOfWeek).map(
                                        ([key, value]) => {
                                            const dayKey = parseInt(key);
                                            const Icon =
                                                dayIcons[dayKey] || Sun;
                                            const isSelected =
                                                selectedDay === dayKey;
                                            const isDefined =
                                                availabilities.some(
                                                    (a) =>
                                                        a.day_of_week ===
                                                        dayKey,
                                                );
                                            const dayColor = dayColors[dayKey];

                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    className={`day-btn ${
                                                        isSelected
                                                            ? "selected"
                                                            : ""
                                                    } ${
                                                        isDefined
                                                            ? "defined"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setSelectedDay(dayKey)
                                                    }
                                                    style={
                                                        isSelected
                                                            ? {
                                                                  backgroundColor:
                                                                      dayColor.color,
                                                                  color: "white",
                                                                  borderColor:
                                                                      dayColor.color,
                                                              }
                                                            : isDefined
                                                              ? {
                                                                    backgroundColor:
                                                                        dayColor.bg,
                                                                    color: dayColor.color,
                                                                    borderColor:
                                                                        dayColor.border,
                                                                }
                                                              : {}
                                                    }
                                                >
                                                    <Icon size={14} />
                                                    <span>{value}</span>
                                                    {isDefined && (
                                                        <span className="day-btn-dot"></span>
                                                    )}
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            </div>

                            {/* ساعات */}
                            <div className="form-row">
                                <div className="form-group">
                                    <TimePicker
                                        label="ساعت شروع"
                                        value={startTime}
                                        onChange={setStartTime}
                                        minuteStep={10}
                                    />
                                    {errors.start_time && (
                                        <div className="form-error">
                                            <AlertCircle size={14} />
                                            <span>{errors.start_time}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <TimePicker
                                        label="ساعت پایان"
                                        value={endTime}
                                        onChange={setEndTime}
                                        minuteStep={15}
                                    />
                                    {errors.end_time && (
                                        <div className="form-error">
                                            <AlertCircle size={14} />
                                            <span>{errors.end_time}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* دکمه */}
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isSubmitting}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    justifyContent: "center",
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner"></span>
                                        در حال ذخیره...
                                    </>
                                ) : (
                                    <>
                                        {isDayAlreadyDefined ? (
                                            <>
                                                <Edit3 size={16} />
                                                بروزرسانی برنامه
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={16} />
                                                ذخیره برنامه
                                            </>
                                        )}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* ============ لیست روزها ============ */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">
                                <Calendar size={20} />
                                برنامه فعلی
                            </h2>
                            <span className="permissions-count">
                                {toPersianNumber(availabilities.length)} روز
                            </span>
                        </div>

                        {availabilities.length === 0 ? (
                            <div className="availability-empty">
                                <Calendar
                                    size={48}
                                    style={{
                                        color: "#d1d5db",
                                        marginBottom: "0.75rem",
                                    }}
                                />
                                <h4>هنوز برنامه‌ای تعریف نشده است</h4>
                                <p>
                                    از فرم سمت راست، اولین روز کاری خود را اضافه
                                    کنید.
                                </p>
                            </div>
                        ) : (
                            <div className="availability-list">
                                {availabilities.map((avail) => {
                                    const Icon =
                                        dayIcons[avail.day_of_week] || Sun;
                                    const dayColor =
                                        dayColors[avail.day_of_week];

                                    return (
                                        <div
                                            key={avail.id}
                                            className="availability-item"
                                            style={{
                                                borderRightColor:
                                                    dayColor.color,
                                            }}
                                        >
                                            <div
                                                className="availability-item-icon"
                                                style={{
                                                    backgroundColor:
                                                        dayColor.bg,
                                                    color: dayColor.color,
                                                    borderColor:
                                                        dayColor.border,
                                                }}
                                            >
                                                <Icon size={20} />
                                            </div>

                                            <div className="availability-item-info">
                                                <span className="day-name">
                                                    {
                                                        daysOfWeek[
                                                            avail.day_of_week
                                                        ]
                                                    }
                                                </span>
                                                <span className="day-time">
                                                    <Clock size={12} />
                                                    {/* {toPersianTimeRange(avail.start_time, avail.end_time)}  */}
                                                    {toPersianTime(
                                                        avail.start_time,
                                                    )}{" "}
                                                    -{" "}
                                                    {toPersianTime(
                                                        avail.end_time,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="availability-item-actions">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => {
                                                        setSelectedDay(
                                                            avail.day_of_week,
                                                        );
                                                        setStartTime(
                                                            avail.start_time,
                                                        );
                                                        setEndTime(
                                                            avail.end_time,
                                                        );
                                                        window.scrollTo({
                                                            top: 0,
                                                            behavior: "smooth",
                                                        });
                                                    }}
                                                    title="ویرایش"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    className="btn-icon danger"
                                                    onClick={() =>
                                                        openDeleteModal(avail)
                                                    }
                                                    title="حذف"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ============ Modal حذف ============ */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="حذف روز از برنامه هفتگی"
                message={
                    deleteModal.availability
                        ? `آیا از حذف روز "${
                              daysOfWeek[deleteModal.availability.day_of_week]
                          }" از برنامه هفتگی مطمئن هستید؟ این عملیات قابل بازگشت نیست و در صورت نیاز باید دوباره آن را اضافه کنید.`
                        : ""
                }
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                type="danger"
                isLoading={deleteModal.isLoading}
            />
        </Layout>
    );
}
