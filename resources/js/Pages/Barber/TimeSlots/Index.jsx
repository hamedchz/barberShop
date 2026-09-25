import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import ConfirmModal from "../../Admin/Components/ConfirmModal";
import JalaliCalendar from "../Components/JalaliCalendar";
import { toJalaali } from "jalaali-js";
import {
    toPersianNumber,
    toPersianTime,
    toPersianTimeRange,
} from "../../../utils/persianNumbers";
import {
    Clock,
    Plus,
    Trash2,
    Lock,
    Unlock,
    CheckCircle,
    AlertCircle,
    Calendar as CalendarIcon,
} from "lucide-react";

export default function TimeSlotsIndex({
    auth,
    timeSlots,
    services,
    selectedDate,
    availability,
    selectedServiceId, // ← عدد
    service, // ← اطلاعات کامل سرویس انتخاب شده
    filters,
}) {
    const [date, setDate] = useState(new Date(selectedDate));
    // const [selectedService, setSelectedService] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // ============ State ============

    // چون service_id اجباری است، selectedService همیشه پر است
    const [selectedService, setSelectedService] = useState(
        selectedServiceId ? String(selectedServiceId) : "",
    );
    const [isGenerating, setIsGenerating] = useState(false);

    const selectedJalali = toJalaali(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
    );

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        timeSlot: null,
        isLoading: false,
    });

    const formattedJalaliDate = `${selectedJalali.jy}/${String(
        selectedJalali.jm,
    ).padStart(2, "0")}/${String(selectedJalali.jd).padStart(2, "0")}`;

    // ============ انتخاب تاریخ ============
    const handleSelectDate = (newDate) => {
        setDate(newDate);
        const j = toJalaali(
            newDate.getFullYear(),
            newDate.getMonth() + 1,
            newDate.getDate(),
        );
        router.get(
            "/barber/time-slots",
            { jy: j.jy, jm: j.jm, jd: j.jd, service_id: selectedServiceId },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // ============ ساخت بازه‌ها ============
    const handleGenerate = (e) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);
        const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1,
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        router.post(
            "/barber/time-slots/generate",
            {
                date: dateStr,
                service_id: selectedService || null,
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

    // ============ تغییر وضعیت ============
    const handleToggle = (slot) => {
        const nextStatus =
            slot.status === "available" ? "blocked" : "available";
        router.patch(
            `/barber/time-slots/${slot.id}`,
            { status: nextStatus },
            { preserveScroll: true },
        );
    };

    // ============ باز کردن Modal ============
    const openDeleteModal = (timeSlot) =>
        setDeleteModal({ isOpen: true, timeSlot, isLoading: false });

    // ============ بستن Modal ============
    const closeDeleteModal = () =>
        setDeleteModal({ isOpen: false, timeSlot: null, isLoading: false });

    // ============ تایید حذف ============
    const handleConfirmDelete = () => {
        if (!deleteModal.timeSlot) return;

        setDeleteModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(`/barber/time-slots/${deleteModal.timeSlot.id}`, {
            preserveScroll: true,
            onSuccess: () => closeDeleteModal(),
            onError: () =>
                setDeleteModal((prev) => ({ ...prev, isLoading: false })),
        });
    };

    // ============ آمار ============
    const stats = {
        total: timeSlots.length,
        available: timeSlots.filter((s) => s.status === "available").length,
        booked: timeSlots.filter((s) => s.status === "booked").length,
        blocked: timeSlots.filter((s) => s.status === "blocked").length,
    };

    return (
        <Layout>
            <Head title="زمان‌بندی نوبت‌ها" />

            <div className="center-column">
                <div className="roles-page-header">
                    <div>
                        <h1 className="roles-page-title">
                            زمان‌بندی نوبت‌ها برای سرویس {service.name} (
                            {toPersianNumber(service.duration)} دقیقه)
                        </h1>
                        <p
                            style={{
                                color: "#6b7280",
                                fontSize: "0.875rem",
                                marginTop: "0.25rem",
                            }}
                        >
                            بازه‌های زمانی قابل رزرو را برای هر تاریخ مشخص کنید.
                        </p>
                    </div>
                </div>

                <div className="time-slots-layout">
                    {/* ستون تقویم و کنترل‌ها */}
                    <div className="time-slots-sidebar">
                        {/* تقویم */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">
                                    <CalendarIcon size={18} />
                                    انتخاب تاریخ
                                </h2>
                            </div>
                            <JalaliCalendar
                                selectedDate={date}
                                onSelectDate={handleSelectDate}
                            />
                        </div>

                        {/* ساخت بازه */}
                        {availability ? (
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title">
                                        <Plus size={18} />
                                        ساخت بازه
                                    </h2>
                                </div>
                                <form
                                    onSubmit={handleGenerate}
                                    className="availability-form"
                                >
                                    <div className="form-group">
                                        <label className="form-label">
                                            سرویس انتخاب شده:
                                        </label>
                                        {service.name} (
                                        {toPersianNumber(service.duration)}{" "}
                                        دقیقه)
                                    </div>
                                    {/* <button
                                        type="submit"
                                        className="btn-primary"
                                    >
                                        <Plus size={16} />
                                        ساخت بازه‌ها
                                    </button> */}
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
                                                <>
                                                    <Plus size={16} />
                                                    ذخیره برنامه
                                                </>
                                            </>
                                        )}
                                    </button>
                                </form>
                                <div className="info-box">
                                    <p>
                                        برنامه این روز:{" "}
                                        <strong>
                                            {toPersianTime(
                                                availability.start_time,
                                            )}{" "}
                                            -{" "}
                                            {toPersianTime(
                                                availability.end_time,
                                            )}
                                        </strong>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="card"
                                style={{
                                    textAlign: "center",
                                    padding: "1.5rem",
                                }}
                            >
                                <AlertCircle
                                    size={32}
                                    style={{
                                        margin: "0 auto 0.5rem",
                                        color: "#f59e0b",
                                    }}
                                />
                                <p
                                    style={{
                                        fontSize: "0.875rem",
                                        color: "#6b7280",
                                    }}
                                >
                                    برای این روز برنامه کاری تعریف نشده است.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ستون بازه‌ها */}
                    <div className="time-slots-content">
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">
                                    <Clock size={20} />
                                    بازه‌های{" "}
                                    {toPersianNumber(formattedJalaliDate)}
                                </h2>
                                <span className="permissions-count">
                                    {toPersianNumber(stats.total)} بازه
                                </span>
                            </div>

                            {/* آمار */}
                            <div className="time-slots-stats">
                                <div className="stat-item available">
                                    <Unlock size={16} />
                                    <span>
                                        {toPersianNumber(stats.available)} قابل
                                        رزرو
                                    </span>
                                </div>
                                <div className="stat-item booked">
                                    <CheckCircle size={16} />
                                    <span>
                                        {toPersianNumber(stats.booked)} رزرو شده
                                    </span>
                                </div>
                                <div className="stat-item blocked">
                                    <Lock size={16} />
                                    <span>
                                        {toPersianNumber(stats.blocked)} بسته
                                    </span>
                                </div>
                            </div>

                            {/* لیست بازه‌ها */}
                            {timeSlots.length === 0 ? (
                                <p className="empty-text">
                                    برای این تاریخ بازه‌ای ساخته نشده است.
                                </p>
                            ) : (
                                <div className="time-slots-list-vertical">
                                    {timeSlots.map((slot) => (
                                        <div
                                            key={slot.id}
                                            className={`time-slot-row status-${slot.status}`}
                                        >
                                            <div className="time-slot-row-time">
                                                <Clock size={16} />
                                                <span>
                                                    {toPersianTime(
                                                        slot.start_time,
                                                    )}{" "}
                                                    -{" "}
                                                    {toPersianTime(
                                                        slot.end_time,
                                                    )}
                                                </span>
                                            </div>

                                            {slot.service && (
                                                <div className="time-slot-row-service">
                                                    {slot.service.name}
                                                </div>
                                            )}

                                            <div className="time-slot-row-status">
                                                {slot.status ===
                                                    "available" && (
                                                    <>
                                                        <Unlock size={14} />
                                                        قابل رزرو
                                                    </>
                                                )}
                                                {slot.status === "booked" && (
                                                    <>
                                                        <CheckCircle
                                                            size={14}
                                                        />
                                                        رزرو شده توسط{" "}
                                                        {slot.booked_by?.name}
                                                    </>
                                                )}
                                                {slot.status === "blocked" && (
                                                    <>
                                                        <Lock size={14} />
                                                        بسته
                                                    </>
                                                )}
                                            </div>

                                            {slot.status !== "booked" && (
                                                <div className="time-slot-row-actions">
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() =>
                                                            handleToggle(slot)
                                                        }
                                                        title={
                                                            slot.status ===
                                                            "available"
                                                                ? "بستن"
                                                                : "باز کردن"
                                                        }
                                                    >
                                                        {slot.status ===
                                                        "available" ? (
                                                            <Lock size={14} />
                                                        ) : (
                                                            <Unlock size={14} />
                                                        )}
                                                    </button>
                                                    <button
                                                        className="btn-icon danger"
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                slot,
                                                            )
                                                        }
                                                        title="حذف"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* ============ Modal حذف ============ */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="حذف بازه زمانی"
                message={
                    deleteModal.timeSlot
                        ? `آیا از حذف بازه زمانی «${toPersianTimeRange(
                              deleteModal.timeSlot.start_time,
                              deleteModal.timeSlot.end_time,
                          )}» در تاریخ ${toPersianNumber(formattedJalaliDate)} مطمئن هستید؟ این عملیات قابل بازگشت نیست.`
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
