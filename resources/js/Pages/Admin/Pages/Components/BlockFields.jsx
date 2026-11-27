import {
    AlignRight,
    AlignCenter,
    AlignLeft,
    Palette,
    Ruler,
    Type,
} from "lucide-react";

import ImageUpload from "../Components/ImageUpload";
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

function HeroFields({
    pageId,
    content,
    settings,
    onContentChange,
    onSettingsChange,
}) {
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
                    <ImageUpload
                        pageId={pageId}
                        value={content.image}
                        onChange={(value) => onContentChange("image", value)}
                        alt={content.title || "تصویر پس‌زمینه بنر"}
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
    pageId,
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
                    <ImageUpload
                        pageId={pageId}
                        value={content.image}
                        onChange={(value) => onContentChange("image", value)}
                        alt={content.image_alt || content.title || "تصویر بخش"}
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

function GalleryFields({ pageId, content, onContentChange }) {
    const images = Array.isArray(content.images) ? content.images : [];

    const removeImage = (index) => {
        onContentChange(
            "images",
            images.filter((_, i) => i !== index),
        );
    };

    const updateImage = (index, path) => {
        const updated = [...images];
        updated[index] = path;
        onContentChange("images", updated);
    };

    return (
        <>
            <div className="block-fields-grid">
                <Field label="عنوان گالری">
                    <TextInput
                        value={content.title}
                        onChange={(value) => onContentChange("title", value)}
                        placeholder="گالری تصاویر ما"
                    />
                </Field>
            </div>

            <Field
                label="تصاویر گالری"
                help="تصاویر را از کامپیوتر انتخاب و آپلود کنید."
            >
                <div className="builder-gallery-upload-list">
                    {images.map((image, index) => (
                        <div
                            className="builder-gallery-upload-item"
                            key={`${image}-${index}`}
                        >
                            <ImageUpload
                                pageId={pageId}
                                value={image}
                                onChange={(path) => {
                                    if (!path) {
                                        removeImage(index);
                                    } else {
                                        updateImage(index, path);
                                    }
                                }}
                                alt={`تصویر گالری ${index + 1}`}
                            />
                        </div>
                    ))}

                    <div className="builder-gallery-add">
                        <ImageUpload
                            key={`gallery-add-${images.length}`}
                            pageId={pageId}
                            value=""
                            onChange={(path) => {
                                if (path) {
                                    onContentChange("images", [
                                        ...images,
                                        path,
                                    ]);
                                }
                            }}
                            alt="تصویر جدید گالری"
                        />
                    </div>
                </div>
            </Field>
        </>
    );
}

function FeaturesFields({ content, onContentChange }) {
    const items = Array.isArray(content.items) ? content.items : [];

    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };
        onContentChange("items", updated);
    };

    const addItem = () => {
        onContentChange("items", [
            ...items,
            { title: "", description: "", icon: "" },
        ]);
    };

    const removeItem = (index) => {
        onContentChange(
            "items",
            items.filter((_, i) => i !== index),
        );
    };

    return (
        <>
            <Field label="عنوان بخش ویژگی‌ها">
                <TextInput
                    value={content.title}
                    onChange={(value) => onContentChange("title", value)}
                    placeholder="چرا ما را انتخاب کنید؟"
                />
            </Field>

            <div className="builder-repeatable-list">
                {items.map((item, index) => (
                    <div className="builder-repeatable-item" key={index}>
                        <div className="builder-repeatable-header">
                            <strong>ویژگی شماره {index + 1}</strong>
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                            >
                                حذف
                            </button>
                        </div>

                        <Field label="عنوان ویژگی">
                            <TextInput
                                value={item.title}
                                onChange={(value) =>
                                    updateItem(index, "title", value)
                                }
                                placeholder="مثلاً کیفیت بالای خدمات"
                            />
                        </Field>

                        <Field label="توضیحات">
                            <TextArea
                                value={item.description}
                                onChange={(value) =>
                                    updateItem(index, "description", value)
                                }
                                placeholder="توضیح کوتاهی درباره این ویژگی..."
                                rows={3}
                            />
                        </Field>

                        <Field
                            label="نام آیکون"
                            help="نام آیکون مورد استفاده در طراحی سایت"
                        >
                            <TextInput
                                value={item.icon}
                                onChange={(value) =>
                                    updateItem(index, "icon", value)
                                }
                                placeholder="مثلاً scissors"
                                dir="ltr"
                            />
                        </Field>
                    </div>
                ))}
            </div>

            <button
                type="button"
                className="builder-add-item-button"
                onClick={addItem}
                disabled={items.length >= 12}
            >
                + افزودن ویژگی
            </button>
        </>
    );
}

