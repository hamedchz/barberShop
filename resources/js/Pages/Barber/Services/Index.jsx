import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import ConfirmModal from "../../Admin/Components/ConfirmModal";
import EmptyList from "../../Admin/Components/EmptyList";
import Pagination from "../../Admin/Components/Pagination";
import Search from "../../../Components/Search";

import {
    Plus,
    Scissors,
    Clock,
    DollarSign,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
} from "lucide-react";

export default function ServicesIndex({ auth, services }) {
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        service: null,
        isLoading: false,
    });

    const servicesList = services.data || [];

    // ============ حذف ============
    const openDeleteModal = (service) =>
        setDeleteModal({ isOpen: true, service, isLoading: false });
    const closeDeleteModal = () =>
        setDeleteModal({ isOpen: false, service: null, isLoading: false });

    const handleConfirmDelete = () => {
        if (!deleteModal.service) return;
        setDeleteModal((prev) => ({ ...prev, isLoading: true }));
        router.delete(`/barber/services/${deleteModal.service.id}`, {
            preserveScroll: true,
            onSuccess: () => closeDeleteModal(),
            onError: () =>
                setDeleteModal((prev) => ({ ...prev, isLoading: false })),
        });
    };

    return (
        <Layout>
            <Head title="مدیریت خدمات" />

            <div className="center-column">
                {/* هدر */}
                <div className="roles-page-header">
                    <div>
                        <h1 className="roles-page-title">مدیریت خدمات</h1>
                        <p
                            style={{
                                color: "#6b7280",
                                fontSize: "0.875rem",
                                marginTop: "0.25rem",
                            }}
                        >
                            {services.total} خدمت تعریف شده است
                        </p>
                    </div>
                    <Link
                        href="/barber/services/create"
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
                        <Plus size={18} /> خدمت جدید
                    </Link>
                </div>

                {/* گرید خدمات */}
                {servicesList.length === 0 ? (
                    <div
                        className="card"
                        style={{ textAlign: "center", padding: "3rem" }}
                    >
                        <Scissors
                            size={48}
                            style={{ margin: "0 auto 1rem", color: "#d1d5db" }}
                        />
                        <h3
                            style={{ fontSize: "1.125rem", fontWeight: "bold" }}
                        >
                            هنوز خدمتی ثبت نشده است
                        </h3>
                        <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                            با ایجاد یک خدمت جدید شروع کنید.
                        </p>
                    </div>
                ) : (
                    <div className="services-grid">
                        {servicesList.map((service) => (
                            <div key={service.id} className="service-card">
                                {/* ============ تصویر خدمت ============ */}
                                <div className="service-card-image-wrapper">
                                    {service.image ? (
                                        <img
                                            src={service.image}
                                            alt={service.name}
                                            className="service-card-image"
                                        />
                                    ) : (
                                        <div className="service-card-image-placeholder">
                                            <Scissors size={40} />
                                        </div>
                                    )}
                                    <span
                                        className={`service-status-badge ${
                                            service.is_active
                                                ? "active"
                                                : "inactive"
                                        }`}
                                    >
                                        {service.is_active ? (
                                            <>
                                                <CheckCircle size={12} />
                                                فعال
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={12} />
                                                غیرفعال
                                            </>
                                        )}
                                    </span>
                                </div>

                                {/* نام */}
                                <h3 className="service-name">{service.name}</h3>

                                {/* توضیحات */}
                                {service.description && (
                                    <p className="service-description">
                                        {service.description}
                                    </p>
                                )}

                                {/* مدت و قیمت */}
                                <div className="service-meta">
                                    <div className="service-meta-item">
                                        <Clock size={14} />
                                        <span>{service.duration} دقیقه</span>
                                    </div>
                                    <div className="service-meta-item price">
                                        <DollarSign size={14} />
                                        <span>
                                            {parseFloat(
                                                service.price,
                                            ).toLocaleString("fa-IR")}{" "}
                                            تومان
                                        </span>
                                    </div>
                                </div>

                                {/* دکمه‌ها */}
                                <div className="service-card-actions">
                                    <Link
                                        href={`/barber/services/${service.id}/edit`}
                                        className="admin-card-btn edit"
                                    >
                                        <Edit size={16} />
                                        ویرایش
                                    </Link>
                                    <button
                                        className="admin-card-btn delete"
                                        onClick={() => openDeleteModal(service)}
                                    >
                                        <Trash2 size={16} />
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* صفحه‌بندی */}
                <Pagination links={services.links} />
            </div>

            {/* Modal حذف */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="حذف خدمت"
                message={
                    deleteModal.service
                        ? `آیا از حذف خدمت "${deleteModal.service.name}" مطمئن هستید؟`
                        : ""
                }
                confirmText="بله، حذف کن"
                type="danger"
                isLoading={deleteModal.isLoading}
            />
        </Layout>
    );
}
