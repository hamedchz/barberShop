import React, { useMemo, useState } from "react";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import {
    Scissors,
    Clock3,
    Banknote,
    Plus,
    Pencil,
    Trash2,
    Check,
    X,
    Search,
    Image as ImageIcon,
    BriefcaseBusiness,
    CircleCheck,
    Power,
    ArrowRight,
} from "lucide-react";
// import Swal from "sweetalert2";
import "./Assets/css/barber-services.css";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatCompactNumber } from "../../../Constants/formatCompactNumber";
import BarberLayout from "../../Admin/Layouts/Layout";
import ConfirmModal from "../../Admin/Components/ConfirmModal";

export default function Index({ categories = [], services = [] }) {
    const { url } = usePage();

    const isFromSetup =
        new URLSearchParams(url.split("?")[1] || "").get("from") === "setup";

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        service: null,
        isLoading: false,
    });
    const [search, setSearch] = useState("");
    const [editingService, setEditingService] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        category_id: "",
        price: "",
        duration: "",
    });

    const [editData, setEditData] = useState({
        price: "",
        duration: "",
    });

    const { post, processing, errors, reset, clearErrors } = useForm();

    const activeServices = services.filter((service) => service.is_active);

    const availableCategories = useMemo(() => {
        const addedCategoryIds = services.map((service) =>
            Number(service.category_id),
        );

        return categories.filter((category) => {
            const matchesSearch = category.name
                .toLowerCase()
                .includes(search.trim().toLowerCase());

            return (
                !addedCategoryIds.includes(Number(category.id)) && matchesSearch
            );
        });
    }, [categories, services, search]);

    const handleAddService = (category) => {
        setFormData({
            category_id: String(category.id),
            price: "",
            duration: category.suggested_duration || "",
        });

        clearErrors();
        setShowForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route("barber.services.store"), {
            data: formData,
            preserveScroll: true,
            onSuccess: () => {
                setShowForm(false);
                reset();
            },
        });
    };

    const handleEdit = (service) => {
        setEditingService(service);

        setEditData({
            price: service.price ?? "",
            duration: service.duration ?? "",
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();

        router.put(
            route("barber.services.update", editingService.id),
            editData,
            {
                preserveScroll: true,
                onSuccess: () => setEditingService(null),
            },
        );
    };

    const handleToggle = (service) => {
        router.put(
            route("barber.services.update", {
                service: service.id,
                toggle: true,
            }),
            {
                is_active: !service.is_active,
            },
            {
                preserveScroll: true,
            },
        );
    };

    const handleDelete = (service) => {
        Swal.fire({
            title: "حذف سرویس",
            text: `آیا از حذف سرویس «${service.name}» مطمئن هستید؟`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "بله، حذف شود",
            cancelButtonText: "انصراف",
            customClass: {
                popup: "rtl-alert",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("barber.services.destroy", service.id), {
                    preserveScroll: true,
                });
            }
        });
    };

    const openDeleteModal = (service) =>
        setDeleteModal({ isOpen: true, service, isLoading: false });

    const closeDeleteModal = () =>
        setDeleteModal({
            isOpen: false,
            service: null,
            isLoading: false,
        });

    const handleConfirmDelete = () => {
        if (!deleteModal.service) return;
        setDeleteModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(`/barber/services/${deleteModal.service.id}`, {
            preserveScroll: true,
            onSuccess: () => closeDeleteModal(),
            onError: () =>
                setDeleteModal((prev) => ({
                    ...prev,
                    isLoading: false,
                })),
        });
    };

    return (
        <BarberLayout>
            <Head title="خدمات من" />

            <div className="barber-services-page" dir="rtl">
                {/* Header */}
                <div className="barber-services-header">
                    <div>
                        <div className="barber-services-title">
                            <div className="barber-services-title-icon">
                                <Scissors size={22} />
                            </div>

                            <div>
                                <h1>خدمات من</h1>
                                <p>
                                    خدماتی که به مشتریان ارائه می‌دهید را مدیریت
                                    کنید.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="barber-services-header-actions">
                        <Link
                            href={route(
                                "barber.services.create",
                                isFromSetup ? { from: "setup" } : {},
                            )}
                            className="sc-create-btn"
                        >
                            <Plus size={18} />
                            خدمت جدید
                        </Link>
                        {isFromSetup && (
                            <Link
                                href={route("barber.setup")}
                                className="barber-services-back-btn"
                            >
                                <ArrowRight size={17} />
                                بازگشت به راه‌اندازی نوبت‌دهی
                            </Link>
                        )}
                    </div>
                </div>

                {/* My services */}
                <section className="barber-services-section">
                    <div className="barber-services-section-heading">
                        <div>
                            <h2>سرویس‌های انتخاب‌شده</h2>
                            <p>
                                قیمت و مدت‌زمان هر سرویس را متناسب با خدمات خود
                                تنظیم کنید.
                            </p>
                        </div>
                    </div>

                    {services.length === 0 ? (
                        <div className="barber-services-empty">
                            <div className="barber-services-empty-icon">
                                <Scissors size={32} />
                            </div>
                            <h3>هنوز سرویسی انتخاب نکرده‌اید</h3>
                            <p>
                                از فهرست خدمات موجود، سرویس‌هایی را که ارائه
                                می‌دهید انتخاب کنید.
                            </p>
                        </div>
                    ) : (
                        <div className="barber-services-grid">
                            {services.map((service) => (
                                <div
                                    className={`barber-service-card ${
                                        !service.is_active ? "is-inactive" : ""
                                    }`}
                                    key={service.id}
                                >
                                    <div className="barber-service-image">
                                        {service.image_url ? (
                                            <img
                                                src={service.image_url}
                                                alt={service.name}
                                            />
                                        ) : (
                                            <ImageIcon size={30} />
                                        )}

                                        <span
                                            className={`barber-service-status ${
                                                service.is_active
                                                    ? "active"
                                                    : "inactive"
                                            }`}
                                        >
                                            {service.is_active
                                                ? "فعال"
                                                : "غیرفعال"}
                                        </span>
                                    </div>

                                    <div className="barber-service-content">
                                        <h3>{service.name}</h3>

                                        <p className="barber-service-description">
                                            {service.description ||
                                                "بدون توضیحات"}
                                        </p>

                                        {editingService?.id === service.id ? (
                                            <form
                                                onSubmit={handleUpdate}
                                                className="barber-service-edit-form"
                                            >
                                                <label>
                                                    قیمت اختصاصی (تومان)
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={Number(
                                                            editData.price,
                                                        )}
                                                        onChange={(e) =>
                                                            setEditData({
                                                                ...editData,
                                                                price: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="قیمت پایه"
                                                    />
                                                </label>

                                                <label>
                                                    مدت‌زمان (دقیقه)
                                                    <input
                                                        type="number"
                                                        min="5"
                                                        max="600"
                                                        value={
                                                            editData.duration
                                                        }
                                                        onChange={(e) =>
                                                            setEditData({
                                                                ...editData,
                                                                duration:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="مدت پایه"
                                                    />
                                                </label>

                                                <div className="barber-service-edit-actions">
                                                    <button
                                                        type="submit"
                                                        className="service-btn-save"
                                                    >
                                                        <Check size={16} />
                                                        ذخیره
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="service-btn-cancel"
                                                        onClick={() =>
                                                            setEditingService(
                                                                null,
                                                            )
                                                        }
                                                    >
                                                        <X size={16} />
                                                        انصراف
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <>
                                                <div className="barber-service-meta">
                                                    <div>
                                                        <Banknote size={17} />
                                                        <span>
                                                            {toPersianNumber(
                                                                Number(
                                                                    service.price,
                                                                ).toLocaleString(
                                                                    "en-US",
                                                                ),
                                                            )}{" "}
                                                            تومان
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <Clock3 size={17} />
                                                        <span>
                                                            {service.duration
                                                                ? `${toPersianNumber(
                                                                      service.duration,
                                                                  )} دقیقه`
                                                                : "مدت پایه"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="barber-service-actions">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEdit(service)
                                                        }
                                                    >
                                                        <Pencil size={15} />
                                                        ویرایش
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleToggle(
                                                                service,
                                                            )
                                                        }
                                                    >
                                                        <Power size={15} />
                                                        {service.is_active
                                                            ? "غیرفعال‌سازی"
                                                            : "فعال‌سازی"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="delete"
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                service,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="حذف سرویس"
                message={
                    deleteModal.service
                        ? `آیا از حذف سرویس   "${
                              deleteModal.service.name
                          }"  مطمئن هستید؟`
                        : ""
                }
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                type="danger"
                isLoading={deleteModal.isLoading}
            />
        </BarberLayout>
    );
}
