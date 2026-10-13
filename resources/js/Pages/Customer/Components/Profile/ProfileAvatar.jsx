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
import { toPersianNumber } from "../../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../../utils/dateHelpers";

export default function ProfileAvatar({ user }) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // ============ انتخاب فایل ============
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // ✅ Validation سمت کلاینت
        setError(null);

        if (!file.type.startsWith("image/")) {
            setError("فایل باید تصویر باشد.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("حجم تصویر نمی‌تواند بیشتر از ۲ مگابایت باشد.");
            return;
        }

        // ✅ پیش‌نمایش
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);

        // ✅ آپلود
        setIsUploading(true);
        const formData = new FormData();
        formData.append("avatar", file);

        router.post(route("customer.profile.update-avatar"), formData, {
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

    // ============ حذف آواتار ============
    const handleDelete = () => {
        if (!confirm("آیا از حذف آواتار مطمئن هستید؟")) return;

        setIsDeleting(true);
        router.delete(route("customer.profile.delete-avatar"), {
            preserveScroll: true,
            onFinish: () => setIsDeleting(false),
        });
    };

    const displayAvatar = preview || user.thumbnail;

    return (
        <div className="profile-avatar-card">
            <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                    {displayAvatar ? (
                        <img src={displayAvatar} alt={user.name} />
                    ) : (
                        <div className="avatar-placeholder">
                            <User size={48} />
                        </div>
                    )}

                    {/* Overlay لودینگ */}
                    {isUploading && (
                        <div className="avatar-overlay">
                            <div className="spinner"></div>
                        </div>
                    )}
                </div>

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
                            onClick={handleDelete}
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
        </div>
    );
}
