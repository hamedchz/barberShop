import { useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import {
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    Save,
    Code2,
    Eye,
    EyeOff,
    AlertCircle,
    Layers,
    RotateCcw,
} from "lucide-react";

import "../Assets/css/SectionsEditor.css";
import BlockFields from "./BlockFields";

const clone = (value) => JSON.parse(JSON.stringify(value ?? {}));

const parseJson = (value, fallback = {}) => {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

export default function SectionsEditor({
    page,
    sections: initialSections = [],
    sectionTypes = {},
}) {
    const [sections, setSections] = useState(() =>
        (initialSections ?? []).map((section) => ({
            ...section,
            content: clone(section.content),
            settings: clone(section.settings),
            is_active: Boolean(section.is_active),
        })),
    );

    const [jsonDrafts, setJsonDrafts] = useState({});
    const [jsonErrors, setJsonErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [saveError, setSaveError] = useState("");

    const availableTypes = useMemo(
        () => Object.entries(sectionTypes ?? {}),
        [sectionTypes],
    );

    const updateSection = (index, changes) => {
        setSections((current) =>
            current.map((section, i) =>
                i === index ? { ...section, ...changes } : section,
            ),
        );
    };

    const addSection = (type) => {
        const definition = sectionTypes[type];

        if (!definition) return;

        setSections((current) => [
            ...current,
            {
                id: null,
                type,
                content: clone(definition.content),
                settings: clone(definition.settings),
                is_active: true,
            },
        ]);
    };

    const removeSection = (index) => {
        if (!window.confirm("این بلوک حذف شود؟")) return;

        setSections((current) => current.filter((_, i) => i !== index));

        setJsonDrafts((current) => {
            const next = { ...current };
            delete next[index];
            return next;
        });

        setJsonErrors({});
    };

    const moveSection = (index, direction) => {
        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= sections.length) return;

        setSections((current) => {
            const next = [...current];
            [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
            return next;
        });

        setJsonDrafts({});
        setJsonErrors({});
    };

    const updateJsonDraft = (index, field, value) => {
        setJsonDrafts((current) => ({
            ...current,
            [`${index}.${field}`]: value,
        }));

        setJsonErrors((current) => ({
            ...current,
            [`${index}.${field}`]: "",
        }));
    };

    const commitJson = (index, field) => {
        const key = `${index}.${field}`;
        const draft = jsonDrafts[key];

        if (draft === undefined) return true;

        try {
            const parsed = JSON.parse(draft);

            if (
                parsed === null ||
                typeof parsed !== "object" ||
                Array.isArray(parsed)
            ) {
                throw new Error("مقدار باید یک آبجکت JSON باشد.");
            }

            updateSection(index, { [field]: parsed });

            setJsonDrafts((current) => {
                const next = { ...current };
                delete next[key];
                return next;
            });

            setJsonErrors((current) => ({
                ...current,
                [key]: "",
            }));

            return true;
        } catch (error) {
            setJsonErrors((current) => ({
                ...current,
                [key]: error.message || "ساختار JSON معتبر نیست.",
            }));

            return false;
        }
    };

    const getJsonValue = (index, field, value) => {
        const key = `${index}.${field}`;

        return jsonDrafts[key] !== undefined
            ? jsonDrafts[key]
            : JSON.stringify(value ?? {}, null, 2);
    };

    const submit = () => {
        setSaveError("");

        const nextSections = [...sections];
        const errors = {};
        const normalizedDrafts = {};

        Object.entries(jsonDrafts).forEach(([key, value]) => {
            const [indexString, field] = key.split(".");
            const index = Number(indexString);

            try {
                const parsed = JSON.parse(value);

                if (
                    parsed === null ||
                    typeof parsed !== "object" ||
                    Array.isArray(parsed)
                ) {
                    throw new Error("مقدار باید یک آبجکت JSON باشد.");
                }

                if (!nextSections[index]) return;

                nextSections[index] = {
                    ...nextSections[index],
                    [field]: parsed,
                };
            } catch (error) {
                errors[key] = error.message || "ساختار JSON معتبر نیست.";
            }
        });

        if (Object.keys(errors).length > 0) {
            setJsonErrors(errors);
            setSaveError("ابتدا خطاهای JSON را اصلاح کنید.");
            return;
        }

        setProcessing(true);

        router.put(
            route("admin.pages.sections.update", page.id),
            {
                sections: nextSections.map((section) => ({
                    ...(section.id ? { id: section.id } : {}),
                    type: section.type,
                    content: section.content,
                    settings: section.settings,
                    is_active: Boolean(section.is_active),
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({
                        only: ["page"],
                        preserveState: false,
                    });
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    setSaveError(
                        typeof firstError === "string"
                            ? firstError
                            : "ذخیره بلوک‌ها با خطا مواجه شد.",
                    );
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const updateContentField = (index, field, value) => {
        setSections((current) =>
            current.map((section, i) =>
                i === index
                    ? {
                          ...section,
                          content: {
                              ...(section.content ?? {}),
                              [field]: value,
                          },
                      }
                    : section,
            ),
        );
    };

    const updateSettingsField = (index, field, value) => {
        setSections((current) =>
            current.map((section, i) =>
                i === index
                    ? {
                          ...section,
                          settings: {
                              ...(section.settings ?? {}),
                              [field]: value,
                          },
                      }
                    : section,
            ),
        );
    };

    return (
        <section className="sections-editor">
            <div className="sections-editor-header">
                <div className="sections-editor-heading">
                    <div className="sections-editor-icon">
                        <Layers size={20} />
                    </div>

                    <div>
                        <h2>بلوک‌های صفحه</h2>
                        <p>
                            محتوای صفحه را با افزودن و مرتب‌سازی بلوک‌ها طراحی
                            کنید.
                        </p>
                    </div>
                </div>

                <span className="sections-editor-count">
                    {sections.length.toLocaleString("fa-IR")} بلوک
                </span>
            </div>

            <div className="sections-editor-body">
                {/* افزودن بلوک */}
                <div className="sections-add-box">
                    <div className="sections-add-title">
                        <Plus size={17} />
                        افزودن بلوک جدید
                    </div>

                    <div className="sections-add-grid">
                        {availableTypes.map(([type, definition]) => (
                            <button
                                key={type}
                                type="button"
                                className="sections-add-item"
                                onClick={() => addSection(type)}
                            >
                                <Plus size={15} />
                                <span>{definition.label || type}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* فهرست بلوک‌ها */}
                <div className="sections-list">
                    {sections.length === 0 ? (
                        <div className="sections-empty">
                            <Layers size={35} />
                            <strong>هنوز بلوکی اضافه نشده است</strong>
                            <p>
                                برای شروع، یکی از بلوک‌های بالا را انتخاب کنید.
                            </p>
                        </div>
                    ) : (
                        sections.map((section, index) => {
                            const definition = sectionTypes[section.type] ?? {};
                            const contentError = jsonErrors[`${index}.content`];
                            const settingsError =
                                jsonErrors[`${index}.settings`];

                            return (
                                <article
                                    className={`section-item ${
                                        section.is_active ? "" : "is-disabled"
                                    }`}
                                    key={section.id ?? `new-${index}`}
                                >
                                    <div className="section-item-header">
                                        <div className="section-item-title">
                                            <span className="section-item-number">
                                                {(index + 1).toLocaleString(
                                                    "fa-IR",
                                                )}
                                            </span>

                                            <div>
                                                <h3>
                                                    {definition.label ||
                                                        section.type}
                                                </h3>
                                                <small>
                                                    {definition.description ||
                                                        section.type}
                                                </small>
                                            </div>
                                        </div>

                                        <div className="section-item-actions">
                                            <button
                                                type="button"
                                                title="انتقال به بالا"
                                                disabled={index === 0}
                                                onClick={() =>
                                                    moveSection(index, -1)
                                                }
                                            >
                                                <ChevronUp size={17} />
                                            </button>

                                            <button
                                                type="button"
                                                title="انتقال به پایین"
                                                disabled={
                                                    index ===
                                                    sections.length - 1
                                                }
                                                onClick={() =>
                                                    moveSection(index, 1)
                                                }
                                            >
                                                <ChevronDown size={17} />
                                            </button>

                                            <button
                                                type="button"
                                                title={
                                                    section.is_active
                                                        ? "غیرفعال کردن"
                                                        : "فعال کردن"
                                                }
                                                onClick={() =>
                                                    updateSection(index, {
                                                        is_active:
                                                            !section.is_active,
                                                    })
                                                }
                                            >
                                                {section.is_active ? (
                                                    <Eye size={17} />
                                                ) : (
                                                    <EyeOff size={17} />
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                title="حذف بلوک"
                                                className="section-delete-button"
                                                onClick={() =>
                                                    removeSection(index)
                                                }
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="section-item-body">
                                        {[
                                            "hero",
                                            "text",
                                            "image_text",
                                        ].includes(section.type) ? (
                                            <div className="section-visual-fields">
                                                <BlockFields
                                                    type={section.type}
                                                    content={section.content}
                                                    settings={section.settings}
                                                    onContentChange={(
                                                        field,
                                                        value,
                                                    ) =>
                                                        updateContentField(
                                                            index,
                                                            field,
                                                            value,
                                                        )
                                                    }
                                                    onSettingsChange={(
                                                        field,
                                                        value,
                                                    ) =>
                                                        updateSettingsField(
                                                            index,
                                                            field,
                                                            value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="section-json-field">
                                                    <label>
                                                        <Code2 size={15} />
                                                        محتوای بلوک (Content)
                                                    </label>

                                                    <textarea
                                                        dir="ltr"
                                                        spellCheck="false"
                                                        value={getJsonValue(
                                                            index,
                                                            "content",
                                                            section.content,
                                                        )}
                                                        onChange={(event) =>
                                                            updateJsonDraft(
                                                                index,
                                                                "content",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        onBlur={() =>
                                                            commitJson(
                                                                index,
                                                                "content",
                                                            )
                                                        }
                                                    />

                                                    {contentError && (
                                                        <div className="section-json-error">
                                                            <AlertCircle
                                                                size={14}
                                                            />
                                                            {contentError}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="section-json-field">
                                                    <label>
                                                        <Code2 size={15} />
                                                        تنظیمات بلوک (Settings)
                                                    </label>

                                                    <textarea
                                                        dir="ltr"
                                                        spellCheck="false"
                                                        value={getJsonValue(
                                                            index,
                                                            "settings",
                                                            section.settings,
                                                        )}
                                                        onChange={(event) =>
                                                            updateJsonDraft(
                                                                index,
                                                                "settings",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        onBlur={() =>
                                                            commitJson(
                                                                index,
                                                                "settings",
                                                            )
                                                        }
                                                    />

                                                    {settingsError && (
                                                        <div className="section-json-error">
                                                            <AlertCircle
                                                                size={14}
                                                            />
                                                            {settingsError}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {!section.is_active && (
                                            <div className="section-disabled-note">
                                                این بلوک غیرفعال است و در صفحه
                                                عمومی نمایش داده نمی‌شود.
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>

                {saveError && (
                    <div className="sections-save-error">
                        <AlertCircle size={16} />
                        {saveError}
                    </div>
                )}

                <div className="sections-editor-footer">
                    <div className="sections-footer-hint">
                        <RotateCcw size={15} />
                        ترتیب بلوک‌ها پس از ذخیره اعمال می‌شود.
                    </div>

                    <button
                        type="button"
                        className="sections-save-button"
                        onClick={submit}
                        disabled={processing}
                    >
                        <Save size={17} />
                        {processing ? "در حال ذخیره..." : "ذخیره بلوک‌های صفحه"}
                    </button>
                </div>
            </div>
        </section>
    );
}
