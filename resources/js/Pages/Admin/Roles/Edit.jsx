import React, { useMemo } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import Select2 from "../Components/Select2";
import {
    ArrowRight,
    Save,
    AlertCircle,
    Edit3,
    Shield,
    Check,
    X,
} from "lucide-react";

export default function Edit({ auth, role, permissions, scope }) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name || "",
        permissions: role.permissions || [],
    });

    // ============ تبدیل permissions به فرمت react-select ============
    // از label (ترجمه شده) استفاده می‌کنیم نه name (اصلی)
    const allPermissionOptions = useMemo(() => {
        return permissions.map((permission) => ({
            value: permission.id,
            label: permission.label, // ترجمه شده از کنترلر
            originalName: permission.name, // برای دیباگ یا ذخیره
        }));
    }, [permissions]);

    // گزینه‌های انتخاب شده
    const selectedPermissionOptions = useMemo(() => {
        return allPermissionOptions.filter((option) =>
            data.permissions.includes(option.value),
        );
    }, [allPermissionOptions, data.permissions]);

    // گزینه‌های انتخاب نشده
    const unselectedPermissionOptions = useMemo(() => {
        return allPermissionOptions.filter(
            (option) => !data.permissions.includes(option.value),
        );
    }, [allPermissionOptions, data.permissions]);

    const handlePermissionsChange = (selectedOptions) => {
        const selectedIds = selectedOptions
            ? selectedOptions.map((opt) => opt.value)
            : [];
        setData("permissions", selectedIds);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/admin/roles/${role.id}/update`);
    };

    const handleSelectAll = () => {
        setData(
            "permissions",
            allPermissionOptions.map((opt) => opt.value),
        );
    };

    const handleClearAll = () => {
        setData("permissions", []);
    };

    return (
        <Layout>
            <Head title={`ویرایش نقش: ${role.name}`} />

            <div className="center-column">
                <div className="page-header-with-back">
                    <Link href="/admin/roles" className="back-btn">
                        <ArrowRight size={20} />
                        <span>بازگشت به لیست نقش‌ها</span>
                    </Link>
                    <h1 className="page-title">ویرایش نقش: {role.name}</h1>
                </div>

                <div className="form-card">
                    <div className="form-card-header">
                        <div
                            className="form-icon-box"
                            style={{
                                backgroundColor: "#eff6ff",
                                color: "#3b82f6",
                            }}
                        >
                            <Edit3 size={24} />
                        </div>
                        <div>
                            <h2 className="form-card-title">
                                ویرایش اطلاعات نقش
                            </h2>
                            <p className="form-card-subtitle">
                                نام و دسترسی‌های نقش را می‌توانید تغییر دهید.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="form-body">
                        {/* فیلد نام */}
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                نام نقش <span className="required">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                className={`form-input ${errors.name ? "error" : ""}`}
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                placeholder="مثلاً: مدیر سیستم"
                                autoFocus
                            />
                            {errors.name && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{errors.name}</span>
                                </div>
                            )}
                        </div>

                        {/* فیلد دسترسی‌ها */}
                        <div className="form-group">
                            <div className="permissions-label-wrapper">
                                <label
                                    htmlFor="permissions"
                                    className="form-label"
                                >
                                    <Shield size={16} />
                                    دسترسی‌ها
                                    <span className="form-hint">
                                        ({data.permissions.length} از{" "}
                                        {permissions.length} انتخاب شده)
                                    </span>
                                </label>

                                <div className="permission-shortcuts">
                                    <button
                                        type="button"
                                        className="shortcut-btn"
                                        onClick={handleSelectAll}
                                    >
                                        <Check size={14} />
                                        انتخاب همه
                                    </button>
                                    <button
                                        type="button"
                                        className="shortcut-btn danger"
                                        onClick={handleClearAll}
                                    >
                                        <X size={14} />
                                        پاک کردن همه
                                    </button>
                                </div>
                            </div>

                            <Select2
                                options={unselectedPermissionOptions}
                                value={selectedPermissionOptions}
                                onChange={handlePermissionsChange}
                                placeholder="جستجو و افزودن دسترسی..."
                                isMulti={true}
                                isRtl={true}
                            />

                            {errors.permissions && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{errors.permissions}</span>
                                </div>
                            )}

                            <div className="permissions-help">
                                <p>
                                    <strong>راهنما:</strong> برای حذف یک دسترسی،
                                    روی ضربدر (×) کنار آن کلیک کنید. برای افزودن
                                    دسترسی جدید، از لیست بازشو انتخاب کنید یا
                                    نام آن را تایپ کنید.
                                </p>
                            </div>
                        </div>

                        {/* دکمه‌ها */}
                        <div className="form-actions">
                            <Link href="/admin/roles" className="btn-outline">
                                انصراف
                            </Link>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={processing}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    justifyContent: "center",
                                }}
                            >
                                {processing ? (
                                    <>
                                        <span className="spinner"></span>
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
            </div>
        </Layout>
    );
}
