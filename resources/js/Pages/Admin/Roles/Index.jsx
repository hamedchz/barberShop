import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import PermissionBadge from "../Components/PermissionBadge";
import EmptyList from "../Components/EmptyList";
import ConfirmModal from "../Components/ConfirmModal";
import { toJalaali } from "jalaali-js";
import Pagination from "../Components/Pagination";
import Search from "../../../Components/Search";

import {
    Shield,
    Edit,
    Trash2,
    Plus,
    Users,
    FileText,
    Settings,
    BarChart2,
    Lock,
    Database,
    Mail,
    Calendar,
    Eye,
    UserKey,
} from "lucide-react";

const iconMap = {
    Users,
    FileText,
    Settings,
    BarChart2,
    Lock,
    Database,
    Mail,
    Calendar,
    Eye,
    UserKey,
};

const formatJalaliDate = (date) => {
    if (!date) return "";

    const d = new Date(date);

    const { jy, jm, jd } = toJalaali(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    );

    return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
};

export default function Roles({ auth, roles, filters, scope }) {
    // ============ State مدیریت Modal حذف ============
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        role: null,
        isLoading: false,
    });

    // ============ State جستجو ============
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [isSearching, setIsSearching] = useState(false);

    const rolesList = roles.data || [];

    // ============ جستجوی سمت سرور ============
    const handleSearch = (term) => {
        setIsSearching(true);
        router.get(
            "/admin/roles",
            { search: term },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true, // جایگزینی history به جای اضافه کردن
                onFinish: () => setIsSearching(false),
            },
        );
    };

    // ============ باز کردن Modal ============
    const openDeleteModal = (role) => {
        setDeleteModal({
            isOpen: true,
            role: role,
            isLoading: false,
        });
    };

    // ============ بستن Modal ============
    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            role: null,
            isLoading: false,
        });
    };

    // ============ تایید حذف ============
    const handleConfirmDelete = () => {
        if (!deleteModal.role) return;

        setDeleteModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(`/admin/roles/${deleteModal.role.id}/destroy`, {
            preserveScroll: true,
            onSuccess: () => {
                // Modal بعد از موفقیت بسته می‌شود
                closeDeleteModal();
            },
            onError: () => {
                // در صورت خطا، حالت Loading را برمی‌گردانیم
                setDeleteModal((prev) => ({ ...prev, isLoading: false }));
            },
        });
    };

    return (
        <Layout>
            <Head title="مدیریت نقش‌ها" />

            <div className="center-column">
                {/* ============ هدر صفحه ============ */}
                <div className="roles-page-header">
                    <div>
                        <h1 className="roles-page-title">مدیریت نقش‌ها</h1>
                        <p
                            style={{
                                color: "#6b7280",
                                fontSize: "0.875rem",
                                marginTop: "0.25rem",
                            }}
                        >
                            {roles.total} نقش پیدا شد
                        </p>
                    </div>
                    <Link
                        href="/admin/roles/create"
                        className="btn-primary"
                        style={{
                            width: "auto",
                            padding: "0.5rem 1.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            textDecoration: "none",
                        }}
                    >
                        <Plus size={18} /> نقش جدید
                    </Link>
                </div>
                <div style={{ marginBottom: "1.5rem", maxWidth: "500px" }}>
                    <Search
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onSearch={handleSearch}
                        placeholder="جستجو در نام، توضیحات یا دسترسی‌ها..."
                        delay={500}
                        isLoading={isSearching}
                    />
                </div>
                {/* ============ اگر هیچ نقشی وجود نداشت ============ */}
                {rolesList.length === 0 && (
                    <div
                        className="card"
                        style={{ textAlign: "center", padding: "3rem" }}
                    >
                        <EmptyList
                            title="نقشی پیدا نشد."
                            message="در حال حاضر هیچ نقشی برای نمایش وجود ندارد."
                        />
                    </div>
                )}

                {/* ============ حلقه روی نقش‌ها ============ */}
                {rolesList.map((role) => (
                    <div key={role.id} style={{ marginBottom: "2rem" }}>
                        {/* کارت اصلی نقش */}
                        <div className="role-main-card">
                            <div className="role-card-content">
                                <div className="role-icon-box">
                                    <Shield size={32} />
                                </div>
                                <div className="role-info">
                                    <h2 className="role-name">{role.name}</h2>
                                    <p className="role-description">
                                        {role.description ||
                                            "توضیحی برای این نقش ثبت نشده است."}
                                    </p>
                                    <div className="role-meta">
                                        <span>
                                            دسترسی‌ها:{" "}
                                            {role.permissions?.length || 0}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            تاریخ ایجاد:{" "}
                                            {formatJalaliDate(role.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="permissions-grid">
                                {role.permissions &&
                                role.permissions.length > 0 ? (
                                    role.permissions.map((perm) => {
                                        const IconComponent =
                                            iconMap[perm.icon] || UserKey;

                                        return (
                                            <PermissionBadge
                                                key={perm.id}
                                                label={perm.label || perm.name}
                                                color={perm.color || "green"}
                                                icon={IconComponent}
                                            />
                                        );
                                    })
                                ) : (
                                    <p
                                        style={{
                                            color: "#9ca3af",
                                            fontSize: "0.875rem",
                                        }}
                                    >
                                        هیچ دسترسی به این نقش اختصاص داده نشده
                                        است.
                                    </p>
                                )}
                            </div>
                            <div className="role-actions">
                                {role.name !== "آرایشگر" &&
                                    role.name !== "سوپر ادمین" && (
                                        <>
                                            <Link
                                                href={`/admin/roles/${role.id}/edit`}
                                                className="btn-icon"
                                                title="ویرایش نقش"
                                            >
                                                <Edit size={18} />
                                            </Link>

                                            <button
                                                className="btn-icon danger"
                                                title="حذف نقش"
                                                onClick={() =>
                                                    openDeleteModal(role)
                                                }
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* ============ صفحه‌بندی (Pagination) ============ */}
                <Pagination links={roles.links} />
            </div>

            {/* ============ Modal تایید حذف ============ */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="حذف نقش"
                message={
                    deleteModal.role
                        ? `آیا از حذف نقش "${deleteModal.role.name}" مطمئن هستید؟ این عملیات قابل بازگشت نیست و تمام دسترسی‌های مرتبط نیز حذف خواهند شد.`
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
