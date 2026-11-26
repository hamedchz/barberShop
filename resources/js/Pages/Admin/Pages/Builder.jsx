import { useEffect, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowRight,
    Save,
    Eye,
    AlertCircle,
    CheckCircle2,
    LayoutGrid,
    Plus,
} from "lucide-react";

import Layout from "../Layouts/Layout";
import BlockLibrary from "./Components/BlockLibrary";
import BlockList from "./Components/BlockList";
import BlockEditor from "./Components/BlockEditor";
import "./Assets/css/Builder.css";

export default function Builder({ page, sectionTypes = {} }) {
    const [sections, setSections] = useState(
        (page?.sections ?? []).map((section) => ({
            ...section,
            content: section.content ?? {},
            settings: section.settings ?? {},
            is_active: Boolean(section.is_active),
        })),
    );

    const [selectedIndex, setSelectedIndex] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setSections(
            (page?.sections ?? []).map((section) => ({
                ...section,
                content: section.content ?? {},
                settings: section.settings ?? {},
                is_active: Boolean(section.is_active),
            })),
        );
    }, [page?.sections]);

    const addBlock = (type) => {
        const definition = sectionTypes[type];

        if (!definition) return;

        const newSection = {
            id: null,
            type,
            content: { ...(definition.content ?? {}) },
            settings: { ...(definition.settings ?? {}) },
            is_active: true,
        };

        setSections((previous) => {
            const updated = [...previous, newSection];
            setSelectedIndex(updated.length - 1);
            return updated;
        });

        setMessage("");
        setErrors({});
    };

    const updateSection = (index, changes) => {
        setSections((previous) =>
            previous.map((section, i) =>
                i === index ? { ...section, ...changes } : section,
            ),
        );

        setMessage("");
    };

    const updateContent = (index, field, value) => {
        setSections((previous) =>
            previous.map((section, i) =>
                i === index
                    ? {
                          ...section,
                          content: {
                              ...section.content,
                              [field]: value,
                          },
                      }
                    : section,
            ),
        );
    };

    const updateSettings = (index, field, value) => {
        setSections((previous) =>
            previous.map((section, i) =>
                i === index
                    ? {
                          ...section,
                          settings: {
                              ...section.settings,
                              [field]: value,
                          },
                      }
                    : section,
            ),
        );
    };

    const toggleSection = (index) => {
        updateSection(index, {
            is_active: !sections[index].is_active,
        });
    };

    const deleteSection = (index) => {
        const section = sections[index];
        const name = sectionTypes[section.type]?.label ?? "این بلوک";

        if (!window.confirm(`آیا از حذف «${name}» اطمینان دارید؟`)) {
            return;
        }

        setSections((previous) => previous.filter((_, i) => i !== index));

        setSelectedIndex((previous) => {
            if (previous === null) return null;
            if (previous === index) return null;
            if (previous > index) return previous - 1;
            return previous;
        });
    };

    const moveSection = (fromIndex, toIndex) => {
        if (
            fromIndex === toIndex ||
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= sections.length ||
            toIndex >= sections.length
        ) {
            return;
        }

        setSections((previous) => {
            const updated = [...previous];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, moved);
            return updated;
        });

        setSelectedIndex(toIndex);
    };

    const saveSections = () => {
        setProcessing(true);
        setMessage("");
        setErrors({});

        const payload = {
            sections: sections.map((section) => ({
                id: section.id ?? null,
                type: section.type,
                content: section.content ?? {},
                settings: section.settings ?? {},
                is_active: Boolean(section.is_active),
            })),
        };

        router.put(route("admin.pages.sections.update", page.id), payload, {
            preserveScroll: true,

            onSuccess: () => {
                setMessage("تغییرات با موفقیت ذخیره شدند.");
                setSelectedIndex(null);
                router.reload({ only: ["page"] });
            },

            onError: (responseErrors) => {
                setErrors(responseErrors);
                setMessage(
                    "برخی اطلاعات نیاز به اصلاح دارند. موارد مشخص‌شده را بررسی کنید.",
                );
            },

            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const selectedSection =
        selectedIndex !== null ? sections[selectedIndex] : null;

    return (
        <Layout>
            <Head title={`طراحی صفحه ${page.title}`} />

            <div className="main-content-inner page-builder">
                <div className="pages-header">
                    <div className="pages-header-content">
                        <div className="pages-header-icon">
                            <LayoutGrid size={25} />
                        </div>

                        <div>
                            <h1 className="page-title">طراحی صفحه</h1>
                            <p className="pages-header-description">
                                در حال طراحی صفحه «{page.title}»
                            </p>
                        </div>
                    </div>

                    <div className="builder-header-actions">
                        <Link
                            href={route("admin.pages.preview", page.id)}
                            className="builder-preview-button"
                            target="_blank"
                        >
                            <Eye size={17} />
                            پیش‌نمایش
                        </Link>

                        <button
                            type="button"
                            className="builder-save-button"
                            onClick={saveSections}
                            disabled={processing}
                        >
                            <Save size={17} />
                            {processing ? "در حال ذخیره..." : "ذخیره تغییرات"}
                        </button>
                        <Link
                            href={route("admin.pages.index")}
                            className="back-btn"
                        >
                            <ArrowRight size={20} />
                            <span>بازگشت به لیست صفحات</span>
                        </Link>
                    </div>
                </div>

                {message && (
                    <div
                        className={`builder-message ${
                            Object.keys(errors).length
                                ? "is-error"
                                : "is-success"
                        }`}
                    >
                        {Object.keys(errors).length ? (
                            <AlertCircle size={18} />
                        ) : (
                            <CheckCircle2 size={18} />
                        )}

                        <span>{message}</span>
                    </div>
                )}

                <div className="builder-workspace">
                    {/* کتابخانه بلوک‌ها */}
                    <aside className="builder-library-panel">
                        <BlockLibrary
                            sectionTypes={sectionTypes}
                            onAdd={addBlock}
                        />
                    </aside>

                    {/* فرم ویرایش در مرکز */}
                    <main className="builder-editor-panel">
                        <BlockEditor
                            section={selectedSection}
                            index={selectedIndex}
                            sectionTypes={sectionTypes}
                            errors={errors}
                            onContentChange={updateContent}
                            onSettingsChange={updateSettings}
                        />
                    </main>

                    {/* فهرست بلوک‌های صفحه */}
                    <aside className="builder-list-panel">
                        <BlockList
                            sections={sections}
                            sectionTypes={sectionTypes}
                            selectedIndex={selectedIndex}
                            onSelect={setSelectedIndex}
                            onToggle={toggleSection}
                            onDelete={deleteSection}
                            onMove={moveSection}
                        />
                    </aside>
                </div>
            </div>
        </Layout>
    );
}