function TeamFields({ pageId, content, onContentChange }) {
    const items = Array.isArray(content.items) ? content.items : [];

    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };
        onContentChange("items", updated);
    };

    const addItem = () => {
        onContentChange("items", [
            ...items,
            { name: "", role: "", bio: "", image: "" },
        ]);
    };

    const removeItem = (index) => {
        onContentChange(
            "items",
            items.filter((_, i) => i !== index),
        );
    };

    return (
        <>
            <Field label="عنوان بخش تیم">
                <TextInput
                    value={content.title}
                    onChange={(value) => onContentChange("title", value)}
                    placeholder="با تیم حرفه‌ای ما آشنا شوید"
                />
            </Field>

            <div className="builder-repeatable-list">
                {items.map((item, index) => (
                    <div className="builder-repeatable-item" key={index}>
                        <div className="builder-repeatable-header">
                            <strong>عضو تیم {index + 1}</strong>
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                            >
                                حذف
                            </button>
                        </div>

                        <Field label="نام و نام خانوادگی">
                            <TextInput
                                value={item.name}
                                onChange={(value) =>
                                    updateItem(index, "name", value)
                                }
                                placeholder="نام آرایشگر"
                            />
                        </Field>

                        <Field label="سمت یا تخصص">
                            <TextInput
                                value={item.role}
                                onChange={(value) =>
                                    updateItem(index, "role", value)
                                }
                                placeholder="مثلاً آرایشگر حرفه‌ای"
                            />
                        </Field>

                        <Field label="معرفی کوتاه">
                            <TextArea
                                value={item.bio}
                                onChange={(value) =>
                                    updateItem(index, "bio", value)
                                }
                                placeholder="توضیح کوتاهی درباره عضو تیم..."
                                rows={3}
                            />
                        </Field>

                        <Field label="تصویر عضو تیم">
                            <ImageUpload
                                pageId={pageId}
                                value={item.image}
                                onChange={(value) =>
                                    updateItem(index, "image", value)
                                }
                                alt={item.name || "تصویر عضو تیم"}
                            />
                        </Field>
                    </div>
                ))}
            </div>

            <button
                type="button"
                className="builder-add-item-button"
                onClick={addItem}
                disabled={items.length >= 20}
            >
                + افزودن عضو تیم
            </button>
        </>
    );
}

function ContactInfoFields({ content, onContentChange }) {
    return (
        <div className="block-fields-grid">
            <Field label="عنوان بخش">
                <TextInput
                    value={content.title}
                    onChange={(value) => onContentChange("title", value)}
                    placeholder="راه‌های ارتباط با ما"
                />
            </Field>

            <Field label="شماره تماس">
                <TextInput
                    value={content.phone}
                    onChange={(value) => onContentChange("phone", value)}
                    placeholder="02112345678"
                    dir="ltr"
                />
            </Field>

            <Field label="ایمیل">
                <TextInput
                    value={content.email}
                    onChange={(value) => onContentChange("email", value)}
                    placeholder="info@example.com"
                    dir="ltr"
                />
            </Field>

            <Field label="آدرس">
                <TextArea
                    value={content.address}
                    onChange={(value) => onContentChange("address", value)}
                    placeholder="آدرس مجموعه..."
                    rows={3}
                />
            </Field>

            <Field label="ساعات کاری">
                <TextArea
                    value={content.working_hours}
                    onChange={(value) =>
                        onContentChange("working_hours", value)
                    }
                    placeholder="شنبه تا چهارشنبه: ۹ تا ۲۰"
                    rows={3}
                />
            </Field>
        </div>
    );
}

