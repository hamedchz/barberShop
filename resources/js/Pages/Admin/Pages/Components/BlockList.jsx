import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    GripVertical,
    Eye,
    EyeOff,
    Trash2,
    LayoutTemplate,
    ChevronUp,
    ChevronDown,
} from "lucide-react";

import ConfirmModal from "../../Components/ConfirmModal";

const blockIcons = {
    hero: LayoutTemplate,
    text: LayoutTemplate,
    image_text: LayoutTemplate,
    gallery: LayoutTemplate,
    features: LayoutTemplate,
    team: LayoutTemplate,
    contact_info: LayoutTemplate,
    map: LayoutTemplate,
    contact_form: LayoutTemplate,
    divider: LayoutTemplate,
};

export default function BlockList({
    pageId,
    sections = [],
    sectionTypes = {},
    selectedIndex,
    onSelect,
    onToggle,
    onDelete,
    onMove,
}) {
    const [draggedIndex, setDraggedIndex] = useState(null);

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        section: null,
        isLoading: false,
    });

    const handleDrop = (event, targetIndex) => {
        event.preventDefault();

        if (draggedIndex === null) return;

        onMove(draggedIndex, targetIndex);
        setDraggedIndex(null);
    };

    const openDeleteModal = (section, index) => {
        setDeleteModal({
            isOpen: true,
            section: { ...section, index },
            isLoading: false,
        });
    };

    const closeDeleteModal = () => {
        if (deleteModal.isLoading) return;

        setDeleteModal({
            isOpen: false,
            section: null,
            isLoading: false,
        });
    };

    const handleConfirmDelete = () => {
        if (!deleteModal.section || deleteModal.isLoading) return;

        const sectionId = deleteModal.section.id;
        const sectionIndex = deleteModal.section.index;

        setDeleteModal((prev) => ({
            ...prev,
            isLoading: true,
        }));

        // بلوک ذخیره‌نشده
        if (!sectionId) {
            onDelete(sectionIndex);

            setDeleteModal({
                isOpen: false,
                section: null,
                isLoading: false,
            });

            return;
        }

        // بلوک ذخیره‌شده
        router.delete(
            route("admin.pages.sections.destroy", {
                page: pageId,
                section: sectionId,
            }),
            {
                preserveScroll: true,

                onSuccess: () => {
                    onDelete(sectionIndex);

                    setDeleteModal({
                        isOpen: false,
                        section: null,
                        isLoading: false,
                    });
                },

                onError: () => {
                    setDeleteModal((prev) => ({
                        ...prev,
                        isLoading: false,
                    }));
                },

                onFinish: () => {
                    setDeleteModal((prev) => ({
                        ...prev,
                        isLoading: false,
                    }));
                },
            },
        );
    };

    return (
        <>
            <div className="builder-panel builder-sections-panel">
                <div className="builder-panel-heading">
                    <h3>محتوای صفحه</h3>
                    <p>{sections.length} بخش به صفحه اضافه شده است.</p>
                </div>

                {!sections.length ? (
                    <div className="builder-empty">
                        <div className="builder-empty-icon">
                            <LayoutTemplate size={34} />
                        </div>

                        <h3>هنوز بخشی اضافه نکرده‌اید</h3>

                        <p>
                            از قسمت افزودن بخش، اولین بلوک صفحه خود را انتخاب
                            کنید.
                        </p>
                    </div>
                ) : (
                    <div className="builder-sections-list">
                        {sections.map((section, index) => {
                            const Icon =
                                blockIcons[section.type] ?? LayoutTemplate;

                            const definition = sectionTypes[section.type];
                            const isSelected = selectedIndex === index;

                            return (
                                <div
                                    key={section.id ?? `new-${index}`}
                                    draggable
                                    onDragStart={() => setDraggedIndex(index)}
                                    onDragOver={(event) =>
                                        event.preventDefault()
                                    }
                                    onDrop={(event) => handleDrop(event, index)}
                                    onDragEnd={() => setDraggedIndex(null)}
                                    className={[
                                        "builder-section-item",
                                        isSelected ? "is-selected" : "",
                                        draggedIndex === index
                                            ? "is-dragging"
                                            : "",
                                    ].join(" ")}
                                >
                                    <button
                                        type="button"
                                        className="builder-section-main"
                                        onClick={() => onSelect(index)}
                                    >
                                        <span className="builder-section-drag">
                                            <GripVertical size={19} />
                                        </span>

                                        <span className="builder-section-icon">
                                            <Icon size={19} />
                                        </span>

                                        <span className="builder-section-info">
                                            <strong>
                                                {definition?.label ??
                                                    section.type}
                                            </strong>

                                            <small>
                                                بخش {index + 1}
                                                {!section.is_active &&
                                                    " · غیرفعال"}
                                            </small>
                                        </span>
                                    </button>

                                    <div className="builder-section-actions">
                                        <button
                                            type="button"
                                            title="انتقال به بالا"
                                            disabled={index === 0}
                                            onClick={() =>
                                                onMove(index, index - 1)
                                            }
                                        >
                                            <ChevronUp size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            title="انتقال به پایین"
                                            disabled={
                                                index === sections.length - 1
                                            }
                                            onClick={() =>
                                                onMove(index, index + 1)
                                            }
                                        >
                                            <ChevronDown size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            title={
                                                section.is_active
                                                    ? "غیرفعال کردن"
                                                    : "فعال کردن"
                                            }
                                            onClick={() => onToggle(index)}
                                        >
                                            {section.is_active ? (
                                                <Eye size={16} />
                                            ) : (
                                                <EyeOff size={16} />
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            title="حذف بلوک"
                                            className="is-danger"
                                            onClick={() =>
                                                openDeleteModal(section, index)
                                            }
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="حذف بلوک"
                message={
                    deleteModal.section
                        ? `آیا از حذف بلوک «${sectionTypes[deleteModal.section.type]?.label || deleteModal.section.type}» مطمئن هستید؟`
                        : ""
                }
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                type="danger"
                isLoading={deleteModal.isLoading}
            />
        </>
    );
}
