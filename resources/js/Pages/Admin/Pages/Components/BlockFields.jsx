import { useState } from "react";
import {
    AlignRight,
    AlignCenter,
    AlignLeft,
    Image as ImageIcon,
    Type,
    Palette,
    Ruler,
} from "lucide-react";

import "../Assets/css/BlockFields.css";

function Field({ label, help, error, children }) {
    return (
        <div className="block-field">
            <label className="block-field-label">{label}</label>
            {children}
            {help && <small className="block-field-help">{help}</small>}
            {error && <small className="block-field-error">{error}</small>}
        </div>
    );
}

function TextInput({ value, onChange, placeholder = "", dir = "rtl" }) {
    return (
        <input
            type="text"
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            dir={dir}
            className="block-field-input"
        />
    );
}

function TextArea({ value, onChange, placeholder = "", rows = 5 }) {
    return (
        <textarea
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="block-field-textarea"
        />
    );
}

function SelectField({ value, onChange, options }) {
    return (
        <select
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
            className="block-field-select"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}

function AlignmentField({ value, onChange }) {
    const options = [
        { value: "right", label: "راست", Icon: AlignRight },
        { value: "center", label: "وسط", Icon: AlignCenter },
        { value: "left", label: "چپ", Icon: AlignLeft },
    ];

    return (
        <div className="block-alignment-options">
            {options.map(({ value: itemValue, label, Icon }) => (
                <button
                    key={itemValue}
                    type="button"
                    className={value === itemValue ? "active" : ""}
                    onClick={() => onChange(itemValue)}
                    title={label}
                >
                    <Icon size={17} />
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
}

function ImagePathField({ value, onChange, alt = "" }) {
    const [previewError, setPreviewError] = useState(false);

    const imageUrl = value
        ? value.startsWith("http://") || value.startsWith("https://")
            ? value
            : value.startsWith("/")
              ? value
              : `/storage/${value.replace(/^storage\//, "")}`
        : "";

    return (
        <div className="block-image-field">
            <div className="block-image-preview">
                {imageUrl && !previewError ? (
                    <img
                        src={imageUrl}
                        alt={alt || "پیش‌نمایش تصویر بلوک"}
                        onError={() => setPreviewError(true)}
                    />
                ) : (
                    <div className="block-image-placeholder">
                        <ImageIcon size={27} />
                        <span>
                            {value ? "تصویر قابل نمایش نیست" : "بدون تصویر"}
                        </span>
                    </div>
                )}
            </div>

            <input
                type="text"
                value={value ?? ""}
                onChange={(event) => {
                    setPreviewError(false);
                    onChange(event.target.value);
                }}
                placeholder="مسیر تصویر، مانند pages/example.webp"
                dir="ltr"
                className="block-field-input"
            />

            <small className="block-field-help">
                فعلاً مسیر تصویر را وارد کنید. آپلود مستقیم تصویر را در مرحله
                بعد به این فیلد متصل می‌کنیم.
            </small>
        </div>
    );
}

function HeroFields({ content, settings, onContentChange, onSettingsChange }) {
    return (
        <>
            <div className="block-fields-grid">
                <Field label="عنوان اصلی">
                    <TextInput
                        value={content.title}
                        onChange={(value) => onContentChange("title", value)}
                        placeholder="به سالن زیبایی ما خوش آمدید"
                    />
                </Field>

                <Field label="متن دکمه">
                    <TextInput
                        value={content.button_text}
                        onChange={(value) =>
                            onContentChange("button_text", value)
                        }
                        placeholder="رزرو نوبت"
                    />
                </Field>

                <Field label="زیرعنوان">
                    <TextArea
                        value={content.subtitle}
                        onChange={(value) => onContentChange("subtitle", value)}
                        placeholder="توضیح کوتاهی درباره خدمات سالن..."
                        rows={3}
                    />
                </Field>

                <Field label="لینک دکمه">
                    <TextInput
                        value={content.button_url}
                        onChange={(value) =>
                            onContentChange("button_url", value)
                        }
                        placeholder="/barbers"
                        dir="ltr"
                    />
                </Field>

                <Field label="تصویر پس‌زمینه">
                    <ImagePathField
                        value={content.image}
                        onChange={(value) => onContentChange("image", value)}
                    />
                </Field>
            </div>

            <div className="block-fields-divider" />

            <div className="block-fields-settings-title">
                <Palette size={16} />
                تنظیمات ظاهری بنر
            </div>

            <div className="block-fields-grid">
                <Field label="چینش محتوا">
                    <AlignmentField
                        value={settings.alignment}
                        onChange={(value) =>
                            onSettingsChange("alignment", value)
                        }
                    />
                </Field>

                <Field label="رنگ پس‌زمینه">
                    <SelectField
                        value={settings.background}
                        onChange={(value) =>
                            onSettingsChange("background", value)
                        }
                        options={[
                            { value: "primary", label: "رنگ اصلی سایت" },
                            { value: "secondary", label: "رنگ ثانویه" },
                            { value: "light", label: "روشن" },
                            { value: "dark", label: "تیره" },
                            { value: "white", label: "سفید" },
                            { value: "transparent", label: "شفاف" },
                        ]}
                    />
                </Field>

                <Field label="ارتفاع بنر">
                    <SelectField
                        value={settings.height}
                        onChange={(value) => onSettingsChange("height", value)}
                        options={[
                            { value: "small", label: "کوچک" },
                            { value: "medium", label: "متوسط" },
                            { value: "large", label: "بزرگ" },
                        ]}
                    />
                </Field>
            </div>
        </>
    );
}

function TextFields({ content, settings, onContentChange, onSettingsChange }) {
    return (
        <>
            <div className="block-fields-grid">
                <Field label="عنوان بخش">
                    <TextInput
                        value={content.title}
                        onChange={(value) => onContentChange("title", value)}
                        placeholder="عنوان این بخش"
                    />
                </Field>

                <Field label="متن توضیحات">
                    <TextArea
                        value={content.body}
                        onChange={(value) => onContentChange("body", value)}
                        placeholder="متن موردنظر خود را وارد کنید..."
                        rows={8}
                    />
                </Field>
            </div>

            <div className="block-fields-divider" />

            <div className="block-fields-settings-title">
                <Type size={16} />
                تنظیمات نمایش متن
            </div>

            <div className="block-fields-grid">
                <Field label="چینش متن">
                    <AlignmentField
                        value={settings.alignment}
                        onChange={(value) =>
                            onSettingsChange("alignment", value)
                        }
                    />
                </Field>

                <Field label="عرض محتوای متن">
                    <SelectField
                        value={settings.width}
                        onChange={(value) => onSettingsChange("width", value)}
                        options={[
                            { value: "narrow", label: "باریک" },
                            { value: "normal", label: "معمولی" },
                            { value: "wide", label: "عریض" },
                        ]}
                    />
                </Field>
            </div>
        </>
    );
}

function ImageTextFields({
    content,
    settings,
    onContentChange,
    onSettingsChange,
}) {
    return (
        <>
            <div className="block-fields-grid">
                <Field label="عنوان">
                    <TextInput
                        value={content.title}
                        onChange={(value) => onContentChange("title", value)}
                        placeholder="عنوان بخش"
                    />
                </Field>

                <Field label="متن جایگزین تصویر (Alt)">
                    <TextInput
                        value={content.image_alt}
                        onChange={(value) =>
                            onContentChange("image_alt", value)
                        }
                        placeholder="توضیح تصویر برای دسترس‌پذیری"
                    />
                </Field>

                <Field label="توضیحات">
                    <TextArea
                        value={content.body}
                        onChange={(value) => onContentChange("body", value)}
                        placeholder="متن توضیحات این بخش..."
                        rows={6}
                    />
                </Field>

                <Field label="تصویر">
                    <ImagePathField
                        value={content.image}
                        alt={content.image_alt}
                        onChange={(value) => onContentChange("image", value)}
                    />
                </Field>
            </div>

            <div className="block-fields-divider" />

            <div className="block-fields-settings-title">
                <Ruler size={16} />
                تنظیمات نمایش
            </div>

            <div className="block-fields-grid">
                <Field label="موقعیت تصویر">
                    <SelectField
                        value={settings.image_position}
                        onChange={(value) =>
                            onSettingsChange("image_position", value)
                        }
                        options={[
                            { value: "right", label: "سمت راست" },
                            { value: "left", label: "سمت چپ" },
                        ]}
                    />
                </Field>

                <Field label="چینش متن">
                    <AlignmentField
                        value={settings.alignment}
                        onChange={(value) =>
                            onSettingsChange("alignment", value)
                        }
                    />
                </Field>
            </div>
        </>
    );
}

export default function BlockFields({
    type,
    content = {},
    settings = {},
    onContentChange,
    onSettingsChange,
}) {
    if (type === "hero") {
        return (
            <HeroFields
                content={content}
                settings={settings}
                onContentChange={onContentChange}
                onSettingsChange={onSettingsChange}
            />
        );
    }

    if (type === "text") {
        return (
            <TextFields
                content={content}
                settings={settings}
                onContentChange={onContentChange}
                onSettingsChange={onSettingsChange}
            />
        );
    }

    if (type === "image_text") {
        return (
            <ImageTextFields
                content={content}
                settings={settings}
                onContentChange={onContentChange}
                onSettingsChange={onSettingsChange}
            />
        );
    }

    return null;
}