function MapFields({ content, onContentChange, settings, onSettingsChange }) {
    return (
        <>
            <div className="block-fields-grid">
                <Field label="عنوان نقشه">
                    <TextInput
                        value={content.title}
                        onChange={(value) => onContentChange("title", value)}
                        placeholder="موقعیت مکانی ما"
                    />
                </Field>

                <Field label="آدرس مجموعه">
                    <TextArea
                        value={content.address}
                        onChange={(value) => onContentChange("address", value)}
                        placeholder="آدرس کامل مجموعه..."
                        rows={3}
                    />
                </Field>

                <Field label="لینک نقشه" help="لینک معتبر نقشه را وارد کنید.">
                    <TextInput
                        value={content.map_url}
                        onChange={(value) => onContentChange("map_url", value)}
                        placeholder="https://maps.google.com/..."
                        dir="ltr"
                    />
                </Field>
            </div>

            <Field label="ارتفاع نقشه">
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
        </>
    );
}

function ContactFormFields({
    content,
    settings,
    onContentChange,
    onSettingsChange,
}) {
    return (
        <>
            <div className="block-fields-grid">
                <Field label="عنوان فرم تماس">
                    <TextInput
                        value={content.title}
                        onChange={(value) => onContentChange("title", value)}
                        placeholder="با ما در ارتباط باشید"
                    />
                </Field>

                <Field label="توضیحات">
                    <TextArea
                        value={content.description}
                        onChange={(value) =>
                            onContentChange("description", value)
                        }
                        placeholder="پیام خود را برای ما ارسال کنید..."
                        rows={4}
                    />
                </Field>
            </div>

            <div className="block-fields-divider" />

            <div className="block-fields-settings-title">تنظیمات فرم تماس</div>

            <label className="builder-checkbox-field">
                <input
                    type="checkbox"
                    checked={Boolean(settings.show_email)}
                    onChange={(event) =>
                        onSettingsChange("show_email", event.target.checked)
                    }
                />
                <span>نمایش فیلد ایمیل</span>
            </label>

            <label className="builder-checkbox-field">
                <input
                    type="checkbox"
                    checked={Boolean(settings.show_subject)}
                    onChange={(event) =>
                        onSettingsChange("show_subject", event.target.checked)
                    }
                />
                <span>نمایش فیلد موضوع</span>
            </label>
        </>
    );
}

function DividerFields({ settings, onSettingsChange }) {
    return (
        <>
            <div className="block-fields-settings-title">تنظیمات جداکننده</div>

            <div className="block-fields-grid">
                <Field label="نوع خط">
                    <SelectField
                        value={settings.style}
                        onChange={(value) => onSettingsChange("style", value)}
                        options={[
                            { value: "solid", label: "خط ممتد" },
                            { value: "dashed", label: "خط‌چین" },
                            { value: "dotted", label: "نقطه‌چین" },
                            { value: "space", label: "فاصله بدون خط" },
                        ]}
                    />
                </Field>

                <Field label="فاصله عمودی">
                    <SelectField
                        value={settings.spacing}
                        onChange={(value) => onSettingsChange("spacing", value)}
                        options={[
                            { value: "small", label: "کم" },
                            { value: "medium", label: "متوسط" },
                            { value: "large", label: "زیاد" },
                        ]}
                    />
                </Field>
            </div>
        </>
    );
}

export default function BlockFields({
    pageId,
    type,
    content = {},
    settings = {},
    onContentChange,
    onSettingsChange,
}) {
    const commonProps = {
        content,
        settings,
        onContentChange,
        onSettingsChange,
    };

    switch (type) {
        case "hero":
            return <HeroFields pageId={pageId} {...commonProps} />;

        case "text":
            return <TextFields {...commonProps} />;

        case "image_text":
            return <ImageTextFields pageId={pageId} {...commonProps} />;

        case "gallery":
            return (
                <GalleryFields
                    pageId={pageId}
                    content={content}
                    onContentChange={onContentChange}
                />
            );

        case "features":
            return (
                <FeaturesFields
                    content={content}
                    onContentChange={onContentChange}
                />
            );

        case "team":
            return (
                <TeamFields
                    pageId={pageId}
                    content={content}
                    onContentChange={onContentChange}
                />
            );

        case "contact_info":
            return (
                <ContactInfoFields
                    content={content}
                    onContentChange={onContentChange}
                />
            );

        case "map":
            return <MapFields {...commonProps} />;

        case "contact_form":
            return <ContactFormFields {...commonProps} />;

        case "divider":
            return <DividerFields {...commonProps} />;

        default:
            return (
                <div className="builder-editor-empty">
                    <p>فرم ویرایش این نوع بلوک هنوز تعریف نشده است.</p>
                    <small>نوع بلوک: {type}</small>
                </div>
            );
    }
}
