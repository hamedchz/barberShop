import { useRef, useState } from "react";
import axios from "axios";
import { ImagePlus, Upload, X, LoaderCircle } from "lucide-react";
export default function ImageUpload({
    pageId,
    value,
    onChange,
    multiple = false,
    maxFiles = 20,
}) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [uploadedPreviews, setUploadedPreviews] = useState({});

    const values = multiple
        ? Array.isArray(value)
            ? value
            : []
        : value
          ? [value]
          : [];

    const getImageUrl = (path) => {
        if (!path) return "";

        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        return `/storage/${path.replace(/^\/+/, "")}`;
    };

    const uploadFiles = async (files) => {
        const selectedFiles = Array.from(files);

        if (!selectedFiles.length) return;

        if (multiple && values.length + selectedFiles.length > maxFiles) {
            setError(`حداکثر ${maxFiles} تصویر می‌توانید انتخاب کنید.`);
            return;
        }

        setUploading(true);
        setError("");

        try {
            const uploaded = [];

            for (const file of selectedFiles) {
                const formData = new FormData();
                formData.append("image", file);

                const response = await axios.post(
                    route("admin.pages.images.upload", pageId),
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    },
                );

                const result = response.data;

                uploaded.push(result.path);

                setUploadedPreviews((previous) => ({
                    ...previous,
                    [result.path]: result.url,
                }));
            }

            if (multiple) {
                onChange([...values, ...uploaded]);
            } else {
                onChange(uploaded[0]);
            }
        } catch (exception) {
            setError(
                exception.response?.data?.errors?.image?.[0] ||
                    exception.response?.data?.message ||
                    "آپلود تصویر انجام نشد.",
            );
        } finally {
            setUploading(false);

            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    };

    const removeImage = (path) => {
        if (multiple) {
            onChange(values.filter((item) => item !== path));
        } else {
            onChange("");
        }
    };

    return (
        <div className="builder-image-upload">
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple={multiple}
                hidden
                onChange={(event) => uploadFiles(event.target.files)}
            />

            <div
                className="builder-upload-dropzone"
                onClick={() => !uploading && inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (
                        (event.key === "Enter" || event.key === " ") &&
                        !uploading
                    ) {
                        inputRef.current?.click();
                    }
                }}
            >
                {uploading ? (
                    <LoaderCircle
                        className="builder-upload-spinner"
                        size={25}
                    />
                ) : (
                    <ImagePlus size={26} />
                )}

                <strong>
                    {uploading ? "در حال آپلود تصویر..." : "انتخاب تصویر"}
                </strong>

                <span>JPG، PNG یا WEBP - حداکثر ۵ مگابایت</span>

                {multiple && (
                    <small>
                        {values.length} از {maxFiles} تصویر انتخاب شده
                    </small>
                )}
            </div>

            {error && <div className="builder-upload-error">{error}</div>}

            {values.length > 0 && (
                <div className="builder-upload-previews">
                    {values.map((path, index) => (
                        <div
                            className="builder-upload-preview"
                            key={`${path}-${index}`}
                        >
                            <img
                                src={
                                    uploadedPreviews[path] || getImageUrl(path)
                                }
                                alt={`تصویر ${index + 1}`}
                            />

                            <button
                                type="button"
                                onClick={() => removeImage(path)}
                                title="حذف تصویر"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {values.length > 0 && !multiple && (
                <button
                    type="button"
                    className="builder-upload-change"
                    onClick={() => inputRef.current?.click()}
                >
                    <Upload size={15} />
                    تغییر تصویر
                </button>
            )}
        </div>
    );
}
