import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import ConfirmModal from "../../Admin/Components/ConfirmModal";
import TimePicker from "../Components/TimePicker";

import {
    toPersianTime,
    toPersianTimeRange,
    toPersianNumber,
} from "../../../utils/persianNumbers";

import "../Assets/css/Availability.css";
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
    X,
} from "lucide-react";

// ============ آیکون هر روز ============
const dayIcons = {
    0: Sunrise,
    1: Sun,
    2: Sun,
    3: Sun,
    4: Sun,
    5: Sunset,
    6: Moon,
};

// ============ رنگ هر روز ============
const dayColors = {
    0: { bg: "#ecfdf5", color: "#065f46", border: "#d1fae5" },
    1: { bg: "#eff6ff", color: "#1e40af", border: "#dbeafe" },
    2: { bg: "#f5f3ff", color: "#5b21b6", border: "#ede9fe" },
    3: { bg: "#fff7ed", color: "#9a3412", border: "#ffedd5" },
    4: { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
    5: { bg: "#fce7f3", color: "#9d174d", border: "#fbcfe8" },
    6: { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" },
};

// ============ شیفت خالی پیش‌فرض ============
const emptyShift = () => ({
    id: null,
    start_time: "09:00",
    end_time: "13:00",
});

export default function AvailabilitiesIndex({
    auth,
    availabilities,
    daysOfWeek,
}) {
    const [selectedDay, setSelectedDay] = useState(0);
    const [shifts, setShifts] = useState([emptyShift()]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ============ State Modal حذف روز ============
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        availability: null,
        isLoading: false,
    });

    // ============ State Modal حذف شیفت ============
    const [deleteShiftModal, setDeleteShiftModal] = useState({
        isOpen: false,
        availability: null,
        shift: null,
        isLoading: false,
    });

    // ============ availability روز انتخاب‌شده ============
    const existingAvailability = availabilities.find(
        (a) => a.day_of_week === selectedDay,
    );
    const isDayAlreadyDefined = Boolean(existingAvailability);

    // ============ key یکتا برای sync خودکار shifts ============
    // هر بار شیفت‌های روز جاری از سرور تغییر کنن (اضافه/حذف)، این key عوض می‌شه
    const currentShiftsKey = JSON.stringify(
        existingAvailability?.shifts?.map((s) => ({
            id: s.id,
            start: s.start_time,
            end: s.end_time,
        })) ?? [],
    );

    // ============ sync خودکار shifts با availabilities ============
    useEffect(() => {
        if (existingAvailability?.shifts?.length > 0) {
            setShifts(
                existingAvailability.shifts.map((s) => ({
                    id: s.id,
                    start_time: s.start_time.substring(0, 5),
                    end_time: s.end_time.substring(0, 5),
                })),
            );
        } else {
            setShifts([emptyShift()]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentShiftsKey, selectedDay]);

    // ============ تغییر روز انتخاب‌شده ============
    const handleSelectDay = (dayKey) => {
        setSelectedDay(dayKey);
        setErrors({});
        // shifts خودکار توسط useEffect آپدیت می‌شه
    };

    // ============ مدیریت شیفت‌ها ============
    const addShift = () => {
        setShifts((prev) => [...prev, emptyShift()]);
    };

    const removeShift = (index) => {
        setShifts((prev) => {
            if (prev.length === 1) return prev;
            return prev.filter((_, i) => i !== index);
        });
    };

    const updateShift = (index, field, value) => {
        setShifts((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    // ============ Modal حذف شیفت ============
    const openDeleteShiftModal = (availability, shift) => {
        setDeleteShiftModal({
            isOpen: true,
            availability,
            shift,
            isLoading: false,
        });
    };

    const closeDeleteShiftModal = () => {
        setDeleteShiftModal({
            isOpen: false,
            availability: null,
            shift: null,
            isLoading: false,
        });
    };

    const handleConfirmDeleteShift = () => {
        if (!deleteShiftModal.availability || !deleteShiftModal.shift) return;

        setDeleteShiftModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(
            `/barber/availabilities/${deleteShiftModal.availability.id}/shifts/${deleteShiftModal.shift.id}`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeDeleteShiftModal();
                    // نکته: shifts خودکار توسط useEffect آپدیت می‌شه
                    // چون availabilities از سرور دوباره می‌آد و currentShiftsKey عوض می‌شه
                },
                onError: () =>
                    setDeleteShiftModal((prev) => ({
                        ...prev,
                        isLoading: false,
                    })),
            },
        );
    };

    // ============ اعتبارسنجی سمت کلاینت ============
    const validateShifts = () => {
        const errs = {};

        if (shifts.length === 0) {
            errs.shifts = "حداقل یک شیفت باید تعریف شود.";
            return errs;
        }

        shifts.forEach((shift, i) => {
            const start = shift.start_time;
            const end = shift.end_time;

            if (!start) {
                errs[`shifts.${i}.start_time`] = "ساعت شروع الزامی است.";
            }
            if (!end) {
                errs[`shifts.${i}.end_time`] = "ساعت پایان الزامی است.";
            }
            if (start && end && start >= end) {
                errs[`shifts.${i}.end_time`] =
                    "ساعت پایان باید بعد از شروع باشد.";
            }
        });

        const sorted = [...shifts].sort((a, b) =>
            a.start_time.localeCompare(b.start_time),
        );

        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i].end_time > sorted[i + 1].start_time) {
                errs.shifts = "شیفت‌ها با یکدیگر تداخل دارند.";
                break;
            }
        }

        return errs;
    };

    // ============ ذخیره ============
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        const clientErrors = validateShifts();
        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setIsSubmitting(true);

        const payload = {
            day_of_week: selectedDay,
            shifts: shifts.map((s) => ({
                start_time: s.start_time,
                end_time: s.end_time,
            })),
        };

        const method = isDayAlreadyDefined ? "put" : "post";
        const url = isDayAlreadyDefined
            ? `/barber/availabilities/${existingAvailability.id}`
            : "/barber/availabilities";

        router[method](url, payload, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setErrors({});
            },
            onError: (err) => {
                setErrors(err);
                setIsSubmitting(false);
            },
        });
    };

    // ============ Modal حذف روز ============
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
                                    <strong>شیفت‌های کاری:</strong> برای هر روز
                                    می‌توانید چند شیفت تعریف کنید (مثلاً صبح
                                    ۸-۱۳ و عصر ۱۶:۳۰-۲۰). ساعات بین شیفت‌ها
                                    به‌صورت خودکار تعطیل در نظر گرفته می‌شود.
                                </span>
                            </li>
                            <li>
                                <CheckCircle size={14} />
                                <span>
                                    <strong>ویرایش:</strong> اگر می‌خواهید ساعات
                                    یک روز را تغییر دهید، فقط همان روز را دوباره
                                    با شیفت‌های جدید ذخیره کنید؛ اطلاعات قبلی به
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
                    {/* ============ فرم افزودن/ویرایش ============ */}
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
                                                        handleSelectDay(dayKey)
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

                            {/* ============ شیفت‌ها ============ */}
                            <div className="form-group">
                                <label className="form-label">
                                    <Clock size={14} />
                                    شیفت‌های کاری
                                    <span className="required">*</span>
                                </label>

                                <div className="shifts-list">
                                    {shifts.map((shift, index) => (
                                        <div key={index} className="shift-row">
                                            <div className="shift-number">
                                                {toPersianNumber(index + 1)}
                                            </div>

                                            <div className="shift-time-field">
                                                <TimePicker
                                                    label="شروع"
                                                    value={shift.start_time}
                                                    onChange={(v) =>
                                                        updateShift(
                                                            index,
                                                            "start_time",
                                                            v,
                                                        )
                                                    }
                                                    minuteStep={10}
                                                    vertical={true}
                                                />
                                                {errors[
                                                    `shifts.${index}.start_time`
                                                ] && (
                                                    <div className="form-error">
                                                        <AlertCircle
                                                            size={12}
                                                        />
                                                        <span>
                                                            {
                                                                errors[
                                                                    `shifts.${index}.start_time`
                                                                ]
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <TimePicker
                                                    label="پایان"
                                                    value={shift.end_time}
                                                    onChange={(v) =>
                                                        updateShift(
                                                            index,
                                                            "end_time",
                                                            v,
                                                        )
                                                    }
                                                    minuteStep={10}
                                                    vertical
                                                />
                                                {errors[
                                                    `shifts.${index}.end_time`
                                                ] && (
                                                    <div className="form-error">
                                                        <AlertCircle
                                                            size={12}
                                                        />
                                                        <span>
                                                            {
                                                                errors[
                                                                    `shifts.${index}.end_time`
                                                                ]
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                className={`btn-icon danger ${shift.id ? "saved" : "new"}`}
                                                onClick={() => {
                                                    if (
                                                        shift.id &&
                                                        existingAvailability
                                                    ) {
                                                        // شیفت ذخیره‌شده → تایید و حذف از سرور
                                                        openDeleteShiftModal(
                                                            existingAvailability,
                                                            shift,
                                                        );
                                                    } else {
                                                        // شیفت جدید → حذف از فرم
                                                        removeShift(index);
                                                    }
                                                }}
                                                title={
                                                    shift.id
                                                        ? "حذف این شیفت (ذخیره‌شده)"
                                                        : "حذف این شیفت از فرم"
                                                }
                                                disabled={shifts.length === 1}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {errors.shifts && (
                                    <div className="form-error">
                                        <AlertCircle size={14} />
                                        <span>{errors.shifts}</span>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={addShift}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        marginTop: "0.5rem",
                                    }}
                                >
                                    <Plus size={14} />
                                    افزودن شیفت جدید
                                </button>
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

                                                {/* نمایش همه شیفت‌ها */}
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "0.25rem",
                                                        marginTop: "0.25rem",
                                                    }}
                                                >
                                                    {avail.shifts?.length >
                                                    0 ? (
                                                        avail.shifts.map(
                                                            (shift, i) => (
                                                                <div
                                                                    key={
                                                                        shift.id ??
                                                                        i
                                                                    }
                                                                    style={{
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        justifyContent:
                                                                            "space-between",
                                                                        gap: "0.5rem",
                                                                        padding:
                                                                            "0.25rem 0.5rem",
                                                                        background:
                                                                            "#f9fafb",
                                                                        borderRadius:
                                                                            "0.375rem",
                                                                        marginTop:
                                                                            "0.25rem",
                                                                    }}
                                                                >
                                                                    <span className="day-time">
                                                                        <Clock
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                        {toPersianTime(
                                                                            shift.start_time,
                                                                        )}{" "}
                                                                        -{" "}
                                                                        {toPersianTime(
                                                                            shift.end_time,
                                                                        )}
                                                                    </span>

                                                                    {avail
                                                                        .shifts
                                                                        .length >
                                                                        1 && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn-icon danger"
                                                                            onClick={() =>
                                                                                openDeleteShiftModal(
                                                                                    avail,
                                                                                    shift,
                                                                                )
                                                                            }
                                                                            title="حذف این شیفت"
                                                                            style={{
                                                                                width: "1.5rem",
                                                                                height: "1.5rem",
                                                                            }}
                                                                        >
                                                                            <Trash2
                                                                                size={
                                                                                    12
                                                                                }
                                                                            />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ),
                                                        )
                                                    ) : (
                                                        <span className="day-time">
                                                            <AlertCircle
                                                                size={12}
                                                            />
                                                            بدون شیفت
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="availability-item-actions">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() =>
                                                        handleSelectDay(
                                                            avail.day_of_week,
                                                        )
                                                    }
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

            {/* ============ Modal حذف روز ============ */}
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

            {/* ============ Modal حذف شیفت ============ */}
            <ConfirmModal
                isOpen={deleteShiftModal.isOpen}
                onClose={closeDeleteShiftModal}
                onConfirm={handleConfirmDeleteShift}
                title="حذف شیفت"
                message={
                    deleteShiftModal.shift
                        ? `آیا از حذف شیفت ${toPersianTime(
                              deleteShiftModal.shift.start_time,
                          )} تا ${toPersianTime(
                              deleteShiftModal.shift.end_time,
                          )} مطمئن هستید؟`
                        : ""
                }
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                type="danger"
                isLoading={deleteShiftModal.isLoading}
            />
        </Layout>
    );
}
