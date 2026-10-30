import { useState, useRef } from "react";
import { router } from "@inertiajs/react";
import {
    Camera,
    Trash2,
    User,
    CheckCircle,
    AlertCircle,
    Upload,
    Phone,
} from "lucide-react";
import ConfirmModal from "../../../Admin/Components/ConfirmModal";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../../utils/dateHelpers";
import "../Assets/css/ProfileAvatarComponent.css";
export default function ProfileAvatar({ user }) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        user: null,
        isLoading: false,
    });
    const openDeleteModal = (user) =>
        setDeleteModal({ isOpen: true, user, isLoading: false });
    const closeDeleteModal = () =>
        setDeleteModal({ isOpen: false, user: null, isLoading: false });

    const handleConfirmDelete = () => {
        if (!deleteModal.user) return;
        setDeleteModal((prev) => ({ ...prev, isLoading: true }));
        router.delete(`/barber/profile/avatar/delete`, {
            preserveScroll: true,
            onSuccess: () => closeDeleteModal(),
            onError: () =>
                setDeleteModal((prev) => ({ ...prev, isLoading: false })),
        });
    };

    // ============ انتخاب فایل ============
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        if (!file.type.startsWith("image/")) {
            setError("فایل باید تصویر باشد.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("حجم تصویر نمی‌تواند بیشتر از ۲ مگابایت باشد.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);

        setIsUploading(true);
        const formData = new FormData();
        formData.append("avatar", file);

        router.post(route("barber.profile.update-avatar"), formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setPreview(null);
                setIsUploading(false);
            },
            onError: (errors) => {
                setError(errors.avatar || "خطا در آپلود");
                setPreview(null);
                setIsUploading(false);
            },
        });
    };
    const [preview, setPreview] = useState(null);

    const displayAvatar = preview || user.thumbnail;

    return (
        <div className="profile-avatar-card">
            <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                    {user.avatar ? (
                        <img src={user.thumbnail} alt={user.name} />
                    ) : (
                        <div className="avatar-placeholder">
                            <span>{user.name?.charAt(0).toUpperCase()}</span>
                        </div>
                    )}

                    {/* Overlay لودینگ */}
                    {isUploading && (
                        <div className="avatar-overlay">
                            <div className="spinner"></div>
                        </div>
                    )}
                </div>
                {/* TODO:هاور دلیت دارای خط است پاگ شود  */}
                {/* دکمه‌های عملیات */}
                <div className="avatar-actions">
                    <label className="avatar-action-btn upload">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={isUploading}
                            style={{ display: "none" }}
                        />
                        <Camera size={16} />
                    </label>

                    {user.avatar && (
                        <button
                            type="button"
                            className="avatar-action-btn delete"
                            onClick={() => openDeleteModal(user)}
                            disabled={isDeleting}
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* اطلاعات */}
            <div className="profile-avatar-info">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                {user.phone && (
                    <span className="phone-badge">
                        <Phone size={12} />
                        {toPersianNumber(user.phone)}
                        {user.phone_verified && (
                            <CheckCircle size={12} className="verified" />
                        )}
                    </span>
                )}
            </div>

            {/* خطا */}
            {error && (
                <div className="avatar-error">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {/* راهنما */}
            <div className="avatar-hint">
                فرمت‌های مجاز: JPG, PNG, WEBP
                <br />
                حداکثر حجم: ۲ مگابایت
            </div>

            {/* اطلاعات عضویت */}
            <div className="profile-meta">
                <span>عضویت از {formatFullDateTime(user.created_at)}</span>
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="حذف آواتار "
                message={
                    deleteModal.user
                        ? `آیا از حذف آواتار خود  مطمئن هستید؟`
                        : ""
                }
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                type="danger"
                isLoading={deleteModal.isLoading}
            />
        </div>
    );
}
