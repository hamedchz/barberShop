import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    ArrowRight,
    Scissors,
    Clock3,
    Banknote,
    Save,
    Image as ImageIcon,
    RotateCcw,
} from "lucide-react";

import { toPersianNumber } from "../../../utils/persianNumbers";
import "../../../Assets/css/barber-services.css";

export default function Edit({ service }) {
    const { data, setData, put, processing, errors } = useForm({
        price: service.price ?? "",
        duration: service.duration ?? "",
    });

    const submit = (e) => {
        e.preventDefault();

        put(route("barber.services.update", service.id), {
            preserveScroll: true,
        });
    };

    const resetPrice = () => {
        setData("price", "");
    };

    const resetDuration = () => {
        setData("duration", "");
    };

    return (
        <>
            <Head title={`تنظیمات ${service.name}`} />

            <div className="barber-services-page" dir="rtl">
                <div className="barber-services-header">
                    <div className="barber-services-title">
                        <div className="barber-services-title-icon">
                            <Scissors size={22} />
                        </div>

                        <div>
                            <h1>تنظیم قیمت و زمان سرویس</h1>
                            <p>قیمت و مدت‌زمان ارائه این سرویس را مشخص کنید.</p>
                        </div>
                    </div>

                    <Link
                        href={route("barber.services.index")}
                        className="barber-services-back-btn"
                    >
                        <ArrowRight size={17} />
                        بازگشت
                    </Link>
                </div>

                <div className="barber-service-settings-card">
                    <div className="barber-service-settings-info">
                        <div className="barber-service-settings-image">
                            {service.image_url ? (
                                <img
                                    src={service.image_url}
                                    alt={service.name}
                                />
                            ) : (
                                <ImageIcon size={30} />
                            )}
                        </div>

                        <div>
                            <h2>{service.name}</h2>
                            <p>{service.description || "بدون توضیحات"}</p>
                        </div>
                    </div>

                    <div className="barber-service-base-info">
                        <div>
                            <Banknote size={18} />
                            <span>محدوده قیمت پیشنهادی:</span>
                            <strong>
                                {service.category?.min_price &&
                                service.category?.max_price
                                    ? `${toPersianNumber(
                                          service.category.min_price,
                                      )} تا ${toPersianNumber(
                                          service.category.max_price,
                                      )} تومان`
                                    : "تعیین نشده"}
                            </strong>
                        </div>

                        <div>
                            <Clock3 size={18} />
                            <span>مدت‌زمان پیشنهادی:</span>
                            <strong>
                                {service.category?.suggested_duration
                                    ? `${toPersianNumber(
                                          service.category.suggested_duration,
                                      )} دقیقه`
                                    : "تعیین نشده"}
                            </strong>
                        </div>
                    </div>

                    <form
                        onSubmit={submit}
                        className="barber-service-settings-form"
                    >
                        <div className="barber-service-setting-field">
                            <label>
                                <Banknote size={18} />
                                قیمت اختصاصی شما (تومان)
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={data.price}
                                onChange={(e) =>
                                    setData("price", e.target.value)
                                }
                                placeholder="مثلاً ۲۵۰۰۰۰"
                            />

                            <button type="button" onClick={resetPrice}>
                                <RotateCcw size={14} />
                                استفاده از قیمت پایه
                            </button>

                            {errors.price && (
                                <span className="barber-service-field-error">
                                    {errors.price}
                                </span>
                            )}
                        </div>

                        <div className="barber-service-setting-field">
                            <label>
                                <Clock3 size={18} />
                                مدت‌زمان اختصاصی (دقیقه)
                            </label>

                            <input
                                type="number"
                                min="5"
                                max="600"
                                value={data.duration}
                                onChange={(e) =>
                                    setData("duration", e.target.value)
                                }
                                placeholder="مثلاً ۴۵"
                            />

                            <button type="button" onClick={resetDuration}>
                                <RotateCcw size={14} />
                                استفاده از مدت‌زمان پایه
                            </button>

                            {errors.duration && (
                                <span className="barber-service-field-error">
                                    {errors.duration}
                                </span>
                            )}
                        </div>

                        <div className="barber-service-settings-note">
                            اگر هر فیلد را خالی بگذارید، مقدار پیش‌فرض تعریف‌شده
                            توسط مدیریت برای آن استفاده خواهد شد.
                        </div>

                        <div className="barber-service-settings-actions">
                            <Link
                                href={route("barber.services.index")}
                                className="barber-service-cancel-btn"
                            >
                                انصراف
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="barber-service-save-btn"
                            >
                                <Save size={17} />
                                {processing
                                    ? "در حال ذخیره..."
                                    : "ذخیره تنظیمات"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
