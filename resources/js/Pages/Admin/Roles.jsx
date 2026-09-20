import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "./Layouts/Layout";
import PermissionBadge from "./Components/PermissionBadge";
import EmptyList from "./Components/EmptyList";

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
    CheckCircle,
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
    CheckCircle,
};

// داده‌های نمونه برای دسترسی‌ها
const permissionsData = [
    { id: 1, label: "View Dashboard", color: "green", icon: Eye },
    { id: 2, label: "Edit Students", color: "blue", icon: Edit },
    { id: 3, label: "Manage Classes", color: "purple", icon: Calendar },
    { id: 4, label: "View Reports", color: "orange", icon: BarChart2 },
    { id: 5, label: "System Settings", color: "red", icon: Settings },
    { id: 6, label: "Manage Users", color: "blue", icon: Users },
    { id: 7, label: "Access Database", color: "gray", icon: Database },
    { id: 8, label: "Send Emails", color: "green", icon: Mail },
    { id: 9, label: "View Materials", color: "purple", icon: FileText },
    { id: 10, label: "Security Logs", color: "red", icon: Lock },
];

export default function Roles({ auth, roles, scope }) {
    // roles شامل دیتای Pagination لاراول است:
    // roles.data = آرایه نقش‌ها
    // roles.links = لینک‌های صفحه‌بندی
    // roles.total = تعداد کل

    const rolesList = roles.data || [];

    return (
        <Layout>
            <Head title="Roles List" />

            <div className="center-column">
                {/* هدر صفحه */}
                <div className="roles-page-header">
                    <div>
                        <h1 className="roles-page-title">Role Management</h1>
                        <p
                            style={{
                                color: "#6b7280",
                                fontSize: "0.875rem",
                                marginTop: "0.25rem",
                            }}
                        >
                            Total {roles.total} roles found
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
                        <Plus size={18} /> Add New Role
                    </Link>
                </div>

                {/* اگر هیچ نقشی وجود نداشت */}
                {rolesList.length === 0 && (
                    <div
                        className="card"
                        style={{ textAlign: "center", padding: "3rem" }}
                    >
                        <EmptyList
                            title="نقشی پیدا نشد."
                            message="در حال حاضر هیچ نقشی برای نمایش وجود ندارد."
                        />
                        {/* <Shield
                            size={48}
                            className="text-gray-300"
                            style={{ margin: "0 auto 1rem" }}
                        />
                        <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                            No Roles Found
                        </h3>
                        <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                            Start by creating a new role.
                        </p> */}
                    </div>
                )}

                {/* حلقه روی نقش‌ها */}
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
                                            "No description provided for this role."}
                                    </p>
                                    <div className="role-meta">
                                        <span>ID: {role.id}</span>
                                        <span>•</span>
                                        <span>
                                            {role.permissions?.length || 0}{" "}
                                            Permissions
                                        </span>
                                        <span>•</span>
                                        <span>
                                            Created:{" "}
                                            {new Date(
                                                role.created_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="role-actions">
                                <Link
                                    href={`/admin/roles/${role.id}/edit`}
                                    className="btn-icon"
                                    title="Edit Role"
                                >
                                    <Edit size={18} />
                                </Link>
                                <button
                                    className="btn-icon danger"
                                    title="Delete Role"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                `Are you sure you want to delete the role "${role.name}"?`,
                                            )
                                        ) {
                                            router.delete(
                                                `/admin/roles/${role.id}`,
                                            );
                                        }
                                    }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* بخش دسترسی‌ها */}
                        <div className="permissions-section">
                            <div className="permissions-header">
                                <h3 className="permissions-title">
                                    Permissions
                                    <span className="permissions-count">
                                        {role.permissions?.length || 0} granted
                                    </span>
                                </h3>
                                <Link
                                    href={`/admin/roles/${role.id}/permissions`}
                                    className="link-btn"
                                >
                                    Edit Permissions
                                </Link>
                            </div>

                            <div className="permissions-grid">
                                {role.permissions &&
                                role.permissions.length > 0 ? (
                                    role.permissions.map((perm) => {
                                        const IconComponent =
                                            iconMap[perm.icon] || CheckCircle;

                                        return (
                                            <PermissionBadge
                                                key={perm.id}
                                                label={perm.name}
                                                color={perm.color || "gray"}
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
                                        No permissions assigned to this role.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* صفحه‌بندی (Pagination) */}
                {roles.links && roles.links.length > 3 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "0.5rem",
                            marginTop: "1rem",
                            flexWrap: "wrap",
                        }}
                    >
                        {roles.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || "#"}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`btn-outline ${link.active ? "active" : ""}`}
                                style={{
                                    padding: "0.5rem 1rem",
                                    fontSize: "0.875rem",
                                    textDecoration: "none",
                                    opacity: link.url ? 1 : 0.5,
                                    pointerEvents: link.url ? "auto" : "none",
                                    backgroundColor: link.active
                                        ? "var(--primary)"
                                        : "transparent",
                                    color: link.active
                                        ? "white"
                                        : "var(--primary)",
                                    width: "auto",
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
