import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";

import BarberLayout from "../../Admin/Layouts/Layout";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";
import "./Assets/css/barber-services.css";

import {
    ArrowRight,
    Plus,
    Search,
    Clock3,
    Banknote,
    Image as ImageIcon,
    Scissors,
    X,
    Save,
    SoapDispenserDroplet,
    TowelRack,
    ShowerHead,
    SprayCan,
    Sparkles,
    Droplet,
    Flower,
    Crown,
    Star,
    Sun,
    Zap,
} from "lucide-react";

const ICON_MAP = {
    SoapDispenserDroplet,
    TowelRack,
    ShowerHead,
    SprayCan,
    Sparkles,
    Droplet,
    Flower,
    Crown,
    Star,
    Sun,
    Zap,
};
export default function Create({ categories = [] }) {
    const [amount, setAmount] = useState("");
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const formatAmount = (value) =>
        toPersianNumber(Number(value || 0).toLocaleString());
    const [formData, setFormData] = useState({
        category_id: "",
        price: "",
        duration: "",
    });

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(search.trim().toLowerCase()),
    );

    // باز کردن مدال تنظیم قیمت و زمان
    const openModal = (category) => {
        setSelectedCategory(category);

        setFormData({
            category_id: category.id,
            price: "",
            duration: category.suggested_duration || "",
        });

        setErrors({});
    };

    // بستن مدال
    const closeModal = () => {
        if (processing) return;

        setSelectedCategory(null);
        setErrors({});
    };

    // ثبت سرویس
    const handleSubmit = (e) => {
        e.preventDefault();

        setProcessing(true);
        setErrors({});

        router.post(route("barber.services.store"), formData, {
            preserveScroll: true,

            onError: (response) => {
                setErrors(response);
            },

            onFinish: () => {
                setProcessing(false);
            },
            onSuccess: () => {
                setSelectedCategory(null);
                setAmount("");

                setFormData({
                    category_id: "",
                    price: "",
                    duration: "",
                });

                setErrors({});

                router.reload({
                    only: ["categories"],
                    preserveScroll: true,
                });
            },
        });
    };

    return (
        <BarberLayout>
            <Head title="افزودن سرویس" />

            <div className="barber-services-page" dir="rtl">
                {/* Header */}

                <div className="barber-services-header">
                    <div className="barber-services-title">
                        <div className="barber-services-title-icon">
                            <Scissors size={22} />
                        </div>

                        <div>
                            <h1>افزودن سرویس جدید</h1>
                            <p>سرویس موردنظر را از فهرست خدمات انتخاب کنید.</p>
                        </div>
                    </div>

                    <Link
                        href={route("barber.services.index")}
                        className="barber-services-back-btn"
                    >
                        <ArrowRight size={17} />
                        بازگشت به خدمات من
                    </Link>
                </div>

                {/* Search */}
                <div className="barber-services-search">
                    <Search size={19} />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="جستجوی نام سرویس..."
                    />
                </div>

                {/* Categories */}
                {filteredCategories.length === 0 ? (
                    <div className="barber-services-empty">
                        <Scissors size={30} />

                        <h3>
                            {search
                                ? "سرویسی پیدا نشد"
                                : "سرویس جدیدی برای انتخاب وجود ندارد"}
                        </h3>

                        <p>
                            {search
                                ? "عبارت دیگری را جستجو کنید."
                                : "تمام سرویس‌های فعال مدیریت را قبلاً انتخاب کرده‌اید."}
                        </p>
                    </div>
                ) : (
                    <div className="barber-services-grid">
                        {filteredCategories.map((category) => {
                            const Icon = ICON_MAP[category.icon] || Scissors;
                            return (
                                <div
                                    className="barber-service-card available"
                                    key={category.id}
                                >
                                    {/* تصویر سرویس */}
                                    <div className="barber-service-image">
                                        {category.image_url ? (
                                            <img
                                                src={category.image_url}
                                                alt={category.name}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="barber-service-image-placeholder">
                                                <ImageIcon
                                                    size={38}
                                                    strokeWidth={1.5}
                                                />
                                            </div>
                                        )}

                                        <span className="barber-service-image-badge">
                                            <Icon size={16} />
                                            سرویس قابل انتخاب
                                        </span>
                                    </div>

                                    {/* محتوای کارت */}
                                    <div className="barber-service-content">
                                        <div className="barber-service-heading">
                                            <h3>{category.name}</h3>

                                            <p className="barber-service-description">
                                                {category.description ||
                                                    "برای این سرویس توضیحاتی ثبت نشده است."}
                                            </p>
                                        </div>

                                        {/* اطلاعات قیمت و زمان */}
                                        <div className="barber-service-meta">
                                            {/* Price */}
                                            <div className="barber-service-meta-item">
                                                <div className="barber-service-meta-icon price">
                                                    <Banknote size={19} />
                                                </div>

                                                <div className="barber-service-meta-info">
                                                    <span>
                                                        محدوده قیمت پیشنهادی
                                                    </span>

                                                    <strong>
                                                        {category.min_price !=
                                                            null &&
                                                        category.max_price !=
                                                            null
                                                            ? `${toPersianNumber(
                                                                  Number(
                                                                      category.min_price,
                                                                  ).toLocaleString(
                                                                      "en-US",
                                                                  ),
                                                              )} تا ${toPersianNumber(
                                                                  Number(
                                                                      category.max_price,
                                                                  ).toLocaleString(
                                                                      "en-US",
                                                                  ),
                                                              )} تومان`
                                                            : "قیمت توافقی"}
                                                    </strong>
                                                </div>
                                            </div>

                                            {/* Duration */}
                                            <div className="barber-service-meta-item">
                                                <div className="barber-service-meta-icon duration">
                                                    <Clock3 size={19} />
                                                </div>

                                                <div className="barber-service-meta-info">
                                                    <span>
                                                        مدت‌زمان پیشنهادی
                                                    </span>

                                                    <strong>
                                                        {category.suggested_duration
                                                            ? `${toPersianNumber(category.suggested_duration)} دقیقه`
                                                            : "مدت متغیر"}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>

                                        {/* دکمه انتخاب */}
                                        <button
                                            type="button"
                                            className="barber-service-add"
                                            onClick={() => openModal(category)}
                                        >
                                            <span>انتخاب و تنظیم سرویس</span>

                                            <span className="barber-service-add-icon">
                                                <Plus size={19} />
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Configure Modal */}
                {selectedCategory && (
                    <div
                        className="barber-service-modal-backdrop"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) {
                                closeModal();
                            }
                        }}
                    >
                        <div
                            className="barber-service-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="service-modal-title"
                        >
                            <div className="barber-service-modal-header">
                                <div>
                                    <h3 id="service-modal-title">
                                        تنظیم قیمت و زمان سرویس
                                    </h3>

                                    <p>{selectedCategory.name}</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={processing}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Base Info */}
                                <div className="barber-service-base-info">
                                    <div>
                                        <Banknote size={18} />

                                        <span>محدوده قیمت:</span>

                                        <strong>
                                            {selectedCategory.min_price !=
                                                null &&
                                            selectedCategory.max_price != null
                                                ? `${toPersianNumber(
                                                      Number(
                                                          selectedCategory.min_price,
                                                      ).toLocaleString("en-US"),
                                                  )}   تا    ${toPersianNumber(
                                                      Number(
                                                          selectedCategory.max_price,
                                                      ).toLocaleString("en-US"),
                                                  )} تومان`
                                                : "تعیین نشده"}
                                        </strong>
                                    </div>

                                    <div>
                                        <Clock3 size={18} />

                                        <span>مدت پیشنهادی:</span>

                                        <strong>
                                            {selectedCategory.suggested_duration
                                                ? `${toPersianNumber(
                                                      selectedCategory.suggested_duration,
                                                  )} دقیقه`
                                                : "تعیین نشده"}
                                        </strong>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="barber-service-modal-fields">
                                    <label>
                                        <span>
                                            <Banknote size={17} />
                                            قیمت اختصاصی شما (تومان)
                                        </span>

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={amount}
                                            onChange={(e) => {
                                                setAmount(e.target.value);
                                                setErrors({
                                                    ...errors,
                                                    amount: undefined,
                                                });
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    price: e.target.value,
                                                }));
                                            }}
                                            placeholder="مثلاً ۲۵۰٬۰۰۰"
                                        />

                                        {amount > 0 && (
                                            <div className="amount-display">
                                                <div className="amount-main">
                                                    <span className="amount-value">
                                                        {formatAmount(amount)}
                                                    </span>
                                                    <span className="amount-currency">
                                                        تومان
                                                    </span>
                                                </div>

                                                {/* <div className="amount-meta">
                                                    <span className="amount-remaining">
                                                        موجودی پس از شارژ:{" "}
                                                        {formatAmount(
                                                            wallet.balance +
                                                                Number(amount),
                                                        )}{" "}
                                                        تومان
                                                    </span>
                                                </div> */}
                                            </div>
                                        )}

                                        {errors.price && (
                                            <small className="barber-service-error">
                                                {errors.price}
                                            </small>
                                        )}
                                    </label>

                                    {/* Duration */}
                                    <label>
                                        <span>
                                            <Clock3 size={17} />
                                            مدت‌زمان اختصاصی (دقیقه)
                                        </span>

                                        <input
                                            type="number"
                                            min="5"
                                            max="600"
                                            value={formData.duration}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    duration: e.target.value,
                                                }))
                                            }
                                            placeholder="مثلاً ۴۵"
                                        />

                                        {errors.duration && (
                                            <small className="barber-service-error">
                                                {errors.duration}
                                            </small>
                                        )}
                                    </label>
                                </div>

                                <div className="barber-service-settings-note">
                                    در صورت خالی گذاشتن قیمت یا مدت‌زمان، مقدار
                                    پیش‌فرض تعریف‌شده توسط مدیریت استفاده خواهد
                                    شد.
                                </div>

                                {errors.category_id && (
                                    <div className="barber-service-error">
                                        {errors.category_id}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="barber-service-modal-actions">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={processing}
                                    >
                                        انصراف
                                    </button>

                                    <button type="submit" disabled={processing}>
                                        <Save size={17} />

                                        {processing
                                            ? "در حال ثبت..."
                                            : "ثبت سرویس"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </BarberLayout>
    );
}
