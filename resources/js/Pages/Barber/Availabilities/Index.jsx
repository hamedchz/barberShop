import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import Layout from "../../../Layouts/Layout";
import { Calendar, Plus, Trash2, Clock } from "lucide-react";

export default function AvailabilitiesIndex({
    auth,
    availabilities,
    daysOfWeek,
}) {
    const [selectedDay, setSelectedDay] = useState(0);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("18:00");

    // ============ ذخیره ============
    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(
            "/barber/availabilities",
            {
                day_of_week: selectedDay,
                start_time: startTime,
                end_time: endTime,
            },
            { preserveScroll: true },
        );
    };

    // ============ حذف ============
    const handleDelete = (id) => {
        if (confirm("آیا از حذف این روز مطمئن هستید؟")) {
            router.delete(`/barber/availabilities/${id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <Layout>
            <Head title="برنامه هفتگی" />

            <div className="center-column">
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
                </div>

                <div className="availability-grid">
                    {/* فرم افزودن */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">
                                <Plus size={20} />
                                افزودن روز کاری
                            </h2>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="availability-form"
                        >
                            <div className="form-group">
                                <label className="form-label">روز هفته</label>
                                <select
                                    className="form-input"
                                    value={selectedDay}
                                    onChange={(e) =>
                                        setSelectedDay(parseInt(e.target.value))
                                    }
                                >
                                    {Object.entries(daysOfWeek).map(
                                        ([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">
                                        <Clock size={14} />
                                        ساعت شروع
                                    </label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={startTime}
                                        onChange={(e) =>
                                            setStartTime(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <Clock size={14} />
                                        ساعت پایان
                                    </label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={endTime}
                                        onChange={(e) =>
                                            setEndTime(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary">
                                <Plus size={16} />
                                ذخیره
                            </button>
                        </form>
                    </div>

                    {/* لیست روزها */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">
                                <Calendar size={20} />
                                روزهای فعال
                            </h2>
                            <span className="permissions-count">
                                {availabilities.length} روز
                            </span>
                        </div>

                        {availabilities.length === 0 ? (
                            <p className="empty-text">
                                هنوز روزی تعریف نشده است.
                            </p>
                        ) : (
                            <div className="availability-list">
                                {availabilities.map((avail) => (
                                    <div
                                        key={avail.id}
                                        className="availability-item"
                                    >
                                        <div className="availability-item-info">
                                            <span className="day-name">
                                                {daysOfWeek[avail.day_of_week]}
                                            </span>
                                            <span className="day-time">
                                                {avail.start_time} -{" "}
                                                {avail.end_time}
                                            </span>
                                        </div>
                                        <button
                                            className="btn-icon danger"
                                            onClick={() =>
                                                handleDelete(avail.id)
                                            }
                                            title="حذف"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
