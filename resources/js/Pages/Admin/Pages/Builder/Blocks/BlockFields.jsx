import { Plus, Trash2 } from "lucide-react";

function Field({ label, value, onChange, error, textarea = false, ...props }) {
    return (
        <div className="builder-field">
            <label>{label}</label>

            {textarea ? (
                <textarea
                    value={value ?? ""}
                    onChange={(event) => onChange(event.target.value)}
                    rows={4}
                    {...props}
                />
            ) : (
                <input
                    type="text"
                    value={value ?? ""}
                    onChange={(event) => onChange(event.target.value)}
                    {...props}
                />
            )}

            {error && <small className="builder-field-error">{error}</small>}
        </div>
    );
}

function SelectField({ label, value, options, onChange }) {
    return (
        <div className="builder-field">
            <label>{label}</label>

            <select
                value={value ?? ""}
                onChange={(event) => onChange(event.target.value)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function ToggleField({ label, checked, onChange }) {
    return (
        <label className="builder-toggle-field">
            <span>{label}</span>
            <input
                type="checkbox"
                checked={Boolean(checked)}
                onChange={(event) => onChange(event.target.checked)}
            />
        </label>
    );
}

function ItemEditor({ title, items = [], fields, onChange, createItem }) {
    const updateItem = (index, key, value) => {
        onChange(
            items.map((item, i) =>
                i === index ? { ...item, [key]: value } : item,
            ),
        );
    };

    const removeItem = (index) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="builder-items-editor">
            <div className="builder-items-heading">
                <strong>تصاویر گالری</strong>
                <button
                    type="button"
                    onClick={() =>
                        setContent("images", [...(content.images ?? []), ""])
                    }
                >
                    <Plus size={16} />
                    افزودن تصویر
                </button>
            </div>

            {(content.images ?? []).map((image, imageIndex) => (
                <div className="builder-repeater-item" key={imageIndex}>
                    <Field
                        label={`تصویر ${imageIndex + 1}`}
                        value={image}
                        onChange={(value) =>
                            setContent(
                                "images",
                                content.images.map((item, i) =>
                                    i === imageIndex ? value : item,
                                ),
                            )
                        }
                    />

                    <button
                        type="button"
                        className="builder-remove-item"
                        onClick={() =>
                            setContent(
                                "images",
                                content.images.filter(
                                    (_, i) => i !== imageIndex,
                                ),
                            )
                        }
                    >
                        <Trash2 size={15} />
                        حذف تصویر
                    </button>
                </div>
            ))}
        </div>
    );
}

export default function BlockFields({
    type,
    content,
    settings,
    index,
    errors,
    onContentChange,
    onSettingsChange,
}) {
    const setContent = (field, value) => onContentChange(index, field, value);

    const setSetting = (field, value) => onSettingsChange(index, field, value);

    const fieldError = (field) =>
        errors[`sections.${index}.content.${field}`] ??
        errors[`sections.${index}.content`] ??
        null;

    const commonAlignment = [
        { value: "right", label: "راست" },
        { value: "center", label: "وسط" },
        { value: "left", label: "چپ" },
    ];

    switch (type) {
        case "hero":
            return (
                <>
                    <Field
                        label="عنوان اصلی"
                        value={content.title}
                        onChange={(v) => setContent("title", v)}
                        error={fieldError("title")}
                    />

                    <Field
                        label="توضیحات"
                        value={content.subtitle}
                        onChange={(v) => setContent("subtitle", v)}
                        textarea
                        error={fieldError("subtitle")}
                    />

                    <Field
                        label="متن دکمه"
                        value={content.button_text}
                        onChange={(v) => setContent("button_text", v)}
                    />

                    <Field
                        label="لینک دکمه"
                        value={content.button_url}
                        onChange={(v) => setContent("button_url", v)}
                        dir="ltr"
                    />

                    <Field
                        label="مسیر تصویر"
                        value={content.image}
                        onChange={(v) => setContent("image", v)}
                        error={fieldError("image")}
                    />

                    <SelectField
                        label="چیدمان نوشته"
                        value={settings.alignment}
                        options={commonAlignment}
                        onChange={(v) => setSetting("alignment", v)}
                    />

                    <SelectField
                        label="ارتفاع بنر"
                        value={settings.height}
                        options={[
                            { value: "small", label: "کوچک" },
                            { value: "medium", label: "متوسط" },
                            { value: "large", label: "بزرگ" },
                        ]}
                        onChange={(v) => setSetting("height", v)}
                    />
                </>
            );

        case "text":
            return (
                <>
                    <Field
                        label="عنوان"
                        value={content.title}
                        onChange={(v) => setContent("title", v)}
                    />

                    <Field
                        label="متن"
                        value={content.body}
                        onChange={(v) => setContent("body", v)}
                        textarea
                        error={fieldError("body")}
                    />

                    <SelectField
                        label="تراز متن"
                        value={settings.alignment}
                        options={commonAlignment}
                        onChange={(v) => setSetting("alignment", v)}
                    />

                    <SelectField
                        label="عرض محتوا"
                        value={settings.width}
                        options={[
                            { value: "narrow", label: "باریک" },
                            { value: "normal", label: "معمولی" },
                            { value: "wide", label: "عریض" },
                            { value: "full", label: "تمام عرض" },
                        ]}
                        onChange={(v) => setSetting("width", v)}
                    />
                </>
            );

        case "image_text":
            return (
                <>
                    <Field
                        label="عنوان"
                        value={content.title}
                        onChange={(v) => setContent("title", v)}
                        error={fieldError("title")}
                    />

                    <Field
                        label="توضیحات"
                        value={content.body}
                        onChange={(v) => setContent("body", v)}
                        textarea
                        error={fieldError("body")}
                    />

                    <Field
                        label="مسیر تصویر"
                        value={content.image}
                        onChange={(v) => setContent("image", v)}
                        error={fieldError("image")}
                    />

                    <Field
                        label="توضیح تصویر"
                        value={content.image_alt}
                        onChange={(v) => setContent("image_alt", v)}
                    />

                    <SelectField
                        label="موقعیت تصویر"
                        value={settings.image_position}
                        options={[
                            { value: "right", label: "سمت راست" },
                            { value: "left", label: "سمت چپ" },
                        ]}
                        onChange={(v) => setSetting("image_position", v)}
                    />
                </>
            );

        case "gallery":
            return (
                <>
                    <Field
                        label="عنوان گالری"
                        value={content.title}
                        onChange={(v) => setContent("title", v)}
                    />

                    <ItemEditor
                        title="تصاویر گالری"
                        items={content.images ?? []}
                        createItem=""
                        fields={[{ key: "image", label: "مسیر تصویر" }]}
                        onChange={(items) => setContent("images", items)}
                    />

                    <SelectField
                        label="تعداد ستون‌ها"
                        value={String(settings.columns)}
                        options={[
                            { value: "2", label: "دو ستون" },
                            { value: "3", label: "سه ستون" },
                            { value: "4", label: "چهار ستون" },
                        ]}
                        onChange={(v) => setSetting("columns", Number(v))}
                    />

                    <SelectField
                        label="نسبت تصویر"
                        value={settings.aspect_ratio}
                        options={[
                            { value: "square", label: "مربعی" },
                            { value: "landscape", label: "افقی" },
                            { value: "portrait", label: "عمودی" },
                        ]}
                        onChange={(v) => setSetting("aspect_ratio", v)}
                    />
                </>
            );

        case "features":
            return (
                <>
                    <Field
                        label="عنوان بخش"
                        value={content.title}
                        onChange={(v) => setContent("title", v)}
                    />

                    <ItemEditor
                        title="ویژگی‌ها"
                        items={content.items ?? []}
                        createItem={{
                            title: "",
                            description: "",
                            icon: "",
                        }}
                        fields={[
                            { key: "title", label: "عنوان ویژگی" },
                            {
                                key: "description",
                                label: "توضیحات",
                                textarea: true,
                            },
                            { key: "icon", label: "نام آیکون" },
                        ]}
                        onChange={(items) => setContent("items", items)}
                    />

                    <SelectField
                        label="تعداد ستون‌ها"
                        value={String(settings.columns)}
                        options={[
                            { value: "2", label: "دو ستون" },
                            { value: "3", label: "سه ستون" },
                            { value: "4", label: "چهار ستون" },
                        ]}
                        onChange={(v) => setSetting("columns", Number(v))}
                    />
                </>
            );

        case "team":
            return (
                <>
                    <Field
                        label="عنوان بخش"
                        value={content.title}
                        onChange={(v) => setContent("title", v)}
                    />

                    <ItemEditor
                        title="اعضای تیم"
                        items={content.items ?? []}
                        createItem={{
                            name: "",
                            role: "",
                            bio: "",
                            image: "",
                        }}
                        fields={[
                            { key: "name", label: "نام" },
                            { key: "role", label: "سمت یا تخصص" },
                            {
                                key: "bio",
                                label: "معرفی کوتاه",
                                textarea: true,
                            },
                            { key: "image", label: "مسیر تصویر" },
                        ]}
                        onChange={(items) => setContent("items", items)}
                    />

                    <SelectField
                        label="تعداد ستون‌ها"
                        value={String(settings.columns)}
                        options={[
                            { value: "2", label: "دو ستون" },
                            { value: "3", label: "سه ستون" },
                            { value: "4", label: "چهار ستون" },
                        ]}
                        onChange={(v) => setSetting("columns", Number(v))}
                    />
                </>
            );

        case "contact_info":
            return (
                <>
                    <Field
                        label="عنوان بخش"
                        value={content.title}
                        onChange={(v) => setContent("title", v)}
                    />

                    <Field
                        label="شماره تماس"
                        value={content.phone}
                        onChange={(v) => setContent("phone", v)}
                    />

                    <Field
                        label="ایمیل"
                        value={content.email}
                        onChange={(v) => setContent("email", v)}
                        dir="ltr"
                        error={fieldError("email")}
                    />

                    <Field
                        label="آدرس"
                        value={content.address}
                        onChange={(v) => setContent("address", v)}
                        textarea
                    />

                    <Field
                        label="ساعات کاری"
                        value={content.working_hours}
                        onChange={(v) => setContent("working_hours", v)}
                        textarea
                    />

                    <SelectField
                        label="نحوه نمایش"
                        value={settings.layout}
                        options={[
                            { value: "grid", label: "کاشی‌بندی" },
                            { value: "list", label: "فهرستی" },
                        ]}
                        onChange={(v) => setSetting("layout", v)}
                    />
                </>
            );

        case "map":
            return (
                <>
                    <Field
                        label="عنوان بخش"
                        value={content.title}
                        onChange={(v) => setContent("title", v)}
                    />

                    <Field
                        label="آدرس مجموعه"
                        value={content.address}
                        onChange={(v) => setContent("address", v)}
                        textarea
                    />

                    <Field
                        label="لینک نقشه"
                        value={content.map_url}
                        onChange={(v) => setContent("map_url", v)}
                        dir="ltr"
                        error={fieldError("map_url")}
                    />

                    <SelectField
                        label="ارتفاع نقشه"
                        value={settings.height}
                        options={[
                            { value: "small", label: "کوچک" },
                            { value: "medium", label: "متوسط" },
                            { value: "large", label: "بزرگ" },
                        ]}
                        onChange={(v) => setSetting("height", v)}
                    />
                </>
            );

        case "contact_form":
            return (
                <>
                    <Field
                        label="عنوان فرم"
                        value={content.title}
                        onChange={(v) => setContent("title", v)}
                    />

                    <Field
                        label="توضیحات فرم"
                        value={content.description}
                        onChange={(v) => setContent("description", v)}
                        textarea
                    />

                    <ToggleField
                        label="نمایش فیلد ایمیل"
                        checked={settings.show_email}
                        onChange={(v) => setSetting("show_email", v)}
                    />

                    <ToggleField
                        label="نمایش فیلد موضوع"
                        checked={settings.show_subject}
                        onChange={(v) => setSetting("show_subject", v)}
                    />
                </>
            );

        case "divider":
            return (
                <>
                    <SelectField
                        label="نوع جداکننده"
                        value={settings.style}
                        options={[
                            { value: "solid", label: "خط ممتد" },
                            { value: "dashed", label: "خط‌چین" },
                            { value: "dotted", label: "نقطه‌چین" },
                            { value: "space", label: "فقط فاصله" },
                        ]}
                        onChange={(v) => setSetting("style", v)}
                    />

                    <SelectField
                        label="میزان فاصله"
                        value={settings.spacing}
                        options={[
                            { value: "small", label: "کم" },
                            { value: "medium", label: "متوسط" },
                            { value: "large", label: "زیاد" },
                        ]}
                        onChange={(v) => setSetting("spacing", v)}
                    />
                </>
            );

        default:
            return <p>فرم ویرایش این بخش تعریف نشده است.</p>;
    }
}
