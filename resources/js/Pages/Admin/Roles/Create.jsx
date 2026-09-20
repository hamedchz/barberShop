import React, { useState } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import Select2 from "../Components/Select2";
import { ArrowRight, Save, Shield, AlertCircle } from "lucide-react";

export default function Create({ auth, permissions, scope }) {
    // استفاده از useForm اینرشا برای مدیریت فرم
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        permissions: [],
    });

    // تبدیل permissions به فرمت مورد نیاز react-select
    const permissionOptions = permissions.map((perm) => ({
        value: perm.id,
        label: perm.label,
    }));

    // پیدا کردن گزینه‌های انتخاب شده
    const selectedPermissions = permissionOptions.filter((opt) =>
        data.permissions.includes(opt.value),
    );

    // هندل کردن تغییر Select2
    const handlePermissionsChange = (selectedOptions) => {
        // اگر selectedOptions null بود (وقتی همه پاک می‌شوند)
        const selectedIds = selectedOptions
            ? selectedOptions.map((opt) => opt.value)
            : [];
        setData("permissions", selectedIds);
    };

    // ارسال فرم
    const handleSubmit = (e) => {
        e.preventDefault();
        post("/admin/roles/store");
    };

    return (
        <Layout>
            <Head title="ایجاد نقش جدید" />

            <div className="center-column">
                {/* هدر صفحه */}
                <div className="page-header-with-back">
                    <Link href="/admin/roles" className="back-btn">
                        <ArrowRight size={20} />
                        <span>بازگشت به لیست نقش‌ها</span>
                    </Link>
                    <h1 className="page-title">ایجاد نقش جدید</h1>
                </div>

                {/* کارت فرم */}
                <div className="form-card">
                    <div className="form-card-header">
                        <div className="form-icon-box">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="form-card-title">اطلاعات نقش</h2>
                            <p className="form-card-subtitle">
                                نام نقش و دسترسی‌های مورد نظر را انتخاب کنید.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="form-body">
                        {/* فیلد نام نقش */}
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
                                placeholder="مثلاً: مدیر سیستم، معلم، دانش‌آموز"
                                autoFocus
                            />
                            {errors.name && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{errors.name}</span>
                                </div>
                            )}
                        </div>

                        {/* فیلد دسترسی‌ها (Select2) */}
                        <div className="form-group">
                            <label htmlFor="permissions" className="form-label">
                                دسترسی‌ها
                                <span className="form-hint">
                                    (می‌توانید چند مورد را انتخاب کنید)
                                </span>
                            </label>
                            <Select2
                                options={permissionOptions}
                                value={selectedPermissions}
                                onChange={handlePermissionsChange}
                                placeholder="جستجو و انتخاب دسترسی‌ها..."
                                isMulti={true}
                            />
                            {errors.permissions && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    <span>{errors.permissions}</span>
                                </div>
                            )}
                            <p className="form-help-text">
                                {data.permissions.length} دسترسی انتخاب شده است.
                            </p>
                        </div>

                        {/* دکمه‌های عملیات */}
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
                                        ذخیره نقش
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
