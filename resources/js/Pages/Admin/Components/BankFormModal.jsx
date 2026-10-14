import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";
import {
    X,
    Building2,
    Save,
    AlertCircle,
    Upload,
    Trash2,
    Hash,
    Palette,
    FileText,
} from "lucide-react";

export default function BankFormModal({ isOpen, bank, onClose }) {
    const isEdit = !!bank;

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        code: "",
        color: "",
        description: "",
        is_active: true,
        sort_order: 0,
    });

    const [iconFile, setIconFile] = useState(null);
    const [iconPreview, setIconPreview] = useState(null);
    const [removeIcon, setRemoveIcon] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const fileInputRef = useRef(null);

    // ============ مقدار اولیه ============
    useEffect(() => {
        if (isOpen) {
            if (bank) {
                setFormData({
                    name: bank.name || "",
                    slug: bank.slug || "",
                    code: bank.code || "",
                    color: bank.color || "",
                    description: bank.description || "",
                    is_active: bank.is_active ?? true,
                    sort_order: bank.sort_order || 0,
                });
                setIconPreview(bank.icon_url || null);
            } else {
                setFormData({
                    name: "",
                    slug: "",
                    code: "",
                    color: "",
                    description: "",
                    is_active: true,
                    sort_order: 0,
                });
                setIconPreview(null);
            }

            setIconFile(null);
            setRemoveIcon(false);
            setErrors({});
        }
    }, [isOpen, bank]);

    // ============ انتخاب آیکون ============
    const handleIconSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErrors((prev) => ({ ...prev, icon: undefined }));

        // چک حجم
        if (file.size > 512 * 1024) {
            setErrors((prev) => ({
                ...prev,
                icon: "حجم تصویر نمی‌تواند بیشتر از ۵۱۲ کیلوبایت باشد.",
            }));
            return;
        }

        // چک فرمت
        if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({
                ...prev,
                icon: "فایل باید تصویر باشد.",
            }));
            return;
        }

        setIconFile(file);
        setRemoveIcon(false);

        // پیش‌نمایش
        const reader = new FileReader();
        reader.onload = (e) => setIconPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    // ============ حذف آیکون ============
    const handleRemoveIcon = () => {
        setIconFile(null);
        setIconPreview(null);
        setRemoveIcon(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ============ ارسال ============
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        const data = {
            name: formData.name,
            slug: formData.slug,
            code: formData.code,
            color: formData.color,
            description: formData.description,
            is_active: formData.is_active ? 1 : 0,
            sort_order: formData.sort_order,
            remove_icon: removeIcon ? 1 : 0,
        };

        if (iconFile) {
            data.icon = iconFile;
        }

        if (isEdit) {
            // ✅ برای ویرایش
            data._method = "PUT";

            router.post(route("admin.banks.update", bank.id), data, {
                preserveScroll: true,
                forceFormData: true, // ✅ همیشه true
                onSuccess: () => {
                    setIsLoading(false);
                    onClose();
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsLoading(false);
                },
            });
        } else {
            // ✅ برای اضافه
            router.post(route("admin.banks.store"), data, {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    setIsLoading(false);
                    onClose();
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsLoading(false);
                },
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal modal-lg"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ============ هدر ============ */}
                <div className="modal-header">
                    <div className="modal-icon process">
                        <Building2 size={24} />
                    </div>
                    <h3>{isEdit ? "ویرایش بانک" : "افزودن بانک جدید"}</h3>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ============ فرم ============ */}
                <form onSubmit={handleSubmit} className="bank-form">
                    {/* آیکون */}
                    <div className="form-group">
                        <label>آیکون بانک</label>
                        <div className="icon-upload-section">
                            {iconPreview ? (
                                <div className="icon-preview">
                                    <img src={iconPreview} alt="icon" />
                                    <button
                                        type="button"
                                        className="icon-remove-btn"
                                        onClick={handleRemoveIcon}
                                        disabled={isLoading}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="icon-upload-placeholder">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleIconSelect}
                                        disabled={isLoading}
                                        style={{ display: "none" }}
                                    />
                                    <Upload size={24} />
                                    <span>انتخاب تصویر</span>
                                    <small>حداکثر ۵۱۲ کیلوبایت</small>
                                </label>
                            )}
                        </div>
                        {errors.icon && (
                            <span className="form-error">
                                <AlertCircle size={12} />
                                {errors.icon}
                            </span>
                        )}
                    </div>

                    <div className="form-row">
                        {/* نام */}
                        <div className="form-group">
                            <label>
                                نام بانک
                                <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-input ${
                                    errors.name ? "error" : ""
                                }`}
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="مثلاً: بانک ملت"
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <span className="form-error">
                                    <AlertCircle size={12} />
                                    {errors.name}
                                </span>
                            )}
                        </div>

                        {/* کد */}
                        <div className="form-group">
                            <label>
                                <Hash size={14} />
                                کد بانک
                            </label>
                            <input
                                type="text"
                                className={`form-input ltr ${
                                    errors.code ? "error" : ""
                                }`}
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        code: e.target.value,
                                    }))
                                }
                                placeholder="مثلاً: 012"
                                dir="ltr"
                                disabled={isLoading}
                            />

                            <span className="form-hint">
                                کد رسمی بانک (اختیاری)
                            </span>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Slug */}
                        {/* <div className="form-group">
                            <label>Slug</label>
                            <input
                                type="text"
                                className={`form-input ltr ${
                                    errors.slug ? "error" : ""
                                }`}
                                value={formData.slug}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        slug: e.target.value,
                                    }))
                                }
                                placeholder="mellat"
                                dir="ltr"
                                disabled={isLoading}
                            />
                            <span className="form-hint">
                                اگه خالی بذاری، خودکار ساخته می‌شه.
                            </span>
                        </div> */}

                        {/* رنگ */}
                        <div className="form-group">
                            <label>
                                <Palette size={14} />
                                رنگ
                            </label>
                            <input
                                type="color"
                                className="form-input color-input"
                                value={formData.color || "#3b82f6"}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        color: e.target.value,
                                    }))
                                }
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* توضیحات */}
                    <div className="form-group">
                        <label>
                            <FileText size={14} />
                            توضیحات
                        </label>
                        <textarea
                            className="form-textarea"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            placeholder="توضیحات اختیاری..."
                            rows={3}
                            maxLength={500}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-row">
                        {/* ترتیب */}
                        <div className="form-group">
                            <label>ترتیب نمایش</label>
                            <input
                                type="number"
                                className="form-input ltr"
                                value={formData.sort_order}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        sort_order: Number(e.target.value) || 0,
                                    }))
                                }
                                min="0"
                                dir="ltr"
                                disabled={isLoading}
                            />
                        </div>

                        {/* وضعیت */}
                        <div className="form-group">
                            <label>وضعیت</label>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            is_active: e.target.checked,
                                        }))
                                    }
                                    disabled={isLoading}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-label">
                                    {formData.is_active ? "فعال" : "غیرفعال"}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* ============ دکمهها ============ */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-ghost"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            انصراف
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
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
                                    {isEdit ? "ذخیره تغییرات" : "افزودن بانک"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
