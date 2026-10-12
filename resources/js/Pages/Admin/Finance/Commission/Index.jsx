import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../../Layouts/Layout";
import {
    Percent,
    Save,
    Users,
    Plus,
    Trash2,
    Edit3,
    X,
    Check,
    AlertCircle,
    Coins,
    TrendingUp,
    Settings,
    Search,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import Select2 from "../../../Admin/Components/Select2";
import "../../Assets/css/Finance.css";
import "../../Assets/css/CommissionPage.css";
import Pagination from "../../Components/Pagination";
import SearchComponent from "../../../../Components/Search";

import ConfirmModal from "../../Components/ConfirmModal";

export default function CommissionIndex({
    defaultRate,
    customRates,
    barbers,
    filters = {},
}) {
    const [rate, setRate] = useState(defaultRate.toString());
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedBarber, setSelectedBarber] = useState("");
    const [newRate, setNewRate] = useState("");
    // search
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (value) => {
        setIsSearching(true);
        router.get(
            route("admin.finance.commission.index"),
            { search: value },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };
    // ============ ذخیره نرخ پیش‌فرض ============
    const handleUpdateDefault = () => {
        const numRate = Number(rate);
        if (numRate < 0 || numRate > 50) {
            setErrors({ commission_rate: "نرخ باید بین ۰ و ۵۰ باشد." });
            return;
        }

        setIsLoading(true);
        router.post(
            route("admin.finance.commission.update-default"),
            { commission_rate: numRate },
            {
                preserveScroll: true,
                onSuccess: () => setIsLoading(false),
                onError: (errs) => {
                    setErrors(errs);
                    setIsLoading(false);
                },
            },
        );
    };

    // ============ ذخیره نرخ اختصاصی ============
    const handleAddCustom = () => {
        // ✅ Validation سمت کلاینت
        if (!selectedBarber || !newRate) {
            setErrors({ custom: "لطفاً آرایشگر و نرخ را وارد کنید." });
            return;
        }

        const numRate = Number(newRate);
        if (isNaN(numRate) || numRate < 0 || numRate > 50) {
            setErrors({ custom: "نرخ باید عددی بین ۰ و ۵۰ باشد." });
            return;
        }

        setIsLoading(true);
        setErrors({});

        router.post(
            route("admin.finance.commission.update-user", {
                user: selectedBarber.value,
            }),
            { commission_rate: numRate },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowAddModal(false);
                    setSelectedBarber("");
                    setNewRate("");
                    setIsLoading(false);
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsLoading(false);
                },
            },
        );
    };

    // ============ حذف نرخ اختصاصی ============
    const handleRemoveCustom = (userId) => {
        if (!confirm("آیا از حذف نرخ اختصاصی مطمئن هستید؟")) return;

        router.delete(route("admin.finance.commission.remove-user", userId), {
            preserveScroll: true,
        });
    };

    // محاسبه مثال
    const exampleAmount = 100000;
    const exampleCommission = Math.round((exampleAmount * Number(rate)) / 100);
    const exampleNet = exampleAmount - exampleCommission;

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        user: null, // ← کاربر مورد نظر برای حذف
        isLoading: false,
    });

    // ============ باز کردن مدال حذف ============
    const openDeleteModal = (user) => {
        setDeleteModal({
            isOpen: true,
            user,
            isLoading: false,
        });
    };

    // ============ بستن مدال ============
    const closeDeleteModal = () => {
        if (deleteModal.isLoading) return;

        setDeleteModal({
            isOpen: false,
            user: null,
            isLoading: false,
        });
    };

    // ============ تأیید حذف ============
    const handleConfirmDelete = () => {
        if (!deleteModal.user) return;

        setDeleteModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(
            route("admin.finance.commission.remove-user", {
                user: deleteModal.user.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteModal({
                        isOpen: false,
                        user: null,
                        isLoading: false,
                    });
                },
                onError: () => {
                    setDeleteModal((prev) => ({
                        ...prev,
                        isLoading: false,
                    }));
                },
            },
        );
    };

    return (
        <Layout>
            <Head title="تنظیمات کمیسیون" />

            <div className="admin-finance-page">
                {/* ============ هدر ============ */}
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div className="finance-header-icon">
                            <Percent size={28} />
                        </div>
                        <div>
                            <h1>تنظیمات کمیسیون</h1>
                            <p>مدیریت نرخ کمیسیون پلتفرم از درآمد آرایشگر</p>
                        </div>
                    </div>

                    <div className="finance-header-actions">
                        <Link
                            href={route("admin.finance.index")}
                            className="btn-secondary"
                        >
                            <TrendingUp size={16} />
                            داشبورد مالی
                        </Link>
                    </div>
                </div>

                {/* ============ گرید اصلی ============ */}
                <div className="commission-grid">
                    {/* ============ ستون اصلی ============ */}
                    <div className="commission-main">
                        {/* نرخ پیشفرض */}
                        <div className="finance-card">
                            <div className="finance-card-header">
                                <div className="card-icon-box green">
                                    <Settings size={20} />
                                </div>
                                <h2>نرخ کمیسیون پیش‌فرض</h2>
                            </div>

                            <p className="commission-description">
                                این نرخ برای همه‌ی آرایشگرها اعمال می‌شود، مگر
                                اینکه نرخ اختصاصی داشته باشند.
                            </p>

                            <div className="commission-rate-input">
                                <input
                                    type="number"
                                    className={`form-input ${
                                        errors.commission_rate ? "error" : ""
                                    }`}
                                    value={rate}
                                    onChange={(e) => {
                                        setRate(e.target.value);
                                        setErrors({});
                                    }}
                                    min="0"
                                    max="50"
                                    step="0.5"
                                    disabled={isLoading}
                                />
                                <span className="input-suffix">٪</span>
                            </div>

                            {errors.commission_rate && (
                                <span className="form-error">
                                    <AlertCircle size={12} />
                                    {errors.commission_rate}
                                </span>
                            )}

                            {/* مثال */}
                            <div className="commission-example">
                                <span className="example-label">
                                    مثال برای رزرو ۱۰۰,۰۰۰ تومانی:
                                </span>
                                <div className="example-rows">
                                    <div className="example-row">
                                        <span>مبلغ کل:</span>
                                        <strong>
                                            {toPersianNumber(
                                                exampleAmount.toLocaleString(),
                                            )}{" "}
                                            تومان
                                        </strong>
                                    </div>
                                    <div className="example-row commission">
                                        <span>کمیسیون پلتفرم:</span>
                                        <strong>
                                            {toPersianNumber(
                                                exampleCommission.toLocaleString(),
                                            )}{" "}
                                            تومان
                                        </strong>
                                    </div>
                                    <div className="example-row net">
                                        <span>درآمد آرایشگر:</span>
                                        <strong>
                                            {toPersianNumber(
                                                exampleNet.toLocaleString(),
                                            )}{" "}
                                            تومان
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleUpdateDefault}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        در حال ذخیره...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        ذخیره نرخ پیش‌فرض
                                    </>
                                )}
                            </button>
                        </div>

                        {/* نرخهای اختصاصی */}
                        <div className="finance-card">
                            <div className="finance-card-header">
                                <div className="card-icon-box purple">
                                    <Users size={20} />
                                </div>
                                <h2>نرخ‌های اختصاصی</h2>
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={() => setShowAddModal(true)}
                                >
                                    <Plus size={14} />
                                    افزودن نرخ اختصاصی
                                </button>
                            </div>
                            {customRates.total > 13 && (
                                <div className="commission-search">
                                    <SearchComponent
                                        value={searchTerm}
                                        onChange={setSearchTerm}
                                        onSearch={handleSearch}
                                        placeholder="جستجو در نام آرایشگر،تلفن ، ..."
                                        delay={500}
                                        isLoading={isSearching}
                                    />
                                </div>
                            )}
                            {customRates.data.length === 0 ? (
                                <div className="empty-state">
                                    <Users size={32} />
                                    <span>
                                        هیچ نرخ اختصاصی تعریف نشده است. همه‌ی
                                        آرایشگرها از نرخ پیش‌فرض استفاده
                                        می‌کنند.
                                    </span>
                                </div>
                            ) : (
                                <div className="custom-rates-list">
                                    {customRates.data.map((item) => (
                                        <div
                                            key={item.id}
                                            className="custom-rate-item"
                                        >
                                            <div className="rate-user">
                                                {item.thumbnail && (
                                                    <img
                                                        src={item.thumbnail}
                                                        alt={item.name}
                                                    />
                                                )}
                                                <span className="user-name">
                                                    {item.name}
                                                </span>
                                            </div>

                                            <span className="rate-value">
                                                {toPersianNumber(
                                                    item.commission_rate,
                                                )}
                                                ٪
                                            </span>

                                            <div className="rate-actions">
                                                <button
                                                    type="button"
                                                    className="action-btn delete"
                                                    onClick={() =>
                                                        openDeleteModal(item)
                                                    }
                                                    title="حذف نرخ اختصاصی"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Pagination
                                links={customRates.links}
                                only={["customRates"]}
                            />
                        </div>
                    </div>

                    {/* ============ سایدبار ============ */}
                    <div className="commission-sidebar">
                        <div className="finance-card">
                            <div className="finance-card-header">
                                <div className="card-icon-box blue">
                                    <Coins size={20} />
                                </div>
                                <h2>راهنما</h2>
                            </div>
                            <ul className="commission-tips">
                                <li>
                                    <Check size={14} />
                                    <span>
                                        نرخ پیش‌فرض برای همه‌ی آرایشگرهای بدون
                                        نرخ اختصاصی اعمال می‌شود.
                                    </span>
                                </li>
                                <li>
                                    <Check size={14} />
                                    <span>
                                        می‌توانید برای آرایشگران VIP نرخ کمتری
                                        تعریف کنید.
                                    </span>
                                </li>
                                <li>
                                    <Check size={14} />
                                    <span>
                                        کمیسیون هنگام تکمیل رزرو کسر می‌شود.
                                    </span>
                                </li>
                                <li>
                                    <AlertCircle size={14} />
                                    <span>
                                        تغییر نرخ فقط روی رزروهای جدید اعمال
                                        می‌شود.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============ مودال افزودن نرخ اختصاصی ============ */}
            {showAddModal && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowAddModal(false)}
                >
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-icon process">
                                <Plus size={24} />
                            </div>
                            <h3>افزودن نرخ اختصاصی</h3>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => setShowAddModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="form-group">
                            <label>
                                انتخاب آرایشگر
                                <span className="required">*</span>
                            </label>
                            <Select2
                                options={[
                                    { value: "", label: "انتخاب کنید..." },
                                    ...barbers.map((b) => ({
                                        value: b.id.toString(),
                                        label: b.name,
                                    })),
                                ]}
                                value={selectedBarber}
                                onChange={(value) => setSelectedBarber(value)}
                                placeholder="جستجوی آرایشگر..."
                                isRtl
                                isSearchable
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                نرخ اختصاصی (٪)
                                <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                className="form-input"
                                value={newRate}
                                onChange={(e) => setNewRate(e.target.value)}
                                min="0"
                                max="50"
                                step="0.5"
                                placeholder="مثلاً ۵"
                            />
                        </div>

                        {errors.custom && (
                            <div className="form-error">
                                <AlertCircle size={12} />
                                {errors.custom}
                            </div>
                        )}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => setShowAddModal(false)}
                            >
                                انصراف
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleAddCustom}
                                disabled={isLoading}
                            >
                                {isLoading ? "در حال ذخیره..." : "ذخیره"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============ مودال حذف نرخ اختصاصی ============ */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="حذف نرخ اختصاصی"
                message={
                    deleteModal.user
                        ? `آیا از حذف نرخ اختصاصی آرایشگر "${deleteModal.user.name}" مطمئن هستید؟\n\nنرخ فعلی: ${toPersianNumber(deleteModal.user.commission_rate)}٪\n\nبا حذف، این آرایشگر از نرخ پیش‌فرض (${toPersianNumber(defaultRate)}٪) استفاده خواهد کرد.`
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
